/**
 * Submission — `api-contracts/10-submission.md`. The learner side of the
 * assessment engine, and the highest-risk contract in the set.
 *
 * The invariants it enforces, in the contract's own order:
 *
 *  1. ACCESS — reachable only through a batch the learner is an active member
 *     of. A `kind=test` published into that batch, or a `kind=quiz` whose
 *     unit's course is. Centralised in db.canLearnerAccessTest.
 *  2. ANSWER-KEY PROTECTION — in-progress questions use the LearnerQuestion
 *     shape: no correctOptionId, no explanation, one language. This is a
 *     contract guarantee, not a filter, so the shape is built from scratch
 *     rather than by deleting fields off the admin object.
 *  3. REVEAL POLICY — quiz reveals immediately; test reveals only after
 *     availableUntil.
 *  4. ONE ACTIVE ATTEMPT per (learner, test).
 *  5. ATOMIC TRANSITIONS — submit requires `in_progress AND not expired`, the
 *     same condition the sweep excludes, so exactly one of them wins.
 *
 * TEMPORARY DEV SCAFFOLDING. See src/mocks/README.md.
 */

import { db, nextId } from "../db.js";
import { authenticate } from "../guard.js";
import { idempotent } from "../idempotency.js";
import {
  created,
  fail,
  notFound,
  ok,
  paginate,
  validationError,
} from "../respond.js";

function requireLearner(request) {
  const auth = authenticate(request);
  if (auth.response) return auth;
  if (auth.account.type !== "learner") {
    return { response: fail(403, "FORBIDDEN", "This endpoint is for learners.") };
  }
  return auth;
}

/**
 * Invariant 1. Existence is privileged: a test the learner cannot reach is a
 * 404, never a 403 that would confirm it exists.
 */
function reachableTest(learnerId, testId) {
  const test = db.tests.find((t) => t.id === testId);
  if (!test) return { response: notFound("Test") };
  if (!db.canLearnerAccessTest(learnerId, testId)) {
    return { response: notFound("Test") };
  }
  return { test };
}

const langFrom = (request) => {
  const header = request.headers.get("Accept-Language") ?? "en";
  return header.toLowerCase().startsWith("hi") ? "hi" : "en";
};

/**
 * Invariant 2 — LearnerQuestion.
 *
 * Built field by field. Copying the admin question and deleting keys would
 * leave one `delete` away from leaking an answer key; this way a new admin
 * field can never appear here by accident.
 */
function learnerQuestion(question, lang) {
  const statement = question.statement?.[lang] ?? question.statement?.en ?? "";
  // conventions §9: report the language actually served when it fell back
  const served = question.statement?.[lang] ? lang : "en";

  return {
    id: question.id,
    sequence: question.sequence,
    marks: question.marks,
    statement,
    ...(served === lang ? {} : { contentLang: served }),
    options: question.options.map((option) => ({
      id: option.id,
      text: option.text?.[lang] ?? option.text?.en ?? "",
    })),
  };
}

const isWindowOpen = (test, now = Date.now()) => {
  if (test.kind === "quiz") return true;
  const from = test.availableFrom ? new Date(test.availableFrom).getTime() : null;
  const until = test.availableUntil ? new Date(test.availableUntil).getTime() : null;
  if (from && now < from) return false;
  if (until && now > until) return false;
  return true;
};

const isClosed = (test, now = Date.now()) =>
  Boolean(test.availableUntil && now > new Date(test.availableUntil).getTime());

/** Invariant 3 — may the learner see correct answers for this attempt yet? */
function canReveal(test, now = Date.now()) {
  if (test.reviewPolicy === "immediate") return true;
  return isClosed(test, now);
}

