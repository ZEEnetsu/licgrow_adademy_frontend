/**
 * Enrollment — `api-contracts/07-enrollment.md`.
 *
 *     (none) --submit--> pending --approve--> approved  => BATCH MEMBER
 *                           |
 *                           +----reject---> rejected    => may re-apply
 *
 * This module is the WRITE side of batch membership. 06 §10 is explicit that
 * approval is the only way a member is created — there is no add-member API.
 *
 * TEMPORARY DEV SCAFFOLDING. See src/mocks/README.md.
 */

import { db, nextId } from "../db.js";
import { authenticate, requirePermission } from "../guard.js";
import { idempotent } from "../idempotency.js";
import { checkRateLimit, TIERS } from "../rateLimit.js";
import {
  notifyEnrollmentRequested,
  notifyEnrollmentDecided,
} from "../notify.js";
import {
  created,
  fail,
  notFound,
  ok,
  paginate,
  validationError,
} from "../respond.js";

/** A frozen copy of the applicant's profile, for the reviewer (07 §1). */
const snapshotOf = (account) => ({
  licAgentCode: account.profile?.licAgentCode ?? null,
  city: account.profile?.city ?? null,
  experienceYears: account.profile?.experienceYears ?? null,
});

const learnerView = (enrollment) => ({
  id: enrollment.id,
  batchId: enrollment.batchId,
  batchName: db.findBatch(enrollment.batchId)?.name ?? null,
  status: enrollment.status,
  motivation: enrollment.motivation ?? null,
  applicantSnapshot: enrollment.applicantSnapshot ?? null,
  submittedAt: enrollment.submittedAt,
  reviewedAt: enrollment.reviewedAt,
  reviewNote: enrollment.reviewNote,
});

const adminView = (enrollment) => {
  const learner = db.findAccountById(enrollment.learnerId);
  const batch = db.findBatch(enrollment.batchId);

  return {
    id: enrollment.id,
    status: enrollment.status,
    batch: batch ? { id: batch.id, name: batch.name } : null,
    learner: learner
      ? { id: learner.id, fullName: learner.fullName, email: learner.email }
      : null,
    applicantSnapshot: enrollment.applicantSnapshot ?? null,
    motivation: enrollment.motivation ?? null,
    submittedAt: enrollment.submittedAt,
    reviewedAt: enrollment.reviewedAt,
    reviewedBy: enrollment.reviewedBy ?? null,
    reviewNote: enrollment.reviewNote,
  };
};

function requireLearner(request) {
  const auth = authenticate(request);
  if (auth.response) return auth;
  if (auth.account.type !== "learner") {
    return { response: fail(403, "FORBIDDEN", "This endpoint is for learners.") };
  }
  return auth;
}

// ── 1. submit ──────────────────────────────────────────────────────────────

async function submitEnrollment(request) {
  const limited = checkRateLimit(TIERS.AUTH_REGISTER);
  if (limited) return limited;

  const auth = requireLearner(request);
  if (auth.response) return auth.response;

  const body = await request.json().catch(() => null);
  if (!body?.batchId) {
    return validationError([{ field: "batchId", issue: "Required" }]);
  }
  if (body.motivation && body.motivation.length > 1000) {
    return validationError([
      { field: "motivation", issue: "Max 1000 characters" },
    ]);
  }

  const batch = db.findBatch(body.batchId);
  if (!batch) return notFound("Batch");

  /*
   * Profile completeness is checked BEFORE batch state so the learner gets the
   * actionable error first: a complete profile is something they can fix, and
   * 07's own flow note says the UI should route them to the profile form.
   */
  const missing = db.missingProfileFields(auth.account);
  if (missing.length) {
    return fail(
      422,
      "PROFILE_INCOMPLETE",
      "Complete your profile before requesting enrollment.",
      missing.map((field) => ({ field, issue: "Required before enrolling" })),
    );
  }

  if (batch.status !== "active" || !batch.enrollmentOpen) {
    return fail(
      422,
      "BATCH_NOT_OPEN",
      "This batch isn't accepting enrollments right now.",
    );
  }

  // a pending OR approved request blocks a resubmit; a rejected one does not
  const active = db.enrollments.find(
    (e) =>
      e.learnerId === auth.account.id &&
      e.batchId === body.batchId &&
      (e.status === "pending" || e.status === "approved"),
  );
  if (active) {
    return fail(
      409,
      "ENROLLMENT_ALREADY_ACTIVE",
      "You already have a pending or approved request for this batch.",
    );
  }

  const enrollment = {
    id: nextId("enr"),
    learnerId: auth.account.id,
    batchId: body.batchId,
    status: "pending",
    motivation: body.motivation ?? null,
    applicantSnapshot: snapshotOf(auth.account),
    submittedAt: new Date().toISOString(),
    reviewedAt: null,
    reviewedBy: null,
    reviewNote: null,
  };
  db.enrollments.push(enrollment);

  // 12 — tell the reviewers. Best-effort: never blocks this response.
  notifyEnrollmentRequested(enrollment);

  return created(learnerView(enrollment));
}

