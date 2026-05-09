import { ShieldIcon } from '../../pages/dashboard/ShieldIcon.jsx';
import { transitionHover } from '../../pages/dashboard/styles.js';

function pad2(n) {
  return String(n).padStart(2, '0');
}

export function formatCountdown(seconds) {
  const s = Math.max(0, Math.floor(seconds));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${pad2(mm)}:${pad2(ss)}`;
}

/**
 * Fixed exam header bar.
 */
export default function ExamHeader({
  testTitle,
  answeredCount,
  totalQuestions,
  timeRemainingSeconds,
  onSubmitClick,
  tabSwitchCount,
}) {
  const sec = Math.max(0, timeRemainingSeconds);

  let timerClass = 'text-[#2EBF8A]';
  if (sec <= 600 && sec > 300) {
    timerClass =
      'text-[#F59E0B] motion-safe:animate-[pulse-soft_2s_ease-in-out_infinite]';
  } else if (sec <= 300) {
    timerClass =
      'text-[#F43F5E] motion-safe:animate-[pulse-fast_1s_ease-in-out_infinite] motion-safe:animate-[shake-30s_30s_ease-in-out_infinite]';
  }

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/[0.06] bg-[#0D1117] shadow-[0_8px_24px_rgba(0,0,0,0.45)]">
      <style>{`
        @keyframes pulse-soft { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
        @keyframes pulse-fast { 0%, 100% { opacity: 1; } 50% { opacity: 0.55; } }
        @keyframes shake-30s {
          0%, 96% { transform: translateX(0); }
          97% { transform: translateX(-3px); }
          98% { transform: translateX(3px); }
          99% { transform: translateX(-2px); }
          100% { transform: translateX(0); }
        }
      `}</style>
      <div className="flex min-h-[64px] flex-wrap items-center gap-3 px-3 py-3 sm:px-4 lg:gap-6 lg:px-6">
        <div className="flex min-w-0 flex-[1_1_200px] items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center text-[#2EBF8A]" aria-hidden>
            <ShieldIcon className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-[#475569]">LICPro Academy</p>
            <p className="truncate text-[clamp(0.85rem,2.5vw,1rem)] font-semibold text-[#F1F5F9]">{testTitle}</p>
          </div>
        </div>

        <div className="flex flex-[1_1_160px] flex-col items-center justify-center">
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[#475569]">Time left</p>
          <p
            className={`mt-0.5 text-[clamp(1.25rem,4vw,1.5rem)] font-bold tracking-tight ${timerClass}`}
            aria-live="polite"
          >
            {formatCountdown(sec)}
          </p>
        </div>

        <div className="flex flex-[1_1_220px] flex-col items-end gap-2 sm:flex-row sm:items-center sm:justify-end">
          {tabSwitchCount > 0 && (
            <p className="order-last inline-flex rounded-md border border-amber-500/25 bg-[#1C2A3E] px-2.5 py-1 text-[0.7rem] font-medium text-amber-200 sm:order-none">
              ⚠ {tabSwitchCount} tab switch(es) recorded
            </p>
          )}
          <span className="text-[clamp(0.75rem,2vw,0.8125rem)] text-[#64748B]">
            Answered: {answeredCount} / {totalQuestions}
          </span>
          <button
            type="button"
            onClick={onSubmitClick}
            className={`min-h-[44px] rounded-[11px] border border-[rgba(46,191,138,0.3)] bg-[#161F2E] px-4 py-2 text-[0.8125rem] font-medium text-[#2EBF8A] ${transitionHover} hover:border-[rgba(46,191,138,0.45)] sm:min-h-[48px]`}
          >
            Submit Test
          </button>
        </div>
      </div>
    </header>
  );
}
