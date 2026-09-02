import { useEffect, useState } from "react";

/**
 * Last-resort values, mirroring the LIGHT theme in src/styles/tokens/.
 *
 * Only reached where there is no computed style to read — a server render, or
 * a test environment without a DOM. Without it a chart would fall back to
 * Chart.js's own greys, which is the exact problem tokens are here to fix.
 *
 * It is a mirror, so it can drift. `theme.check.mjs` compares every entry
 * against the CSS and fails if they diverge.
 */
const FALLBACK = {
  bg: "#ffffff",
  surface: "#f4f4f5",
  "surface-elevated": "#ffffff",
  border: "#e4e4e7",
  "text-primary": "#09090b",
  "text-muted": "#52525b",
  // chart-1/grid/tick are aliases in CSS (`var(--accent)` and friends); these
  // are their resolved light-theme values
  "chart-1": "#047857",
  "chart-grid": "#e4e4e7",
  "chart-tick": "#52525b",
  "chart-2": "#1d4ed8",
  "chart-3": "#6d28d9",
  "chart-4": "#b45309",
  "chart-5": "#0e7490",
  "chart-6": "#be185d",
};

/**
 * Resolves design tokens to real colour values, for the one thing that cannot
 * use them directly: a canvas.
 *
 * Chart.js paints pixels. It never sees the DOM, so `var(--chart-1)` means
 * nothing to it — every colour has to be handed over as a resolved string. This
 * hook is the single place that translation happens; without it, charts end up
 * with hardcoded hexes that stay put when the theme switches, which is exactly
 * how they got out of step.
 *
 * It watches the class attribute on <html> rather than subscribing to the
 * theme slice, for two reasons:
 *
 *   · ordering — React runs effects child-first, so a chart's effect fires
 *     BEFORE the root layout's effect has applied the new class. Keyed on the
 *     Redux value, every chart would read the previous theme's colours.
 *   · completeness — the class is also set by the boot script in index.html,
 *     before React exists at all, and could be set by anything else later. The
 *     DOM is the source of truth for what is actually painted.
 *
 * @param {string[]} names token names without the leading `--`
 * @returns {Record<string, string>} resolved values, e.g. `{ "chart-1": "#047857" }`
 */
export function useThemeTokens(names) {
  // a stable primitive to key the effect on: a fresh array literal every render
  // would re-subscribe on every render
  const key = names.join(",");
  const [tokens, setTokens] = useState(() => readTokens(names));

  useEffect(() => {
    const wanted = key.split(",");
    const update = () => setTokens(readTokens(wanted));

    // the initial value was read during render, which is already correct for a
    // first paint; this catches every later change
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, [key]);

  return tokens;
}

/**
 * Custom properties are substituted at computed-value time, so a token defined
 * as `var(--accent)` comes back as the accent's actual colour.
 */
function readTokens(names) {
  // seeded with the mirror, so a caller never has to handle `undefined`
  const out = {};
  for (const name of names) {
    if (name in FALLBACK) out[name] = FALLBACK[name];
  }

  if (typeof getComputedStyle !== "function" || typeof document === "undefined") {
    return out; // server render or a DOM-less test
  }

  const styles = getComputedStyle(document.documentElement);
  for (const name of names) {
    const value = styles.getPropertyValue(`--${name}`).trim();
    if (value) out[name] = value;
  }
  return out;
}
