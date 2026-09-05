import { motion } from 'framer-motion';

import { useCountUp, formatCount } from '../../hooks/useCountUp.js';
import { WaveDivider } from './components/WaveDivider.jsx';
import { fadeUp, stagger } from './motion.js';

const ACHIEVEMENTS = [
  { emoji: '🏅', target: 880, suffix: '+', label: 'Families Protected' },
  { emoji: '✅', bigText: 'Certified', label: 'LIC Expert' },
  { emoji: '📋', target: 100, suffix: '%', label: 'Personalised Plans' },
  { emoji: '⏳', target: 15, suffix: '+', label: 'Years on the Ground' },
];

const CHIPS = [
  '🎯 15 Years of Real Field Experience',
  '🗣️ Explains It Like a Trusted Friend',
  '🤝 Your Success is His Reputation',
];

/** Avatar silhouette — outline only, reads as intentional empty state. */
function MentorSilhouette({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M60 18c-12.5 0-22.5 10-22.5 22.2 0 9.7 6.3 18 15 21.2C38 66.8 28 79.5 28 94.5V118c0 1.7 1.3 3 3 3h58c1.7 0 3-1.3 3-3V94.5c0-15-10-27.7-24.5-33.1 8.7-3.2 15-11.5 15-21.2C82.5 28 72.5 18 60 18z"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function AnimatedStatUnderline({ className = '' }) {
  return (
    <motion.span
      className={[
        'pointer-events-none z-10 mt-1.5 block h-0.5 w-full max-w-[5rem] rounded-full bg-lic-navy transition-colors duration-300 group-hover:bg-white',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, amount: 0.45 }}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
      style={{ transformOrigin: 'left center' }}
    />
  );
}

function AchievementCardNumeric({ item }) {
  const [ref, n] = useCountUp(item.target, { duration: 1800, threshold: 0.2 });

  return (
    <motion.article
      variants={fadeUp}
      className="mentor-ach-hover-fill group relative flex min-h-[188px] flex-col overflow-hidden bg-transparent transition-shadow duration-300 hover:shadow-[0_20px_40px_-16px_rgba(20,48,110,0.35)]"
    >
        <div ref={ref} className="relative z-10 flex flex-1 flex-col justify-center px-3 py-7 text-center sm:px-5">
        <span className="text-2xl transition-colors duration-300 group-hover:text-white" aria-hidden>
          {item.emoji}
        </span>
        <div className="relative z-10 mt-2 min-h-[3.25rem]">
          <span className="block text-[3rem] font-extrabold leading-none tracking-tight text-lic-navy transition-colors duration-300 tabular-nums group-hover:text-white">
            {formatCount(n)}
            {item.suffix}
          </span>
          <AnimatedStatUnderline className="mx-auto" />
        </div>
        <p className="relative z-10 mt-3 text-xs font-semibold leading-snug text-lic-charcoal transition-colors duration-300 group-hover:text-white/95 sm:text-sm">
          {item.label}
        </p>
      </div>
    </motion.article>
  );
}

function AchievementCardStatic({ item }) {
  return (
    <motion.article
      variants={fadeUp}
      className="mentor-ach-hover-fill group relative flex min-h-[188px] flex-col overflow-hidden bg-transparent transition-shadow duration-300 hover:shadow-[0_20px_40px_-16px_rgba(20,48,110,0.35)]"
    >
      <div className="relative z-10 flex flex-1 flex-col justify-center px-3 py-7 text-center sm:px-5">
        <span className="text-2xl transition-colors duration-300 group-hover:text-white" aria-hidden>
          {item.emoji}
        </span>
        <div className="relative z-10 mt-2 min-h-[3.25rem]">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="text-[3rem] font-extrabold leading-none tracking-tight text-lic-navy transition-colors duration-300 group-hover:text-white"
          >
            {item.bigText}
          </motion.p>
          <AnimatedStatUnderline className="mx-auto" />
        </div>
        <p className="relative z-10 mt-3 text-xs font-semibold leading-snug text-lic-charcoal transition-colors duration-300 group-hover:text-white/95 sm:text-sm">
          {item.label}
        </p>
      </div>
    </motion.article>
  );
}

function AchievementCard({ item }) {
  return item.target != null ? (
    <AchievementCardNumeric item={item} />
  ) : (
    <AchievementCardStatic item={item} />
  );
}

const MentorSection = () => (
  <section id="mentor" className="relative scroll-mt-24 bg-white">
    {/* Section spine — ties Block 1 + Block 2 */}
    <div
      className="pointer-events-none absolute bottom-0 left-0 top-0 z-[5] w-[8px] bg-gradient-to-b from-lic-navy via-lic-royal to-lic-azure"
      aria-hidden
    />

    {/* —— Block 1 —— */}
    <div className="mentor-block1-stripes relative">
      <motion.div
        className="relative mx-auto max-w-7xl px-4 pb-0 pt-14 sm:px-6 sm:pt-16 lg:px-8 lg:pt-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={stagger()}
      >
        <motion.p
          variants={fadeUp}
          className="text-center text-[11px] font-bold uppercase tracking-[0.26em] text-lic-navy sm:text-xs"
        >
          The mentor who&apos;s been there, done that
        </motion.p>

        <motion.div
          variants={stagger(0.06, 0.12)}
          className="mt-9 grid items-center gap-8 lg:grid-cols-2 lg:gap-12 lg:gap-x-14"
        >
          {/* Portrait + glow */}
          <motion.div variants={fadeUp} className="relative mx-auto mb-14 w-full max-w-[340px] lg:mx-0 lg:mb-0 lg:max-w-none">
            <div
              className="pointer-events-none absolute left-1/2 top-[42%] z-0 aspect-square w-[min(118vw,520px)] max-w-none -translate-x-1/2 -translate-y-1/2 sm:w-[480px]"
              style={{
                background:
                  'radial-gradient(closest-side, rgba(20, 48, 110, 0.08) 0%, transparent 72%)',
              }}
              aria-hidden
            />

            <div className="relative z-[1] mx-auto w-full max-w-[320px] lg:mx-0">
              <div className="overflow-hidden rounded-card-lg shadow-[0_20px_50px_-12px_rgba(20,48,110,0.4),0_0_0_1px_rgba(255,255,255,0.5)] ring-1 ring-white/60">
                <div
                  className="flex max-h-[480px] min-h-[320px] flex-col items-center justify-center bg-gradient-to-br from-lic-royal to-lic-frost px-8 py-10 sm:min-h-[360px] sm:py-12"
                >
                  <MentorSilhouette className="h-44 w-[10.5rem] text-lic-charcoal drop-shadow-[0_2px_8px_rgba(255,255,255,0.25)] sm:h-52 sm:w-[12rem]" />
                  <span className="sr-only">Mentor photo — placeholder</span>
                </div>
              </div>

              <div className="absolute bottom-0 left-1/2 z-[2] w-[max(88%,260px)] max-w-[92%] -translate-x-1/2 translate-y-1/2">
                <div className="rounded-full border border-white/90 bg-white px-5 py-2.5 text-center shadow-[0_18px_40px_-8px_rgba(10,26,60,0.28),0_0_0_1px_rgba(20,48,110,0.12)] sm:px-6 sm:py-3">
                  <p className="text-xs font-bold text-lic-charcoal sm:text-sm">
                    Trusted by 880+ families
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bio + left accent */}
          <motion.div variants={fadeUp} className="relative pt-2 text-center lg:pt-2 lg:text-left">
            <div className="relative flex gap-3 sm:gap-5 lg:gap-6">
              <div
                className="mt-1 h-[220px] w-1 shrink-0 rounded-full bg-gradient-to-b from-lic-navy via-lic-royal to-lic-azure sm:mt-2 sm:h-[288px] sm:w-[4px]"
                aria-hidden
              />
              <div className="min-w-0 flex-1 space-y-3 sm:space-y-2.5">
                <h2
                  className="font-semibold tracking-tight text-lic-charcoal"
                  style={{
                    fontSize: 'clamp(1.45rem, 2.1vw + 0.8rem, 2.25rem)',
                    lineHeight: 1.28,
                  }}
                >
                  Rohit Lal didn&apos;t just study insurance. He lived it — for 15 years straight.
                </h2>
                <p className="text-[0.9375rem] font-medium leading-[1.55] text-lic-charcoal/90 sm:text-base">
                  When someone has personally guided 880+ families through their most important
                  financial decisions, you don&apos;t just learn from them — you transform under
                  them.
                </p>
                <p className="text-[0.875rem] leading-[1.58] text-lic-body sm:text-[0.9375rem]">
                  Rohit Lal is not another trainer with a certificate and a slide deck. He is a
                  battle-tested LIC agent, senior advisor, and finance director who has spent 15+
                  years in the field doing exactly what he is going to teach you. As The
                  FinancialDoctor, he has helped middle-class and upper-middle-class professionals
                  across India build real, lasting financial security — not with generic advice, but
                  with deeply personalised plans built around real lives. He built LICPro Academy
                  because he was tired of watching talented people fail their IRDA exams and give up
                  on a career that could have changed their lives. Now he is here — for you.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Achievement strip */}
        <motion.div
          variants={stagger(0.05, 0.08)}
          className="mentor-ach-strip relative z-[1] mt-12 [grid-auto-rows:1fr] overflow-hidden rounded-t-card-lg border border-lic-navy/20 bg-gradient-to-b from-lic-ice to-white shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] sm:mt-14"
        >
          {ACHIEVEMENTS.map((item) => (
            <AchievementCard key={`${item.emoji}-${item.label}`} item={item} />
          ))}
        </motion.div>
      </motion.div>
    </div>

    {/* Wave into quote block */}
    <WaveDivider fill="#14306E" />

    {/* —— Block 2 —— */}
    <div className="relative overflow-hidden mentor-quote-mesh">
      <div className="grain-overlay opacity-[0.04]" aria-hidden />

      {/* Decorative ring — top right */}
      <svg
        className="pointer-events-none absolute -right-24 -top-20 h-[400px] w-[400px] text-white sm:-right-16"
        style={{ opacity: 0.06 }}
        aria-hidden
      >
        <circle cx="200" cy="200" r="199" fill="none" stroke="currentColor" strokeWidth="1.25" />
      </svg>

      <motion.div
        className="relative z-[1] mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.12 }}
        variants={stagger()}
      >
        <div className="relative">
          <span
            className="pointer-events-none absolute -left-4 top-[-0.15em] z-0 select-none font-serif text-[12rem] font-semibold leading-none text-white sm:-left-8"
            style={{ opacity: 0.12 }}
            aria-hidden
          >
            &ldquo;
          </span>
          <span
            className="pointer-events-none absolute -bottom-16 -right-6 z-0 select-none font-serif text-[8rem] font-semibold leading-none text-white sm:right-0 lg:text-[10rem]"
            style={{ opacity: 0.1 }}
            aria-hidden
          >
            &rdquo;
          </span>

          <motion.blockquote
            variants={fadeUp}
            className="relative z-[1] pt-2 text-[1.5rem] font-medium leading-[1.8] text-white sm:text-[1.5625rem] lg:text-[1.6875rem]"
          >
            I have sat across from hundreds of people — nervous, uncertain, not knowing where to
            begin. And every single time, I saw the same thing: someone with everything it takes,
            just waiting for the right person to show them the way. That person is me. And that
            platform is this one. If you show up, I will make sure you succeed.
          </motion.blockquote>

          <motion.p
            variants={fadeUp}
            className="relative z-[1] mt-7 text-sm font-semibold text-lic-frost sm:text-base"
          >
            — Rohit Lal, Founder — LICPro Academy
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="relative z-[1] mt-8 inline-flex w-full max-w-full items-center gap-4 rounded-full border border-white/20 bg-white/[0.12] px-4 py-3 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.35)] backdrop-blur-[8px] sm:w-auto sm:px-6 sm:py-3.5"
          >
            <img
              src="https://placehold.co/128x128/14306E/FFFFFF?font=dm-sans&text=RL"
              alt="Rohit Lal"
              className="h-14 w-14 shrink-0 rounded-full border border-white/30 object-cover shadow-md sm:h-16 sm:w-16"
              width={64}
              height={64}
              loading="lazy"
            />
            <div className="min-w-0 text-left">
              <p className="font-bold text-white">Rohit Lal</p>
              <p className="text-sm italic text-lic-frost">The FinancialDoctor</p>
            </div>
          </motion.div>

          <motion.ul
            variants={fadeUp}
            className="relative z-[1] mt-9 flex flex-wrap justify-center gap-2.5 sm:justify-start lg:justify-center"
          >
            {CHIPS.map((c) => (
              <li
                key={c}
                className="rounded-full border border-white/30 bg-white/[0.15] px-3.5 py-2 text-center text-xs font-medium text-white shadow-[0_0_24px_-4px_rgba(255,255,255,0.15)] sm:px-4 sm:text-sm"
              >
                {c}
              </li>
            ))}
          </motion.ul>
        </div>
      </motion.div>
    </div>

    <WaveDivider fill="#F5F8FE" />
  </section>
);

export default MentorSection;
