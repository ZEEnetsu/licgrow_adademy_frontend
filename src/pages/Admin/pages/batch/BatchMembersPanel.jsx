import Can from "../../../../components/auth/Can.jsx";
import { PERMISSIONS } from "../../../../app/features/auth/permissions.js";
import { getUserMessage } from "../../../../app/apis/apiError.js";
import {
  useGetBatchMembersQuery,
  useRemoveBatchMemberMutation,
} from "../../../../app/apis/batches.api.js";

/**
 * Batch membership — `06-batch.md` §10–11.
 *
 * There is deliberately no "add member" action: v1 creates membership only
 * through enrollment approval (07-enrollment.md), so this panel is a roster
 * plus a revoke. Revoking sets `isActive:false` — the learner loses access but
 * their attempt history is retained, which is why revoked members stay listed.
 */
const BatchMembersPanel = ({ batchId, readOnly }) => {
  const { data, isLoading, isError, error } = useGetBatchMembersQuery({ batchId });
  const [removeMember, { isLoading: removing }] = useRemoveBatchMemberMutation();

  if (isLoading) {
    return <p className="text-text-muted text-sm">Loading members…</p>;
  }

  if (isError) {
    return (
      <p className="text-danger text-sm">
        Couldn&apos;t load members — {getUserMessage(error)}
      </p>
    );
  }

  const members = data?.items ?? [];

  if (members.length === 0) {
    return (
      <div>
        <p className="text-text-muted text-sm">No members yet.</p>
        <p className="text-text-muted text-xs mt-1">
          Learners join by requesting enrollment and being approved — there is
          no direct add-member action.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {members.map((member) => (
        <div
          key={member.learnerId}
          className="flex items-center gap-3 py-2 px-3 rounded-md bg-surface/50"
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm text-text-primary truncate">
              {member.fullName}
              {!member.isActive && (
                <span className="ml-2 text-[10px] uppercase tracking-wide text-danger">
                  revoked
                </span>
              )}
            </p>
            <p className="text-[11px] text-text-muted truncate">
              {member.email}
            </p>
          </div>

          <p className="text-[11px] text-text-muted shrink-0">
            joined {member.joinedAt?.slice(0, 10)}
          </p>

          {!readOnly && member.isActive && (
            <Can perm={PERMISSIONS.BATCH_MANAGE}>
              <button
                type="button"
                disabled={removing}
                onClick={() =>
                  removeMember({ batchId, learnerId: member.learnerId })
                }
                title="Revoke access — history is retained"
                className="text-xs text-text-muted hover:text-danger px-2 py-1 disabled:opacity-40 cursor-pointer"
              >
                revoke
              </button>
            </Can>
          )}
        </div>
      ))}
    </div>
  );
};

export default BatchMembersPanel;
