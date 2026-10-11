import { useEffect } from 'react';
import { MotionConfig } from 'framer-motion';

import AcademyNav from '../../components/AcademyNav.jsx';
import { useLang } from '../../i18n/index.js';
import SiteFooter from '../site/SiteFooter.jsx';
import { PAGES } from '../site/sections.js';
import Boss from './sections/Boss.jsx';
import Closing from './sections/Closing.jsx';
import Dreams from './sections/Dreams.jsx';
import Explore from './sections/Explore.jsx';
import Faq from './sections/Faq.jsx';
import Goal from './sections/Goal.jsx';
import Hero from './sections/Hero.jsx';
import Join from './sections/Join.jsx';
import Market from './sections/Market.jsx';
import Message from './sections/Message.jsx';
import Opportunity from './sections/Opportunity.jsx';
import Paths from './sections/Paths.jsx';
import Who from './sections/Who.jsx';
import WhyNow from './sections/WhyNow.jsx';
import { ChapterRail, ScrollProgress } from '../../components/ui/Progress.jsx';
import { CHAPTERS } from './content.js';

/**
 * The landing page: the client's recruitment pitch told as one scrolling
 * story in fourteen chapters (ids in content.js → CHAPTERS).
 *
 * MotionConfig reducedMotion="user" makes every transform animation respect
 * the OS setting; the pinned chapters additionally drop their pinning.
 *
 * `overflow-x: clip` (not hidden) stops marquees and parallax from adding a
 * horizontal scrollbar without creating a scroll container — `hidden` would
 * break every `position: sticky` chapter below it.
 */
export default function Home() {
  const { t, lang } = useLang();

  useEffect(() => {
    document.title = t(PAGES.landing.title);
  }, [t, lang]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen overflow-x-clip bg-cream text-ink antialiased">
        <ScrollProgress />
        <AcademyNav />
        <ChapterRail chapters={CHAPTERS} />
        <main>
          <Hero />
          <Boss />
          <Dreams />
          <Opportunity />
          <WhyNow />
          <Market />
          <Who />
          <Paths />
          <Goal />
          <Join />
          <Explore />
          <Message />
          <Faq />
          <Closing />
        </main>
        <SiteFooter />
      </div>
    </MotionConfig>
  );
}
