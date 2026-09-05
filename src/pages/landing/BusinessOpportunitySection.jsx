import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import { EASE, stagger, fadeUp } from './motion.js';

const BENEFITS = [
  {
    emoji: '💰',
    title: 'Unlimited earning potential',
    body: 'Commission-based income with no ceiling. Top agents across India earn ₹5L–₹20L+ annually — your effort sets the bar.',
  },
  {
    emoji: '🕐',
    title: 'Complete schedule freedom',
    body: 'No clock-in drama, no glass cabin politics. Build client days around school runs, farming seasons, or night shifts.',
  },
  {
    emoji: '🤝',
    title: 'A career with real purpose',
    body: 'You help families breathe easier when life turns sideways — while building a business that compounds with trust.',
  },
];

const BusinessOpportunitySection = () => (
  <section className="relative overflow-hidden bg-gradient-to-b from-lic-offwhite via-white to-[#EEF3FC] py-20 sm:py-28">
    <div className="pointer-events-none absolute right-0 top-20 h-64 w-64 rounded-full bg-lic-azure/25 blur-3xl" />
    <motion.div
      className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={stagger()}
    >
      <motion.div variants={fadeUp} className="mx-auto max-w-3xl text-center">
        <h2
          className="font-semibold tracking-tight text-lic-charcoal"
          style={{ fontSize: 'clamp(1.65rem, 2.8vw, 2.35rem)' }}
        >
          This isn&apos;t just a job. It&apos;s a business you own.
        </h2>
        <p className="mt-4 text-base leading-relaxed text-lic-body sm:text-lg">
          Here&apos;s what a career as a LIC agent actually looks like:
        </p>
      </motion.div>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {BENEFITS.map((b, i) => (
          <motion.article
            key={b.title}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.6, ease: EASE, delay: i * 0.12 },
              },
            }}
            className="rounded-card-lg border border-black/[0.06] bg-white p-6 shadow-soft transition-all duration-[250ms] ease-material hover:-translate-y-1.5 hover:shadow-navy-glow sm:p-8"
          >
            <span className="text-3xl" aria-hidden>
              {b.emoji}
            </span>
            <h3 className="mt-4 text-lg font-semibold text-lic-charcoal">{b.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-lic-body">{b.body}</p>
          </motion.article>
        ))}
      </div>

      <motion.figure
        variants={fadeUp}
        className="relative mt-14 overflow-hidden rounded-card-lg border-l-[6px] border-lic-navy bg-white p-7 shadow-card"
      >
        <span
          className="absolute right-6 top-6 font-serif text-6xl font-bold leading-none text-lic-navy/25"
          aria-hidden
        >
          &ldquo;
        </span>
        <blockquote className="relative text-base italic leading-relaxed text-lic-charcoal sm:text-lg">
          I was a homemaker with no background in finance. Six months after joining, I became one of the top agents in my district.
        </blockquote>
        <figcaption className="relative mt-4 text-sm font-semibold text-lic-body">
          — Priya S., LIC agent, Punjab
        </figcaption>
      </motion.figure>

      <motion.div variants={fadeUp} className="mt-10 flex justify-center">
        <Link
          to="/register"
          className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-lic-charcoal px-8 text-base font-semibold text-white shadow-md transition-all duration-200 ease-material hover:scale-[1.03] hover:bg-lic-charcoal/90"
        >
          I want this career — show me how
        </Link>
      </motion.div>
    </motion.div>
  </section>
);

export default BusinessOpportunitySection;
