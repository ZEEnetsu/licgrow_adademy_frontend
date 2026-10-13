import { memo } from "react";
import { Link } from "react-router-dom";

import Icon from "../ui/Icon.jsx";
import { Skeleton } from "./Feedback.jsx";
import { cx } from "./cx.js";

/*
 * Column definition:
 *   id          stable key
 *   header      header label (also the mobile label)
 *   cell        (row, { pending }) => node
 *   sortKeys    { asc?: "fullName:asc", desc?: "fullName:desc" } — the server
 *               sort values this header toggles between
 *   width       CSS width for the column ("40%", "9rem")
 *   align       "start" | "end"
 *   hideBelow   "lg" | "xl" — drop low-priority columns on narrower screens
 *               instead of scrolling sideways (which would break the sticky
 *               header)
 *   mobile      "primary" | "meta" | "end" | "hidden" — where the cell goes
 *               in the stacked-card layout below `md`
 */

const HIDE = { lg: "max-lg:hidden", xl: "max-xl:hidden" };
const MOBILE = {
  primary: "max-md:col-start-1 max-md:row-start-1",
  meta: "max-md:col-start-1",
  end: "max-md:col-start-2 max-md:row-span-3 max-md:row-start-1 max-md:self-center max-md:justify-self-end",
  hidden: "max-md:hidden",
};

const nextSort = (column, current) => {
  const options = [column.sortKeys?.asc, column.sortKeys?.desc].filter(Boolean);
  if (options.length === 0) return current;
  const at = options.indexOf(current);
  return at === -1 ? options[0] : options[(at + 1) % options.length];
};

const ariaSort = (column, current) => {
  if (current && current === column.sortKeys?.asc) return "ascending";
  if (current && current === column.sortKeys?.desc) return "descending";
  return column.sortKeys ? "none" : undefined;
};

/**
 * The admin list. A real <table> on desktop — sticky header, sortable
 * columns, hover rows — that becomes stacked cards below `md`.
 *
 * Rows are memoised. RTK Query keeps unchanged rows' object identity across
 * refetches, so when one learner is suspended only that row re-renders; a
 * `pendingIds` Set dims just the rows with an action in flight.
 *
 * Make the primary cell a <RowLink> and the whole row becomes clickable (a
 * stretched link, so middle-click and "open in new tab" still work); put
 * actions in a cell with `className="relative z-10"` — RowActions already is.
 */
