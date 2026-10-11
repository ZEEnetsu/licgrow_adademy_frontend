import { useEffect } from 'react';
import { motion, MotionConfig } from 'framer-motion';

import AcademyNav from '../../components/AcademyNav.jsx';
import { Consent, RadioCards, SubmitButton, SuccessPanel, TextField } from '../../components/forms/Fields.jsx';
import { useLeadForm } from '../../components/forms/useLeadForm.js';
import { EXPO } from '../../components/motion/primitives.js';
import Reveal from '../../components/motion/Reveal.jsx';
import SplitText from '../../components/motion/SplitText.jsx';
import { Button, Eyebrow, TextLink } from '../../components/ui/atoms.jsx';
import Icon from '../../components/ui/Icon.jsx';
import { ScrollProgress } from '../../components/ui/Progress.jsx';
import { useLang } from '../../i18n/index.js';
import { APPLY } from '../apply/content.js';
import { CLOSING, EMAIL, PHONE, PHONE_2 } from '../home/content.js';
import { PAGES } from '../site/sections.js';
import SiteFooter from '../site/SiteFooter.jsx';
import { CONTACT } from './content.js';

/** Cursor-following spotlight, written to CSS vars (no re-render). */
function track(e) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
}

/* ── hero ──────────────────────────────────────────────────────────────── */

function Hero() {
  const { t } = useLang();
  const c = CLOSING.card;
  return (
    <section className="relative overflow-clip bg-cream pb-20 pt-28 sm:pt-32 lg:pb-28 lg:pt-36">
      <div className="mesh-navy pointer-events-none absolute inset-0" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div>
          <Reveal y={12}>
            <Eyebrow tone="mint">{t(CONTACT.eyebrow)}</Eyebrow>
          </Reveal>
          <SplitText
            as="h1"
            onMount
            delay={0.15}
            text={t(CONTACT.title)}
            highlight={['Rohit', 'रोहित']}
            className="h-display mt-6 text-[clamp(2.75rem,6vw,5.25rem)] font-extrabold text-ink"
          />
          <ul className="mt-8 grid max-w-xl gap-x-6 gap-y-2 sm:grid-cols-2">
            {CONTACT.joinMe.map((l, i) => (
              <motion.li
                key={l.en}
                className="flex items-center gap-2.5 text-[16px] font-medium text-plum"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.08, duration: 0.6, ease: EXPO }}
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ember" />
                {t(l)}
              </motion.li>
            ))}
          </ul>
          <Reveal delay={0.9} className="mt-10 flex flex-wrap gap-3">
            <Button href={PHONE.tel} variant="ember" iconLeft="phone">
              {t(CONTACT.callMe)}
            </Button>
            <Button href={`mailto:${EMAIL}`} variant="ghost" iconLeft="mail">
              {t(CONTACT.emailMe)}
            </Button>
          </Reveal>
        </div>

        <Reveal delay={0.25} y={40}>
          <div className="dot-grid relative overflow-hidden rounded-panel bg-plum/[0.07] p-6 ring-1 ring-inset ring-ink/6 sm:p-10">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-peach/60 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-mint/70 blur-3xl" />
            <div className="relative overflow-hidden rounded-[26px] bg-white shadow-device">
              <div className="relative bg-ink px-6 pb-14 pt-8 text-cream">
                <div className="absolute inset-0 opacity-70 [background:radial-gradient(120%_80%_at_90%_0%,rgba(250,79,12,0.35),transparent_60%)]" />
                <p className="caps relative text-[10px] font-bold text-mint">{t(c.kicker)}</p>
              </div>
              <div className="-mt-10 px-6 pb-6">
                <span className="relative grid h-20 w-20 place-items-center rounded-3xl bg-peach font-display text-2xl font-extrabold text-ink ring-4 ring-white">
                  RL
                </span>
                <p className="h-display mt-4 text-3xl font-extrabold text-ink">{t(c.name)}</p>
                <p className="mt-2 text-sm leading-relaxed text-plum">{t(c.creds)}</p>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <a href={PHONE.tel} className="flex h-11 items-center justify-center gap-2 rounded-full bg-ink text-sm font-semibold text-cream">
                    <Icon name="phone" className="h-4 w-4" /> {PHONE.display}
                  </a>
                  <a href={PHONE_2.tel} className="flex h-11 items-center justify-center gap-2 rounded-full bg-sand text-sm font-semibold text-ink">
                    <Icon name="phone" className="h-4 w-4" /> {PHONE_2.display}
                  </a>
                </div>
              </div>
            </div>
            <motion.span
              className="absolute bottom-6 right-6 inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-bold text-ink shadow-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.7, ease: EXPO }}
            >
              <Icon name="pin" className="h-3.5 w-3.5 text-ember" />
              {t(CONTACT.branches[0].name)}
            </motion.span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── ways to reach ─────────────────────────────────────────────────────── */

