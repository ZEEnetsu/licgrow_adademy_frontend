import { SECTIONS } from './sections.js';

/*
 * Turns a page's section ids into an ordered list of parts for SitePage.
 *
 * Every section in the generated content follows the same shape — a
 * `header.page-hero`, a run of `box.block`s (each opening with an <h3>),
 * optionally a `details.legacy` archive and an `aside.page-cta` — so the
 * page can be laid out as chapters without any per-page markup.
 */

const has = (node, c) => (node?.cls || []).includes(c);

/** Inline markup → plain text, for headings that animate word by word. */
export const plain = (html = '') =>
  String(html)
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();

const plainPair = (pair) => (pair ? { hi: plain(pair.hi || pair.en), en: plain(pair.en || pair.hi) } : null);

/** Split a `header.page-hero` into its named pieces. */
function readHero(node) {
  const kids = node.children || [];
  const eyebrow = kids.find((c) => c.t === 'p' && has(c, 'eyebrow'));
  const title = kids.find((c) => c.t === 'h2');
  const lede = kids.find((c) => c.t === 'p' && has(c, 'lede'));
  const extras = kids.filter(
    (c) => c !== eyebrow && c !== title && c !== lede && c.t !== 'a' && !has(c, 'btn-row'),
  );
  return { eyebrow, title, titleText: plainPair(title?.text), lede, extras };
}

const cache = new Map();

export function buildPage(ids) {
  const key = ids.join('|');
  if (cache.has(key)) return cache.get(key);

  const parts = [];
  const chapters = [];
  let n = 0;
  let run = 0; // chapters alternate sand / cream; a section intro restarts it

  ids.forEach((sid, si) => {
    const section = SECTIONS[sid];
    if (!section) return;

    for (const c of section.children || []) {
      if (c.t === 'header') {
        const hero = readHero(c);
        if (si === 0) {
          parts.push({ kind: 'hero', sectionId: sid, ...hero });
          chapters.push({ id: 'top', label: { hi: 'शुरुआत', en: 'Overview' } });
        } else {
          run = 0;
          parts.push({ kind: 'intro', sectionId: sid, ...hero });
          chapters.push({ id: sid, label: hero.titleText });
        }
        continue;
      }

      if (c.t === 'box' && has(c, 'block')) {
        const h3 = (c.children || []).find((x) => x.t === 'h3');
        n += 1;
        const id = `${sid}-${n}`;
        const kind = has(c, 'recap') ? 'recap' : has(c, 'goal-band') ? 'goal' : 'chapter';
        if (kind === 'chapter') run += 1;
        parts.push({
          kind,
          alt: run % 2 === 1,
          id,
          n,
          sectionId: sid,
          title: plainPair(h3?.text),
          body: (c.children || []).filter((x) => x !== h3),
          src: c.src,
        });
        chapters.push({ id, label: plainPair(h3?.text) || { hi: `अध्याय ${n}`, en: `Chapter ${n}` } });
        continue;
      }

      if (c.t === 'details' && has(c, 'legacy')) {
        n += 1;
        const id = `${sid}-${n}`;
        parts.push({ kind: 'legacy', id, n, node: c });
        chapters.push({ id, label: plainPair(c.summary) });
        continue;
      }

      if (c.t === 'aside') {
        parts.push({ kind: 'cta', node: c });
        continue;
      }

      parts.push({ kind: 'loose', node: c });
    }
  });

  // The last CTA panel closes the page and sits above Rohit's card.
  for (let i = parts.length - 1; i >= 0; i -= 1) {
    if (parts[i].kind === 'cta') {
      parts[i] = { ...parts[i], last: true };
      break;
    }
  }

  const page = { parts, chapters, total: n };
  cache.set(key, page);
  return page;
}
