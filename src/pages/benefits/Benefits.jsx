import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import AcademyNav from '../../components/AcademyNav.jsx';
import LandingFooter from '../landing/LandingFooter.jsx';
import { EASE, fadeUp, stagger } from '../landing/motion.js';
import DocBlock from './DocBlocks.jsx';
import { DesktopToc, MobileToc } from './DocsToc.jsx';
import { CHAPTERS, CLOSING, META } from './content.js';
import { useReadingProgress, useScrollSpy } from './useScrollSpy.js';

/* Anchors sit under a 4.5rem fixed nav; every heading carries the same offset. */
const ANCHOR = 'scroll-mt-[7.5rem] lg:scroll-mt-[6.5rem]';

function ProgressBar() {
  const p = useReadingProgress();
  return (
    <div
      className="fixed inset-x-0 top-[4.5rem] z-40 h-[2px] bg-transparent"
      role="progressbar"
      aria-label="Reading progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(p * 100)}
    >
      <div
        className="h-full origin-left bg-gradient-to-r from-lic-navy via-lic-royal to-lic-azure"
        style={{ transform: `scaleX(${p})` }}
      />
    </div>
  );
}

function Masthead() {
  return (
    <header className="relative overflow-hidden mesh-navy-deep pt-[4.5rem]">
      <div className="grain-overlay" />
      <div className="pointer-events-none absolute -right-24 top-24 h-72 w-72 rounded-full bg-lic-azure/20 blur-3xl" />

      <motion.div
        className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
        initial="hidden"
        animate="visible"
        variants={stagger(0.05, 0.1)}
      >
        <motion.nav variants={fadeUp} aria-label="Breadcrumb" className="mb-7">
          <ol className="flex items-center gap-2 text-xs text-white/55">
            <li>
              <Link to="/" className="transition-colors duration-200 hover:text-white">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="font-medium text-white/90">Benefits</li>
          </ol>
        </motion.nav>

        <motion.p
          variants={fadeUp}
          className="text-xs font-bold uppercase tracking-[0.22em] text-lic-azure"
        >
          {META.eyebrow}
        </motion.p>

        <motion.h1
          variants={fadeUp}
          className="mt-4 max-w-4xl font-semibold tracking-tight text-white"
          style={{ fontSize: 'clamp(2.1rem, 5vw, 3.6rem)', lineHeight: 1.08 }}
        >
          {META.title}
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-white/80 sm:text-lg"
        >
          {META.standfirst}
        </motion.p>

        <motion.dl
          variants={fadeUp}
          className="mt-12 grid max-w-3xl grid-cols-2 gap-x-6 gap-y-7 border-t border-white/15 pt-8 sm:grid-cols-4"
        >
          {META.stats.map((s) => (
            <div key={s.l}>
              <dt className="sr-only">{s.l}</dt>
              <dd>
                <span className="block text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  {s.v}
                </span>
                <span className="mt-1 block text-[11px] font-medium uppercase tracking-[0.14em] text-white/55">
                  {s.l}
                </span>
              </dd>
            </div>
          ))}
        </motion.dl>
      </motion.div>
    </header>
  );
}

function ChapterHeading({ ch }) {
  return (
    <header className={`${ANCHOR} mb-10`} id={ch.id}>
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs font-bold tabular-nums text-lic-royal">{ch.num}</span>
        <span className="h-px flex-1 bg-gradient-to-r from-lic-azure/60 to-transparent" />
        <span className="rounded-full bg-lic-ice px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-lic-navy">
          {ch.phase}
        </span>
      </div>

      <h2
        className="mt-5 font-semibold tracking-tight text-lic-charcoal"
        style={{ fontSize: 'clamp(1.6rem, 3vw, 2.25rem)', lineHeight: 1.15 }}
      >
        {ch.title}
      </h2>
      <p className="mt-2 text-base font-medium text-lic-royal">{ch.kicker}</p>
      <p className="mt-5 max-w-2xl text-pretty text-[15px] leading-relaxed text-lic-body sm:text-base">
        {ch.summary}
      </p>
    </header>
  );
}

