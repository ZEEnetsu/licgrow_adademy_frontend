import { useEffect } from "react";
import { useSelector } from "react-redux";

import { selectTheme } from "./theme.slice.js";

/**
 * Applies the theme to the document.
 *
 * One class on <html>. Everything downstream is CSS custom properties from
 * src/styles/theme.css, so this is the only place in the app that touches the
 * DOM for styling — no component reads the theme in order to pick a colour.
 *
 * Mount it once, at the router root: it is the whole application's theme, not
 * one section's. It used to live inside /admin, which is why learner pages
 * never followed the preference.
 */
export function useThemeSync() {
  const mode = useSelector(selectTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", mode === "dark");
    try {
      localStorage.setItem("theme", mode);
    } catch {
      /* private mode, quota, disabled storage — all survivable */
    }
  }, [mode]);
}
