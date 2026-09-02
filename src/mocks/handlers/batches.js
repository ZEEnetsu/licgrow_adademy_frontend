/**
 * Batch handlers — `api-contracts/06-batch.md`.
 *
 * The batch is the access boundary for the whole platform: a learner may read
 * or attempt content only if it's published into a batch they're an ACTIVE
 * member of. That invariant is enforced here, not in the UI.
 *
 * Includes the two GET endpoints described in §6–9's prose but missing from
 * the numbered table (list a batch's published courses / tests).
 *
 * TEMPORARY DEV SCAFFOLDING. See src/mocks/README.md.
 */

import { db, nextId } from "../db.js";
import { authenticate, requirePermission } from "../guard.js";
import { notifyContentPublished } from "../notify.js";
import {
  created,
  fail,
  noContent,
  notFound,
  ok,
  paginate,
  validationError,
} from "../respond.js";

const DATE = /^\d{4}-\d{2}-\d{2}$/;

const publicBatch = (batch) => ({
  ...batch,
  counts: db.countsFor(batch.id),
});

function requireLearner(request) {
  const auth = authenticate(request);
  if (auth.response) return auth;

  if (auth.account.type !== "learner") {
    return { response: fail(403, "FORBIDDEN", "This endpoint is for learners.") };
  }
  return auth;
}

/** 403 NOT_A_BATCH_MEMBER — this module uses 403, not 404 (§13–14). */
const notAMember = () =>
  fail(403, "NOT_A_BATCH_MEMBER", "You are not a member of this batch.");

// ── 1–5. batch lifecycle ───────────────────────────────────────────────────

async function createBatch(request) {
  const auth = requirePermission(request, "batch:manage");
  if (auth.response) return auth.response;

  const body = await request.json().catch(() => null);
  if (!body) return fail(400, "MALFORMED_JSON", "Body isn't valid JSON.");

  const ALLOWED = new Set([
    "name", "description", "startDate", "endDate", "enrollmentOpen",
  ]);
  const unknown = Object.keys(body).filter((k) => !ALLOWED.has(k));
  if (unknown.length) {
    return validationError(
      unknown.map((field) => ({ field, issue: "Unknown field" })),
      "Unknown fields are not accepted.",
    );
  }

  const details = [];
  if (!body.name || body.name.length < 3 || body.name.length > 120) {
    details.push({ field: "name", issue: "Required, 3–120 characters" });
  }
  if (!DATE.test(body.startDate ?? "")) {
    details.push({ field: "startDate", issue: "Required, YYYY-MM-DD" });
  }
  if (!DATE.test(body.endDate ?? "")) {
    details.push({ field: "endDate", issue: "Required, YYYY-MM-DD" });
  }
  if (
    DATE.test(body.startDate ?? "") &&
    DATE.test(body.endDate ?? "") &&
    body.endDate < body.startDate
  ) {
    details.push({ field: "endDate", issue: "Must be on or after startDate" });
  }
  if (details.length) return validationError(details);

  const batch = {
    id: nextId("batch"),
    name: body.name,
    description: body.description ?? null,
    status: "draft",
    enrollmentOpen: Boolean(body.enrollmentOpen),
    startDate: body.startDate,
    endDate: body.endDate,
    createdBy: auth.account.id,
    createdAt: new Date().toISOString(),
  };

  /*
   * §4: enrollmentOpen requires status:active. A new batch is always draft,
   * so an incoming `enrollmentOpen: true` cannot be honoured.
   */
  if (batch.enrollmentOpen) {
    return fail(
      422,
      "INVALID_STATUS_TRANSITION",
      "Enrollment can only be opened on an active batch.",
    );
  }

  db.batches.push(batch);
  return created(publicBatch(batch));
}

function listBatches(request, _params, url) {
  const auth = requirePermission(request, "batch:read");
  if (auth.response) return auth.response;

  const { searchParams } = url;
  let rows = [...db.batches];

  const status = searchParams.get("status");
  const enrollmentOpen = searchParams.get("enrollmentOpen");
  const q = searchParams.get("q");

  if (status) rows = rows.filter((b) => b.status === status);
  if (enrollmentOpen !== null) {
    rows = rows.filter((b) => String(b.enrollmentOpen) === enrollmentOpen);
  }
  if (q) {
    const needle = q.toLowerCase();
    rows = rows.filter((b) => b.name.toLowerCase().includes(needle));
  }

  const { slice, meta } = paginate(rows, searchParams);
  return ok(slice.map(publicBatch), meta);
}

