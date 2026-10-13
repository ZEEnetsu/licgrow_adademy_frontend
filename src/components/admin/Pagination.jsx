import { IconButton } from "./Button.jsx";
import { pageList } from "./list/pagination.js";
import { cx } from "./cx.js";

/** "learners" → "learner", "batches" → "batch", for a count of one. */
const singular = (label) =>
  /(ch|sh|x|ss)es$/.test(label) ? label.slice(0, -2) : label.endsWith("s") ? label.slice(0, -1) : label;

/**
 * Page controls under a list, driven by the API's `meta` block
 * (`{ page, limit, total, totalPages, hasNext, hasPrev }`).
 *
 * The count line ("Showing 21–40 of 57 learners") always renders — it is how
 * an admin knows the list isn't the whole story. The buttons only render when
 * there is more than one page.
 *
 * `itemLabel` is the plural noun; the singular is derived ("1 of 1 learner").
 * Pass `[singular, plural]` for irregular nouns.
 */
export default function Pagination({ meta, onPageChange, itemLabel = "items", isFetching = false, className }) {
  if (!meta || !meta.total) return null;

  const { page, limit, total, totalPages } = meta;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  const noun = Array.isArray(itemLabel)
    ? itemLabel[total === 1 ? 0 : 1]
    : total === 1
      ? singular(itemLabel)
      : itemLabel;

  return (
    <nav
      aria-label="Pagination"
      className={cx("flex flex-col items-center justify-between gap-3 sm:flex-row", className)}
    >
      <p className="text-[13px] text-text-muted" aria-live="polite">
        Showing{" "}
        <span className="font-semibold text-text-primary tabular-nums">
          {from}–{to}
        </span>{" "}
        of <span className="font-semibold text-text-primary tabular-nums">{total}</span> {noun}
      </p>

      {totalPages > 1 && (
        <div className={cx("flex items-center gap-1 transition-opacity duration-200", isFetching && "opacity-70")}>
          <IconButton
            icon="chevronLeft"
            label="Previous page"
            size="md"
            disabled={!meta.hasPrev}
            onClick={() => onPageChange(page - 1)}
          />
          {pageList(page, totalPages).map((p, i) =>
            p === null ? (
              <span key={`gap-${i}`} className="w-6 text-center text-sm text-text-muted" aria-hidden>
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                aria-current={p === page ? "page" : undefined}
                aria-label={`Page ${p}`}
                className={cx(
                  "focus-ring h-9 min-w-9 cursor-pointer rounded-full px-2 text-[13px] font-semibold tabular-nums transition-colors duration-200",
                  p === page
                    ? "bg-text-primary text-bg"
                    : "text-text-muted hover:bg-surface-hover hover:text-text-primary",
                )}
              >
                {p}
              </button>
            ),
          )}
          <IconButton
            icon="chevronRight"
            label="Next page"
            size="md"
            disabled={!meta.hasNext}
            onClick={() => onPageChange(page + 1)}
          />
        </div>
      )}
    </nav>
  );
}
