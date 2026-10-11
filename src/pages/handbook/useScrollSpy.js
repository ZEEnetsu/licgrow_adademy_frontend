import { useEffect, useState } from 'react';

/**
 * Tracks which section heading is currently under the reader.
 *
 * Deliberately not an IntersectionObserver `isIntersecting` toggle: with
 * sections of wildly different heights (the rate card is a screen, Gratuity is
 * four), several are on screen at once and the "active" id flickers between
 * them. Instead we take the last heading whose top has passed the reading line
 * — the same rule the reader's eye is using.
 */
export function useScrollSpy(ids, offset = 140) {
  const [active, setActive] = useState(ids[0] ?? null);

  useEffect(() => {
    if (!ids.length) return undefined;

    let frame = 0;

    const read = () => {
      frame = 0;
      let current = ids[0];

      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top - offset <= 0) current = id;
      }

      // At the very bottom the last section may never reach the reading line,
      // so nothing would ever mark it active.
      //
      // Measure against documentElement.scrollHeight, NOT body.offsetHeight:
      // index.css sets `html, body, #root { height: 100% }`, which pins
      // body.offsetHeight to the viewport. Against that, this test is true at
      // every scroll position and the spy sticks on the last section forever.
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;
      if (atBottom) current = ids[ids.length - 1];

      setActive(current);
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(read);
    };

    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [ids, offset]);

  return active;
}

/** 0 → 1 progress through the document, for the top reading bar. */
export function useReadingProgress() {
  const [p, setP] = useState(0);

  useEffect(() => {
    let frame = 0;
    const read = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setP(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(read);
    };
    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return p;
}
