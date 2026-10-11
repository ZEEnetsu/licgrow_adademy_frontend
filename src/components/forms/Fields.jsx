import { AnimatePresence, motion } from 'framer-motion';

import { useLang } from '../../i18n/index.js';
import { EXPO } from '../motion/primitives.js';
import Icon from '../ui/Icon.jsx';

/*
 * Form controls for the public pages. Every control is a real native input
 * (visually restyled), labelled, and wired to its error with aria-invalid /
 * aria-describedby so screen readers announce what went wrong.
 */

const INPUT =
  'w-full rounded-2xl px-4 text-[16px] ring-1 transition-[box-shadow,background-color] duration-200 focus:outline-none focus:ring-2';

function ErrorText({ id, error, dark = false }) {
  const { t } = useLang();
  return (
    <AnimatePresence initial={false}>
      {error ? (
        <motion.p
          id={id}
          initial={{ opacity: 0, y: -4, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25 }}
          className={`flex items-center gap-1.5 overflow-hidden pt-2 text-sm font-semibold ${dark ? 'text-peach' : 'text-ember-deep'}`}
        >
          <Icon name="info" className="h-4 w-4 shrink-0" strokeWidth={2.2} />
          {t(error)}
        </motion.p>
      ) : null}
    </AnimatePresence>
  );
}

