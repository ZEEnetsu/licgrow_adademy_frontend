export default function SubmitConfirmModal({
  open,
  answeredCount,
  totalQuestions,
  markedCount,
  onClose,
  onConfirmSubmit,
}) {
  if (!open) return null;
  const unanswered = Math.max(totalQuestions - answeredCount, 0);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-[4px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="submit-exam-title"
    >
      <div className="motion-safe:animate-[modalIn_0.2s_ease-out]" style={{ maxWidth: 420, width: '100%' }}>
        <style>{`
          @keyframes modalIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>
        <div className="rounded-[20px] border border-white/[0.08] bg-[#111827] shadow-[0_24px_64px_rgba(0,0,0,0.65)]">
          <div className="p-6 sm:p-7">
            <h2 id="submit-exam-title" className="text-[1.125rem] font-bold text-[#F1F5F9]">
              Submit Exam?
            </h2>
            <ul className="mt-5 space-y-2 text-[0.875rem] text-[#CBD5E1]">
              <li>
                Answered: {answeredCount} of {totalQuestions} questions
              </li>
              <li>
                Unanswered: {unanswered} questions
              </li>
              {unanswered > 0 && (
                <li className="rounded-[10px] border border-amber-500/30 bg-amber-950/35 px-3 py-2 text-[0.8125rem] text-amber-100">
                  Unanswered questions will be marked as incorrect
                </li>
              )}
              <li>Marked for review: {markedCount} questions</li>
            </ul>

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[48px] flex-1 rounded-[12px] border border-white/[0.08] bg-[#161F2E] px-5 py-2.5 text-[0.875rem] text-[#CBD5E1] hover:bg-[#1C2A3E] sm:flex-initial"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={onConfirmSubmit}
                className="min-h-[48px] flex-1 rounded-[12px] border border-[rgba(46,191,138,0.35)] bg-[#161F2E] px-5 py-2.5 text-[0.875rem] font-semibold text-[#2EBF8A] hover:border-[rgba(46,191,138,0.5)] sm:flex-initial"
              >
                Submit Final
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
