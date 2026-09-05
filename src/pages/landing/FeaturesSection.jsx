import { motion } from 'framer-motion';
// import dashboard_image from '../../assets/dashboard_image.png'; 
import { EASE, stagger, fadeUp } from './motion.js';

const FEATURES = [
  {
    icon: '🛡️',
    title: 'Cheat-free IRDA mock tests',
    subtitle: "Practice like it's the real exam",
    body:
      'Full-screen focus, randomized questions, strict timers — our proctored-style mocks feel like the real IRDA hall so you walk in steady, not shaky.',
    tag: 'Builds exam confidence',
    img: 'https://placehold.co/720x400/F5F8FE/0A1A3C?font=dm-sans&text=Mock+Test+Arena+Preview',
    imgAlt: 'Mock test interface preview',
  },
  {
    icon: '🎥',
    title: 'Live webinars & video classes',
    subtitle: 'Learn from a real LIC agent, live',
    body:
      'Scheduled live sessions with space for your questions. Concepts in plain Hindi and English — no gatekeeping, no jargon walls.',
    tag: 'Real human guidance',
    img: 'https://placehold.co/720x400/EEF3FC/465A7E?font=dm-sans&text=Live+Webinar+Interface',
    imgAlt: 'Live webinar interface preview',
  },
  {
    icon: '📊',
    title: 'Performance dashboard',
    subtitle: 'Know exactly where you stand',
    body:
      'Scores, improvement curves, time-per-question, weak-topic flags — your dashboard tells you what to fix next, not what looks pretty.',
    tag: 'Data-driven preparation',
    img: "to be placed later",
    imgAlt: 'Student dashboard preview',
  },
  {
    icon: '🗺️',
    title: 'Structured course path',
    subtitle: 'A clear roadmap, not confusion',
    body:
      'From zero to IRDA-ready in sequenced modules. No guesswork on what to study on Sunday night — the path is already mapped.',
    tag: 'Zero overwhelm',
    img: 'https://placehold.co/720x400/F5F8FE/0A1A3C?font=dm-sans&text=Course+Roadmap',
    imgAlt: 'Course roadmap preview',
  },
];

const FeaturesSection = () => (
  <section
    id="features"
    className="scroll-mt-24 bg-gradient-to-b from-white via-lic-offwhite to-white py-20 sm:py-28"
  >
    <motion.div
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.08 }}
      variants={stagger()}
    >
      <motion.div variants={fadeUp} className="mx-auto max-w-3xl text-center">
        <h2
          className="font-semibold tracking-tight text-lic-charcoal"
          style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}
        >
          Everything you need, in one place
        </h2>
        <p className="mt-4 text-pretty text-base leading-relaxed text-lic-body sm:text-lg">
          Four pillars that take you from zero to IRDA-certified and beyond.
        </p>
      </motion.div>

      <div className="mt-14 grid gap-8 md:grid-cols-2">
        {FEATURES.map((f, i) => (
          <motion.article
            key={f.title}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.6, ease: EASE, delay: i * 0.12 },
              },
            }}
            className="flex flex-col overflow-hidden rounded-card-lg border border-black/[0.06] bg-white shadow-soft transition-all duration-[250ms] ease-material hover:-translate-y-1.5 hover:shadow-navy-glow"
          >
            <div className="h-1.5 w-full bg-gradient-to-r from-lic-navy to-lic-azure" />
            <div className="flex flex-1 flex-col p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <span
                  className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-full bg-lic-navy/15 text-2xl"
                  aria-hidden
                >
                  {f.icon}
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-lic-navy">{f.title}</p>
                  <h3 className="mt-1 text-xl font-semibold tracking-tight text-lic-charcoal">
                    {f.subtitle}
                  </h3>
                </div>
              </div>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-lic-body sm:text-base">
                {f.body}
              </p>
              <span className="mt-4 inline-flex w-fit rounded-full bg-lic-ice px-3 py-1 text-xs font-semibold text-lic-charcoal">
                {f.tag}
              </span>
              <div className="mt-6 overflow-hidden rounded-card border border-black/[0.06] bg-lic-offwhite shadow-inner">
                <img
                  src={f.img}
                  alt={f.imgAlt}
                  className="h-auto w-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      <MockTestArena />
    </motion.div>
  </section>
);

function MockTestArena() {
  return (
    <motion.div
      variants={fadeUp}
      className="relative mt-16 overflow-hidden rounded-card-lg border border-lic-navy/30 bg-linear-to-br from-white via-lic-ice to-white p-8 shadow-card sm:p-12"
    >
      <div className="pointer-events-none absolute -right-20 top-10 h-56 w-56 rounded-full bg-lic-azure/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-lic-navy/15 blur-3xl" />

      <div className="relative grid items-center gap-10 lg:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-lic-navy">
            Full-width mock test arena
          </p>
          <h3
            className="mt-3 font-semibold tracking-tight text-lic-charcoal"
            style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)' }}
          >
            Picture yourself here — timer running, options locked, confidence building.
          </h3>
          <p className="mt-4 text-sm leading-relaxed text-lic-body sm:text-base">
            This is the same full-screen rhythm thousands of learners use before IRDA. No tabs. No cheatsheets. Just you and the paper — so exam day feels familiar, not foreign.
          </p>
        </div>
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="rounded-card-lg border border-black/8 bg-white p-2 shadow-lift"
        >
          <div className="flex items-center gap-2 border-b border-black/6 px-3 py-2">
            <span className="font-mono text-[10px] text-lic-body">IRDA mock · timed</span>
            <span className="ml-auto rounded-full bg-lic-navy px-2 py-0.5 text-[10px] font-bold text-white">
              24:18
            </span>
          </div>
          <img
            src="https://placehold.co/640x380/FFFFFF/14306E?font=dm-sans&text=Full-Screen+Mock+Arena"
            alt="Full-screen LICPro mock test preview"
            className="w-full rounded-card"
            loading="lazy"
          />
          <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-4">
            {['A', 'B', 'C', 'D'].map((o) => (
              <button
                key={o}
                type="button"
                className="min-h-[44px] rounded-card border-2 border-black/[0.08] text-sm font-semibold text-lic-charcoal transition-colors duration-200 hover:border-lic-navy"
              >
                {o}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default FeaturesSection;
