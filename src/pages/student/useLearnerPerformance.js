import { useMemo } from "react";

import { useGetMyBatchesQuery } from "../../app/apis/batches.api.js";
import { batchesApi } from "../../app/apis/batches.api.js";
import { useSelector } from "react-redux";

/**
 * A learner's own performance, aggregated client-side.
 *
 * WHY CLIENT-SIDE: 13-analytics.md states plainly that there are "no
 * learner-facing analytics endpoints in v1 — a learner sees their own scores
 * via 10-submission.md". So there is no `/me/analytics` to call, and a
 * cross-test view has to be composed from what the learner IS allowed to read:
 *
 *   GET /me/batches            (06 §13) — which batches they belong to
 *   GET /me/batches/:batchId   (06 §14) — each batch's tests, carrying that
 *                                          learner's own myStatus /
 *                                          myBestScorePct / myAttemptCount
 *
 * The arena already returns per-test attempt state, so one request per batch
 * is enough — no fan-out over individual tests.
 *
 * Every figure uses the learner's BEST attempt, matching how the admin-side
 * analytics count (13's "best attempt unless noted"), so the same learner
 * cannot see one number while staff see another.
 */
export function useLearnerPerformance() {
  const batchesQuery = useGetMyBatchesQuery();
  const batches = useMemo(() => batchesQuery.data ?? [], [batchesQuery.data]);

  /*
   * Read each batch's arena straight from the RTK Query cache. Subscriptions
   * are opened by the component below via useGetMyBatchArenaQuery, so this
   * only selects what is already being fetched — it never triggers a request
   * of its own, and cannot loop.
   */
  const arenas = useSelector((state) =>
    batches.map((batch) =>
      batchesApi.endpoints.getMyBatchArena.select(batch.id)(state),
    ),
  );

  return useMemo(() => {
    const loading =
      batchesQuery.isLoading || arenas.some((a) => a.isLoading || a.isUninitialized);

    // one row per (batch, test), de-duplicated: the same test can be published
    // into more than one batch, and it is still one test to the learner
    const seen = new Map();
    for (const arena of arenas) {
      for (const test of arena.data?.tests ?? []) {
        const existing = seen.get(test.id);
        if (!existing || (test.myBestScorePct ?? -1) > (existing.myBestScorePct ?? -1)) {
          seen.set(test.id, { ...test, batchName: arena.data?.name ?? null });
        }
      }
    }

    const tests = [...seen.values()];
    const attempted = tests.filter((t) => t.myBestScorePct !== null);
    const scores = attempted.map((t) => t.myBestScorePct);

    const passed = attempted.filter(
      (t) => t.passingMarks != null && t.totalMarks
        ? (t.myBestScorePct / 100) * t.totalMarks >= t.passingMarks
        : t.myBestScorePct >= 50,
    );

    const average = scores.length
      ? Math.round(scores.reduce((sum, n) => sum + n, 0) / scores.length)
      : null;

    // a simple trend: the newest half against the oldest half of attempts
    const half = Math.floor(scores.length / 2);
    const trend =
      scores.length >= 4
        ? Math.round(
            scores.slice(0, half).reduce((s, n) => s + n, 0) / half -
              scores.slice(-half).reduce((s, n) => s + n, 0) / half,
          )
        : null;

    return {
      isLoading: loading,
      batches,
      tests,
      attempted,
      notStarted: tests.filter((t) => t.myStatus === "not_started"),
      inProgress: tests.filter((t) => t.myStatus === "in_progress"),
      totalAttempts: tests.reduce((sum, t) => sum + (t.myAttemptCount ?? 0), 0),
      averagePct: average,
      bestPct: scores.length ? Math.max(...scores) : null,
      passRatePct: attempted.length
        ? Math.round((passed.length / attempted.length) * 100)
        : null,
      completionPct: tests.length
        ? Math.round((attempted.length / tests.length) * 100)
        : null,
      trend,
    };
  }, [arenas, batches, batchesQuery.isLoading]);
}
