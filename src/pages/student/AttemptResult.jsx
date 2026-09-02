import { useNavigate, useParams } from "react-router-dom";

import { getUserMessage } from "../../app/apis/apiError.js";
import {
  useGetAttemptQuery,
  ATTEMPT_STATUS,
} from "../../app/apis/submission.api.js";

/**
 * Attempt result — `api-contracts/10-submission.md` §4/§6.
 *
 * The reveal policy decides what is even in the payload:
 *   quiz  → `immediate`   — full per-question review right away
 *   test  → `after_close` — score only until `availableUntil` passes
 *
 * When review is withheld the server sends `review: null` plus
 * `reviewAvailableAt`. There is nothing to un-hide client-side, which is the
 * point: the answer key never crosses the wire early.
 */
const AttemptResult = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const { data: result, isLoading, isError, error } = useGetAttemptQuery(
    attemptId,
    { skip: !attemptId },
  );

  if (isLoading) {
    return <p className="text-text-muted text-sm">Loading your result…</p>;
  }

  if (isError || !result) {
    return (
      <div>
        <p className="text-danger text-sm">
          Couldn&apos;t load this result — {getUserMessage(error)}
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

  // still running — the runner owns this attempt, not the result view
  if (result.status === ATTEMPT_STATUS.IN_PROGRESS) {
    navigate(`/student/attempts/${attemptId}`, { replace: true });
    return null;
  }

  const timedOut = result.status === ATTEMPT_STATUS.TIMED_OUT;

  return (
    <div className="max-w-2xl">
      <button
        type="button"
        onClick={() => navigate(`/student/tests/${result.testId}`)}
        className="text-sm text-text-muted hover:text-text-primary cursor-pointer"
      >
        ← Back to the test
      </button>

      <div
        className={`mt-4 rounded-lg border p-6 ${
          result.passed
            ? "bg-success-muted border-success/40"
            : "bg-danger-muted border-danger/40"
        }`}
      >
        <p className="text-xs uppercase tracking-wide text-text-muted">
          Attempt {result.attemptNumber}
          {timedOut && " · timed out"}
        </p>
        <p
          className={`text-4xl font-semibold mt-2 ${
            result.passed ? "text-success" : "text-danger"
          }`}
        >
          {result.percentage}%
        </p>
        <p className="text-sm text-text-muted mt-1">
          {result.score} of {result.totalMarks} marks ·{" "}
          {result.passed ? "Passed" : "Not passed"}
        </p>
        {timedOut && (
          <p className="text-[11px] text-text-muted mt-3">
            Time ran out. Your saved answers were scored automatically.
          </p>
        )}
      </div>

      {result.review === null ? (
        <div className="mt-6 rounded-md border border-border-muted px-4 py-3">
          <p className="text-sm text-text-primary">
            Answers unlock when the test closes.
          </p>
          {result.reviewAvailableAt && (
            <p className="text-[11px] text-text-muted mt-1">
              Review available after {result.reviewAvailableAt.slice(0, 10)}.
            </p>
          )}
        </div>
      ) : (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
            Review
          </h2>
          <div className="flex flex-col gap-3 mt-3">
            {result.review.map((item, index) => (
              <div
                key={item.questionId}
                className={`rounded-lg border p-4 ${
                  item.isCorrect
                    ? "border-success/40 bg-success-muted"
                    : "border-danger/40 bg-danger-muted"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm text-text-primary">
                    <span className="text-text-muted mr-2">{index + 1}.</span>
                    {item.isCorrect ? "Correct" : "Incorrect"}
                  </p>
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wide ${
                      item.isCorrect ? "text-success" : "text-danger"
                    }`}
                  >
                    {item.isCorrect ? "✓" : "✕"}
                  </span>
                </div>

                {!item.isCorrect && (
                  <p className="text-[11px] text-text-muted mt-2">
                    {item.yourOptionId
                      ? "Your answer was incorrect."
                      : "You didn't answer this question."}
                  </p>
                )}

                {item.explanation && (
                  <p className="text-xs text-text-muted mt-2 border-l-2 border-border-muted pl-3">
                    {item.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default AttemptResult;
