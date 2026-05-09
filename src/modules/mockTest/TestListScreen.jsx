import { Link } from 'react-router-dom';

import { shadow, transitionHover } from '../../pages/dashboard/styles.js';
import { dummyTests } from './mockTestDummyData.js';

const cardBase =
  `group flex flex-col rounded-[16px] border border-white/[0.05] bg-[#111827] p-5 ${shadow.card} ${transitionHover} min-h-[48px]`;

export default function TestListScreen() {
  const subtitle = dummyTests[0]?.courseTitle ?? 'Your course';

  return (
    <div className="text-[clamp(0.8125rem,2vw,0.9375rem)]">
      <header className="mb-8">
        <h1 className="text-[clamp(1.5rem,4vw,1.875rem)] font-semibold tracking-tight text-[#F1F5F9]">
          Mock Tests
        </h1>
        <p className="mt-2 text-[clamp(0.8125rem,2vw,0.875rem)] text-[#64748B]">{subtitle}</p>
      </header>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {dummyTests.map((test) => (
          <article
            key={test.testId}
            className={`${cardBase} hover:border-white/[0.08] hover:bg-[#161F2E] hover:shadow-[0_8px_24px_rgba(0,0,0,0.5),0_2px_8px_rgba(0,0,0,0.7)]`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h2 className="max-w-[calc(100%-8rem)] text-[clamp(1rem,2.5vw,1.125rem)] font-semibold leading-snug text-[#F1F5F9]">
                {test.title}
              </h2>
              <StatusChip test={test} />
            </div>

            <p className="mt-4 text-[0.8125rem] leading-relaxed text-[#64748B]">
              {test.questionCount} questions · {test.durationMinutes} min · {test.totalMarks} marks
            </p>
            <p className="mt-1 text-[0.8125rem] text-[#64748B]">
              Pass: {test.passingMarks} / {test.totalMarks}
            </p>

            <p className="mt-3 text-[0.8125rem] text-[#64748B]">
              Attempts used: {test.attemptsUsed}
              {test.maxAttempts != null ? ` · Max: ${test.maxAttempts}` : ''}
            </p>

            {test.lastAttemptResult && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full border border-[#2EBF8A]/30 bg-[#2EBF8A]/10 px-3 py-1 text-[0.75rem] font-medium text-[#2EBF8A]">
                  Score {test.lastAttemptResult.score}
                </span>
                <span className="text-[0.8125rem] text-[#94A3B8]">{test.lastAttemptResult.percentage}%</span>
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-[0.6875rem] font-semibold uppercase tracking-wide ${test.lastAttemptResult.passed ? 'border-emerald-500/30 bg-emerald-950/35 text-emerald-300' : 'border-rose-500/30 bg-rose-950/35 text-rose-300'}`}
                >
                  {test.lastAttemptResult.passed ? 'Passed' : 'Failed'}
                </span>
              </div>
            )}

            <div className="mt-6 border-t border-white/[0.04] pt-5">
              {test.canAttempt ? (
                <Link
                  to={`/mock-tests/${test.testId}`}
                  className={`flex min-h-[48px] items-center justify-center rounded-[12px] border border-[rgba(46,191,138,0.3)] bg-[#161F2E] px-5 py-2.5 text-center text-[0.875rem] font-medium text-[#2EBF8A] ${transitionHover} hover:border-[rgba(46,191,138,0.45)]`}
                >
                  Start Test
                </Link>
              ) : (
                <span title={test.canAttemptReason || 'Unavailable'} className="block w-full">
                  <button
                    type="button"
                    disabled
                    className="flex min-h-[48px] w-full cursor-not-allowed items-center justify-center rounded-[12px] border border-white/[0.04] bg-[#1C2A3E] px-5 py-2.5 text-center text-[0.875rem] text-[#475569]"
                  >
                    Start Test
                  </button>
                </span>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

/** @param {{ test: typeof dummyTests[number] }} props */
function StatusChip({ test }) {
  if (!test.canAttempt) {
    return (
      <span className="shrink-0 rounded-full border border-amber-500/25 bg-amber-950/30 px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-wide text-amber-200">
        Locked
      </span>
    );
  }
  if (test.lastAttemptResult?.passed === false && test.allowReattempt) {
    return (
      <span className="shrink-0 rounded-full border border-[#2EBF8A]/25 bg-[#2EBF8A]/10 px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-wide text-[#2EBF8A]">
        Retry
      </span>
    );
  }
  if (test.attemptsUsed === 0) {
    return (
      <span className="shrink-0 rounded-full border border-sky-500/25 bg-sky-950/30 px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-wide text-sky-200">
        New
      </span>
    );
  }
  return (
    <span className="shrink-0 rounded-full border border-emerald-500/25 bg-emerald-950/25 px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-wide text-emerald-300">
      Open
    </span>
  );
}
