import { createElement, Fragment } from 'react';
import { Link } from 'react-router-dom';

import { useLang } from '../../i18n/index.js';
import { resolveHref } from '../../pages/site/sections.js';

/**
 * Renders one `{ hi, en }` string, including the inline markup the extractor
 * preserved.
 *
 * Parsed into React elements rather than handed to `dangerouslySetInnerHTML`.
 * The strings are safe by construction — the extractor escapes every text node
 * and only ever emits the allowlist below — but this is a financial-services
 * site, and keeping a raw-HTML injection path open so a <strong> can render is
 * a bad trade. Anything outside the allowlist renders as literal text, so a
 * surprise tag in a revised source shows up visibly instead of executing.
 */
const ALLOWED = new Set([
  'strong', 'em', 'b', 'i', 'br', 'sup', 'sub', 'small', 'code', 'abbr', 'a', 'span',
]);

const VOID = new Set(['br']);
const TOKEN = /<(\/?)([a-zA-Z]+)((?:\s+[a-zA-Z-]+="[^"]*")*)\s*(\/?)>/g;

function attrsOf(raw, tag) {
  const out = {};
  for (const m of raw.matchAll(/([a-zA-Z-]+)="([^"]*)"/g)) {
    const [, name, value] = m;
    if (tag === 'a' && name === 'href') {
      out.href = resolveHref(value);
      // Anything leaving the site opens in a new tab; tel:/mailto:/# stay put.
      if (/^https?:/i.test(value)) {
        out.target = '_blank';
        out.rel = 'noreferrer noopener';
      }
    } else if (name === 'data-src') {
      out['data-src'] = value;
    }
  }
  return out;
}

function unescape(s) {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

/** html string -> array of React children */
function parseInline(html) {
  if (!html) return [];

  const root = { children: [] };
  const stack = [root];
  let cursor = 0;
  let key = 0;

  const pushText = (text) => {
    if (text) stack[stack.length - 1].children.push(unescape(text));
  };

  for (const m of html.matchAll(TOKEN)) {
    const [full, closing, rawTag, rawAttrs, selfClose] = m;
    const tag = rawTag.toLowerCase();

    if (!ALLOWED.has(tag)) continue; // leave it in the text stream verbatim

    pushText(html.slice(cursor, m.index));
    cursor = m.index + full.length;

    if (closing) {
      if (stack.length > 1 && stack[stack.length - 1].tag === tag) stack.pop();
      continue;
    }

    const node = { tag, props: attrsOf(rawAttrs, tag), children: [], key: `i${key++}` };
    stack[stack.length - 1].children.push(node);
    if (!VOID.has(tag) && !selfClose) stack.push(node);
  }
  pushText(html.slice(cursor));

  const toReact = (n) => {
    if (typeof n === 'string') return n;
    const kids = VOID.has(n.tag) ? undefined : n.children.map(toReact);
    // A cross-page section link (see resolveHref) goes through the router so
    // it is a client-side navigation, not a full reload.
    if (n.tag === 'a' && n.props.href?.startsWith('/')) {
      const { href, ...rest } = n.props;
      return createElement(Link, { key: n.key, to: href, ...rest }, kids);
    }
    return createElement(n.tag, { key: n.key, ...n.props }, kids);
  };

  return root.children.map(toReact);
}

/** `<RichText value={{ hi, en }} />` */
export default function RichText({ value }) {
  const { t } = useLang();
  const html = t(value);
  if (!html) return null;
  return <Fragment>{parseInline(html)}</Fragment>;
}
