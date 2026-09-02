import { NavLink } from "react-router-dom";

import {
  Card,
  EmptyState,
  InteractiveCard,
  Pill,
  ScoreBar,
  SectionTitle,
} from "../../components/ui/Surface.jsx";
import { useLearnerPerformance } from "./useLearnerPerformance.js";
import {
  useGetMyBatchArenaQuery,
  useGetMyBatchesQuery,
} from "../../app/apis/batches.api.js";
import { useGetAttemptHistoryQuery } from "../../app/apis/submission.api.js";

/**
 * Test history — every test available to the learner, with their attempts.
 *
 * Composed the same way as the dashboard: the arenas (06 §14) supply the test
 * list and best score, and each attempted test's individual attempts come from
 * 10 §2. Only tests the learner has actually sat are expanded, so an untouched
 * catalogue costs no extra requests.
 */

const ArenaSubscription = ({ batchId }) => {
  useGetMyBatchArenaQuery(batchId);
  return null;
};

/** One test's attempt list — 10 §2, newest first. */
const AttemptRows = ({ testId }) => {
  const { data, isLoading } = useGetAttemptHistoryQuery({ testId });

  if (isLoading) {
    return <p className="text-[11px] text-text-muted px-3 py-2">Loading…</p>;
  }

  const attempts = data?.items ?? [];
  if (attempts.length === 0) return null;

  return (
    <div className="flex flex-col gap-1 mt-3 pt-3 border-t border-border">
      {attempts.map((attempt) => (
        <NavLink
          key={attempt.attemptId}
          to={`/student/attempts/${attempt.attemptId}/result`}
          className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-bg transition-colors"
        >
          <span className="text-[11px] text-text-muted w-16 shrink-0">
            Attempt {attempt.attemptNumber}
          </span>
          <span className="text-[11px] text-text-muted flex-1 truncate">
            {attempt.startedAt?.slice(0, 10)}
            {attempt.status === "timed_out" && " · timed out"}
          </span>
          <span
            className={`text-xs font-semibold shrink-0 ${
              attempt.passed
                ? "text-success"
                : "text-danger"
            }`}
          >
            {attempt.percentage}%
          </span>
          <span className="text-[11px] text-text-muted shrink-0 w-14 text-right">
            {attempt.score}/{attempt.totalMarks}
          </span>
        </NavLink>
      ))}
    </div>
  );
};

const TestHistory = () => {
  const { data: batches = [] } = useGetMyBatchesQuery();
  const { tests, attempted, isLoading } = useLearnerPerformance();

  const subscriptions = batches.map((batch) => (
    <ArenaSubscription key={batch.id} batchId={batch.id} />
  ));

  if (isLoading) {
    return (
      <>
        {subscriptions}
        <p className="text-text-muted text-sm">Loading your history…</p>
      </>
    );
  }

  if (tests.length === 0) {
    return (
      <>
        {subscriptions}
        <EmptyState
          title="No tests yet"
          hint="Tests appear here once they're published into your batch."
        />
      </>
    );
  }

  const untouched = tests.filter((t) => t.myBestScorePct === null);

  return (
    <div>
      {subscriptions}

      <h1 className="text-2xl font-semibold text-text-primary">Test history</h1>
      <p className="text-sm text-text-muted mt-1">
        {attempted.length} of {tests.length} tests attempted.
      </p>

      {attempted.length > 0 && (
        <div className="mt-6">
          <SectionTitle>Attempted</SectionTitle>
          <div className="flex flex-col gap-3">
            {attempted.map((test) => {
              const passed = test.totalMarks
                ? (test.myBestScorePct / 100) * test.totalMarks >=
                  (test.passingMarks ?? 0)
                : false;

              return (
                <Card key={test.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <NavLink
                        to={`/student/tests/${test.id}`}
                        className="text-sm text-text-primary hover:text-accent transition-colors"
                      >
                        {test.title}
                      </NavLink>
                      <p className="text-[11px] text-text-muted mt-0.5">
                        {test.batchName}
                      </p>
                    </div>
                    <Pill tone={passed ? "good" : "bad"}>
                      best {test.myBestScorePct}%
                    </Pill>
                  </div>

                  <div className="mt-3">
                    <ScoreBar
                      percentage={test.myBestScorePct}
                      passed={passed}
                    />
                  </div>

                  <AttemptRows testId={test.id} />
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {untouched.length > 0 && (
        <div className="mt-8">
          <SectionTitle>Not yet attempted</SectionTitle>
          <div className="flex flex-col gap-2">
            {untouched.map((test) => (
              <InteractiveCard
                key={test.id}
                as={NavLink}
                to={`/student/tests/${test.id}`}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm text-text-primary truncate">
                    {test.title}
                  </p>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    {test.batchName}
                    {test.durationMinutes
                      ? ` · ${test.durationMinutes} min`
                      : " · untimed"}
                  </p>
                </div>
                <Pill
                  tone={test.myStatus === "in_progress" ? "warn" : "neutral"}
                >
                  {test.myStatus === "in_progress" ? "resume" : "start"}
                </Pill>
              </InteractiveCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestHistory;
