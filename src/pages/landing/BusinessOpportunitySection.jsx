import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import Icon from './components/Icon.jsx';
import { EASE, stagger, fadeUp } from './motion.js';

/**
 * The reframe. The reader arrives thinking "insurance agent" means commission
 * work; they should leave understanding it as a practice they own outright.
 */
const PILLARS = [
  {
    icon: 'growth',
    title: 'Income with no ceiling',
    body:
      'You earn a share of every premium — not once, but every year it renews. Write one policy well and it pays you for a decade. No appraisal cycle, no band, no manager deciding what you are worth.',
    proof: 'Paid on renewals, not just sales',
  },
  {
    icon: 'clock',
    title: 'Your calendar, your call',
    body:
      'No roster, no leave form, no commute. Build client hours around the school run, the harvest, or the shift you are still working until this replaces it.',
    proof: 'Full-time income, part-time start',
  },
  {
    icon: 'partnership',
    title: 'Work that is worth doing',
    body:
      'You are the person a family calls on their worst day — and the reason the money actually arrives. Not many careers let you say that at the end of a week.',
    proof: 'A practice built on trust',
  },
];

const BusinessOpportunitySection = () => (
  <section className="relative overflow-hidden bg-linear-to-b from-lic-offwhite via-white to-[#EEF3FC] py-20 sm:py-28">
    <div className="pointer-events-none absolute right-0 top-20 h-64 w-64 rounded-full bg-lic-azure/25 blur-3xl" />

    <motion.div
      className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={stagger()}
    >
      <motion.div variants={fadeUp} className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-lic-navy">
          What you are actually signing up for
        </p>
        <h2
          className="mt-4 text-pretty font-semibold tracking-tight text-lic-charcoal"
          style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', lineHeight: 1.16 }}
        >
          This is not a job you apply for. It is a practice you own.
        </h2>
        <p className="mt-5 text-pretty text-base leading-relaxed text-lic-body sm:text-lg">
          Nobody sets your ceiling, your hours, or your worth — you do, from day one, with LIC&apos;s
          name behind you.
        </p>
      </motion.div>

      <div className="mt-14 grid gap-6 md:grid-cols-3 lg:gap-7">
        {PILLARS.map((p, i) => (
          <motion.article
            key={p.title}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.6, ease: EASE, delay: i * 0.12 },
              },
            }}
            className="group flex flex-col overflow-hidden rounded-card-lg border border-black/6 bg-white shadow-soft transition-all duration-250 ease-material hover:-translate-y-1.5 hover:shadow-navy-glow"
          >
            <div className="h-1.5 w-full bg-linear-to-r from-lic-navy to-lic-azure" />
            <div className="flex flex-1 flex-col p-7 sm:p-8">
              <span className="grid h-12 w-12 place-items-center rounded-card border border-lic-navy/15 bg-lic-ice text-lic-navy transition-colors duration-250 ease-material group-hover:bg-lic-navy group-hover:text-white">
                <Icon name={p.icon} className="h-[1.4rem] w-[1.4rem]" />
              </span>

              <h3 className="mt-5 text-lg font-semibold leading-snug tracking-tight text-lic-charcoal">
                {p.title}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-lic-body">{p.body}</p>

              <span className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-lic-ice px-3 py-1.5 text-xs font-semibold text-lic-navy">
                <Icon name="badgeCheck" className="h-3.5 w-3.5" />
                {p.proof}
              </span>
            </div>
          </motion.article>
        ))}
      </div>

      <motion.figure
        variants={fadeUp}
        className="relative mx-auto mt-14 max-w-4xl overflow-hidden rounded-card-lg border-l-[6px] border-lic-navy bg-white p-7 shadow-card sm:p-9"
      >
        <span
          className="absolute right-7 top-4 font-serif text-7xl font-bold leading-none text-lic-navy/15"
          aria-hidden
        >
          &ldquo;
        </span>
        <blockquote className="relative max-w-2xl text-pretty text-base italic leading-relaxed text-lic-charcoal sm:text-lg">
          I was a homemaker with no background in finance. Six months after joining, I became one of
          the top agents in my district.
        </blockquote>
        <figcaption className="relative mt-4 text-sm font-semibold text-lic-body">
          — Priya S., LIC agent, Punjab
        </figcaption>
      </motion.figure>

      <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-3">
        <Link
          to="/register"
          className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-lic-charcoal px-8 text-base font-semibold text-white shadow-md transition-all duration-200 ease-material hover:scale-[1.03] hover:bg-lic-charcoal/90"
        >
          Show me how to start
          <Icon
            name="arrowRight"
            className="h-4 w-4 transition-transform duration-200 ease-material group-hover:translate-x-1"
          />
        </Link>
        <p className="text-xs text-lic-body">No investment to begin. No targets in your first month.</p>
      </motion.div>
    </motion.div>
  </section>
);

export default BusinessOpportunitySection;
