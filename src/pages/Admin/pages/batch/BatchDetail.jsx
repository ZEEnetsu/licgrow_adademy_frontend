import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import DashboardCompLayout from "../../../../layouts/DashboardCompLayout.jsx";
import Btn from "../../components/Btn.jsx";
import Can from "../../../../components/auth/Can.jsx";
import BatchContentPanel from "./BatchContentPanel.jsx";
import BatchMembersPanel from "./BatchMembersPanel.jsx";
import { PERMISSIONS } from "../../../../app/features/auth/permissions.js";
import { getUserMessage } from "../../../../app/apis/apiError.js";
import {
  useArchiveBatchMutation,
  useGetBatchQuery,
  useUpdateBatchMutation,
  BATCH_STATUS,
} from "../../../../app/apis/batches.api.js";

/**
 * Batch detail — `api-contracts/06-batch.md` §3–11.
 *
 * Getting a batch live means clearing four gates in order, each with its own
 * error code:
 *
 *   publish the course/test        (08 §5 / 09 §6)
 *     -> add it to the batch       (06 §6, CONTENT_NOT_PUBLISHED)
 *       -> activate the batch      (06 §4, INVALID_STATUS_TRANSITION)
 *         -> open enrollment       (06 §4, requires active)
 *
 * An admin who cannot see which gate they are behind is stuck, so the panel
 * below names it explicitly rather than just disabling a button.
 */

const STATUS_TONE = {
  [BATCH_STATUS.ACTIVE]: "bg-success-muted text-success",
  [BATCH_STATUS.ARCHIVED]: "bg-danger-muted text-danger",
  [BATCH_STATUS.DRAFT]: "bg-surface-elevated-hover text-text-primary",
};

const TABS = [
  { id: "courses", label: "Courses" },
  { id: "tests", label: "Tests" },
  { id: "members", label: "Members" },
];

/** Which gate, if any, currently blocks going live. */
function nextGate(batch) {
  if (!batch || batch.status === BATCH_STATUS.ARCHIVED) return null;

  const hasContent =
    (batch.counts?.courses ?? 0) + (batch.counts?.tests ?? 0) > 0;

  if (batch.status === BATCH_STATUS.DRAFT && !hasContent) {
    return {
      blocked: true,
      label: "Publish a course or test into this batch",
      detail:
        "A batch cannot be activated while empty, and only content that is itself published may be added.",
    };
  }
  if (batch.status === BATCH_STATUS.DRAFT) {
    return {
      blocked: false,
      label: "Activate this batch",
      detail: "It has content, so it is ready to go live for members.",
    };
  }
  if (!batch.enrollmentOpen) {
    return {
      blocked: false,
      label: "Open enrollment",
      detail: "Learners can only discover this batch once enrollment is open.",
    };
  }
  return null;
}

