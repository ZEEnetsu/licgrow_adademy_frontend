import { motion } from 'framer-motion';

import { useCountUp, formatCount } from '../../hooks/useCountUp.js';
import { EASE, stagger, fadeUp } from './motion.js';

const STATS = [
  { value: 12000, suffix: '+', label: 'Students trained' },
  { value: 94, suffix: '%', label: 'IRDA exam pass rate' },
  { value: 300, suffix: '+', label: 'Active LIC agents produced' },
  { value: 50, suffix: '+', label: 'Live webinars conducted' },
];

function StatCounter({ value, suffix, label }) {
  const [ref, n] = useCountUp(value, { duration: 2000 });
  return (
    <motion.div variants={fadeUp} className="text-center">
      <div ref={ref}>
        <p
          className="font-bold tracking-tight text-lic-charcoal"
          style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)' }}
        >
          {formatCount(n)}
          {suffix}
        </p>
        <p className="mt-1 text-sm text-lic-body">{label}</p>
      </div>
    </motion.div>
  );
}

const SocialProofBar = () => (
  <section className="relative border-t-[3px] border-lic-teal bg-[#F0FBF7] py-14 sm:py-16">
    <motion.div
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      variants={stagger()}
    >
      <motion.p
        variants={fadeUp}
        className="mb-10 text-center text-sm font-medium uppercase tracking-[0.18em] text-lic-teal"
      >
        Real numbers. Real results. Real agents.
      </motion.p>
      <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
        {STATS.map((s) => (
          <StatCounter
            key={s.label}
            value={s.value}
            suffix={s.suffix}
            label={s.label}
          />
        ))}
      </div>
    </motion.div>
  </section>
);

export default SocialProofBar;
