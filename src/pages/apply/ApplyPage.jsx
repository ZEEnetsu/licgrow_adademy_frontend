import { useEffect, useRef, useState } from 'react';
import { motion, MotionConfig, useInView, useMotionValueEvent, useSpring, useTransform } from 'framer-motion';

import AcademyNav from '../../components/AcademyNav.jsx';
import {
  ChoiceChips,
  Consent,
  RadioCards,
  SubmitButton,
  SuccessPanel,
  TextField,
} from '../../components/forms/Fields.jsx';
import { useLeadForm } from '../../components/forms/useLeadForm.js';
import { EXPO } from '../../components/motion/primitives.js';
import Reveal from '../../components/motion/Reveal.jsx';
import SplitText from '../../components/motion/SplitText.jsx';
import { Button, Eyebrow } from '../../components/ui/atoms.jsx';
import Icon from '../../components/ui/Icon.jsx';
import { ScrollProgress } from '../../components/ui/Progress.jsx';
import RohitCard from '../../components/ui/RohitCard.jsx';
import { useLang } from '../../i18n/index.js';
import { PHONE } from '../home/content.js';
import { PAGES } from '../site/sections.js';
import SiteFooter from '../site/SiteFooter.jsx';
import { APPLY } from './content.js';

/* ── hero ──────────────────────────────────────────────────────────────── */

function Hero() {
  const { t } = useLang();
  return (
    <section className="relative overflow-clip bg-cream pb-20 pt-28 sm:pt-32 lg:pb-28 lg:pt-36">
      <div className="mesh-navy pointer-events-none absolute inset-0" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div>
          <Reveal y={12}>
            <Eyebrow tone="mint">{t(APPLY.eyebrow)}</Eyebrow>
          </Reveal>
          <SplitText
            as="h1"
            onMount
            delay={0.15}
            text={t(APPLY.title)}
            highlight={['orientation', 'ओरिएंटेशन']}
            className="h-display mt-6 text-[clamp(2.4rem,5.2vw,4.6rem)] font-extrabold text-ink"
          />
          <Reveal delay={0.5} className="mt-8">
            <p className="text-lg font-semibold text-ink">{t(APPLY.learnLead)}</p>
            <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {APPLY.learn.map((l, i) => (
                <motion.li
                  key={l.en}
                  className="flex items-start gap-3 text-[16px] text-plum"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.08, duration: 0.6, ease: EXPO }}
                >
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-mint text-ink">
                    <Icon name="check" className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {t(l)}
                </motion.li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.9} className="mt-10 flex flex-wrap gap-3">
            <Button href="#register" variant="ember" icon="arrowRight">
              {t(APPLY.register)}
            </Button>
            <Button href={PHONE.tel} variant="ghost" iconLeft="phone">
              {t({ hi: 'कॉल करें', en: 'Call' })} {PHONE.display}
            </Button>
          </Reveal>
        </div>

        <Reveal delay={0.25} y={40}>
          <div className="dot-grid relative overflow-hidden rounded-panel bg-plum/[0.07] p-6 ring-1 ring-inset ring-ink/6 sm:p-9">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-peach/60 blur-3xl" />
            <div className="relative rounded-[24px] bg-ink p-6 text-cream shadow-device sm:p-8">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-ember">
                  <Icon name="users" className="h-5 w-5" />
                </span>
                <p className="font-display text-lg font-bold leading-snug">{t(APPLY.session.title)}</p>
              </div>
              <ol className="relative mt-6 space-y-3">
                <span aria-hidden className="absolute bottom-3 left-[13px] top-3 w-px bg-white/15" />
                {APPLY.session.items.map((s, i) => (
                  <motion.li
                    key={s.en}
                    className="relative flex items-start gap-3.5 text-[14.5px] leading-snug text-cream/85"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + i * 0.12, duration: 0.6, ease: EXPO }}
                  >
                    <span className="relative z-10 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-bold text-peach ring-4 ring-ink">
                      {i + 1}
                    </span>
                    <span className="pt-1">{t(s)}</span>
                  </motion.li>
                ))}
              </ol>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── registration ──────────────────────────────────────────────────────── */

