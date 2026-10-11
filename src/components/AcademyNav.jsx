import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { useLenis } from 'lenis/react';
import LangSwitch from './LangSwitch.jsx';
import Brand from './nav/Brand.jsx';
import { SolutionsDropdown, SolutionsList } from './nav/SolutionsMenu.jsx';
import { useLang } from '../i18n/index.js';
import { NAV_LINKS } from '../pages/site/sections.js';
import { EASE } from './motion/primitives.js';

/*
 * The public header, on every marketing page.
 *
 *   brand + sub-line | Solutions ▾ · Apply Now · Contact Us · FAQ | lang · Login · Start for Free
 *
 * The four "what you get" pages (Bima Sakhi, Benefits, Procedure, Career)
 * sit under the Solutions dropdown — see SOLUTIONS in pages/site/sections.js,
 * which the router and footer read too, so they cannot drift apart. Labels
 * are {hi, en} pairs and re-resolve with the language switch.
 *
 * The full bar needs ~1100px, so it appears from `xl`; below that the links
 * move into the menu and only the primary button stays in the bar.
 */

const LABELS = {
  login: { hi: 'लॉग इन', en: 'Login' },
  start: { hi: 'मुफ़्त शुरू करें', en: 'Start for Free' },
  faq: { hi: 'सवाल-जवाब', en: 'FAQ' },
  menu: { hi: 'मेनू', en: 'Menu' },
  open: { hi: 'मेनू खोलें', en: 'Open menu' },
  close: { hi: 'मेनू बंद करें', en: 'Close menu' },
};

