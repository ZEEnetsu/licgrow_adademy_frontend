import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

import { EXPO } from '../../components/motion/primitives.js';
import { IllustrationBadge } from '../../components/ui/atoms.jsx';
import Icon from '../../components/ui/Icon.jsx';
import { useLang } from '../../i18n/index.js';
import { JOIN } from '../home/content.js';

/*
 * The right-hand visual of each page hero — the one thing on the page that
 * says what it is about at a glance. Figures are the ones the page itself
 * states (stipend circular, 2023-24 commission material, the joining steps,
 * the three career tracks).
 */

function Panel({ children, className = '' }) {
  return (
    <div
      className={`dot-grid relative overflow-hidden rounded-panel bg-plum/[0.07] p-6 ring-1 ring-inset ring-ink/6 sm:p-9 ${className}`}
    >
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-peach/60 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-mint/70 blur-3xl" />
      <div className="relative">{children}</div>
    </div>
  );
}

const rise = (i, base = 0.35) => ({
  initial: { opacity: 0, y: 26 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: base + i * 0.12, duration: 0.9, ease: EXPO },
});

/* ── Bima Sakhi: the three-year stipend ───────────────────────────────── */

export function StipendVisual() {
  const { t } = useLang();
  const rows = [
    { year: 1, amount: '₹7,000', w: 100 },
    { year: 2, amount: '₹6,000', w: 86 },
    { year: 3, amount: '₹5,000', w: 71 },
  ];
  return (
    <Panel>
      <div className="flex flex-wrap gap-2">
        <motion.span {...rise(0, 0.2)} className="inline-flex items-center gap-1.5 rounded-full bg-mint px-3 py-1.5 text-xs font-bold text-ink">
          <Icon name="users" className="h-3.5 w-3.5" />
          {t({ hi: 'महिलाएँ, 18–70 वर्ष', en: 'Women, 18–70' })}
        </motion.span>
        <motion.span {...rise(1, 0.2)} className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-xs font-bold text-cream">
          <Icon name="cap" className="h-3.5 w-3.5 text-peach" />
          {t({ hi: '12वीं पास', en: '12th pass' })}
        </motion.span>
      </div>
      <p className="caps mt-7 text-[11px] font-bold text-plum/70">{t({ hi: 'मासिक स्टाइपेंड', en: 'Monthly stipend' })}</p>
      <div className="mt-3 space-y-3">
        {rows.map((r, i) => (
          <motion.div key={r.year} {...rise(i)} className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-ink/5 sm:p-5">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold text-plum">
                {t({ hi: 'वर्ष', en: 'Year' })} {r.year}
              </span>
              <span className="h-display text-3xl font-extrabold text-ink">
                {r.amount}
                <span className="ml-1 font-sans text-xs font-semibold tracking-normal text-plum">
                  {t({ hi: 'प्रति माह', en: '/month' })}
                </span>
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-sand">
              <motion.span
                className="block h-full origin-left rounded-full bg-ember"
                style={{ width: `${r.w}%` }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.7 + i * 0.15, duration: 1.1, ease: EXPO }}
              />
            </div>
          </motion.div>
        ))}
      </div>
      <motion.p {...rise(4)} className="mt-5 flex items-center gap-2 text-sm font-semibold text-ink">
        <Icon name="plus" className="h-4 w-4 text-ember" strokeWidth={2.4} />
        {t({ hi: 'साथ में हर पॉलिसी पर कमीशन', en: 'plus commission on every policy' })}
      </motion.p>
      <p className="mt-2 text-xs font-semibold text-plum/70">{t({ hi: '*शर्तें लागू', en: '*Conditions apply' })}</p>
    </Panel>
  );
}

/* ── Benefits: commission rates and the royalty loop ──────────────────── */

export function CommissionVisual() {
  const { t } = useLang();
  const tiles = [
    { v: '28%', l: { hi: 'वर्ष 1', en: 'Year 1' }, tone: 'bg-ink text-cream', num: 'text-peach' },
    { v: '7.5%', l: { hi: 'वर्ष 2–5', en: 'Years 2–5' }, tone: 'bg-white text-ink', num: 'text-ember-deep' },
    { v: '5%', l: { hi: 'वर्ष 6 से', en: 'Year 6 on' }, tone: 'bg-white text-ink', num: 'text-ember-deep' },
  ];
  return (
    <Panel>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="caps text-[11px] font-bold text-plum/70">
          {t({ hi: 'ज़्यादातर रेगुलर-प्रीमियम प्लान पर कमीशन', en: 'Commission on most regular-premium plans' })}
        </p>
        <IllustrationBadge>{t({ hi: 'केवल उदाहरण', en: 'Illustration only' })}</IllustrationBadge>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3">
        {tiles.map((x, i) => (
          <motion.div key={x.v} {...rise(i)} className={`rounded-2xl p-4 shadow-card ring-1 ring-ink/5 sm:p-5 ${x.tone}`}>
            <p className={`h-display text-[clamp(1.75rem,3vw,2.6rem)] font-extrabold ${x.num}`}>{x.v}</p>
            <p className="mt-1 text-xs font-semibold opacity-75">{t(x.l)}</p>
          </motion.div>
        ))}
      </div>
      <motion.div {...rise(3)} className="mt-4 rounded-2xl bg-white p-5 shadow-card ring-1 ring-ink/5">
        <p className="flex items-center gap-2 text-sm font-semibold text-ink">
          <Icon name="repeat" className="h-4 w-4 text-ember" />
          {t({ hi: 'हर प्रीमियम पर फिर कमीशन', en: 'Every premium paid pays you again' })}
        </p>
        <div className="mt-4 flex gap-1.5" aria-hidden>
          {Array.from({ length: 12 }, (_, i) => (
            <span key={i} className="relative h-8 flex-1 overflow-hidden rounded-md bg-sand">
              <motion.span
                className="absolute inset-0 bg-ember"
                animate={{ opacity: [0, 1, 0.25] }}
                transition={{ duration: 1.8, delay: 1 + i * 0.18, repeat: Infinity, repeatDelay: 1.2 }}
              />
            </span>
          ))}
        </div>
      </motion.div>
      <p className="mt-4 text-xs text-plum/70">
        {t({ hi: '2023-24 की ट्रेनिंग सामग्री के अनुसार।', en: 'As per 2023-24 training material.' })}
      </p>
    </Panel>
  );
}

