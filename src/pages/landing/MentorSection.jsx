import { motion } from 'framer-motion';

import { useCountUp, formatCount } from '../../hooks/useCountUp.js';
import Icon from './components/Icon.jsx';
import { EASE, fadeUp, stagger } from './motion.js';

/**
 * The mentor section.
 *
 * Rebuilt to speak the same language as the rest of the page. The previous
 * version was assembled from devices nothing else used — a full-bleed gradient
 * spine pinned to the viewport edge, a diagonal stripe texture, a saturated
 * royal portrait tile, a square-cornered stat strip with a slide-up fill, and
 * two wave dividers around a full-bleed navy band that pre-empted the final
 * CTA's own navy band. Individually defensible; together they read as a
 * different site.
 *
 * Now it is the page's standard shell — centred eyebrow, h2 and lede, then
 * content — resolving into two objects: one elevated dossier card carrying the
 * portrait, the bio and the credentials, and one contained navy quote panel.
 * Copy is unchanged throughout.
 */
const ACHIEVEMENTS = [
  { icon: 'award', target: 880, suffix: '+', label: 'Families Protected' },
  { icon: 'badgeCheck', bigText: 'Certified', label: 'LIC Expert' },
  { icon: 'clipboard', target: 100, suffix: '%', label: 'Personalised Plans' },
  { icon: 'hourglass', target: 15, suffix: '+', label: 'Years on the Ground' },
];

const CHIPS = [
  { icon: 'target', label: '15 Years of Real Field Experience' },
  { icon: 'conversation', label: 'Explains It Like a Trusted Friend' },
  { icon: 'partnership', label: 'Your Success is His Reputation' },
];

