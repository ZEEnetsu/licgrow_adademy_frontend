/**
 * Course tree handlers — `api-contracts/08-course.md` §1–14.
 *
 * §15 (learner course read) is NOT implemented: it's gated on batch
 * membership, which arrives with 06-batch.md. Faking membership here would
 * hide exactly the bugs that endpoint exists to catch.
 *
 * TEMPORARY DEV SCAFFOLDING. See src/mocks/README.md.
 */

import { db, nextId } from "../db.js";
import { authenticate, requirePermission } from "../guard.js";
import {
  created,
  fail,
  noContent,
  notFound,
  ok,
  paginate,
  validationError,
} from "../respond.js";

/** Independent re-implementation of the YouTube rule (see db.js on oracles). */
const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
const YT_HOST = /^(https?:\/\/)?((www|m|music)\.)?(youtube\.com|youtu\.be|youtube-nocookie\.com)\//i;

function isYouTube(value) {
  if (typeof value !== "string" || !value.trim()) return false;
  const input = value.trim();
  if (VIDEO_ID.test(input)) return true;
  if (!YT_HOST.test(input)) return false;
  return /[A-Za-z0-9_-]{11}/.test(input);
}

/** §2 summary shape. */
const summarize = (course) => ({
  id: course.id,
  title: course.title,
  examTarget: course.examTarget,
  status: course.status,
  unitCount: course.units.length,
  updatedAt: course.updatedAt,
});

/** §3 full tree, with each unit's quiz surfaced as a reference. */
const fullTree = (course) => ({
  id: course.id,
  title: course.title,
  description: course.description,
  examTarget: course.examTarget,
  status: course.status,
  updatedAt: course.updatedAt,
  units: [...course.units]
    .sort((a, b) => a.sequence - b.sequence)
    .map((unit) => ({
      id: unit.id,
      title: unit.title,
      sequence: unit.sequence,
      chapters: [...unit.chapters].sort((a, b) => a.sequence - b.sequence),
      quiz: db.quizForUnit(unit.id),
    })),
});

const touch = (course) => {
  course.updatedAt = new Date().toISOString();
};

/**
 * Guard shared by every mutating endpoint: authorised, course exists, and the
 * course isn't archived (§4, §7–14 all return 422 COURSE_ARCHIVED).
 */
function mutableCourse(request, courseId) {
  const auth = requirePermission(request, "course:author");
  if (auth.response) return { response: auth.response };

  const course = db.findCourse(courseId);
  if (!course) return { response: notFound("Course") };

  if (course.status === "archived") {
    return {
      response: fail(422, "COURSE_ARCHIVED", "This course is archived and read-only."),
    };
  }
  return { course };
}

// ── courses ────────────────────────────────────────────────────────────────

function listCourses(request, _params, url) {
  const auth = requirePermission(request, "course:read");
  if (auth.response) return auth.response;

  const { searchParams } = url;
  let rows = [...db.courses];

  const status = searchParams.get("status");
  const q = searchParams.get("q");
  if (status) rows = rows.filter((c) => c.status === status);
  if (q) {
    const needle = q.toLowerCase();
    rows = rows.filter((c) => c.title.toLowerCase().includes(needle));
  }

  rows.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));

  const { slice, meta } = paginate(rows, searchParams);
  return ok(slice.map(summarize), meta);
}

function getCourse(request, { courseId }) {
  const auth = requirePermission(request, "course:read");
  if (auth.response) return auth.response;

  const course = db.findCourse(courseId);
  return course ? ok(fullTree(course)) : notFound("Course");
}

