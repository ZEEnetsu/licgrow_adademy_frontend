/**
 * Every entity status in the admin, mapped to one label and one tone.
 *
 * This is the only place a status picks a colour. It replaces the per-page
 * `STATUS_TONE` tables, which had drifted (an archived batch and an archived
 * course were different greys). The tone names are semantic, so the meaning
 * is the same everywhere: success = live/ok, warning = needs someone,
 * danger = blocked, neutral = not live, accent = highlighted.
 */
export const STATUS_META = {
  // live
  active: { label: "Active", tone: "success" },
  published: { label: "Published", tone: "success" },
  approved: { label: "Approved", tone: "success" },
  enrollmentOpen: { label: "Enrollment open", tone: "success", icon: "unlock" },
  // waiting on an admin
  pending: { label: "Pending", tone: "warning", pulse: true },
  // blocked
  suspended: { label: "Suspended", tone: "danger" },
  rejected: { label: "Rejected", tone: "danger" },
  deactivated: { label: "Deactivated", tone: "danger" },
  revoked: { label: "Revoked", tone: "danger" },
  // not live
  draft: { label: "Draft", tone: "neutral", icon: "pencil" },
  inactive: { label: "Inactive", tone: "neutral" },
  archived: { label: "Archived", tone: "neutral", icon: "archive" },
  expired: { label: "Expired", tone: "neutral", icon: "clock" },
  withdrawn: { label: "Withdrawn", tone: "neutral" },
  enrollmentClosed: { label: "Enrollment closed", tone: "neutral", icon: "lock" },
  // highlighted
  pinned: { label: "Pinned", tone: "accent", icon: "pushpin" },
  global: { label: "Everyone", tone: "accent", icon: "globe" },
};

/** Fill + ink per tone. Each pair is one of the AA pairs in theme.css. */
export const BADGE_TONE = {
  success: "bg-success-muted text-success",
  warning: "bg-warning-muted text-warning",
  danger: "bg-danger-muted text-danger",
  neutral: "bg-surface-muted text-text-muted ring-1 ring-inset ring-border",
  accent: "bg-accent-muted text-accent",
};

/** "in_review" → "In review", for a status the map doesn't know yet. */
export const humanize = (value) => {
  const text = String(value ?? "").replace(/[_-]+/g, " ").trim();
  return text ? text[0].toUpperCase() + text.slice(1) : "—";
};

export const statusMeta = (status) =>
  STATUS_META[status] ?? { label: humanize(status), tone: "neutral" };
