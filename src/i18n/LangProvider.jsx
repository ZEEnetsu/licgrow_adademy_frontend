import { useCallback, useEffect, useMemo, useState } from 'react';

import { DEFAULT_LANG, LANGS, LangContext, readInitialLang, rememberLang } from './context.js';

/**
 * Language state for the whole site.
 *
 * English is the default (see DEFAULT_LANG). Every string still carries its
 * Hindi pair, and a visitor's choice is remembered.
 *
 * `data-lang` AND `lang` both go on <html>: `lang` is what assistive tech and
 * the browser's own hyphenation read, `data-lang` is what CSS hooks onto.
 */
export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => readInitialLang().lang);

  // A first resolution that came from ?lang= persists, so a shared link sets
  // the preference instead of reverting on the visitor's next page.
  useEffect(() => {
    const { lang: initial, remember } = readInitialLang();
    if (remember) rememberLang(initial);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-lang', lang);
    root.setAttribute('lang', lang);
  }, [lang]);

  const setLang = useCallback((next) => {
    const l = LANGS.includes(next) ? next : DEFAULT_LANG;
    setLangState(l);
    rememberLang(l);
  }, []);

  /**
   * Pick the active string from a `{ hi, en }` pair.
   *
   * Falls back to the other language rather than rendering an empty node: a
   * handful of source strings are deliberately one-sided (a Hindi phrase kept
   * verbatim in the English view, an English brand name kept in the Hindi
   * one), and blanking those would drop content the client wrote on purpose.
   */
  const t = useCallback(
    (pair) => {
      if (pair == null) return '';
      if (typeof pair === 'string') return pair;
      const other = lang === 'hi' ? 'en' : 'hi';
      return pair[lang] || pair[other] || '';
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}
