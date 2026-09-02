/**
 * Learner accounts — `api-contracts/02-learner.md`.
 *
 * Self-registration and self-service, plus staff-admin management.
 *
 * TEMPORARY DEV SCAFFOLDING. See src/mocks/README.md.
 */

import { db, nextId, SEED_PASSWORD } from "../db.js";
import { authenticate, publicActor, requirePermission } from "../guard.js";
import { issueAccessToken, issueRefreshToken } from "../tokens.js";
import { checkRateLimit, TIERS } from "../rateLimit.js";
import { learnerPasswordIssue, passwordIssueFor } from "../passwords.js";
import {
  created,
  fail,
  noContent,
  notFound,
  ok,
  paginate,
  validationError,
} from "../respond.js";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const USERNAME = /^[a-z0-9_]+$/;
const E164 = /^\+[1-9]\d{6,14}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

function ageFrom(dob) {
  const birth = new Date(`${dob}T00:00:00Z`);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getUTCFullYear() - birth.getUTCFullYear();
  const monthDiff = now.getUTCMonth() - birth.getUTCMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getUTCDate() < birth.getUTCDate())) {
    age -= 1;
  }
  return age;
}

const learnerView = (account) => ({
  id: account.id,
  fullName: account.fullName,
  email: account.email,
  username: account.username,
  phone: account.phone ?? null,
  status: account.status,
  profile: db.profileOf(account),
  createdAt: account.createdAt ?? "2026-06-01T09:00:00Z",
});

function requireLearner(request) {
  const auth = authenticate(request);
  if (auth.response) return auth;
  if (auth.account.type !== "learner") {
    return { response: fail(403, "FORBIDDEN", "This endpoint is for learners.") };
  }
  return auth;
}

// ── 1. register (public) ───────────────────────────────────────────────────

/**
 * §1 — creates a learner and returns the same token+actor shape as login, so
 * the client is auto-signed-in. The account starts `active` but has no batch
 * access until an enrollment is approved (07).
 */
async function register(request) {
  const limited = checkRateLimit(TIERS.AUTH_REGISTER);
  if (limited) return limited;

  const body = await request.json().catch(() => null);
  if (!body) return fail(400, "MALFORMED_JSON", "Body isn't valid JSON.");

  const details = [];
  if (!body.fullName || body.fullName.length < 2 || body.fullName.length > 120) {
    details.push({ field: "fullName", issue: "Required, 2–120 characters" });
  }
  if (!EMAIL.test(body.email ?? "") || body.email.length > 255) {
    details.push({ field: "email", issue: "Required, a valid email address" });
  }
  const passwordIssue = learnerPasswordIssue(body.password);
  if (passwordIssue) details.push({ field: "password", issue: passwordIssue });
  if (body.username !== undefined && body.username !== null) {
    if (
      !USERNAME.test(body.username) ||
      body.username.length < 3 ||
      body.username.length > 30
    ) {
      details.push({
        field: "username",
        issue: "3–30 characters, lowercase letters, digits and underscore only",
      });
    }
  }
  if (body.phone && !E164.test(body.phone)) {
    details.push({ field: "phone", issue: "Must be E.164, e.g. +919812345678" });
  }
  if (details.length) return validationError(details);

  const emailTaken = db.accounts.some(
    (a) => a.email.toLowerCase() === body.email.toLowerCase(),
  );
  if (emailTaken) {
    return fail(409, "EMAIL_TAKEN", "That email is already registered.");
  }
  if (
    body.username &&
    db.accounts.some((a) => a.username?.toLowerCase() === body.username.toLowerCase())
  ) {
    return fail(409, "USERNAME_TAKEN", "That username is already taken.");
  }

  const account = {
    id: nextId("ln"),
    type: "learner",
    email: body.email,
    username: body.username ?? null,
    fullName: body.fullName,
    phone: body.phone ?? null,
    status: "active",
    roleId: null,
    profile: { licAgentCode: null, dob: null, city: null, experienceYears: null },
    createdAt: new Date().toISOString(),
  };
  db.accounts.push(account);
  db.setPassword(account.id, body.password);

  const { token, expiresIn } = issueAccessToken(account, []);
  return created({
    accessToken: token,
    refreshToken: issueRefreshToken(account),
    tokenType: "Bearer",
    expiresIn,
    actor: publicActor(account),
  });
}

// ── 2–4. self-service ──────────────────────────────────────────────────────

function getMyProfile(request) {
  const auth = requireLearner(request);
  if (auth.response) return auth.response;
  return ok(learnerView(auth.account));
}

