/**
 * Analytics — `api-contracts/13-analytics.md`.
 *
 * Read-only, computed on demand from the submission/enrollment data that
 * already exists. No new domain model, no writes.
 *
 * Two permission tiers, deliberately different:
 *   §1–3  analytics:view      platform / batch / learner
 *   §4–6  test:view_results   per-test insight
 *
 * The contract's counting rule matters and is easy to get wrong:
 * "Figures use each learner's BEST attempt unless noted (e.g. attempts.total
 * counts all attempts)."
 *
 * TEMPORARY DEV SCAFFOLDING. See src/mocks/README.md.
 */

import { db } from "../db.js";
import { requirePermission } from "../guard.js";
import { notFound, ok } from "../respond.js";

const DAY = 24 * 60 * 60 * 1000;

const withinDays = (iso, days) =>
  Boolean(iso) && Date.now() - new Date(iso).getTime() <= days * DAY;

const round1 = (n) => Math.round(n * 10) / 10;

const average = (numbers) =>
  numbers.length
    ? round1(numbers.reduce((sum, n) => sum + n, 0) / numbers.length)
    : null;

function median(numbers) {
  if (!numbers.length) return null;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return round1(
    sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2,
  );
}

/** Terminal attempts only — an in-progress one has no score yet. */
const scored = (attempts) => attempts.filter((a) => a.status !== "in_progress");

/**
 * One row per learner: their BEST attempt at a test. This is the basis for
 * every average, pass rate and histogram in the module.
 */
function bestPerLearner(attempts) {
  const best = new Map();
  for (const attempt of scored(attempts)) {
    const current = best.get(attempt.learnerId);
    if (!current || (attempt.percentage ?? 0) > (current.percentage ?? 0)) {
      best.set(attempt.learnerId, attempt);
    }
  }
  return [...best.values()];
}

const passRate = (attempts) =>
  attempts.length
    ? round1((attempts.filter((a) => a.passed).length / attempts.length) * 100)
    : null;

// ── 1. platform ────────────────────────────────────────────────────────────

function platformAnalytics(request) {
  const auth = requirePermission(request, "analytics:view");
  if (auth.response) return auth.response;

  const learners = db.accounts.filter((a) => a.type === "learner");
  const recentAttempts = scored(db.attempts).filter((a) =>
    withinDays(a.submittedAt ?? a.startedAt, 30),
  );

  return ok({
    learners: {
      total: learners.length,
      active: learners.filter((l) => l.status === "active").length,
      suspended: learners.filter((l) => l.status === "suspended").length,
    },
    batches: {
      total: db.batches.length,
      active: db.batches.filter((b) => b.status === "active").length,
      archived: db.batches.filter((b) => b.status === "archived").length,
    },
    content: {
      courses: db.courses.length,
      // quizzes are counted separately from full tests — they are different
      // things to a learner even though they share one engine
      tests: db.tests.filter((t) => t.kind === "test").length,
      quizzes: db.tests.filter((t) => t.kind === "quiz").length,
    },
    enrollments: {
      pending: db.enrollments.filter((e) => e.status === "pending").length,
      approvedLast30d: db.enrollments.filter(
        (e) => e.status === "approved" && withinDays(e.reviewedAt, 30),
      ).length,
    },
    activity: {
      // "attempts.total counts all attempts" — not best-per-learner
      attemptsLast30d: recentAttempts.length,
      avgScorePctLast30d: average(recentAttempts.map((a) => a.percentage ?? 0)),
    },
  });
}

// ── 2. batch ───────────────────────────────────────────────────────────────

