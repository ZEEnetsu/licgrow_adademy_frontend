import { createContext } from 'react';

export const LANGS = ['hi', 'en'];
export const DEFAULT_LANG = 'en';

/**
 * Kept apart from the provider component so the module exports only values —
 * a file that mixes a component with shared constants breaks Fast Refresh.
 */
export const LangContext = createContext(null);

/**
 * Resolution order is lifted from the reference's own init block so a link
 * someone already shared keeps working:
 *   1. `?lang=` in the URL — and it is *remembered*, exactly as a click would be
 *   2. `localStorage.lang`
 *   3. English — the default since the landing redesign; Hindi is one click
 *      away and is remembered once chosen
 */
export function readInitialLang() {
  if (typeof window === 'undefined') return { lang: DEFAULT_LANG, remember: false };

  let fromUrl = null;
  try {
    fromUrl = new URLSearchParams(window.location.search).get('lang');
  } catch {
    /* malformed query string — fall through to storage */
  }
  if (LANGS.includes(fromUrl)) return { lang: fromUrl, remember: true };

  let stored = null;
  try {
    stored = window.localStorage.getItem('lang');
  } catch {
    /* private mode, disabled storage — survivable */
  }
  return { lang: LANGS.includes(stored) ? stored : DEFAULT_LANG, remember: false };
}

export function rememberLang(l) {
  try {
    window.localStorage.setItem('lang', l);
  } catch {
    /* ignore */
  }
}
