import { Link } from 'react-router-dom';

import { useLang } from '../../i18n/index.js';
import ShieldMark from '../ShieldMark.jsx';

/**
 * Logo mark, name and the "By Rohit Lal · Development Officer, LIC" line —
 * the header's brand block, also used on the sign-in panels. `dark` is for
 * ink backgrounds.
 */
export default function Brand({ onClick, dark = false }) {
  const { lang } = useLang();
  const strong = dark ? 'text-cream' : 'text-ink';
  return (
    <Link
      to="/"
      onClick={onClick}
      className="group flex min-w-0 items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-ember"
    >
      <ShieldMark
        className={`h-10! w-10! rounded-full! transition-transform duration-500 ease-out-expo group-hover:rotate-[-8deg] ${
          dark ? 'from-ember! to-ember-deep!' : ''
        }`}
      />
      <span className="min-w-0 leading-tight">
        <span className={`block font-display text-[19px] font-bold tracking-tight ${strong}`}>LICPro Academy</span>
        <span className={`hidden truncate text-[13px] sm:block ${dark ? 'text-cream/60' : 'text-plum/70'}`}>
          {lang === 'hi' ? (
            <>
              <span className={`font-semibold ${strong}`}>रोहित लाल</span> की ओर से · डेवलपमेंट ऑफिसर, LIC
            </>
          ) : (
            <>
              By <span className={`font-semibold ${strong}`}>Rohit Lal</span> · Development Officer, LIC
            </>
          )}
        </span>
      </span>
    </Link>
  );
}
