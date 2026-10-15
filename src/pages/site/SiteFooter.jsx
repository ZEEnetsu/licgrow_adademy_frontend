import { Link } from 'react-router-dom';

import ShieldMark from '../../components/ShieldMark.jsx';
import { useLang } from '../../i18n/index.js';
import { NAV_PAGES, PAGES } from './sections.js';

/*
 * Copy from the reference's own `<footer class="site-footer">`
 * (generated/contact.json), kept verbatim in both languages.
 */
const COPY = {
  together: {
    hi: 'साथ आना शुरुआत है… साथ काम करना प्रगति है… साथ बने रहना सफलता है…',
    en: 'Coming together is Beginning… Working together is Progress… Staying together is Success…',
  },
  taglines: {
    hi: '“हर पल आपके साथ” · “ज़िंदगी के साथ भी, ज़िंदगी के बाद भी”',
    en: '“Har Pal Aapke Saath” · “Zindagi Ke Saath Bhi, Zindagi Ke Baad Bhi”',
  },
  purpose: {
    hi: 'लक्ष्य से प्रेरित, सेवा में समर्पित।',
    en: 'Leading with Purpose, Serving with Passion.',
  },
  name: { hi: 'रोहित लाल', en: 'Rohit Lal' },
  creds: {
    hi: 'MBA (फ़ाइनेंस और फ़ाइनेंशियल प्लानिंग) · डेवलपमेंट ऑफिसर (SBA), भारतीय जीवन बीमा निगम (LIC)',
    en: 'MBA (Finance & Financial Planning) · Development Officer (SBA), Life Insurance Corporation of India',
  },
  area: {
    hi: 'ब्रांच क्षेत्र: लखीसराय; शेखपुरा (SO); सूरजगढ़ा (SO); बड़हिया (SO)',
    en: 'Branch area: Lakhisarai; Sheikhpura (SO); Surajgarha (SO); Barahiya (SO)',
  },
  joinMe: [
    { hi: 'हम भर्ती कर रहे हैं…', en: 'We are recruiting…' },
    { hi: 'सपनों से हक़ीक़त तक।', en: 'From Dreams to Reality.' },
    { hi: 'आज ही मेरे साथ बीमा सलाहकार (Insurance Advisor) के रूप में जुड़िए।', en: 'Join me today as Insurance Advisor.' },
  ],
  conditions: { hi: '*शर्तें लागू', en: '*Conditions apply' },
  disclaimer: {
    hi: 'इस साइट पर दिए गए कमाई, कमीशन और फ़ायदों के सभी आँकड़े LIC और फ़ील्ड ट्रेनिंग सामग्री से लिए गए उदाहरण हैं। प्लान, पॉलिसी अवधि और उस समय लागू LIC / IRDAI नियमों के हिसाब से ये अलग हो सकते हैं। आपकी कमाई पूरी तरह आपकी अपनी मेहनत और आपके द्वारा लाए गए बिज़नेस पर निर्भर करती है — इसमें कोई तय या पक्की आय नहीं है। क्लब के फ़ायदे, एडवांस और बीमा कवर पात्रता और LIC के नियमों व शर्तों पर निर्भर हैं। एजेंसी की नियुक्ति का फ़ैसला भारतीय जीवन बीमा निगम (LIC) अपने विवेक से करता है। यह साइट एजेंसी भर्ती के लिए रोहित लाल, डेवलपमेंट ऑफिसर (SBA), भारतीय जीवन बीमा निगम (LIC) द्वारा चलाई जाती है।',
    en: 'All earnings, commission and benefit figures on this site are illustrations taken from LIC and field training material, and may differ by plan, policy term and the LIC / IRDAI rules in force. Income depends entirely on your own effort and the business you procure — there is no fixed or assured income. Club benefits, advances and insurance covers are subject to eligibility and LIC terms & conditions. Agency appointment is at the discretion of LIC of India. This site is maintained by Rohit Lal, Development Officer (SBA), LIC of India, for agency recruitment.',
  },
  explore: { hi: 'पढ़ें', en: 'Read' },
  pages: { hi: 'पेज', en: 'Pages' },
  contact: { hi: 'संपर्क', en: 'Contact' },
  home: { hi: 'होम', en: 'Home' },
};