/* ── Procedure: seven steps from today to your agency code ────────────── */

export function PathVisual() {
  const { t } = useLang();
  const steps = JOIN.steps;
  const [on, setOn] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setOn((x) => (x + 1) % (steps.length + 2)), 1100);
    return () => window.clearInterval(id);
  }, [steps.length]);

  return (
    <Panel>
      <p className="caps text-[11px] font-bold text-plum/70">{t({ hi: 'आज से एजेंसी कोड तक', en: 'From today to your agency code' })}</p>
      <ol className="relative mt-5 space-y-2">
        {steps.map((s, i) => {
          const lit = i < on;
          return (
            <motion.li
              key={i}
              {...rise(i, 0.25)}
              className={`flex items-center gap-3 rounded-2xl px-4 py-2.5 text-[13px] font-semibold leading-snug shadow-soft ring-1 transition-colors duration-500 ${
                lit ? 'bg-white text-ink ring-ember/30' : 'bg-white/70 text-plum/70 ring-ink/5'
              }`}
            >
              <span
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-bold transition-colors duration-500 ${
                  lit ? 'bg-ember text-white' : 'bg-sand text-plum'
                }`}
              >
                {lit ? <Icon name="check" className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
              </span>
              <span className="line-clamp-1">{t(s)}</span>
            </motion.li>
          );
        })}
      </ol>
      <motion.div
        {...rise(8, 0.25)}
        className={`mt-4 flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold transition-colors duration-500 ${
          on > steps.length ? 'bg-ink text-cream' : 'bg-ink/10 text-plum'
        }`}
      >
        <Icon name="trophy" className="h-4 w-4 text-peach" />
        {t({ hi: 'आपका एजेंसी कोड', en: 'Your agency code' })}
      </motion.div>
    </Panel>
  );
}

/* ── Career: three tracks, climbing ───────────────────────────────────── */

export function TracksVisual() {
  const { t } = useLang();
  const tracks = [
    { name: { hi: 'एजेंट', en: 'Agent' }, top: 'Elite', rungs: 8, tone: 'bg-ember' },
    { name: { hi: 'कर्मचारी', en: 'Employee' }, top: 'Chief Manager', rungs: 5, tone: 'bg-ink' },
    { name: { hi: 'उद्यमी (CLIA)', en: 'Entrepreneur' }, top: 'Star Platinum', rungs: 7, tone: 'bg-sage' },
  ];
  return (
    <Panel>
      <p className="caps text-[11px] font-bold text-plum/70">{t({ hi: 'आगे बढ़ने के तीन रास्ते', en: 'Three ways to grow' })}</p>
      <div className="mt-6 grid h-[19rem] grid-cols-3 items-end gap-3 sm:gap-5">
        {tracks.map((tr, ti) => (
          <div key={tr.top} className="flex h-full flex-col justify-end">
            <motion.p
              {...rise(tr.rungs, 0.3 + ti * 0.1)}
              className="mb-2 truncate rounded-full bg-white px-2.5 py-1 text-center text-[11px] font-bold text-ink shadow-soft"
            >
              {tr.top}
            </motion.p>
            <div className="flex flex-col-reverse gap-1">
              {Array.from({ length: tr.rungs }, (_, i) => (
                <motion.span
                  key={i}
                  className={`h-6 rounded-md ${i === tr.rungs - 1 ? tr.tone : 'bg-white'} shadow-soft ring-1 ring-ink/5`}
                  initial={{ opacity: 0, scaleX: 0.4 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ delay: 0.3 + ti * 0.12 + i * 0.07, duration: 0.6, ease: EXPO }}
                />
              ))}
            </div>
            <p className="mt-3 text-center text-xs font-bold text-ink">{t(tr.name)}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ── fallback: an index of the page's chapters ────────────────────────── */

export function IndexVisual({ chapters }) {
  const { t } = useLang();
  const list = chapters.filter((c) => c.id !== 'top').slice(0, 8);
  return (
    <Panel>
      <p className="caps text-[11px] font-bold text-plum/70">{t({ hi: 'इस पेज में', en: 'In this page' })}</p>
      <ol className="mt-4 space-y-1.5">
        {list.map((c, i) => (
          <motion.li key={c.id} {...rise(i, 0.25)}>
            <a
              href={`#${c.id}`}
              className="group flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-ink shadow-soft ring-1 ring-ink/5 transition-colors hover:ring-ember/40"
            >
              <span className="font-display text-xs font-bold tabular-nums text-ember-deep">{String(i + 1).padStart(2, '0')}</span>
              <span className="line-clamp-1 flex-1">{t(c.label)}</span>
              <Icon name="arrowRight" className="h-4 w-4 text-plum/40 transition-transform group-hover:translate-x-0.5 group-hover:text-ember" />
            </a>
          </motion.li>
        ))}
      </ol>
    </Panel>
  );
}
