import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useParams, useSearchParams } from 'react-router-dom';

import PerformanceStats from './PerformanceStats.jsx';
import QuestionReviewList from './QuestionReviewList.jsx';
import ResultSummaryCard from './ResultSummaryCard.jsx';
import { formatMutationError, useLazyGetAttemptResultQuery } from '../../store/api/index.js';
import { formatDurationSeconds } from './mockTestUtils.js';

export default function ResultScreen() {
  const location = useLocation();
  const { testId } = useParams();
  const [params] = useSearchParams();

  const [fetchResult] = useLazyGetAttemptResultQuery();

  const fromStateResult = location.state?.result ?? null;
  const fromStateTest = location.state?.test ?? null;

  const [resolvedResult, setResolvedResult] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [loadPending, setLoadPending] = useState(false);

  const attemptQuery = params.get('attempt');

  useEffect(() => {
    let active = true;
    async function run() {
      if (fromStateResult || !attemptQuery) return;
      setLoadPending(true);
      try {
        const data = await fetchResult(attemptQuery).unwrap();
        if (active) setResolvedResult(data);
      } catch (e) {
        if (active) setLoadError(formatMutationError(e));
      } finally {
        if (active) setLoadPending(false);
      }
    }
    void run();
    return () => {
      active = false;
    };
  }, [attemptQuery, fetchResult, fromStateResult]);

  const safeResult = fromStateResult ?? resolvedResult;

  const effectiveTest =
    fromStateTest ??
    (testId && safeResult
      ? {
          testId,
          title: safeResult.testTitle ?? 'Mock test',
          allowReattempt: true,
          canAttempt: true,
        }
      : null);

  if (loadPending && !safeResult) {
    return <div className="py-16 text-center text-[#64748B]">Loading graded result…</div>;
  }

  if (!safeResult || !effectiveTest) {
    const dest = testId ? `/mock-tests/${testId}` : '/mock-tests';
    return <Navigate to={dest} replace />;
  }

  const stats = tally(safeResult.questions ?? []);

  const formatSubmitted = (iso) =>
    new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));

  return (
    <div className="text-[clamp(0.8125rem,2vw,0.875rem)]">
      {loadError ? (
        <p className="mb-6 rounded-xl border border-rose-500/30 bg-rose-950/20 px-4 py-3 text-sm text-rose-100">
          {loadError}
        </p>
      ) : null}

      <Link
        to="/mock-tests"
        className="inline-flex min-h-[48px] items-center gap-2 text-[0.875rem] text-[#64748B] transition-colors hover:text-[#CBD5E1]"
      >
        ← Back to Tests
      </Link>

      <div className="mt-10">
        <ResultSummaryCard
          result={safeResult}
          formatSubmitted={formatSubmitted}
          formatTaken={(s) => formatDurationSeconds(s)}
        />
      </div>

      <PerformanceStats stats={stats} />

      <QuestionReviewList questions={safeResult.questions ?? []} />

      <footer className="mt-14 flex flex-wrap gap-4">
        <Link
          to={`/mock-tests/${effectiveTest.testId}`}
          className="flex min-h-[48px] min-w-[10rem] items-center justify-center rounded-[12px] border border-transparent px-5 py-3 text-[0.875rem] text-[#64748B] transition-colors hover:text-[#CBD5E1]"
        >
          ← Back to briefing
        </Link>

        {effectiveTest.allowReattempt && effectiveTest.canAttempt ? (
          <Link
            to={`/mock-tests/${effectiveTest.testId}`}
            className="flex min-h-[48px] min-w-[10rem] items-center justify-center rounded-[12px] border border-[rgba(46,191,138,0.35)] bg-[#161F2E] px-6 py-3 text-[0.875rem] font-semibold text-[#2EBF8A] transition-colors hover:bg-[#1C2A3E]"
          >
            Retake Test
          </Link>
        ) : null}

        <button
          type="button"
          className="flex min-h-[48px] min-w-[11rem] items-center justify-center rounded-[12px] border border-white/[0.08] bg-transparent px-6 py-3 text-[0.875rem] text-[#94A3B8] hover:bg-[#111827]"
        >
          Download Result
        </button>
      </footer>
    </div>
  );
}

function tally(questions) {
  let correct = 0;
  let wrong = 0;
  let skipped = 0;
  questions.forEach((q) => {
    if (q.selectedOption == null || q.selectedOption === undefined) skipped += 1;
    else if (q.isCorrect) correct += 1;
    else wrong += 1;
  });

  return { correct, wrong, skipped };
}
