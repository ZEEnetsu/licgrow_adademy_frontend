import { useState } from "react";
import { NavLink, useSearchParams } from "react-router-dom";

import DashboardCompLayout from "../../../../layouts/DashboardCompLayout.jsx";
import Can from "../../../../components/auth/Can.jsx";
import { PERMISSIONS } from "../../../../app/features/auth/permissions.js";
import { getUserMessage } from "../../../../app/apis/apiError.js";
import {
  useGetLearnersQuery,
  useReactivateLearnerMutation,
  useSuspendLearnerMutation,
} from "../../../../app/apis/learner.api.js";

/**
 * Learner management — `api-contracts/02-learner.md` §5–8.
 *
 * Suspending blocks login and every access path (conventions §1), which is a
 * heavier action than revoking one batch membership — hence the confirm step.
 */

const TABS = [
  { label: "All", status: null },
  { label: "Active", status: "active" },
  { label: "Suspended", status: "suspended" },
];

const STATUS_TONE = {
  active: "bg-success-muted text-success",
  suspended: "bg-danger-muted text-danger",
  inactive: "bg-surface-elevated-hover text-text-primary",
};

const LearnerList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [confirming, setConfirming] = useState(null);
  const [actionError, setActionError] = useState(null);

  const status = searchParams.get("status");

  const params = {};
  if (status) params.status = status;
  // the contract requires ≥2 chars before searching
  if (query.trim().length >= 2) params.q = query.trim();

  const { data, isLoading, isError, error, isFetching } =
    useGetLearnersQuery(params);
    console.log(data);

  const [suspend, suspendState] = useSuspendLearnerMutation();
  const [reactivate, reactivateState] = useReactivateLearnerMutation();
  const busy = suspendState.isLoading || reactivateState.isLoading;

  const act = async (fn) => {
    setActionError(null);
    try {
      await fn().unwrap();
      setConfirming(null);
    } catch (err) {
      setActionError(getUserMessage(err, "That action was rejected."));
    }
  };

  const learners = data?.items ?? [];

  return (
    <DashboardCompLayout>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex flex-wrap gap-4 items-center">
          {TABS.map((tab) => (
            <button
              key={tab.label}
              type="button"
              onClick={() =>
                setSearchParams(tab.status ? { status: tab.status } : {})
              }
              className={`text-sm transition-colors cursor-pointer ${
                status === tab.status
                  ? "text-text-primary font-medium"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search name or email…"
          aria-label="Search learners"
          className="px-3 py-1.5 rounded-xl bg-surface-elevated text-sm outline-none text-text-secondary/50 placeholder:text-text-muted w-64"
        />
      </div>

      {isLoading ? (
        <p className="text-text-muted text-sm">Loading learners…</p>
      ) : isError ? (
        <p className="text-danger text-sm">
          Couldn&apos;t load learners — {getUserMessage(error)}
        </p>
      ) : learners.length === 0 ? (
        <p className="text-text-muted text-sm">
          {query.trim().length >= 2 ? "No matches." : "No learners yet."}
        </p>
      ) : (
        <div className={`flex flex-col gap-1 ${isFetching ? "opacity-60" : ""}`}>
          {learners.map((learner) => (
            <div
              key={learner.id}
              className="flex items-center gap-4 py-2 px-3 rounded-lg bg-surface-elevated shadow-elevate hover:bg-surface-elevated-hover hover:shadow-elevate-hover transition-[background-color,box-shadow] duration-200"
            >
              {/* the row opens the full profile; the actions below stay outside
                  the link so a click on them cannot navigate by accident */}
              <NavLink
                to={learner.id}
                className="min-w-0 flex-1 cursor-pointer"
                title="View full profile"
              >
                <p className="text-md text-text-primary truncate">
                  {learner.fullName}
                </p>
                <p className="text-[12px] text-text-muted truncate">
                  {learner.email}
                </p>
              </NavLink>

              <span
                className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
                  STATUS_TONE[learner.status] ?? STATUS_TONE.inactive
                }`}
              >
                {learner.status}
              </span>

              <Can perm={PERMISSIONS.LEARNER_SUSPEND}>
                {confirming === learner.id ? (
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => act(() => suspend({ learnerId: learner.id }))}
                      className="text-xs px-3 py-1 rounded bg-danger hover:bg-danger text-bg disabled:opacity-50 cursor-pointer"
                    >
                      Confirm suspend
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirming(null)}
                      className="text-xs px-2 py-1 text-text-muted hover:text-text-primary cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : learner.status === "active" ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setConfirming(learner.id)}
                    title="Blocks login and all access"
                    className="shrink-0 text-xs text-text-muted hover:text-danger dark:hover:text-danger px-2 py-1 disabled:opacity-40 cursor-pointer"
                  >
                    suspend
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => act(() => reactivate(learner.id))}
                    className="shrink-0 text-xs text-text-muted hover:text-accent px-2 py-1 disabled:opacity-40 cursor-pointer"
                  >
                    reactivate
                  </button>
                )}
              </Can>
            </div>
          ))}
        </div>
      )}

      {actionError && (
        <p className="mt-4 text-warning text-xs font-semibold">{actionError}</p>
      )}
    </DashboardCompLayout>
  );
};

export default LearnerList;
