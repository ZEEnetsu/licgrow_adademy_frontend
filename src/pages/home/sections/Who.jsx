import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { useLang } from '../../../i18n/index.js';
import { WHO } from '../content.js';
import SplitText from '../../../components/motion/SplitText.jsx';
import Reveal from '../../../components/motion/Reveal.jsx';
import { EXPO } from '../../../components/motion/primitives.js';
import { Eyebrow, TextLink } from '../../../components/ui/atoms.jsx';
import { TONE_BG, TONE_ICON } from '../../../components/ui/tones.js';
import Icon from '../../../components/ui/Icon.jsx';
import LineArt from '../art/LineArt.jsx';
import { ART } from '../art/illustrations.js';

/**
 * Chapter 6 — who it is for.
 *
 * Large screens: a horizontal accordion. The focused or hovered persona
 * widens and opens; the others stay as slim labelled spines. Each spine is a
 * real button, so it works from the keyboard. Below lg the five stack open.
 *
 * Each persona has a line drawing. It keeps a fixed width, so a slim spine
 * shows only its left slice and widening the card uncovers the rest.
 */
export default function Who() {
  const { t } = useLang();
  const [active, setActive] = useState(0);

  return (
    <section id="who" className="bg-cream py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div>
            <Reveal y={12}>
              <Eyebrow tone="mint">{t(WHO.eyebrow)}</Eyebrow>
            </Reveal>
            <SplitText
              as="h2"
              text={t(WHO.title)}
              className="h-display mt-6 text-[clamp(2.25rem,4.6vw,4rem)] font-extrabold text-ink"
            />
          </div>
          <Reveal as="p" delay={0.15} className="text-lg leading-relaxed text-plum lg:pb-2">
            {t(WHO.lede)}
          </Reveal>
        </div>

        {/* lg+: horizontal accordion */}
        <Reveal className="mt-14 hidden h-[30rem] gap-3 lg:flex">
          {WHO.people.map((p, i) => {
            const on = i === active;
            return (
              <div
                key={p.title.en}
                onMouseEnter={() => setActive(i)}
                className={`relative overflow-hidden rounded-panel ring-1 ring-ink/6 transition-[flex-grow] duration-700 ease-out-expo ${TONE_BG[p.tone]}`}
                style={{ flexGrow: on ? 3.4 : 1, flexBasis: 0 }}
              >
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  aria-expanded={on}
                  className="absolute inset-0 z-0 h-full w-full cursor-pointer text-left focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-ember"
                >
                  <span className="sr-only">{t(p.title)}</span>
                </button>

                <div
                  aria-hidden
                  className={`pointer-events-none absolute top-20 left-6 w-[15rem] transition-opacity duration-500 ease-out-expo ${on ? 'opacity-100' : 'opacity-55'}`}
                >
                  <LineArt art={ART[p.art]} tone={p.tone} className="w-full" />
                </div>

                <div className="pointer-events-none relative flex h-full flex-col p-6">
                  <div className="flex items-start justify-between">
                    <span className={`grid h-12 w-12 place-items-center rounded-2xl ${TONE_ICON[p.tone]}`}>
                      <Icon name={p.icon} className="h-6 w-6" />
                    </span>
                    <span className="font-display text-sm font-bold tabular-nums text-ink/35">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <AnimatePresence mode="popLayout" initial={false}>
                    {on ? (
                      <motion.div
                        key="open"
                        className="pointer-events-auto relative z-10 mt-auto max-w-md"
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.7, ease: EXPO } }}
                        exit={{ opacity: 0, transition: { duration: 0.15 } }}
                      >
                        <h3 className="h-display text-3xl font-bold text-ink">{t(p.title)}</h3>
                        <p className="mt-3 text-[17px] leading-relaxed text-plum">{t(p.body)}</p>
                        <TextLink to={p.link.to} className="mt-5">
                          {t(p.link.label)}
                        </TextLink>
                      </motion.div>
                    ) : (
                      <motion.p
                        key="spine"
                        aria-hidden
                        className="mt-auto font-display text-lg font-bold text-ink [writing-mode:vertical-rl] rotate-180 whitespace-nowrap"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, transition: { delay: 0.25 } }}
                        exit={{ opacity: 0, transition: { duration: 0.1 } }}
                      >
                        {t(p.title)}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </Reveal>

        {/* < lg: stacked */}
        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:hidden">
          {WHO.people.map((p, i) => (
            <Reveal key={p.title.en} delay={(i % 2) * 0.08} className={`rounded-panel p-6 ring-1 ring-ink/6 ${TONE_BG[p.tone]}`}>
              <span className={`grid h-11 w-11 place-items-center rounded-2xl ${TONE_ICON[p.tone]}`}>
                <Icon name={p.icon} className="h-5 w-5" />
              </span>
              <LineArt art={ART[p.art]} tone={p.tone} className="mt-4 h-28 w-auto max-w-full" />
              <h3 className="h-display mt-3 text-2xl font-bold text-ink">{t(p.title)}</h3>
              <p className="mt-2 leading-relaxed text-plum">{t(p.body)}</p>
              <TextLink to={p.link.to} className="mt-4">
                {t(p.link.label)}
              </TextLink>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
