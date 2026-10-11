import { motion } from 'framer-motion';

import { useLang } from '../../../i18n/index.js';
import { COMMON, JOIN } from '../content.js';
import SplitText from '../../../components/motion/SplitText.jsx';
import Reveal from '../../../components/motion/Reveal.jsx';
import { EXPO } from '../../../components/motion/primitives.js';
import { Eyebrow, TextLink } from '../../../components/ui/atoms.jsx';
import Icon from '../../../components/ui/Icon.jsx';

const view = { once: true, amount: 0.35 };

/** Seven steps on one drawn line (xl), or a vertical rail below that. */
function Steps() {
  const { t } = useLang();
  return (
    <div className="relative mt-16">
      {/* the connector draws left → right (xl) / top → bottom */}
      <motion.span
        aria-hidden
        className="absolute left-[22px] top-0 hidden h-[2px] origin-left bg-ember xl:left-[6%] xl:right-[6%] xl:top-[22px] xl:block"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={view}
        transition={{ duration: 1.8, ease: [0.65, 0, 0.35, 1] }}
      />
      <motion.span
        aria-hidden
        className="absolute bottom-8 left-[21px] top-2 w-[2px] origin-top bg-ember xl:hidden"
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 1.8, ease: [0.65, 0, 0.35, 1] }}
      />
      <ol className="relative grid gap-7 xl:grid-cols-7 xl:gap-4">
        {JOIN.steps.map((s, i) => (
          <motion.li
            key={i}
            className="flex gap-5 xl:flex-col xl:items-center xl:gap-4 xl:text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={view}
            transition={{ delay: 0.2 + i * 0.16, duration: 0.8, ease: EXPO }}
          >
            <span
              className={`relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-full font-display text-sm font-bold ring-4 ring-sand ${
                i === JOIN.steps.length - 1 ? 'bg-ember text-white' : 'bg-ink text-cream'
              }`}
            >
              {i === JOIN.steps.length - 1 ? <Icon name="check" className="h-5 w-5" strokeWidth={2.6} /> : i + 1}
            </span>
            <p className="pt-2 text-[15px] font-semibold leading-snug text-ink xl:pt-0 xl:text-sm">{t(s)}</p>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}

/** Each premium payment pays again — a row of instalments lighting in turn. */
function RoyaltyCard() {
  const { t } = useLang();
  return (
    <div className="flex h-full flex-col rounded-panel bg-ink p-7 text-cream sm:p-9">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ember text-white">
        <Icon name="repeat" className="h-6 w-6" />
      </span>
      <h3 className="h-display mt-6 text-2xl font-bold sm:text-3xl">{t(JOIN.royalty.title)}</h3>
      <p className="mt-3 leading-relaxed text-cream/75">{t(JOIN.royalty.body)}</p>
      <div className="mt-8 flex gap-2" aria-hidden>
        {Array.from({ length: 8 }, (_, i) => (
          <span key={i} className="relative h-10 flex-1 overflow-hidden rounded-lg bg-white/[0.08]">
            <motion.span
              className="absolute inset-0 bg-ember"
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2.4, delay: i * 0.3, repeat: Infinity, repeatDelay: 0.6 }}
            />
          </span>
        ))}
      </div>
      <div className="mt-auto pt-8">
        <TextLink to="/benefits" dark>
          {t(JOIN.royalty.more)}
        </TextLink>
      </div>
    </div>
  );
}

function StipendCard() {
  const { t } = useLang();
  const widths = [100, 86, 71];
  return (
    <div className="flex h-full flex-col rounded-panel bg-peach-soft p-7 sm:p-9">
      <h3 className="h-display text-2xl font-bold text-ink">{t(JOIN.stipend.title)}</h3>
      <ul className="mt-7 space-y-4">
        {JOIN.stipend.rows.map((r, i) => (
          <li key={r.year}>
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-semibold text-plum">
                {t({ hi: 'वर्ष', en: 'Year' })} {r.year}
              </span>
              <span className="font-display text-xl font-extrabold text-ink">
                {r.amount}
                <span className="ml-1 font-sans text-xs font-semibold text-plum">{t(JOIN.stipend.perMonth)}</span>
              </span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white">
              <motion.span
                className="block h-full origin-left rounded-full bg-ember"
                style={{ width: `${widths[i]}%` }}
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={view}
                transition={{ delay: 0.2 + i * 0.15, duration: 1.1, ease: EXPO }}
              />
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-xs leading-relaxed text-plum/70">{t(JOIN.stipend.source)}</p>
      <p className="mt-1 text-xs font-semibold text-plum">{t(COMMON.conditions)}</p>
      <div className="mt-auto pt-6">
        <TextLink to="/bima-sakhi">{t(JOIN.stipend.more)}</TextLink>
      </div>
    </div>
  );
}

function LadderCard() {
  const { t } = useLang();
  const rungs = JOIN.ladder.rungs;
  return (
    <div className="flex h-full flex-col rounded-panel bg-white p-7 shadow-card ring-1 ring-ink/6 sm:p-9">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-mint text-ink">
          <Icon name="trophy" className="h-5 w-5" />
        </span>
        <h3 className="h-display text-2xl font-bold text-ink">{t(JOIN.ladder.title)}</h3>
      </div>
      {/* column-reverse: the DOM reads bottom → top, the eye reads top → bottom */}
      <ol className="mt-7 flex flex-col-reverse gap-1.5">
        {rungs.map((r, i) => {
          const top = i === rungs.length - 1;
          return (
            <motion.li
              key={r}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2 text-sm font-semibold ${
                top ? 'bg-ember text-white' : 'bg-sand text-ink'
              }`}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={view}
              transition={{ delay: 0.15 + i * 0.1, duration: 0.6, ease: EXPO }}
            >
              <span className={`w-5 text-xs tabular-nums ${top ? 'text-white/80' : 'text-plum/60'}`}>{i + 1}</span>
              {r}
            </motion.li>
          );
        })}
      </ol>
      <p className="mt-5 text-xs leading-relaxed text-plum/70">{t(JOIN.ladder.source)}</p>
      <div className="mt-auto pt-6">
        <TextLink to="/benefits#club">{t(JOIN.ladder.more)}</TextLink>
      </div>
    </div>
  );
}

/** Chapter 9 — how you join, plus the first look at money and recognition. */
export default function Join() {
  const { t } = useLang();
  return (
    <section id="join" className="bg-sand py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <Reveal y={12}>
              <Eyebrow tone="peach">{t(JOIN.eyebrow)}</Eyebrow>
            </Reveal>
            <SplitText
              as="h2"
              text={t(JOIN.title)}
              className="h-display mt-6 text-[clamp(2.25rem,4.6vw,4rem)] font-extrabold text-ink"
            />
          </div>
          <TextLink to="/procedure">{t(JOIN.stepsMore)}</TextLink>
        </div>

        <Steps />

        <div className="mt-20 grid gap-4 lg:grid-cols-3">
          <Reveal className="h-full">
            <RoyaltyCard />
          </Reveal>
          <Reveal delay={0.1} className="h-full">
            <StipendCard />
          </Reveal>
          <Reveal delay={0.2} className="h-full">
            <LadderCard />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
