import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

import { fadeUp, stagger } from './motion.js';

const COLS = [
  {
    title: 'Platform',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'How it works', href: '#how-it-works' },
      { label: 'Dashboard', href: '/dashboard' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#problem' },
      { label: 'Contact', href: '#contact' },
      { label: 'Careers', href: '#contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy policy', href: '#' },
      { label: 'Terms of service', href: '#' },
    ],
  },
];

function ShieldMark({ className = '' }) {
  return (
    <span
      className={[
        'inline-grid h-10 w-10 place-items-center rounded-card bg-gradient-to-br from-lic-teal to-lic-sky text-white shadow-soft',
        className,
      ].join(' ')}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1.06 13.54l-3.3-3.3 1.41-1.41 1.89 1.89 4.78-4.78 1.41 1.41-6.19 6.19z" />
      </svg>
    </span>
  );
}

const LandingFooter = () => (
  <footer
    id="contact"
    className="scroll-mt-24 bg-lic-charcoal py-16 text-white sm:py-20"
  >
    <motion.div
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.08 }}
      variants={stagger(0.05, 0.1)}
    >
      <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
        <motion.div variants={fadeUp} className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <ShieldMark />
            <span className="text-lg font-semibold tracking-tight">LICPro Academy</span>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-white/70">
            Empowering the next generation of LIC agents across India.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            {['LinkedIn', 'Instagram', 'YouTube', 'WhatsApp'].map((s) => (
              <a
                key={s}
                href="#"
                className="rounded-full border border-white/20 px-3 py-2 text-xs font-medium text-white/80 transition-colors duration-200 hover:border-lic-sky hover:text-white"
              >
                {s}
              </a>
            ))}
          </div>
        </motion.div>

        <div className="grid gap-10 sm:grid-cols-3">
          {COLS.map((col) => (
            <motion.div key={col.title} variants={fadeUp}>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-lic-sky/90">
                {col.title}
              </p>
              <ul className="mt-4 space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    {l.href.startsWith('#') ? (
                      <a
                        href={l.href}
                        className="text-sm text-white/75 transition-colors duration-200 hover:text-white"
                      >
                        {l.label}
                      </a>
                    ) : (
                      <Link
                        to={l.href}
                        className="text-sm text-white/75 transition-colors duration-200 hover:text-white"
                      >
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        variants={fadeUp}
        className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-center text-xs text-white/55 sm:flex-row sm:text-left"
      >
        <p>© {new Date().getFullYear()} LICPro Academy. All rights reserved.</p>
        <p>Made with <span aria-hidden>❤️</span> for aspiring LIC agents across India</p>
      </motion.div>
    </motion.div>
  </footer>
);

export default LandingFooter;
