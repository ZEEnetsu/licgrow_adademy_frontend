import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { useLang } from '../../i18n/index.js';
import { EXPO, inr } from '../motion/primitives.js';
import Icon from '../ui/Icon.jsx';
import ContentNode, { Nodes } from './ContentNode.jsx';
import RichText from './RichText.jsx';
import { ToneContext } from './tone.js';

/*
 * The reference build's small interactive tools, ported. Their behaviour is
 * lifted from the reference's own script block (src/pages/site/index.html):
 *
 *   bs40-calc   fresh premium = expected monthly income × 3
 *   gz10        four yes/no questions; the call to action appears only when
 *               every answer is the first ("yes") option
 *   generic     reflection prompts and text fields — answers stay on screen
 *
 * Nothing here is stored or sent anywhere, exactly as the reference promises.
 */

const has = (node, c) => (node.cls || []).includes(c);
const isField = (n) => n?.t === 'input' || n?.t === 'textarea';

const FIELD =
  'w-full rounded-xl bg-cream px-4 py-3 text-[15px] text-ink ring-1 ring-ink/10 transition-shadow placeholder:text-plum/40 focus:outline-none focus:ring-2 focus:ring-ember';

function Field({ label, input, value, onChange }) {
  const { t } = useLang();
  const auto = useId();
  const id = input.id || auto;
  const common = {
    id,
    className: FIELD,
    value: value ?? '',
    onChange: (e) => onChange(id, e.target.value),
    placeholder: input.placeholder ? t(input.placeholder) : undefined,
  };
  return (
    <div className="mt-4 first:mt-0">
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-ink">
        <RichText value={label.text} />
      </label>
      {input.t === 'textarea' ? (
        <textarea {...common} rows={Number(input.rows) || 2} className={`${FIELD} resize-y`} />
      ) : (
        <input
          {...common}
          type={input.type || 'text'}
          inputMode={input.inputmode}
          min={input.min}
          step={input.step}
          autoComplete="off"
        />
      )}
    </div>
  );
}

