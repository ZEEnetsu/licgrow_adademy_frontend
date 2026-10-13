import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * The state of an admin list — page, search, filters, sort — kept in the URL.
 *
 * The URL is the state, so a filtered, sorted page 3 survives a reload, can be
 * shared as a link, and Back/Forward walk through pages. Default values are
 * left out of the URL to keep it clean.
 *
 *   const list = useListParams({
 *     filters: { status: null },              // param → default
 *     sorts: ["createdAt:desc", "fullName:asc"],
 *     defaultSort: "createdAt:desc",
 *   });
 *   const query = useGetLearnersQuery(list.args);
 *
 * History: changing a filter, the sort or the search REPLACES the entry and
 * resets to page 1; changing the page PUSHES, so Back goes to the last page.
 *
 * Search: the box updates instantly (`search.value`), but the URL — and so
 * the request — only follows after `debounceMs` of quiet, and only once the
 * query is empty or at least `minSearch` characters (the API contract's rule).
 * One request per pause, not per keystroke.
 *
 * `allowed` whitelists filter values (`{ status: ["active", "suspended"] }`):
 * a hand-edited or stale URL value falls back to the filter's default instead
 * of reaching the API.
 *
 * `args` is stable for equal params, ready to hand to an RTK Query hook.
 */
export function useListParams({ filters = {}, allowed = {}, sorts = [], defaultSort = null, limit = 20, minSearch = 2, debounceMs = 300 } = {}) {
  const [params, setParams] = useSearchParams();

  const page = Math.max(1, Number.parseInt(params.get("page"), 10) || 1);
  const committedQ = params.get("q") ?? "";
  const sortParam = params.get("sort");
  const sort = sortParam && sorts.includes(sortParam) ? sortParam : defaultSort;

  const filterKeys = Object.keys(filters);
  const filterValues = {};
  for (const key of filterKeys) {
    const raw = params.get(key);
    const ok = raw != null && (!allowed[key] || allowed[key].includes(raw));
    filterValues[key] = ok ? raw : filters[key];
  }

  // ── search draft ─────────────────────────────────────────────────────────
  // The draft remembers which committed query it was typed against. If the
  // URL's `q` changes from outside (Back, a link), the draft no longer matches
  // and the box shows the URL's value — derived, not synced in an effect.
  const [draft, setDraft] = useState({ value: committedQ, base: committedQ });
  const searchValue = draft.base === committedQ ? draft.value : committedQ;
  const trimmed = searchValue.trim();
  const searchIsValid = trimmed === "" || trimmed.length >= minSearch;

  useEffect(() => {
    if (!searchIsValid || trimmed === committedQ) return undefined;
    const timer = setTimeout(() => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (trimmed) next.set("q", trimmed);
          else next.delete("q");
          next.delete("page");
          return next;
        },
        { replace: true },
      );
      // keep what the user typed (trailing space and all) as the draft for
      // the new committed value
      setDraft((current) => ({ value: current.value, base: trimmed }));
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [trimmed, searchIsValid, committedQ, debounceMs, setParams]);

  const onSearchChange = useCallback(
    (value) => setDraft({ value, base: committedQ }),
    [committedQ],
  );

  // ── setters ──────────────────────────────────────────────────────────────
  const setPage = useCallback(
    (next, { replace = false } = {}) => {
      setParams(
        (prev) => {
          const out = new URLSearchParams(prev);
          if (next <= 1) out.delete("page");
          else out.set("page", String(next));
          return out;
        },
        { replace },
      );
    },
    [setParams],
  );

  // `filters` is usually an inline literal (a new object every render); its
  // serialised defaults are what the setter actually depends on
  const filtersKey = JSON.stringify(filters);
  const setFilter = useCallback(
    (key, value) => {
      const defaults = JSON.parse(filtersKey);
      setParams(
        (prev) => {
          const out = new URLSearchParams(prev);
          if (value == null || value === defaults[key]) out.delete(key);
          else out.set(key, value);
          out.delete("page");
          return out;
        },
        { replace: true },
      );
    },
    [setParams, filtersKey],
  );

  const setSort = useCallback(
    (value) => {
      setParams(
        (prev) => {
          const out = new URLSearchParams(prev);
          if (!value || value === defaultSort) out.delete("sort");
          else out.set("sort", value);
          out.delete("page");
          return out;
        },
        { replace: true },
      );
    },
    [setParams, defaultSort],
  );

  // ── query args ───────────────────────────────────────────────────────────
  const argsObject = { page, limit };
  if (committedQ) argsObject.q = committedQ;
  if (sort) argsObject.sort = sort;
  for (const key of filterKeys) {
    const value = filterValues[key];
    if (value != null && value !== "" && value !== "all") argsObject[key] = value;
  }
  const argsKey = JSON.stringify(argsObject);
  const args = useMemo(() => JSON.parse(argsKey), [argsKey]);

  return {
    page,
    setPage,
    limit,
    search: {
      value: searchValue,
      onChange: onSearchChange,
      committed: committedQ,
      // typed but not yet sent
      isPending: searchIsValid && trimmed !== committedQ,
    },
    filters: filterValues,
    setFilter,
    sort,
    setSort,
    args,
    isFiltered: Boolean(committedQ) || filterKeys.some((key) => filterValues[key] !== filters[key]),
  };
}

/**
 * After a delete empties the last page, step back to the new last page
 * instead of showing an empty one.
 */
export function useClampPage(meta, page, setPage) {
  useEffect(() => {
    if (meta && meta.totalPages >= 1 && page > meta.totalPages) {
      setPage(meta.totalPages, { replace: true });
    }
  }, [meta, page, setPage]);
}

export default useListParams;
