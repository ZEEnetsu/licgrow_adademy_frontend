import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import Icon from './Icon.jsx';

/* ── eyebrow chip ──────────────────────────────────────────────────────── */

const EYEBROW_TONES = {
  mint: 'bg-mint-soft text-sage-deep ring-mint/70',
  peach: 'bg-peach-soft text-ember-deep ring-peach/70',
  dark: 'bg-white/[0.06] text-mint ring-white/15',
  plain: 'bg-white text-plum ring-ink/10',
};

/** The small rounded label above every chapter title (reference: "FREE DIGITAL BUSINESS CARD"). */
export function Eyebrow({ children, tone = 'mint', className = '' }) {
  return (
    <span
      className={`caps inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-bold ring-1 ring-inset ${EYEBROW_TONES[tone]} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {children}
    </span>
  );
}

/* ── buttons ───────────────────────────────────────────────────────────── */

/*
 * Ember carries white text only at large-text size (≥ 18.66px bold, 3:1),
 * which is why the `ember` variant is always the big one. Smaller orange
 * buttons use ember-deep, which clears 4.5:1.
 */
const VARIANTS = {
  ember:
    'h-14 px-7 text-[1.1875rem] font-bold bg-ember text-white shadow-ember hover:bg-ember-deep',
  emberSm: 'h-12 px-6 text-[15px] font-semibold bg-ember-deep text-white shadow-ember hover:bg-ink',
  ink: 'h-12 px-6 text-[15px] font-semibold bg-ink text-cream shadow-navy-glow hover:bg-ink-soft',
  ghost:
    'h-12 px-6 text-[15px] font-semibold bg-white text-ink ring-1 ring-inset ring-ink/12 shadow-soft hover:ring-ink/30',
  ghostLight:
    'h-14 px-7 text-[17px] font-semibold bg-white/[0.06] text-cream ring-1 ring-inset ring-white/20 hover:bg-white/[0.12]',
};

/**
 * Link-shaped button. `to` → router Link, `href` → plain anchor (tel:, #id).
 * The trailing icon nudges right on hover.
 */
export function Button({ to, href, variant = 'ink', icon, iconLeft, children, className = '', ...rest }) {
  const cls = `group/btn inline-flex items-center justify-center gap-2.5 rounded-full whitespace-nowrap transition-[background-color,box-shadow,transform] duration-300 ease-out-expo active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember ${VARIANTS[variant]} ${className}`;
  const inner = (
    <>
      {iconLeft ? <Icon name={iconLeft} className="h-[1.05em] w-[1.05em]" strokeWidth={2} /> : null}
      <span>{children}</span>
      {icon ? (
        <Icon
          name={icon}
          className="h-[1.05em] w-[1.05em] transition-transform duration-300 ease-out-expo group-hover/btn:translate-x-0.5"
          strokeWidth={2}
        />
      ) : null}
    </>
  );
  if (to) {
    return (
      <Link to={to} className={cls} {...rest}>
        {inner}
      </Link>
    );
  }
  return (
    <a href={href} className={cls} {...rest}>
      {inner}
    </a>
  );
}

/** Text link with an animated underline, for "See more →" style links. */
export function TextLink({ to, href, children, className = '', dark = false }) {
  const cls = `group/tl inline-flex items-center gap-1.5 text-[15px] font-semibold ${
    dark ? 'text-peach' : 'text-ember-deep'
  } ${className}`;
  const inner = (
    <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1.5px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-500 ease-out-expo group-hover/tl:bg-[length:100%_1.5px]">
      {children}
    </span>
  );
  return to ? (
    <Link to={to} className={cls}>
      {inner}
    </Link>
  ) : (
    <a href={href} className={cls}>
      {inner}
    </a>
  );
}

/* ── handwritten annotation with a drawn arrow ─────────────────────────── */

/** Caveat note plus a curling arrow that draws itself (reference: "No install…"). */
export function Annotation({ children, className = '', flip = false }) {
  return (
    <div className={`pointer-events-none flex items-start gap-1 text-plum ${className}`}>
      <svg
        viewBox="0 0 80 48"
        className={`mt-1 h-10 w-16 shrink-0 text-ember ${flip ? '-scale-x-100' : ''}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <motion.path
          d="M74 40 C 52 44, 22 36, 10 8"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.9, ease: [0.65, 0, 0.35, 1] }}
        />
        <motion.path
          d="M3 16 L10 7 L18 14"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, delay: 1.7 }}
        />
      </svg>
      <motion.span
        className="font-hand text-[1.6rem] leading-none -rotate-3"
        initial={{ opacity: 0, y: 6 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 1.2 }}
      >
        {children}
      </motion.span>
    </div>
  );
}

/* ── compliance badge ──────────────────────────────────────────────────── */

export function IllustrationBadge({ children }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-peach-soft px-2.5 py-1 text-[11px] font-bold text-ember-deep ring-1 ring-inset ring-peach">
      <Icon name="info" className="h-3.5 w-3.5" strokeWidth={2.2} />
      {children}
    </span>
  );
}
