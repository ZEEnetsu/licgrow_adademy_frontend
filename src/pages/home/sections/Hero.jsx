import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { useLang } from '../../../i18n/index.js';
import { HERO, GOAL, JOIN, PHONE } from '../content.js';
import SplitText from '../../../components/motion/SplitText.jsx';
import Reveal from '../../../components/motion/Reveal.jsx';
import { EXPO } from '../../../components/motion/primitives.js';
import { Annotation, Button, Eyebrow } from '../../../components/ui/atoms.jsx';
import Icon from '../../../components/ui/Icon.jsx';

const TAB_MS = 4800;

/* ── phone screens ─────────────────────────────────────────────────────── */

function GoalScreen() {
  const { t } = useLang();
  const c = HERO.card;
  const max = Math.max(...GOAL.chart.values);
  return (
    <div className="flex h-full flex-col">
      <div className="relative bg-ink px-5 pb-12 pt-10 text-cream">
        <div className="absolute inset-0 opacity-60 [background:radial-gradient(120%_80%_at_90%_0%,rgba(250,79,12,0.35),transparent_60%)]" />
        <div className="relative flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-peach font-display text-sm font-extrabold text-ink ring-2 ring-cream/30">
            RL
          </span>
          <div className="min-w-0">
            <p className="font-display text-[15px] font-bold leading-tight">{t(c.name)}</p>
            <p className="truncate text-[11px] text-cream/70">{t(c.role)}</p>
          </div>
        </div>
      </div>
      <div className="relative -mt-8 mx-3 rounded-2xl bg-white p-4 shadow-card ring-1 ring-ink/5">
        <p className="caps text-[9px] font-bold text-sage-deep">{t(c.goalLabel)}</p>
        <p className="mt-1 font-display text-[26px] font-extrabold leading-none tracking-tight text-ink">
          {c.goalValue}
          <span className="ml-1 text-[11px] font-semibold tracking-normal text-plum/70">{t(c.goalUnit)}</span>
        </p>
        <p className="mt-1 text-[11px] text-plum/70">{t(c.goalWhen)}</p>
        <div className="relative mt-3 flex h-16 items-end gap-1.5">
          <span
            className="absolute inset-x-0 border-t border-dashed border-ember/60"
            style={{ bottom: `${(100000 / max) * 100}%` }}
          />
          {GOAL.chart.values.map((v, i) => (
            <motion.span
              key={v}
              className={`flex-1 origin-bottom rounded-t-[4px] ${v >= 100000 ? 'bg-ember' : 'bg-peach'}`}
              style={{ height: `${(v / max) * 100}%` }}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 0.25 + i * 0.08, duration: 0.8, ease: EXPO }}
            />
          ))}
        </div>
      </div>
      <div className="mt-auto grid grid-cols-2 gap-2 p-3">
        <span className="flex h-9 items-center justify-center gap-1.5 rounded-full bg-ink text-[11px] font-semibold text-cream">
          <Icon name="phone" className="h-3.5 w-3.5" /> {PHONE.display}
        </span>
        <span className="flex h-9 items-center justify-center rounded-full bg-white text-[11px] font-semibold text-ink ring-1 ring-ink/10">
          {t(c.apply)}
        </span>
      </div>
    </div>
  );
}

