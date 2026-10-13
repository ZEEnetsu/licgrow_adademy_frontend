import { motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';

import { TONE_ART } from '../../../components/ui/tones.js';

/* the same hand-drawn curve as the landing's Annotation arrow */
const DRAW_EASE = [0.65, 0, 0.35, 1];

const STROKE = {
  hidden: { pathLength: 0, opacity: 0 },
  shown: (i) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 1.1, ease: DRAW_EASE, delay: i * 0.06 },
      opacity: { duration: 0.01, delay: i * 0.06 },
    },
  }),
};

const FILL = {
  hidden: { opacity: 0 },
  shown: { opacity: 1, transition: { duration: 0.6, delay: 0.5 } },
};

/**
 * One line-art drawing (see illustrations.js): soft tinted washes, a single
 * accent, and thin ink outlines on top. Purely decorative.
 *
 * It draws itself once: when it scrolls into view, or — given `progress`, a
 * 0→1 MotionValue — in step with a scroll-driven entrance (the pinned Dreams
 * board, where every card is technically "in view" before it has flown in).
 * With reduced motion it is simply there.
 */
export default function LineArt({ art, tone = 'sand', progress, className = '' }) {
  const reduce = useReducedMotion();
  const fills = TONE_ART[tone] ?? TONE_ART.sand;
  const still = useMotionValue(1);
  const drive = progress ?? still;
  const fillOpacity = useTransform(drive, [0.6, 1], [0, 1]);
  const strokeOpacity = useTransform(drive, [0, 0.02], [0, 1]);

  if (!art) return null;

  const scrolled = Boolean(progress) && !reduce;
  const inView = !progress && !reduce;

  const fill = (d, cls, key) =>
    reduce ? (
      <path key={key} d={d} className={cls} />
    ) : (
      <motion.path
        key={key}
        d={d}
        className={cls}
        variants={inView ? FILL : undefined}
        style={scrolled ? { opacity: fillOpacity } : undefined}
      />
    );

  return (
    <motion.svg
      viewBox={art.viewBox}
      aria-hidden
      focusable="false"
      className={`text-ink/30 ${className}`}
      initial={inView ? 'hidden' : false}
      whileInView={inView ? 'shown' : undefined}
      viewport={{ once: true, amount: 0.4 }}
    >
      <g stroke="none">
        {art.soft?.map((d, i) => fill(d, fills.soft, `s${i}`))}
        {art.accent?.map((d, i) => fill(d, fills.accent, `a${i}`))}
      </g>
      <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        {art.strokes.map((d, i) =>
          reduce ? (
            <path key={i} d={d} />
          ) : (
            <motion.path
              key={i}
              d={d}
              custom={i}
              variants={inView ? STROKE : undefined}
              style={scrolled ? { pathLength: drive, opacity: strokeOpacity } : undefined}
            />
          ),
        )}
      </g>
    </motion.svg>
  );
}