/** The result shape for a terminal attempt, honouring the reveal policy. */
function attemptResult(attempt, test) {
  const base = {
    attemptId: attempt.id,
    testId: attempt.testId,
    attemptNumber: attempt.attemptNumber,
    status: attempt.status,
    score: attempt.score,
    totalMarks: attempt.totalMarks,
    percentage: attempt.percentage,
    passed: attempt.passed,
    startedAt: attempt.startedAt,
    submittedAt: attempt.submittedAt,
  };

  if (!canReveal(test)) {
    return {
      ...base,
      review: null,
      reviewAvailableAt: test.availableUntil ?? null,
    };
  }

  const questions = db.questionsFor(attempt.testId);
  return {
    ...base,
    review: attempt.questionOrder
      .map((questionId) => questions.find((q) => q.id === questionId))
      .filter(Boolean)
      .map((question) => ({
        questionId: question.id,
        yourOptionId: attempt.answers?.[question.id] ?? null,
        correctOptionId: question.correctOptionId,
        isCorrect: attempt.answers?.[question.id] === question.correctOptionId,
        explanation: question.explanation?.en ?? null,
      })),
  };
}

// ── 1. test overview ───────────────────────────────────────────────────────

function testOverview(request, { testId }) {
  const auth = requireLearner(request);
  if (auth.response) return auth.response;
  db.sweepExpiredAttempts();

  const reach = reachableTest(auth.account.id, testId);
  if (reach.response) return reach.response;
  const test = reach.test;

  const history = db.attemptsFor(auth.account.id, testId);
  const active = db.activeAttempt(auth.account.id, testId);
  const attemptsUsed = history.length;

  /*
   * `startBlockedReason` is precomputed so the UI can disable the button with
   * an explanation instead of discovering it through a failed POST.
   * Order matters: an in-progress attempt is the most actionable answer.
   */
  let startBlockedReason = null;
  if (active) startBlockedReason = "attempt_in_progress";
  else if (test.status !== "published") startBlockedReason = "window_closed";
  else if (!isWindowOpen(test)) startBlockedReason = "window_closed";
  else if (test.maxAttempts !== null && attemptsUsed >= test.maxAttempts) {
    startBlockedReason = "no_attempts_left";
  } else if (test.cooldownMinutes > 0 && history.length) {
    const last = history[0];
    const since = Date.now() - new Date(last.submittedAt ?? last.startedAt).getTime();
    if (since < test.cooldownMinutes * 60_000) startBlockedReason = "cooldown";
  }

  const isTest = test.kind === "test";

  return ok({
    id: test.id,
    kind: test.kind,
    title: test.title,
    description: test.description,
    durationMinutes: test.durationMinutes,
    totalMarks: test.totalMarks,
    passingMarks: test.passingMarks,
    maxAttempts: test.maxAttempts,
    attemptsUsed,
    attemptsRemaining:
      test.maxAttempts === null ? null : Math.max(0, test.maxAttempts - attemptsUsed),
    cooldownMinutes: test.cooldownMinutes,
    window: isTest
      ? {
          availableFrom: test.availableFrom,
          availableUntil: test.availableUntil,
          isOpen: isWindowOpen(test),
        }
      : null,
    reviewPolicy: test.reviewPolicy,
    leaderboardEnabled: isTest ? test.leaderboardEnabled : false,
    leaderboardOpen: isTest && test.leaderboardEnabled && isClosed(test),
    myBestScorePct: db.bestScorePct(auth.account.id, testId),
    activeAttemptId: active?.id ?? null,
    canStart: startBlockedReason === null,
    startBlockedReason,
  });
}

// ── 2. attempt history ─────────────────────────────────────────────────────

function attemptHistory(request, { testId }, url) {
  const auth = requireLearner(request);
  if (auth.response) return auth.response;
  db.sweepExpiredAttempts();

  const reach = reachableTest(auth.account.id, testId);
  if (reach.response) return reach.response;

  const rows = db.attemptsFor(auth.account.id, testId).map((attempt) => ({
    attemptId: attempt.id,
    attemptNumber: attempt.attemptNumber,
    status: attempt.status,
    score: attempt.score ?? null,
    totalMarks: attempt.totalMarks ?? null,
    percentage: attempt.percentage ?? null,
    passed: attempt.passed ?? null,
    startedAt: attempt.startedAt,
    submittedAt: attempt.submittedAt,
  }));

  const { slice, meta } = paginate(rows, url.searchParams);
  return ok(slice, meta);
}

