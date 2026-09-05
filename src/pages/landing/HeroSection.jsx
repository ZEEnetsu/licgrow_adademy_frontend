import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import { WaveDivider } from "./components/WaveDivider.jsx";
import { EASE, stagger } from "./motion.js";

const LINE_A = "Your Journey to Becoming a Trusted LIC Agent".split(" ");
const LINE_B = "Starts Here.".split(" ");

const TRUST_CHIPS = [
  { icon: "✅", label: "IRDA exam focused" },
  { icon: "🔒", label: "Cheat-free tests" },
  { icon: "📹", label: "Live expert classes" },
];

const HeroSection = () => (
  <section className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-white pt-18 mesh-navy">
    <div className="pointer-events-none absolute -left-32 top-24 h-72 w-72 rounded-full bg-lic-azure/25 blur-3xl" />
    <div className="pointer-events-none absolute -right-24 bottom-40 h-80 w-80 rounded-full bg-lic-navy/20 blur-3xl" />
    <div className="grain-overlay" />

    <div className="relative z-1 mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8 lg:py-20">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger(0.05, 0.09)}
        className="text-center lg:text-left"
      >
        <motion.h1
          className="font-semibold tracking-tight text-lic-charcoal"
          style={{
            fontSize: "clamp(1.875rem, 3.5vw + 1rem, 3.25rem)",
            lineHeight: 1.12,
          }}
        >
          <span className="block">
            {LINE_A.map((word, i) => (
              <motion.span
                key={`a-${word}-${i}`}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.5, ease: EASE, delay: i * 0.07 },
                  },
                }}
                className="mr-2 inline-block"
              >
                {word}
              </motion.span>
            ))}
          </span>
          <span className="mt-1 block text-lic-navy">
            {LINE_B.map((word, i) => (
              <motion.span
                key={`b-${word}-${i}`}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.5,
                      ease: EASE,
                      delay: (LINE_A.length + i) * 0.07,
                    },
                  },
                }}
                className="mr-2 inline-block"
              >
                {word}
              </motion.span>
            ))}
          </span>
        </motion.h1>

        <motion.p
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.6, ease: EASE, delay: 0.45 },
            },
          }}
          className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-lic-body sm:text-lg lg:mx-0"
        >
          Join thousands of aspiring agents who are passing their IRDA exams,
          building their practice, and changing lives — with the tools that
          actually prepare you.
        </motion.p>

        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.6, ease: EASE, delay: 0.55 },
            },
          }}
          className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:justify-center lg:justify-start"
        >
          <Link
            to="/register"
            className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full bg-lic-navy px-7 text-base font-semibold text-white shadow-md transition-all duration-200 ease-material hover:scale-[1.03] hover:shadow-navy-glow sm:flex-none animate-pulse-soft"
          >
            Create free account
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full border-2 border-lic-navy bg-white/80 px-7 text-base font-semibold text-lic-navy backdrop-blur-sm transition-all duration-200 ease-material hover:bg-lic-ice sm:flex-none"
          >
            See how it works
          </a>
        </motion.div>

        <motion.ul
          variants={{
            hidden: { opacity: 0, y: 16 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.6, ease: EASE, delay: 0.65 },
            },
          }}
          className="mt-10 flex flex-wrap justify-center gap-2 lg:justify-start"
        >
          {TRUST_CHIPS.map((c) => (
            <li
              key={c.label}
              className="inline-flex items-center gap-2 rounded-full border border-black/6 bg-white/90 px-3 py-2 text-xs font-medium text-lic-charcoal shadow-soft sm:text-sm"
            >
              <span aria-hidden>{c.icon}</span>
              {c.label}
            </li>
          ))}
        </motion.ul>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.35 }}
        className="relative mx-auto w-full max-w-lg lg:max-w-none"
      >
        <div className="animate-float">
          <LaptopMock />
        </div>
      </motion.div>
    </div>

    <WaveDivider fill="#EEF3FC" />
  </section>
);

function LaptopMock() {
  return (
    <div className="rounded-card-lg border border-black/8 bg-white p-3 shadow-card">
      <div className="flex items-center gap-2 border-b border-black/6 px-2 pb-3">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-lic-navy" />
        <span className="ml-2 font-mono text-[10px] text-lic-body/70">
          app.licpro.academy
        </span>
      </div>
      <div className="mt-3 grid gap-3 rounded-card bg-lic-offwhite p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-lg font-bold text-lic-charcoal">
              Welcome back, learner
            </p>
            <p className="text-sm text-lic-body">
              You’re ahead of 82% of this week’s cohort
            </p>
          </div>
          <span className="rounded-full bg-lic-navy/15 px-3 py-1 text-xs font-semibold text-lic-navy">
            Score 86
          </span>
        </div>
        <div className="h-28 rounded-card bg-white px-3 py-2 shadow-soft">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-lic-body">
            Performance
          </p>
          <div className="mt-2 flex h-16 items-end gap-1">
            {[40, 55, 48, 70, 62, 88, 92].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-linear-to-t from-lic-navy to-lic-azure"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-card border border-lic-navy/25 bg-white p-3 shadow-soft">
            <p className="text-xs text-lic-body">Next mock</p>
            <p className="mt-1 font-semibold text-lic-charcoal">IRDA — Timed</p>
            <p className="text-xs text-lic-navy">In 2 days</p>
          </div>
          <div className="rounded-card border border-black/6 bg-white p-3 shadow-soft">
            <p className="text-xs text-lic-body">Streak</p>
            <p className="mt-1 font-semibold text-lic-charcoal">7 days</p>
            <p className="text-xs text-lic-body">Keep going</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroSection;