const DEEP = [PAGES.whyLic, PAGES.startup, PAGES.explore];

/**
 * The site footer, on every public page.
 *
 * It carries the contact block, the taglines and — the reason it is on every
 * page rather than only on /contact — the earnings disclaimer. That paragraph
 * states that every commission and benefit figure on the site is an
 * illustration and that income is not fixed or assured. For a page selling a
 * commission-based career in India, that notice belongs wherever the figures
 * are, which is everywhere.
 */
export default function SiteFooter() {
  const { t } = useLang();
  const link = 'text-[15px] text-cream/70 transition-colors hover:text-cream';

  return (
    <footer className="relative overflow-hidden bg-ink text-cream">
      <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-ember/20 blur-[120px]" />
      <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-20 sm:px-6 lg:px-8">
        <p className="max-w-4xl font-hand text-[clamp(2rem,4vw,3.25rem)] leading-[1.1] text-peach">
          {t(COPY.together)}
        </p>

        <div className="mt-16 grid gap-12 border-t border-white/10 pt-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Link to="/" className="inline-flex items-center gap-2.5">
              <ShieldMark />
              <span className="font-display text-lg font-bold">
                lic<span className="text-peach">grow</span>
              </span>
            </Link>
            <ul className="mt-6 space-y-1.5 text-[15px] text-cream/70">
              {COPY.joinMe.map((l) => (
                <li key={l.en}>{t(l)}</li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-cream/60">{t(COPY.taglines)}</p>
            <p className="mt-1 text-sm font-semibold text-cream">{t(COPY.purpose)}</p>
          </div>

          <nav aria-label={t({ hi: 'पाद लेख मेनू', en: 'Footer menu' })}>
            <p className="caps text-[11px] font-bold text-mint">{t(COPY.pages)}</p>
            <ul className="mt-5 space-y-2.5">
              <li>
                <Link to="/" className={link}>
                  {t(COPY.home)}
                </Link>
              </li>
              {NAV_PAGES.map((p) => (
                <li key={p.path}>
                  <Link to={p.path} className={link}>
                    {t(p.nav)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={t(COPY.explore)}>
            <p className="caps text-[11px] font-bold text-mint">{t(COPY.explore)}</p>
            <ul className="mt-5 space-y-2.5">
              {DEEP.map((p) => (
                <li key={p.path}>
                  <Link to={p.path} className={link}>
                    {t(p.nav)}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/handbook" className={link}>
                  {t({ hi: 'हैंडबुक', en: 'Handbook' })}
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <p className="caps text-[11px] font-bold text-mint">{t(COPY.contact)}</p>
            <p className="mt-5 font-display text-xl font-bold">{t(COPY.name)}</p>
            <p className="mt-1 text-sm leading-relaxed text-cream/60">{t(COPY.creds)}</p>
            <div className="mt-4 space-y-1.5 text-[15px]">
              <p>
                <a href="tel:+919973055291" className="font-semibold text-cream hover:text-peach">
                  9973055291
                </a>
                <span className="mx-2 text-cream/30">·</span>
                <a href="tel:+918825361848" className="font-semibold text-cream hover:text-peach">
                  8825361848
                </a>
              </p>
              <p>
                <a href="mailto:support@licgrow.com" className="text-cream/80 hover:text-peach">
                  support@licgrow.com
                </a>
              </p>
              <p className="text-sm text-cream/60">{t(COPY.area)}</p>
            </div>
          </div>
        </div>

        <div className="mt-14 border-t border-white/10 pt-8">
          <p className="text-xs font-semibold text-cream/70">{t(COPY.conditions)}</p>
          <p className="mt-2 max-w-5xl text-xs leading-relaxed text-cream/50">{t(COPY.disclaimer)}</p>
        </div>
      </div>
    </footer>
  );
}
