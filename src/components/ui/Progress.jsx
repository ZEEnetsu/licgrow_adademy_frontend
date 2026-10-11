import { motion, useScroll, useSpring } from 'framer-motion';

import { useMemo } from 'react';

import { useLang } from '../../i18n/index.js';
import { useScrollSpy } from '../../pages/handbook/useScrollSpy.js';

/** Thin ember reading bar pinned to the very top of the viewport. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 220, damping: 40, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-ember"
      style={{ scaleX }}
    />
  );
}

/**
 * The chapter rail: a vertical index on the right edge (xl and up) that
 * marks where the reader is in the page and jumps between chapters.
 * `chapters` is a list of `{ id, label: {hi, en} }`; keep it referentially
 * stable (module constant or memo) so the scroll spy does not re-subscribe.
 * `showActive` keeps the current chapter's label visible; long-form pages
 * turn it off, since long chapter titles would sit over the text column.
 * Clicks are plain `#id` anchors, which Lenis turns into a glide.
 */
export function ChapterRail({ chapters, showActive = true }) {
  const { t } = useLang();
  const ids = useMemo(() => chapters.map((c) => c.id), [chapters]);
  const active = useScrollSpy(ids, 320);
  const index = ids.indexOf(active);

  return (
    <nav
      aria-label={t({ hi: 'अध्याय', en: 'Chapters' })}
      className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 xl:block"
    >
      <ol className="flex flex-col items-center gap-1 rounded-full bg-cream/75 p-2 shadow-soft ring-1 ring-ink/8 backdrop-blur-md">
        {chapters.map((c, i) => {
          const on = c.id === active;
          return (
            <li key={c.id} className="group relative">
              <a
                href={`#${c.id}`}
                aria-current={on ? 'step' : undefined}
                className="flex h-5 w-5 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-ember"
              >
                <span
                  className={[
                    'block w-1.5 rounded-full transition-all duration-500 ease-out-expo',
                    on ? 'h-5 bg-ember' : i < index ? 'h-1.5 bg-ink/60' : 'h-1.5 bg-ink/20 group-hover:bg-ink/50',
                  ].join(' ')}
                />
                <span className="sr-only">{t(c.label)}</span>
              </a>
              <span
                aria-hidden
                className={[
                  'pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-full bg-ink px-3 py-1 text-xs font-semibold text-cream shadow-soft transition-all duration-300 ease-out-expo',
                  on && showActive
                    ? 'opacity-100'
                    : 'translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100',
                ].join(' ')}
              >
                <span className="mr-1.5 text-peach tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                {t(c.label)}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
