import { useMemo, useState } from 'react';

const TABS = [
  ['all', 'All'],
  ['correct', 'Correct'],
  ['wrong', 'Wrong'],
  ['skipped', 'Skipped'],
];

export default function QuestionReviewList({ questions }) {
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    if (!questions?.length) return [];
    if (filter === 'all') return questions;
    return questions.filter((q) => {
      const skipped = q.selectedOption == null;
      if (filter === 'skipped') return skipped;
      if (filter === 'correct') return !skipped && q.isCorrect;
      if (filter === 'wrong') return !skipped && !q.isCorrect;
      return true;
    });
  }, [filter, questions]);

  return (
    <section className="mt-10">
      <style>{`
        @keyframes cardUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <FilterHeader filter={filter} onFilter={setFilter} />
      <div
        key={filter}
        className="mt-8 space-y-5 opacity-90 transition-opacity duration-200"
        style={{ opacity: 1 }}
      >
        {filtered.map((q, i) => (
          <ReviewQuestionCard key={q.questionId} idx={i} q={q} />
        ))}
        {!filtered.length && (
          <p className="py-14 text-center text-[0.9rem] text-[#64748B]">
            Nothing in this filter — pick another tab.
          </p>
        )}
      </div>
    </section>
  );
}

function FilterHeader({ filter, onFilter }) {
  const tabBtnBase =
    'min-h-[48px] rounded-[11px] border px-5 py-2 text-[0.8125rem] font-medium transition-colors duration-200';

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
      <h2 className="text-[clamp(1rem,2.8vw,1.25rem)] font-bold text-[#F1F5F9]">
        Detailed Review
      </h2>
      <div className="flex flex-wrap gap-2">
        {TABS.map(([id, label]) => {
          const active = filter === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onFilter(id)}
              className={[
                tabBtnBase,
                active
                  ? 'border-[rgba(46,191,138,0.35)] bg-[rgba(46,191,138,0.06)] text-[#2EBF8A]'
                  : 'border-transparent bg-transparent text-[#64748B] hover:text-[#CBD5E1]',
              ].join(' ')}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ReviewQuestionCard({ idx, q }) {
  const letters = ['A', 'B', 'C', 'D'];
  const skipped = q.selectedOption == null;
  let badgeCls =
    'border border-emerald-500/30 bg-emerald-950/40 text-emerald-200 px-3 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.12em]';
  let badge = 'Correct';
  if (skipped) {
    badgeCls =
      'border border-slate-500/35 bg-[#161F2E] text-[#CBD5E1] px-3 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.12em]';
    badge = 'Skipped';
  } else if (!q.isCorrect) {
    badgeCls =
      'border border-rose-500/35 bg-rose-950/45 text-rose-200 px-3 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.12em]';
    badge = 'Incorrect';
  }

  return (
    <article
      className="rounded-[16px] border border-white/[0.06] bg-[#111827] p-5 shadow-[0_24px_48px_rgba(0,0,0,0.5)]"
      style={{
        animationName: 'cardUp',
        animationDuration: '0.42s',
        animationTimingFunction: 'ease-out',
        animationFillMode: 'forwards',
        animationDelay: `${Math.min(idx, 40) * 80}ms`,
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-[#475569]">Q.{idx + 1}</p>
        <span className={badgeCls}>{badge}</span>
      </div>

      <p className="mt-4 text-[clamp(0.9375rem,2.2vw,1.0625rem)] font-medium leading-relaxed text-[#F1F5F9]">
        {q.questionText}
      </p>

      {skipped && (
        <p className="mt-4 text-[0.8125rem] font-medium italic text-[#475569]">
          — Not answered
        </p>
      )}

      <ul className="mt-6 space-y-3">
        {letters.map((L) => {
          const txt = q[`option${L}`];
          const isCorrectLetter = q.correctOption === L;
          const isChosenWrong = q.selectedOption === L && !q.isCorrect;
          let row =
            'border border-white/[0.06] bg-[#161F2E] text-[#94A3B8]';

          if (isCorrectLetter) {
            row =
              'border border-[rgba(46,191,138,0.35)] bg-[rgba(46,191,138,0.08)] text-[#F1F5F9]';
          }

          if (isChosenWrong) {
            row =
              'border border-[rgba(244,63,94,0.35)] bg-[rgba(244,63,94,0.08)] text-[#F1F5F9]';
          }

          let icon = null;
          if (isCorrectLetter) icon = <span className="text-[#2EBF8A]">✓</span>;
          if (isChosenWrong) icon = <span className="text-[#F43F5E]">✗</span>;

          return (
            <li
              key={L}
              className={`flex min-h-[48px] flex-wrap items-center gap-3 rounded-[13px] border px-4 py-3 text-[0.875rem] transition-colors duration-150 ${row}`}
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] border border-white/[0.06] bg-[#1C2A3E] text-[0.8rem] font-bold">
                {L}
              </span>
              <span className="min-w-0 flex-1 leading-relaxed">{txt}</span>
              {icon}
            </li>
          );
        })}
      </ul>

      <div className="mt-6 rounded-[12px] border border-white/[0.06] border-l-[3px] border-l-[#56CFE1] bg-[#161F2E] px-4 py-4">
        <p className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-[#56CFE1]">
          💡 Explanation
        </p>
        <p className="mt-2 text-[0.8625rem] leading-relaxed text-[#94A3B8]">{q.explanation}</p>
      </div>
    </article>
  );
}
