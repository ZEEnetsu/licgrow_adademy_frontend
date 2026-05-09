import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

import { testStatusChip } from './testStatus.js';
import { shadow, EASE, transitionHover } from './styles.js';

export default function ProgressPanel({ tests }) {
  const panel = `rounded-[16px] border border-white/[0.05] bg-[#111827] ${shadow.card} ${shadow.cardHover} ${transitionHover} hover:border-white/[0.08] hover:bg-[#161F2E]`;

  return (
    <section className={`${panel} p-5 lg:p-6`}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.04] pb-4">
        <h2 className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#64748B]">
          Your Progress
        </h2>
        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
          Autosaved
          <motion.span
            className="inline-block h-1.5 w-1.5 rounded-full bg-[#2EBF8A]"
            animate={{ opacity: [1, 0.35, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: EASE }}
            aria-hidden
          />
        </span>
      </div>
      <ul>
        {tests.map((test, i) => {
          const pct = test.lastAttemptResult?.percentage ?? 0;
          const passed = test.lastAttemptResult?.passed;
          const pctColor =
            test.lastAttemptResult == null
              ? 'text-[#475569]'
              : passed
                ? 'text-[#2EBF8A]'
                : 'text-[#F43F5E]';
          const fill =
            test.lastAttemptResult == null
              ? 'bg-[#475569]'
              : passed
                ? 'bg-[#2EBF8A]'
                : 'bg-[#F43F5E]';
          const chip = testStatusChip(test);
          const chipStyle =
            chip.tone === 'teal'
              ? 'border-[#2EBF8A]/20 bg-[#2EBF8A]/10 text-[#2EBF8A]'
              : chip.tone === 'amber'
                ? 'border-[#F59E0B]/20 bg-[#F59E0B]/10 text-[#F59E0B]'
                : chip.tone === 'rose'
                  ? 'border-[#F43F5E]/20 bg-[#F43F5E]/10 text-[#F43F5E]'
                  : 'border-[#475569]/20 bg-[#475569]/10 text-[#475569]';

          return (
            <li
              key={test.testId}
              className={`border-b border-white/[0.04] last:border-b-0 ${transitionHover} hover:bg-[#161F2E]`}
            >
              <div className="flex flex-wrap items-start gap-2 px-1 py-4 sm:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[0.875rem] font-medium leading-snug text-[#CBD5E1]">{test.title}</p>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className={`text-sm font-semibold tabular-nums ${pctColor}`}>
                        {test.lastAttemptResult == null ? '—' : `${pct.toFixed(1)}%`}
                      </span>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${chipStyle}`}
                      >
                        {chip.label}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 h-[4px] overflow-hidden rounded-[2px] bg-[#1C2A3E]">
                    <motion.div
                      className={`h-full rounded-[2px] ${fill}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.1 * i, ease: EASE }}
                    />
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <Link
        to="/mock-tests"
        className={`mt-4 inline-flex min-h-[48px] items-center text-[0.875rem] font-medium text-[#2EBF8A] ${transitionHover} hover:text-[#56CFE1]`}
      >
        See all tests →
      </Link>
    </section>
  );
}
