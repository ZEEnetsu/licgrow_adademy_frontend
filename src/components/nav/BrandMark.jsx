import { useId } from 'react';
import { motion } from 'framer-motion';

import { EXPO } from '../motion/primitives.js';

/*
 * The shield is split from its check so the check can be drawn. The check is
 * not painted on top: it is a black stroke in a mask, so it stays a true
 * cut-out and the badge gradient shows through it, as in ShieldMark.
 */
const SHIELD = 'M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z';
const CHECK = 'M8.345 11.535L10.94 14.13L16.425 8.645';

const badge = {
  hidden: { scale: 0.6, rotate: -90, opacity: 0 },
  rest: { scale: 1, rotate: 0, opacity: 1, transition: { type: 'spring', stiffness: 260, damping: 16 } },
  hover: { scale: 1.06, transition: { type: 'spring', stiffness: 420, damping: 14 } },
  tap: { scale: 0.92, transition: { type: 'spring', stiffness: 600, damping: 22 } },
};

const check = {
  hidden: { pathLength: 0 },
  rest: { pathLength: 1, transition: { duration: 0.5, ease: EXPO, delay: 0.35 } },
  hover: { pathLength: [0, 1], transition: { duration: 0.6, ease: EXPO, delay: 0.05 } },
};

// Eight sparks, alternating long and short throws so the burst isn't a perfect ring.
const SPARKS = Array.from({ length: 8 }, (_, i) => ({
  angle: (i / 8) * Math.PI * 2 + Math.PI / 8,
  reach: i % 2 ? 26 : 32,
  tone: i % 2 ? 'bg-peach' : 'bg-ember',
}));

const spark = {
  hidden: { opacity: 0, x: 0, y: 0, scale: 0 },
  rest: { opacity: 0, x: 0, y: 0, scale: 0, transition: { duration: 0 } },
  hover: ({ angle, reach }) => ({
    x: [0, Math.cos(angle) * reach * 0.7, Math.cos(angle) * reach],
    y: [0, Math.sin(angle) * reach * 0.7, Math.sin(angle) * reach],
    opacity: [0, 1, 0],
    scale: [0, 1, 0.3],
    transition: { duration: 0.65, ease: EXPO, times: [0, 0.3, 1] },
  }),
};

// A comet: the arc fades in behind a bright ember head, then cuts off.
const ORBIT = {
  backgroundImage:
    'conic-gradient(from 0deg, transparent 0 52%, var(--color-peach) 78%, var(--color-ember) 90%, transparent 90.5%)',
  WebkitMaskImage: 'radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1.5px))',
  maskImage: 'radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1.5px))',
};

/**
 * The animated logo in the header brand. Always on: a comet arc orbits the
 * badge and a glint sweeps across it. On hover it leans toward the pointer,
 * re-draws its check and throws sparks; on mount it springs in.
 *
 * It has no hover state of its own: Brand's link drives the `hidden` / `rest`
 * / `hover` / `tap` variants, and hands in `tilt` (a ref to measure from and
 * the spring-driven transform). `dark` is for ink backgrounds.
 */
export default function BrandMark({ dark = false, reduced = false, tilt }) {
  const mask = `brand-check-${useId().replace(/:/g, '')}`;

  return (
    <span ref={tilt?.ref} className="relative block h-10 w-10 shrink-0" aria-hidden>
      {reduced
        ? null
        : SPARKS.map((s, i) => (
            <motion.span
              key={i}
              custom={s}
              variants={spark}
              className={`absolute left-1/2 top-1/2 -ml-0.5 -mt-0.5 h-1 w-1 rounded-full ${s.tone}`}
            />
          ))}

      <motion.span className="relative block h-full w-full" style={reduced ? undefined : tilt?.style}>
        <span className="absolute -inset-[3px] animate-orbit rounded-full" style={ORBIT} />

        <motion.span
          variants={badge}
          className={`relative isolate grid h-full w-full place-items-center overflow-hidden rounded-full bg-gradient-to-br text-white shadow-soft transition-shadow duration-500 ease-out-expo group-hover:shadow-ember ${
            dark ? 'from-ember to-ember-deep' : 'from-lic-navy to-lic-royal'
          }`}
        >
          <svg viewBox="0 0 24 24" className="relative h-5 w-5" fill="currentColor">
            <mask id={mask} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
              <rect width="24" height="24" fill="white" />
              <motion.path
                d={CHECK}
                variants={check}
                fill="none"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="butt"
                strokeLinejoin="miter"
              />
            </mask>
            <path d={SHIELD} mask={`url(#${mask})`} />
          </svg>
          <span className="pointer-events-none absolute inset-y-0 left-0 w-1/2 animate-glint bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        </motion.span>
      </motion.span>
    </span>
  );
}