function SectionHeading({ section }) {
  return (
    <h3
      id={section.id}
      className={`${ANCHOR} group mt-16 flex items-center gap-2.5 text-xl font-semibold tracking-tight text-lic-charcoal first:mt-0`}
    >
      {section.tier && (
        <span className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-full bg-lic-navy font-mono text-[11px] font-bold text-white">
          {section.tier}
        </span>
      )}
      <span>{section.title}</span>
      <a
        href={`#${section.id}`}
        aria-label={`Link to ${section.title}`}
        className="text-lic-azure opacity-0 transition-opacity duration-200 focus:opacity-100 group-hover:opacity-100"
      >
        #
      </a>
    </h3>
  );
}

function Bridge({ text, next }) {
  return (
    <div className="mt-20 rounded-card-lg border border-lic-navy/15 bg-gradient-to-br from-lic-offwhite to-lic-ice/60 p-7 sm:p-9">
      <p className="text-[15px] leading-relaxed text-lic-charcoal sm:text-base">{text}</p>
      {next && (
        <a
          href={`#${next.id}`}
          className="group mt-5 inline-flex items-center gap-2 text-sm font-semibold text-lic-navy"
        >
          <span className="font-mono text-xs tabular-nums text-lic-royal">{next.num}</span>
          {next.title}
          <span className="transition-transform duration-200 ease-material group-hover:translate-x-1">
            →
          </span>
        </a>
      )}
    </div>
  );
}

const Benefits = () => {
  const [tocOpen, setTocOpen] = useState(false);

  const ids = useMemo(
    () => CHAPTERS.flatMap((c) => [c.id, ...c.sections.map((s) => s.id)]),
    [],
  );
  const active = useScrollSpy(ids);

  return (
    <div className="min-h-screen bg-white antialiased">
      <AcademyNav />
      <ProgressBar />
      <Masthead />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <MobileToc chapters={CHAPTERS} active={active} open={tocOpen} setOpen={setTocOpen} />

        <div className="gap-14 py-14 sm:py-16 lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:py-20">
          <DesktopToc chapters={CHAPTERS} active={active} />

          {/* max-w keeps the measure near 70ch even on a wide monitor */}
          <div className="min-w-0 max-w-3xl">
            {CHAPTERS.map((ch, ci) => (
              <motion.section
                key={ch.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.02 }}
                variants={stagger(0.02, 0.06)}
                className={ci > 0 ? 'mt-28 border-t border-black/[0.07] pt-20' : ''}
              >
                <motion.div variants={fadeUp}>
                  <ChapterHeading ch={ch} />
                  {ch.intro.map((b, i) => (
                    <DocBlock key={i} block={b} />
                  ))}
                </motion.div>

                {ch.sections.map((s) => (
                  <motion.div
                    key={s.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
                    }}
                  >
                    <SectionHeading section={s} />
                    {s.blocks.map((b, i) => (
                      <DocBlock key={i} block={b} />
                    ))}
                  </motion.div>
                ))}

                {ch.bridge && <Bridge text={ch.bridge} next={CHAPTERS[ci + 1]} />}
              </motion.section>
            ))}

            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              variants={fadeUp}
              className="mt-28 overflow-hidden rounded-card-lg mesh-navy-deep p-8 sm:p-12"
            >
              <div className="grain-overlay" />
              <div className="relative">
                <h2 className="max-w-xl text-xl font-semibold tracking-tight text-white sm:text-2xl">
                  {CLOSING.title}
                </h2>
                <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-white/80">
                  {CLOSING.body}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    to="/register"
                    className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-white px-7 text-sm font-semibold text-lic-charcoal shadow-md transition-all duration-200 ease-material hover:scale-[1.03]"
                  >
                    Start your agent journey
                  </Link>
                  <Link
                    to="/"
                    className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-white/30 px-7 text-sm font-semibold text-white transition-colors duration-200 ease-material hover:bg-white/10"
                  >
                    Back to overview
                  </Link>
                </div>
              </div>
            </motion.section>

            <p className="mt-10 text-xs leading-relaxed text-lic-body/70">
              Figures, rates and eligibility rules reproduced from LIC agent circulars and are
              subject to revision. Confirm current terms with your Divisional Office before acting
              on any figure on this page.
            </p>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
};

export default Benefits;
