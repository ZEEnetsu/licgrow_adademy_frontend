/**
 * Shared surface primitives.
 *
 * Every colour here is a design token from src/styles/tokens/ (`bg`, `surface`,
 * `text-primary`, `text-muted`, `border`, `accent`, and the status trio), never
 * a literal `zinc-*`. That is what makes light and dark mode work: the tokens
 * are redefined under `.dark`, so a component built from them follows the theme
 * automatically, while a hardcoded colour stays dark in light mode.
 *
 * The visual language follows the admin dashboard's StatsCard: an elevated
 * surface, generously rounded, and lifted off the tinted page by `shadow-
 * elevate` rather than outlined by a border. Cards and tiles carry no border
 * anywhere in the app — separation is elevation, so the two themes can use the
 * shadow physics each needs (see styles/theme.css).
 */
import { FIGURE_TONE } from "./tokens.js";

/** The standard elevated panel. */
export const Card = ({
  as: Tag = "div",
  className = "",
  children,
  ...props
}) => (
  <Tag
    className={`rounded-3xl bg-surface-elevated shadow-elevate p-4 ${className}`}
    {...props}
  >
    {children}
  </Tag>
);

/** A Card that responds to pointer input — for links and buttons. */
export const InteractiveCard = ({
  as: Tag = "div",
  className = "",
  children,
  ...props
}) => (
  <Tag
    className={`rounded-lg bg-surface-elevated shadow-elevate hover:bg-surface-elevated-hover hover:shadow-elevate-hover transition-[background-color,box-shadow] duration-200 p-4 ${className}`}
    {...props}
  >
    {children}
  </Tag>
);

/**
 * A headline figure, matching the admin StatsCard proportions so the learner
 * and admin dashboards read as one product.
 */
export const StatTile = ({ label, value, caption, tone = "default" }) => {
  const valueTone = FIGURE_TONE[tone];

  return (
    <Card className="min-h-28 flex flex-col justify-between">
      <p className="text-[11px] uppercase tracking-wide text-text-muted">
        {label}
      </p>
      <div>
        <p className={`text-3xl font-bold ${valueTone}`}>{value}</p>
        {caption && (
          <p className="text-[11px] text-text-muted mt-0.5">{caption}</p>
        )}
      </div>
    </Card>
  );
};

/** Section heading, used above every block on both dashboards. */
export const SectionTitle = ({ children, action }) => (
  <div className="flex items-baseline justify-between gap-4 mb-3 mt-3">
    <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
      {children}
    </h2>
    {action}
  </div>
);

/** Status pill. Tones are semantic, and each is legible in both themes. */
export const Pill = ({ tone = "neutral", children }) => {
  const tones = {
    neutral: "bg-bg text-text-muted",
    accent: "bg-accent/15 text-accent",
    good: "bg-success-muted text-success",
    warn: "bg-warning-muted text-warning",
    bad: "bg-danger-muted text-danger",
  };

  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide shrink-0 ${tones[tone]}`}
    >
      {children}
    </span>
  );
};

/**
 * Horizontal score bar. Colour-codes against the pass mark rather than a fixed
 * threshold, so it means the same thing on every test.
 */
export const ScoreBar = ({ percentage, passed }) => {
  const value = Math.max(0, Math.min(100, percentage ?? 0));
  const fill = passed ? "bg-success" : "bg-danger";

  return (
    <div
      className="h-1.5 w-full rounded-full bg-bg overflow-hidden"
      role="img"
      aria-label={`${value}%`}
    >
      <div
        className={`h-full rounded-full ${fill}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
};

/** Consistent empty state, so no page invents its own. */
export const EmptyState = ({ title, hint, action }) => (
  <Card className="text-center py-10">
    <p className="text-text-primary font-medium">{title}</p>
    {hint && <p className="text-text-muted text-xs mt-1">{hint}</p>}
    {action && <div className="mt-4">{action}</div>}
  </Card>
);
