import { shadow } from '../../pages/dashboard/styles.js';

/** Correct / Wrong / Skipped summary styled like dashboard stats. */
export default function PerformanceStats({ stats }) {
  const base =
    'rounded-[16px] border border-white/[0.05] bg-[#111827] px-6 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_2px_8px_rgba(0,0,0,0.4)]';

  return (
    <div className="mt-10 grid gap-4 md:grid-cols-3">
      <article className={base}>
        <div className="h-px w-full rounded-full bg-[rgba(46,191,138,0.25)]" />
        <div className="mt-5">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#64748B]">
            Correct answers
          </p>
          <p className="mt-2 text-[clamp(2rem,4vw,2.5rem)] font-bold text-[#2EBF8A]">{stats.correct}</p>
        </div>
      </article>

      <article className={base}>
        <div className="h-px w-full rounded-full bg-[rgba(244,63,94,0.25)]" />
        <div className="mt-5">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#64748B]">
            Wrong answers
          </p>
          <p className="mt-2 text-[clamp(2rem,4vw,2.5rem)] font-bold text-[#F43F5E]">{stats.wrong}</p>
        </div>
      </article>

      <article className={base}>
        <div className="h-px w-full rounded-full bg-white/[0.12]" />
        <div className="mt-5">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#64748B]">Skipped</p>
          <p className="mt-2 text-[clamp(2rem,4vw,2.5rem)] font-bold text-[#64748B]">{stats.skipped}</p>
        </div>
      </article>
    </div>
  );
}