// ── 2–3. learner reads ─────────────────────────────────────────────────────

function myEnrollments(request, _params, url) {
  const auth = requireLearner(request);
  if (auth.response) return auth.response;

  const status = url.searchParams.get("status");
  let rows = db.enrollments.filter((e) => e.learnerId === auth.account.id);
  if (status) rows = rows.filter((e) => e.status === status);

  rows.sort((a, b) => String(b.submittedAt).localeCompare(String(a.submittedAt)));

  const { slice, meta } = paginate(rows, url.searchParams);
  return ok(slice.map(learnerView), meta);
}

/**
 * §3 — 404 covers both "no such request" and "belongs to someone else".
 * Existence is privileged, so the two must be indistinguishable.
 */
function myEnrollment(request, { enrollmentId }) {
  const auth = requireLearner(request);
  if (auth.response) return auth.response;

  const enrollment = db.enrollments.find(
    (e) => e.id === enrollmentId && e.learnerId === auth.account.id,
  );
  return enrollment ? ok(learnerView(enrollment)) : notFound("Enrollment request");
}

// ── 4–5. admin reads ───────────────────────────────────────────────────────

function listEnrollments(request, _params, url) {
  const auth = requirePermission(request, "enrollment:review");
  if (auth.response) return auth.response;

  const { searchParams } = url;
  let rows = [...db.enrollments];

  const batchId = searchParams.get("batchId");
  const status = searchParams.get("status");
  if (batchId) rows = rows.filter((e) => e.batchId === batchId);
  if (status) rows = rows.filter((e) => e.status === status);

  const sort = searchParams.get("sort") ?? "submittedAt:desc";
  const [, direction] = sort.split(":");
  rows.sort((a, b) => {
    const cmp = String(a.submittedAt).localeCompare(String(b.submittedAt));
    return direction === "asc" ? cmp : -cmp;
  });

  const { slice, meta } = paginate(rows, searchParams);
  return ok(slice.map(adminView), meta);
}

function getEnrollment(request, { enrollmentId }) {
  const auth = requirePermission(request, "enrollment:review");
  if (auth.response) return auth.response;

  const enrollment = db.enrollments.find((e) => e.id === enrollmentId);
  return enrollment ? ok(adminView(enrollment)) : notFound("Enrollment request");
}

// ── 6–7. review ────────────────────────────────────────────────────────────

/**
 * §6 — approve. Transitions pending -> approved AND grants batch membership
 * in one step. This is the only path that creates a member.
 */
