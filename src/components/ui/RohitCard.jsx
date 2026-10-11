import { CLOSING, EMAIL, PHONE, PHONE_2 } from '../../pages/home/content.js';
import { useLang } from '../../i18n/index.js';
import Reveal from '../motion/Reveal.jsx';
import Icon from './Icon.jsx';

/**
 * Rohit's contact card — the reference screenshot's "From the makers of"
 * strip. Used under the closing panel of every public page.
 */
export default function RohitCard({ className = '' }) {
  const { t } = useLang();
  const c = CLOSING.card;
  return (
    <Reveal className={`relative mx-auto max-w-5xl rounded-[24px] bg-white p-6 shadow-lift sm:p-8 ${className}`}>
      <div className="flex flex-col gap-6 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-peach font-display text-xl font-extrabold text-ink">
            RL
          </span>
          <div>
            <p className="caps text-[10px] font-bold text-sage-deep">{t(c.kicker)}</p>
            <p className="h-display text-2xl font-bold text-ink">{t(c.name)}</p>
          </div>
        </div>
        <div className="min-w-0 flex-1 space-y-1 text-sm text-plum md:border-l md:border-ink/8 md:pl-6">
          <p>{t(c.creds)}</p>
          <p className="inline-flex items-start gap-1.5">
            <Icon name="pin" className="mt-0.5 h-4 w-4 shrink-0 text-ember" />
            {t(c.area)}
          </p>
          <p className="font-semibold text-ink">{t(c.promise)}</p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 text-sm font-semibold">
          <a href={PHONE.tel} className="inline-flex items-center gap-2 text-ink hover:text-ember-deep">
            <Icon name="phone" className="h-4 w-4 text-ember" /> {PHONE.display}
          </a>
          <a href={PHONE_2.tel} className="inline-flex items-center gap-2 text-ink hover:text-ember-deep">
            <Icon name="phone" className="h-4 w-4 text-ember" /> {PHONE_2.display}
          </a>
          <a href={`mailto:${EMAIL}`} className="inline-flex items-center gap-2 text-ink hover:text-ember-deep">
            <Icon name="mail" className="h-4 w-4 text-ember" /> {EMAIL}
          </a>
        </div>
      </div>
    </Reveal>
  );
}
