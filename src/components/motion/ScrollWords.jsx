import { useRef } from 'react';
import { motion, useReducedMotion, useTransform } from 'framer-motion';

import { M, useProgress } from './primitives.js';

function Word({ progress, range, children }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return (
    <>
      <motion.span style={{ opacity }}>{children}</motion.span>{' '}
    </>
  );
}

/**
 * Scroll-scrubbed reading: each word brightens from a ghost to full ink as
 * the paragraph moves up the screen, so the text is "read" at scroll speed.
 *
 * Pass `progress` (a 0→1 MotionValue) to drive it from a pinned chapter;
 * otherwise it tracks its own position. With reduced motion it is plain text.
 */
export default function ScrollWords({
  text,
  as = 'p',
  className = '',
  progress,
  offset = ['start 0.85', 'end 0.5'],
}) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const scrollYProgress = useProgress({ target: ref, offset });
  const p = progress ?? scrollYProgress;
  const Comp = M[as] ?? M.p;

  const words = String(text).split(/\s+/).filter(Boolean);

  if (reduce) {
    return (
      <Comp ref={ref} className={className}>
        {text}
      </Comp>
    );
  }

  const n = words.length;
  return (
    <Comp ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((w, i) => (
          <Word key={`${w}-${i}`} progress={p} range={[i / n, Math.min(1, (i + 1.5) / n)]}>
            {w}
          </Word>
        ))}
      </span>
    </Comp>
  );
}
