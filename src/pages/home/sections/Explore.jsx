import { useRef } from 'react';
import { motion, useInView, useReducedMotion, useTransform } from 'framer-motion';

import { useLang } from '../../../i18n/index.js';
import { EXPLORE } from '../content.js';
import SplitText from '../../../components/motion/SplitText.jsx';
import Reveal from '../../../components/motion/Reveal.jsx';
import { EXPO, useProgress } from '../../../components/motion/primitives.js';
import { Eyebrow, TextLink } from '../../../components/ui/atoms.jsx';
import Icon from '../../../components/ui/Icon.jsx';

/** The Kedarnath frame opens from an inset card to full bleed as it scrolls in. */
function OpeningShot() {
  const { t } = useLang();
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const scrollYProgress = useProgress({ target: ref, offset: ['start end', 'start 0.1'] });
  const clip = useTransform(
    scrollYProgress,
    [0, 1],
    reduce
      ? ['inset(0% 0% 0% 0% round 0px)', 'inset(0% 0% 0% 0% round 0px)']
      : ['inset(10% 9% 10% 9% round 40px)', 'inset(0% 0% 0% 0% round 0px)'],
  );
  const scale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1.28, 1]);

  return (
    <div ref={ref} className="relative h-[92svh] min-h-[34rem]">
      <motion.div className="absolute inset-0 overflow-hidden will-change-[clip-path]" style={{ clipPath: clip }}>
        <motion.img
          src={EXPLORE.hero.src}
          alt={t(EXPLORE.hero.alt)}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
          style={{ scale }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(21,13,61,0.05)_30%,rgba(21,13,61,0.85))]" />
      </motion.div>

      <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8 lg:pb-20">
        <Reveal y={12}>
          <Eyebrow tone="dark">{t(EXPLORE.eyebrow)}</Eyebrow>
        </Reveal>
        <SplitText
          as="h2"
          text={t(EXPLORE.title)}
          className="h-display mt-5 max-w-4xl text-[clamp(2.75rem,7vw,6.5rem)] font-extrabold text-cream"
        />
        <Reveal as="p" delay={0.2} className="mt-5 max-w-xl text-lg text-cream/85 sm:text-xl">
          {t(EXPLORE.lede)}
        </Reveal>
      </div>
    </div>
  );
}

/** School → … → "If only…", struck through, then "Live by design." */
function LifeScript() {
  const { t } = useLang();
  const ref = useRef(null);
  const on = useInView(ref, { once: true, amount: 0.6 });
  const n = EXPLORE.script.length;
  const strikeAt = 0.2 + n * 0.12 + 0.3;

  return (
    <div ref={ref} className="mx-auto max-w-5xl text-center">
      <p className="caps text-xs font-bold text-plum/70">{t(EXPLORE.scriptLabel)}</p>
      <div className="mt-8 inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-3">
        {EXPLORE.script.map((s, i) => (
          <motion.span
            key={s.en}
            className="inline-flex items-center gap-2"
            initial={{ opacity: 0, y: 14 }}
            animate={on ? { opacity: i === n - 1 ? 1 : 0.55, y: 0 } : undefined}
            transition={{ delay: 0.2 + i * 0.12, duration: 0.6, ease: EXPO }}
          >
            <span
              className={`relative rounded-full px-4 py-2 text-[15px] font-semibold ring-1 ${
                i === n - 1 ? 'bg-ink text-cream ring-ink' : 'bg-white text-ink ring-ink/10'
              }`}
            >
              {t(s)}
              {/* each step is struck through in turn, so it reads right when the row wraps */}
              {i < n - 1 ? (
                <motion.span
                  aria-hidden
                  className="absolute inset-x-2 top-1/2 h-[2.5px] origin-left -rotate-2 rounded-full bg-ember"
                  initial={{ scaleX: 0 }}
                  animate={on ? { scaleX: 1 } : undefined}
                  transition={{ delay: strikeAt + i * 0.12, duration: 0.35, ease: [0.65, 0, 0.35, 1] }}
                />
              ) : null}
            </span>
            {i < n - 1 ? <Icon name="arrowRight" className="h-4 w-4 text-plum/40" /> : null}
          </motion.span>
        ))}
      </div>
      <motion.p
        className="mx-auto mt-8 max-w-2xl text-lg text-plum"
        initial={{ opacity: 0 }}
        animate={on ? { opacity: 1 } : undefined}
        transition={{ delay: strikeAt + n * 0.12 + 0.2, duration: 0.8 }}
      >
        {t(EXPLORE.scriptQuestion)}
      </motion.p>
      <SplitText
        as="p"
        text={t(EXPLORE.design)}
        highlight={['design', 'गढ़िए']}
        delay={0.2}
        className="h-display mt-10 text-[clamp(2.25rem,5.4vw,4.75rem)] font-extrabold text-ink"
      />
      <Reveal as="p" delay={0.3} className="mt-5 font-hand text-[1.75rem] text-ember-deep">
        {t(EXPLORE.designNote)}
      </Reveal>
    </div>
  );
}

