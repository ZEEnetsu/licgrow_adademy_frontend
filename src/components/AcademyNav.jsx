import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import ShieldMark from '../components/ShieldMark.jsx';
import { EASE } from '../pages/landing/motion.js';

const LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Become an Agent', href: '#become-lic-agent' },
  { label: 'Mentor', href: '#mentor' },
  { label: 'Contact', href: '#contact' },
];


const AcademyNav = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <header
        className={[
          'fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-material',
          scrolled
            ? 'border-b border-black/[0.06] bg-white/95 shadow-soft backdrop-blur-[12px]'
            : 'border-b border-transparent bg-transparent',
        ].join(' ')}
      >
        <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="flex min-w-0 items-center gap-2.5 transition-transform duration-200 ease-material hover:scale-[1.02]"
            onClick={() => setOpen(false)}
          >
            <ShieldMark />
            <span className="font-semibold tracking-tight text-lic-charcoal sm:text-lg">
              LICPro <span className="text-lic-navy">Academy</span>
            </span>
          </Link>

          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label="Primary navigation"
          >
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-full px-3 py-2 text-sm font-medium text-lic-body transition-all duration-200 ease-material hover:bg-lic-ice hover:text-lic-charcoal"
              >
                {l.label}
              </a>
            ))}
            <NavLink
              to="/login"
              className="ml-2 rounded-full px-3 py-2 text-sm font-semibold text-lic-charcoal transition-all duration-200 ease-material hover:bg-lic-ice"
            >
              Login
            </NavLink>
            <Link
              to="/register"
              className="ml-1 inline-flex min-h-[48px] items-center justify-center rounded-full bg-lic-navy px-5 text-sm font-semibold text-white shadow-md transition-all duration-200 ease-material hover:scale-[1.03] hover:shadow-navy-glow"
            >
              Start for Free
            </Link>
          </nav>

          <button
            type="button"
            className="inline-flex min-h-[48px] min-w-[48px] items-center justify-center rounded-card border border-black/[0.08] bg-white/80 text-lic-charcoal md:hidden"
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
          >
            <span className="sr-only">Menu</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label="Close menu backdrop"
              className="fixed inset-0 z-40 bg-lic-charcoal/30 backdrop-blur-[2px] md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: EASE }}
              onClick={() => setOpen(false)}
            />
            <motion.nav
              className="fixed left-0 right-0 top-[4.5rem] z-40 overflow-hidden border-b border-black/[0.06] bg-white/98 shadow-card md:hidden"
              initial={{ height: 0, opacity: 0.9 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0.9 }}
              transition={{ duration: 0.35, ease: EASE }}
              aria-label="Mobile navigation"
            >
              <div className="flex flex-col gap-1 px-4 py-4">
                {LINKS.map((l, i) => (
                  <motion.a
                    key={l.href}
                    href={l.href}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3, ease: EASE }}
                    className="min-h-[48px] rounded-card px-4 py-3 text-base font-medium text-lic-charcoal hover:bg-lic-ice"
                    onClick={() => setOpen(false)}
                  >
                    {l.label}
                  </motion.a>
                ))}
                <NavLink
                  to="/login"
                  className="min-h-[48px] rounded-card px-4 py-3 text-base font-semibold text-lic-charcoal hover:bg-lic-ice"
                  onClick={() => setOpen(false)}
                >
                  Login
                </NavLink>
                <Link
                  to="/register"
                  className="mt-2 inline-flex min-h-[48px] items-center justify-center rounded-full bg-lic-navy px-5 text-base font-semibold text-white shadow-md"
                  onClick={() => setOpen(false)}
                >
                  Start for Free
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
