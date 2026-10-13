import Icon from "../ui/Icon.jsx";
import { getUserMessage } from "../../app/apis/apiError.js";
import Button from "./Button.jsx";
import { cx } from "./cx.js";

/* ── skeletons ──────────────────────────────────────────────────────────── */

/**
 * Loading placeholders, shaped like what's coming so the page doesn't jump
 * when it arrives. The shimmer is the `.skeleton` utility (index.css), which
 * goes still under reduced motion.
 */
export function Skeleton({ className }) {
  return <span aria-hidden className={cx("skeleton block rounded-lg", className)} />;
}

export function SkeletonText({ lines = 3, className }) {
  return (
    <span aria-hidden className={cx("flex flex-col gap-2", className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className={cx("h-3", i === lines - 1 ? "w-2/3" : "w-full")} />
      ))}
    </span>
  );
}

export function SkeletonCard({ className }) {
  return (
    <div
      aria-hidden
      className={cx("rounded-[24px] bg-surface-elevated p-5 ring-1 ring-inset ring-border/70 shadow-elevate sm:p-6", className)}
    >
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="flex-1">
          <Skeleton className="h-3.5 w-1/2" />
          <Skeleton className="mt-2 h-3 w-1/3" />
        </div>
      </div>
      <SkeletonText lines={2} className="mt-6" />
    </div>
  );
}

/* ── empty state ────────────────────────────────────────────────────────── */

const EMPTY_TINT = {
  slate: "bg-tint-slate",
  lavender: "bg-tint-lavender",
  // older names, kept so existing call sites still work
  sand: "bg-tint-slate",
  peach: "bg-tint-lavender",
  mint: "bg-tint-mint",
  plain: "bg-transparent",
};

/**
 * What a list shows when there's nothing in it. Always says why, and offers
 * the next step when there is one ("Create a batch"). Never a bare
 * "No data".
 */
export function EmptyState({ icon = "inbox", title, description, action, tone = "sand", compact = false, className }) {
  return (
    <div
      className={cx(
        "relative overflow-hidden rounded-[24px] px-6 text-center",
        compact ? "py-8" : "py-12 sm:py-14",
        EMPTY_TINT[tone],
        className,
      )}
    >
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-surface-elevated text-accent shadow-elevate ring-1 ring-border/60">
        <Icon name={icon} className="h-6 w-6" />
      </span>
      <h3 className="mt-5 font-display text-lg font-bold tracking-tight text-text-primary">{title}</h3>
      {description && <p className="mx-auto mt-1.5 max-w-sm text-sm text-text-muted">{description}</p>}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}

/* ── callout ────────────────────────────────────────────────────────────── */

const CALLOUT = {
  info: { box: "bg-surface-muted ring-border", title: "text-text-primary", icon: "info", iconTone: "text-text-muted" },
  accent: { box: "bg-accent-muted ring-accent/15", title: "text-accent", icon: "sparkle", iconTone: "text-accent" },
  success: { box: "bg-success-muted ring-success/20", title: "text-success", icon: "checkCircle", iconTone: "text-success" },
  warning: { box: "bg-warning-muted ring-warning/20", title: "text-warning", icon: "alertTriangle", iconTone: "text-warning" },
  danger: { box: "bg-danger-muted ring-danger/20", title: "text-danger", icon: "alertTriangle", iconTone: "text-danger" },
};

/**
 * An inline message inside a page: a gate, a warning, a load error.
 * `live` announces it when it appears (role="alert") — for messages that
 * arrive as the result of something the user did, not static notes.
 */
export function Callout({ tone = "info", title, icon, action, live = false, children, className }) {
  const look = CALLOUT[tone] ?? CALLOUT.info;
  return (
    <div
      role={live ? "alert" : undefined}
      className={cx("flex flex-col gap-3 rounded-2xl px-4 py-3.5 ring-1 ring-inset sm:flex-row sm:items-start", look.box, className)}
    >
      <div className="flex min-w-0 flex-1 gap-3">
        <Icon name={icon ?? look.icon} className={cx("mt-0.5 h-[18px] w-[18px] shrink-0", look.iconTone)} strokeWidth={2} />
        <div className="min-w-0 text-[13.5px] leading-relaxed">
          {title && <p className={cx("font-semibold", look.title)}>{title}</p>}
          {children && <div className="text-text-primary/85">{children}</div>}
        </div>
      </div>
      {action && <div className="shrink-0 sm:ml-auto">{action}</div>}
    </div>
  );
}

/** The standard "couldn't load" block, with a retry (not offered for a 403). */
export function LoadError({ what = "this", error, onRetry, message }) {
  const forbidden = error?.status === 403 || error?.code === "FORBIDDEN";
  return (
    <Callout
      tone={forbidden ? "warning" : "danger"}
      live
      icon={forbidden ? "lock" : undefined}
      title={forbidden ? `You can't view ${what}` : `Couldn't load ${what}`}
      action={
        onRetry && !forbidden && (
          <Button size="sm" variant="secondary" icon="refresh" onClick={onRetry}>
            Try again
          </Button>
        )
      }
    >
      {message ??
        (forbidden
          ? "Your role doesn't include access to this. Ask a super admin if you need it."
          : getUserMessage(error, "Check your connection and try again."))}
    </Callout>
  );
}