function batchAnalytics(request, { batchId }) {
  const auth = requirePermission(request, "analytics:view");
  if (auth.response) return auth.response;

  const batch = db.findBatch(batchId);
  if (!batch) return notFound("Batch");

  const members = db.batchMembers.filter((m) => m.batchId === batchId);
  const activeMemberIds = members.filter((m) => m.isActive).map((m) => m.learnerId);
  const enrollments = db.enrollments.filter((e) => e.batchId === batchId);

  const testIds = db.testsInBatch(batchId).map((t) => t.id);
  const batchAttempts = db.attempts.filter((a) => testIds.includes(a.testId));
  const best = bestPerLearner(batchAttempts);

  /*
   * "Completion" = learners with >=1 submitted attempt / eligible members.
   * Eligible means ACTIVE members: a revoked learner can no longer complete
   * anything, so counting them would permanently depress the figure.
   */
  const completed = new Set(
    scored(batchAttempts)
      .filter((a) => activeMemberIds.includes(a.learnerId))
      .map((a) => a.learnerId),
  ).size;

  return ok({
    batchId,
    name: batch.name,
    members: {
      active: activeMemberIds.length,
      removed: members.filter((m) => !m.isActive).length,
    },
    enrollmentFunnel: {
      pending: enrollments.filter((e) => e.status === "pending").length,
      approved: enrollments.filter((e) => e.status === "approved").length,
      rejected: enrollments.filter((e) => e.status === "rejected").length,
    },
    content: {
      courses: db.batchCourses.filter((l) => l.batchId === batchId).length,
      tests: testIds.length,
    },
    performance: {
      avgScorePct: average(best.map((a) => a.percentage ?? 0)),
      passRatePct: passRate(best),
      testCompletionPct: activeMemberIds.length
        ? round1((completed / activeMemberIds.length) * 100)
        : null,
    },
    engagement: {
      activeLast7d: new Set(
        batchAttempts
          .filter((a) => withinDays(a.submittedAt ?? a.startedAt, 7))
          .map((a) => a.learnerId),
      ).size,
    },
  });
}

// ── 3. learner ─────────────────────────────────────────────────────────────

function learnerAnalytics(request, { learnerId }) {
  const auth = requirePermission(request, "analytics:view");
  if (auth.response) return auth.response;

  const learner = db.accounts.find(
    (a) => a.id === learnerId && a.type === "learner",
  );
  if (!learner) return notFound("Learner");

  const attempts = scored(db.attempts.filter((a) => a.learnerId === learnerId));
  const best = bestPerLearner(attempts);

  // one row per test the learner has actually sat
  const testIds = [...new Set(attempts.map((a) => a.testId))];
  const perTest = testIds.map((testId) => {
    const mine = attempts.filter((a) => a.testId === testId);
    const bestPct = Math.max(...mine.map((a) => a.percentage ?? 0));
    return {
      testId,
      title: db.tests.find((t) => t.id === testId)?.title ?? null,
      attempts: mine.length,
      bestScorePct: bestPct,
      passed: mine.some((a) => a.passed),
    };
  });

  const lastActive = attempts
    .map((a) => a.submittedAt ?? a.startedAt)
    .sort()
    .at(-1);

  return ok({
    learnerId,
    fullName: learner.fullName,
    batches: db.activeBatchesFor(learnerId).map((b) => ({
      batchId: b.id,
      name: b.name,
    })),
    summary: {
      testsAttempted: testIds.length,
      avgScorePct: average(best.map((a) => a.percentage ?? 0)),
      passRatePct: passRate(best),
      lastActiveAt: lastActive ?? null,
    },
    perTest,
  });
}

// ── 4. test summary ────────────────────────────────────────────────────────

