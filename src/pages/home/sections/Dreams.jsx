import { useRef } from 'react';
import { motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';

import { useLang } from '../../../i18n/index.js';
import { DREAMS } from '../content.js';
import ScrollWords from '../../../components/motion/ScrollWords.jsx';
import Reveal from '../../../components/motion/Reveal.jsx';
import { useMedia, useProgress } from '../../../components/motion/primitives.js';
import { Eyebrow } from '../../../components/ui/atoms.jsx';
import { TONE_BG, TONE_ICON } from '../../../components/ui/tones.js';
import Icon from '../../../components/ui/Icon.jsx';

const TILT = [-5, 4, -3, 5, -4, 3];

function DreamCard({ item, index, className = '', style }) {
  const { t } = useLang();
  return (
    <motion.div
      style={style}
      className={`flex aspect-[4/5] flex-col justify-between rounded-[22px] p-5 shadow-card ring-1 ring-ink/6 ${TONE_BG[item.tone]} ${className}`}
    >
      <div className="flex items-start justify-between">
        <span className={`grid h-12 w-12 place-items-center rounded-2xl ${TONE_ICON[item.tone]}`}>
          <Icon name={item.icon} className="h-6 w-6" />
        </span>
        <span className="font-display text-sm font-bold tabular-nums text-ink/35">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>
      <p className="h-display text-[clamp(1.05rem,1.5vw,1.35rem)] font-bold text-ink">{t(item.text)}</p>
    </motion.div>
  );
}

function PinnedCard({ item, index, progress }) {
  const a = 0.3 + index * 0.09;
  const seg = [a, a + 0.12];
  const y = useTransform(progress, seg, [140, 0]);
  const rotate = useTransform(progress, seg, [TILT[index] * 2.5, TILT[index] * 0.25]);
  const opacity = useTransform(progress, [a, a + 0.05], [0, 1]);
  const scale = useTransform(progress, seg, [0.88, 1]);
  return <DreamCard item={item} index={index} style={{ y, rotate, opacity, scale }} />;
}

/**
 * Chapter 2 — "If you have dreams…"
 *
 * On large screens the chapter pins: the prompt reads itself word by word,
 * then the six dreams fly in one at a time and settle into a board, as if
 * the reader were pinning them up. Small screens and reduced motion get a
 * plain revealed grid.
 */
export default function Dreams() {
  const { t } = useLang();
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const wide = useMedia('(min-width: 1024px)');
  const pinned = wide && !reduce;

  const scrollYProgress = useProgress({ target: ref, offset: ['start start', 'end end'] });
  const still = useMotionValue(1);
  const p = pinned ? scrollYProgress : still;
  const words = useTransform(p, [0.02, 0.3], [0, 1]);

  return (
    <section
      id="dreams"
      ref={ref}
      className={`relative bg-cream ${pinned ? 'h-[330vh]' : 'py-24 sm:py-32'}`}
    >
      <div className={pinned ? 'sticky top-0 flex h-screen items-center overflow-hidden' : ''}>
        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.15fr] lg:gap-16 lg:px-8">
          <div>
            <Eyebrow tone="peach">{t(DREAMS.eyebrow)}</Eyebrow>
            <ScrollWords
              as="p"
              text={t(DREAMS.prompt)}
              progress={pinned ? words : undefined}
              className="h-display mt-6 text-[clamp(2rem,4.2vw,3.75rem)] font-bold text-ink"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {DREAMS.items.map((item, i) =>
              pinned ? (
                <PinnedCard key={item.icon} item={item} index={i} progress={scrollYProgress} />
              ) : (
                <Reveal key={item.icon} delay={i * 0.07}>
                  <DreamCard item={item} index={i} />
                </Reveal>
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
