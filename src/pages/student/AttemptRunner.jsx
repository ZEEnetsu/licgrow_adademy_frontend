import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useAttemptTimer } from "./useAttemptTimer.js";
import { ERROR_CODES, getUserMessage } from "../../app/apis/apiError.js";
import {
  useGetAttemptQuery,
  useSaveAnswersMutation,
  useSubmitAttemptMutation,
  ATTEMPT_STATUS,
} from "../../app/apis/submission.api.js";

/**
 * The attempt runner — `api-contracts/10-submission.md` §4–6.
 *
 * Behaviour that matters:
 *  · answers autosave on every selection (§5, ~2/s tier)
 *  · the countdown re-syncs to the server on every save, never drifts alone
 *  · on expiry anywhere, stop and route to the result — the server has
 *    already scored it as `timed_out`
 *  · submit carries an Idempotency-Key, so a double-tap cannot score twice
 *
 * The questions here are `LearnerQuestion`s: no correct option, no
 * explanation. There is nothing in this component's data to leak.
 */
const AttemptRunner = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const { data: attempt, isLoading, isError, error } = useGetAttemptQuery(
    attemptId,
    { skip: !attemptId },
  );

  const [saveAnswers] = useSaveAnswersMutation();
  const [submitAttempt, submitState] = useSubmitAttemptMutation();

  const [answers, setAnswers] = useState({});
  const [serverSeconds, setServerSeconds] = useState(null);
  const [expired, setExpired] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [seededFor, setSeededFor] = useState(null);

  /*
   * Hydrate from the server's saved answers ONCE per attempt, during render
   * rather than in an effect (React's "adjusting state when a prop changes").
   *
   * Keyed on the attempt id, not on the query result: a background refetch
   * hands back a new object, and re-seeding from it would wipe selections the
   * learner has made since — mid-exam.
   */
  if (
    attempt &&
    attempt.status === ATTEMPT_STATUS.IN_PROGRESS &&
    seededFor !== attempt.attemptId
  ) {
    setSeededFor(attempt.attemptId);
    setAnswers(
      Object.fromEntries(
        (attempt.savedAnswers ?? []).map((a) => [a.questionId, a.selectedOptionId]),
      ),
    );
    setServerSeconds(attempt.timeRemainingSeconds ?? null);
  }

  const handleExpire = useCallback(() => setExpired(true), []);
  const timer = useAttemptTimer(serverSeconds, { onExpire: handleExpire });

  // a terminal attempt is a result, not a paper — send them there
  useEffect(() => {
    if (attempt && attempt.status !== ATTEMPT_STATUS.IN_PROGRESS) {
      navigate(`/student/attempts/${attemptId}/result`, { replace: true });
    }
  }, [attempt, attemptId, navigate]);

  const select = async (questionId, optionId) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    setSaveFailed(false);

    try {
      const result = await saveAnswers({
        attemptId,
        answers: [{ questionId, selectedOptionId: optionId }],
      }).unwrap();
      // re-sync the clock to the server on every save
      if (result?.timeRemainingSeconds !== undefined) {
        setServerSeconds(result.timeRemainingSeconds);
      }
    } catch (err) {
      if (
        err?.code === ERROR_CODES.UNPROCESSABLE ||
        err?.code === "ATTEMPT_EXPIRED" ||
        err?.code === "ATTEMPT_NOT_ACTIVE"
      ) {
        setExpired(true);
      } else {
        // a transient failure — the answer is still selected locally, and the
        // next save or the final submit will carry it
        setSaveFailed(true);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      await submitAttempt({
        attemptId,
        testId: attempt?.testId,
        // send everything again: cheap insurance against a dropped autosave
        answers: Object.entries(answers).map(([questionId, selectedOptionId]) => ({
          questionId,
          selectedOptionId,
        })),
      }).unwrap();
      navigate(`/student/attempts/${attemptId}/result`, { replace: true });
    } catch (err) {
      if (err?.code === "ATTEMPT_EXPIRED") {
        navigate(`/student/attempts/${attemptId}/result`, { replace: true });
      }
    }
  };

  const answeredCount = useMemo(
    () => Object.values(answers).filter(Boolean).length,
    [answers],
  );

  if (isLoading) {
    return <p className="text-text-muted text-sm">Loading your paper…</p>;
  }

  if (isError || !attempt) {
    return (
      <div>
        <p className="text-danger text-sm">
          Couldn&apos;t load this attempt — {getUserMessage(error)}
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

  if (attempt.status !== ATTEMPT_STATUS.IN_PROGRESS) return null; // redirecting

  const questions = attempt.questions ?? [];
  const lowTime = timer.isTimed && timer.seconds <= 60;

  return (
    <div className="pb-32">
      <div className="sticky top-0 z-10 -mx-5 px-5 py-3 bg-bg/95 backdrop-blur border-b border-border-muted flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-text-primary">
            {answeredCount} of {questions.length} answered
          </p>
          {saveFailed && (
            <p className="text-[11px] text-warning">
              Couldn&apos;t save that answer — it will be sent when you submit.
            </p>
          )}
        </div>

        {timer.isTimed && (
          <div
            className={`font-mono text-lg tabular-nums ${
              lowTime ? "text-danger" : "text-text-primary"
            }`}
            aria-live={lowTime ? "assertive" : "off"}
          >
            {timer.label}
          </div>
        )}
      </div>

      {expired && (
        <div className="mt-4 rounded-md bg-danger-muted border border-danger/40 px-4 py-3">
          <p className="text-danger text-sm font-semibold">
            Your time is up.
          </p>
          <p className="text-[11px] text-text-muted mt-1">
            Your answers were saved and scored automatically.
          </p>
          <button
            type="button"
            onClick={() =>
              navigate(`/student/attempts/${attemptId}/result`, { replace: true })
            }
            className="mt-2 text-xs text-accent underline cursor-pointer"
          >
            See your result →
          </button>
        </div>
      )}

      <div className="flex flex-col gap-4 mt-6">
        {questions.map((question, index) => (
          <fieldset
            key={question.id}
            disabled={expired}
            className="rounded-lg border border-border-muted bg-surface/40 p-4 disabled:opacity-60"
          >
            <legend className="sr-only">Question {index + 1}</legend>

            <div className="flex items-start justify-between gap-4">
              <p className="text-sm text-text-primary">
                <span className="text-text-muted mr-2">{index + 1}.</span>
                {question.statement}
              </p>
              <span className="text-[11px] text-text-muted shrink-0">
                {question.marks} mark{question.marks === 1 ? "" : "s"}
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-2 mt-4">
              {question.options.map((option) => {
                const chosen = answers[question.id] === option.id;
                return (
                  <label
                    key={option.id}
                    className={`flex items-center gap-3 rounded-md px-4 py-2.5 cursor-pointer transition-colors ${
                      chosen
                        ? "bg-accent/15 border border-accent/50"
                        : "bg-bg border border-transparent hover:border-border-muted"
                    }`}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      checked={chosen}
                      onChange={() => select(question.id, option.id)}
                      className="accent-accent"
                    />
                    <span className="text-sm text-text-primary">{option.text}</span>
                  </label>
                );
              })}
            </div>

            {answers[question.id] && !expired && (
              <button
                type="button"
                onClick={() => select(question.id, null)}
                className="mt-2 text-[11px] text-text-muted hover:text-text-primary cursor-pointer"
              >
                clear answer
              </button>
            )}
          </fieldset>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-border-muted bg-bg/95 backdrop-blur">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
          <p className="text-xs text-text-muted">
            {answeredCount < questions.length
              ? `${questions.length - answeredCount} unanswered`
              : "All questions answered"}
          </p>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitState.isLoading || expired}
            className="px-6 py-2.5 rounded-md bg-accent text-accent-contrast font-semibold text-sm hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {submitState.isLoading ? "Submitting…" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttemptRunner;
