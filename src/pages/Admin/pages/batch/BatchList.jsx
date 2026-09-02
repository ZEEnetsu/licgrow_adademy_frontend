import { useState } from "react";
import { NavLink, useSearchParams } from "react-router-dom";

import DashboardCompLayout from "../../../../layouts/DashboardCompLayout.jsx";
import Btn from "../../components/Btn.jsx";
import Can from "../../../../components/auth/Can.jsx";
import ProtalLayout from "../../../../layouts/PortalLayput.jsx";
import CreateBatchForm from "./CreateBatchForm.jsx";
import { PERMISSIONS } from "../../../../app/features/auth/permissions.js";
import { getUserMessage } from "../../../../app/apis/apiError.js";
import {
  useGetBatchesQuery,
  BATCH_STATUS,
} from "../../../../app/apis/batches.api.js";

/**
 * Batch list — `api-contracts/06-batch.md` §2.
 *
 * `status` and `enrollmentOpen` are independent, so the card shows both: a
 * batch can be active with enrollment closed, and that distinction decides
 * whether learners can find it at all (§12).
 */

const TABS = [
  { label: "All", status: null },
  { label: "Draft", status: BATCH_STATUS.DRAFT },
  { label: "Active", status: BATCH_STATUS.ACTIVE },
  { label: "Archived", status: BATCH_STATUS.ARCHIVED },
];

const STATUS_TONE = {
  [BATCH_STATUS.ACTIVE]: "bg-success-muted text-success",
  [BATCH_STATUS.ARCHIVED]: "bg-danger-muted text-danger",
  [BATCH_STATUS.DRAFT]: "bg-surface-elevated-hover text-text-primary",
};

const BatchCard = ({ batch }) => (
  <NavLink
    to={batch.id}
    className="flex flex-col gap-3 rounded-lg border border-border-muted bg-surface hover:bg-surface-hover transition-colors p-4"
  >
    <div className="flex items-start justify-between gap-2">
      <p className="font-semibold text-text-primary leading-snug">
        {batch.name}
      </p>
      <span
        className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
          STATUS_TONE[batch.status] ?? STATUS_TONE.draft
        }`}
      >
        {batch.status}
      </span>
    </div>

    <p className="text-xs text-text-muted">
      {batch.startDate} → {batch.endDate}
    </p>

    <div className="flex items-center gap-4 text-xs text-text-muted">
      <span>{batch.counts?.courses ?? 0} courses</span>
      <span>{batch.counts?.tests ?? 0} tests</span>
      <span>{batch.counts?.members ?? 0} members</span>
    </div>

    <span
      className={`text-[10px] font-semibold uppercase tracking-wide ${
        batch.enrollmentOpen ? "text-accent" : "text-text-muted"
      }`}
    >
      {batch.enrollmentOpen ? "enrollment open" : "enrollment closed"}
    </span>
  </NavLink>
);

const BatchList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [creating, setCreating] = useState(false);

  const status = searchParams.get("status");
  const { data, isLoading, isError, error, isFetching } = useGetBatchesQuery(
    status ? { status } : undefined,
  );

  const batches = data?.items ?? [];

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

        <Can perm={PERMISSIONS.BATCH_MANAGE}>
          <div className="w-40">
            <Btn
              title="New batch"
              variant="secondary"
              size="sm"
              onClick={() => setCreating(true)}
            />
          </div>
        </Can>
      </div>

      {isLoading ? (
        <p className="text-text-muted text-sm">Loading batches…</p>
      ) : isError ? (
        <p className="text-danger text-sm">
          Couldn&apos;t load batches — {getUserMessage(error)}
        </p>
      ) : batches.length === 0 ? (
        <div>
          <p className="font-semibold text-text-muted">
            {status ? `No ${status} batches.` : "No batches yet."}
          </p>
          <p className="text-text-muted text-xs mt-1">
            A batch is the cohort learners join to reach your courses and tests.
          </p>
        </div>
      ) : (
        <div
          className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 ${
            isFetching ? "opacity-60 transition-opacity" : ""
          }`}
        >
          {batches.map((batch) => (
            <BatchCard key={batch.id} batch={batch} />
          ))}
        </div>
      )}

      {creating && (
        <ProtalLayout heading="New batch" onClose={() => setCreating(false)}>
          <CreateBatchForm onClose={() => setCreating(false)} />
        </ProtalLayout>
      )}
    </DashboardCompLayout>
  );
};

export default BatchList;
