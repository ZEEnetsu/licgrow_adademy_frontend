import { transitionHover } from '../../pages/dashboard/styles.js';

/**
 * @param {{
 *   examQuestions: Array<{ questionId: string }>,
 *   currentIndex: number,
 *   answers: Record<string, string | undefined>,
 *   markedForReview: Set<string>,
 *   visitedQuestions: Set<number>,
 *   onJump: (index: number) => void,
 *   onSubmitClick: () => void,
 *   mobileSheet?: boolean,
 *   onCloseSheet?: () => void,
 * }} props
 */
export default function QuestionNavigator({
  examQuestions,
  currentIndex,
  answers,
  markedForReview,
  visitedQuestions,
  onJump,
  onSubmitClick,
  mobileSheet,
  onCloseSheet,
}) {
  const total = examQuestions.length;
  const cols = mobileSheet ? 'grid-cols-6' : 'grid-cols-5';

  let answered = 0;
  examQuestions.forEach((q) => {
    if (answers[q.questionId]) answered += 1;
  });
  let markedCount = 0;
  examQuestions.forEach((q) => {
    if (markedForReview.has(q.questionId)) markedCount += 1;
  });
  const unanswered = Math.max(total - answered, 0);

  const gridBtn = `min-h-[48px] rounded-[11px] border text-[0.8125rem] font-semibold transition-[background-color,border-color,color,box-shadow] duration-150`;

  return (
    <aside
      className={[
        'flex flex-col bg-[#0D1117] lg:max-w-[320px] lg:flex-[0_0_30%] lg:border-l lg:border-white/[0.05]',
        mobileSheet
          ? 'fixed inset-x-0 bottom-0 z-[60] max-h-[70vh] rounded-t-[22px] border-t border-white/[0.06] shadow-[0_-12px_48px_rgba(0,0,0,0.55)] lg:hidden'
          : 'hidden lg:flex',
      ].join(' ')}
      aria-label="Question navigator"
    >
      {mobileSheet && (
        <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#64748B]">Navigator</p>
          <button
            type="button"
            onClick={onCloseSheet}
            className="min-h-[48px] min-w-[48px] rounded-[10px] text-[1.125rem] text-[#64748B] hover:bg-[#111827]"
            aria-label="Close navigator"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-5 lg:px-6">
        <p className="hidden text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#64748B] lg:block">
          Question Navigator
        </p>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[0.6875rem] font-medium text-[#64748B]">
          <Legend swatchClass="bg-[#2EBF8A]" label="Answered" square />
          <Legend swatchClass="bg-[#F59E0B]" label="Marked" square />
          <Legend swatchClass="bg-[#1C2A3E]" label="Not visited" square />
          <Legend
            swatchClass="border border-[#2EBF8A] bg-[rgba(46,191,138,0.25)]"
            label="Current"
            square
          />
        </div>

        <div className={`mt-5 grid ${cols} gap-2`}>
          {examQuestions.map((q, i) => {
            const isAnswered = Boolean(answers[q.questionId]);
            const isMarked = markedForReview.has(q.questionId);
            const isVisited = visitedQuestions.has(i);
            const isCurrent = i === currentIndex;

            let cls =
              'border border-white/[0.05] bg-[#1C2A3E] text-[#475569] hover:border-white/[0.1]';
            if (isCurrent) {
              cls =
                'border border-[#2EBF8A] bg-[rgba(46,191,138,0.25)] text-[#F1F5F9] font-semibold shadow-[0_0_0_1px_rgba(46,191,138,0.2)]';
            } else if (isMarked && isAnswered) {
              cls =
                'border border-[rgba(245,158,11,0.3)] bg-[rgba(245,158,11,0.15)] text-[#F59E0B]';
            } else if (isMarked) {
              cls =
                'border border-[rgba(245,158,11,0.3)] bg-[rgba(245,158,11,0.15)] text-[#F59E0B]';
            } else if (isAnswered) {
              cls =
                'border border-[rgba(46,191,138,0.3)] bg-[rgba(46,191,138,0.15)] text-[#2EBF8A]';
            } else if (!isVisited) {
              cls =
                'border border-white/[0.05] bg-[#1C2A3E] text-[#475569] hover:border-white/[0.1]';
            } else {
              cls =
                'border border-white/[0.08] bg-[#161F2E] text-[#CBD5E1] hover:border-white/[0.12]';
            }

            return (
              <button
                key={q.questionId}
                type="button"
                onClick={() => {
                  onJump(i);
                  onCloseSheet?.();
                }}
                className={`${gridBtn} ${cls}`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        <div className="mt-6 space-y-2 text-[0.8125rem] font-medium">
          <p className="text-[#2EBF8A]">{answered} Answered</p>
          <p className="text-[#F59E0B]">{markedCount} Marked</p>
          <p className="text-[#64748B]">{unanswered} Unanswered</p>
        </div>

        <button
          type="button"
          onClick={() => {
            onSubmitClick();
            onCloseSheet?.();
          }}
          className={`mt-8 min-h-[48px] rounded-[12px] border border-[rgba(46,191,138,0.3)] bg-[#161F2E] px-4 py-3 text-[0.875rem] font-medium text-[#2EBF8A] ${transitionHover} hover:border-[rgba(46,191,138,0.45)]`}
        >
          Submit Test
        </button>
      </div>
    </aside>
  );
}

function Legend({ swatchClass, label, square }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={`h-3.5 w-3.5 shrink-0 rounded-[3px] ${square ? '' : 'rounded-full'} ${swatchClass}`}
      />
      {label}
    </span>
  );
}
