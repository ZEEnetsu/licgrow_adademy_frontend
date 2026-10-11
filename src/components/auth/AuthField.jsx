import { useState } from 'react';

import Icon from '../ui/Icon.jsx';

/**
 * Text input for the sign-in and registration forms.
 *
 * Purely presentational: it spreads `...inputProps` onto the <input>, so the
 * pages keep their own `id` / `value` / `onChange` handling unchanged.
 * Password fields get a show/hide toggle.
 */
export default function AuthField({ id, label, issue, hint, type = 'text', ...inputProps }) {
  const [reveal, setReveal] = useState(false);
  const isPassword = type === 'password';
  const msgId = `${id}-msg`;
  const message = issue || hint;

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-ink">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={isPassword && reveal ? 'text' : type}
          aria-invalid={issue ? true : undefined}
          aria-describedby={message ? msgId : undefined}
          className={`h-12 w-full rounded-2xl short:h-11 bg-cream px-4 text-[16px] text-ink ring-1 transition-[box-shadow,background-color] duration-200 placeholder:text-plum/40 focus:bg-white focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${
            issue ? 'ring-ember-deep/60 focus:ring-ember-deep' : 'ring-ink/10 focus:ring-ember'
          } ${isPassword ? 'pr-12' : ''}`}
          {...inputProps}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setReveal((r) => !r)}
            aria-pressed={reveal}
            aria-label={reveal ? 'Hide password' : 'Show password'}
            className="absolute inset-y-0 right-1.5 my-auto grid h-10 w-10 place-items-center rounded-xl text-plum/60 transition-colors hover:bg-sand hover:text-ink focus-visible:outline-2 focus-visible:outline-ember"
          >
            <Icon name={reveal ? 'eyeOff' : 'eye'} className="h-5 w-5" />
          </button>
        ) : null}
      </div>
      {message ? (
        <p
          id={msgId}
          className={`mt-1.5 flex items-start gap-1.5 text-xs leading-snug ${
            issue ? 'font-semibold text-ember-deep' : 'text-plum/60'
          }`}
        >
          {issue ? <Icon name="info" className="mt-px h-3.5 w-3.5 shrink-0" strokeWidth={2.2} /> : null}
          {message}
        </p>
      ) : null}
    </div>
  );
}

/** Server / lockout notices shown above the submit button. */
export function AuthNotice({ tone = 'error', icon = 'info', children }) {
  const look =
    tone === 'error'
      ? 'bg-peach-soft text-ember-deep ring-ember/30'
      : tone === 'warn'
        ? 'bg-sand text-ink ring-ink/10'
        : 'bg-mint-soft text-sage-deep ring-mint';
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`flex items-start gap-2.5 rounded-2xl px-4 py-3 text-[13px] font-semibold ring-1 ${look}`}>
      <Icon name={icon} className="mt-px h-4 w-4 shrink-0" strokeWidth={2.2} />
      <span>{children}</span>
    </div>
  );
}

/** Large ember submit button with a spinner while busy. */
export function AuthSubmit({ busy, disabled, children }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      aria-busy={busy || undefined}
      className="group/btn inline-flex h-14 w-full items-center short:h-12 justify-center gap-2.5 rounded-2xl bg-ember text-[1.1875rem] font-bold text-white shadow-ember transition-[background-color,transform] duration-300 ease-out-expo hover:bg-ember-deep active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
    >
      {busy ? (
        <span aria-hidden className="h-5 w-5 animate-spin rounded-full border-2 border-white border-r-transparent" />
      ) : null}
      <span>{children}</span>
      {!busy ? (
        <Icon name="arrowRight" className="h-5 w-5 transition-transform duration-300 group-hover/btn:translate-x-0.5" strokeWidth={2.2} />
      ) : null}
    </button>
  );
}
