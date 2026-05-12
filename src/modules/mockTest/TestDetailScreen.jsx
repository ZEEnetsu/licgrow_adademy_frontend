import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';

import {
  formatMutationError,
  useGetTestByIdQuery,
  useStartAttemptMutation,
} from '../../store/api/index.js';
import { shadow, transitionHover } from '../../pages/dashboard/styles.js';
import { formatAvailabilityRange } from './mockTestUtils.js';

export default function TestDetailScreen() {
  const { testId } = useParams();
  const navigate = useNavigate();

  const { data: test, isLoading, error } = useGetTestByIdQuery(testId, {
    skip: !testId,
  });
  const [startAttempt, { isLoading: starting }] = useStartAttemptMutation();

  const [ackRead, setAckRead] = useState(false);
  const [ackEnvironment, setAckEnvironment] = useState(false);
  const [ackNavigate, setAckNavigate] = useState(false);
  const allAck = ackRead && ackEnvironment && ackNavigate;
  const [startError, setStartError] = useState(null);

  if (!testId) return <Navigate to="/mock-tests" replace />;

  if (isLoading) {
    return <p className="py-16 text-[#64748B]">Loading briefing…</p>;
  }

  if (error || !test) {
    return (
      <div className="space-y-4">
        <p className="rounded-xl border border-rose-500/30 bg-rose-950/20 px-4 py-3 text-sm text-rose-100">
          {formatMutationError(error)}
        </p>
        <Link to="/mock-tests" className="text-sm text-[#2EBF8A]">
          ← Back to list
        </Link>
      </div>
    );
  }

  const availability = formatAvailabilityRange(test.availableFrom, test.availableUntil);

  const begin = async () => {
    setStartError(null);
    if (!allAck || !test.canAttempt) return;
    try {
      const attempt = await startAttempt(testId).unwrap();
      navigate(`/mock-tests/${test.testId}/exam`, {
        state: {
          test,
          attempt,
          attemptFromApi: true,
        },
      });
    } catch (e) {
      setStartError(formatMutationError(e));
    }
  };

  return (
    <div className="text-[clamp(0.8125rem,2vw,0.875rem)]">
      <Link
        to="/mock-tests"
        className={`mb-6 inline-flex min-h-[48px] items-center gap-2 text-[0.875rem] text-[#64748B] ${transitionHover} hover:text-[#CBD5E1]`}
      >
        ← Back to Mock Tests
      </Link>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section
          className={`rounded-[20px] border border-white/[0.05] bg-[#111827]/40 p-6 sm:p-8 ${shadow.card}`}
        >
          <h1 className="text-[clamp(1.25rem,4vw,1.75rem)] font-bold leading-tight text-[#F1F5F9]">
            {test.title}
          </h1>

          {test.courseTitle ? (
            <span
              className={`mt-4 inline-flex rounded-[10px] border border-[rgba(46,191,138,0.25)] bg-[#161F2E] px-3 py-1.5 text-[0.8125rem] font-medium text-[#2EBF8A]`}
            >
              {test.courseTitle}
            </span>
          ) : null}

          <dl className="mt-8 grid grid-cols-2 gap-4 rounded-[14px] border border-white/[0.05] bg-[#080C14]/40 p-4">
            <div>
              <dt className="text-[0.7rem] font-semibold uppercase tracking-wide text-[#64748B]">
                Questions
              </dt>
              <dd className="mt-1 text-lg font-semibold text-[#F1F5F9]">{test.questionCount}</dd>
            </div>
            <div>
              <dt className="text-[0.7rem] font-semibold uppercase tracking-wide text-[#64748B]">
                Duration
              </dt>
              <dd className="mt-1 text-lg font-semibold text-[#F1F5F9]">{test.durationMinutes} min</dd>
            </div>
            <div>
              <dt className="text-[0.7rem] font-semibold uppercase tracking-wide text-[#64748B]">
                Total marks
              </dt>
              <dd className="mt-1 text-lg font-semibold text-[#F1F5F9]">{test.totalMarks}</dd>
            </div>
            <div>
              <dt className="text-[0.7rem] font-semibold uppercase tracking-wide text-[#64748B]">
                Passing marks
              </dt>
              <dd className="mt-1 text-lg font-semibold text-[#F1F5F9]">{test.passingMarks}</dd>
            </div>
          </dl>

          <div className="mt-6 space-y-2 text-[0.875rem] text-[#64748B]">
            <p className="font-semibold uppercase tracking-[0.12em] text-[#475569]">Availability</p>
            <p>{availability}</p>
          </div>

          {test.attemptsUsed > 0 && (
            <div className="mt-6 rounded-[14px] border border-white/[0.06] bg-[#161F2E]/50 p-4">
              <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-[#64748B]">
                Attempt summary
              </p>
              <p className="mt-2 text-[#CBD5E1]">Attempts used: {test.attemptsUsed}</p>
              {test.lastAttemptResult && (
                <p className="mt-1 text-[#94A3B8]">
                  Last: {test.lastAttemptResult.score} marks · {test.lastAttemptResult.percentage}% ·{' '}
                  {test.lastAttemptResult.passed ? 'Passed' : 'Not passed'}
                </p>
              )}
            </div>
          )}

          {startError ? (
            <p className="mt-4 rounded-md border border-rose-500/30 bg-rose-950/20 px-3 py-2 text-sm text-rose-100">
              {startError}
            </p>
          ) : null}

          <div className="mt-8">
            <button
              type="button"
              disabled={!allAck || !test.canAttempt || starting}
              onClick={begin}
              className={[
                'flex min-h-[48px] w-full items-center justify-center rounded-[12px] border px-5 py-3 text-[0.9375rem] font-semibold transition-[box-shadow,background-color,border-color,color,opacity] duration-200',
                allAck && test.canAttempt && !starting
                  ? 'border-[rgba(46,191,138,0.45)] bg-[#161F2E] text-[#2EBF8A] hover:border-[rgba(46,191,138,0.55)]'
                  : 'cursor-not-allowed border-white/[0.06] bg-[#111827] text-[#475569] opacity-80',
              ].join(' ')}
            >
              {starting ? 'Starting…' : 'Begin Exam'}
            </button>
            {!test.canAttempt && test.canAttemptReason && (
              <p className="mt-3 text-center text-[0.8125rem] text-amber-200/90">{test.canAttemptReason}</p>
            )}
          </div>
        </section>

        <section className={`rounded-[20px] border border-white/[0.05] bg-[#111827] p-6 sm:p-8 ${shadow.card}`}>
          <h2 className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-[#64748B]">
            Exam instructions — read carefully
          </h2>
          <ol className="mt-5 list-decimal space-y-3 pl-5 text-[0.875rem] leading-relaxed text-[#CBD5E1]">
            <li>This exam contains {test.questionCount} questions worth {test.totalMarks} marks total.</li>
            <li>
              You have {test.durationMinutes} minutes to complete the exam. The timer starts immediately when you click
              Begin.
            </li>
            <li>
              The passing score is {test.passingMarks} out of {test.totalMarks} marks.
            </li>
            <li>Questions may be shuffled — your order can differ.</li>
            <li>Each question has exactly one correct answer.</li>
            <li>You can navigate between questions freely.</li>
            <li>Selections sync to the server when you tap an option.</li>
            <li>You can mark questions for review.</li>
            <li>Avoid closing the tab — it may finalize your submission.</li>
            <li>Refreshing during the timer is not supported.</li>
            <li>Once you submit, answers are locked.</li>
          </ol>

          <div className="mt-8 border-t border-white/[0.06] pt-6">
            <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-[#64748B]">Checklist</p>
            <ul className="mt-4 space-y-4">
              <CheckRow
                checked={ackRead}
                onChange={() => setAckRead((v) => !v)}
                label="I have read all instructions carefully"
              />
              <CheckRow
                checked={ackEnvironment}
                onChange={() => setAckEnvironment((v) => !v)}
                label="I am in a quiet environment with stable internet"
              />
              <CheckRow
                checked={ackNavigate}
                onChange={() => setAckNavigate((v) => !v)}
                label="I understand navigating away while the timer runs is risky"
              />
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

function CheckRow({ checked, onChange, label }) {
  return (
    <li className="flex gap-3">
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={onChange}
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-white/[0.12] bg-[#161F2E] text-[0.75rem] text-[#2EBF8A] transition-colors hover:border-[#2EBF8A]/40 ${checked ? 'border-[rgba(46,191,138,0.35)]' : ''}`}
      >
        {checked ? '✓' : ''}
      </button>
      <span className="text-[0.875rem] leading-relaxed text-[#CBD5E1]">{label}</span>
    </li>
  );
}