function getBatch(request, { batchId }) {
  const auth = requirePermission(request, "batch:read");
  if (auth.response) return auth.response;

  const batch = db.findBatch(batchId);
  return batch ? ok(publicBatch(batch)) : notFound("Batch");
}

/**
 * §4 — partial update, and the densest set of rules in the module:
 *   · enrollmentOpen:true requires status active
 *   · draft → active requires at least one piece of published content
 *   · archived is terminal here (→active is invalid; edits are refused)
 */
async function updateBatch(request, { batchId }) {
  const auth = requirePermission(request, "batch:manage");
  if (auth.response) return auth.response;

  const batch = db.findBatch(batchId);
  if (!batch) return notFound("Batch");

  if (batch.status === "archived") {
    return fail(422, "BATCH_ARCHIVED", "This batch is archived and read-only.");
  }

  const body = await request.json().catch(() => null);
  if (!body) return fail(400, "MALFORMED_JSON", "Body isn't valid JSON.");

  const nextStatus = body.status ?? batch.status;
  const nextOpen =
    body.enrollmentOpen === undefined ? batch.enrollmentOpen : body.enrollmentOpen;

  if (body.status === "archived") {
    return fail(
      422,
      "INVALID_STATUS_TRANSITION",
      "Archive a batch via POST /archive.",
    );
  }
  if (!["draft", "active"].includes(nextStatus)) {
    return fail(422, "INVALID_STATUS_TRANSITION", `Unknown status ${nextStatus}.`);
  }

  // activating requires content — an empty batch has nothing to show a learner
  if (nextStatus === "active" && batch.status !== "active") {
    const counts = db.countsFor(batchId);
    if (counts.courses === 0 && counts.tests === 0) {
      return fail(
        422,
        "INVALID_STATUS_TRANSITION",
        "Publish at least one course or test into this batch before activating it.",
      );
    }
  }

  if (nextOpen && nextStatus !== "active") {
    return fail(
      422,
      "INVALID_STATUS_TRANSITION",
      "Enrollment can only be opened on an active batch.",
    );
  }

  const details = [];
  if (body.name !== undefined && (body.name.length < 3 || body.name.length > 120)) {
    details.push({ field: "name", issue: "3–120 characters" });
  }
  for (const field of ["startDate", "endDate"]) {
    if (body[field] !== undefined && !DATE.test(body[field])) {
      details.push({ field, issue: "YYYY-MM-DD" });
    }
  }
  const start = body.startDate ?? batch.startDate;
  const end = body.endDate ?? batch.endDate;
  if (DATE.test(start) && DATE.test(end) && end < start) {
    details.push({ field: "endDate", issue: "Must be on or after startDate" });
  }
  if (details.length) return validationError(details);

  for (const field of ["name", "description", "startDate", "endDate"]) {
    if (field in body) batch[field] = body[field];
  }
  batch.status = nextStatus;
  batch.enrollmentOpen = Boolean(nextOpen);

  return ok(publicBatch(batch));
}

/** §5 — archive. Forces enrollmentOpen false. Idempotent. */
function archiveBatch(request, { batchId }) {
  const auth = requirePermission(request, "batch:manage");
  if (auth.response) return auth.response;

  const batch = db.findBatch(batchId);
  if (!batch) return notFound("Batch");

  batch.status = "archived";
  batch.enrollmentOpen = false;
  return ok(publicBatch(batch));
}

// ── 6–9. publish / unpublish content ───────────────────────────────────────

async function publishCourseIntoBatch(request, { batchId }) {
  const auth = requirePermission(request, "batch:manage");
  if (auth.response) return auth.response;

  const batch = db.findBatch(batchId);
  if (!batch) return notFound("Batch");

  const body = await request.json().catch(() => null);
  const course = db.findCourse(body?.courseId);
  if (!course) return notFound("Course");

  // only published content may enter a batch
  if (course.status !== "published") {
    return fail(
      422,
      "CONTENT_NOT_PUBLISHED",
      "Publish the course before adding it to a batch.",
    );
  }

  const exists = db.batchCourses.some(
    (l) => l.batchId === batchId && l.courseId === course.id,
  );
  if (exists) {
    return fail(409, "ALREADY_PUBLISHED", "That course is already in this batch.");
  }

  const link = {
    batchId,
    courseId: course.id,
    publishedAt: new Date().toISOString(),
  };
  db.batchCourses.push(link);

  // 12 — COURSE_PUBLISHED reaches this batch's active members
  notifyContentPublished({
    batchId,
    kind: "course",
    contentId: course.id,
    title: course.title,
  });

  return created(link);
}

