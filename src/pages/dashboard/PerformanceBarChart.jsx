import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { truncateTwoWords } from './formatters.js';
import { shadow, EASE, transitionHover } from './styles.js';

const CHART_H = 200;
const PAD_L = 36;
const PAD_R = 12;
const PAD_T = 16;
const PAD_B = 44;

export default function PerformanceBarChart({ attempts }) {
  const [hovered, setHovered] = useState(null);

  const innerW = 560;
  const plotW = innerW - PAD_L - PAD_R;
  const plotH = CHART_H - PAD_T - PAD_B;
  const n = attempts.length;
  const gap = 8;
  const barW = Math.max(28, (plotW - gap * Math.max(n - 1, 0)) / Math.max(n, 1));

  const yTicks = [100, 75, 50, 25, 0];
  const thresholdY = PAD_T + plotH * (1 - 60 / 100);

  const bars = useMemo(
    () =>
      attempts.map((a, i) => ({
        ...a,
        x: PAD_L + i * (barW + gap),
        color: a.passed ? '#2EBF8A' : '#F43F5E',
      })),
    [attempts, barW, gap],
  );

  const panel = `rounded-[16px] border border-white/[0.05] bg-[#111827] ${shadow.card} ${shadow.cardHover} ${transitionHover} hover:border-white/[0.08] hover:bg-[#161F2E]`;

  return (
    <section className={`${panel} relative p-5 lg:p-6`}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2 border-b border-white/[0.04] pb-4">
        <h2 className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#64748B]">
          Performance Overview
        </h2>
        <span className="text-[0.75rem] font-normal text-[#64748B]">Last 5 Attempts</span>
      </div>

      <div className="overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch]">
        <svg
          width={innerW}
          height={CHART_H}
          className="mx-auto block min-w-[520px] md:min-w-0"
          role="img"
          aria-label="Performance bar chart"
        >
          {yTicks.map((tick) => {
            const y = PAD_T + plotH * (1 - tick / 100);
            return (
              <g key={tick}>
                <line
                  x1={PAD_L}
                  y1={y}
                  x2={innerW - PAD_R}
                  y2={y}
                  stroke="rgba(255,255,255,0.04)"
                  strokeWidth={1}
                />
                <text
                  x={PAD_L - 6}
                  y={y + 4}
                  textAnchor="end"
                  fill="#475569"
                  fontSize="10"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          <line
            x1={PAD_L}
            y1={thresholdY}
            x2={innerW - PAD_R}
            y2={thresholdY}
            stroke="rgba(245,158,11,0.4)"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
          <text
            x={innerW - PAD_R}
            y={thresholdY - 4}
            textAnchor="end"
            fill="rgba(245,158,11,0.75)"
            fontSize="9"
          >
            Passing Threshold
          </text>

          {bars.map((b, i) => {
            const barH = (b.percentage / 100) * plotH;
            const bx = b.x;
            const by = PAD_T + plotH - barH;
            return (
              <g key={b.attemptId}>
                <motion.rect
                  x={bx}
                  width={barW}
                  fill={b.color}
                  rx={2}
                  initial={{ height: 0, y: PAD_T + plotH }}
                  animate={{ height: barH, y: by }}
                  transition={{ duration: 0.6, delay: 0.1 * i, ease: EASE }}
                  className="cursor-pointer"
                  style={{ opacity: hovered === i ? 0.85 : 1 }}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                />
                <text
                  x={bx + barW / 2}
                  y={CHART_H - 8}
                  textAnchor="middle"
                  fill="#64748B"
                  fontSize="11"
                >
                  {truncateTwoWords(b.testTitle)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <AnimatePresence>
        {hovered != null && bars[hovered] && (
          <motion.div
            role="tooltip"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: EASE }}
            className={`pointer-events-none absolute left-1/2 top-[52%] z-10 w-[min(220px,calc(100%-2rem))] -translate-x-1/2 rounded-[12px] border border-white/[0.08] bg-[#1C2A3E] px-3 py-2 text-[0.8125rem] md:left-auto md:right-6 md:translate-x-0 ${shadow.tooltip}`}
          >
            <p className="font-medium text-[#F1F5F9]">{bars[hovered].testTitle}</p>
            <p className="mt-1 text-[#94A3B8]">
              Score {bars[hovered].score}/{bars[hovered].totalMarks} ·{' '}
              {bars[hovered].percentage.toFixed(1)}%
            </p>
            <p
              className={`mt-1 font-semibold ${bars[hovered].passed ? 'text-[#2EBF8A]' : 'text-[#F43F5E]'}`}
            >
              {bars[hovered].passed ? 'Passed' : 'Failed'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