// ── 3. start an attempt ────────────────────────────────────────────────────

async function startAttempt(request, { testId }) {
  const auth = requireLearner(request);
  if (auth.response) return auth.response;
  db.sweepExpiredAttempts();

  const reach = reachableTest(auth.account.id, testId);
  if (reach.response) return reach.response;
  const test = reach.test;

  // invariant 4 — the body carries the id so the client can resume, not retry
  const active = db.activeAttempt(auth.account.id, testId);
  if (active) {
    const response = fail(
      409,
      "ATTEMPT_IN_PROGRESS",
      "You already have an attempt in progress.",
    );
    const body = await response.json();
    body.error.activeAttemptId = active.id;
    return new Response(JSON.stringify(body), {
      status: 409,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  if (test.status !== "published") {
    return fail(422, "TEST_NOT_PUBLISHED", "This test isn't published.");
  }
  if (!isWindowOpen(test)) {
    return fail(422, "TEST_NOT_AVAILABLE", "This test isn't open right now.");
  }

  const history = db.attemptsFor(auth.account.id, testId);
  if (test.maxAttempts !== null && history.length >= test.maxAttempts) {
    return fail(422, "ATTEMPT_LIMIT_REACHED", "You have no attempts left.");
  }

  if (test.cooldownMinutes > 0 && history.length) {
    const last = history[0];
    const since = Date.now() - new Date(last.submittedAt ?? last.startedAt).getTime();
    const waitMs = test.cooldownMinutes * 60_000 - since;
    if (waitMs > 0) {
      const response = fail(422, "COOLDOWN_ACTIVE", "Please wait before retrying.");
      const body = await response.json();
      body.error.retryAfterSeconds = Math.ceil(waitMs / 1000);
      return new Response(JSON.stringify(body), {
        status: 422,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
    }
  }

  const lang = langFrom(request);
  const questions = db.questionsFor(testId);

  // the order is SNAPSHOTTED so a resume shows exactly the same paper
  let order = questions.map((q) => q.id);
  if (test.shuffleQuestions) {
    order = [...order].sort(() => Math.random() - 0.5);
  }

  const startedAt = new Date();
  const expiresAt = test.durationMinutes
    ? new Date(startedAt.getTime() + test.durationMinutes * 60_000)
    : null;

  const attempt = {
    id: nextId("att"),
    testId,
    learnerId: auth.account.id,
    attemptNumber: history.length + 1,
    status: "in_progress",
    questionOrder: order,
    answers: {},
    contentLang: lang,
    startedAt: startedAt.toISOString(),
    expiresAt: expiresAt ? expiresAt.toISOString() : null,
    submittedAt: null,
    score: null,
    totalMarks: null,
    percentage: null,
    passed: null,
  };
  db.attempts.push(attempt);

  return created({
    attemptId: attempt.id,
    testId,
    attemptNumber: attempt.attemptNumber,
    status: attempt.status,
    startedAt: attempt.startedAt,
    expiresAt: attempt.expiresAt,
    durationMinutes: test.durationMinutes,
    timeRemainingSeconds: expiresAt
      ? Math.max(0, Math.floor((expiresAt - startedAt) / 1000))
      : null,
    contentLang: lang,
    questions: order
      .map((id) => questions.find((q) => q.id === id))
      .filter(Boolean)
      .map((q) => learnerQuestion(q, lang)),
  });
}

// ── 4. get / resume ────────────────────────────────────────────────────────

/** Ownership: another learner's attempt is a 404, not a 403. */
function ownedAttempt(learnerId, attemptId) {
  const attempt = db.attempts.find((a) => a.id === attemptId);
  if (!attempt || attempt.learnerId !== learnerId) {
    return { response: notFound("Attempt") };
  }
  return { attempt };
}

function getAttempt(request, { attemptId }) {
  const auth = requireLearner(request);
  if (auth.response) return auth.response;
  db.sweepExpiredAttempts();

  const owned = ownedAttempt(auth.account.id, attemptId);
  if (owned.response) return owned.response;

  const attempt = owned.attempt;
  const test = db.tests.find((t) => t.id === attempt.testId);

  if (attempt.status !== "in_progress") {
    return ok(attemptResult(attempt, test));
  }

  const lang = attempt.contentLang ?? "en";
  const questions = db.questionsFor(attempt.testId);
  const remaining = attempt.expiresAt
    ? Math.max(0, Math.floor((new Date(attempt.expiresAt).getTime() - Date.now()) / 1000))
    : null;

  return ok({
    attemptId: attempt.id,
    testId: attempt.testId,
    status: attempt.status,
    timeRemainingSeconds: remaining,
    contentLang: lang,
    questions: attempt.questionOrder
      .map((id) => questions.find((q) => q.id === id))
      .filter(Boolean)
      .map((q) => learnerQuestion(q, lang)),
    savedAnswers: Object.entries(attempt.answers ?? {}).map(
      ([questionId, selectedOptionId]) => ({ questionId, selectedOptionId }),
    ),
  });
}

// ── 5. autosave ────────────────────────────────────────────────────────────

/**
 * The same atomic guard submit uses: in_progress AND not expired. A save must
 * not land on an attempt the sweep is about to close.
 */
function assertWritable(attempt) {
  if (attempt.status !== "in_progress") {
    return fail(422, "ATTEMPT_NOT_ACTIVE", "This attempt is already finished.");
  }
  if (attempt.expiresAt && new Date(attempt.expiresAt).getTime() <= Date.now()) {
    return fail(422, "ATTEMPT_EXPIRED", "Your time is up.");
  }
  return null;
}

/** Validates and applies answers. Returns an error Response, or null. */
function applyAnswers(attempt, answers) {
  const questions = db.questionsFor(attempt.testId);
  const details = [];

  for (const answer of answers) {
    const question = questions.find((q) => q.id === answer.questionId);
    if (!question) {
      details.push({
        field: `answers.${answer.questionId}`,
        issue: "Unknown question for this attempt",
      });
      continue;
    }
    if (
      answer.selectedOptionId !== null &&
      !question.options.some((o) => o.id === answer.selectedOptionId)
    ) {
      details.push({
        field: `answers.${answer.questionId}`,
        issue: "That option does not belong to this question",
      });
    }
  }
  if (details.length) return validationError(details);

  for (const answer of answers) {
    if (answer.selectedOptionId === null) delete attempt.answers[answer.questionId];
    else attempt.answers[answer.questionId] = answer.selectedOptionId;
  }
  return null;
}

async function saveAnswers(request, { attemptId }) {
  const auth = requireLearner(request);
  if (auth.response) return auth.response;
  db.sweepExpiredAttempts();

  const owned = ownedAttempt(auth.account.id, attemptId);
  if (owned.response) return owned.response;
  const attempt = owned.attempt;

  const blocked = assertWritable(attempt);
  if (blocked) return blocked;

  const body = await request.json().catch(() => null);
  if (!Array.isArray(body?.answers)) {
    return validationError([{ field: "answers", issue: "Required, must be an array" }]);
  }

  const invalid = applyAnswers(attempt, body.answers);
  if (invalid) return invalid;

  return ok({
    savedCount: body.answers.length,
    timeRemainingSeconds: attempt.expiresAt
      ? Math.max(0, Math.floor((new Date(attempt.expiresAt).getTime() - Date.now()) / 1000))
      : null,
  });
}

// ── 6. submit ──────────────────────────────────────────────────────────────

async function submitAttempt(request, { attemptId }) {
  const auth = requireLearner(request);
  if (auth.response) return auth.response;
  db.sweepExpiredAttempts();

  const owned = ownedAttempt(auth.account.id, attemptId);
  if (owned.response) return owned.response;
  const attempt = owned.attempt;
  const test = db.tests.find((t) => t.id === attempt.testId);

  /*
   * The sweep may have just closed this attempt. That is the atomic guard
   * resolving in the sweep's favour: the learner ran out of time, so they get
   * ATTEMPT_EXPIRED and are pointed at the already-scored timed_out result.
   */
  if (attempt.status === "timed_out") {
    return fail(422, "ATTEMPT_EXPIRED", "Your time is up. Fetch the result.");
  }

  // already submitted: idempotent, return the existing result
  if (attempt.status === "submitted") {
    return ok(attemptResult(attempt, test));
  }

  const body = await request.json().catch(() => null);
  if (Array.isArray(body?.answers)) {
    const invalid = applyAnswers(attempt, body.answers);
    if (invalid) return invalid;
  }

  attempt.status = "submitted";
  attempt.submittedAt = new Date().toISOString();
  db.scoreAttempt(attempt);

  return ok(attemptResult(attempt, test));
}

// ── 7. leaderboard ─────────────────────────────────────────────────────────

/** First name + last initial, per the contract's privacy note. */
function shortName(fullName = "") {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

function leaderboard(request, { testId }) {
  const auth = requireLearner(request);
  if (auth.response) return auth.response;
  db.sweepExpiredAttempts();

  const reach = reachableTest(auth.account.id, testId);
  if (reach.response) return reach.response;
  const test = reach.test;

  if (test.kind !== "test" || !test.leaderboardEnabled || !isClosed(test)) {
    return fail(
      403,
      "LEADERBOARD_LOCKED",
      "The leaderboard opens when the test closes.",
    );
  }

  // ranked by each learner's BEST attempt, not their latest
  const best = new Map();
  for (const attempt of db.attempts) {
    if (attempt.testId !== testId || attempt.status === "in_progress") continue;
    const current = best.get(attempt.learnerId) ?? -1;
    if ((attempt.percentage ?? 0) > current) {
      best.set(attempt.learnerId, attempt.percentage ?? 0);
    }
  }

  const ranked = [...best.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([learnerId, bestScorePct], index) => ({
      learnerId,
      rank: index + 1,
      learnerName: shortName(db.findAccountById(learnerId)?.fullName),
      bestScorePct,
    }));

  const mine = ranked.find((row) => row.learnerId === auth.account.id);

  return ok({
    testId,
    closedAt: test.availableUntil,
    top: ranked.slice(0, 10).map(({ learnerId, ...row }) => row),
    me: mine ? { rank: mine.rank, bestScorePct: mine.bestScorePct } : null,
  });
}

export const submissionRoutes = [
  { method: "GET", path: "/me/tests/:testId", handler: testOverview },
  { method: "GET", path: "/me/tests/:testId/attempts", handler: attemptHistory },
  {
    method: "POST",
    path: "/me/tests/:testId/attempts",
    handler: idempotent(startAttempt, {
      required: true,
      endpoint: "POST /me/tests/:id/attempts",
    }),
  },
  { method: "GET", path: "/me/tests/:testId/leaderboard", handler: leaderboard },
  { method: "GET", path: "/me/attempts/:attemptId", handler: getAttempt },
  { method: "PUT", path: "/me/attempts/:attemptId/answers", handler: saveAnswers },
  {
    method: "POST",
    path: "/me/attempts/:attemptId/submit",
    handler: idempotent(submitAttempt, {
      required: true,
      endpoint: "POST /me/attempts/:id/submit",
    }),
  },
];
