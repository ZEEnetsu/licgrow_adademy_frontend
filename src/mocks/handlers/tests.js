/**
 * Test / quiz authoring handlers — `api-contracts/09-test.md`.
 *
 * TEMPORARY DEV SCAFFOLDING. See src/mocks/README.md.
 */

import { db, nextId } from "../db.js";
import { requirePermission } from "../guard.js";
import {
  created,
  fail,
  noContent,
  notFound,
  ok,
  paginate,
  validationError,
} from "../respond.js";

/** §2 summary shape — deliberately narrower than the full record. */
const summarize = (test) => ({
  id: test.id,
  kind: test.kind,
  title: test.title,
  status: test.status,
  totalMarks: test.totalMarks,
  questionCount: db.questionsFor(test.id).length,
  updatedAt: test.updatedAt,
});

const findTest = (testId) => db.tests.find((t) => t.id === testId);

// ── tests ──────────────────────────────────────────────────────────────────

/** §2 — list with filtering, search and pagination. */
function listTests(request, _params, url) {
  const auth = requirePermission(request, "test:read");
  if (auth.response) return auth.response;

  const { searchParams } = url;
  let rows = [...db.tests];

  const kind = searchParams.get("kind");
  const status = searchParams.get("status");
  const q = searchParams.get("q");

  if (kind) rows = rows.filter((t) => t.kind === kind);
  if (status) rows = rows.filter((t) => t.status === status);
  if (q) {
    const needle = q.toLowerCase();
    rows = rows.filter((t) => t.title.toLowerCase().includes(needle));
  }

  const sort = searchParams.get("sort") ?? "updatedAt:desc";
  const [field, direction] = sort.split(":");
  rows.sort((a, b) => {
    const cmp = String(a[field] ?? "").localeCompare(String(b[field] ?? ""));
    return direction === "desc" ? -cmp : cmp;
  });

  const { slice, meta } = paginate(rows, searchParams);
  return ok(slice.map(summarize), meta);
}

/** §3 — full metadata plus questionCount. Questions come from §9. */
function getTest(request, { testId }) {
  const auth = requirePermission(request, "test:read");
  if (auth.response) return auth.response;

  const test = findTest(testId);
  if (!test) return notFound("Test");

  return ok({ ...test, questionCount: db.questionsFor(testId).length });
}

/** §1 — create. */
async function createTest(request) {
  const auth = requirePermission(request, "test:author");
  if (auth.response) return auth.response;

  const body = await request.json().catch(() => null);
  if (!body) return fail(400, "MALFORMED_JSON", "Body isn't valid JSON.");

  const ALLOWED = new Set([
    "kind", "unitId", "title", "description", "durationMinutes",
    "passingMarks", "maxAttempts", "cooldownMinutes", "shuffleQuestions",
    "availableFrom", "availableUntil", "leaderboardEnabled",
  ]);

  // conventions §3: unknown fields are rejected by the strict schema
  const unknown = Object.keys(body).filter((key) => !ALLOWED.has(key));
  if (unknown.length) {
    return validationError(
      unknown.map((field) => ({ field, issue: "Unknown field" })),
      "Unknown fields are not accepted.",
    );
  }

  const details = [];
  if (!["quiz", "test"].includes(body.kind)) {
    details.push({ field: "kind", issue: "Required: 'quiz' or 'test'" });
  }
  if (!body.title || body.title.length < 3 || body.title.length > 160) {
    details.push({ field: "title", issue: "Required, 3–160 characters" });
  }
  if (!Number.isInteger(body.passingMarks) || body.passingMarks < 0) {
    details.push({ field: "passingMarks", issue: "Required integer ≥ 0" });
  }
  // must be PRESENT — null means unlimited, but the key can't be omitted
  if (!("maxAttempts" in body)) {
    details.push({ field: "maxAttempts", issue: "Required (integer ≥ 1, or null for unlimited)" });
  } else if (body.maxAttempts !== null && !(Number.isInteger(body.maxAttempts) && body.maxAttempts >= 1)) {
    details.push({ field: "maxAttempts", issue: "Must be an integer ≥ 1, or null" });
  }
  if (details.length) return validationError(details);

  // kind constraints (09-test.md model table)
  if (body.kind === "quiz" && !body.unitId) {
    return fail(422, "INVALID_TEST_CONFIG", "A quiz requires a unitId.");
  }
  if (body.kind === "test" && body.unitId) {
    return fail(422, "INVALID_TEST_CONFIG", "A test must not have a unitId.");
  }

  const test = {
    id: nextId("test"),
    kind: body.kind,
    unitId: body.unitId ?? null,
    title: body.title,
    description: body.description ?? null,
    durationMinutes: body.durationMinutes ?? null,
    totalMarks: 0,
    passingMarks: body.passingMarks,
    maxAttempts: body.maxAttempts,
    cooldownMinutes: body.cooldownMinutes ?? 0,
    shuffleQuestions: body.shuffleQuestions ?? false,
    availableFrom: body.availableFrom ?? null,
    availableUntil: body.availableUntil ?? null,
    leaderboardEnabled: body.leaderboardEnabled ?? false,
    reviewPolicy: body.kind === "quiz" ? "immediate" : "after_close",
    status: "draft",
    updatedAt: new Date().toISOString(),
  };
  db.tests.push(test);

  return created(test);
}

