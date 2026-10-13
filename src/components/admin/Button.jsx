import { forwardRef } from "react";
import { Link } from "react-router-dom";

import Icon from "../ui/Icon.jsx";
import Tooltip from "./Tooltip.jsx";
import { Spinner } from "./Primitives.jsx";
import { cx } from "./cx.js";

/*
 * The landing page's button, on theme tokens.
 *
 *   primary     ember-deep fill + ember glow — the ONE main action of a view
 *   secondary   white pill with a hairline — everything else that matters
 *   tonal       ember wash — a positive inline action (Approve, Reactivate)
 *   ghost       text only until hovered — Cancel, low-stakes actions
 *   danger      solid raspberry — the confirm button of a destructive dialog
 *   dangerSoft  raspberry wash — a destructive action sitting in a page
 *
 * Full class strings only: Tailwind can't see a class built by concatenation.
 */
const VARIANT = {
  primary:
    "bg-accent-solid text-accent-solid-contrast shadow-accent hover:bg-accent-solid-hover",
  secondary:
    "bg-surface-elevated text-text-primary ring-1 ring-inset ring-border shadow-[0_1px_2px_rgb(21_13_61/0.05)] hover:bg-surface-elevated-hover hover:ring-border-strong/60",
  tonal: "bg-accent-muted text-accent hover:bg-accent-muted-hover",
  ghost: "text-text-muted hover:bg-surface-hover hover:text-text-primary",
  danger: "bg-danger text-bg hover:brightness-110",
  dangerSoft: "bg-danger-muted text-danger hover:ring-1 hover:ring-inset hover:ring-danger/40",
};

const SIZE = {
  sm: "h-9 gap-1.5 px-3.5 text-[13px]",
  md: "h-10 gap-2 px-4.5 text-sm",
  lg: "h-12 gap-2.5 px-6 text-[15px]",
};

const ICON_SIZE = { sm: "h-4 w-4", md: "h-[18px] w-[18px]", lg: "h-5 w-5" };

const BASE =
  "group/btn focus-ring inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full font-semibold whitespace-nowrap transition-[background-color,color,box-shadow,transform,filter] duration-300 ease-out-expo active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50";

/**
 * @param {object} props
 * @param {'primary'|'secondary'|'tonal'|'ghost'|'danger'|'dangerSoft'} [props.variant]
 * @param {'sm'|'md'|'lg'} [props.size]
 * @param {string} [props.icon]       leading Icon name
 * @param {string} [props.iconRight]  trailing Icon name — nudges right on hover
 * @param {boolean} [props.loading]   swaps the leading icon for a spinner, sets aria-busy
 * @param {string} [props.to]         renders a router <Link>
 * @param {string} [props.href]       renders a plain <a>
 */
const Button = forwardRef(function Button(
  { variant = "secondary", size = "md", icon, iconRight, loading = false, to, href, fullWidth, className, children, disabled, type = "button", ...rest },
  ref,
) {
  const classes = cx(BASE, VARIANT[variant], SIZE[size], fullWidth && "w-full", className);
  const iconClass = ICON_SIZE[size];

  const inner = (
    <>
      {loading ? (
        <Spinner className={iconClass} />
      ) : icon ? (
        <Icon name={icon} className={iconClass} strokeWidth={2} />
      ) : null}
      {children != null && <span>{children}</span>}
      {iconRight && (
        <Icon
          name={iconRight}
          className={cx(iconClass, "transition-transform duration-300 ease-out-expo group-hover/btn:translate-x-0.5")}
          strokeWidth={2}
        />
      )}
    </>
  );

  if (to) {
    return (
      <Link ref={ref} to={to} className={classes} aria-disabled={disabled || undefined} {...rest}>
        {inner}
      </Link>
    );
  }
  if (href) {
    return (
      <a ref={ref} href={href} className={classes} {...rest}>
        {inner}
      </a>
    );
  }
  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {inner}
    </button>
  );
});

export default Button;

const ICON_BUTTON_TONE = {
  default: "text-text-muted hover:bg-surface-hover hover:text-text-primary",
  danger: "text-text-muted hover:bg-danger-muted hover:text-danger",
  accent: "text-accent hover:bg-accent-muted",
  onBrand: "text-brand-contrast/70 hover:bg-white/[0.08] hover:text-brand-contrast",
};
const ICON_BUTTON_SIZE = { sm: "h-8 w-8", md: "h-9 w-9", lg: "h-10 w-10" };
const ICON_BUTTON_GLYPH = { sm: "h-4 w-4", md: "h-[18px] w-[18px]", lg: "h-5 w-5" };

/**
 * A round icon-only button. `label` is required: it becomes the accessible
 * name and the tooltip, so an icon is never the only description of an action.
 */
export const IconButton = forwardRef(function IconButton(
  { icon, label, tone = "default", size = "md", active = false, tooltip = true, tooltipSide = "top", loading = false, className, disabled, ...rest },
  ref,
) {
  const button = (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      aria-pressed={active || undefined}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={cx(
        "focus-ring grid shrink-0 cursor-pointer place-items-center rounded-full transition-[background-color,color,transform] duration-200 ease-material active:scale-90 disabled:pointer-events-none disabled:opacity-40",
        ICON_BUTTON_SIZE[size],
        active ? "bg-surface-hover text-text-primary" : ICON_BUTTON_TONE[tone],
        className,
      )}
      {...rest}
    >
      {loading ? (
        <Spinner className={ICON_BUTTON_GLYPH[size]} />
      ) : (
        <Icon name={icon} className={ICON_BUTTON_GLYPH[size]} strokeWidth={1.9} />
      )}
    </button>
  );

  return tooltip ? (
    <Tooltip content={label} side={tooltipSide}>
      {button}
    </Tooltip>
  ) : (
    button
  );
});