function Ways() {
  const { t } = useLang();
  const cards = [
    { icon: 'phone', label: CONTACT.ways.phone, value: PHONE.display, href: PHONE.tel, tone: 'bg-ink text-cream', iconTone: 'bg-ember text-white', glow: 'rgba(250,79,12,0.3)' },
    { icon: 'phone', label: CONTACT.ways.phone2, value: PHONE_2.display, href: PHONE_2.tel, tone: 'bg-white text-ink ring-1 ring-ink/8', iconTone: 'bg-peach text-ink', glow: 'rgba(242,190,154,0.45)' },
    { icon: 'mail', label: CONTACT.ways.email, value: EMAIL, href: `mailto:${EMAIL}`, tone: 'bg-white text-ink ring-1 ring-ink/8', iconTone: 'bg-mint text-ink', glow: 'rgba(174,213,209,0.6)' },
    { icon: 'pin', label: CONTACT.ways.area, value: t(CONTACT.branches[0].name), href: '#branches', tone: 'bg-mint-soft text-ink ring-1 ring-mint', iconTone: 'bg-sage text-white', glow: 'rgba(255,255,255,0.7)' },
  ];
  return (
    <section className="bg-sand py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {cards.map((c, i) => (
          <Reveal key={c.label.en} delay={i * 0.08}>
            <a
              href={c.href}
              onPointerMove={track}
              className={`group relative flex h-full min-h-[11rem] flex-col justify-between overflow-hidden rounded-[24px] p-6 shadow-card transition-[transform,box-shadow] duration-500 ease-out-expo hover:-translate-y-1 hover:shadow-lift ${c.tone}`}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{ background: `radial-gradient(320px circle at var(--mx,50%) var(--my,50%), ${c.glow}, transparent 45%)` }}
              />
              <div className="relative flex items-start justify-between">
                <span className={`grid h-12 w-12 place-items-center rounded-2xl ${c.iconTone}`}>
                  <Icon name={c.icon} className="h-5 w-5" />
                </span>
                <Icon name="arrowUpRight" className="h-5 w-5 opacity-40 transition-transform duration-500 group-hover:rotate-45 group-hover:opacity-100" />
              </div>
              <div className="relative mt-8">
                <p className="text-xs font-semibold opacity-70">{t(c.label)}</p>
                <p className="mt-1 break-all font-display text-xl font-bold">{c.value}</p>
              </div>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ── message form ──────────────────────────────────────────────────────── */

const AF = APPLY.form;
const CF = CONTACT.form;

function MessageForm() {
  const { t } = useLang();
  const form = useLeadForm({
    kind: 'contact',
    idPrefix: 'msg',
    fields: ['name', 'mobile', 'email', 'message', 'consent'],
    initial: { name: '', mobile: '', email: '', interest: '', message: '', consent: false },
  });
  const { values: v, errors: e, set, blur } = form;

  if (form.status === 'done') {
    return <SuccessPanel title={AF.thanks} note={AF.thanksNote} onReset={form.reset} resetLabel={AF.again} />;
  }

  return (
    <form onSubmit={form.submit} noValidate className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField id="msg-name" label={AF.name} required placeholder={AF.namePh} autoComplete="name" value={v.name} onChange={(x) => set('name', x)} onBlur={() => blur('name')} error={e.name} />
        <TextField id="msg-mobile" label={AF.mobile} required placeholder={AF.mobilePh} type="tel" inputMode="numeric" autoComplete="tel" prefix="+91" value={v.mobile} onChange={(x) => set('mobile', x)} onBlur={() => blur('mobile')} error={e.mobile} />
        <div className="sm:col-span-2">
          <TextField id="msg-email" label={AF.email} placeholder={AF.emailPh} type="email" autoComplete="email" value={v.email} onChange={(x) => set('email', x)} onBlur={() => blur('email')} error={e.email} />
        </div>
      </div>
      <RadioCards legend={AF.interestLegend} name="msg-interest" options={AF.interests} value={v.interest} onChange={(x) => set('interest', x)} />
      <TextField id="msg-message" label={CF.message} required multiline rows={5} placeholder={CF.messagePh} value={v.message} onChange={(x) => set('message', x)} onBlur={() => blur('message')} error={e.message} />
      <Consent id="msg-consent" checked={v.consent} onChange={(x) => set('consent', x)} error={e.consent}>
        {t(AF.consent)}
      </Consent>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
        <SubmitButton sending={form.status === 'sending'}>{t(CF.submit)}</SubmitButton>
        <p className="max-w-xs text-xs leading-relaxed text-plum/70">{t(AF.draft)}</p>
      </div>
    </form>
  );
}

function Message() {
  const { t } = useLang();
  return (
    <section className="bg-cream py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)] lg:gap-16 lg:px-8">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SplitText as="h2" text={t(CF.title)} className="h-display text-[clamp(2.25rem,4vw,3.5rem)] font-extrabold text-ink" />
          <span className="mt-6 block h-[3px] w-12 rounded-full bg-ember" aria-hidden />
          <Reveal as="p" className="mt-6 text-lg leading-relaxed text-plum">
            {t(CF.lede)}
          </Reveal>
          <Reveal className="mt-8 rounded-[22px] bg-mint-soft p-6 ring-1 ring-mint">
            <p className="flex items-start gap-3 text-[16px] font-semibold leading-relaxed text-ink">
              <Icon name="shield" className="mt-0.5 h-5 w-5 shrink-0 text-sage-deep" />
              {t(CLOSING.card.promise)}
            </p>
          </Reveal>
          <Reveal className="mt-6">
            <p className="text-sm text-plum">{t(CF.orApply)}</p>
            <TextLink to="/apply" className="mt-1">
              {t(CF.toApply)}
            </TextLink>
          </Reveal>
        </div>
        <Reveal className="rounded-[28px] bg-white p-6 shadow-lift ring-1 ring-ink/[0.06] sm:p-10">
          <MessageForm />
        </Reveal>
      </div>
    </section>
  );
}

/* ── branch area ───────────────────────────────────────────────────────── */

function Branches() {
  const { t } = useLang();
  return (
    <section id="branches" className="mesh-navy-deep relative scroll-mt-16 overflow-clip py-24 text-cream sm:py-32">
      <div className="grain-overlay" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Eyebrow tone="dark">{t(CONTACT.visit)}</Eyebrow>
        <SplitText as="h2" text={t(CONTACT.branchesTitle)} className="h-display mt-6 max-w-4xl text-[clamp(2.4rem,5vw,4.25rem)] font-extrabold text-cream" />
        <div className="relative mt-14">
          {/* a dotted route joining the four offices */}
          <svg className="pointer-events-none absolute inset-x-0 top-[2.1rem] hidden h-6 w-full lg:block" preserveAspectRatio="none" viewBox="0 0 100 10" aria-hidden>
            <motion.path
              d="M6 5 C 25 0, 35 10, 50 5 S 75 0, 94 5"
              fill="none"
              stroke="rgba(242,190,154,0.6)"
              strokeWidth="0.5"
              strokeDasharray="1.2 1.2"
              vectorEffect="non-scaling-stroke"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.6, ease: [0.65, 0, 0.35, 1] }}
            />
          </svg>
          <ul className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CONTACT.branches.map((b, i) => (
              <Reveal as="li" key={b.name.en} delay={0.2 + i * 0.12} className="rounded-[24px] bg-white/[0.06] p-6 ring-1 ring-white/10">
                <span className={`grid h-[4.25rem] w-[4.25rem] place-items-center rounded-2xl ${i === 0 ? 'bg-ember text-white' : 'bg-white/10 text-peach'}`}>
                  <Icon name="pin" className="h-7 w-7" />
                </span>
                <p className="h-display mt-6 text-2xl font-bold text-cream">{t(b.name)}</p>
                <p className="mt-1 text-sm font-semibold text-cream/60">{b.so ? 'SO' : t(CONTACT.branchTag)}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/**
 * /contact — every way to reach Rohit, a message form (UI only: submitLead()
 * sends nothing yet), and the branch area.
 */
export default function ContactPage() {
  const { t, lang } = useLang();
  useEffect(() => {
    document.title = t(PAGES.contact.title);
  }, [t, lang]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen overflow-x-clip bg-cream text-ink antialiased">
        <ScrollProgress />
        <AcademyNav />
        <main>
          <Hero />
          <Ways />
          <Message />
          <Branches />
        </main>
        <SiteFooter />
      </div>
    </MotionConfig>
  );
}
