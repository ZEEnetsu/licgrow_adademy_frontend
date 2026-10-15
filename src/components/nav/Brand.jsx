import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useSpring, useTransform } from 'framer-motion';

import { useLang } from '../../i18n/index.js';
import { EXPO } from '../motion/primitives.js';
import BrandMark from './BrandMark.jsx';

// Module scope, so the component identity is stable across renders.
const MotionLink = motion.create(Link);

const NAME = 'licgrow';
const ACCENT = [3, 4, 5, 6]; // "grow"

const press = { rest: { scale: 1 }, hover: { scale: 1 }, tap: { scale: 0.97 } };

// Each letter's stack rises one slot: the copy underneath rolls into place.
const roll = {
  hidden: { y: '0em' },
  rest: (i) => ({ y: '0em', transition: { duration: 0.45, ease: EXPO, delay: i * 0.012 } }),
  hover: (i) => ({ y: '-1.6em', transition: { duration: 0.55, ease: EXPO, delay: i * 0.018 } }),
};

const underline = {
  hidden: { scaleX: 0 },
  rest: { scaleX: 0, transition: { duration: 0.3, ease: EXPO } },
  hover: { scaleX: 1, transition: { duration: 0.5, ease: EXPO, delay: 0.12 } },
};

/**
 * Pointer → spring-driven lean for the logo. `move` and `reset` go on the
 * link, so the logo leans toward the pointer anywhere over the brand, not
 * only over itself. Mouse only: on touch there is no hover to lean into.
 */
function useTilt(off) {
  const ref = useRef(null);
  const mx = useSpring(0, { stiffness: 220, damping: 15, mass: 0.6 });
  const my = useSpring(0, { stiffness: 220, damping: 15, mass: 0.6 });
  const x = useTransform(mx, [-1, 1], [-4, 4]);
  const y = useTransform(my, [-1, 1], [-4, 4]);
  const rotateY = useTransform(mx, [-1, 1], [-18, 18]);
  const rotateX = useTransform(my, [-1, 1], [18, -18]);

  const clamp = (v) => Math.max(-1, Math.min(1, v));
  const move = (e) => {
    if (off || e.pointerType !== 'mouse' || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set(clamp((e.clientX - (r.left + r.width / 2)) / 120));
    my.set(clamp((e.clientY - (r.top + r.height / 2)) / 24));
  };
  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  return { ref, move, reset, style: { x, y, rotateX, rotateY, transformPerspective: 400 } };
}

/**
 * The name, letter by letter, each in its own mask with a copy parked below
 * it. On hover the letters roll up in a quick stagger and the copy, with
 * "grow" in the accent, takes their place. Latin only, so splitting by
 * character is safe here (it would tear Devanagari apart).
 */
function RollText({ accentClass, reduced }) {
  if (reduced) return NAME;
  return (
    <>
      <span className="sr-only">{NAME}</span>
      <span aria-hidden>
        {[...NAME].map((c, i) => {
          const ch = c === ' ' ? ' ' : c;
          return (
            <span key={i} className="-my-[0.15em] inline-block overflow-hidden py-[0.15em] align-bottom">
              <motion.span className="relative inline-block" variants={roll} custom={i}>
                {ch}
                <span className={`absolute left-0 top-[1.6em] ${ACCENT.includes(i) ? accentClass : ''}`}>{ch}</span>
              </motion.span>
            </span>
          );
        })}
      </span>
    </>
  );
}

/** Rohit Lal's name, with an ember line that draws in under it on hover. */
function Name({ className, children }) {
  return (
    <span className={`relative ${className}`}>
      {children}
      <motion.span
        aria-hidden
        variants={underline}
        className="absolute inset-x-0 bottom-px h-[1.5px] origin-left rounded-full bg-ember"
      />
    </span>
  );
}

/**
 * Logo mark, name and the "By Rohit Lal · Development Officer, LIC" line —
 * the header's brand block, also used on the sign-in panels. `dark` is for
 * ink backgrounds, and switches the mark from ink to ember.
 *
 * The link owns the motion: it runs the `hidden` → `rest` entrance and the
 * `hover` / `tap` states, and every animated piece inside (BrandMark, the
 * rolling name, the underline) just declares what each state looks like.
 */
export default function Brand({ onClick, dark = false }) {
  const { lang } = useLang();
  const reduced = useReducedMotion();
  const tilt = useTilt(reduced);
  const strong = dark ? 'text-cream' : 'text-ink';
  return (
    <MotionLink
      to="/"
      onClick={onClick}
      initial={reduced ? false : 'hidden'}
      animate="rest"
      whileHover="hover"
      whileTap="tap"
      variants={press}
      onPointerMove={tilt.move}
      onPointerLeave={tilt.reset}
      className="group flex min-w-0 items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-ember"
    >
      <BrandMark dark={dark} reduced={reduced} tilt={tilt} />
      <span className="min-w-0 leading-tight">
        <span className={`block font-display text-[19px] font-bold tracking-tight ${strong}`}>
          <RollText accentClass={dark ? 'text-peach' : 'text-ember-deep'} reduced={reduced} />
        </span>
        <span className={`hidden truncate text-[13px] sm:block ${dark ? 'text-cream/60' : 'text-plum/70'}`}>
          {lang === 'hi' ? (
            <>
              <Name className={`font-semibold ${strong}`}>रोहित लाल</Name> की ओर से · डेवलपमेंट ऑफिसर, LIC
            </>
          ) : (
            <>
              By <Name className={`font-semibold ${strong}`}>Rohit Lal</Name> · Development Officer, LIC
            </>
          )}
        </span>
      </span>
    </MotionLink>
  );
}
