import { motion } from 'framer-motion';

import { EASE, stagger, fadeUp } from './motion.js';

const PAINS = [
  {
    emoji: '📚',
    title: 'Studying from PDFs and old notes with no structured practice',
  },
  {
    emoji: '🤷',
    title: 'No mentor to break down complex insurance concepts simply',
  },
  {
    emoji: '😰',
    title: 'Exam anxiety from never experiencing a real timed test environment',
  },
];

const ProblemSection = () => (
  <section
    id="problem"
    className="scroll-mt-24 bg-gradient-to-b from-[#EEF3FC] via-white to-white py-20 sm:py-24"
  >
    <motion.div
      className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={stagger()}
    >
      <motion.h2
        variants={fadeUp}
        className="mx-auto max-w-4xl text-center font-semibold tracking-tight text-lic-charcoal"
        style={{ fontSize: 'clamp(1.5rem, 2.8vw + 0.5rem, 2.5rem)', lineHeight: 1.2 }}
      >
        Most people fail their IRDA exam — not because they aren&apos;t smart, but because they prepared the wrong way.
      </motion.h2>

      <div className="mx-auto mt-12 grid gap-5 md:grid-cols-3">
        {PAINS.map((p, i) => (
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
            className="rounded-card-lg border border-black/[0.06] border-l-[4px] border-l-lic-royal bg-white p-6 shadow-soft transition-all duration-[250ms] ease-material hover:-translate-y-1.5 hover:shadow-navy-glow"
          >
            <span className="text-2xl" aria-hidden>
              {p.emoji}
            </span>
            <p className="mt-3 text-sm leading-relaxed text-lic-body sm:text-base">{p.title}</p>
          </motion.article>
        ))}
      </div>

      <motion.p
        variants={fadeUp}
        className="mx-auto mt-14 max-w-2xl text-center text-lg italic leading-relaxed text-lic-body"
      >
        We built LICPro Academy to solve exactly this.
      </motion.p>
    </motion.div>
  </section>
);

export default ProblemSection;
