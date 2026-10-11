import { useRef } from 'react';
import { motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';

import { useLang } from '../../../i18n/index.js';
import { BOSS } from '../content.js';
import { useProgress } from '../../../components/motion/primitives.js';
import { Eyebrow } from '../../../components/ui/atoms.jsx';

const GHOST = 'rgba(21, 13, 61, 0.14)';
const EMBER = 'rgba(250, 79, 12, 1)';

function Row({ progress, index, letter, rest }) {
  const a = 0.06 + index * 0.15;
  const seg = [a, a + 0.14];
  const color = useTransform(progress, seg, [GHOST, EMBER]);
  const clip = useTransform(progress, seg, ['inset(0 100% 0 0)', 'inset(0 0% 0 0)']);
  const x = useTransform(progress, seg, [-28, 0]);

  return (
    <div className="h-display flex items-baseline text-[clamp(3.25rem,10.5vw,10rem)] font-extrabold leading-[0.9]! tracking-[-0.05em]!">
      <motion.span className="inline-block" style={{ color }}>
        {letter}
      </motion.span>
      <motion.span className="-mb-[0.14em] inline-block pb-[0.14em] text-ink" style={{ clipPath: clip, x }}>
        {rest}
      </motion.span>
    </div>
  );
}

/**
 * Chapter 1 — the acronym, decoded by scroll.
 *
 * Pinned for ~2.6 screens. Each of B·O·S·S lights ember in turn and its word
 * wipes out of it; the closing quote lands once all four are spelled. With
 * reduced motion the chapter is a normal block, fully spelled out.
 */
export default function Boss() {
  const { t } = useLang();
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const scrollYProgress = useProgress({ target: ref, offset: ['start start', 'end end'] });
  const done = useMotionValue(1);
  const p = reduce ? done : scrollYProgress;

  const quoteOpacity = useTransform(p, [0.66, 0.8], [0, 1]);
  const quoteY = useTransform(p, [0.66, 0.8], [40, 0]);
  const bandOpacity = useTransform(p, [0.78, 0.92], [0, 1]);
  const bar = useTransform(p, [0, 1], [0, 1]);

  return (
    <section
      id="boss"
      ref={ref}
      className={`relative bg-cream ${reduce ? 'py-28' : 'h-[260vh]'}`}
      aria-label={t(BOSS.eyebrow)}
    >
      <div className={reduce ? '' : 'sticky top-0 flex h-screen items-center overflow-hidden'}>
        <div className="mx-auto grid w-full max-w-7xl items-end gap-10 px-4 sm:px-6 lg:grid-cols-[1.35fr_1fr] lg:px-8">
          <div>
            <Eyebrow tone="peach" className="mb-6">
              {t(BOSS.eyebrow)}
            </Eyebrow>
            {BOSS.rows.map((r, i) => (
              <Row key={i} progress={p} index={i} letter={r.letter} rest={r.rest} />
            ))}
          </div>

          <div className="pb-3">
            <p className="max-w-md text-lg leading-relaxed text-plum">{t(BOSS.meaning)}</p>
            <motion.blockquote
              style={{ opacity: quoteOpacity, y: quoteY }}
              className="h-display mt-8 text-[clamp(1.5rem,2.6vw,2.25rem)] font-bold text-ink"
            >
              {t(BOSS.quote)}
            </motion.blockquote>
            <motion.p style={{ opacity: bandOpacity }} className="mt-6 font-hand text-[1.75rem] leading-tight text-ember-deep">
              {t(BOSS.band)}
            </motion.p>
          </div>
        </div>

        {reduce ? null : (
          <div className="absolute inset-x-0 bottom-8 mx-auto h-[2px] w-40 overflow-hidden rounded-full bg-ink/10" aria-hidden>
            <motion.span className="block h-full origin-left bg-ember" style={{ scaleX: bar }} />
          </div>
        )}
      </div>
    </section>
  );
}