/** §4 — update any config field except `kind`. */
async function updateTest(request, { testId }) {
  const auth = requirePermission(request, "test:author");
  if (auth.response) return auth.response;

  const test = findTest(testId);
  if (!test) return notFound("Test");

  const body = await request.json().catch(() => null);
  if (!body) return fail(400, "MALFORMED_JSON", "Body isn't valid JSON.");

  if ("kind" in body) {
    return validationError([{ field: "kind", issue: "Immutable after create" }]);
  }

  /*
   * 09 §4 — once a learner has sat this test, its scoring surface is frozen:
   * only title, description and an availableUntil EXTENSION stay editable.
   * Could not be enforced before Phase 6 because attempts did not exist.
   */
  if (db.testHasAttempts(testId)) {
    const EDITABLE = new Set(["title", "description", "availableUntil"]);
    const locked = Object.keys(body).filter((k) => !EDITABLE.has(k));
    if (locked.length) {
      return fail(
        422,
        "TEST_HAS_ATTEMPTS",
        "This test has attempts; clone it to make scoring changes.",
        locked.map((field) => ({ field, issue: "Locked once attempts exist" })),
      );
    }
    if (
      "availableUntil" in body &&
      test.availableUntil &&
      new Date(body.availableUntil) < new Date(test.availableUntil)
    ) {
      return fail(
        422,
        "TEST_HAS_ATTEMPTS",
        "The exam window can be extended but not shortened once attempts exist.",
      );
    }
  }

  const next = { ...test, ...body };
  if (next.passingMarks > next.totalMarks && next.totalMarks > 0) {
    return fail(422, "PASSING_EXCEEDS_TOTAL", "passingMarks exceeds totalMarks.");
  }

  Object.assign(test, body, { updatedAt: new Date().toISOString() });
  return ok(test);
}

/** §5 — delete. Draft-only, and only with zero attempts. */
function deleteTest(request, { testId }) {
  const auth = requirePermission(request, "test:author");
  if (auth.response) return auth.response;

  const test = findTest(testId);
  if (!test) return notFound("Test");

  if (test.status !== "draft" || db.testHasAttempts(testId)) {
    return fail(
      422,
      "TEST_NOT_DELETABLE",
      "Only draft tests with no attempts can be deleted. Archive it instead.",
    );
  }

  db.tests = db.tests.filter((t) => t.id !== testId);
  db.questions = db.questions.filter((q) => q.testId !== testId);
  return noContent();
}

/** §6 — publish, with the full validation gate. */
function publishTest(request, { testId }) {
  const auth = requirePermission(request, "test:author");
  if (auth.response) return auth.response;

  const test = findTest(testId);
  if (!test) return notFound("Test");

  const questions = db.questionsFor(testId);
  const details = [];

  if (questions.length === 0) {
    details.push({ field: "questions", issue: "At least one question is required" });
  }

  for (const question of questions) {
    // both languages required on the statement AND every option
    if (!question.statement?.en || !question.statement?.hi) {
      details.push({
        field: `questions[${question.sequence}].statement`,
        issue: "Both English and Hindi are required to publish",
      });
    }
    for (const [index, option] of question.options.entries()) {
      if (!option.text?.en || !option.text?.hi) {
        details.push({
          field: `questions[${question.sequence}].options[${index}]`,
          issue: "Both English and Hindi are required to publish",
        });
      }
    }
    if (!question.options.some((o) => o.id === question.correctOptionId)) {
      details.push({
        field: `questions[${question.sequence}].correctOptionId`,
        issue: "Exactly one correct option is required",
      });
    }
  }

  if (test.passingMarks > test.totalMarks) {
    details.push({
      field: "passingMarks",
      issue: `passingMarks (${test.passingMarks}) exceeds totalMarks (${test.totalMarks})`,
    });
  }

  if (details.length) {
    return fail(422, "TEST_NOT_PUBLISHABLE", "This test can't be published yet.", details);
  }

  test.status = "published";
  test.updatedAt = new Date().toISOString();
  return ok(test);
}

