import { cx } from "./cx.js";

/**
 * The 2px ember line that says "loading" without hiding what's on screen.
 * It fades in after 150ms (CSS transition-delay), so a fast refetch never
 * flickers it.
 */
export function ProgressLine({ active, className }) {
  return (
    <div
      aria-hidden
      className={cx(
        "pointer-events-none h-0.5 overflow-hidden rounded-full transition-opacity duration-200",
        active ? "opacity-100 delay-150" : "opacity-0",
        className,
      )}
    >
      {active && (
        <div className="h-full w-full origin-left animate-[progress-indeterminate_1.1s_ease-in-out_infinite] rounded-full bg-accent-vivid" />
      )}
    </div>
  );
}

/**
 * The row between the page header and the list: view tabs / filters on the
 * left (`start`), search and actions on the right (`end`). The progress line
 * runs along its foot while the list refetches.
 */
export default function Toolbar({ start, end, isFetching = false, className }) {
  return (
    <div className={cx("relative flex flex-col gap-3 md:flex-row md:items-center md:justify-between", className)}>
      {start && <div className="flex min-w-0 flex-wrap items-center gap-2">{start}</div>}
      {end && <div className="flex flex-wrap items-center gap-2 md:ml-auto md:justify-end">{end}</div>}
      <ProgressLine active={isFetching} className="absolute inset-x-0 -bottom-3" />
    </div>
  );
}
