import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';

import Reveal from '../motion/Reveal.jsx';
import SplitText from '../motion/SplitText.jsx';
import Brand from '../nav/Brand.jsx';
import { Annotation, Eyebrow } from '../ui/atoms.jsx';
import Icon from '../ui/Icon.jsx';

/**
 * The sign-in / sign-up split layout: an ink story panel on the left, the
 * form on cream on the right. Same structure as before the redesign — only
 * the theme changed — and shared by /login and /register.
 *
 * Below `lg` the panel becomes a compact band above the form, and the
 * feature cards (`cards`) drop out, as they always have on small screens.
 */
export default function AuthShell({ title, headline, highlight, sub, note, cards, wide = false, children }) {
  useEffect(() => {
    if (title) document.title = title;
  }, [title]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="grid min-h-dvh grid-cols-1 gap-2 bg-cream p-2 text-ink antialiased sm:gap-3 sm:p-3 lg:h-dvh lg:grid-cols-2 lg:overflow-hidden">
        <aside className="mesh-navy-deep relative flex flex-col justify-between gap-10 overflow-hidden rounded-[28px] p-6 text-cream sm:p-8 lg:h-full lg:min-h-0 lg:gap-6 lg:p-10 xl:p-12 short:p-8 tiny:p-7">
          <div className="grain-overlay" />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              backgroundImage: 'radial-gradient(rgba(251,248,243,0.07) 1px, transparent 1px)',
              backgroundSize: '18px 18px',
            }}
          />
          <div aria-hidden className="pointer-events-none absolute -bottom-40 -right-28 h-[28rem] w-[28rem] rounded-full bg-ember/25 blur-[120px]" />
          <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-mint/10 blur-[90px]" />

          <div className="relative flex items-center justify-between gap-4">
            <Brand dark />
            <Link
              to="/"
              aria-label="Back home"
              className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-white/[0.06] px-3 py-2 text-sm sm:px-4 font-semibold text-cream ring-1 ring-inset ring-white/15 transition-colors hover:bg-white/[0.12] focus-visible:outline-2 focus-visible:outline-ember"
            >
              <Icon name="arrowRight" className="h-4 w-4 rotate-180 transition-transform duration-300 group-hover:-translate-x-0.5" strokeWidth={2.2} />
              <span className="hidden sm:inline">Back home</span>
            </Link>
          </div>

          <div className="relative">
            <Reveal y={10}>
              <Eyebrow tone="dark">LICPro Academy portal</Eyebrow>
            </Reveal>
            <SplitText
              as="h1"
              onMount
              delay={0.15}
              text={headline}
              highlight={highlight}
              highlightClass="text-peach"
              className="h-display mt-5 text-[clamp(2.4rem,4.6vw,4.4rem)] font-extrabold text-cream short:mt-4 short:text-[clamp(2.2rem,3.8vw,3.6rem)] tiny:text-[clamp(2rem,3.4vw,3rem)]"
            />
            <Reveal delay={0.45} as="p" className="mt-4 max-w-md text-lg leading-relaxed text-cream/70 short:mt-3 short:text-base">
              {sub}
            </Reveal>
            {note ? <Annotation className="ml-1 mt-3 text-peach! [&_svg]:text-ember">{note}</Annotation> : null}
          </div>

          {cards ? <div className="relative hidden gap-3 md:grid md:grid-cols-3">{cards}</div> : <span />}
        </aside>

        <main className="flex items-center justify-center px-2 py-8 sm:px-6 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:py-6 lg:[scrollbar-width:thin]">
          <Reveal y={28} delay={0.15} className={`m-auto w-full ${wide ? 'max-w-lg' : 'max-w-md'}`}>
            {children}
          </Reveal>
        </main>
      </div>
    </MotionConfig>
  );
}
