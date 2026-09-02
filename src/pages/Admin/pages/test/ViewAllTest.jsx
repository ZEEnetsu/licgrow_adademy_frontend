import { useState } from "react";
import { NavLink } from "react-router-dom";

import { useGetTestsQuery } from "../../../../app/apis/tests.api.js";
import { getUserMessage } from "../../../../app/apis/apiError.js";
import DashboardCompLayout from "../../../../layouts/DashboardCompLayout.jsx";

/**
 * Flat, paginated list of every test — `api-contracts/09-test.md` §2.
 * Pagination follows conventions §6: `?page=&limit=` with a `meta` block.
 */

const LIMIT = 20;

const ViewAllTest = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error, isFetching } = useGetTestsQuery({
    page,
    limit: LIMIT,
    sort: "updatedAt:desc",
  });

  if (isLoading) {
    return (
      <DashboardCompLayout>
        <p className="text-text-muted">Loading tests…</p>
      </DashboardCompLayout>
    );
  }

  if (isError) {
    return (
      <DashboardCompLayout>
        <p className="text-danger">
          Couldn&apos;t load tests — {getUserMessage(error)}
        </p>
      </DashboardCompLayout>
    );
  }

  const tests = data?.items ?? [];
  const meta = data?.meta;

  return (
    <DashboardCompLayout>
      {tests.length === 0 ? (
        <p className="text-text-muted">No tests found.</p>
      ) : (
        <div
          className={`flex flex-col ${isFetching ? "opacity-60 transition-opacity" : ""}`}
        >
          {tests.map((test) => (
            <NavLink
              key={test.id}
              to={`/admin/manage-test/tests/${test.id}`}
              className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-baseline py-2 px-2 border-b border-border hover:bg-surface-elevated transition-colors text-sm"
            >
              <p className="font-medium truncate">{test.title}</p>
              <p className="text-text-muted text-xs">{test.kind}</p>
              <p className="text-text-muted text-xs">{test.status}</p>
              <p className="text-text-muted text-xs">
                {test.questionCount ?? 0} Q
              </p>
              <p className="text-text-muted text-xs">{test.totalMarks ?? 0} marks</p>
            </NavLink>
          ))}
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center gap-3 mt-4 text-xs text-text-muted">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!meta.hasPrev || isFetching}
            className="px-3 py-1 rounded-md bg-surface-elevated hover:bg-surface-elevated-hover disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span>
            Page {meta.page} of {meta.totalPages}
            <span className="text-text-muted"> · {meta.total} total</span>
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            disabled={!meta.hasNext || isFetching}
            className="px-3 py-1 rounded-md bg-surface-elevated hover:bg-surface-elevated-hover disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </DashboardCompLayout>
  );
};

export default ViewAllTest;
