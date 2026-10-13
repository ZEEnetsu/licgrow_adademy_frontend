import { useEffect, useState } from "react";

/**
 * Last-resort values, mirroring the LIGHT theme in src/styles/theme.css.
 *
 * Only reached where there is no computed style to read — a server render, or
 * a test environment without a DOM. Without it a chart would fall back to
 * Chart.js's own greys, which is the exact problem tokens are here to fix.
 *
 * It is a mirror, so it can drift. `scripts/theme.check.mjs` compares every
 * entry against the CSS and fails if they diverge. (`chart-grid` is an rgba,
 * so the checker compares it as a string.)
 */
const FALLBACK = {
  bg: "#f4f5f9",
  surface: "#ffffff",
  "surface-elevated": "#ffffff",
  border: "#e1e4ec",
  "text-primary": "#150d3d",
  "text-muted": "#555a75",
  // chart-tick and the semantic slices are aliases in CSS (`var(--text-muted)`
  // and friends); these are their resolved light-theme values
  "chart-1": "#3d3660",
  "chart-2": "#64a893",
  "chart-3": "#c9c3e8",
  "chart-4": "#150d3d",
  "chart-5": "#9c93d1",
  "chart-6": "#aed5d1",
  "chart-positive": "#2f6b58",
  "chart-negative": "#a3364f",
  "chart-neutral": "#cbd0dc",
  "chart-grid": "rgb(21 13 61 / 0.08)",
  "chart-tick": "#555a75",
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
