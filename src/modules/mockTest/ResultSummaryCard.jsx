/**
 * Animated percentage ring built with SVG (no chart deps).
 */

/**
 * @param {{
 *   passed:boolean,
 *   percentage:number,
 * }} props
 */
function PercentRing({ passed, percentage }) {
  const pct = Math.max(0, Math.min(100, percentage || 0));
  const cx = 70;
  const cy = 70;
  const r = 54;
  const stroke = passed ? '#2EBF8A' : '#F43F5E';
  const trackColor = '#1C2A3E';
  const circ = 2 * Math.PI * r;
  const dashFinal = circ * (1 - pct / 100);

  return (
    <svg width={140} height={140} aria-hidden>
      <style>{`
        @keyframes ringSweep {
          from { stroke-dashoffset: ${circ}; }
          to { stroke-dashoffset: ${dashFinal}; }
        }
      `}</style>
      {/* Full track underneath */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        stroke={trackColor}
        strokeWidth={10}
        fill="none"
        strokeDasharray={`${circ} ${circ}`}
      />
      <circle
        style={{
          animation: 'ringSweep 1.2s ease-out forwards',
          transformOrigin: 'center center',
          transform: 'rotate(-90deg)',
        }}
        cx={cx}
        cy={cy}
        r={r}
        stroke={stroke}
        strokeWidth={11}
        fill="none"
        strokeDasharray={`${circ} ${circ}`}
        strokeDashoffset={dashFinal}
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r={r - 26} fill="#05070d77" />

      <text
        x={cx}
        y={cy - 10}
        textAnchor="middle"
        className={`fill-current text-[1.875rem] font-extrabold ${passed ? 'text-[#2EBF8A]' : 'text-[#F43F5E]'}`}
        style={{ dominantBaseline: 'middle' }}
      >
        {percentage.toFixed(1)}%
      </text>

      <text
        x={cx}
        y={cy + 18}
        textAnchor="middle"
        className={`fill-current text-[0.6875rem] font-bold uppercase tracking-[0.2em] ${passed ? 'text-[#2EBF8A]' : 'text-[#F43F5E]'}`}
        style={{ dominantBaseline: 'middle' }}
      >
        {passed ? 'PASSED' : 'FAILED'}
      </text>
    </svg>
  );
}

/**
 * Full-width headline panel for `/result`.
 *
 * @param {{
 *   result:any,
 *   formatSubmitted:(iso:string)=>string,
 *   formatTaken:(secs:number)=>string,
 * }} props
 */
export default function ResultSummaryCard({ result, formatSubmitted, formatTaken }) {
  return (
    <header
      className="grid gap-8 rounded-[20px] border border-white/[0.06] bg-[#111827] p-8 shadow-[0_24px_64px_rgba(0,0,0,0.55)] lg:grid-cols-[minmax(0,1.65fr)_minmax(260px,_auto)_minmax(0,2fr)]"
    >
      <div className="min-w-0">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.26em] text-[#2EBF8A]">Exam Complete</p>
        <h1 className="mt-3 text-[clamp(1.25rem,3vw,1.875rem)] font-bold tracking-tight text-[#F1F5F9]">{result.testTitle}</h1>
        <div className="mt-6 space-y-1 text-[0.875rem] text-[#94A3B8]">
          <p>Attempt #{result.attemptNumber}</p>
          <p>{formatSubmitted(result.submittedAt)}</p>
        </div>
      </div>

      <div className="flex items-center justify-center">
        <PercentRing passed={result.passed} percentage={result.percentage} />
      </div>

      <div className="grid grid-cols-2 gap-4 text-[0.9375rem]">
        <Stat label="Score" value={`${result.score} / ${result.totalMarks}`} />
        <Stat label="Time taken" value={formatTaken(result.timeTakenSeconds)} />
        <Stat label="Passing marks" value={String(result.passingMarks)} />
        <Stat label="Attempt #" value={String(result.attemptNumber)} />
      </div>
    </header>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-[14px] border border-white/[0.06] bg-[#161F2E] px-5 py-4">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#64748B]">{label}</p>
      <p className="mt-1 text-lg font-semibold text-[#F1F5F9]">{value}</p>
    </div>
  );
}
