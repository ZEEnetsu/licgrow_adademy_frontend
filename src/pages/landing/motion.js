/**
 * Material Design standard easing + scroll-reveal presets for LICPro Academy.
 */
export const EASE = [0.4, 0, 0.2, 1];

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

export const fadeUpIndex = (i = 0) => ({
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE, delay: i * 0.12 },
  },
});
