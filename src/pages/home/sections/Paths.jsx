import { Link } from 'react-router-dom';

import { useLang } from '../../../i18n/index.js';
import { EXPLORE, PATHS } from '../content.js';
import SplitText from '../../../components/motion/SplitText.jsx';
import Reveal from '../../../components/motion/Reveal.jsx';
import { Eyebrow } from '../../../components/ui/atoms.jsx';
import Icon from '../../../components/ui/Icon.jsx';

const STYLE = {
  ink: { card: 'bg-ink text-cream', body: 'text-cream/75', kicker: 'text-peach', glow: 'rgba(250,79,12,0.28)', btn: 'bg-ember text-white' },
  peach: { card: 'bg-peach-soft text-ink', body: 'text-plum', kicker: 'text-ember-deep', glow: 'rgba(255,255,255,0.7)', btn: 'bg-ink text-cream' },
  mint: { card: 'bg-mint-soft text-ink', body: 'text-plum', kicker: 'text-sage-deep', glow: 'rgba(255,255,255,0.7)', btn: 'bg-ink text-cream' },
  white: { card: 'bg-white text-ink ring-1 ring-ink/8', body: 'text-plum', kicker: 'text-ember-deep', glow: 'rgba(242,190,154,0.45)', btn: 'bg-ember text-white' },
};

/** Cursor-following spotlight: the pointer position is written to CSS vars, no re-render. */
function track(e) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
}

function PathCard({ item, className = '', children }) {
  const { t } = useLang();
  const s = STYLE[item.tone];
  const cls = `group relative flex h-full min-h-[16rem] flex-col overflow-hidden rounded-panel p-7 shadow-card transition-[transform,box-shadow] duration-500 ease-out-expo hover:-translate-y-1 hover:shadow-lift focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember sm:p-9 ${s.card} ${className}`;
  const inner = (
    <>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), ${s.glow}, transparent 45%)`,
        }}
      />
      {children}
      <div className="relative flex items-start justify-between">
        <span className={`font-display text-sm font-bold tabular-nums ${s.kicker}`}>{item.kicker}</span>
        <span
          className={`grid h-11 w-11 place-items-center rounded-full transition-transform duration-500 ease-out-expo group-hover:rotate-45 ${s.btn}`}
        >
          <Icon name="arrowUpRight" className="h-5 w-5" strokeWidth={2} />
        </span>
      </div>
      <div className="relative mt-auto pt-10">
        <h3 className="h-display text-[clamp(1.75rem,3vw,2.75rem)] font-extrabold">{t(item.title)}</h3>
        <p className={`mt-3 max-w-md text-[17px] leading-relaxed ${s.body}`}>{t(item.body)}</p>
      </div>
    </>
  );
  return item.to.startsWith('#') ? (
    <a href={item.to} className={cls} onPointerMove={track}>
      {inner}
    </a>
  ) : (
    <Link to={item.to} className={cls} onPointerMove={track}>
      {inner}
    </Link>
  );
}

/** Chapter 7 — four ways in, as a bento grid. */
export default function Paths() {
  const { t } = useLang();
  const [agent, sakhi, genz, explore] = PATHS.items;

  return (
    <section id="paths" className="bg-sand py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal y={12}>
            <Eyebrow tone="peach">{t(PATHS.eyebrow)}</Eyebrow>
          </Reveal>
          <SplitText
            as="h2"
            text={t(PATHS.title)}
            className="h-display mt-6 text-[clamp(2.1rem,4.4vw,3.75rem)] font-extrabold text-ink"
          />
          <Reveal as="p" delay={0.15} className="mt-5 text-lg text-plum">
            {t(PATHS.lede)}
          </Reveal>
        </div>

        <div className="mt-14 grid gap-4 lg:grid-cols-6 lg:grid-rows-[minmax(15rem,auto)_minmax(15rem,auto)_auto]">
          <Reveal className="lg:col-span-3 lg:row-span-2">
            <PathCard item={agent} className="lg:min-h-[32rem]">
              <span
                aria-hidden
                className="pointer-events-none absolute -bottom-10 -right-6 font-display text-[16rem] font-extrabold leading-none text-white/[0.04]"
              >
                ₹
              </span>
            </PathCard>
          </Reveal>
          <Reveal delay={0.08} className="lg:col-span-3">
            <PathCard item={sakhi} />
          </Reveal>
          <Reveal delay={0.16} className="lg:col-span-3">
            <PathCard item={genz} />
          </Reveal>
          <Reveal delay={0.08} className="lg:col-span-6">
            <PathCard item={explore} className="lg:min-h-[18rem] lg:pr-[46%]">
              <img
                src={EXPLORE.hero.src}
                alt=""
                loading="lazy"
                decoding="async"
                className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-[42%] object-cover transition-transform duration-[1.2s] ease-out-expo group-hover:scale-105 lg:block [mask-image:linear-gradient(90deg,transparent,#000_30%)]"
              />
            </PathCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
