import { motion } from 'framer-motion';

import { useCountUp } from './useCountUp.js';
import { shadow, EASE, transitionHover } from './styles.js';

function StatSparkline({ percentages }) {
  if (!percentages.length) return null;
  const w = 72;
  const h = 36;
  const pad = 4;
  const min = 0;
  const max = 100;
  const pts = percentages.map((p, i) => {
    const span = Math.max(percentages.length - 1, 1);
    const x = pad + (i / span) * (w - pad * 2);
    const y = h - pad - ((p - min) / (max - min)) * (h - pad * 2);
    return `${x},${y}`;
  });
  return (
    <svg width={w} height={h} className="shrink-0 overflow-visible" aria-hidden>
      <polyline
        fill="none"
        stroke="#2EBF8A"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pts.join(' ')}
      />
    </svg>
  );
}

export default function StatCardRow({ stats, sparklinePercentages }) {
  const testsTakenAnim = useCountUp(stats.testsTaken, 1500);
  const avgPctAnim = useCountUp(stats.averagePercentage, 1500);
  const passRateAnim = useCountUp(stats.passRate, 1500);

  const failed = stats.testsTaken - stats.testsPassed;
  const ringR = 37;
  const ringC = 2 * Math.PI * ringR;
  const ringDashFinal = ringC * (1 - stats.passRate / 100);

  const trendAbove = stats.averagePercentage >= 60;

  const cardBase = `rounded-[16px] border border-white/[0.05] bg-[#111827] pt-px ${shadow.cardInset} ${shadow.cardInsetHover} ${transitionHover} hover:border-white/[0.08] hover:bg-[#161F2E]`;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Tests taken */}
      <motion.article
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: EASE }}
        className={cardBase}
      >
        <div className="h-px w-full bg-[rgba(46,191,138,0.25)]" />
        <div className="p-5 pt-4">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#64748B]">
            Tests Taken
          </p>
          <p className="mt-2 text-[2.5rem] font-extrabold leading-none tabular-nums text-[#F1F5F9]">
            {Math.round(testsTakenAnim)}
          </p>
          <p className="mt-2 text-[0.75rem] font-normal text-[#64748B]">
            <span className="text-[#2EBF8A]">{stats.testsPassed} passed</span>
            <span className="mx-1.5 text-[#475569]">·</span>
            <span className="text-[#F43F5E]">{failed} failed</span>
          </p>
          <div className="mt-4 h-[3px] overflow-hidden rounded-[2px] bg-[#1C2A3E]">
            <motion.div
              className="h-full rounded-[2px] bg-[#2EBF8A]"
              initial={{ width: 0 }}
              animate={{ width: `${stats.passRate}%` }}
              transition={{ duration: 0.8, ease: EASE }}
            />
          </div>
        </div>
      </motion.article>

      {/* Average score */}
      <motion.article
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.06, ease: EASE }}
        className={cardBase}
      >
        <div className="h-px w-full bg-[rgba(46,191,138,0.25)]" />
        <div className="flex gap-4 p-5 pt-4">
          <div className="min-w-0 flex-1">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#64748B]">
              Average Score
            </p>
            <p className="mt-2 text-[2.5rem] font-extrabold leading-none tabular-nums text-[#F1F5F9]">
              {avgPctAnim.toFixed(1)}%
            </p>
            <p className="mt-2 text-[0.75rem] font-normal text-[#64748B]">
              Best: {stats.bestScore} marks
            </p>
            <p
              className={`mt-2 text-[0.7rem] font-medium ${trendAbove ? 'text-[#2EBF8A]' : 'text-[#F43F5E]'}`}
            >
              {trendAbove ? '↑ Above passing threshold' : '↓ Below passing threshold'}
            </p>
          </div>
          <StatSparkline percentages={sparklinePercentages} />
        </div>
      </motion.article>

      {/* Pass rate */}
      <motion.article
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.12, ease: EASE }}
        className={cardBase}
      >
        <div className="h-px w-full bg-[rgba(46,191,138,0.25)]" />
        <div className="flex flex-wrap items-center gap-5 p-5 pt-4">
          <div className="relative grid h-20 w-20 shrink-0 place-items-center">
            <svg width={80} height={80} viewBox="0 0 80 80" className="-rotate-90" aria-hidden>
              <circle cx="40" cy="40" r={ringR} fill="none" stroke="#1C2A3E" strokeWidth="6" />
              <motion.circle
                cx="40"
                cy="40"
                r={ringR}
                fill="none"
                stroke="#2EBF8A"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={ringC}
                initial={{ strokeDashoffset: ringC }}
                animate={{ strokeDashoffset: ringDashFinal }}
                transition={{ duration: 1.2, ease: EASE }}
              />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#64748B]">
              Pass Rate
            </p>
            <p className="mt-1 text-[2.5rem] font-extrabold leading-none tabular-nums text-[#F1F5F9]">
              {passRateAnim.toFixed(0)}%
            </p>
            <p className="mt-2 text-[0.75rem] font-normal text-[#64748B]">Across all attempts</p>
            <p className="mt-3 text-[0.8125rem] font-medium leading-snug text-[#CBD5E1]">
              {stats.testsPassed} of {stats.testsTaken} passed
            </p>
          </div>
        </div>
      </motion.article>
    </div>
  );
}