/** Portrait placeholder — outline only, reads as an intentional empty state. */
function MentorSilhouette({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 120 140" fill="none" aria-hidden>
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

/* One shell for both stat kinds — a hook cannot be called conditionally, so
   the numeric and static variants stay separate components around it. */
function StatShell({ icon, children, label }) {
  return (
    <div className="group flex flex-col items-center justify-center bg-white px-4 py-7 text-center transition-colors duration-250 ease-material hover:bg-lic-offwhite">
      <span className="text-lic-navy transition-colors duration-250 ease-material group-hover:text-lic-royal">
        <Icon name={icon} className="h-6 w-6" />
      </span>
      <div className="mt-3">{children}</div>
      <p className="mt-2 text-xs font-semibold leading-snug text-lic-body">{label}</p>
    </div>
  );
}

const STAT_VALUE =
  'block text-[2.25rem] font-semibold leading-none tracking-tight text-lic-charcoal tabular-nums sm:text-[2.5rem]';

function NumericStat({ item }) {
  const [ref, n] = useCountUp(item.target, { duration: 1800, threshold: 0.2 });
  return (
    <StatShell icon={item.icon} label={item.label}>
      <span ref={ref} className={STAT_VALUE}>
        {formatCount(n)}
        {item.suffix}
      </span>
    </StatShell>
  );
}

function StaticStat({ item }) {
  return (
    <StatShell icon={item.icon} label={item.label}>
      <span className={STAT_VALUE}>{item.bigText}</span>
    </StatShell>
  );
}

const MentorSection = () => (
  <section
    id="mentor"
    className="scroll-mt-24 bg-linear-to-b from-[#EEF3FC] via-white to-lic-offwhite py-20 sm:py-28"
  >
    <motion.div
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.08 }}
      variants={stagger()}
    >
      {/* Header — identical treatment to Problem, Business and Benefits. */}
      <motion.div variants={fadeUp} className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-lic-navy">
          The mentor who&apos;s been there, done that
        </p>
        <h2
          className="mt-4 text-pretty font-semibold tracking-tight text-lic-charcoal"
          style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', lineHeight: 1.16 }}
        >
          Rohit Lal didn&apos;t just study insurance. He lived it — for 15 years straight.
        </h2>
        <p className="mt-5 text-pretty text-base leading-relaxed text-lic-body sm:text-lg">
          When someone has personally guided 880+ families through their most important financial
          decisions, you don&apos;t just learn from them — you transform under them.
        </p>
      </motion.div>

      {/* The dossier card. */}
      <motion.article
        variants={fadeUp}
        className="mx-auto mt-14 max-w-6xl overflow-hidden rounded-card-lg border border-black/6 bg-white shadow-card"
      >
        <div className="h-1.5 w-full bg-linear-to-r from-lic-navy to-lic-azure" />

        <div className="grid gap-8 p-7 sm:p-9 lg:grid-cols-[19rem_minmax(0,1fr)] lg:gap-12">
          {/* Portrait */}
          <div className="relative mx-auto w-full max-w-[19rem] lg:mx-0">
            <div className="overflow-hidden rounded-card border border-black/6 bg-linear-to-br from-lic-ice via-lic-frost/50 to-lic-ice shadow-soft">
              <div className="flex aspect-4/5 items-center justify-center">
                <MentorSilhouette className="h-40 w-auto text-lic-navy/30 sm:h-48" />
                <span className="sr-only">Mentor photo — placeholder</span>
              </div>
            </div>
            <div className="absolute inset-x-5 -bottom-4">
              <p className="rounded-full border border-black/6 bg-white px-4 py-2.5 text-center text-xs font-bold text-lic-charcoal shadow-card">
                Trusted by 880+ families
              </p>
            </div>
          </div>

          {/* Bio */}
          <div className="pt-7 lg:pt-0">
            <h3 className="text-xl font-semibold tracking-tight text-lic-charcoal">Rohit Lal</h3>
            <p className="mt-1 text-sm font-semibold text-lic-royal">
              Founder · The FinancialDoctor
            </p>

            <p className="mt-5 max-w-[44rem] text-[15px] leading-relaxed text-lic-body sm:text-base">
              Rohit Lal is not another trainer with a certificate and a slide deck. He is a
              battle-tested LIC agent, senior advisor, and finance director who has spent 15+ years
              in the field doing exactly what he is going to teach you. As The FinancialDoctor, he
              has helped middle-class and upper-middle-class professionals across India build real,
              lasting financial security — not with generic advice, but with deeply personalised
              plans built around real lives. He built LICPro Academy because he was tired of
              watching talented people fail their IRDA exams and give up on a career that could have
              changed their lives. Now he is here — for you.
            </p>

            <ul className="mt-7 flex flex-wrap gap-2.5">
              {CHIPS.map((c) => (
                <li
                  key={c.label}
                  className="inline-flex items-center gap-2 rounded-full bg-lic-ice px-3.5 py-2 text-xs font-semibold text-lic-navy"
                >
                  <Icon name={c.icon} className="h-3.5 w-3.5 shrink-0" />
                  {c.label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/*
          gap-px over a tinted parent draws the hairlines, so the 2×2 phone
          layout and the 1×4 desktop layout both get clean dividers without a
          per-child nth-of-type border rule.
        */}
        <div className="grid grid-cols-2 gap-px border-t border-black/6 bg-black/6 sm:grid-cols-4">
          {ACHIEVEMENTS.map((item) =>
            item.target != null ? (
              <NumericStat key={item.label} item={item} />
            ) : (
              <StaticStat key={item.label} item={item} />
            ),
          )}
        </div>
      </motion.article>

      {/* Quote — contained, so the final CTA keeps the page's only navy band. */}
      <motion.figure
        variants={{
          hidden: { opacity: 0, y: 30 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE, delay: 0.1 } },
        }}
        className="relative mx-auto mt-8 max-w-6xl overflow-hidden rounded-card-lg mesh-navy-deep p-8 shadow-card sm:p-12"
      >
        <div className="grain-overlay" />
        <span
          className="pointer-events-none absolute -right-2 top-2 select-none font-serif text-[9rem] leading-none text-white/10"
          aria-hidden
        >
          &rdquo;
        </span>

        <div className="relative max-w-4xl">
          <blockquote className="text-pretty text-lg font-medium leading-relaxed text-white sm:text-xl sm:leading-relaxed">
            I have sat across from hundreds of people — nervous, uncertain, not knowing where to
            begin. And every single time, I saw the same thing: someone with everything it takes,
            just waiting for the right person to show them the way. That person is me. And that
            platform is this one. If you show up, I will make sure you succeed.
          </blockquote>

          <figcaption className="mt-8 flex items-center gap-4 border-t border-white/15 pt-6">
            <img
              src="https://placehold.co/128x128/14306E/FFFFFF?font=dm-sans&text=RL"
              alt="Rohit Lal"
              width={56}
              height={56}
              loading="lazy"
              className="h-14 w-14 shrink-0 rounded-full border border-white/25 object-cover"
            />
            <div className="min-w-0">
              <p className="font-semibold text-white">Rohit Lal</p>
              <p className="text-sm text-lic-frost">Founder — LICPro Academy</p>
            </div>
          </figcaption>
        </div>
      </motion.figure>
    </motion.div>
  </section>
);

export default MentorSection;
