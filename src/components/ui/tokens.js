/**
 * Shared style constants for the UI primitives.
 *
 * A plain module rather than an export from `Surface.jsx`: mixing components
 * and constants in one file breaks Fast Refresh, and these are consumed by
 * both `Surface.jsx` and `Panel.jsx` anyway.
 *
 * Every value is a design token from index.css, never a literal `zinc-*`. The
 * tokens are redefined under `.dark`, so anything built from them follows the
 * theme; a hardcoded colour stays dark in light mode.
 */

/**
 * Semantic tones for a headline figure — one table, so a "warn" number is the
 * same colour whether it lands in a `StatTile` or a `FigureList` row.
 */
export const FIGURE_TONE = {
  default: "text-text-primary",
  accent: "text-accent",
  warn: "text-amber-500 dark:text-amber-400",
  danger: "text-red-500 dark:text-red-400",
};
