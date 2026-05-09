import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import { EASE, stagger, fadeUp } from './motion.js';

const STEPS = [
  {
    title: 'Create your free account',
    body: 'Register and pick your course in under two minutes — no tricks, no hidden screens.',
  },
  {
    title: 'Study, practice & attend live classes',
    body: 'Mocks, replays, and live mentor hours — all tracked in one calm dashboard.',
  },
  {
    title: 'Pass the IRDA exam & launch your career',
    body: 'Walk in prepared from timed drills. Walk out licensed, with a clear plan for week one.',
  },
];

const HowItWorksSection = () => (
  <section
    id="how-it-works"
    className="scroll-mt-24 bg-[#F0FBF7] py-20 sm:py-28"
  >
    <motion.div
      className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={stagger()}
    >
      <motion.div variants={fadeUp} className="mx-auto max-w-2xl text-center">
        <h2
          className="font-semibold tracking-tight text-lic-charcoal"
          style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}
        >
          3 simple steps to your LIC career
        </h2>
      </motion.div>

      {/* Desktop stepper */}
      <div className="relative mt-16 hidden md:block">
        <div className="flex items-start justify-between gap-4">
          {STEPS.map((s, i) => (
            <div key={s.title} className="relative flex flex-1 flex-col items-center text-center">
              {i < STEPS.length - 1 && (
                <motion.div
                  className="absolute left-[calc(50%+2.5rem)] top-5 h-0.5 w-[calc(100%-5rem)] origin-left bg-gradient-to-r from-lic-teal to-lic-sky"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, ease: EASE, delay: 0.2 + i * 0.15 }}
                />
              )}
              <motion.div
                variants={fadeUp}
                className="relative z-[1] grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-lic-teal to-lic-sky text-sm font-bold text-white shadow-md"
              >
                {i + 1}
              </motion.div>
              <h3 className="mt-5 text-base font-semibold text-lic-charcoal">{s.title}</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-lic-body">{s.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile vertical */}
      <div className="relative mt-12 md:hidden">
        <div
          className="absolute bottom-8 left-[19px] top-8 w-0.5 bg-gradient-to-b from-lic-teal to-lic-sky"
          aria-hidden
        />
        <ol className="relative list-none space-y-8 pl-1">
        {STEPS.map((s, i) => (
          <motion.li
            key={s.title}
            variants={fadeUp}
            className="relative flex gap-4 pl-1"
          >
            <span className="relative z-[1] grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-gradient-to-br from-lic-teal to-lic-sky text-sm font-bold text-white shadow-md">
              {i + 1}
            </span>
            <div>
              <h3 className="text-base font-semibold text-lic-charcoal">{s.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-lic-body">{s.body}</p>
            </div>
          </motion.li>
        ))}
        </ol>
      </div>

      <motion.div variants={fadeUp} className="mt-14 flex justify-center">
        <Link
          to="/register"
          className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-lic-teal px-8 text-base font-semibold text-white shadow-md transition-all duration-200 ease-material hover:scale-[1.03] hover:shadow-teal-glow"
        >
          Get started today — it&apos;s free
        </Link>
      </motion.div>
    </motion.div>
  </section>
);

export default HowItWorksSection;
