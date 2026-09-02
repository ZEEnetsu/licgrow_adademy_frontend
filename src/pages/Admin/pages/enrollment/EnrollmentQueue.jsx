import { useState } from "react";
import { useSearchParams } from "react-router-dom";

import DashboardCompLayout from "../../../../layouts/DashboardCompLayout.jsx";
import Can from "../../../../components/auth/Can.jsx";
import { PERMISSIONS } from "../../../../app/features/auth/permissions.js";
import { getUserMessage } from "../../../../app/apis/apiError.js";
import {
  useApproveEnrollmentMutation,
  useGetEnrollmentsQuery,
  useRejectEnrollmentMutation,
  ENROLLMENT_STATUS,
} from "../../../../app/apis/enrollment.api.js";

/**
 * Enrollment review queue — `api-contracts/07-enrollment.md` §4–7.
 *
 * Approving is the ONLY way a batch member is created (06 §10), so this screen
 * is the write-side of everything the batch module reads.
 *
 * Only `pending` requests can be acted on. An already-approved request returns
 * its current state unchanged; an approved request cannot be rejected here —
 * the contract points at batch member removal instead.
 */

const TABS = [
  { label: "Pending", status: ENROLLMENT_STATUS.PENDING },
  { label: "Approved", status: ENROLLMENT_STATUS.APPROVED },
  { label: "Rejected", status: ENROLLMENT_STATUS.REJECTED },
  { label: "All", status: null },
];

const STATUS_TONE = {
  [ENROLLMENT_STATUS.APPROVED]: "bg-success-muted text-success",
  [ENROLLMENT_STATUS.REJECTED]: "bg-danger-muted text-danger",
  [ENROLLMENT_STATUS.PENDING]: "bg-warning-muted text-warning",
};

const EnrollmentQueue = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get("status") ?? ENROLLMENT_STATUS.PENDING;

  const [rejectingId, setRejectingId] = useState(null);
  const [reviewNote, setReviewNote] = useState("");
  const [actionError, setActionError] = useState(null);

  const { data, isLoading, isError, error, isFetching } = useGetEnrollmentsQuery(
    status === "all" ? undefined : { status },
  );

  const [approve, approveState] = useApproveEnrollmentMutation();
  const [reject, rejectState] = useRejectEnrollmentMutation();
  const busy = approveState.isLoading || rejectState.isLoading;

  const act = async (fn) => {
    setActionError(null);
    try {
      await fn().unwrap();
      setRejectingId(null);
      setReviewNote("");
    } catch (err) {
      setActionError(getUserMessage(err, "That review action was rejected."));
    }
  };

  const requests = data?.items ?? [];

  return (
    <DashboardCompLayout>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex flex-wrap gap-4 items-center">
          {TABS.map((tab) => {
            const value = tab.status ?? "all";
            return (
              <button
                key={tab.label}
                type="button"
                onClick={() => setSearchParams({ status: value })}
                className={`text-sm transition-colors cursor-pointer ${
                  status === value
                    ? "text-text-primary font-medium"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        {data?.meta && (
          <span className="text-xs text-text-muted">
            {data.meta.total} request{data.meta.total === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {isLoading ? (
        <p className="text-text-muted text-sm">Loading requests…</p>
      ) : isError ? (
        <p className="text-danger text-sm">
          Couldn&apos;t load the queue — {getUserMessage(error)}
        </p>
      ) : requests.length === 0 ? (
        <p className="text-text-muted text-sm">
          Nothing {status === "all" ? "here" : `${status}`} right now.
        </p>
      ) : (
        <div className={`flex flex-col gap-3 ${isFetching ? "opacity-60" : ""}`}>
          {requests.map((request) => (
            <div
              key={request.id}
              className="rounded-lg border border-border-muted bg-surface/50 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary">
                    {request.learner?.fullName ?? "Unknown learner"}
                    <span className="text-text-muted font-normal">
                      {" "}
                      → {request.batch?.name}
                    </span>
                  </p>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    {request.learner?.email} · submitted{" "}
                    {request.submittedAt?.slice(0, 10)}
                  </p>
                </div>
                <span
                  className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
                    STATUS_TONE[request.status] ?? ""
                  }`}
                >
                  {request.status}
                </span>
              </div>

              {/* the profile snapshot frozen at submit time (07 §1) */}
              {request.applicantSnapshot && (
                <div className="flex gap-4 mt-3 text-[11px] text-text-muted">
                  <span>Code: {request.applicantSnapshot.licAgentCode ?? "—"}</span>
                  <span>City: {request.applicantSnapshot.city ?? "—"}</span>
                  <span>
                    Experience: {request.applicantSnapshot.experienceYears ?? "—"}y
                  </span>
                </div>
              )}

              {request.motivation && (
                <p className="text-xs text-text-muted mt-3 border-l-2 border-border-muted pl-3">
                  {request.motivation}
                </p>
              )}

              {request.reviewNote && (
                <p className="text-[11px] text-danger mt-2">
                  Rejection note: {request.reviewNote}
                </p>
              )}

              {request.status === ENROLLMENT_STATUS.PENDING && (
                <Can perm={PERMISSIONS.ENROLLMENT_REVIEW}>
                  {rejectingId === request.id ? (
                    <div className="mt-4">
                      <textarea
                        rows={2}
                        maxLength={500}
                        placeholder="Reason shown to the learner (optional)"
                        value={reviewNote}
                        onChange={(event) => setReviewNote(event.target.value)}
                        className="w-full text-sm py-2 px-3 bg-bg rounded-md outline-none text-text-primary"
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            act(() =>
                              reject({
                                enrollmentId: request.id,
                                reviewNote: reviewNote.trim() || undefined,
                              }),
                            )
                          }
                          className="px-4 py-1.5 rounded-md text-sm bg-danger hover:bg-danger text-bg disabled:opacity-50 cursor-pointer"
                        >
                          Confirm rejection
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRejectingId(null);
                            setReviewNote("");
                          }}
                          className="px-4 py-1.5 rounded-md text-sm text-text-muted hover:text-text-primary cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2 mt-4">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => act(() => approve(request.id))}
                        className="px-4 py-1.5 rounded-md text-sm bg-accent text-accent-contrast font-medium hover:bg-accent-hover disabled:opacity-50 cursor-pointer"
                      >
                        Approve &amp; grant access
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => setRejectingId(request.id)}
                        className="px-4 py-1.5 rounded-md text-sm bg-surface hover:bg-surface-hover text-text-primary disabled:opacity-50 cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </Can>
              )}
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

export default EnrollmentQueue;
