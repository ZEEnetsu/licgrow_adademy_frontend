import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';

import AcademyNav from '../../components/AcademyNav.jsx';
import ContentNode, { Nodes } from '../../components/content/ContentNode.jsx';
import RichText from '../../components/content/RichText.jsx';
import { ToneContext } from '../../components/content/tone.js';
import Reveal from '../../components/motion/Reveal.jsx';
import SplitText from '../../components/motion/SplitText.jsx';
import { Button, Eyebrow } from '../../components/ui/atoms.jsx';
import Icon from '../../components/ui/Icon.jsx';
import { ChapterRail, ScrollProgress } from '../../components/ui/Progress.jsx';
import RohitCard from '../../components/ui/RohitCard.jsx';
import { useLang } from '../../i18n/index.js';
import { PHONE } from '../home/content.js';
import { CommissionVisual, IndexVisual, PathVisual, StipendVisual, TracksVisual } from './heroVisuals.jsx';
import { buildPage } from './model.js';
import SiteFooter from './SiteFooter.jsx';

const HERO_VISUALS = {
  'bima-sakhi': StipendVisual,
  benefits: CommissionVisual,
  procedure: PathVisual,
  career: TracksVisual,
};

const pad = (n) => String(n).padStart(2, '0');

/* ── hero ──────────────────────────────────────────────────────────────── */

function PageHero({ part, title, chapters }) {
  const { t } = useLang();
  const Visual = HERO_VISUALS[part.sectionId];
  const heading = t(part.titleText);
  // Some reference headlines run to a full sentence; size those down a step.
  const size = heading.length > 60 ? 'text-[clamp(2.1rem,4.2vw,3.6rem)]' : 'text-[clamp(2.4rem,5.2vw,4.6rem)]';
  return (
    <section id="top" className="relative overflow-clip bg-cream pb-16 pt-28 sm:pt-32 lg:pb-24 lg:pt-36">
      <div className="mesh-navy pointer-events-none absolute inset-0" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12 lg:px-8">
        <div>
          <Reveal y={10} className="flex flex-wrap items-center gap-3">
            <nav aria-label={t({ hi: 'ब्रेडक्रंब', en: 'Breadcrumb' })} className="flex items-center gap-1.5 text-xs font-semibold text-plum/70">
              <Link to="/" className="hover:text-ink">
                {t({ hi: 'होम', en: 'Home' })}
              </Link>
              <Icon name="arrowRight" className="h-3 w-3" />
              <span className="text-ink">{t(title)}</span>
            </nav>
          </Reveal>
          {part.eyebrow ? (
            <Reveal y={12} delay={0.05} className="mt-5">
              <Eyebrow tone="mint">
                <RichText value={part.eyebrow.text} />
              </Eyebrow>
            </Reveal>
          ) : null}
          <SplitText
            as="h1"
            onMount
            delay={0.15}
            stagger={0.045}
            text={heading}
            className={`h-display mt-6 font-extrabold text-ink ${size}`}
          />
          {part.lede ? (
            <Reveal delay={0.5} className="mt-6 max-w-xl text-lg leading-relaxed text-plum sm:text-xl">
              <p>
                <RichText value={part.lede.text} />
              </p>
            </Reveal>
          ) : null}
          <Reveal delay={0.65} className="mt-9 flex flex-wrap items-center gap-3">
            <Button to="/apply" variant="ember" icon="arrowRight">
              {t({ hi: 'आवेदन करें', en: 'Apply now' })}
            </Button>
            <Button href={PHONE.tel} variant="ghost" iconLeft="phone">
              {t({ hi: 'कॉल करें', en: 'Call' })} {PHONE.display}
            </Button>
          </Reveal>
        </div>
        <Reveal delay={0.2} y={40}>
          {Visual ? <Visual /> : <IndexVisual chapters={chapters} />}
        </Reveal>
      </div>
    </section>
  );
}

