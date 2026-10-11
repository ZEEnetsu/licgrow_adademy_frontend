import { useLang } from '../../../i18n/index.js';
import { CLOSING, COMMON, PHONE } from '../content.js';
import SplitText from '../../../components/motion/SplitText.jsx';
import Reveal from '../../../components/motion/Reveal.jsx';
import { Button, Eyebrow } from '../../../components/ui/atoms.jsx';
import RohitCard from '../../../components/ui/RohitCard.jsx';

/**
 * Chapter 13 — the ask. An ink panel with an ember glow, then Rohit's card in
 * the style of the reference's "From the makers of" strip.
 */
export default function Closing() {
  const { t } = useLang();
  return (
    <section id="talk" className="bg-cream px-4 pb-24 pt-24 sm:px-6 sm:pt-32 lg:px-8">
      <div className="mesh-navy-deep relative mx-auto max-w-7xl overflow-hidden rounded-[36px] px-6 py-20 text-center sm:px-12 sm:py-28">
        <div className="grain-overlay" />
        <div className="pointer-events-none absolute -bottom-40 left-1/2 h-80 w-[46rem] -translate-x-1/2 rounded-full bg-ember/30 blur-[100px]" />
        <div className="relative">
          <Reveal y={12}>
            <Eyebrow tone="dark">{t(CLOSING.eyebrow)}</Eyebrow>
          </Reveal>
          <SplitText
            as="h2"
            text={t(CLOSING.title)}
            stagger={0.035}
            className="h-display mx-auto mt-7 max-w-5xl text-[clamp(2rem,4.4vw,3.9rem)] font-extrabold text-cream"
          />
          <Reveal as="p" delay={0.3} className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-cream/75 sm:text-xl">
            {t(CLOSING.body)}
          </Reveal>
          <Reveal delay={0.4} className="mt-10 flex flex-wrap justify-center gap-3">
            <Button to="/apply" variant="ember" icon="arrowRight">
              {t(COMMON.bookOrientation)}
            </Button>
            <Button href={PHONE.tel} variant="ghostLight" iconLeft="phone">
              {t(COMMON.callNow)}: {PHONE.display}
            </Button>
          </Reveal>
        </div>
      </div>

      <RohitCard className="-mt-8" />
    </section>
  );
}
