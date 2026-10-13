/*
 * Display formatting shared by admin screens. Indian English throughout:
 * "3 Mar 2026", "11,97,438".
 */

const DATE = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });
const DATE_SHORT = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" });
const DATE_TIME = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

const parse = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

/** "3 Mar 2026"; "—" for nothing. */
export const formatDate = (value) => {
  const date = parse(value);
  return date ? DATE.format(date) : "—";
};

/** "3 Mar" — for ranges within a year. */
export const formatShortDate = (value) => {
  const date = parse(value);
  return date ? DATE_SHORT.format(date) : "—";
};

/** "3 Mar, 4:05 pm". */
export const formatDateTime = (value) => {
  const date = parse(value);
  return date ? DATE_TIME.format(date) : "—";
};

/** "3 Mar – 30 Apr 2026" (or across years, both years). */
export const formatRange = (start, end) => {
  const a = parse(start);
  const b = parse(end);
  if (!a || !b) return `${formatDate(start)} – ${formatDate(end)}`;
  return a.getFullYear() === b.getFullYear()
    ? `${DATE_SHORT.format(a)} – ${DATE.format(b)}`
    : `${DATE.format(a)} – ${DATE.format(b)}`;
};

/** "just now", "5m ago", "3h ago", "2d ago", then the date. */
export const timeAgo = (value) => {
  const date = parse(value);
  if (!date) return "—";
  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 86400 * 7) return `${Math.floor(seconds / 86400)}d ago`;
  return formatDate(date);
};

/** `plural(1, "learner")` → "1 learner"; `plural(3, "batch", "batches")`. */
export const plural = (count, one, many = `${one}s`) => `${count} ${count === 1 ? one : many}`;

/** "Good morning" / "Good afternoon" / "Good evening" for the local hour. */
export const greeting = (date = new Date()) => {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};
