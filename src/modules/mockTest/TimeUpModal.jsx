export default function TimeUpModal({ open, onViewResult }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[85] flex items-center justify-center bg-black/70 px-4 backdrop-blur-[4px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="timeup-title"
    >
      <div className="motion-safe:animate-[modalIn_0.2s_ease-out]" style={{ maxWidth: 420, width: '100%' }}>
        <style>{`
          @keyframes modalIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>
        <div className="rounded-[20px] border border-white/[0.08] bg-[#111827] shadow-[0_24px_64px_rgba(0,0,0,0.65)]">
          <div className="p-7">
            <h2 id="timeup-title" className="text-[1.125rem] font-bold text-[#F43F5E]">
              Time&apos;s Up!
            </h2>
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-[#CBD5E1]">
              Your exam has been automatically submitted with all answers recorded up to this point.
            </p>
            <button
              type="button"
              onClick={onViewResult}
              className="mt-8 flex min-h-[48px] w-full items-center justify-center rounded-[12px] border border-[rgba(46,191,138,0.35)] bg-[#161F2E] px-5 py-2.5 text-[0.925rem] font-semibold text-[#2EBF8A]"
            >
              View My Result
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