export function TextField({
  id,
  label,
  required = false,
  value,
  onChange,
  onBlur,
  error,
  type = 'text',
  inputMode,
  autoComplete,
  placeholder,
  prefix,
  multiline = false,
  rows = 4,
  dark = false,
}) {
  const { t } = useLang();
  const errId = `${id}-error`;
  const ring = error
    ? dark
      ? 'ring-peach/70 focus:ring-peach'
      : 'ring-ember-deep/70 focus:ring-ember-deep'
    : dark
      ? 'ring-white/15 focus:ring-ember'
      : 'ring-ink/10 focus:ring-ember';
  const surface = dark
    ? 'bg-white/[0.07] text-cream placeholder:text-cream/40 focus:bg-white/[0.1]'
    : 'bg-cream text-ink placeholder:text-plum/40 focus:bg-white';
  const shared = {
    id,
    value,
    onChange: (e) => onChange(e.target.value),
    onBlur,
    placeholder: placeholder ? t(placeholder) : undefined,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? errId : undefined,
    'aria-required': required || undefined,
  };
  return (
    <div>
      <label htmlFor={id} className={`mb-2 block text-sm font-semibold ${dark ? 'text-cream' : 'text-ink'}`}>
        {t(label)}
        {required ? <span className={`ml-0.5 ${dark ? 'text-peach' : 'text-ember-deep'}`}>*</span> : null}
      </label>
      {multiline ? (
        <textarea {...shared} rows={rows} className={`${INPUT} ${surface} ${ring} resize-y py-3.5`} />
      ) : (
        <div className="relative">
          {prefix ? (
            <span className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[15px] font-semibold ${dark ? 'text-cream/50' : 'text-plum/60'}`}>
              {prefix}
            </span>
          ) : null}
          <input
            {...shared}
            type={type}
            inputMode={inputMode}
            autoComplete={autoComplete}
            className={`${INPUT} ${surface} ${ring} h-14 ${prefix ? 'pl-14' : ''}`}
          />
        </div>
      )}
      <ErrorText id={errId} error={error} dark={dark} />
    </div>
  );
}

/** Multi-select chips (checkboxes). */
export function ChoiceChips({ legend, options, value, onChange }) {
  const { t } = useLang();
  const toggle = (v) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-semibold text-ink">{t(legend)}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = value.includes(o.value);
          return (
            <label
              key={o.value}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold ring-1 transition-colors duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ember ${
                on ? 'bg-ink text-cream ring-ink' : 'bg-white text-ink ring-ink/12 hover:ring-ink/30'
              }`}
            >
              <input type="checkbox" className="sr-only" checked={on} onChange={() => toggle(o.value)} />
              <span
                className={`grid h-4 w-4 place-items-center rounded-full transition-colors ${on ? 'bg-ember text-white' : 'ring-1 ring-ink/25'}`}
              >
                {on ? <Icon name="check" className="h-2.5 w-2.5" strokeWidth={3.5} /> : null}
              </span>
              {t(o.label)}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Single choice drawn as cards (radios). */
export function RadioCards({ legend, name, options, value, onChange }) {
  const { t } = useLang();
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-semibold text-ink">{t(legend)}</legend>
      <div className="grid gap-2.5 sm:grid-cols-3">
        {options.map((o) => {
          const on = value === o.value;
          return (
            <label
              key={o.value}
              className={`relative flex cursor-pointer items-start gap-3 rounded-2xl p-4 ring-1 transition-[box-shadow,background-color] duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ember ${
                on ? 'bg-peach-soft ring-2 ring-ember' : 'bg-white ring-ink/10 hover:ring-ink/25'
              }`}
            >
              <input type="radio" name={name} className="sr-only" checked={on} onChange={() => onChange(o.value)} />
              <span
                className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ring-1 transition-colors ${
                  on ? 'bg-ember ring-ember' : 'bg-white ring-ink/25'
                }`}
              >
                {on ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
              </span>
              <span className="min-w-0">
                {o.icon ? <Icon name={o.icon} className="mb-2 h-5 w-5 text-ember-deep" /> : null}
                <span className="block text-sm font-semibold leading-snug text-ink">{t(o.label)}</span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function Consent({ id, checked, onChange, error, children }) {
  const errId = `${id}-error`;
  return (
    <div>
      <label
        htmlFor={id}
        className={`flex cursor-pointer items-start gap-3 rounded-2xl p-4 ring-1 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ember ${
          error ? 'bg-peach-soft/50 ring-ember-deep/50' : 'bg-cream ring-ink/[0.07]'
        }`}
      >
        <input
          id={id}
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errId : undefined}
          aria-required
        />
        <span
          className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md ring-1 transition-colors ${
            checked ? 'bg-ember text-white ring-ember' : 'bg-white ring-ink/25'
          }`}
        >
          {checked ? <Icon name="check" className="h-3.5 w-3.5" strokeWidth={3} /> : null}
        </span>
        <span className="text-sm leading-relaxed text-ink">
          {children}
          <span className="ml-0.5 text-ember-deep">*</span>
        </span>
      </label>
      <ErrorText id={errId} error={error} />
    </div>
  );
}

export function SubmitButton({ sending, children, variant = 'ember', className = '' }) {
  const look =
    variant === 'ember'
      ? 'h-14 px-8 text-[1.1875rem] font-bold bg-ember text-white shadow-ember hover:bg-ember-deep'
      : 'h-12 px-6 text-[15px] font-semibold bg-cream text-ink hover:bg-white';
  return (
    <button
      type="submit"
      disabled={sending}
      aria-busy={sending || undefined}
      className={`group/btn inline-flex items-center justify-center gap-2.5 rounded-full transition-[background-color,transform] duration-300 ease-out-expo active:scale-[0.98] disabled:cursor-wait disabled:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember ${look} ${className}`}
    >
      {sending ? (
        <motion.span
          aria-hidden
          className="h-5 w-5 rounded-full border-2 border-current border-r-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        />
      ) : null}
      <span>{children}</span>
      {!sending ? (
        <Icon name="arrowRight" className="h-[1.05em] w-[1.05em] transition-transform duration-300 group-hover/btn:translate-x-0.5" strokeWidth={2} />
      ) : null}
    </button>
  );
}

/** Thank-you state: a check that draws itself, the message, and the draft note. */
export function SuccessPanel({ title, note, onReset, resetLabel, dark = false }) {
  const { t } = useLang();
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: EXPO }}
      role="status"
      className="flex flex-col items-center py-8 text-center"
    >
      <span className="grid h-20 w-20 place-items-center rounded-full bg-sage/15">
        <svg viewBox="0 0 52 52" className="h-12 w-12 text-sage" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <motion.circle cx="26" cy="26" r="23" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7, ease: EXPO }} />
          <motion.path d="M15 27l7 7 15-16" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5, duration: 0.5, ease: EXPO }} />
        </svg>
      </span>
      <p className={`h-display mt-6 max-w-md text-2xl font-extrabold sm:text-3xl ${dark ? 'text-cream' : 'text-ink'}`}>{t(title)}</p>
      {note ? <p className={`mt-3 text-sm ${dark ? 'text-cream/60' : 'text-plum/70'}`}>{t(note)}</p> : null}
      {onReset ? (
        <button
          type="button"
          onClick={onReset}
          className={`mt-6 rounded-full px-5 py-2.5 text-sm font-semibold ring-1 transition-colors ${
            dark ? 'text-cream ring-white/20 hover:bg-white/10' : 'text-ink ring-ink/15 hover:bg-sand'
          }`}
        >
          {t(resetLabel)}
        </button>
      ) : null}
    </motion.div>
  );
}