/** One fieldset of radio options, drawn as a segmented pill row. */
function RadioGroup({ name, question, options, value, onChange }) {
  return (
    <fieldset className="mt-6 first:mt-0">
      <legend className="mb-3 text-[15px] font-semibold leading-snug text-ink">
        <RichText value={question?.text} />
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o, i) => {
          const on = value === i;
          return (
            <label
              key={i}
              className={`relative cursor-pointer rounded-full px-4 py-2 text-sm font-semibold ring-1 transition-colors duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ember ${
                on ? 'bg-ink text-cream ring-ink' : 'bg-white text-ink ring-ink/12 hover:ring-ink/30'
              }`}
            >
              <input
                type="radio"
                name={name}
                className="sr-only"
                checked={on}
                onChange={() => onChange(i)}
              />
              <RichText value={o.text} />
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function Calc({ node }) {
  const { t } = useLang();
  const formId = useId();
  const [values, setValues] = useState({});
  const [answers, setAnswers] = useState({});

  const setValue = (id, v) => setValues((s) => ({ ...s, [id]: v }));
  const kids = node.children || [];

  // bs40-calc: the only rule the source table shows is income × 3.
  const income = Math.floor(Number(values['bs40-in']));
  const premium = income > 0 ? `₹${inr(income * 3)}` : '—';

  // gz10: count the radio fieldsets so "all yes" means all of them.
  const radioSets = kids.filter((c) => c.t === 'fieldset' && !(c.children || []).some(isField));
  const allFirst =
    radioSets.length > 0 && radioSets.every((_, i) => answers[i] === 0);

  const out = [];
  let radioIndex = 0;
  for (let i = 0; i < kids.length; i += 1) {
    const c = kids[i];

    if (c.t === 'label' && isField(kids[i + 1])) {
      out.push(<Field key={i} label={c} input={kids[i + 1]} value={values[kids[i + 1].id]} onChange={setValue} />);
      i += 1;
      continue;
    }

    if (c.t === 'fieldset') {
      const parts = c.children || [];
      if (parts.some(isField)) {
        // A group of text prompts with a legend.
        const [legend, ...rest] = parts;
        const fields = [];
        for (let j = 0; j < rest.length; j += 1) {
          if (rest[j].t === 'label' && isField(rest[j + 1])) {
            fields.push(<Field key={j} label={rest[j]} input={rest[j + 1]} value={values[rest[j + 1].id]} onChange={setValue} />);
            j += 1;
          }
        }
        out.push(
          <fieldset key={i} className="mt-7 first:mt-0">
            <legend className="font-display text-lg font-bold text-ink">
              <RichText value={legend?.text} />
            </legend>
            <div className="mt-3">{fields}</div>
          </fieldset>,
        );
      } else {
        const idx = radioIndex;
        radioIndex += 1;
        const [question, ...options] = parts;
        out.push(
          <RadioGroup
            key={i}
            name={`${formId}-${idx}`}
            question={question}
            options={options}
            value={answers[idx]}
            onChange={(v) => setAnswers((s) => ({ ...s, [idx]: v }))}
          />,
        );
      }
      continue;
    }

    // bs40-calc's result line: "…(income × 3): —" → the live figure.
    if (node.id === 'bs40-calc' && c.t === 'p') {
      const text = t(c.text).replace(/\s*—\s*$/, '');
      out.push(
        <div key={i} className="mt-5 flex flex-wrap items-end justify-between gap-3 rounded-2xl bg-ink px-5 py-4 text-cream">
          <p className="max-w-xs text-sm text-cream/75">{text}</p>
          <output htmlFor="bs40-in" aria-live="polite" className="h-display text-3xl font-extrabold text-peach">
            {premium}
          </output>
        </div>,
      );
      continue;
    }

    // gz10's result panel: hidden until every answer is "yes".
    if (c.t === 'box' && JSON.stringify(c).includes('gz-result')) {
      const result = (c.children || []).find((x) => has(x, 'gz-result')) || c;
      out.push(
        <div key={i} aria-live="polite">
          <AnimatePresence>
            {allFirst ? (
              <motion.div
                initial={{ opacity: 0, y: 16, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.6, ease: EXPO }}
                className="overflow-hidden"
              >
                <ToneContext.Provider value="dark">
                  <div className="mesh-navy-deep tone-dark mt-7 rounded-2xl p-6 [&>:first-child]:mt-0">
                    <Nodes nodes={result.children} />
                  </div>
                </ToneContext.Provider>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>,
      );
      continue;
    }

    if (c.t === 'button') continue;
    out.push(<ContentNode key={i} node={c} />);
  }

  return (
    <form
      className="relative my-8 rounded-[26px] bg-white p-6 shadow-card ring-1 ring-ink/8 sm:p-8 [&>p:first-of-type]:mt-0"
      onSubmit={(e) => e.preventDefault()}
      noValidate
      data-src={node.src}
    >
      <span className="caps mb-5 inline-flex items-center gap-2 rounded-full bg-mint-soft px-3 py-1.5 text-[10px] font-bold text-sage-deep ring-1 ring-inset ring-mint">
        <Icon name="sparkle" className="h-3.5 w-3.5" />
        {t({ hi: 'आज़माइए', en: 'Try it' })}
      </span>
      <ToneContext.Provider value="light">{out}</ToneContext.Provider>
    </form>
  );
}

/** Documents checklist with a live "n of m ready" bar. Ticks stay on screen only. */
export function DocCheck({ node }) {
  const { t } = useLang();
  const items = node.items || [];
  const [done, setDone] = useState(() => new Set());
  const n = done.size;

  const toggle = (i) =>
    setDone((s) => {
      const next = new Set(s);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <div className="my-7 rounded-[26px] bg-white p-5 shadow-card ring-1 ring-ink/8 sm:p-7" data-src={node.src}>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-ink" aria-live="polite">
          {t({ hi: `${items.length} में से ${n} तैयार`, en: `${n} of ${items.length} ready` })}
        </p>
        {n === items.length ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sage px-3 py-1 text-xs font-bold text-white">
            <Icon name="check" className="h-3.5 w-3.5" strokeWidth={3} />
            {t({ hi: 'सब तैयार', en: 'All set' })}
          </span>
        ) : null}
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-sand">
        <motion.span
          className="block h-full origin-left rounded-full bg-ember"
          animate={{ scaleX: items.length ? n / items.length : 0 }}
          transition={{ duration: 0.6, ease: EXPO }}
        />
      </div>
      <ul className="mt-5 space-y-2">
        {items.map((it, i) => {
          const on = done.has(i);
          return (
            <li key={i}>
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-2xl px-4 py-3 text-[15px] leading-relaxed ring-1 transition-colors duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ember ${
                  on ? 'bg-mint-soft text-ink ring-mint' : 'bg-cream text-plum ring-ink/[0.06] hover:ring-ink/15'
                }`}
              >
                <input type="checkbox" className="sr-only" checked={on} onChange={() => toggle(i)} />
                <span
                  className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md ring-1 transition-colors ${
                    on ? 'bg-sage text-white ring-sage' : 'bg-white ring-ink/20'
                  }`}
                >
                  {on ? <Icon name="check" className="h-3.5 w-3.5" strokeWidth={3} /> : null}
                </span>
                <span className={on ? 'line-through decoration-sage/60' : ''}>
                  <RichText value={it.text} />
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
