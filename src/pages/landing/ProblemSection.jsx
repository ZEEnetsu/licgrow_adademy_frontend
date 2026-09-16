import { motion } from 'framer-motion';

import Icon from './components/Icon.jsx';
import { EASE, stagger, fadeUp } from './motion.js';

/**
 * The objection-handling section. It has one job: take the reader's private
 * explanation for why they failed — "maybe I'm just not sharp enough" — and
 * replace it with one they can act on.
 */
const PAINS = [
  {
    icon: 'documents',
    title: 'A folder of PDFs is not a syllabus',
    body:
      'Forwarded notes, a 2019 playlist, three different question banks that disagree with each other. No order, no checkpoints, no honest answer to the only question that matters: am I ready yet?',
  },
  {
    icon: 'mentor',
    title: 'Nobody to ask at ten at night',
    body:
      'One concept refuses to click. There is no one to ask, so you memorise the wording and hope it stays off the paper. It rarely does — and that gap follows you into the hall.',
  },
  {
    icon: 'timer',
    title: 'Exam day is your first real attempt',
    body:
      'You know the material. You have never sat the full paper against a running clock. So the room decides your score before the syllabus gets a say.',
  },
];

const ProblemSection = () => (
  <section
    id="problem"
    className="scroll-mt-24 bg-linear-to-b from-[#EEF3FC] via-white to-white py-20 sm:py-28"
  >
    <motion.div
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      variants={stagger()}
    >
      <motion.div variants={fadeUp} className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-lic-navy">
          Why capable people fail
        </p>
        <h2
          className="mt-4 text-pretty font-semibold tracking-tight text-lic-charcoal"
          style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', lineHeight: 1.16 }}
        >
          You are not short on ability. You are short on a system.
        </h2>
        <p className="mt-5 text-pretty text-base leading-relaxed text-lic-body sm:text-lg">
          The IRDA paper does not measure how clever you are. It measures how you prepared — and
          most candidates prepare with tools that were never built for it.
        </p>
      </motion.div>

      <div className="mt-14 grid gap-6 md:grid-cols-3 lg:gap-7">
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
            className="group relative flex flex-col overflow-hidden rounded-card-lg border border-black/6 bg-white p-7 shadow-soft transition-all duration-250 ease-material hover:-translate-y-1.5 hover:shadow-navy-glow sm:p-8"
          >
            {/*
              Ordinal sits behind the content as texture, not as a label.
              Kept fully inside the padding box — negative offsets put it
              under the card's own `overflow-hidden` and it read as a
              rendering fault rather than a watermark.
            */}
            <span
              className="pointer-events-none absolute right-5 top-3 select-none font-semibold leading-none text-lic-ice transition-colors duration-250 ease-material group-hover:text-lic-frost/70"
              style={{ fontSize: '4.25rem' }}
              aria-hidden
            >
              {i + 1}
            </span>

            <span className="relative grid h-11 w-11 place-items-center rounded-card border border-lic-navy/15 bg-lic-ice text-lic-navy transition-colors duration-250 ease-material group-hover:bg-lic-navy group-hover:text-white">
              <Icon name={p.icon} className="h-5 w-5" />
            </span>

            <h3 className="relative mt-5 text-base font-semibold leading-snug tracking-tight text-lic-charcoal sm:text-lg">
              {p.title}
            </h3>
            <p className="relative mt-3 flex-1 text-sm leading-relaxed text-lic-body">{p.body}</p>
          </motion.article>
        ))}
      </div>

      <motion.div
        variants={fadeUp}
        className="mx-auto mt-14 max-w-3xl rounded-card-lg border border-lic-navy/15 bg-linear-to-br from-lic-offwhite to-lic-ice/60 p-7 text-center sm:p-9"
      >
        <p className="text-pretty text-base font-medium leading-relaxed text-lic-charcoal sm:text-lg">
          Every one of those is a preparation problem, not an intelligence problem.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-lic-body sm:text-base">
          Preparation problems have solutions. That is the entire reason this platform exists.
        </p>
      </motion.div>
    </motion.div>
  </section>
);

export default ProblemSection;