/** px of continuous travel before the bar hides (down) or returns (up). */
const HIDE_AFTER = 24;
const SHOW_AFTER = 48;

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-[15px] font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-ember ${
    isActive ? 'text-ink' : 'text-plum hover:text-ink'
  }`;

// No display utility here: each use sets its own (`inline-flex`, or
// `hidden sm:inline-flex`), so a base `inline-flex` can't override `hidden`.
const startClass =
  'items-center justify-center rounded-xl bg-ink font-semibold text-cream shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_12px_26px_-12px_rgba(21,13,61,0.7)] transition-[background-color,transform] duration-300 ease-out-expo hover:bg-ink-soft active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember';

const AcademyNav = () => {
  const { t } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [solutions, setSolutions] = useState(false);
  const lenis = useLenis();
  const { scrollY } = useScroll();

  /*
   * Tucked away while reading downwards, back once the reader deliberately
   * scrolls up. The pinned chapters on the landing page get the whole screen
   * that way.
   *
   * The decision is made on distance travelled in one direction, not on the
   * per-frame delta. Lenis eases every scroll, so a single downward gesture
   * produces runs of sub-pixel frames; judging each frame on its own flipped
   * the bar shown/hidden dozens of times per gesture — the jitter. Only a
   * reversal resets the run, and only a run past the threshold changes state.
   */
  const run = useRef(0);
  useMotionValueEvent(scrollY, 'change', (y) => {
    const dy = y - (scrollY.getPrevious() ?? y);
    setScrolled(y > 12);

    if (y < 480) {
      run.current = 0;
      setHidden(false);
      return;
    }
    if (dy === 0) return;
    run.current = Math.sign(dy) === Math.sign(run.current) ? run.current + dy : dy;
    if (run.current > HIDE_AFTER) setHidden(true);
    else if (run.current < -SHOW_AFTER) setHidden(false);
  });

  // The menu stops the page behind it from scrolling — through Lenis when
  // the page runs it (a plain overflow lock would not stop Lenis), and the
  // body as a fallback.
  useEffect(() => {
    if (open) lenis?.stop();
    else lenis?.start();
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
      lenis?.start();
    };
  }, [open, lenis]);

  const close = () => setOpen(false);

  return (
    <>
      <header
        className={[
          // `translate`, not `transform`: Tailwind v4's translate-* utilities set
          // the standalone CSS property, which a `transform` transition ignores.
          'fixed inset-x-0 top-0 z-50 border-b bg-white/90 backdrop-blur-xl transition-[translate,box-shadow,border-color] duration-500 ease-out-expo will-change-[translate]',
          hidden && !open && !solutions ? '-translate-y-full' : 'translate-y-0',
          scrolled ? 'border-ink/[0.07] shadow-soft' : 'border-ink/[0.06]',
        ].join(' ')}
      >
        <div className="mx-auto flex h-[4.75rem] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Brand onClick={close} />

          <nav className="hidden flex-1 items-center justify-center gap-1 xl:flex" aria-label="Primary navigation">
            <SolutionsDropdown open={solutions} onOpenChange={setSolutions} />
            {NAV_LINKS.map((p) => (
              <NavLink key={p.path} to={p.path} className={linkClass}>
                {t(p.nav)}
              </NavLink>
            ))}
            <Link to="/#faq" className={linkClass({ isActive: false })}>
              {t(LABELS.faq)}
            </Link>
          </nav>

          <div className="hidden items-center gap-3 xl:flex">
            <LangSwitch />
            <NavLink
              to="/login"
              className="rounded-lg px-2 py-2 text-[15px] font-medium text-ink transition-colors hover:text-ember-deep focus-visible:outline-2 focus-visible:outline-ember"
            >
              {t(LABELS.login)}
            </NavLink>
            <Link to="/register" className={`${startClass} inline-flex h-11 px-5 text-[15px]`}>
              {t(LABELS.start)}
            </Link>
          </div>

          <div className="flex items-center gap-2 xl:hidden">
            <Link to="/register" className={`${startClass} hidden h-10 px-4 text-sm sm:inline-flex`} onClick={close}>
              {t(LABELS.start)}
            </Link>
            <button
              type="button"
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl bg-white text-ink ring-1 ring-ink/10"
              aria-expanded={open}
              aria-label={open ? t(LABELS.close) : t(LABELS.open)}
              onClick={() => setOpen((o) => !o)}
            >
              <span className="sr-only">{t(LABELS.menu)}</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {open ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h10" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label={t(LABELS.close)}
              className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-[2px] xl:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: EASE }}
              onClick={close}
            />
            <motion.nav
              data-lenis-prevent
              className="fixed left-0 right-0 top-[4.75rem] z-40 max-h-[calc(100dvh-4.75rem)] overflow-y-auto overscroll-contain border-b border-ink/[0.06] bg-white shadow-card xl:hidden"
              initial={{ height: 0, opacity: 0.9 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0.9 }}
              transition={{ duration: 0.35, ease: EASE }}
              aria-label="Mobile navigation"
            >
              <div className="mx-auto flex max-w-3xl flex-col gap-1 px-4 py-4 sm:px-6">
                <SolutionsList onNavigate={close} />
                <div className="my-2 h-px bg-ink/[0.07]" />
                {NAV_LINKS.map((p, i) => (
                  <motion.div
                    key={p.path}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.05, duration: 0.3, ease: EASE }}
                  >
                    <NavLink
                      to={p.path}
                      onClick={close}
                      className={({ isActive }) =>
                        `flex min-h-[48px] items-center rounded-xl px-3 py-3 font-display text-lg font-bold ${
                          isActive ? 'text-ember-deep' : 'text-ink'
                        } hover:bg-cream`
                      }
                    >
                      {t(p.nav)}
                    </NavLink>
                  </motion.div>
                ))}
                <Link to="/#faq" onClick={close} className="flex min-h-[48px] items-center rounded-xl px-3 py-3 font-display text-lg font-bold text-ink hover:bg-cream">
                  {t(LABELS.faq)}
                </Link>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-cream px-3 py-3">
                  <LangSwitch />
                  <NavLink to="/login" onClick={close} className="px-2 text-[15px] font-semibold text-ink">
                    {t(LABELS.login)}
                  </NavLink>
                </div>
                <Link to="/register" onClick={close} className={`${startClass} mt-2 flex h-12 w-full text-base`}>
                  {t(LABELS.start)}
                </Link>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AcademyNav;
