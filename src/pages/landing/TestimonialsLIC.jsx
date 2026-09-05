import { motion } from 'framer-motion';

import { EASE, stagger, fadeUp } from './motion.js';

const STAR = (
  <span className="text-lic-navy" aria-hidden>
    ★★★★★
  </span>
);

const ITEMS = [
  {
    name: 'Arjun Mehta',
    meta: 'Pune · cleared IRDA on first attempt',
    quote:
      'The timed mocks were ruthless in the best way. Exam day felt slower than practice — I already knew my pace.',
    x: -36,
  },
  {
    name: 'Kavitha N.',
    meta: 'Chennai · new LIC agent',
    quote:
      'Live classes meant I could ask “dumb” questions without judgement. That honesty saved me weeks of confusion.',
    x: 0,
  },
  {
    name: 'Rahul Khanna',
    meta: 'Delhi NCR · career switch',
    quote:
      'The dashboard showed my weak chapters in red. I stopped studying what I already knew — and finally used nights efficiently.',
    x: 36,
  },
];

const TestimonialsSection = () => (
  <section className="bg-lic-offwhite py-20 sm:py-28">
    <motion.div
      className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={stagger()}
    >
      <motion.h2
        variants={fadeUp}
        className="text-center font-semibold tracking-tight text-lic-charcoal"
        style={{ fontSize: 'clamp(1.65rem, 2.8vw, 2.35rem)' }}
      >
        Don&apos;t take our word for it
      </motion.h2>

      <div className="mt-14 grid gap-8 md:grid-cols-3">
        {ITEMS.map((t, i) => (
          <motion.article
            key={t.name}
            initial={{ opacity: 0, x: t.x }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.65, ease: EASE, delay: i * 0.12 }}
            className="relative overflow-hidden rounded-card-lg border border-black/[0.06] bg-white p-7 shadow-soft transition-all duration-[250ms] ease-material hover:-translate-y-1.5 hover:shadow-navy-glow"
          >
            <span
              className="pointer-events-none absolute left-4 top-2 font-serif text-7xl font-bold leading-none text-lic-navy/20"
              aria-hidden
            >
              &ldquo;
            </span>
            <div className="relative">
              <div className="text-sm">{STAR}</div>
              <p className="mt-4 text-sm leading-relaxed text-lic-body sm:text-base">{t.quote}</p>
              <p className="mt-5 text-sm font-bold text-lic-charcoal">{t.name}</p>
              <p className="text-xs text-lic-body">{t.meta}</p>
            </div>
          </motion.article>
        ))}
      </div>
    </motion.div>
  </section>
);

export default TestimonialsSection;