async function createCourse(request) {
  const auth = requirePermission(request, "course:author");
  if (auth.response) return auth.response;

  const body = await request.json().catch(() => null);
  if (!body) return fail(400, "MALFORMED_JSON", "Body isn't valid JSON.");

  const ALLOWED = new Set(["title", "description", "examTarget"]);
  const unknown = Object.keys(body).filter((k) => !ALLOWED.has(k));
  if (unknown.length) {
    return validationError(
      unknown.map((field) => ({ field, issue: "Unknown field" })),
      "Unknown fields are not accepted.",
    );
  }

  const details = [];
  if (!body.title || body.title.length < 3 || body.title.length > 160) {
    details.push({ field: "title", issue: "Required, 3–160 characters" });
  }
  if (body.description && body.description.length > 4000) {
    details.push({ field: "description", issue: "Max 4000 characters" });
  }
  if (body.examTarget && body.examTarget.length > 40) {
    details.push({ field: "examTarget", issue: "Max 40 characters" });
  }
  if (details.length) return validationError(details);

  const course = {
    id: nextId("course"),
    title: body.title,
    description: body.description ?? null,
    examTarget: body.examTarget ?? null,
    status: "draft",
    updatedAt: new Date().toISOString(),
    units: [],
  };
  db.courses.push(course);

  return created(fullTree(course));
}

async function updateCourse(request, { courseId }) {
  const guard = mutableCourse(request, courseId);
  if (guard.response) return guard.response;

  const body = await request.json().catch(() => null);
  if (!body) return fail(400, "MALFORMED_JSON", "Body isn't valid JSON.");

  for (const field of ["title", "description", "examTarget"]) {
    if (field in body) guard.course[field] = body[field];
  }
  touch(guard.course);

  return ok(fullTree(guard.course));
}

/** §5 — publish. Guard: at least one unit with at least one chapter. */
function publishCourse(request, { courseId }) {
  const guard = mutableCourse(request, courseId);
  if (guard.response) return guard.response;

  const hasContent = guard.course.units.some((u) => u.chapters.length > 0);
  if (!hasContent) {
    return fail(
      422,
      "EMPTY_COURSE",
      "Add at least one unit with a chapter before publishing.",
    );
  }

  guard.course.status = "published";
  touch(guard.course);
  return ok(fullTree(guard.course));
}

/** §6 — archive. Idempotent, and reachable even when already archived. */
function archiveCourse(request, { courseId }) {
  const auth = requirePermission(request, "course:author");
  if (auth.response) return auth.response;

  const course = db.findCourse(courseId);
  if (!course) return notFound("Course");

  course.status = "archived";
  touch(course);
  return ok(fullTree(course));
}

// ── units ──────────────────────────────────────────────────────────────────

async function addUnit(request, { courseId }) {
  const guard = mutableCourse(request, courseId);
  if (guard.response) return guard.response;

  const body = await request.json().catch(() => null);
  if (!body?.title || body.title.length < 3) {
    return validationError([{ field: "title", issue: "Required, min 3 characters" }]);
  }

  const unit = {
    id: nextId("unit"),
    title: body.title,
    sequence: guard.course.units.length + 1,
    chapters: [],
  };

  if (Number.isInteger(body.sequence)) {
    guard.course.units.splice(Math.max(0, body.sequence - 1), 0, unit);
    db.resequence(guard.course.units);
  } else {
    guard.course.units.push(unit);
  }

  touch(guard.course);
  return created(unit);
}

async function updateUnit(request, { courseId, unitId }) {
  const guard = mutableCourse(request, courseId);
  if (guard.response) return guard.response;

  const unit = db.findUnit(courseId, unitId);
  if (!unit) return notFound("Unit");

  const body = await request.json().catch(() => null);
  if (body?.title !== undefined) {
    if (!body.title || body.title.length < 3) {
      return validationError([{ field: "title", issue: "Min 3 characters" }]);
    }
    unit.title = body.title;
  }

  touch(guard.course);
  return ok(unit);
}

/**
 * §9 — delete a unit. Chapters cascade; a linked quiz has its `unitId`
 * CLEARED but the test itself survives.
 */
function deleteUnit(request, { courseId, unitId }) {
  const guard = mutableCourse(request, courseId);
  if (guard.response) return guard.response;

  const unit = db.findUnit(courseId, unitId);
  if (!unit) return notFound("Unit");

  const quiz = db.tests.find((t) => t.kind === "quiz" && t.unitId === unitId);
  if (quiz) quiz.unitId = null;

  guard.course.units = guard.course.units.filter((u) => u.id !== unitId);
  db.resequence(guard.course.units);
  touch(guard.course);

  return noContent();
}