const F = APPLY.form;

function RegisterForm() {
  const { t } = useLang();
  const form = useLeadForm({
    kind: 'register',
    idPrefix: 'reg',
    fields: ['name', 'mobile', 'email', 'consent'],
    initial: { name: '', mobile: '', email: '', city: '', org: '', topics: [], interest: '', consent: false },
  });
  const { values: v, errors: e, set, blur } = form;

  if (form.status === 'done') {
    return <SuccessPanel title={F.thanks} note={F.thanksNote} onReset={form.reset} resetLabel={F.again} />;
  }

  return (
    <form onSubmit={form.submit} noValidate className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField id="reg-name" label={F.name} required placeholder={F.namePh} autoComplete="name" value={v.name} onChange={(x) => set('name', x)} onBlur={() => blur('name')} error={e.name} />
        <TextField id="reg-mobile" label={F.mobile} required placeholder={F.mobilePh} type="tel" inputMode="numeric" autoComplete="tel" prefix="+91" value={v.mobile} onChange={(x) => set('mobile', x)} onBlur={() => blur('mobile')} error={e.mobile} />
        <TextField id="reg-email" label={F.email} placeholder={F.emailPh} type="email" autoComplete="email" value={v.email} onChange={(x) => set('email', x)} onBlur={() => blur('email')} error={e.email} />
        <TextField id="reg-city" label={F.city} placeholder={F.cityPh} autoComplete="address-level2" value={v.city} onChange={(x) => set('city', x)} />
        <div className="sm:col-span-2">
          <TextField id="reg-org" label={F.org} placeholder={F.orgPh} value={v.org} onChange={(x) => set('org', x)} />
        </div>
      </div>
      <ChoiceChips legend={F.topicsLegend} options={F.topics} value={v.topics} onChange={(x) => set('topics', x)} />
      <RadioCards legend={F.interestLegend} name="reg-interest" options={F.interests} value={v.interest} onChange={(x) => set('interest', x)} />
      <Consent id="reg-consent" checked={v.consent} onChange={(x) => set('consent', x)} error={e.consent}>
        {t(F.consent)}
      </Consent>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
        <SubmitButton sending={form.status === 'sending'}>{t(F.submit)}</SubmitButton>
        <p className="max-w-xs text-xs leading-relaxed text-plum/70">{t(F.draft)}</p>
      </div>
    </form>
  );
}

