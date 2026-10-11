import { motion } from 'framer-motion';

import { useLang } from '../../../i18n/index.js';
import { MESSAGE } from '../content.js';
import ScrollWords from '../../../components/motion/ScrollWords.jsx';
import Reveal from '../../../components/motion/Reveal.jsx';
import { Eyebrow } from '../../../components/ui/atoms.jsx';

/** Chapter 11 — Rohit's letter. The opening line is read at scroll speed. */
export default function Message() {
  const { t } = useLang();
  return (
    <section id="message" className="relative bg-white py-24 sm:py-36">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Reveal y={12}>
          <Eyebrow tone="plain">{t(MESSAGE.eyebrow)}</Eyebrow>
        </Reveal>

        <div className="relative mt-8">
          <span
            aria-hidden
            className="pointer-events-none absolute -left-2 -top-16 font-display text-[11rem] font-extrabold leading-none text-peach/50 sm:-left-14"
          >
            “
          </span>
          <ScrollWords
            as="p"
            text={t(MESSAGE.lead)}
            offset={['start 0.9', 'end 0.55']}
            className="h-display relative text-[clamp(2rem,4.6vw,4rem)] font-bold text-ink"
          />
        </div>

        <div className="mt-16 grid gap-x-12 gap-y-6 md:grid-cols-2">
          {MESSAGE.paragraphs.map((p, i) => (
            <Reveal as="p" key={i} delay={(i % 2) * 0.1} className="text-lg leading-relaxed text-plum">
              {t(p)}
            </Reveal>
          ))}
        </div>

        <Reveal as="p" className="mt-12 border-l-4 border-ember pl-6 text-xl font-semibold leading-snug text-ink sm:text-2xl">
          {t(MESSAGE.closing)}
        </Reveal>

        <div className="mt-14 flex flex-wrap items-end gap-x-6 gap-y-2">
          <div className="relative">
            <Reveal as="p" className="font-hand text-6xl leading-none text-ink">
              {t(MESSAGE.signature)}
            </Reveal>
            <svg viewBox="0 0 220 20" className="absolute -bottom-3 left-0 h-4 w-full text-ember" aria-hidden>
              <motion.path
                d="M4 12 C 60 4, 140 18, 216 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.4, ease: [0.65, 0, 0.35, 1] }}
              />
            </svg>
          </div>
          <p className="pb-1 text-sm font-semibold text-plum">{t(MESSAGE.cite)}</p>
        </div>
      </div>
    </section>
  );
}