export default function DataTable({
  columns,
  rows,
  getRowId = (row) => row.id,
  isLoading = false,
  isFetching = false,
  skeletonRows = 6,
  sort,
  onSortChange,
  onRowPrefetch,
  pendingIds,
  empty,
  caption,
  className,
}) {
  const showSkeleton = isLoading;
  const dim = isFetching && !isLoading;

  return (
    <div
      className={cx(
        "overflow-clip rounded-[24px] bg-surface-elevated ring-1 ring-inset ring-border/70 shadow-elevate",
        className,
      )}
    >
      <table className="w-full border-separate border-spacing-0 text-left max-md:block md:table-fixed">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className="max-md:hidden">
          <tr>
            {columns.map((column) => {
              const sorted = ariaSort(column, sort);
              return (
                <th
                  key={column.id}
                  scope="col"
                  aria-sort={sorted}
                  style={column.width ? { width: column.width } : undefined}
                  className={cx(
                    "sticky top-0 z-[2] border-b border-border bg-surface-elevated/95 px-4 py-3 backdrop-blur-md first:pl-5 last:pr-5",
                    "caps text-[10.5px] font-bold text-text-muted",
                    column.align === "end" && "text-right",
                    HIDE[column.hideBelow],
                  )}
                >
                  {column.sortKeys && onSortChange ? (
                    <button
                      type="button"
                      onClick={() => onSortChange(nextSort(column, sort))}
                      className={cx(
                        "group/sort focus-ring -mx-1.5 inline-flex cursor-pointer items-center gap-1 rounded-md px-1.5 py-0.5 uppercase transition-colors duration-200 hover:text-text-primary",
                        sorted && sorted !== "none" && "text-text-primary",
                      )}
                    >
                      {column.header}
                      <Icon
                        name={sorted === "descending" ? "arrowDown" : sorted === "ascending" ? "arrowUp" : "arrowUpDown"}
                        className={cx(
                          "h-3.5 w-3.5 transition-opacity duration-200",
                          sorted === "none" ? "opacity-40 group-hover/sort:opacity-100" : "text-accent",
                        )}
                        strokeWidth={2.25}
                      />
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody
          aria-busy={isFetching || undefined}
          className={cx("transition-opacity duration-200 max-md:block", dim && "opacity-70 delay-100")}
        >
          {showSkeleton ? (
            Array.from({ length: skeletonRows }, (_, i) => <SkeletonRow key={i} columns={columns} />)
          ) : rows.length === 0 ? (
            <tr className="max-md:block">
              <td colSpan={columns.length} className="p-3 max-md:block">
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((row) => {
              const id = getRowId(row);
              return (
                <Row
                  key={id}
                  row={row}
                  columns={columns}
                  pending={pendingIds?.has(id) ?? false}
                  onPrefetch={onRowPrefetch}
                />
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

const Row = memo(function Row({ row, columns, pending, onPrefetch }) {
  return (
    <tr
      aria-busy={pending || undefined}
      onPointerEnter={onPrefetch ? () => onPrefetch(row) : undefined}
      onFocus={onPrefetch ? () => onPrefetch(row) : undefined}
      className={cx(
        "group/row relative transition-[background-color,opacity] duration-200 hover:bg-surface-hover/50 focus-within:bg-surface-hover/50",
        "max-md:grid max-md:grid-cols-[minmax(0,1fr)_auto] max-md:items-center max-md:gap-x-3 max-md:gap-y-1.5 max-md:border-b max-md:border-border-muted max-md:px-4 max-md:py-3.5 max-md:last:border-b-0",
        pending && "pointer-events-none opacity-55",
      )}
    >
      {columns.map((column) => (
        <td
          key={column.id}
          className={cx(
            "border-b border-border-muted px-4 py-3.5 align-middle text-sm text-text-primary group-last/row:border-b-0 first:pl-5 last:pr-5",
            "max-md:flex max-md:min-w-0 max-md:items-center max-md:border-0 max-md:p-0 max-md:first:pl-0 max-md:last:pr-0",
            column.align === "end" && "text-right md:[&>*]:ml-auto",
            HIDE[column.hideBelow],
            MOBILE[column.mobile ?? "meta"],
            column.className,
          )}
        >
          {column.cell(row, { pending })}
        </td>
      ))}
    </tr>
  );
});

function SkeletonRow({ columns }) {
  return (
    <tr aria-hidden className="max-md:block max-md:px-4 max-md:py-4">
      {columns.map((column, i) => (
        <td
          key={column.id}
          className={cx(
            "border-b border-border-muted px-4 py-4 first:pl-5 last:pr-5 max-md:block max-md:border-0 max-md:p-0 max-md:py-1",
            HIDE[column.hideBelow],
            i > 1 && "max-md:hidden",
          )}
        >
          {i === 0 ? (
            <span className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
              <span className="flex-1">
                <Skeleton className="h-3.5 w-2/3" />
                <Skeleton className="mt-2 h-3 w-1/2" />
              </span>
            </span>
          ) : (
            <Skeleton className={cx("h-3.5", column.align === "end" ? "ml-auto w-8" : "w-3/5")} />
          )}
        </td>
      ))}
    </tr>
  );
}

/**
 * The primary cell's link. Its `::after` covers the whole row, so the row is
 * clickable while staying a real link (middle-click, ⌘-click, "copy link").
 */
export function RowLink({ to, children, className }) {
  return (
    <Link
      to={to}
      className={cx(
        "min-w-0 outline-none after:absolute after:inset-0 after:rounded-[inherit] after:content-[''] focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-ring",
        className,
      )}
    >
      {children}
    </Link>
  );
}
