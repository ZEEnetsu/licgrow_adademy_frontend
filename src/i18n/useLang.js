import { useContext } from 'react';

import { LangContext } from './context.js';

/**
 * `const { lang, setLang, t } = useLang()`
 *
 * `t({ hi, en })` returns the string for the active language. Every piece of
 * ported content is a pair, so this is the single place a language choice
 * turns into text.
 */
export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used inside <LangProvider>');
  return ctx;
}
