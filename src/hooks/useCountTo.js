import { useEffect, useRef, useState } from "react";
import { animate, useReducedMotion } from "framer-motion";

/**
 * A number that counts up to `value` — the landing page's stat-card motion,
 * for the app.
 *
 * Unlike the landing's `useCountUp` (scroll-triggered, runs once), this one
 * follows `value`: the first count runs `duration` ms from zero, and every
 * later change tweens from where the display is in 400ms, so a refetch that
 * moves a number reads as a nudge rather than a restart. With reduced motion
 * it is just `value`.
 */
export function useCountTo(value, { duration = 1200 } = {}) {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(0);
  const current = useRef(0);
  const started = useRef(false);

  useEffect(() => {
    if (reduced || typeof value !== "number" || !Number.isFinite(value)) return undefined;

    const first = !started.current;
    started.current = true;
    const controls = animate(current.current, value, {
      duration: first ? duration / 1000 : 0.4,
      ease: [0.33, 1, 0.68, 1], // ease-out cubic
      onUpdate: (latest) => {
        current.current = latest;
        setDisplay(latest);
      },
    });
    return () => controls.stop();
  }, [value, reduced, duration]);

  if (typeof value !== "number" || !Number.isFinite(value)) return value;
  if (reduced) return value;
  // whole numbers count in whole steps; a fractional value (an average score)
  // keeps one decimal, so the tween lands exactly on it
  const factor = Number.isInteger(value) ? 1 : 10;
  return Math.round(display * factor) / factor;
}

export default useCountTo;
