import { useMemo } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';

import PerformanceStats from './PerformanceStats.jsx';
import QuestionReviewList from './QuestionReviewList.jsx';
import ResultSummaryCard from './ResultSummaryCard.jsx';
import { dummyTests, dummyResult } from './mockTestDummyData.js';
import { formatDurationSeconds } from './mockTestUtils.js';

export default function ResultScreen() {
  const location = useLocation();
  const { testId } = useParams();

  const routeTest = useMemo(
    () => dummyTests.find((t) => t.testId === testId),
    [testId],
  );

  const test = location.state?.test ?? routeTest ?? null;
  const resultPayload = location.state?.result ?? null;

  const safeResult =
    resultPayload ?? (test?.testId ? buildOfflineSnapshot(test, dummyResult) : null);

  if (!test || !safeResult) {
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
          to={`/mock-tests/${test.testId}`}
          className="flex min-h-[48px] min-w-[10rem] items-center justify-center rounded-[12px] border border-transparent px-5 py-3 text-[0.875rem] text-[#64748B] transition-colors hover:text-[#CBD5E1]"
        >
          ← Back to briefing
        </Link>

        {test.allowReattempt && test.canAttempt && (
          <Link
            to={`/mock-tests/${test.testId}`}
            className="flex min-h-[48px] min-w-[10rem] items-center justify-center rounded-[12px] border border-[rgba(46,191,138,0.35)] bg-[#161F2E] px-6 py-3 text-[0.875rem] font-semibold text-[#2EBF8A] transition-colors hover:bg-[#1C2A3E]"
          >
            Retake Test
          </Link>
        )}

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

/** Demo-only snapshot when GET /result arrives without client exam state. */
function buildOfflineSnapshot(test, tmpl) {
  return {
    ...tmpl,
    testTitle: test.title,
    submittedAt: new Date().toISOString(),
  };
}
