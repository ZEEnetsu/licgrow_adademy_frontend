/**
 * Soft wave divider between sections — seamless vertical rhythm.
 * `flip` mirrors vertically for alternating waves.
 */
export function WaveDivider({ fill = '#F7FAF9', flip = false, className = '' }) {
  return (
    <div
      className={[
        'relative -mt-px w-full leading-[0] text-current',
        flip ? 'rotate-180' : '',
        className,
      ].join(' ')}
      aria-hidden
    >
      <svg
        className="block w-full"
        viewBox="0 0 1440 48"
        preserveAspectRatio="none"
        style={{ height: 'clamp(32px, 4vw, 56px)' }}
      >
        <path
          fill={fill}
          d="M0,24 C180,48 360,0 540,24 C720,48 900,0 1080,24 C1260,48 1360,8 1440,24 L1440,48 L0,48 Z"
        />
      </svg>
    </div>
  );
}