function CallbackForm() {
  const { t } = useLang();
  const form = useLeadForm({
    kind: 'callback',
    idPrefix: 'cb',
    fields: ['name', 'mobile'],
    initial: { name: '', mobile: '' },
  });
  const { values: v, errors: e, set, blur } = form;
  return (
    <div className="mesh-navy-deep relative overflow-hidden rounded-[26px] p-6 text-cream sm:p-8">
      <div className="grain-overlay" />
      <div className="relative">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-ember">
            <Icon name="phone" className="h-5 w-5" />
          </span>
          <p className="font-display text-xl font-bold">{t(APPLY.callback.title)}</p>
        </div>
        {form.status === 'done' ? (
          <SuccessPanel dark title={APPLY.callback.thanks} note={F.thanksNote} onReset={form.reset} resetLabel={F.again} />
        ) : (
          <form onSubmit={form.submit} noValidate className="mt-6 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-start">
            <TextField dark id="cb-name" label={F.name} required placeholder={APPLY.callback.namePh} autoComplete="name" value={v.name} onChange={(x) => set('name', x)} onBlur={() => blur('name')} error={e.name} />
            <TextField dark id="cb-mobile" label={F.mobile} required placeholder={F.mobilePh} type="tel" inputMode="numeric" autoComplete="tel" prefix="+91" value={v.mobile} onChange={(x) => set('mobile', x)} onBlur={() => blur('mobile')} error={e.mobile} />
            <div className="sm:pt-7">
              <SubmitButton sending={form.status === 'sending'} variant="light" className="w-full">
                {t(APPLY.callback.submit)}
              </SubmitButton>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Register() {
  const { t } = useLang();
  const N = APPLY.next;
  return (
    <section id="register" className="scroll-mt-16 bg-sand py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)] lg:gap-16 lg:px-8">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="font-display text-sm font-bold text-ember-deep">01</p>
          <SplitText as="h2" text={t(F.title)} className="h-display mt-3 text-[clamp(2rem,3.4vw,3rem)] font-extrabold text-ink" />
          <span className="mt-6 block h-[3px] w-12 rounded-full bg-ember" aria-hidden />

          <Reveal className="mt-10">
            <h3 className="font-display text-xl font-bold text-ink">{t(N.title)}</h3>
            <p className="mt-3 text-[16px] leading-relaxed text-plum">{t(N.body)}</p>
          </Reveal>
          <Reveal className="mt-8 rounded-[22px] bg-white p-6 shadow-soft ring-1 ring-ink/[0.06]">
            <p className="text-sm font-bold text-ink">{t(N.talkTitle)}</p>
            <ul className="mt-4 space-y-2.5">
              {N.talk.map((x) => (
                <li key={x.en} className="flex gap-3 text-[15px] text-plum">
                  <span className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-ember" />
                  {t(x)}
                </li>
              ))}
            </ul>
            <p className="mt-5 font-hand text-2xl text-ember-deep">{t(N.listen)}</p>
          </Reveal>
        </div>

        <div className="space-y-5">
          <Reveal className="rounded-[28px] bg-white p-6 shadow-lift ring-1 ring-ink/[0.06] sm:p-10">
            <RegisterForm />
          </Reveal>
          <Reveal>
            <CallbackForm />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ── rate yourself ─────────────────────────────────────────────────────── */

function Gauge({ total }) {
  const { t } = useLang();
  const ref = useRef(null);
  const seen = useInView(ref, { once: true, amount: 0.5 });
  const spring = useSpring(8, { stiffness: 120, damping: 20 });
  useEffect(() => {
    if (seen) spring.set(total);
  }, [seen, total, spring]);
  const dash = useTransform(spring, [8, 40], [0, 1]);
  const [shown, setShown] = useState(8);
  useMotionValueEvent(spring, 'change', (x) => setShown(Math.round(x)));

  return (
    <div ref={ref} className="relative mx-auto aspect-square w-full max-w-[17rem]">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden>
        <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(21,13,61,0.08)" strokeWidth="12" />
        <motion.circle cx="60" cy="60" r="50" fill="none" stroke="#FA4F0C" strokeWidth="12" strokeLinecap="round" style={{ pathLength: dash }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center" aria-live="polite">
        <output className="h-display text-6xl font-extrabold text-ink">{shown}</output>
        <p className="mt-1 max-w-[9rem] text-xs font-semibold text-plum">{t(APPLY.rate.total)}</p>
      </div>
    </div>
  );
}

function Slider({ label, value, onChange, id }) {
  const { t } = useLang();
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-[15px] font-semibold text-ink">
          {t(label)}
        </label>
        <output htmlFor={id} className="grid h-8 w-8 place-items-center rounded-full bg-ink font-display text-sm font-bold text-cream">
          {value}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min="1"
        max="5"
        step="1"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full accent-ember [background:linear-gradient(90deg,var(--color-ember)_var(--p),var(--color-sand)_var(--p))] [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-card [&::-webkit-slider-thumb]:ring-4 [&::-webkit-slider-thumb]:ring-ember"
        style={{ '--p': `${((value - 1) / 4) * 100}%` }}
      />
    </div>
  );
}

function RateYourself() {
  const { t } = useLang();
  const R = APPLY.rate;
  const [scores, setScores] = useState(() => R.qualities.map(() => 3));
  const total = scores.reduce((a, b) => a + b, 0);
  return (
    <section className="bg-cream py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="font-display text-sm font-bold text-ember-deep">02</p>
          <SplitText as="h2" text={t(R.title)} className="h-display mt-3 text-[clamp(2.25rem,4.4vw,3.75rem)] font-extrabold text-ink" />
          <Reveal as="p" className="mt-5 text-lg leading-relaxed text-plum">
            {t(R.intro)}
          </Reveal>
        </div>
        <div className="mt-12 grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-center">
          <Reveal className="grid gap-x-10 gap-y-7 rounded-[28px] bg-white p-6 shadow-card ring-1 ring-ink/[0.06] sm:grid-cols-2 sm:p-10">
            {R.qualities.map((q, i) => (
              <Slider
                key={q.en}
                id={`rate-${i}`}
                label={q}
                value={scores[i]}
                onChange={(x) => setScores((s) => s.map((y, j) => (j === i ? x : y)))}
              />
            ))}
          </Reveal>
          <Reveal delay={0.15}>
            <Gauge total={total} />
          </Reveal>
        </div>

        <Reveal className="mt-16 grid gap-8 rounded-[28px] bg-mint-soft p-7 ring-1 ring-mint sm:p-10 lg:grid-cols-[1fr_1.4fr] lg:items-center">
          <div>
            <h3 className="h-display text-3xl font-extrabold text-ink">{t(R.lookTitle)}</h3>
            <p className="mt-4 text-[16px] leading-relaxed text-plum">{t(R.realistic)}</p>
          </div>
          <ul className="flex flex-wrap gap-2.5">
            {R.look.map((x, i) => (
              <motion.li
                key={x.en}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: EXPO }}
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-[15px] font-semibold text-ink shadow-soft ring-1 ring-mint"
              >
                <Icon name="check" className="h-4 w-4 text-sage" strokeWidth={2.6} />
                {t(x)}
              </motion.li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

/* ── promise ───────────────────────────────────────────────────────────── */

function Promises() {
  const { t } = useLang();
  const P = APPLY.promise;
  return (
    <section className="mesh-navy-deep relative overflow-clip py-24 text-cream sm:py-32">
      <div className="grain-overlay" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="font-display text-sm font-bold text-peach">03</p>
        <SplitText as="h2" text={t(P.title)} className="h-display mt-3 text-[clamp(2.25rem,4.4vw,3.75rem)] font-extrabold text-cream" />
        <ol className="mt-12 grid gap-px overflow-hidden rounded-[26px] bg-white/10 ring-1 ring-white/10 md:grid-cols-2">
          {P.items.map((x, i) => (
            <Reveal as="li" key={x.en} delay={(i % 2) * 0.06} className="flex gap-4 bg-ink/90 p-6 text-[16px] leading-relaxed text-cream/90">
              <span className="font-display text-sm font-bold tabular-nums text-peach">{String(i + 1).padStart(2, '0')}</span>
              {t(x)}
            </Reveal>
          ))}
        </ol>
        <SplitText as="p" text={t(P.band)} className="h-display mt-16 text-center text-[clamp(1.75rem,3.6vw,3rem)] font-extrabold text-peach" />
        <Reveal as="p" className="mt-4 text-center font-hand text-3xl text-cream/80">
          {t(P.by)}
        </Reveal>
      </div>
    </section>
  );
}

/* ── page ──────────────────────────────────────────────────────────────── */

/**
 * /apply — the orientation sign-up. Forms are UI only for now: they validate
 * and thank, but submitLead() sends nothing (see components/forms/submitLead.js).
 */
export default function ApplyPage() {
  const { t, lang } = useLang();
  useEffect(() => {
    document.title = t(PAGES.apply.title);
  }, [t, lang]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen overflow-x-clip bg-cream text-ink antialiased">
        <ScrollProgress />
        <AcademyNav />
        <main>
          <Hero />
          <Register />
          <RateYourself />
          <Promises />
          <section className="bg-cream px-4 pb-24 pt-24 sm:px-6 lg:px-8">
            <SplitText
              as="p"
              text={t(APPLY.closing)}
              className="h-display mx-auto max-w-4xl text-center text-[clamp(1.75rem,3.4vw,2.75rem)] font-extrabold text-ink"
            />
            <RohitCard className="mt-14" />
          </section>
        </main>
        <SiteFooter />
      </div>
    </MotionConfig>
  );
}
