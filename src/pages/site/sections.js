import apply from '../../content/generated/apply.json';
import benefits from '../../content/generated/benefits.json';
import bimaSakhi from '../../content/generated/bima-sakhi.json';
import career from '../../content/generated/career.json';
import club from '../../content/generated/club.json';
import contact from '../../content/generated/contact.json';
import explore from '../../content/generated/explore.json';
import faq from '../../content/generated/faq.json';
import genz from '../../content/generated/genz.json';
import home from '../../content/generated/home.json';
import procedure from '../../content/generated/procedure.json';
import startup from '../../content/generated/startup.json';
import whyLic from '../../content/generated/why-lic.json';

/** The 12 sections of the reference build, keyed by their original id. */
export const SECTIONS = {
  home,
  'why-lic': whyLic,
  benefits,
  'bima-sakhi': bimaSakhi,
  startup,
  procedure,
  club,
  career,
  genz,
  explore,
  faq,
  apply,
  // Contact lives in the reference's <footer>, not a <section>, but it is
  // the whole of the Contact page.
  contact,
};

/**
 * How those 12 sections map onto routes.
 *
 * Six are reachable from the navbar; the rest stay on the landing page. `club`
 * folds into Benefits and `genz` into Career rather than becoming nav items of
 * their own — they are continuations of those arguments, and the navbar is
 * already carrying six links plus a language toggle.
 */
export const PAGES = {
  landing: {
    path: '/',
    // The landing page is a hand-built story (pages/home/), not a list of
    // sections. Only `faq` is rendered from generated content there; `home`
    // is listed so in-content links to #home resolve to the landing page.
    ids: ['home', 'faq'],
    title: {
      hi: 'रोहित लाल के साथ LIC एजेंट बनें',
      en: 'Become an LIC Agent with Rohit Lal',
    },
  },
  // Long-form sections the landing page summarises and links to. Not in the
  // navbar — they are reached from the landing story and from in-content links.
  whyLic: {
    path: '/why-lic',
    ids: ['why-lic'],
    nav: { hi: 'LIC क्यों', en: 'Why LIC' },
    title: { hi: 'LIC क्यों', en: 'Why LIC' },
  },
  startup: {
    path: '/be-your-own-boss',
    ids: ['startup'],
    nav: { hi: 'अपने बॉस ख़ुद बनिए', en: 'Be your own boss' },
    title: { hi: 'अपने बॉस ख़ुद बनिए', en: 'Be your own boss' },
  },
  explore: {
    path: '/explore-india',
    ids: ['explore'],
    nav: { hi: 'कमाएँ और भारत घूमें', en: 'Earn & Explore India' },
    title: { hi: 'कमाएँ और भारत घूमें', en: 'Earn & Explore India' },
  },
  bimaSakhi: {
    path: '/bima-sakhi',
    ids: ['bima-sakhi'],
    nav: { hi: 'बीमा सखी', en: 'Bima Sakhi' },
    title: { hi: 'बीमा सखी', en: 'Bima Sakhi' },
    desc: {
      hi: 'महिलाओं को LIC वित्तीय सलाहकार (Financial Advisor) के रूप में आगे बढ़ाने की पहल।',
      en: 'Empowering women as LIC financial advisors.',
    },
  },
  benefits: {
    path: '/benefits',
    ids: ['benefits', 'club'],
    nav: { hi: 'फ़ायदे', en: 'Benefits' },
    title: { hi: 'फ़ायदे', en: 'Benefits' },
    desc: { hi: 'जब-जब ग्राहक प्रीमियम भरे, तब-तब आपकी कमाई', en: 'Earn every time your customer pays' },
  },
  procedure: {
    path: '/procedure',
    ids: ['procedure'],
    nav: { hi: 'प्रक्रिया', en: 'Procedure' },
    title: { hi: 'प्रक्रिया', en: 'Procedure' },
    desc: { hi: 'आज से आपके एजेंसी कोड तक का रास्ता', en: 'Your path from today to your agency code' },
  },
  career: {
    path: '/career',
    ids: ['career', 'genz'],
    nav: { hi: 'LIC में करियर', en: 'Career in LIC' },
    title: { hi: 'LIC में करियर', en: 'Career in LIC' },
    desc: {
      hi: 'आगे बढ़ने के तीन रास्ते: एजेंट क्लब, LIC कर्मचारी पद और CLIA उद्यमी ट्रैक।',
      en: 'Three tracks to grow: agent clubs, LIC employee posts and the CLIA entrepreneur track.',
    },
  },
  apply: {
    path: '/apply',
    ids: ['apply'],
    nav: { hi: 'आवेदन करें', en: 'Apply Now' },
    title: { hi: 'आवेदन करें', en: 'Apply Now' },
  },
  contact: {
    path: '/contact',
    // The footer already renders this content on every page; the Contact
    // route exists so the nav link has a destination of its own.
    ids: ['contact'],
    nav: { hi: 'संपर्क', en: 'Contact Us' },
    title: { hi: 'संपर्क', en: 'Contact Us' },
  },
};

/**
 * Header: the four "what you get" pages sit together under the Solutions
 * dropdown (each with its `desc` line); Apply and Contact stay top-level.
 */
export const SOLUTIONS = [PAGES.bimaSakhi, PAGES.benefits, PAGES.procedure, PAGES.career];
export const NAV_LINKS = [PAGES.apply, PAGES.contact];

/** Footer menu order, left to right — every routed nav page. */
export const NAV_PAGES = [
  PAGES.bimaSakhi,
  PAGES.benefits,
  PAGES.procedure,
  PAGES.career,
  PAGES.apply,
  PAGES.contact,
];

/** Every routed SitePage (the landing page has its own component). */
export const SITE_PAGES = [
  PAGES.bimaSakhi,
  PAGES.benefits,
  PAGES.procedure,
  PAGES.career,
  PAGES.apply,
  PAGES.contact,
  PAGES.whyLic,
  PAGES.startup,
  PAGES.explore,
];

/** Public routes that always paint light. Shared by RootLayout. */
export const LIGHT_PATHS = ['/', ...SITE_PAGES.map((p) => p.path), '/handbook', '/login', '/register'];

const SECTION_PATH = Object.fromEntries(
  Object.values(PAGES).flatMap((page) => page.ids.map((id) => [id, page.path])),
);

/**
 * The generated content links between sections with bare `#id` anchors — the
 * reference was one long page. Now that sections live on different routes,
 * `#procedure` from the Benefits page has to become `/procedure#procedure`.
 * Unknown anchors are returned unchanged.
 */
export function resolveHref(href) {
  if (!href || href[0] !== '#') return href;
  const id = href.slice(1);
  const path = SECTION_PATH[id];
  if (!path) return href;
  if (id === 'home') return path;
  return `${path}#${id}`;
}