function Place({ place, progress, shift, className = '' }) {
  const { t } = useLang();
  const y = useTransform(progress, [0, 1], [shift, -shift]);
  return (
    <motion.figure style={{ y }} className={`group relative overflow-hidden rounded-[24px] ${className}`}>
      <img
        src={place.src}
        alt={t(place.alt)}
        loading="lazy"
        decoding="async"
        className="aspect-[3/4] h-full w-full object-cover transition-transform duration-[1.4s] ease-out-expo group-hover:scale-105"
      />
      <figcaption className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-cream/90 px-3 py-1.5 text-xs font-bold text-ink backdrop-blur">
        <Icon name="pin" className="h-3.5 w-3.5 text-ember" />
        {t(place.name)}
      </figcaption>
    </motion.figure>
  );
}

/**
 * Chapter 10 — Earn & Explore India. Opening clip-path reveal, the three
 * taglines, the "default life script" crossed out, and a parallax postcard
 * wall of destinations.
 */
export default function Explore() {
  const { t } = useLang();
  const wall = useRef(null);
  const reduce = useReducedMotion();
  const scrollYProgress = useProgress({ target: wall, offset: ['start end', 'end start'] });
  const shifts = reduce ? [0, 0, 0, 0] : [50, -30, 80, -10];

  return (
    <section id="explore" className="relative overflow-clip bg-cream">
      <OpeningShot />

      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="grid gap-2">
          {EXPLORE.taglines.map((line, i) => (
            <SplitText
              key={line.en}
              as="p"
              text={t(line)}
              delay={i * 0.18}
              className={`h-display text-[clamp(2.5rem,7vw,6.25rem)] font-extrabold ${
                i === EXPLORE.taglines.length - 1 ? 'text-ember' : 'text-ink'
              }`}
            />
          ))}
        </div>
        <Reveal as="p" className="mt-10 max-w-2xl text-xl font-semibold leading-snug text-plum">
          {t(EXPLORE.band)}
        </Reveal>

        <div className="mt-28">
          <LifeScript />
        </div>

        <div ref={wall} className="mt-28 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {EXPLORE.places.map((p, i) => (
            <Place key={p.src} place={p} progress={scrollYProgress} shift={shifts[i]} className={i % 2 ? 'lg:mt-16' : ''} />
          ))}
        </div>

        <div className="mt-24 grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <Reveal as="blockquote" className="font-hand text-[clamp(2rem,4vw,3.25rem)] leading-[1.1] text-ink">
            “{t(EXPLORE.passport)}”
          </Reveal>
          <Reveal delay={0.15} className="rounded-[22px] bg-sand p-6 ring-1 ring-ink/6">
            <p className="text-[15px] leading-relaxed text-plum">{t(EXPLORE.honest)}</p>
            <TextLink to="/explore-india" className="mt-4">
              {t(EXPLORE.more)}
            </TextLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
