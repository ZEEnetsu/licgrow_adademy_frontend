import { motion } from 'framer-motion';

import { EASE, stagger, fadeUp } from './motion.js';

/**
 * Photography brief: every frame is blue-dominant straight out of camera
 * (blue shirt, blue suit, blue backdrop, daylit blue-grey rooms) so the grid
 * already sits inside the lic-navy palette before any CSS treatment. The
 * duotone layer below then closes the remaining gap between six sources.
 */
const IMG = '?q=80&w=1200&auto=format&fit=crop';

const BENEFIT_CARDS = [
  {
    id: 1,
    title: 'Flexible work hours',
    description:
      'Enjoy the freedom to choose your own work hours and maintain a healthy work-life balance.',
    image: `https://images.unsplash.com/photo-1581668181500-08c6a6e006f7${IMG}`,
    alt: 'Agent in a blue sweater working at her own laptop, on her own schedule',
  },
  {
    id: 2,
    title: 'Unlimited income',
    description:
      'Endless earnings potential awaits dedicated LIC agents with unlimited income opportunities.',
    image: `https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf${IMG}`,
    alt: 'Hands building rising stacks of coins, one commission at a time',
  },
  {
    id: 3,
    title: 'No Investment',
    description: 'Start your LIC agent journey without any initial investment required.',
    image: `https://plus.unsplash.com/premium_photo-1678917827802-721b5f5b4bf0${IMG}`,
    alt: 'Two partners shaking hands — the only thing you put in to begin',
  },
  {
    id: 4,
    title: 'Own Business — An Entrepreneur',
    description: 'Be your own boss with a thriving LIC agent business.',
    image: `https://plus.unsplash.com/premium_photo-1682437140740-3288477ec2a1${IMG}`,
    alt: 'Agent in a blue suit standing in the office he runs himself',
  },
  {
    id: 5,
    title: 'High Paying & Rewarding Career',
    description:
      'Embark on a high-paying, rewarding career as an LIC agent, with limitless earning potential.',
    image: `https://images.unsplash.com/photo-1599090738077-75d2187fd892${IMG}`,
    alt: 'Professional looking out over a city skyline, career ahead of him',
  },
  {
    id: 6,
    title: 'Professional Training towards Excellence',
    description:
      'Receive top-tier professional training to excel as a successful LIC agent with confidence.',
    image: `https://images.unsplash.com/photo-1758270704296-a59b8f4e7dda${IMG}`,
    alt: 'Trainer leading a classroom of attentive adult learners',
  },
];

const BenefitsSection = () => (
  <section
    id="benefits"
    className="relative scroll-mt-24 overflow-hidden bg-linear-to-b from-[#EEF3FC] via-white to-white py-20 sm:py-28"
  >
    <div className="pointer-events-none absolute -left-24 top-32 h-64 w-64 rounded-full bg-lic-azure/20 blur-3xl" />

    <motion.div
      className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.08 }}
      variants={stagger()}
    >
      <motion.div variants={fadeUp} className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-lic-navy">
          Why become a LIC agent
        </p>
        <h2
          className="mt-3 font-semibold tracking-tight text-lic-charcoal"
          style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', lineHeight: 1.15 }}
        >
          Benefits that come with the badge
        </h2>
        <p className="mt-4 text-pretty text-base leading-relaxed text-lic-body sm:text-lg">
          Six reasons thousands choose this career — and stay in it for decades.
        </p>
      </motion.div>

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {BENEFIT_CARDS.map((c, i) => (
          <motion.article
            key={c.id}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.6, ease: EASE, delay: (i % 3) * 0.12 },
              },
            }}
            className="group flex flex-col overflow-hidden rounded-card-lg border border-black/6 bg-white shadow-soft transition-all duration-250 ease-material hover:-translate-y-1.5 hover:shadow-navy-glow"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-lic-ice">
              <img
                src={c.image}
                alt={c.alt}
                loading="lazy"
                className="h-full w-full object-cover saturate-[0.9] transition-transform duration-[600ms] ease-material group-hover:scale-105"
              />
              {/*
                Navy duotone. `mix-blend-color` takes hue + saturation from this
                layer and keeps the photo's own luminance, so six unrelated
                sources land on one lic-navy cast instead of six different ones.
                It relaxes on hover — the photo warms back to itself as a reward
                for the interaction, rather than the card just moving.
              */}
              <div
                className="absolute inset-0 bg-lic-navy opacity-40 mix-blend-color transition-opacity duration-[400ms] ease-material group-hover:opacity-[0.12]"
                aria-hidden
              />
              <div
                className="absolute inset-0 bg-linear-to-t from-lic-charcoal/45 via-lic-charcoal/5 to-transparent"
                aria-hidden
              />
              <span className="absolute left-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-xs font-bold text-lic-navy shadow-soft backdrop-blur-sm">
                {String(c.id).padStart(2, '0')}
              </span>
            </div>

            <div className="flex flex-1 flex-col p-6 sm:p-7">
              <h3 className="text-lg font-semibold leading-snug tracking-tight text-lic-charcoal">
                {c.title}
              </h3>
              <span className="mt-3 block h-0.5 w-10 rounded-full bg-linear-to-r from-lic-navy to-lic-azure transition-all duration-250 ease-material group-hover:w-16" />
              <p className="mt-4 flex-1 text-sm leading-relaxed text-lic-body">{c.description}</p>
            </div>
          </motion.article>
        ))}
      </div>
    </motion.div>
  </section>
);

export default BenefitsSection;
