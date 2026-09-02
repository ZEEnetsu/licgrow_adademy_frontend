import { NavLink } from "react-router-dom";

import { useGetMyBatchesQuery } from "../../app/apis/batches.api.js";
import { getUserMessage } from "../../app/apis/apiError.js";

/**
 * Batches I belong to — `api-contracts/06-batch.md` §13.
 *
 * Membership is the platform's access boundary: everything a learner can read
 * or attempt hangs off this list.
 */
const MyBatches = () => {
  const { data: batches = [], isLoading, isError, error } = useGetMyBatchesQuery();

  if (isLoading) {
    return <p className="text-text-muted text-sm">Loading your batches…</p>;
  }

  if (isError) {
    return (
      <p className="text-danger text-sm">
        Couldn&apos;t load your batches — {getUserMessage(error)}
      </p>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-text-primary">My batches</h1>

      {batches.length === 0 ? (
        <div className="mt-6 rounded-lg border border-border-muted p-6">
          <p className="text-text-muted">
            You are not a member of any batch yet.
          </p>
          <NavLink
            to="/student/browse"
            className="inline-block mt-3 text-sm text-accent hover:underline"
          >
            Browse batches open for enrollment →
          </NavLink>
        </div>
      ) : (
        <div className="grid gap-4 mt-6 md:grid-cols-2">
          {batches.map((batch) => (
            <NavLink
              key={batch.id}
              to={`/student/batches/${batch.id}`}
              className="rounded-lg border border-border-muted bg-surface hover:bg-surface-hover transition-colors p-5"
            >
              <p className="font-semibold text-text-primary">{batch.name}</p>
              <p className="text-xs text-text-muted mt-1">
                {batch.startDate} → {batch.endDate}
              </p>
              <div className="flex gap-4 text-xs text-text-muted mt-3">
                <span>{batch.counts?.courses ?? 0} courses</span>
                <span>{batch.counts?.tests ?? 0} tests</span>
              </div>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBatches;