async function reorderUnits(request, { courseId }) {
  const guard = mutableCourse(request, courseId);
  if (guard.response) return guard.response;

  const body = await request.json().catch(() => null);
  const ordered = body?.orderedUnitIds;
  if (!Array.isArray(ordered)) {
    return validationError([
      { field: "orderedUnitIds", issue: "Required, must be an array" },
    ]);
  }

  const current = guard.course.units.map((u) => u.id);
  const sameSet =
    current.length === ordered.length && current.every((id) => ordered.includes(id));
  if (!sameSet) {
    return fail(
      422,
      "REORDER_SET_MISMATCH",
      "The supplied ids must be exactly the course's current units.",
    );
  }

  guard.course.units.sort(
    (a, b) => ordered.indexOf(a.id) - ordered.indexOf(b.id),
  );
  db.resequence(guard.course.units);
  touch(guard.course);

  return ok(guard.course.units);
}

// ── chapters ───────────────────────────────────────────────────────────────

async function addChapter(request, { courseId, unitId }) {
  const guard = mutableCourse(request, courseId);
  if (guard.response) return guard.response;

  const unit = db.findUnit(courseId, unitId);
  if (!unit) return notFound("Unit");

  const body = await request.json().catch(() => null);
  const details = [];

  if (!body?.title || body.title.length < 3 || body.title.length > 160) {
    details.push({ field: "title", issue: "Required, 3–160 characters" });
  }
  if (!isYouTube(body?.youtubeUrl)) {
    details.push({
      field: "youtubeUrl",
      issue: "Required — a YouTube URL or 11-character video id",
    });
  }
  if (body?.description && body.description.length > 2000) {
    details.push({ field: "description", issue: "Max 2000 characters" });
  }
  if (details.length) return validationError(details);

  const chapter = {
    id: nextId("chap"),
    title: body.title,
    youtubeUrl: body.youtubeUrl,
    description: body.description ?? null,
    sequence: unit.chapters.length + 1,
  };

  if (Number.isInteger(body.sequence)) {
    unit.chapters.splice(Math.max(0, body.sequence - 1), 0, chapter);
    db.resequence(unit.chapters);
  } else {
    unit.chapters.push(chapter);
  }

  touch(guard.course);
  return created(chapter);
}

async function updateChapter(request, { courseId, unitId, chapterId }) {
  const guard = mutableCourse(request, courseId);
  if (guard.response) return guard.response;

  const chapter = db.findChapter(courseId, unitId, chapterId);
  if (!chapter) return notFound("Chapter");

  const body = await request.json().catch(() => null);
  if (!body) return fail(400, "MALFORMED_JSON", "Body isn't valid JSON.");

  if ("youtubeUrl" in body && !isYouTube(body.youtubeUrl)) {
    return validationError([
      { field: "youtubeUrl", issue: "A YouTube URL or 11-character video id" },
    ]);
  }
  if ("title" in body && (!body.title || body.title.length < 3)) {
    return validationError([{ field: "title", issue: "Min 3 characters" }]);
  }

  for (const field of ["title", "youtubeUrl", "description"]) {
    if (field in body) chapter[field] = body[field];
  }

  touch(guard.course);
  return ok(chapter);
}

function deleteChapter(request, { courseId, unitId, chapterId }) {
  const guard = mutableCourse(request, courseId);
  if (guard.response) return guard.response;

  const unit = db.findUnit(courseId, unitId);
  if (!unit) return notFound("Unit");
  if (!unit.chapters.some((c) => c.id === chapterId)) return notFound("Chapter");

  unit.chapters = unit.chapters.filter((c) => c.id !== chapterId);
  db.resequence(unit.chapters);
  touch(guard.course);

  return noContent();
}