function ListScreen({ title, items, numbered = false, top = false }) {
  const { t } = useLang();
  const list = top ? [...items].reverse() : items;
  return (
    <div className="flex h-full flex-col px-4 pb-4 pt-10">
      <p className="caps text-[9px] font-bold text-sage-deep">{t(title)}</p>
      <ol className="mt-3 flex flex-1 flex-col gap-1.5">
        {list.map((item, i) => (
          <motion.li
            key={i}
            className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[11px] font-medium leading-snug ring-1 ${
              top && i === 0 ? 'bg-ember text-white ring-ember' : 'bg-white text-ink ring-ink/6'
            }`}
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08 + i * 0.06, duration: 0.6, ease: EXPO }}
          >
            <span
              className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[9px] font-bold ${
                top && i === 0 ? 'bg-white/25' : 'bg-mint-soft text-sage-deep'
              }`}
            >
              {numbered ? (top ? list.length - i : i + 1) : <Icon name="check" className="h-3 w-3" strokeWidth={3} />}
            </span>
            <span className="line-clamp-2">{typeof item === 'string' ? item : t(item)}</span>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}

const SCREENS = {
  goal: () => <GoalScreen />,
  plan: () => <ListScreen title={GOAL.planLabel} items={GOAL.plan} />,
  path: () => <ListScreen title={JOIN.title} items={JOIN.steps} numbered />,
  ladder: () => <ListScreen title={JOIN.ladder.title} items={JOIN.ladder.rungs} numbered top />,
};

/* ── device panel with auto-cycling tabs (reference: card + tab strip) ─── */

function DevicePanel() {
  const { t } = useLang();
  const [tab, setTab] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return undefined;
    const id = window.setTimeout(() => setTab((x) => (x + 1) % HERO.tabs.length), TAB_MS);
    return () => window.clearTimeout(id);
  }, [tab, paused]);

  const current = HERO.tabs[tab];

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="dot-grid relative overflow-hidden rounded-panel bg-plum/[0.07] px-6 pb-0 pt-10 ring-1 ring-inset ring-ink/6 sm:px-10">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-peach/60 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-mint/70 blur-3xl" />

        {/* floating chips */}
        <motion.span
          className="absolute left-4 top-[38%] z-10 hidden items-center gap-2 rounded-full bg-white px-3.5 py-2 text-[13px] font-semibold text-ink shadow-card ring-1 ring-ink/5 sm:inline-flex"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.1, duration: 0.8, ease: EXPO }}
        >
          <span className="grid h-6 w-6 place-items-center rounded-full bg-mint text-ink">
            <Icon name="check" className="h-3.5 w-3.5" strokeWidth={2.6} />
          </span>
          {t(HERO.chips[0])}
        </motion.span>
        <motion.span
          className="absolute right-4 top-[64%] z-10 hidden items-center gap-2 rounded-full bg-ink px-3.5 py-2 text-[13px] font-semibold text-cream shadow-card sm:inline-flex"
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.3, duration: 0.8, ease: EXPO }}
        >
          <Icon name="repeat" className="h-4 w-4 text-peach" />
          {t(HERO.chips[1])}
        </motion.span>

        {/* phone */}
        <motion.div
          className="relative mx-auto w-[min(17.5rem,78vw)]"
          initial={{ y: 80, opacity: 0, rotate: -2 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          transition={{ duration: 1.3, ease: EXPO, delay: 0.25 }}
        >
          <div className="rounded-t-[2.6rem] bg-ink p-2.5 pb-0 shadow-device">
            <div className="relative h-[27rem] overflow-hidden rounded-t-[2.1rem] bg-cream">
              <span className="absolute left-1/2 top-2.5 z-20 h-5 w-24 -translate-x-1/2 rounded-full bg-ink" />
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  className="absolute inset-0"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.45, ease: EXPO }}
                >
                  {SCREENS[current.id]()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>

      {/* tab strip */}
      <div
        role="tablist"
        aria-label={t({ hi: 'झलक', en: 'Preview' })}
        className="relative z-10 mx-auto -mt-5 flex w-max max-w-full flex-wrap justify-center gap-1 rounded-full bg-white p-1 shadow-card ring-1 ring-ink/6"
      >
        {HERO.tabs.map((tb, i) => {
          const on = i === tab;
          return (
            <button
              key={tb.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setTab(i)}
              className={`relative overflow-hidden rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors duration-300 sm:px-4 ${
                on ? 'bg-ink text-cream' : 'text-plum hover:text-ink'
              }`}
            >
              {t(tb.label)}
              {on && !paused ? (
                <motion.span
                  key={`bar-${tab}`}
                  className="absolute inset-x-3 bottom-0.5 h-[2px] origin-left rounded-full bg-ember"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: TAB_MS / 1000, ease: 'linear' }}
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── hero ──────────────────────────────────────────────────────────────── */

export default function Hero() {
  const { t } = useLang();

  return (
    <section id="start" className="relative overflow-clip bg-cream pb-20 pt-28 sm:pt-32 lg:pb-28 lg:pt-36">
      <div className="mesh-navy pointer-events-none absolute inset-0" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1.08fr_1fr] lg:gap-10 lg:px-8">
        <div>
          <Reveal y={12}>
            <Eyebrow tone="mint">{t(HERO.eyebrow)}</Eyebrow>
          </Reveal>

          <SplitText
            as="h1"
            onMount
            delay={0.15}
            text={t(HERO.title)}
            highlight="BOSS"
            className="h-display mt-6 text-[clamp(2.75rem,6.6vw,5.75rem)] font-extrabold text-ink"
          />

          <Reveal delay={0.55} className="mt-6 max-w-xl text-lg leading-relaxed text-plum sm:text-xl">
            <p>{t(HERO.lede)}</p>
          </Reveal>

          <Reveal delay={0.7} className="mt-9 flex flex-wrap items-center gap-3">
            <Button to="/apply" variant="ember" icon="arrowRight">
              {t(HERO.cta)}
            </Button>
            <Button href={PHONE.tel} variant="ghost" iconLeft="phone">
              {t({ hi: 'कॉल करें', en: 'Call' })} {PHONE.display}
            </Button>
          </Reveal>

          <Annotation className="ml-2 mt-3">{t(HERO.note)}</Annotation>

          <Reveal delay={0.9} className="mt-9 flex flex-wrap gap-x-6 gap-y-2 border-t border-ink/8 pt-6">
            {HERO.facts.map((f) => (
              <span key={f.en} className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-sage text-white">
                  <Icon name="check" className="h-3 w-3" strokeWidth={3} />
                </span>
                {t(f)}
              </span>
            ))}
          </Reveal>
        </div>

        <DevicePanel />
      </div>

      {/* scroll cue */}
      <div className="relative mt-16 hidden justify-center lg:flex" aria-hidden>
        <span className="flex h-10 w-6 justify-center rounded-full ring-1 ring-inset ring-ink/20">
          <motion.span
            className="mt-2 h-2 w-1 rounded-full bg-ember"
            animate={{ y: [0, 12, 0], opacity: [1, 0.2, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </span>
      </div>
    </section>
  );
}

