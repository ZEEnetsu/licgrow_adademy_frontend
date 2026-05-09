import { useEffect, useRef, useState } from 'react';

/**
 * Animates a numeric value 0 → `target` over `duration` ms with ease-out cubic.
 * Triggers once when `ref` element crosses viewport.
 */
export function useCountUp(target, { duration = 2000, threshold = 0.25 } = {}) {
  const ref = useRef(null);
  const [value, setValue] = useState(0);
  const done = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || done.current) return;
        done.current = true;

        const start = performance.now();
        const step = (now) => {
          const t = Math.min((now - start) / duration, 1);
          const eased = 1 - (1 - t) ** 3; // ease-out cubic
          setValue(Math.round(eased * target));
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      { threshold },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration, threshold]);

  return [ref, value];
}

export function formatCount(n) {
  return n.toLocaleString('en-IN');
}
