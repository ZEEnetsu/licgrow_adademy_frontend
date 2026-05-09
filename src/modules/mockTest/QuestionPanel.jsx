const letters = ['A', 'B', 'C', 'D'];

/** Left column — current question and options. */
export default function QuestionPanel({
  question,
  questionIndex,
  totalQuestions,
  selectedLetter,
  onSelect,
  marked,
  onToggleMark,
  onPrev,
  onNext,
  showSaved,
}) {
  const options = letters.map((letter) => ({
    letter,
    text: question[`option${letter}`],
  }));

  return (
    <div className="relative flex h-full flex-col border-r border-white/[0.05] bg-[#111827] shadow-[4px_0_24px_rgba(0,0,0,0.35)]">
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#64748B]">
          Question {questionIndex + 1} of {totalQuestions}
        </p>
        <div
          key={question.questionId}
          className="motion-safe:animate-[qfade_0.2s_ease-out]"
        >
          <style>{`
            @keyframes qfade {
              from { opacity: 0.8; transform: translateX(10px); }
              to { opacity: 1; transform: translateX(0); }
            }
          `}</style>
          <p className="mt-4 text-[clamp(1rem,2.5vw,1.1rem)] font-medium leading-[1.8] text-[#F1F5F9]">{question.questionText}</p>

          <div className="mt-8 flex flex-col gap-3">
            {options.map(({ letter, text }) => {
              const selected = selectedLetter === letter;
              return (
                <button
                  key={letter}
                  type="button"
                  onClick={() => onSelect(letter)}
                  className={`flex min-h-[48px] w-full items-stretch rounded-[14px] border text-left transition-all duration-150 ease-out ${selected ? 'border-[rgba(46,191,138,0.35)] bg-[rgba(46,191,138,0.08)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]' : 'border-white/[0.06] bg-[#161F2E] hover:border-white/[0.1] hover:bg-[#1C2A3E]'}`}
                >
                  <span
                    className={`flex w-11 shrink-0 items-center justify-center rounded-l-[13px] text-[0.8125rem] font-bold transition-colors duration-150 ${selected ? 'bg-[#2EBF8A] text-[#0F172A]' : 'bg-[#1C2A3E] text-[#94A3B8]'}`}
                  >
                    {letter}
                  </span>
                  <span
                    className={`flex flex-1 items-center px-4 py-3 text-[0.9375rem] transition-colors duration-150 ${selected ? 'text-[#F1F5F9]' : 'text-[#CBD5E1]'}`}
                  >
                    {text}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.05] bg-[#0f141d]/95 p-4 backdrop-blur-sm">
        <button
          type="button"
          onClick={onPrev}
          disabled={questionIndex === 0}
          className="min-h-[48px] rounded-[11px] px-3 py-2 text-[0.875rem] text-[#64748B] transition-colors hover:text-[#CBD5E1] disabled:pointer-events-none disabled:opacity-40"
        >
          ← Previous
        </button>

        <button
          type="button"
          onClick={onToggleMark}
          className={`min-h-[48px] rounded-[11px] px-4 py-2 text-[0.875rem] font-medium transition-colors ${marked ? 'text-[#F59E0B]' : 'text-[#64748B] hover:text-[#94A3B8]'}`}
        >
          🚩 {marked ? 'Marked for review' : 'Mark for Review'}
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={questionIndex >= totalQuestions - 1}
          className="min-h-[48px] rounded-[11px] border border-white/[0.08] bg-[#161F2E] px-5 py-2 text-[0.875rem] text-[#CBD5E1] transition-colors hover:bg-[#1C2A3E] hover:text-[#F1F5F9] disabled:pointer-events-none disabled:opacity-40"
        >
          Next →
        </button>
      </div>

      {showSaved && (
        <p className="pointer-events-none absolute bottom-[5.75rem] right-5 text-[0.75rem] font-medium text-[#2EBF8A] motion-safe:animate-[savedpop_2.4s_ease-out_forwards]">
          <style>{`
            @keyframes savedpop {
              0% { opacity: 0; transform: translateY(6px); }
              10% { opacity: 1; transform: translateY(0); }
              72% { opacity: 1; }
              100% { opacity: 0; }
            }
          `}</style>
          ● Saved
        </p>
      )}
    </div>
  );
}
