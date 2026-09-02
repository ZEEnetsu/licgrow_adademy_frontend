import DashboardCompLayout from "../../layouts/DashboardCompLayout.jsx";
import { getUserMessage } from "../../app/apis/apiError.js";

/**
 * The loading / failed / empty triad that every data-backed page was writing
 * out by hand — three near-identical early returns before the real markup.
 *
 * Putting it here does two things beyond saving keystrokes: error copy is
 * phrased the same way everywhere (and always goes through `getUserMessage`,
 * so a raw server code can never leak into the page), and the page below it
 * only ever runs with data in hand. That is what lets the presenter be a pure
 * function of a view-model instead of a component full of `data?.` guards.
 *
 * @example
 * const query = useGetPlatformAnalyticsQuery();
 * return (
 *   <QueryBoundary query={query} label="analytics">
 *     {(data) => <DashboardView {...toViewModel(data)} />}
 *   </QueryBoundary>
 * );
 */
const QueryBoundary = ({
  query,
  label = "data",
  as: Wrapper = DashboardCompLayout,
  isEmpty,
  empty = null,
  children,
}) => {
  const { data, isLoading, isError, error } = query;

  if (isError) {
    return (
      <Wrapper>
        <p className="text-danger text-sm">
          Couldn&apos;t load {label} — {getUserMessage(error)}
        </p>
      </Wrapper>
    );
  }

  // `isLoading` is false for a skipped or not-yet-started query, so the absence
  // of data is the honest test — otherwise `children` runs with `undefined`.
  if (isLoading || data === undefined) {
    return (
      <Wrapper>
        <p className="text-text-muted text-sm">Loading {label}…</p>
      </Wrapper>
    );
  }

  if (isEmpty?.(data)) return <Wrapper>{empty}</Wrapper>;

  return children(data);
};

export default QueryBoundary;