/**
 * §7 — archive. Idempotent.
 *
 * "no new attempts; existing history retained; AUTO-REMOVED FROM BATCHES on
 * archive." That last clause is easy to miss and asymmetric with courses:
 * archiving a COURSE leaves its batch links intact (08 §6), archiving a TEST
 * severs them. Implementing the two the same way would leave archived tests
 * visible to learners.
 */
function archiveTest(request, { testId }) {
  const auth = requirePermission(request, "test:author");
  if (auth.response) return auth.response;

  const test = findTest(testId);
  if (!test) return notFound("Test");

  test.status = "archived";
  test.updatedAt = new Date().toISOString();

  db.batchTests = db.batchTests.filter((link) => link.testId !== testId);

  return ok(test);
}

// ── questions ──────────────────────────────────────────────────────────────

/** §9 — AdminQuestion list (includes the answer key). */
function listQuestions(request, { testId }) {
  const auth = requirePermission(request, "test:read");
  if (auth.response) return auth.response;
  if (!findTest(testId)) return notFound("Test");

  return ok(db.questionsFor(testId));
}

/** §10 — a single AdminQuestion. */
function getQuestion(request, { testId, questionId }) {
  const auth = requirePermission(request, "test:read");
  if (auth.response) return auth.response;

  const question = db.questions.find(
    (q) => q.id === questionId && q.testId === testId,
  );
  return question ? ok(question) : notFound("Question");
}

/** §8 — bulk add. Atomic: validate everything before writing anything. */
async function addQuestions(request, { testId }) {
  const auth = requirePermission(request, "test:author");
  if (auth.response) return auth.response;

  const test = findTest(testId);
  if (!test) return notFound("Test");

  if (db.testHasAttempts(testId)) {
    return fail(
      422,
      "TEST_HAS_ATTEMPTS",
      "This test has attempts; its questions can no longer be changed.",
    );
  }

  const body = await request.json().catch(() => null);
  if (!Array.isArray(body?.questions) || body.questions.length === 0) {
    return validationError([
      { field: "questions", issue: "Required, non-empty array" },
    ]);
  }

  const details = [];
  body.questions.forEach((question, index) => {
    if (!Number.isInteger(question.marks) || question.marks < 1) {
      details.push({ field: `questions[${index}].marks`, issue: "Integer ≥ 1" });
    }
    // drafts may omit `hi`, but `en` is required even in draft
    if (!question.statement?.en) {
      details.push({
        field: `questions[${index}].statement.en`,
        issue: "English statement is required",
      });
    }
    if (!Array.isArray(question.options) || question.options.length < 2 || question.options.length > 6) {
      details.push({ field: `questions[${index}].options`, issue: "Between 2 and 6 options" });
    } else if (question.options.some((o) => !o.text?.en)) {
      details.push({
        field: `questions[${index}].options`,
        issue: "Every option needs English text",
      });
    }
    if (
      !Number.isInteger(question.correctIndex) ||
      question.correctIndex < 0 ||
      question.correctIndex >= (question.options?.length ?? 0)
    ) {
      details.push({
        field: `questions[${index}].correctIndex`,
        issue: "Must index one of the supplied options",
      });
    }
  });

  if (details.length) return validationError(details);

  let sequence = db.questionsFor(testId).length;
  const inserted = body.questions.map((question) => {
    const options = question.options.map((option) => ({
      id: nextId("o"),
      text: { ...option.text },
    }));

    return {
      id: nextId("q"),
      testId,
      sequence: ++sequence,
      marks: question.marks,
      statement: { ...question.statement },
      explanation: question.explanation ? { ...question.explanation } : null,
      options,
      correctOptionId: options[question.correctIndex].id,
    };
  });

  db.questions.push(...inserted);
  db.recomputeTotalMarks(testId);

  return created(inserted);
}

