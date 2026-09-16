import { AnimatePresence, motion } from 'framer-motion';

import { EASE } from '../landing/motion.js';

/**
 * The contents rail. Same tree drives the desktop sidebar and the mobile
 * sheet, so there is one definition of "where am I" rather than two that drift.
 */
function Tree({ chapters, active, onPick }) {
  return (
    <nav aria-label="Table of contents">
      <ol className="space-y-7">
        {chapters.map((ch) => {
          const chapterActive = ch.sections.some((s) => s.id === active) || active === ch.id;
          return (
            <li key={ch.id}>
              <a
                href={`#${ch.id}`}
                onClick={onPick}
                className="group flex items-baseline gap-2.5"
              >
                <span
                  className={[
                    'font-mono text-[11px] tabular-nums transition-colors duration-200',
                    chapterActive ? 'text-lic-royal' : 'text-lic-body/45',
                  ].join(' ')}
                >
                  {ch.num}
                </span>
                <span
                  className={[
                    'text-[13px] font-semibold tracking-tight transition-colors duration-200',
                    chapterActive
                      ? 'text-lic-charcoal'
                      : 'text-lic-body group-hover:text-lic-charcoal',
                  ].join(' ')}
                >
                  {ch.title}
                </span>
              </a>

              <ul className="mt-2.5 space-y-px border-l border-black/[0.07] pl-0">
                {ch.sections.map((s) => {
                  const on = s.id === active;
                  return (
                    <li key={s.id} className="relative">
                      {/*
                        The active marker is a sibling bar rather than a border
                        on the <a>: a border would shift the label by 1px as it
                        turns on, and the whole rail would twitch on scroll.
                      */}
                      <span
                        className={[
                          'absolute -left-px top-1/2 h-[1.15rem] w-[2px] -translate-y-1/2 rounded-full transition-all duration-[250ms] ease-material',
                          on ? 'bg-lic-royal opacity-100' : 'bg-transparent opacity-0',
                        ].join(' ')}
                        aria-hidden
                      />
                      <a
                        href={`#${s.id}`}
                        onClick={onPick}
                        aria-current={on ? 'true' : undefined}
                        className={[
                          'block py-[5px] pl-4 pr-2 text-[13px] leading-snug transition-colors duration-200 ease-material',
                          on
                            ? 'font-semibold text-lic-royal'
                            : 'text-lic-body/85 hover:text-lic-charcoal',
                        ].join(' ')}
                      >
                        {s.title}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function DesktopToc({ chapters, active }) {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-[5.5rem] max-h-[calc(100vh-7rem)] overflow-y-auto pb-10 pr-4">
        <p className="mb-6 text-[11px] font-bold uppercase tracking-[0.2em] text-lic-body/60">
          Contents
        </p>
        <Tree chapters={chapters} active={active} />
      </div>
    </aside>
  );
}

export function MobileToc({ chapters, active, open, setOpen }) {
  // Chapter ids are spy targets too, so the label has to resolve against both
  // levels — otherwise the bar reads "Contents" for the whole of a chapter
  // intro before its first section scrolls past.
  const current =
    chapters
      .flatMap((c) => [{ id: c.id, title: c.title }, ...c.sections])
      .find((s) => s.id === active)?.title ?? 'Contents';

  return (
    /*
     * `sticky` is on this element directly rather than on a child of a
     * `lg:hidden` wrapper: a sticky element only travels within its parent's
     * box, and that wrapper was exactly as tall as the bar, so it unstuck
     * immediately. Its parent here is <main>, which spans the document.
     */
    <div className="sticky top-[4.5rem] z-30 -mx-4 border-b border-black/[0.07] bg-white/95 px-4 backdrop-blur-[12px] sm:-mx-6 sm:px-6 lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex min-h-[52px] w-full items-center gap-3 text-left"
      >
        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-lic-body/60">
          On this page
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-lic-charcoal">
          {current}
        </span>
        <svg
          className={`h-4 w-4 flex-shrink-0 text-lic-body transition-transform duration-300 ease-material ${
            open ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="pb-6 pt-1">
              <Tree chapters={chapters} active={active} onPick={() => setOpen(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