function testSummary(request, { testId }) {
  const auth = requirePermission(request, "test:view_results");
  if (auth.response) return auth.response;

  const test = db.tests.find((t) => t.id === testId);
  if (!test) return notFound("Test");

  const all = db.attempts.filter((a) => a.testId === testId);
  const terminal = scored(all);
  const best = bestPerLearner(all);

  const durations = terminal
    .filter((a) => a.submittedAt)
    .map(
      (a) =>
        (new Date(a.submittedAt).getTime() - new Date(a.startedAt).getTime()) /
        1000,
    );

  return ok({
    testId,
    title: test.title,
    kind: test.kind,
    attempts: {
      // total counts EVERY attempt, per the contract's note
      total: all.length,
      uniqueLearners: new Set(all.map((a) => a.learnerId)).size,
      submitted: all.filter((a) => a.status === "submitted").length,
      timedOut: all.filter((a) => a.status === "timed_out").length,
    },
    scores: {
      // ...while the score figures use each learner's best
      avgPct: average(best.map((a) => a.percentage ?? 0)),
      medianPct: median(best.map((a) => a.percentage ?? 0)),
      passRatePct: passRate(best),
    },
    avgTimeTakenSeconds: durations.length
      ? Math.round(durations.reduce((s, d) => s + d, 0) / durations.length)
      : null,
  });
}

// ── 5. score distribution ──────────────────────────────────────────────────

/** Ten fixed buckets. The last one is 90-100 so a perfect score has a home. */
const BUCKETS = [
  "0-9", "10-19", "20-29", "30-39", "40-49",
  "50-59", "60-69", "70-79", "80-89", "90-100",
];

function scoreDistribution(request, { testId }) {
  const auth = requirePermission(request, "test:view_results");
  if (auth.response) return auth.response;

  const test = db.tests.find((t) => t.id === testId);
  if (!test) return notFound("Test");

  const counts = new Array(BUCKETS.length).fill(0);

  for (const attempt of bestPerLearner(db.attempts.filter((a) => a.testId === testId))) {
    const pct = attempt.percentage ?? 0;
    // 100 would land in index 10, which does not exist — clamp it into 90-100
    const index = Math.min(Math.floor(pct / 10), BUCKETS.length - 1);
    counts[index] += 1;
  }

  return ok({
    testId,
    // every bucket is returned, including empty ones, so a chart has a stable
    // x-axis regardless of the data
    buckets: BUCKETS.map((range, index) => ({ range, count: counts[index] })),
  });
}

// ── 6. question performance ────────────────────────────────────────────────

function questionPerformance(request, { testId }) {
  const auth = requirePermission(request, "test:view_results");
  if (auth.response) return auth.response;

  const test = db.tests.find((t) => t.id === testId);
  if (!test) return notFound("Test");

  const attempts = scored(db.attempts.filter((a) => a.testId === testId));

  const questions = db.questionsFor(testId).map((question) => {
    const answers = attempts
      .map((a) => a.answers?.[question.id])
      .filter(Boolean);

    const correct = answers.filter((id) => id === question.correctOptionId).length;

    // the most-chosen WRONG option — the signal that flags a bad distractor
    const wrongTally = new Map();
    for (const optionId of answers) {
      if (optionId === question.correctOptionId) continue;
      wrongTally.set(optionId, (wrongTally.get(optionId) ?? 0) + 1);
    }
    const mostChosenWrongOptionId =
      [...wrongTally.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    return {
      questionId: question.id,
      sequence: question.sequence,
      statementEn: question.statement?.en ?? "",
      answered: answers.length,
      correctPct: answers.length
        ? round1((correct / answers.length) * 100)
        : null,
      mostChosenWrongOptionId,
    };
  });

  return ok({ testId, questions });
}

export const analyticsRoutes = [
  { method: "GET", path: "/admin/analytics/platform", handler: platformAnalytics },
  { method: "GET", path: "/admin/analytics/batches/:batchId", handler: batchAnalytics },
  { method: "GET", path: "/admin/analytics/learners/:learnerId", handler: learnerAnalytics },
  { method: "GET", path: "/admin/tests/:testId/analytics/summary", handler: testSummary },
  {
    method: "GET",
    path: "/admin/tests/:testId/analytics/score-distribution",
    handler: scoreDistribution,
  },
  {
    method: "GET",
    path: "/admin/tests/:testId/analytics/question-performance",
    handler: questionPerformance,
  },
];