const BatchDetail = () => {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState("courses");
  const [actionError, setActionError] = useState(null);

  const { data: batch, isLoading, isError, error } = useGetBatchQuery(batchId, {
    skip: !batchId,
  });

  const [updateBatch, updateState] = useUpdateBatchMutation();
  const [archiveBatch, archiveState] = useArchiveBatchMutation();

  const act = async (changes) => {
    setActionError(null);
    try {
      await updateBatch({ batchId, ...changes }).unwrap();
    } catch (err) {
      setActionError(getUserMessage(err, "That change was rejected."));
    }
  };

  if (isLoading) {
    return (
      <DashboardCompLayout>
        <p className="text-text-muted">Loading batch…</p>
      </DashboardCompLayout>
    );
  }

  if (isError || !batch) {
    return (
      <DashboardCompLayout>
        <p className="text-danger">
          Couldn&apos;t load this batch — {getUserMessage(error)}
        </p>
        <button
          type="button"
          onClick={() => navigate("/admin/manage-batch")}
          className="mt-3 text-sm text-accent underline cursor-pointer"
        >
          Back to batches
        </button>
      </DashboardCompLayout>
    );
  }

  const gate = nextGate(batch);
  const isArchived = batch.status === BATCH_STATUS.ARCHIVED;
  const busy = updateState.isLoading || archiveState.isLoading;

  return (
    <>
      <DashboardCompLayout>
        <button
          type="button"
          onClick={() => navigate("/admin/manage-batch")}
          className="mb-4 text-sm text-text-muted hover:text-text-primary cursor-pointer"
        >
          ← Back to batches
        </button>

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-semibold text-text-primary">
                {batch.name}
              </h1>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
                  STATUS_TONE[batch.status] ?? STATUS_TONE.draft
                }`}
              >
                {batch.status}
              </span>
              <span
                className={`text-[10px] font-semibold uppercase tracking-wide ${
                  batch.enrollmentOpen ? "text-accent" : "text-text-muted"
                }`}
              >
                {batch.enrollmentOpen ? "enrollment open" : "enrollment closed"}
              </span>
            </div>
            <p className="text-xs text-text-muted mt-1">
              {batch.startDate} → {batch.endDate}
            </p>
            {batch.description && (
              <p className="text-sm text-text-muted mt-2 max-w-prose">
                {batch.description}
              </p>
            )}
          </div>

          <div className="flex gap-4 text-xs text-text-muted shrink-0">
            <span>{batch.counts?.courses ?? 0} courses</span>
            <span>{batch.counts?.tests ?? 0} tests</span>
            <span>{batch.counts?.members ?? 0} members</span>
          </div>
        </div>

        {gate && (
          <div
            className={`mt-4 rounded-md border px-4 py-3 ${
              gate.blocked
                ? "bg-warning-muted border-warning/40"
                : "bg-surface-elevated border-border"
            }`}
          >
            <p
              className={`text-xs font-semibold ${
                gate.blocked ? "text-warning" : "text-text-primary"
              }`}
            >
              Next step — {gate.label}
            </p>
            <p className="text-[11px] text-text-muted mt-1">{gate.detail}</p>
          </div>
        )}

        <Can perm={PERMISSIONS.BATCH_MANAGE}>
          <div className="flex flex-wrap gap-3 mt-4 max-w-2xl">
            {batch.status === BATCH_STATUS.DRAFT && (
              <Btn
                title="Activate"
                variant="primary"
                size="sm"
                disabled={busy || gate?.blocked}
                onClick={() => act({ status: BATCH_STATUS.ACTIVE })}
              />
            )}
            {batch.status === BATCH_STATUS.ACTIVE && (
              <Btn
                title={
                  batch.enrollmentOpen ? "Close enrollment" : "Open enrollment"
                }
                variant="primary"
                size="sm"
                disabled={busy}
                onClick={() => act({ enrollmentOpen: !batch.enrollmentOpen })}
              />
            )}
            {!isArchived && (
              <Btn
                title={archiveState.isLoading ? "Archiving…" : "Archive"}
                variant="danger"
                size="sm"
                disabled={busy}
                onClick={() => archiveBatch(batchId)}
              />
            )}
          </div>
        </Can>

        {actionError && (
          <p className="mt-3 text-warning text-xs font-semibold">
            {actionError}
          </p>
        )}

        {isArchived && (
          <p className="mt-4 text-xs text-danger">
            This batch is archived. Enrollment is forced closed and it can no
            longer be edited.
          </p>
        )}
      </DashboardCompLayout>

      <DashboardCompLayout>
        <div className="flex gap-4 mb-4">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`text-sm transition-colors cursor-pointer ${
                tab === item.id
                  ? "text-text-primary font-medium"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {tab === "members" ? (
          <BatchMembersPanel batchId={batchId} readOnly={isArchived} />
        ) : (
          <BatchContentPanel batchId={batchId} kind={tab} readOnly={isArchived} />
        )}
      </DashboardCompLayout>
    </>
  );
};

export default BatchDetail;