async function reorderChapters(request, { courseId, unitId }) {
  const guard = mutableCourse(request, courseId);
  if (guard.response) return guard.response;

  const unit = db.findUnit(courseId, unitId);
  if (!unit) return notFound("Unit");

  const body = await request.json().catch(() => null);
  const ordered = body?.orderedChapterIds;
  if (!Array.isArray(ordered)) {
    return validationError([
      { field: "orderedChapterIds", issue: "Required, must be an array" },
    ]);
  }

  const current = unit.chapters.map((c) => c.id);
  const sameSet =
    current.length === ordered.length && current.every((id) => ordered.includes(id));
  if (!sameSet) {
    return fail(
      422,
      "REORDER_SET_MISMATCH",
      "The supplied ids must be exactly this unit's current chapters.",
    );
  }

  unit.chapters.sort((a, b) => ordered.indexOf(a.id) - ordered.indexOf(b.id));
  db.resequence(unit.chapters);
  touch(guard.course);

  return ok(unit.chapters);
}

// ── 15. learner read (batch-scoped) ────────────────────────────────────────

/**
 * §15 — a learner reads a course only through a batch they belong to.
 *
 * Deferred from Phase 3 because it needs batch membership. Two distinct
 * failures, deliberately different codes:
 *   · not an active member          → 403 NOT_A_BATCH_MEMBER
 *   · course not published in batch → 404 (existence is hidden)
 */
function readCourseAsLearner(request, { batchId, courseId }) {
  const auth = authenticate(request);
  if (auth.response) return auth.response;

  if (auth.account.type !== "learner") {
    return fail(403, "FORBIDDEN", "This endpoint is for learners.");
  }

  const batch = db.findBatch(batchId);
  if (!batch) return notFound("Batch");

  if (!db.isActiveMember(batchId, auth.account.id)) {
    return fail(403, "NOT_A_BATCH_MEMBER", "You are not a member of this batch.");
  }

  const linked = db.batchCourses.some(
    (link) => link.batchId === batchId && link.courseId === courseId,
  );
  const course = db.findCourse(courseId);

  // hide the distinction between "no such course" and "not in your batch"
  if (!linked || !course) return notFound("Course");

  const tree = fullTree(course);
  return ok({
    id: tree.id,
    title: tree.title,
    description: tree.description,
    units: tree.units.map((unit) => ({
      id: unit.id,
      title: unit.title,
      sequence: unit.sequence,
      chapters: unit.chapters,
      // the learner's quiz reference — never answer keys
      quiz: unit.quiz
        ? {
            id: unit.quiz.id,
            title: unit.quiz.title,
            kind: unit.quiz.kind,
            questionCount: unit.quiz.questionCount,
            // populated by 10-submission.md (Phase 8)
            myBestScorePct: null,
          }
        : null,
    })),
  });
}

export const courseRoutes = [
  {
    method: "GET",
    path: "/me/batches/:batchId/courses/:courseId",
    handler: readCourseAsLearner,
  },
  { method: "GET", path: "/admin/courses", handler: listCourses },
  { method: "POST", path: "/admin/courses", handler: createCourse },
  { method: "GET", path: "/admin/courses/:courseId", handler: getCourse },
  { method: "PATCH", path: "/admin/courses/:courseId", handler: updateCourse },
  { method: "POST", path: "/admin/courses/:courseId/publish", handler: publishCourse },
  { method: "POST", path: "/admin/courses/:courseId/archive", handler: archiveCourse },

  // literal "reorder" segments are listed first as a matching-order safeguard
  { method: "PUT", path: "/admin/courses/:courseId/units/reorder", handler: reorderUnits },
  { method: "POST", path: "/admin/courses/:courseId/units", handler: addUnit },
  { method: "PATCH", path: "/admin/courses/:courseId/units/:unitId", handler: updateUnit },
  { method: "DELETE", path: "/admin/courses/:courseId/units/:unitId", handler: deleteUnit },

  {
    method: "PUT",
    path: "/admin/courses/:courseId/units/:unitId/chapters/reorder",
    handler: reorderChapters,
  },
  {
    method: "POST",
    path: "/admin/courses/:courseId/units/:unitId/chapters",
    handler: addChapter,
  },
  {
    method: "PATCH",
    path: "/admin/courses/:courseId/units/:unitId/chapters/:chapterId",
    handler: updateChapter,
  },
  {
    method: "DELETE",
    path: "/admin/courses/:courseId/units/:unitId/chapters/:chapterId",
    handler: deleteChapter,
  },
];