function unpublishCourse(request, { batchId, courseId }) {
  const auth = requirePermission(request, "batch:manage");
  if (auth.response) return auth.response;

  const before = db.batchCourses.length;
  db.batchCourses = db.batchCourses.filter(
    (l) => !(l.batchId === batchId && l.courseId === courseId),
  );
  if (db.batchCourses.length === before) return notFound("Batch course link");

  return noContent();
}

function listBatchCourses(request, { batchId }, url) {
  const auth = requirePermission(request, "batch:read");
  if (auth.response) return auth.response;
  if (!db.findBatch(batchId)) return notFound("Batch");

  const rows = db.coursesInBatch(batchId).map((course) => ({
    id: course.id,
    title: course.title,
    examTarget: course.examTarget,
    status: course.status,
    unitCount: course.units.length,
  }));

  const { slice, meta } = paginate(rows, url.searchParams);
  return ok(slice, meta);
}

async function publishTestIntoBatch(request, { batchId }) {
  const auth = requirePermission(request, "batch:manage");
  if (auth.response) return auth.response;

  const batch = db.findBatch(batchId);
  if (!batch) return notFound("Batch");

  const body = await request.json().catch(() => null);
  const test = db.tests.find((t) => t.id === body?.testId);
  if (!test) return notFound("Test");

  /*
   * Batches never link to quizzes. 10-submission.md §1: a quiz is reached
   * through its unit's course. Adding one here is a modelling error.
   *
   * CONTRACT GAP: §8 defines no code for this case. INVALID_TEST_CONFIG is
   * borrowed from 09-test.md as the closest documented fit.
   */
  if (test.kind === "quiz") {
    return fail(
      422,
      "INVALID_TEST_CONFIG",
      "A quiz reaches learners through its unit's course, not by being added to a batch.",
    );
  }

  if (test.status !== "published") {
    return fail(
      422,
      "CONTENT_NOT_PUBLISHED",
      "Publish the test before adding it to a batch.",
    );
  }

  const exists = db.batchTests.some(
    (l) => l.batchId === batchId && l.testId === test.id,
  );
  if (exists) {
    return fail(409, "ALREADY_PUBLISHED", "That test is already in this batch.");
  }

  const link = {
    batchId,
    testId: test.id,
    publishedAt: new Date().toISOString(),
  };
  db.batchTests.push(link);

  // 12 — TEST_PUBLISHED reaches this batch's active members
  notifyContentPublished({
    batchId,
    kind: "test",
    contentId: test.id,
    title: test.title,
  });

  return created(link);
}

function unpublishTest(request, { batchId, testId }) {
  const auth = requirePermission(request, "batch:manage");
  if (auth.response) return auth.response;

  const before = db.batchTests.length;
  db.batchTests = db.batchTests.filter(
    (l) => !(l.batchId === batchId && l.testId === testId),
  );
  if (db.batchTests.length === before) return notFound("Batch test link");

  // §6–9: access is revoked, but attempt/score history is retained.
  return noContent();
}

function listBatchTests(request, { batchId }, url) {
  const auth = requirePermission(request, "batch:read");
  if (auth.response) return auth.response;
  if (!db.findBatch(batchId)) return notFound("Batch");

  const rows = db.testsInBatch(batchId).map((test) => ({
    id: test.id,
    title: test.title,
    kind: test.kind,
    status: test.status,
    durationMinutes: test.durationMinutes,
    totalMarks: test.totalMarks,
  }));

  const { slice, meta } = paginate(rows, url.searchParams);
  return ok(slice, meta);
}

// ── 10–11. members ─────────────────────────────────────────────────────────

function listMembers(request, { batchId }, url) {
  const auth = requirePermission(request, "batch:read");
  if (auth.response) return auth.response;
  if (!db.findBatch(batchId)) return notFound("Batch");

  const rows = db.batchMembers
    .filter((m) => m.batchId === batchId)
    .map((member) => {
      const account = db.findAccountById(member.learnerId);
      return {
        learnerId: member.learnerId,
        fullName: account?.fullName ?? "Unknown",
        email: account?.email ?? null,
        isActive: member.isActive,
        joinedAt: member.joinedAt,
      };
    });

  const { slice, meta } = paginate(rows, url.searchParams);
  return ok(slice, meta);
}

/** §11 — revoke. Sets isActive:false; history is kept, access is lost. */
function removeMember(request, { batchId, learnerId }) {
  const auth = requirePermission(request, "batch:manage");
  if (auth.response) return auth.response;

  const member = db.batchMembers.find(
    (m) => m.batchId === batchId && m.learnerId === learnerId && m.isActive,
  );
  if (!member) return notFound("Member");

  member.isActive = false;
  return noContent();
}

