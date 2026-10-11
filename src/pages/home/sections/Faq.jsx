import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { Nodes } from '../../../components/content/ContentNode.jsx';
import RichText from '../../../components/content/RichText.jsx';
import faq from '../../../content/generated/faq.json';
import { useLang } from '../../../i18n/index.js';
import { COMMON, FAQ, PHONE } from '../content.js';
import SplitText from '../../../components/motion/SplitText.jsx';
import Reveal from '../../../components/motion/Reveal.jsx';
import { EXPO } from '../../../components/motion/primitives.js';
import { Button, Eyebrow } from '../../../components/ui/atoms.jsx';
import Icon from '../../../components/ui/Icon.jsx';

/**
 * The FAQ groups, read straight from the generated content in document
 * order: every <h3> opens a group, every <details> after it is a question.
 * Answers render through the shared content renderer, so their citations,
 * "*Conditions apply" notes and cross-page links stay exactly as authored.
 */
function collectGroups(root) {
  const groups = [];
  const walk = (n) => {
    if (Array.isArray(n)) return n.forEach(walk);
    if (!n || typeof n !== 'object') return;
    if (n.t === 'h3') groups.push({ title: n.text, items: [] });
    else if (n.t === 'details' && groups.length) groups[groups.length - 1].items.push(n);
    else if (n.children) walk(n.children);
  };
  walk(root.children);
  return groups.filter((g) => g.items.length);
}

const GROUPS = collectGroups(faq);

function Item({ item, number, open, onToggle }) {
  const id = `faq-${number}`;
  return (
    <div
      className={`rounded-[20px] bg-white ring-1 transition-shadow duration-300 ${
        open ? 'shadow-card ring-ink/10' : 'ring-ink/6 hover:ring-ink/12'
      }`}
    >
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={onToggle}
          className="flex w-full items-center gap-4 px-5 py-5 text-left sm:px-7"
        >
          <span className="font-display text-xs font-bold tabular-nums text-plum/50">
            {String(number).padStart(2, '0')}
          </span>
          <span className="flex-1 text-[16px] font-semibold text-ink sm:text-[17px]">
            <RichText value={item.summary} />
          </span>
          <span
            className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition-[background-color,transform] duration-500 ease-out-expo ${
              open ? 'rotate-45 bg-ember text-white' : 'bg-sand text-ink'
            }`}
          >
            <Icon name="plus" className="h-4 w-4" strokeWidth={2.2} />
          </span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={id}
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: EXPO }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-6 sm:pl-[4.25rem] sm:pr-16 [&>:first-child]:mt-0 [&_a:not([class])]:font-semibold [&_a:not([class])]:text-ember-deep [&_a:not([class])]:underline [&_a:not([class])]:decoration-peach [&_a:not([class])]:decoration-2 [&_a:not([class])]:underline-offset-4 hover:[&_a:not([class])]:decoration-ember">
              <Nodes nodes={item.children} />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/** Chapter 12 — every question from the reference, grouped into tabs. */
export default function Faq() {
  const { t } = useLang();
  const [group, setGroup] = useState(0);
  const [open, setOpen] = useState(0);

  const offset = GROUPS.slice(0, group).reduce((n, g) => n + g.items.length, 0);

  return (
    <section id="faq" className="bg-sand py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <Reveal y={12}>
            <Eyebrow tone="mint">{t(FAQ.eyebrow)}</Eyebrow>
          </Reveal>
          <SplitText
            as="h2"
            text={t(FAQ.title)}
            className="h-display mt-6 text-[clamp(2.25rem,4.6vw,3.75rem)] font-extrabold text-ink"
          />
          <Reveal as="p" delay={0.15} className="mx-auto mt-5 max-w-xl text-lg text-plum">
            {t(FAQ.lede)}
          </Reveal>
        </div>

        <Reveal className="mt-12 flex justify-center">
          <div
            role="tablist"
            aria-label={t(FAQ.eyebrow)}
            className="flex max-w-full gap-1 overflow-x-auto rounded-full bg-white p-1 shadow-soft ring-1 ring-ink/6 [scrollbar-width:none]"
          >
            {GROUPS.map((g, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === group}
                onClick={() => {
                  setGroup(i);
                  setOpen(0);
                }}
                className="relative shrink-0 rounded-full px-4 py-2 text-sm font-semibold"
              >
                {i === group ? (
                  <motion.span
                    layoutId="faq-tab"
                    className="absolute inset-0 rounded-full bg-ink"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                ) : null}
                <span className={`relative transition-colors ${i === group ? 'text-cream' : 'text-plum hover:text-ink'}`}>
                  {t(g.title)}
                </span>
              </button>
            ))}
          </div>
        </Reveal>

        <AnimatePresence mode="wait">
          <motion.div
            key={group}
            role="tabpanel"
            className="mt-8 space-y-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: EXPO }}
          >
            {GROUPS[group].items.map((item, i) => (
              <Item
                key={i}
                item={item}
                number={offset + i + 1}
                open={open === i}
                onToggle={() => setOpen(open === i ? -1 : i)}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        <Reveal className="mt-12 flex flex-col items-center gap-5 text-center">
          <p className="text-lg font-semibold text-ink">{t(FAQ.still)}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button href={PHONE.tel} variant="ink" iconLeft="phone">
              {t(COMMON.callNow)}: {PHONE.display}
            </Button>
            <Button to="/apply" variant="ghost" icon="arrowRight">
              {t(COMMON.bookOrientation)}
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
