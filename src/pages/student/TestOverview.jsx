import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { getUserMessage } from "../../app/apis/apiError.js";
import {
  useGetAttemptHistoryQuery,
  useGetTestOverviewQuery,
  useStartAttemptMutation,
  START_BLOCKED,
} from "../../app/apis/submission.api.js";

/**
 * Pre-attempt screen — `api-contracts/10-submission.md` §1–3.
 *
 * Implements the contract's canonical flow verbatim: read the overview, and if
 * `activeAttemptId` is set, RESUME it rather than starting a new one. That is
 * how the 409 `ATTEMPT_IN_PROGRESS` is avoided instead of handled.
 *
 * `startBlockedReason` is precomputed server-side, so the button can be
 * disabled with a real explanation rather than by guessing.
 */

const BLOCKED_COPY = {
  [START_BLOCKED.NO_ATTEMPTS_LEFT]: "You have used all your attempts.",
  [START_BLOCKED.COOLDOWN]: "Please wait before your next attempt.",
  [START_BLOCKED.WINDOW_CLOSED]: "This test isn't open right now.",
  [START_BLOCKED.ATTEMPT_IN_PROGRESS]: "You have an attempt in progress.",
};

const STATUS_COPY = {
  submitted: "submitted",
  timed_out: "timed out",
};

const TestOverview = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const lang = searchParams.get("lang") ?? "en";

  const { data: test, isLoading, isError, error } = useGetTestOverviewQuery(testId, {
    skip: !testId,
  });
  const { data: history } = useGetAttemptHistoryQuery({ testId }, { skip: !testId });
  const [startAttempt, startState] = useStartAttemptMutation();

  if (isLoading) {
    return <p className="text-text-muted text-sm">Loading…</p>;
  }

  if (isError || !test) {
    return (
      <div>
        <p className="text-danger text-sm">
          Couldn&apos;t load this test — {getUserMessage(error)}
        </p>
        <button
          type="button"
          onClick={() => navigate("/student")}
          className="mt-3 text-sm text-accent underline cursor-pointer"
        >
          Back to my batches
        </button>
      </div>
    );
  }

  const resume = () => navigate(`/student/attempts/${test.activeAttemptId}`);

  const start = async () => {
    try {
      const attempt = await startAttempt({ testId, lang }).unwrap();
      navigate(`/student/attempts/${attempt.attemptId}`);
    } catch (err) {
      // the canonical flow should prevent this, but a race is still possible
      if (err?.code === "ATTEMPT_IN_PROGRESS" && err.activeAttemptId) {
        navigate(`/student/attempts/${err.activeAttemptId}`);
      }
    }
  };

  const attempts = history?.items ?? [];

  return (
    <div className="max-w-2xl">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="text-sm text-text-muted hover:text-text-primary cursor-pointer"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-semibold mt-3">{test.title}</h1>
      {test.description && (
        <p className="text-sm text-text-muted mt-2">{test.description}</p>
      )}

      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        <Stat label="Duration" value={test.durationMinutes ? `${test.durationMinutes} min` : "Untimed"} />
        <Stat label="Total marks" value={test.totalMarks} />
        <Stat label="Pass mark" value={test.passingMarks} />
        <Stat
          label="Attempts"
          value={
            test.maxAttempts === null
              ? `${test.attemptsUsed} used · unlimited`
              : `${test.attemptsUsed} of ${test.maxAttempts}`
          }
        />
      </dl>

      {test.myBestScorePct !== null && (
        <p className="text-sm text-text-muted mt-4">
          Your best so far: <strong className="text-accent">{test.myBestScorePct}%</strong>
        </p>
      )}

      <div className="mt-6">
        {test.activeAttemptId ? (
          <>
            <button
              type="button"
              onClick={resume}
              className="px-6 py-3 rounded-md bg-accent/20 text-accent font-medium hover:bg-accent/30 transition-colors cursor-pointer"
            >
              Resume your attempt
            </button>
            <p className="text-[11px] text-text-muted mt-2">
              You have an attempt in progress. Resume it rather than starting a
              new one.
            </p>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={start}
              disabled={!test.canStart || startState.isLoading}
              className="px-6 py-3 rounded-md bg-accent text-accent-contrast font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {startState.isLoading ? "Starting…" : "Start attempt"}
            </button>
            {test.startBlockedReason && (
              <p className="text-[11px] text-warning mt-2">
                {BLOCKED_COPY[test.startBlockedReason] ?? "You can't start right now."}
              </p>
            )}
          </>
        )}
      </div>

      {test.window && !test.window.isOpen && (
        <p className="text-[11px] text-text-muted mt-3">
          Window: {test.window.availableFrom?.slice(0, 10) ?? "—"} to{" "}
          {test.window.availableUntil?.slice(0, 10) ?? "—"}
        </p>
      )}

      {attempts.length > 0 && (
        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
            Your attempts
          </h2>
          <div className="flex flex-col gap-2 mt-3">
            {attempts.map((attempt) => (
              <button
                key={attempt.attemptId}
                type="button"
                onClick={() =>
                  navigate(`/student/attempts/${attempt.attemptId}/result`)
                }
                className="flex items-center justify-between gap-4 rounded-lg border border-border-muted p-3 text-left hover:bg-surface transition-colors cursor-pointer"
              >
                <div>
                  <p className="text-sm text-text-primary">
                    Attempt {attempt.attemptNumber}
                    <span className="text-text-muted">
                      {" "}
                      · {STATUS_COPY[attempt.status] ?? attempt.status}
                    </span>
                  </p>
                  <p className="text-[11px] text-text-muted">
                    {attempt.startedAt?.slice(0, 10)}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-semibold ${
                      attempt.passed ? "text-success" : "text-danger"
                    }`}
                  >
                    {attempt.percentage}%
                  </p>
                  <p className="text-[11px] text-text-muted">
                    {attempt.score}/{attempt.totalMarks}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {test.leaderboardEnabled && (
        <button
          type="button"
          disabled={!test.leaderboardOpen}
          onClick={() => navigate(`/student/tests/${testId}/leaderboard`)}
          title={
            test.leaderboardOpen
              ? undefined
              : "The leaderboard opens when the test closes"
          }
          className="mt-8 text-sm text-accent hover:underline disabled:text-text-muted disabled:no-underline disabled:cursor-not-allowed cursor-pointer"
        >
          {test.leaderboardOpen
            ? "View leaderboard →"
            : "Leaderboard opens when the test closes"}
        </button>
      )}
    </div>
  );
};

const Stat = ({ label, value }) => (
  <div>
    <dt className="text-[11px] uppercase tracking-wide text-text-muted">
      {label}
    </dt>
    <dd className="text-sm text-text-primary mt-0.5">{value}</dd>
  </div>
);

export default TestOverview;
