import { motion } from 'framer-motion';

import { EXPO } from '../motion/primitives.js';
import LogoMark from './LogoMark.jsx';

const mark = {
  hidden: { scale: 0.6, rotate: -12, opacity: 0 },
  rest: { scale: 1, rotate: 0, opacity: 1, transition: { type: 'spring', stiffness: 260, damping: 16 } },
  hover: { scale: 1.06, transition: { type: 'spring', stiffness: 420, damping: 14 } },
  tap: { scale: 0.92, transition: { type: 'spring', stiffness: 600, damping: 22 } },
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

/**
 * The animated logo in the header brand: the transparent licgrow mark, ink on
 * light backgrounds and ember on ink. On mount it springs in; on hover it
 * leans toward the pointer, glows and throws sparks.
 *
 * It has no hover state of its own: Brand's link drives the `hidden` / `rest`
 * / `hover` / `tap` variants, and hands in `tilt` (a ref to measure from and
 * the spring-driven transform). `dark` is for ink backgrounds.
 */
export default function BrandMark({ dark = false, reduced = false, tilt }) {
  return (
    <span ref={tilt?.ref} className="relative grid h-10 w-[3.25rem] shrink-0 place-items-center" aria-hidden>
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

      <motion.span className="relative block" style={reduced ? undefined : tilt?.style}>
        <motion.span variants={mark} className="block">
          <LogoMark
            className={`h-7 transition-[filter] duration-500 ease-out-expo ${
              dark
                ? 'text-ember group-hover:drop-shadow-[0_6px_14px_rgba(250,79,12,0.55)]'
                : 'text-ink group-hover:drop-shadow-[0_6px_12px_rgba(21,13,61,0.28)]'
            }`}
          />
        </motion.span>
      </motion.span>
    </span>
  );
}
