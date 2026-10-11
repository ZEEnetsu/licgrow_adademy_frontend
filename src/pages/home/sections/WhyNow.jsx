import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';

import { useCountUp } from '../../../hooks/useCountUp.js';
import { useLang } from '../../../i18n/index.js';
import { WHY_NOW } from '../content.js';
import SplitText from '../../../components/motion/SplitText.jsx';
import { inr, useMedia, useProgress } from '../../../components/motion/primitives.js';
import { Eyebrow, TextLink } from '../../../components/ui/atoms.jsx';
import Icon from '../../../components/ui/Icon.jsx';

const CARD_TONE = {
  ink: { card: 'bg-ink text-cream', muted: 'text-cream/70', src: 'text-cream/50', num: 'text-peach', dark: true },
  peach: { card: 'bg-peach-soft text-ink', muted: 'text-plum', src: 'text-plum/60', num: 'text-ember-deep' },
  mint: { card: 'bg-mint-soft text-ink', muted: 'text-plum', src: 'text-plum/60', num: 'text-sage-deep' },
  white: { card: 'bg-white text-ink ring-1 ring-ink/8', muted: 'text-plum', src: 'text-plum/60', num: 'text-ink' },
};

function StatCard({ stat, index, total }) {
  const { t } = useLang();
  const [ref, value] = useCountUp(stat.value, { duration: 2200, threshold: 0.5 });
  const tone = CARD_TONE[stat.tone];
  return (
    <article
      className={`relative flex w-[min(30rem,84vw)] shrink-0 snap-center flex-col justify-between overflow-hidden rounded-panel p-7 shadow-card sm:p-9 lg:h-[min(36rem,72vh)] ${tone.card}`}
    >
      <div className="flex items-center justify-between">
        <span className={`font-display text-sm font-bold tabular-nums ${tone.muted}`}>
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
        <span className="h-2.5 w-2.5 rounded-full bg-ember" />
      </div>

      <div className="mt-10">
        {stat.lead ? <p className={`mb-1 text-lg font-semibold ${tone.muted}`}>{t(stat.lead)}</p> : null}
        <p ref={ref} className={`h-display text-[clamp(3rem,5.4vw,5.25rem)] font-extrabold ${tone.num}`}>
          {stat.prefix ? <span className="mr-1 align-[0.4em] text-[0.42em] tracking-normal">{t(stat.prefix)}</span> : null}
          <span>{inr(value)}</span>
          {stat.suffix ? <span className="text-[0.7em]">{stat.suffix}</span> : null}
          {stat.unit ? (
            <span className="ml-2 font-sans text-[0.3em] font-semibold tracking-normal">{t(stat.unit)}</span>
          ) : null}
        </p>
        <p className={`mt-5 text-[17px] leading-relaxed ${tone.muted}`}>{t(stat.body)}</p>
      </div>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-3 border-t border-current/10 pt-5">
        <p className={`max-w-[18rem] text-xs leading-relaxed ${tone.src}`}>{t(stat.source)}</p>
        <TextLink to={stat.link.to} dark={tone.dark}>
          {t(stat.link.label)}
        </TextLink>
      </div>
    </article>
  );
}

/**
 * Chapter 4 — "Why now? Four numbers".
 *
 * Desktop: the chapter pins and vertical scroll drives the card track
 * sideways, so the four numbers arrive one after another like slides. The
 * track's overflow is measured, and the section is exactly tall enough to
 * scroll it through. Touch screens and reduced motion get a native
 * snap carousel instead — horizontal hijacking feels wrong under a thumb.
 */
export default function WhyNow() {
  const { t } = useLang();
  const section = useRef(null);
  const track = useRef(null);
  const reduce = useReducedMotion();
  const wide = useMedia('(min-width: 1024px)');
  const pinned = wide && !reduce;

  const [dist, setDist] = useState(0);
  const distMV = useMotionValue(0);

  useEffect(() => {
    const el = track.current;
    if (!el || !pinned) return undefined;
    const measure = () => {
      const d = Math.max(0, el.scrollWidth - window.innerWidth);
      distMV.set(d);
      setDist(d);
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [pinned, distMV]);

  const scrollYProgress = useProgress({ target: section, offset: ['start start', 'end end'] });
  const x = useTransform(() => -scrollYProgress.get() * distMV.get());

  const intro = (
    <div className="flex w-[min(30rem,84vw)] shrink-0 flex-col justify-center lg:pr-10">
      <Eyebrow tone="mint" className="self-start">
        {t(WHY_NOW.eyebrow)}
      </Eyebrow>
      <SplitText
        as="h2"
        text={t(WHY_NOW.title)}
        className="h-display mt-6 text-[clamp(2.5rem,5vw,4.5rem)] font-extrabold text-ink"
      />
      {pinned ? (
        <p className="mt-8 inline-flex items-center gap-3 font-hand text-2xl text-plum">
          {t(WHY_NOW.hint)}
          <motion.span animate={{ x: [0, 8, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>
            <Icon name="arrowRight" className="h-5 w-5 text-ember" strokeWidth={2.2} />
          </motion.span>
        </p>
      ) : null}
    </div>
  );

  const cards = WHY_NOW.stats.map((s, i) => (
    <StatCard key={i} stat={s} index={i} total={WHY_NOW.stats.length} />
  ));

  if (!pinned) {
    return (
      <section id="why-now" ref={section} className="bg-cream py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{intro}</div>
        <div className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-6 [scrollbar-width:none] sm:px-6 lg:px-8">
          {cards}
        </div>
      </section>
    );
  }

  return (
    <section
      id="why-now"
      ref={section}
      className="relative bg-cream"
      style={{ height: `calc(100vh + ${dist}px)` }}
    >
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <motion.div
          ref={track}
          style={{ x }}
          className="flex w-max items-center gap-6 pl-[max(2rem,calc((100vw-80rem)/2+2rem))] pr-[12vw] will-change-transform"
        >
          {intro}
          {cards}
        </motion.div>
        <div className="mx-auto mt-10 h-[2px] w-56 overflow-hidden rounded-full bg-ink/10" aria-hidden>
          <motion.span className="block h-full origin-left bg-ember" style={{ scaleX: scrollYProgress }} />
        </div>
      </div>
    </section>
  );
}