// ── 12–14. learner ─────────────────────────────────────────────────────────

/** §12 — discovery: active + open batches, annotated with my own status. */
function availableBatches(request, _params, url) {
  const auth = requireLearner(request);
  if (auth.response) return auth.response;

  const rows = db.batches
    .filter((b) => b.status === "active" && b.enrollmentOpen)
    .map((batch) => ({
      id: batch.id,
      name: batch.name,
      description: batch.description,
      startDate: batch.startDate,
      endDate: batch.endDate,
      myEnrollmentStatus:
        db.enrollmentFor(auth.account.id, batch.id)?.status ?? null,
    }));

  const { slice, meta } = paginate(rows, url.searchParams);
  return ok(slice, meta);
}

/** §13 — batches I'm an active member of. */
function myBatches(request) {
  const auth = requireLearner(request);
  if (auth.response) return auth.response;

  const rows = db.activeBatchesFor(auth.account.id).map((batch) => ({
    id: batch.id,
    name: batch.name,
    startDate: batch.startDate,
    endDate: batch.endDate,
    counts: {
      courses: db.batchCourses.filter((l) => l.batchId === batch.id).length,
      tests: db.batchTests.filter((l) => l.batchId === batch.id).length,
    },
  }));

  return ok(rows);
}

/** §14 — the arena dashboard for one batch. */
function myBatchArena(request, { batchId }) {
  const auth = requireLearner(request);
  if (auth.response) return auth.response;

  const batch = db.findBatch(batchId);
  if (!batch) return notFound("Batch");
  if (!db.isActiveMember(batchId, auth.account.id)) return notAMember();

  return ok({
    id: batch.id,
    name: batch.name,
    description: batch.description,
    startDate: batch.startDate,
    endDate: batch.endDate,
    courses: db.coursesInBatch(batchId).map((course) => ({
      id: course.id,
      title: course.title,
      unitCount: course.units.length,
    })),
    tests: db.testsInBatch(batchId).map((test) => {
      /*
       * The caller's own attempt state (06 §14). This was stubbed until the
       * submission engine existed; it now reads real attempts, which is what
       * makes a cross-test learner dashboard possible without the
       * learner-facing analytics endpoints 13 deliberately omits.
       */
      const attempts = db.attemptsFor(auth.account.id, test.id);
      const active = attempts.find((a) => a.status === "in_progress");

      return {
        id: test.id,
        title: test.title,
        kind: test.kind,
        durationMinutes: test.durationMinutes,
        totalMarks: test.totalMarks,
        passingMarks: test.passingMarks,
        myStatus: active
          ? "in_progress"
          : attempts.length
            ? "completed"
            : "not_started",
        myAttemptCount: attempts.length,
        myBestScorePct: db.bestScorePct(auth.account.id, test.id),
      };
    }),
    // 11 §6 shape, scoped to this batch (+ global), expired excluded
    announcements: db
      .announcementsFor(auth.account.id, { batchId })
      .slice(0, 5)
      .map((a) => ({
        id: a.id,
        title: a.title,
        isPinned: a.isPinned,
        publishedAt: a.publishedAt,
      })),
  });
}

export const batchRoutes = [
  { method: "GET", path: "/batches/available", handler: availableBatches },
  { method: "GET", path: "/me/batches", handler: myBatches },
  { method: "GET", path: "/me/batches/:batchId", handler: myBatchArena },

  { method: "GET", path: "/admin/batches", handler: listBatches },
  { method: "POST", path: "/admin/batches", handler: createBatch },
  { method: "GET", path: "/admin/batches/:batchId", handler: getBatch },
  { method: "PATCH", path: "/admin/batches/:batchId", handler: updateBatch },
  { method: "POST", path: "/admin/batches/:batchId/archive", handler: archiveBatch },

  { method: "GET", path: "/admin/batches/:batchId/courses", handler: listBatchCourses },
  { method: "POST", path: "/admin/batches/:batchId/courses", handler: publishCourseIntoBatch },
  { method: "DELETE", path: "/admin/batches/:batchId/courses/:courseId", handler: unpublishCourse },

  { method: "GET", path: "/admin/batches/:batchId/tests", handler: listBatchTests },
  { method: "POST", path: "/admin/batches/:batchId/tests", handler: publishTestIntoBatch },
  { method: "DELETE", path: "/admin/batches/:batchId/tests/:testId", handler: unpublishTest },

  { method: "GET", path: "/admin/batches/:batchId/members", handler: listMembers },
  { method: "DELETE", path: "/admin/batches/:batchId/members/:learnerId", handler: removeMember },
];
