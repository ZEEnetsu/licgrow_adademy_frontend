import { Fragment } from 'react';
import { motion } from 'framer-motion';

import { EXPO, M } from './primitives.js';

const container = (stagger, delay) => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

const word = {
  hidden: { y: '110%', rotate: 3 },
  visible: { y: '0%', rotate: 0, transition: { duration: 1, ease: EXPO } },
};

const swoosh = (delay) => ({
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { delay, duration: 0.9, ease: [0.65, 0, 0.35, 1] },
  },
});

// Letters, combining marks (Devanagari matras) and digits; punctuation dropped.
const bare = (w) => w.replace(/[^\p{L}\p{M}\p{N}]/gu, '');

/**
 * A headline that rises into place word by word, each word sliding up out of
 * its own mask.
 *
 * Words, never characters: splitting Devanagari by code point tears conjuncts
 * and matras apart. The masks carry vertical padding for the same reason —
 * Hindi marks sit above and below the Latin line box.
 *
 * `highlight` (a word or list of words, compared without punctuation) gets
 * the accent colour and a hand-drawn ember swoosh underneath, as in the
 * reference design.
 *
 * Screen readers get the sentence once, from an sr-only copy; the animated
 * words are aria-hidden.
 */
export default function SplitText({
  text,
  as = 'span',
  className = '',
  delay = 0,
  stagger = 0.055,
  highlight,
  highlightClass = 'text-ember',
  onMount = false,
  amount = 0.5,
}) {
  const Comp = M[as] ?? M.span;
  const marks = [].concat(highlight ?? []);
  const words = String(text).split(/\s+/).filter(Boolean);
  const swooshDelay = delay + words.length * stagger + 0.35;

  const trigger = onMount
    ? { animate: 'visible' }
    : { whileInView: 'visible', viewport: { once: true, amount } };

  return (
    <Comp className={className} initial="hidden" variants={container(stagger, delay)} {...trigger}>
      <span className="sr-only">{text}</span>
      {words.map((w, i) => {
        const marked = marks.includes(bare(w));
        return (
          <Fragment key={`${w}-${i}`}>
            <span aria-hidden className="relative inline-block">
              <span className="-my-[0.18em] inline-block overflow-hidden py-[0.18em] align-bottom">
                <motion.span
                  className={`inline-block will-change-transform ${marked ? highlightClass : ''}`}
                  variants={word}
                >
                  {w}
                </motion.span>
              </span>
              {marked ? (
                <svg
                  viewBox="0 0 200 24"
                  preserveAspectRatio="none"
                  className="pointer-events-none absolute -bottom-[0.16em] left-[-4%] h-[0.3em] w-[108%] overflow-visible text-ember"
                >
                  <motion.path
                    d="M4 16 C 46 6, 118 2, 196 10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="7"
                    strokeLinecap="round"
                    variants={swoosh(swooshDelay)}
                  />
                </svg>
              ) : null}
            </span>
            {i < words.length - 1 ? ' ' : null}
          </Fragment>
        );
      })}
    </Comp>
  );
}
