import { useRef } from 'react';
import { useInView } from 'framer-motion';

import { useLang } from '../../../i18n/index.js';
import { MARKET } from '../content.js';
import SplitText from '../../../components/motion/SplitText.jsx';
import Reveal from '../../../components/motion/Reveal.jsx';
import { Button, Eyebrow } from '../../../components/ui/atoms.jsx';
import Icon from '../../../components/ui/Icon.jsx';

/**
 * 100 dots, `lit` of them light up ember in sequence once the grid is on
 * screen — the 10% / 70% split made countable. CSS transitions with
 * per-dot delays rather than 100 animated components.
 */
function DotGrid({ lit, label, big }) {
  const ref = useRef(null);
  const on = useInView(ref, { once: true, amount: 0.5 });
  return (
    <figure ref={ref} className="flex flex-col">
      <div className="grid grid-cols-10 gap-1.5 sm:gap-2" aria-hidden>
        {Array.from({ length: 100 }, (_, i) => (
          <span
            key={i}
            className={`aspect-square rounded-full transition-[background-color,transform] duration-500 ease-out-expo ${
              on && i < lit ? 'scale-100 bg-ember' : 'scale-75 bg-white/12'
            }`}
            style={{ transitionDelay: on ? `${i * 14}ms` : '0ms' }}
          />
        ))}
      </div>
      <figcaption className="mt-5">
        <span className="h-display block text-5xl font-extrabold text-cream sm:text-6xl">{big}</span>
        <span className="mt-1 block text-cream/70">{label}</span>
      </figcaption>
    </figure>
  );
}

/** Chapter 5 — the market. Ink band; the 10/70 contrast is the hero image. */
export default function Market() {
  const { t } = useLang();
  return (
    <section id="market" className="mesh-navy-deep relative overflow-clip py-24 text-cream sm:py-32">
      <div className="grain-overlay" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-end gap-14 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
          <div>
            <Reveal y={12}>
              <Eyebrow tone="dark">{t(MARKET.eyebrow)}</Eyebrow>
            </Reveal>
            <SplitText
              as="h2"
              text={t(MARKET.statement)}
              highlight={['10', '70']}
              highlightClass="text-peach"
              className="h-display mt-6 text-[clamp(2.1rem,4.4vw,3.9rem)] font-extrabold text-cream"
            />
            <Reveal delay={0.2} as="p" className="mt-8 max-w-xl text-lg leading-relaxed text-cream/75">
              {t(MARKET.body)}
            </Reveal>
          </div>

          <Reveal className="grid grid-cols-2 gap-8 rounded-panel bg-white/[0.04] p-6 ring-1 ring-inset ring-white/10 sm:gap-10 sm:p-9">
            <DotGrid lit={10} big="10%" label={t(MARKET.agents)} />
            <DotGrid lit={70} big="70%" label={t(MARKET.business)} />
          </Reveal>
        </div>

        <div className="mt-24">
          <Reveal as="h3" className="caps text-xs font-bold text-mint">
            {t(MARKET.togetherLabel)}
          </Reveal>
          <ul className="mt-6 grid gap-px overflow-hidden rounded-panel bg-white/10 ring-1 ring-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {MARKET.together.map((item, i) => (
              <Reveal
                as="li"
                key={item.en}
                delay={(i % 4) * 0.06}
                className="flex items-start gap-3 bg-ink/90 p-6 text-[15px] font-medium leading-snug text-cream/90"
              >
                <span className="font-display text-xs font-bold tabular-nums text-peach">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {t(item)}
              </Reveal>
            ))}
          </ul>
          <Reveal as="p" className="mt-6 max-w-3xl text-lg font-semibold text-cream">
            {t(MARKET.togetherClose)}
          </Reveal>
        </div>

        <div className="mt-20 grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <Reveal className="rounded-panel bg-cream p-7 text-ink sm:p-9">
            <div className="flex items-center gap-4">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-mint text-ink">
                <Icon name="shield" className="h-6 w-6" />
              </span>
              <h3 className="h-display text-2xl font-bold">{t(MARKET.guarantee.title)}</h3>
            </div>
            <p className="mt-5 leading-relaxed text-plum">{t(MARKET.guarantee.body)}</p>
            <p className="mt-4 text-xs text-plum/60">{t(MARKET.guarantee.source)}</p>
          </Reveal>

          <div className="lg:pl-8">
            <SplitText
              as="p"
              text={t(MARKET.ready)}
              className="h-display text-[clamp(2.4rem,5vw,4.5rem)] font-extrabold text-cream"
            />
            <Reveal delay={0.3} className="mt-8">
              <Button to="/why-lic" variant="ghostLight" icon="arrowUpRight">
                {t(MARKET.more)}
              </Button>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
