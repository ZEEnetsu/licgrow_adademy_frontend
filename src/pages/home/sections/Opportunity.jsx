import { useLang } from '../../../i18n/index.js';
import { OPPORTUNITY } from '../content.js';
import SplitText from '../../../components/motion/SplitText.jsx';
import Reveal from '../../../components/motion/Reveal.jsx';
import { Eyebrow } from '../../../components/ui/atoms.jsx';
import Icon from '../../../components/ui/Icon.jsx';

function Marquee({ items, reverse = false, tone = 'white', label }) {
  const { t } = useLang();
  const chip =
    tone === 'white'
      ? 'bg-white text-ink ring-ink/8'
      : 'bg-ink text-cream ring-ink';
  // Rendered twice so the -50% loop is seamless; the copy is aria-hidden.
  const row = (hidden) => (
    <ul className="flex shrink-0 gap-3 pr-3" aria-hidden={hidden || undefined}>
      {items.map((it) => (
        <li
          key={it.en}
          className={`inline-flex items-center gap-2.5 whitespace-nowrap rounded-full px-5 py-3 text-[15px] font-semibold shadow-soft ring-1 sm:text-base ${chip}`}
        >
          <Icon name="sparkle" className={`h-4 w-4 ${tone === 'white' ? 'text-ember' : 'text-peach'}`} />
          {t(it)}
        </li>
      ))}
    </ul>
  );
  return (
    <div>
      <p className="caps mb-4 px-4 text-center text-[11px] font-bold text-plum/70">{t(label)}</p>
      <div className="mask-fade-x group flex overflow-hidden">
        <div
          className={`flex w-max ${reverse ? 'animate-marquee-rev' : 'animate-marquee'} group-hover:[animation-play-state:paused]`}
        >
          {row(false)}
          {row(true)}
        </div>
      </div>
    </div>
  );
}

/**
 * Chapter 3 — the opportunity: no ceiling. Two marquees carry the lists the
 * reference gives ("Dreams LIC agents work towards", "What this profession
 * gives you") as a continuous, unhurried stream.
 */
export default function Opportunity() {
  const { t } = useLang();
  return (
    <section id="opportunity" className="relative overflow-clip bg-sand py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <Reveal y={12}>
            <Eyebrow tone="peach">{t(OPPORTUNITY.eyebrow)}</Eyebrow>
          </Reveal>
          <SplitText
            as="h2"
            text={t(OPPORTUNITY.title)}
            highlight={['limits', 'सीमा']}
            className="h-display mt-6 text-[clamp(2.25rem,5vw,4.25rem)] font-extrabold text-ink"
          />
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-2">
          {OPPORTUNITY.lines.map((l, i) => (
            <Reveal
              key={i}
              delay={i * 0.12}
              className="rounded-[22px] bg-cream/70 p-7 ring-1 ring-ink/6 sm:p-8"
            >
              <span className="font-display text-sm font-bold text-ember-deep">0{i + 1}</span>
              <p className="mt-3 text-xl font-semibold leading-snug text-ink sm:text-2xl">{t(l)}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="mx-auto mt-6 flex max-w-5xl flex-col items-start gap-5 rounded-[22px] bg-ink p-7 text-cream sm:flex-row sm:items-center sm:p-8">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-peach text-ink">
            <Icon name="smile" className="h-7 w-7" />
          </span>
          <div>
            <p className="font-display text-xl font-bold">{t(OPPORTUNITY.noCapital.title)}</p>
            <p className="mt-1 text-cream/75">{t(OPPORTUNITY.noCapital.body)}</p>
          </div>
        </Reveal>
      </div>

      <div className="mt-20 space-y-10">
        <Marquee items={OPPORTUNITY.dreams} label={OPPORTUNITY.dreamsLabel} />
        <Marquee items={OPPORTUNITY.gives} label={OPPORTUNITY.givesLabel} reverse tone="ink" />
      </div>
    </section>
  );
}
