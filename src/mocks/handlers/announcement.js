/**
 * Announcements — `api-contracts/11-announcement.md`.
 *
 * Two audiences with different visibility rules:
 *   admins  see everything, including expired
 *   learners see global + their own active batches, expired EXCLUDED
 *
 * That asymmetry is why expiry is filtered at read time (db.announcementsFor)
 * rather than by deleting rows.
 *
 * English only (conventions §9) — no Accept-Language handling here.
 *
 * TEMPORARY DEV SCAFFOLDING. See src/mocks/README.md.
 */

import { db, nextId } from "../db.js";
import { authenticate, requirePermission } from "../guard.js";
import { notifyAnnouncementPosted } from "../notify.js";
import {
  created,
  fail,
  noContent,
  notFound,
  ok,
  paginate,
  validationError,
} from "../respond.js";

const view = (announcement) => ({
  ...announcement,
  batchName: announcement.batchId
    ? (db.findBatch(announcement.batchId)?.name ?? null)
    : null,
});

function requireLearner(request) {
  const auth = authenticate(request);
  if (auth.response) return auth;
  if (auth.account.type !== "learner") {
    return { response: fail(403, "FORBIDDEN", "This endpoint is for learners.") };
  }
  return auth;
}

// ── 1. create ──────────────────────────────────────────────────────────────

async function createAnnouncement(request) {
  const auth = requirePermission(request, "announcement:manage");
  if (auth.response) return auth.response;

  const body = await request.json().catch(() => null);
  if (!body) return fail(400, "MALFORMED_JSON", "Body is not valid JSON.");

  const ALLOWED = new Set([
    "scope", "batchId", "title", "body", "isPinned", "expiresAt",
  ]);
  const unknown = Object.keys(body).filter((k) => !ALLOWED.has(k));
  if (unknown.length) {
    return validationError(
      unknown.map((field) => ({ field, issue: "Unknown field" })),
      "Unknown fields are not accepted.",
    );
  }

  const details = [];
  if (!["global", "batch"].includes(body.scope)) {
    details.push({ field: "scope", issue: "Required: global or batch" });
  }
  if (!body.title || body.title.length < 3 || body.title.length > 160) {
    details.push({ field: "title", issue: "Required, 3-160 characters" });
  }
  if (!body.body || body.body.length < 1 || body.body.length > 5000) {
    details.push({ field: "body", issue: "Required, 1-5000 characters" });
  }
  // an expiry in the past would create something no learner could ever see
  if (body.expiresAt && new Date(body.expiresAt).getTime() <= Date.now()) {
    details.push({ field: "expiresAt", issue: "Must be in the future" });
  }
  if (details.length) return validationError(details);

  // §1 — scope and batchId must agree, in both directions
  if (body.scope === "batch" && !body.batchId) {
    return fail(422, "INVALID_SCOPE", "A batch announcement requires a batchId.");
  }
  if (body.scope === "global" && body.batchId) {
    return fail(422, "INVALID_SCOPE", "A global announcement must not name a batch.");
  }
  if (body.scope === "batch" && !db.findBatch(body.batchId)) {
    return notFound("Batch");
  }

  const announcement = {
    id: nextId("ann"),
    scope: body.scope,
    batchId: body.scope === "batch" ? body.batchId : null,
    title: body.title,
    body: body.body,
    isPinned: Boolean(body.isPinned),
    publishedAt: new Date().toISOString(),
    expiresAt: body.expiresAt ?? null,
    createdBy: auth.account.id,
  };
  db.announcements.push(announcement);

  // fan-out is best-effort and must not affect this response (12)
  notifyAnnouncementPosted(announcement);

  return created(view(announcement));
}

// ── 2–3. admin reads ───────────────────────────────────────────────────────

function listAnnouncements(request, _params, url) {
  const auth = requirePermission(request, "announcement:read");
  if (auth.response) return auth.response;

  const { searchParams } = url;
  let rows = [...db.announcements];

  const scope = searchParams.get("scope");
  const batchId = searchParams.get("batchId");
  const isPinned = searchParams.get("isPinned");
  // admins default to seeing expired announcements too (§2)
  const includeExpired = searchParams.get("includeExpired") !== "false";

  if (scope) rows = rows.filter((a) => a.scope === scope);
  if (batchId) rows = rows.filter((a) => a.batchId === batchId);
  if (isPinned !== null) {
    rows = rows.filter((a) => String(a.isPinned) === isPinned);
  }
  if (!includeExpired) {
    const now = Date.now();
    rows = rows.filter(
      (a) => !a.expiresAt || new Date(a.expiresAt).getTime() > now,
    );
  }

  rows.sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return String(b.publishedAt).localeCompare(String(a.publishedAt));
  });

  const { slice, meta } = paginate(rows, searchParams);
  return ok(slice.map(view), meta);
}

