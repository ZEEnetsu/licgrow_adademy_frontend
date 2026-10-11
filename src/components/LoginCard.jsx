import { motion } from 'framer-motion';

import { EXPO } from './motion/primitives.js';
import Icon from './ui/Icon.jsx';

/*
 * Feature card on the sign-in panel: a glass tile with an icon, the title and
 * line, and a tiny animated motif that hints at the feature.
 */

const MOTIFS = {
  test: () => (
    <span className="block h-1.5 overflow-hidden rounded-full bg-white/10">
      <motion.span
        className="block h-full rounded-full bg-ember"
        initial={{ width: '0%' }}
        animate={{ width: '68%' }}
        transition={{ delay: 1.2, duration: 1.6, ease: EXPO }}
      />
    </span>
  ),
  live: () => (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-ember/20 px-2.5 py-1 text-[10px] font-bold tracking-wider text-peach">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ember opacity-70" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-ember" />
      </span>
      LIVE
    </span>
  ),
  roadmap: () => (
    <svg viewBox="0 0 100 12" className="h-3 w-full overflow-visible" aria-hidden>
      <motion.path
        d="M6 6 H94"
        stroke="rgba(251,248,243,0.25)"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 1.2, duration: 1.2, ease: [0.65, 0, 0.35, 1] }}
      />
      {[6, 50, 94].map((cx, i) => (
        <motion.circle
          key={cx}
          cx={cx}
          cy="6"
          r="5"
          fill={i === 2 ? '#FA4F0C' : '#FBF8F3'}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.3 + i * 0.35, duration: 0.4, ease: EXPO }}
          style={{ transformOrigin: `${cx}px 6px` }}
        />
      ))}
    </svg>
  ),
};

const LoginCard = ({ title, des, icon = 'sparkle', motif, index = 0 }) => {
  const Motif = MOTIFS[motif];
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 + index * 0.12, duration: 0.8, ease: EXPO }}
      className="flex min-h-[12rem] flex-col justify-between rounded-[20px] bg-white/[0.06] p-5 short:min-h-0 short:p-4 ring-1 ring-inset ring-white/10 backdrop-blur-md transition-colors duration-300 hover:bg-white/[0.09]"
    >
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-peach">
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <div className="mt-6 short:mt-4">
        <h2 className="font-display text-lg font-bold leading-snug text-cream">{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-cream/60 tiny:hidden">{des}</p>
      </div>
      {Motif ? (
        <div className="mt-4 flex h-6 items-center short:mt-3">
          <div className="w-full">
            <Motif />
          </div>
        </div>
      ) : null}
    </motion.div>
  );
};

export default LoginCard;