/** §3 — partial update; this is how a learner satisfies the enrollment gate. */
async function updateMyProfile(request) {
  const auth = requireLearner(request);
  if (auth.response) return auth.response;

  const body = await request.json().catch(() => null);
  if (!body) return fail(400, "MALFORMED_JSON", "Body isn't valid JSON.");

  // identity fields are deliberately not editable here (02 §3 note)
  const forbidden = ["email", "username", "status", "id"].filter((f) => f in body);
  if (forbidden.length) {
    return validationError(
      forbidden.map((field) => ({ field, issue: "Not editable" })),
      "Email and username are identity fields and cannot be changed here.",
    );
  }

  const details = [];
  if (body.fullName !== undefined) {
    if (body.fullName.length < 2 || body.fullName.length > 120) {
      details.push({ field: "fullName", issue: "2–120 characters" });
    }
  }
  if (body.phone !== undefined && body.phone !== null && !E164.test(body.phone)) {
    details.push({ field: "phone", issue: "Must be E.164" });
  }
  if (body.licAgentCode !== undefined && body.licAgentCode !== null) {
    if (body.licAgentCode.length < 3 || body.licAgentCode.length > 40) {
      details.push({ field: "licAgentCode", issue: "3–40 characters" });
    }
  }
  if (body.dob !== undefined && body.dob !== null) {
    if (!DATE.test(body.dob)) {
      details.push({ field: "dob", issue: "YYYY-MM-DD" });
    } else if ((ageFrom(body.dob) ?? 0) < 18) {
      details.push({ field: "dob", issue: "Must be at least 18 years old" });
    }
  }
  if (body.city !== undefined && body.city !== null) {
    if (body.city.length < 2 || body.city.length > 85) {
      details.push({ field: "city", issue: "2–85 characters" });
    }
  }
  if (body.experienceYears !== undefined && body.experienceYears !== null) {
    if (
      !Number.isInteger(body.experienceYears) ||
      body.experienceYears < 0 ||
      body.experienceYears > 60
    ) {
      details.push({ field: "experienceYears", issue: "Whole number, 0–60" });
    }
  }
  if (details.length) return validationError(details);

  const account = auth.account;
  if (body.fullName !== undefined) account.fullName = body.fullName;
  if (body.phone !== undefined) account.phone = body.phone;

  for (const field of ["licAgentCode", "dob", "city", "experienceYears"]) {
    if (field in body) account.profile[field] = body[field];
  }

  return ok(learnerView(account));
}

/** §4 — change password. 204, and other sessions are left alone in v1. */
async function changePassword(request) {
  const auth = authenticate(request);
  if (auth.response) return auth.response;

  const body = await request.json().catch(() => null);
  if (!body?.currentPassword || !body?.newPassword) {
    return validationError([
      { field: "currentPassword", issue: "Required" },
      { field: "newPassword", issue: "Required" },
    ]);
  }

  if (body.currentPassword !== db.passwordFor(auth.account.id)) {
    return fail(401, "INVALID_CURRENT_PASSWORD", "Current password is incorrect.");
  }
  if (body.newPassword === body.currentPassword) {
    return validationError([
      { field: "newPassword", issue: "Must differ from the current password" },
    ]);
  }
  /*
   * 04 §4 calls this a "shared self endpoint": the same route serves learners
   * and super-admins, but administrators are held to the stricter 12+symbol
   * rule. Deriving it from the caller means neither actor gets the wrong one.
   */
  const newPasswordIssue = passwordIssueFor(
    auth.account.type,
    body.newPassword,
  );
  if (newPasswordIssue) {
    return validationError([{ field: "newPassword", issue: newPasswordIssue }]);
  }

  db.setPassword(auth.account.id, body.newPassword);
  return noContent();
}

// ── 5–8. admin management ──────────────────────────────────────────────────

function listLearners(request, _params, url) {
  const auth = requirePermission(request, "learner:read");
  if (auth.response) return auth.response;

  const { searchParams } = url;
  let rows = db.accounts.filter((a) => a.type === "learner");

  const status = searchParams.get("status");
  const q = searchParams.get("q");
  const batchId = searchParams.get("batchId");

  if (status) rows = rows.filter((a) => a.status === status);
  if (q && q.length >= 2) {
    const needle = q.toLowerCase();
    rows = rows.filter(
      (a) =>
        a.fullName.toLowerCase().includes(needle) ||
        a.email.toLowerCase().includes(needle) ||
        (a.username ?? "").toLowerCase().includes(needle),
    );
  }
  if (batchId) {
    rows = rows.filter((a) => db.isActiveMember(batchId, a.id));
  }

  const summaries = rows.map((a) => ({
    id: a.id,
    fullName: a.fullName,
    email: a.email,
    status: a.status,
    createdAt: a.createdAt ?? "2026-06-01T09:00:00Z",
  }));

  const { slice, meta } = paginate(summaries, searchParams);
  return ok(slice, meta);
}

function getLearner(request, { learnerId }) {
  const auth = requirePermission(request, "learner:read");
  if (auth.response) return auth.response;

  const account = db.accounts.find(
    (a) => a.id === learnerId && a.type === "learner",
  );
  if (!account) return notFound("Learner");

  return ok({
    ...learnerView(account),
    stats: {
      batchesActive: db.activeBatchesFor(account.id).length,
      // attempt-derived stats arrive with 10-submission.md (Phase 6)
      testsAttempted: 0,
      averageScorePct: null,
      lastActiveAt: null,
    },
  });
}

/** §7/§8 — suspend and reactivate. Both idempotent no-ops when already there. */
const setStatus = (target) =>
  async function handler(request, { learnerId }) {
    const auth = requirePermission(request, "learner:suspend");
    if (auth.response) return auth.response;

    const account = db.accounts.find(
      (a) => a.id === learnerId && a.type === "learner",
    );
    if (!account) return notFound("Learner");

    if (target === "suspended") {
      const body = await request.json().catch(() => null);
      if (body?.reason) account.suspensionReason = body.reason.slice(0, 255);
    }

    account.status = target;
    return ok({ id: account.id, status: account.status });
  };

export const learnerRoutes = [
  { method: "POST", path: "/auth/register", handler: register },
  { method: "GET", path: "/me/profile", handler: getMyProfile },
  { method: "PUT", path: "/me/profile", handler: updateMyProfile },
  { method: "POST", path: "/me/change-password", handler: changePassword },
  { method: "GET", path: "/admin/learners", handler: listLearners },
  { method: "GET", path: "/admin/learners/:learnerId", handler: getLearner },
  {
    method: "POST",
    path: "/admin/learners/:learnerId/suspend",
    handler: setStatus("suspended"),
  },
  {
    method: "POST",
    path: "/admin/learners/:learnerId/reactivate",
    handler: setStatus("active"),
  },
];

export { SEED_PASSWORD };