function getAnnouncement(request, { id }) {
  const auth = requirePermission(request, "announcement:read");
  if (auth.response) return auth.response;

  const announcement = db.announcements.find((a) => a.id === id);
  return announcement ? ok(view(announcement)) : notFound("Announcement");
}

// ── 4–5. update / delete ───────────────────────────────────────────────────

async function updateAnnouncement(request, { id }) {
  const auth = requirePermission(request, "announcement:manage");
  if (auth.response) return auth.response;

  const announcement = db.announcements.find((a) => a.id === id);
  if (!announcement) return notFound("Announcement");

  const body = await request.json().catch(() => null);
  if (!body) return fail(400, "MALFORMED_JSON", "Body is not valid JSON.");

  // §4 lists exactly what is editable — scope and batchId are not
  const EDITABLE = new Set(["title", "body", "isPinned", "expiresAt"]);
  const locked = Object.keys(body).filter((k) => !EDITABLE.has(k));
  if (locked.length) {
    return validationError(
      locked.map((field) => ({ field, issue: "Not editable after creation" })),
      "Only title, body, isPinned and expiresAt can be changed.",
    );
  }

  if (
    body.title !== undefined &&
    (body.title.length < 3 || body.title.length > 160)
  ) {
    return validationError([{ field: "title", issue: "3-160 characters" }]);
  }
  if (
    body.body !== undefined &&
    (body.body.length < 1 || body.body.length > 5000)
  ) {
    return validationError([{ field: "body", issue: "1-5000 characters" }]);
  }

  for (const field of ["title", "body", "isPinned", "expiresAt"]) {
    if (field in body) announcement[field] = body[field];
  }

  return ok(view(announcement));
}

function deleteAnnouncement(request, { id }) {
  const auth = requirePermission(request, "announcement:manage");
  if (auth.response) return auth.response;

  const before = db.announcements.length;
  db.announcements = db.announcements.filter((a) => a.id !== id);
  if (db.announcements.length === before) return notFound("Announcement");

  return noContent();
}

// ── 6–7. learner reads ─────────────────────────────────────────────────────

/** §6 — merged feed: global + every batch the learner actively belongs to. */
function myAnnouncements(request, _params, url) {
  const auth = requireLearner(request);
  if (auth.response) return auth.response;

  const rows = db.announcementsFor(auth.account.id);
  const { slice, meta } = paginate(rows, url.searchParams);
  return ok(slice.map(view), meta);
}

/** §7 — one batch's announcements plus global. Membership required. */
function batchAnnouncements(request, { batchId }, url) {
  const auth = requireLearner(request);
  if (auth.response) return auth.response;

  if (!db.findBatch(batchId)) return notFound("Batch");
  if (!db.isActiveMember(batchId, auth.account.id)) {
    return fail(403, "NOT_A_BATCH_MEMBER", "You are not a member of this batch.");
  }

  const rows = db.announcementsFor(auth.account.id, { batchId });
  const { slice, meta } = paginate(rows, url.searchParams);
  return ok(slice.map(view), meta);
}

export const announcementRoutes = [
  // learner routes first: /me/... can never collide with /admin/...
  { method: "GET", path: "/me/announcements", handler: myAnnouncements },
  {
    method: "GET",
    path: "/me/batches/:batchId/announcements",
    handler: batchAnnouncements,
  },

  { method: "GET", path: "/admin/announcements", handler: listAnnouncements },
  { method: "POST", path: "/admin/announcements", handler: createAnnouncement },
  { method: "GET", path: "/admin/announcements/:id", handler: getAnnouncement },
  { method: "PATCH", path: "/admin/announcements/:id", handler: updateAnnouncement },
  { method: "DELETE", path: "/admin/announcements/:id", handler: deleteAnnouncement },
];
