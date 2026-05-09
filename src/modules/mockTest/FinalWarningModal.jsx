export default function FinalWarningModal({ open, tabSwitchCount, onAcknowledge }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center bg-black/75 px-4 backdrop-blur-[4px]"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="final-warning-title"
    >
      <div className="motion-safe:animate-[modalIn_0.2s_ease-out]" style={{ maxWidth: 440, width: '100%' }}>
        <style>{`
          @keyframes modalIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>
        <div className="rounded-[20px] border border-amber-500/35 bg-[#111827] shadow-[0_24px_64px_rgba(0,0,0,0.75)]">
          <div className="p-7">
            <h2 id="final-warning-title" className="text-[1.05rem] font-bold text-amber-200">
              Repeated tab switches detected
            </h2>
            <p className="mt-4 text-[0.9rem] leading-relaxed text-[#CBD5E1]">
              We have recorded {tabSwitchCount} attempt(s) to leave this exam surface. LICPro Academy discourages unfair
              means; continued violations may affect your eligibility. Please stay focused and complete your paper
              fairly.
            </p>
            <button
              type="button"
              onClick={onAcknowledge}
              className="mt-8 flex min-h-[48px] w-full items-center justify-center rounded-[12px] border border-[rgba(46,191,138,0.35)] bg-[#161F2E] px-5 py-2.5 text-[0.9125rem] font-semibold text-[#2EBF8A]"
            >
              I understand — continue exam
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
