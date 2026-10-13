import { forwardRef } from "react";
import { Link } from "react-router-dom";

import Icon from "../ui/Icon.jsx";
import { inr } from "../motion/primitives.js";
import { useCountTo } from "../../hooks/useCountTo.js";
import { cx } from "./cx.js";

const CARD_TONE = {
  default: "bg-surface-elevated ring-1 ring-inset ring-border/70 shadow-elevate",
  muted: "bg-surface-muted ring-1 ring-inset ring-border/60",
  lavender: "bg-tint-lavender",
  mint: "bg-tint-mint",
  slate: "bg-tint-slate",
  // older names, kept so existing call sites still work
  peach: "bg-tint-lavender",
  sand: "bg-tint-slate",
  brand: "bg-brand text-brand-contrast",
};

const CARD_PADDING = {
  none: "",
  sm: "p-4",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-8",
};

/**
 * The surface every block of content sits on: 24px radius, a hairline, and
 * the landing page's ink-tinted card shadow. `interactive` adds the landing
 * cards' slow lift on hover — only for cards that are links.
 */
export const Card = forwardRef(function Card(
  { as: Tag = "div", tone = "default", padding = "md", interactive = false, className, children, ...rest },
  ref,
) {
  return (
    <Tag
      ref={ref}
      className={cx(
        "relative rounded-[24px]",
        CARD_TONE[tone],
        CARD_PADDING[padding],
        interactive &&
          "group/card focus-ring transition-[transform,box-shadow] duration-500 ease-out-expo hover:-translate-y-0.5 hover:shadow-elevate-hover",
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
});

/** A titled Card: heading row (with an optional action) over a body. */
export function Panel({ title, description, icon, action, children, className, bodyClassName, as = "section" }) {
  return (
    <Card as={as} padding="none" className={cx("flex flex-col", className)}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-4 px-5 pt-5 sm:px-6 sm:pt-6">
          <div className="flex min-w-0 items-center gap-3">
            {icon && (
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-tint-slate text-text-primary">
                <Icon name={icon} className="h-[18px] w-[18px]" />
              </span>
            )}
            <div className="min-w-0">
              {title && <h2 className="font-display text-[17px] font-bold tracking-tight text-text-primary">{title}</h2>}
              {description && <p className="text-[13px] text-text-muted">{description}</p>}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={cx("min-w-0 flex-1 px-5 pt-4 pb-5 sm:px-6 sm:pb-6", bodyClassName)}>{children}</div>
    </Card>
  );
}

/*
 * Column counts by available width. The content column is the window minus
 * the rail (256px), so two-up only starts at `lg` and three-up at `xl`.
 */
const GRID_COLS = {
  2: "lg:grid-cols-2",
  3: "md:grid-cols-2 xl:grid-cols-3",
  4: "md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4",
};

export function CardGrid({ cols = 3, className, children, ...rest }) {
  return (
    <div className={cx("grid grid-cols-1 gap-4", GRID_COLS[cols], className)} {...rest}>
      {children}
    </div>
  );
}

/* ── stat card ──────────────────────────────────────────────────────────── */

/*
 * Plain cards by default, so a row of figures stays calm; colour lives only in
 * the small icon chip (`chip`). The ink (`brand`) card is theme-invariant, so
 * its colours come from the static palette (lavender figures on ink).
 */
const STAT_TONE = {
  brand: {
    card: "bg-brand text-brand-contrast",
    label: "text-brand-contrast/70",
    value: "text-lavender",
    chip: "bg-white/10 text-lavender",
    caption: "text-brand-contrast/65",
    arrow: "bg-white/15 text-white",
  },
  peach: {
    card: "bg-tint-lavender text-text-primary",
    label: "text-text-muted",
    value: "text-accent",
    chip: "bg-surface-elevated text-accent",
    caption: "text-text-muted",
    arrow: "bg-text-primary text-bg",
  },
  mint: {
    card: "bg-tint-mint text-text-primary",
    label: "text-text-muted",
    value: "text-success",
    chip: "bg-surface-elevated text-success",
    caption: "text-text-muted",
    arrow: "bg-text-primary text-bg",
  },
  default: {
    card: "bg-surface-elevated text-text-primary ring-1 ring-inset ring-border/70 shadow-elevate",
    label: "text-text-muted",
    value: "text-text-primary",
    chip: "bg-tint-slate text-text-primary",
    caption: "text-text-muted",
    arrow: "bg-text-primary text-bg",
  },
};

/* icon-chip tints for plain cards; the figure itself stays in text colour */
const CHIP_TONE = {
  lavender: "bg-tint-lavender text-accent",
  mint: "bg-tint-mint text-success",
  slate: "bg-tint-slate text-text-primary",
};

/**
 * A headline figure. Counts up on mount and tweens when the number changes.
 * With `to`, the whole card is a link and its arrow chip turns on hover.
 */
export function StatCard({ label, value, suffix, caption, icon, tone = "default", chip, to, className }) {
  const look = STAT_TONE[tone] ?? STAT_TONE.default;
  const chipClass = CHIP_TONE[chip] ?? look.chip;
  const shown = useCountTo(typeof value === "number" ? value : undefined);
  const display = typeof value === "number" ? `${inr(shown)}${suffix ?? ""}` : value ?? "—";

  const body = (
    <>
      {tone === "brand" && (
        <>
          <span className="grain-overlay" aria-hidden />
          <span
            className="pointer-events-none absolute -right-16 -bottom-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(174,213,209,0.28),transparent_65%)]"
            aria-hidden
          />
        </>
      )}
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          {icon && (
            <span className={cx("grid h-9 w-9 shrink-0 place-items-center rounded-xl", chipClass)}>
              <Icon name={icon} className="h-[18px] w-[18px]" />
            </span>
          )}
          <p className={cx("caps truncate text-[11px] font-bold", look.label)}>{label}</p>
        </div>
        {to && (
          <span
            className={cx(
              "grid h-8 w-8 shrink-0 place-items-center rounded-full transition-transform duration-500 ease-out-expo group-hover/stat:rotate-45",
              look.arrow,
            )}
            aria-hidden
          >
            <Icon name="arrowUpRight" className="h-4 w-4" strokeWidth={2} />
          </span>
        )}
      </div>
      <div className="relative mt-6">
        <p className={cx("font-display text-[2.375rem] leading-none font-extrabold tracking-tight tabular-nums", look.value)}>
          {display}
        </p>
        {caption && <p className={cx("mt-2 text-[13px] leading-snug", look.caption)}>{caption}</p>}
      </div>
    </>
  );

  const classes = cx(
    "group/stat relative flex min-h-[9.5rem] flex-col justify-between overflow-hidden rounded-[24px] p-5 sm:p-6",
    look.card,
    to && "focus-ring transition-[transform,box-shadow] duration-500 ease-out-expo hover:-translate-y-0.5 hover:shadow-elevate-hover",
    className,
  );

  return to ? (
    <Link to={to} className={classes}>
      {body}
    </Link>
  ) : (
    <div className={classes}>{body}</div>
  );
}