/** §11 — update a question. */
async function updateQuestion(request, { testId, questionId }) {
  const auth = requirePermission(request, "test:author");
  if (auth.response) return auth.response;

  const question = db.questions.find(
    (q) => q.id === questionId && q.testId === testId,
  );
  if (!question) return notFound("Question");

  if (db.testHasAttempts(testId)) {
    return fail(
      422,
      "TEST_HAS_ATTEMPTS",
      "This test has attempts; its questions can no longer be changed.",
    );
  }

  const body = await request.json().catch(() => null);
  if (!body) return fail(400, "MALFORMED_JSON", "Body isn't valid JSON.");

  if (body.marks !== undefined) question.marks = body.marks;
  if (body.statement) question.statement = { ...question.statement, ...body.statement };
  if (body.explanation) question.explanation = { ...body.explanation };

  // sending `options` replaces the whole set
  if (Array.isArray(body.options)) {
    question.options = body.options.map((option) => ({
      id: option.id ?? nextId("o"),
      text: { ...option.text },
    }));
  }
  if (body.correctOptionId) {
    if (!question.options.some((o) => o.id === body.correctOptionId)) {
      return validationError([
        { field: "correctOptionId", issue: "Must reference one of this question's options" },
      ]);
    }
    question.correctOptionId = body.correctOptionId;
  }

  db.recomputeTotalMarks(testId);
  return ok(question);
}

/** §12 — delete a question, recomputing totalMarks. */
function deleteQuestion(request, { testId, questionId }) {
  const auth = requirePermission(request, "test:author");
  if (auth.response) return auth.response;

  const exists = db.questions.some(
    (q) => q.id === questionId && q.testId === testId,
  );
  if (!exists) return notFound("Question");

  if (db.testHasAttempts(testId)) {
    return fail(
      422,
      "TEST_HAS_ATTEMPTS",
      "This test has attempts; its questions can no longer be changed.",
    );
  }

  db.questions = db.questions.filter((q) => q.id !== questionId);
  db.questionsFor(testId).forEach((q, index) => {
    q.sequence = index + 1;
  });
  db.recomputeTotalMarks(testId);

  return noContent();
}

/** §13 — reorder. The id set must match exactly. */
async function reorderQuestions(request, { testId }) {
  const auth = requirePermission(request, "test:author");
  if (auth.response) return auth.response;
  if (!findTest(testId)) return notFound("Test");

  const body = await request.json().catch(() => null);
  const ordered = body?.orderedQuestionIds;
  if (!Array.isArray(ordered)) {
    return validationError([
      { field: "orderedQuestionIds", issue: "Required, must be an array" },
    ]);
  }

  const current = db.questionsFor(testId).map((q) => q.id);
  const sameSet =
    current.length === ordered.length &&
    current.every((id) => ordered.includes(id));

  if (!sameSet) {
    return fail(
      422,
      "REORDER_SET_MISMATCH",
      "The supplied ids must be exactly the current question set.",
    );
  }

  ordered.forEach((id, index) => {
    const question = db.questions.find((q) => q.id === id);
    if (question) question.sequence = index + 1;
  });

  return ok(db.questionsFor(testId));
}

export const testRoutes = [
  { method: "GET", path: "/admin/tests", handler: listTests },
  { method: "POST", path: "/admin/tests", handler: createTest },
  { method: "GET", path: "/admin/tests/:testId", handler: getTest },
  { method: "PATCH", path: "/admin/tests/:testId", handler: updateTest },
  { method: "DELETE", path: "/admin/tests/:testId", handler: deleteTest },
  { method: "POST", path: "/admin/tests/:testId/publish", handler: publishTest },
  { method: "POST", path: "/admin/tests/:testId/archive", handler: archiveTest },
  { method: "GET", path: "/admin/tests/:testId/questions", handler: listQuestions },
  { method: "POST", path: "/admin/tests/:testId/questions", handler: addQuestions },
  { method: "PUT", path: "/admin/tests/:testId/questions/reorder", handler: reorderQuestions },
  { method: "GET", path: "/admin/tests/:testId/questions/:questionId", handler: getQuestion },
  { method: "PATCH", path: "/admin/tests/:testId/questions/:questionId", handler: updateQuestion },
  { method: "DELETE", path: "/admin/tests/:testId/questions/:questionId", handler: deleteQuestion },
];
