import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import { stagger, fadeUp } from './motion.js';

const FinalCtaSection = () => (
  <section className="relative overflow-hidden bg-gradient-to-br from-lic-teal via-lic-teal to-lic-sky py-24 sm:py-28">
    <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 animate-drift rounded-full bg-white/10 blur-3xl" />
    <div
      className="pointer-events-none absolute -right-20 bottom-10 h-64 w-64 animate-drift rounded-full bg-white/10 blur-3xl"
      style={{ animationDelay: '-6s' }}
    />
    <div className="grain-overlay opacity-[0.06]" />

    <motion.div
      className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      variants={stagger()}
    >
      <motion.h2
        variants={fadeUp}
        className="font-semibold tracking-tight text-white"
        style={{ fontSize: 'clamp(1.75rem, 3.2vw, 2.75rem)', lineHeight: 1.15 }}
      >
        You&apos;re one decision away from a new career.
      </motion.h2>
      <motion.p
        variants={fadeUp}
        className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-white/90 sm:text-lg"
      >
        Thousands of agents started exactly where you are right now. The only difference? They took the first step.
      </motion.p>
      <motion.div variants={fadeUp} className="mt-10">
        <Link
          to="/register"
          className="inline-flex min-h-[52px] min-w-[240px] items-center justify-center rounded-full bg-white px-10 text-base font-bold text-lic-teal shadow-xl transition-all duration-200 ease-material hover:scale-[1.03] hover:shadow-2xl"
        >
          Create your free account now
        </Link>
        <p className="mt-4 text-sm text-white/75">
          No credit card required. Takes 2 minutes.
        </p>
      </motion.div>
    </motion.div>
  </section>
);

export default FinalCtaSection;
