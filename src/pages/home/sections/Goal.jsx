import { useRef } from 'react';
import { motion, useTransform } from 'framer-motion';

import { useLang } from '../../../i18n/index.js';
import { COMMON, GOAL } from '../content.js';
import SplitText from '../../../components/motion/SplitText.jsx';
import Reveal from '../../../components/motion/Reveal.jsx';
import { EXPO, inr, useProgress } from '../../../components/motion/primitives.js';
import { Eyebrow, IllustrationBadge, TextLink } from '../../../components/ui/atoms.jsx';

function Step({ progress, index, total, children }) {
  const at = index / total;
  const fill = useTransform(progress, [at, at + 0.06], [0, 1]);
  const ink = useTransform(progress, [at, at + 0.06], [0.45, 1]);
  return (
    <li className="relative flex gap-5 pb-9 last:pb-0">
      <span className="relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-full bg-cream ring-2 ring-ink/12">
        <motion.span className="absolute inset-0 rounded-full bg-ember" style={{ opacity: fill, scale: fill }} />
        <span className="relative font-display text-sm font-bold text-ink mix-blend-normal">{index + 1}</span>
      </span>
      <motion.p style={{ opacity: ink }} className="pt-2 text-lg font-semibold leading-snug text-ink sm:text-xl">
        {children}
      </motion.p>
    </li>
  );
}

function IncomeChart() {
  const { t } = useLang();
  const { values } = GOAL.chart;
  const max = Math.max(...values);
  const goalPct = (100000 / max) * 100;

  return (
    <figure className="rounded-panel bg-white p-6 shadow-card ring-1 ring-ink/6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-lg font-bold text-ink">{t(GOAL.chart.title)}</h3>
        <IllustrationBadge>{t(COMMON.illustrationOnly)}</IllustrationBadge>
      </div>

      <div className="relative mt-12 h-64 sm:h-72">
        <div
          className="pointer-events-none absolute inset-x-0 z-10 border-t-2 border-dashed border-ember"
          style={{ bottom: `${goalPct}%` }}
        />
        <p className="absolute -top-6 left-0 inline-flex items-center gap-2 text-[11px] font-bold text-ember-deep">
          <span className="w-5 border-t-2 border-dashed border-ember" />
          {t(GOAL.chart.goalLine)}
        </p>
        <div className="flex h-full items-end gap-3 sm:gap-5">
          {values.map((v, i) => (
            <div key={v} className="flex h-full flex-1 flex-col items-center justify-end">
              <motion.span
                className="mb-2 text-[11px] font-bold tabular-nums text-ink sm:text-xs"
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ delay: 0.5 + i * 0.12, duration: 0.6 }}
              >
                ₹{inr(v)}
              </motion.span>
              <motion.span
                className={`w-full origin-bottom rounded-t-xl ${v >= 100000 ? 'bg-ember' : 'bg-peach'}`}
                style={{ height: `${(v / max) * 100}%` }}
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ delay: 0.1 + i * 0.12, duration: 1.1, ease: EXPO }}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex gap-3 sm:gap-5">
        {values.map((v, i) => (
          <span key={v} className="flex-1 text-center text-xs font-semibold text-plum">
            {t(GOAL.chart.year)} {i + 1}
          </span>
        ))}
      </div>

      <figcaption className="mt-6 space-y-2 border-t border-ink/8 pt-5 text-xs leading-relaxed text-plum/70">
        <p>{t(GOAL.chart.caption)}</p>
        <p>{t(COMMON.illustrationNote)}</p>
      </figcaption>
    </figure>
  );
}

/**
 * Chapter 8 — Rohit's goal. The quote holds still on the left while the
 * plan scrolls past on the right; an ember line fills down the timeline and
 * each step lights as the reader reaches it.
 */
export default function Goal() {
  const { t } = useLang();
  const list = useRef(null);
  const scrollYProgress = useProgress({ target: list, offset: ['start 0.72', 'end 0.55'] });
  const line = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section id="goal" className="bg-cream py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-16 px-4 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-8">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Reveal y={12}>
            <Eyebrow tone="mint">{t(GOAL.eyebrow)}</Eyebrow>
          </Reveal>
          <SplitText
            as="h2"
            text={t(GOAL.headline)}
            highlight="1"
            className="h-display mt-6 text-[clamp(2.4rem,5vw,4.5rem)] font-extrabold text-ink"
          />
          <Reveal as="p" delay={0.15} className="mt-5 text-lg text-plum">
            {t(GOAL.sub)}
          </Reveal>

          <Reveal delay={0.25} className="relative mt-10 rounded-panel bg-ink p-7 text-cream sm:p-9">
            <span aria-hidden className="absolute -top-6 left-7 font-display text-8xl font-extrabold leading-none text-ember">
              “
            </span>
            <blockquote className="relative text-lg leading-relaxed text-cream/90">{t(GOAL.quote)}</blockquote>
            <p className="mt-5 font-hand text-3xl text-peach">{t(GOAL.by)}</p>
          </Reveal>
          <Reveal as="p" delay={0.3} className="mt-5 text-sm font-semibold text-ink">
            {t(COMMON.effort)}
          </Reveal>
        </div>

        <div>
          <Reveal as="h3" className="caps text-xs font-bold text-plum/70">
            {t(GOAL.planLabel)}
          </Reveal>
          <ol ref={list} className="relative mt-8">
            <span aria-hidden className="absolute bottom-6 left-[21px] top-2 w-[2px] rounded-full bg-ink/10">
              <motion.span className="block h-full w-full origin-top rounded-full bg-ember" style={{ scaleY: line }} />
            </span>
            {GOAL.plan.map((s, i) => (
              <Step key={i} progress={scrollYProgress} index={i} total={GOAL.plan.length}>
                {t(s)}
              </Step>
            ))}
          </ol>

          <Reveal className="mt-14">
            <IncomeChart />
          </Reveal>
          <TextLink to="/be-your-own-boss" className="mt-6">
            {t(GOAL.more)}
          </TextLink>
        </div>
      </div>
    </section>
  );
}
