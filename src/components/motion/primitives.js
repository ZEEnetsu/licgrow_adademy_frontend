import { useSyncExternalStore } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

/** Expo-out: fast start, long soft landing — the easing for every reveal. */
export const EXPO = [0.16, 1, 0.3, 1];

/** Material standard easing — short UI transitions (menus, drawers). */
export const EASE = [0.4, 0, 0.2, 1];

/** Variant presets for staggered fade-ups (used by the handbook). */
export const stagger = (delayChildren = 0.08, staggerChildren = 0.15) => ({
  hidden: {},
  visible: {
    transition: {
      delayChildren,
      staggerChildren,
      ease: EASE,
    },
  },
});

export const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE },
  },
};

/**
 * Static tag → motion component map. Looking a tag up here (rather than
 * calling `motion.create` per render) keeps the component identity stable.
 */
export const M = {
  div: motion.div,
  span: motion.span,
  p: motion.p,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  li: motion.li,
  ul: motion.ul,
  ol: motion.ol,
  figure: motion.figure,
  blockquote: motion.blockquote,
};

/** `useMedia('(min-width: 1024px)')` — live media-query match. */
export function useMedia(query) {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** Format a number the Indian way: 11,97,438. */
export const inr = (n) => n.toLocaleString('en-IN');

/**
 * `useScroll(...).scrollYProgress`, kept on the JS path.
 *
 * framer-motion 12 hands a range-mapped scroll value straight to a native
 * ViewTimeline when the browser has one. With a sticky child inside a tall
 * target (every pinned chapter here) that timeline resolves to the wrong
 * range, and opacity / clip-path stay frozen at their first keyframe. A
 * function transform opts the value out of that acceleration.
 */
export function useProgress(options) {
  const { scrollYProgress } = useScroll(options);
  return useTransform(scrollYProgress, (v) => v);
}