async function approveEnrollment(request, { enrollmentId }) {
  const auth = requirePermission(request, "enrollment:review");
  if (auth.response) return auth.response;

  const enrollment = db.enrollments.find((e) => e.id === enrollmentId);
  if (!enrollment) return notFound("Enrollment request");

  // already approved: return current state, do NOT re-grant
  if (enrollment.status === "approved") {
    const existing = db.batchMembers.find(
      (m) =>
        m.batchId === enrollment.batchId && m.learnerId === enrollment.learnerId,
    );
    return ok({
      id: enrollment.id,
      status: enrollment.status,
      batchId: enrollment.batchId,
      learnerId: enrollment.learnerId,
      reviewedBy: enrollment.reviewedBy,
      reviewedAt: enrollment.reviewedAt,
      membership: existing
        ? {
            batchId: existing.batchId,
            isActive: existing.isActive,
            grantedAt: existing.joinedAt,
          }
        : null,
    });
  }

  if (enrollment.status === "rejected") {
    return fail(
      422,
      "ENROLLMENT_ALREADY_FINALIZED",
      "This request was rejected and can no longer be approved.",
    );
  }

  const now = new Date().toISOString();
  enrollment.status = "approved";
  enrollment.reviewedAt = now;
  enrollment.reviewedBy = auth.account.id;

  // grant membership — reactivate a previously revoked row rather than
  // stacking a duplicate
  let membership = db.batchMembers.find(
    (m) => m.batchId === enrollment.batchId && m.learnerId === enrollment.learnerId,
  );
  if (membership) {
    membership.isActive = true;
    membership.joinedAt = now;
  } else {
    membership = {
      batchId: enrollment.batchId,
      learnerId: enrollment.learnerId,
      isActive: true,
      joinedAt: now,
    };
    db.batchMembers.push(membership);
  }

  notifyEnrollmentDecided(enrollment, true);

  return ok({
    id: enrollment.id,
    status: enrollment.status,
    batchId: enrollment.batchId,
    learnerId: enrollment.learnerId,
    reviewedBy: enrollment.reviewedBy,
    reviewedAt: enrollment.reviewedAt,
    membership: {
      batchId: membership.batchId,
      isActive: membership.isActive,
      grantedAt: membership.joinedAt,
    },
  });
}

/** §7 — reject. The learner may re-apply afterwards. */
async function rejectEnrollment(request, { enrollmentId }) {
  const auth = requirePermission(request, "enrollment:review");
  if (auth.response) return auth.response;

  const enrollment = db.enrollments.find((e) => e.id === enrollmentId);
  if (!enrollment) return notFound("Enrollment request");

  if (enrollment.status === "rejected") return ok(adminView(enrollment));

  if (enrollment.status === "approved") {
    return fail(
      422,
      "ENROLLMENT_ALREADY_FINALIZED",
      "This request was approved. Remove the batch member instead.",
    );
  }

  const body = await request.json().catch(() => null);
  if (body?.reviewNote && body.reviewNote.length > 500) {
    return validationError([
      { field: "reviewNote", issue: "Max 500 characters" },
    ]);
  }

  enrollment.status = "rejected";
  enrollment.reviewedAt = new Date().toISOString();
  enrollment.reviewedBy = auth.account.id;
  enrollment.reviewNote = body?.reviewNote ?? null;

  notifyEnrollmentDecided(enrollment, false);

  return ok(adminView(enrollment));
}

export const enrollmentRoutes = [
  {
    method: "POST",
    path: "/enrollments",
    // required per 07 §1 — a double-tap must not create two requests
    handler: idempotent(submitEnrollment, {
      required: true,
      endpoint: "POST /enrollments",
    }),
  },
  { method: "GET", path: "/enrollments/me", handler: myEnrollments },
  { method: "GET", path: "/enrollments/:enrollmentId", handler: myEnrollment },

  { method: "GET", path: "/admin/enrollments", handler: listEnrollments },
  {
    method: "GET",
    path: "/admin/enrollments/:enrollmentId",
    handler: getEnrollment,
  },
  {
    method: "POST",
    path: "/admin/enrollments/:enrollmentId/approve",
    handler: idempotent(approveEnrollment, {
      endpoint: "POST /admin/enrollments/:id/approve",
    }),
  },
  {
    method: "POST",
    path: "/admin/enrollments/:enrollmentId/reject",
    handler: idempotent(rejectEnrollment, {
      endpoint: "POST /admin/enrollments/:id/reject",
    }),
  },
];
