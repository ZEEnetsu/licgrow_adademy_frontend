import { LANGS, useLang } from '../i18n/index.js';

const NAMES = { hi: 'हिंदी', en: 'English' };

/**
 * Hindi / English switch.
 *
 * `aria-pressed` on both buttons rather than a single toggle, matching the
 * reference's own `[data-set-lang]` group: a screen reader should be able to
 * hear which of the two is currently on, not just that a control exists.
 */
export default function LangSwitch({ className = '' }) {
  const { lang, setLang } = useLang();
  return (
    <div
      role="group"
      aria-label="भाषा / Language"
      className={`inline-flex rounded-full bg-white/80 p-0.5 ring-1 ring-ink/10 ${className}`}
    >
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-pressed={lang === l}
          onClick={() => setLang(l)}
          className={[
            'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors duration-200 ease-material',
            lang === l ? 'bg-ink text-cream' : 'text-plum hover:text-ink',
          ].join(' ')}
        >
          {NAMES[l]}
        </button>
      ))}
    </div>
  );
}