/** Extra hero lines (quote cards, banner lines, bands) as their own strip. */
function HeroNotes({ nodes }) {
  if (!nodes?.length) return null;
  return (
    <section className="bg-sand py-14 sm:py-16">
      <div className="content-flow mx-auto grid max-w-7xl gap-x-8 gap-y-2 px-4 sm:px-6 lg:grid-cols-2 lg:px-8 [&_.my-10]:my-4 [&_.my-6]:my-2 [&_.my-7]:my-2">
        {nodes.map((n, i) => (
          <Reveal key={i} delay={i * 0.08} className={n.cls?.includes('band') ? 'lg:col-span-2' : ''}>
            <ContentNode node={n} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/** "Jump to" chips — the chapter index for screens without the side rail. */
function JumpChips({ chapters }) {
  const { t } = useLang();
  const list = chapters.filter((c) => c.id !== 'top');
  return (
    <nav aria-label={t({ hi: 'अध्याय', en: 'Chapters' })} className="border-y border-ink/[0.06] bg-cream xl:hidden">
      <div className="mask-fade-x mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:none] sm:px-6 lg:px-8">
        <span className="shrink-0 self-center pr-1 text-xs font-bold text-plum/60">{t({ hi: 'सीधे जाएँ', en: 'Jump to' })}</span>
        {list.map((c, i) => (
          <a
            key={c.id}
            href={`#${c.id}`}
            className="shrink-0 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-ink ring-1 ring-ink/10 transition-colors hover:ring-ember/50"
          >
            <span className="mr-1.5 text-ember-deep tabular-nums">{pad(i + 1)}</span>
            {t(c.label)}
          </a>
        ))}
      </div>
    </nav>
  );
}

/* ── body ──────────────────────────────────────────────────────────────── */

function SectionIntro({ part }) {
  const { t } = useLang();
  return (
    <ToneContext.Provider value="dark">
      <section id={part.sectionId} className="mesh-navy-deep tone-dark relative scroll-mt-16 overflow-clip py-24 text-cream sm:py-32">
        <div className="grain-overlay" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {part.eyebrow ? (
            <Reveal y={12}>
              <Eyebrow tone="dark">
                <RichText value={part.eyebrow.text} />
              </Eyebrow>
            </Reveal>
          ) : null}
          <SplitText
            as="h2"
            text={t(part.titleText)}
            stagger={0.04}
            className="h-display mt-6 max-w-5xl text-[clamp(2.25rem,5vw,4.5rem)] font-extrabold text-cream"
          />
          {part.lede ? (
            <Reveal as="p" delay={0.2} className="mt-6 max-w-2xl text-lg leading-relaxed text-cream/75 sm:text-xl">
              <RichText value={part.lede.text} />
            </Reveal>
          ) : null}
          {part.extras?.length ? (
            <div className="content-flow mt-6 grid max-w-5xl gap-x-8 lg:grid-cols-2">
              {part.extras.map((n, i) => (
                <Reveal key={i} delay={0.1 + i * 0.06}>
                  <ContentNode node={n} />
                </Reveal>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </ToneContext.Provider>
  );
}

function ChapterHead({ part, total, dark }) {
  const { t } = useLang();
  return (
    <header className="lg:sticky lg:top-28 lg:self-start">
      <p className={`font-display text-sm font-bold tabular-nums ${dark ? 'text-peach' : 'text-ember-deep'}`}>
        {pad(part.n)} <span className={dark ? 'text-cream/35' : 'text-plum/35'}>/ {pad(total)}</span>
      </p>
      {part.title ? (
        <SplitText
          as="h2"
          text={t(part.title)}
          stagger={0.035}
          className={`h-display mt-3 text-[clamp(2rem,3.3vw,3rem)] font-extrabold ${dark ? 'text-cream' : 'text-ink'}`}
        />
      ) : null}
      <span className="mt-6 block h-[3px] w-12 rounded-full bg-ember" aria-hidden />
    </header>
  );
}

function ChapterBody({ nodes }) {
  return (
    <div className="content-flow min-w-0 max-w-3xl [&>div:first-child>*:first-child]:mt-0">
      {nodes.map((n, i) => (
        <Reveal key={i} amount={0.05}>
          <ContentNode node={n} />
        </Reveal>
      ))}
    </div>
  );
}

function Chapter({ part, total, alt }) {
  return (
    <section id={part.id} data-src={part.src} className={`relative scroll-mt-16 py-20 sm:py-28 ${alt ? 'bg-sand' : 'bg-cream'}`}>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,2fr)] lg:gap-16 lg:px-8">
        <ChapterHead part={part} total={total} />
        <ChapterBody nodes={part.body} />
      </div>
    </section>
  );
}

function GoalChapter({ part, total }) {
  return (
    <ToneContext.Provider value="dark">
      <section id={part.id} data-src={part.src} className="mesh-navy-deep tone-dark relative scroll-mt-16 overflow-clip py-20 text-cream sm:py-28">
        <div className="grain-overlay" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,2fr)] lg:gap-16 lg:px-8">
          <ChapterHead part={part} total={total} dark />
          <ChapterBody nodes={part.body} />
        </div>
      </section>
    </ToneContext.Provider>
  );
}

/** "In short" — the recap list as numbered cards. */
function RecapChapter({ part, total }) {
  const { t } = useLang();
  const list = part.body.find((n) => n.t === 'ul' || n.t === 'ol');
  const rest = part.body.filter((n) => n !== list);
  const items = list?.items || [];
  return (
    <section id={part.id} data-src={part.src} className="relative scroll-mt-16 bg-mint-soft py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-display text-sm font-bold tabular-nums text-sage-deep">
              {pad(part.n)} <span className="text-plum/35">/ {pad(total)}</span>
            </p>
            <SplitText
              as="h2"
              text={t(part.title || { hi: 'संक्षेप में', en: 'In short' })}
              className="h-display mt-3 text-[clamp(2rem,3.6vw,3.25rem)] font-extrabold text-ink"
            />
          </div>
        </div>
        <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => (
            <Reveal
              as="li"
              key={i}
              delay={(i % 3) * 0.08}
              className="content-flow flex gap-4 rounded-[22px] bg-white p-6 text-[16px] font-medium leading-relaxed text-ink shadow-soft ring-1 ring-mint"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sage font-display text-sm font-bold text-white">
                {i + 1}
              </span>
              <span className="pt-1">
                <RichText value={it.text} />
              </span>
            </Reveal>
          ))}
        </ol>
        {rest.length ? (
          <div className="content-flow mt-8 max-w-3xl">
            <Nodes nodes={rest} />
          </div>
        ) : null}
      </div>
    </section>
  );
}

function LegacyChapter({ part }) {
  const { t } = useLang();
  return (
    <section id={part.id} className="scroll-mt-16 bg-cream py-16 sm:py-20">
      <div className="content-flow mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Eyebrow tone="plain">{t({ hi: 'पुराने आँकड़े', en: 'Archive' })}</Eyebrow>
        <Reveal className="mt-4">
          <ContentNode node={part.node} />
        </Reveal>
      </div>
    </section>
  );
}

function CtaBand({ part }) {
  return (
    <section className={`bg-cream px-4 sm:px-6 lg:px-8 ${part.last ? 'pt-24 sm:pt-28' : 'py-16'}`}>
      <ToneContext.Provider value="dark">
        <Reveal className="mesh-navy-deep tone-dark content-flow relative mx-auto max-w-7xl overflow-hidden rounded-[36px] px-6 py-16 text-center sm:px-12 sm:py-20 [&_.mt-8]:justify-center [&_p]:mx-auto [&_p]:max-w-3xl">
          <div className="grain-overlay" />
          <div className="pointer-events-none absolute -bottom-40 left-1/2 h-80 w-[46rem] -translate-x-1/2 rounded-full bg-ember/30 blur-[100px]" />
          <div className="relative [&>:first-child]:mt-0 [&_p]:text-lg sm:[&_p]:text-xl [&_strong]:text-cream">
            <Nodes nodes={part.node.children} />
          </div>
        </Reveal>
      </ToneContext.Provider>
    </section>
  );
}

/* ── page ──────────────────────────────────────────────────────────────── */

/**
 * One routed page of the ported site, in the landing page's design.
 *
 * A page is an ordered list of section ids from the generated content
 * (`/benefits` is `['benefits', 'club']`). model.js turns those into parts —
 * hero, chapters, recap, archive, call-to-action — so the composition stays
 * declarative (see sections.js) and every page shares one layout.
 */
export default function SitePage({ ids, title }) {
  const { t, lang } = useLang();
  const page = useMemo(() => buildPage(ids), [ids]);

  useEffect(() => {
    if (title) document.title = t(title);
  }, [title, t, lang]);

  const body = page.parts.map((part, i) => {
    switch (part.kind) {
      case 'hero':
        return (
          <div key={i}>
            <PageHero part={part} title={title} chapters={page.chapters} />
            <HeroNotes nodes={part.extras} />
            <JumpChips chapters={page.chapters} />
          </div>
        );
      case 'intro':
        return <SectionIntro key={i} part={part} />;
      case 'chapter':
        return <Chapter key={i} part={part} total={page.total} alt={part.alt} />;
      case 'goal':
        return <GoalChapter key={i} part={part} total={page.total} />;
      case 'recap':
        return <RecapChapter key={i} part={part} total={page.total} />;
      case 'legacy':
        return <LegacyChapter key={i} part={part} />;
      case 'cta':
        return <CtaBand key={i} part={part} />;
      default:
        return (
          <section key={i} className="content-flow mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
            <ContentNode node={part.node} />
          </section>
        );
    }
  });

  const endsWithCta = page.parts.some((p) => p.last);

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen overflow-x-clip bg-cream text-ink antialiased">
        <ScrollProgress />
        <AcademyNav />
        <ChapterRail chapters={page.chapters} showActive={false} />
        <main>
          {body}
          <section className={`bg-cream px-4 pb-24 sm:px-6 lg:px-8 ${endsWithCta ? '' : 'pt-24'}`}>
            <RohitCard className={endsWithCta ? '-mt-8' : ''} />
          </section>
        </main>
        <SiteFooter />
      </div>
    </MotionConfig>
  );
}
