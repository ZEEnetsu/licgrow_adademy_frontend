import { motion } from 'framer-motion';

import { EASE, stagger, fadeUp } from './motion.js';

const STEPS = [
  {
    title: 'Meet basic eligibility',
    body: '18+ years, Class 10 pass, and valid government ID — we’ll help you verify what you need.',
  },
  {
    title: 'Complete IRDA training',
    body: 'The 25-hour pre-exam training, explained in plain language — we line up the schedule with you.',
  },
  {
    title: 'Pass the IRDA certification exam',
    body: 'The gateway to your LIC appointment — our mocks are built to mimic this exact moment.',
  },
  {
    title: 'Get appointed by LIC',
    body: 'Start serving families, earning commissions, and growing a practice you own.',
  },
];

const BecomeLICAgentSection = () => (
  <section
    id="become-lic-agent"
    className="scroll-mt-24 bg-gradient-to-b from-white via-white to-lic-offwhite py-20 sm:py-28"
  >
    <motion.div
      className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      variants={stagger()}
    >
      <motion.h2
        variants={fadeUp}
        className="text-center font-semibold tracking-tight text-lic-charcoal"
        style={{ fontSize: 'clamp(1.65rem, 2.8vw, 2.35rem)', lineHeight: 1.15 }}
      >
        What does it actually take to become a LIC agent?
      </motion.h2>

      <div className="relative mt-14 pl-2">
        <div className="absolute left-[22px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-lic-navy via-lic-azure to-lic-navy" />
        <ol className="space-y-10">
          {STEPS.map((s, i) => (
            <motion.li
              key={s.title}
              variants={{
                hidden: { opacity: 0, x: -16 },
                visible: {
                  opacity: 1,
                  x: 0,
                  transition: { duration: 0.6, ease: EASE, delay: i * 0.12 },
                },
              }}
              className="relative flex gap-5"
            >
              <span className="relative z-[1] grid h-11 w-11 flex-shrink-0 place-items-center rounded-full border-4 border-white bg-lic-navy text-sm font-bold text-white shadow-soft">
                {i + 1}
              </span>
              <div className="pt-1">
                <h3 className="font-semibold text-lic-charcoal">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-lic-body sm:text-base">{s.body}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>

      <motion.div
        variants={fadeUp}
        className="mt-12 rounded-card-lg border border-lic-navy/30 bg-lic-navy/10 p-6 text-center shadow-soft sm:p-8"
      >
        <p className="text-base font-medium leading-relaxed text-lic-charcoal sm:text-lg">
          The IRDA exam isn&apos;t hard if you&apos;re properly prepared. That&apos;s literally why this platform exists.
        </p>
      </motion.div>
    </motion.div>
  </section>
);

export default BecomeLICAgentSection;
