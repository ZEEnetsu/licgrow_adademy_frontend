import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import Can from "../../../../components/auth/Can.jsx";
import {
  Avatar,
  Button,
  DataTable,
  EmptyState,
  LoadError,
  Pagination,
  RowActions,
  RowLink,
  StatusBadge,
  useClampPage,
  useConfirm,
  usePendingIds,
  useToast,
} from "../../../../components/admin";
import { formatDate } from "../../../../components/admin/format.js";
import { selectCan } from "../../../../app/features/auth/auth.selectors.js";
import { PERMISSIONS } from "../../../../app/features/auth/permissions.js";
import { getUserMessage } from "../../../../app/apis/apiError.js";
import learnerApi from "../../../../app/apis/learner.api.js";
import batchesApi, {
  BATCH_STATUS,
  useGetBatchMembersQuery,
  useRemoveBatchMemberMutation,
} from "../../../../app/apis/batches.api.js";

/**
 * Batch membership — `06-batch.md` §10–11.
 *
 * There is deliberately no "add member" action: v1 creates membership only
 * through enrollment approval (07-enrollment.md), so this is a roster plus a
 * revoke. Revoking sets `isActive:false` — the learner loses access but keeps
 * their attempt history — which is why revoked members stay listed.
 *
 * The page number is local state, not `?page`, so it can't leak between the
 * detail page's tabs.
 */

const PAGE_SIZE = 20;

/** Why the roster is empty, and what would change that. */
const emptyCopy = (batch) => {
  if (batch.status === BATCH_STATUS.ARCHIVED) return "Nobody joined this batch before it was archived.";
  if (batch.status !== BATCH_STATUS.ACTIVE)
    return "Learners can ask to join once the batch is active and enrollment is open. There's no way to add someone directly.";
  if (!batch.enrollmentOpen) return "Open enrollment so learners can ask to join. There's no way to add someone directly.";
  return "Learners join by asking to enroll and being approved. There's no way to add someone directly.";
};

const NOT_FOUND_COPY = "They're no longer an active member of this batch.";

/** For a confirm dialog's `onConfirm`: it shows `getUserMessage(error)` inline. */
const asUserSafe = (message) => Object.assign(new Error(message), { userSafe: true, code: "BATCH_ACTION_FAILED" });

export default function BatchMembersPanel({ batch, canManage, readOnly }) {
  const batchId = batch.id;
  const [page, setPage] = useState(1);
  const args = useMemo(() => ({ batchId, page, limit: PAGE_SIZE }), [batchId, page]);
  const { data, isLoading, isFetching, isError, error, refetch } = useGetBatchMembersQuery(args);
  const rows = data?.items ?? [];
  useClampPage(data?.meta, page, setPage);

  const can = useSelector(selectCan);
  const canOpenLearner = can(PERMISSIONS.LEARNER_READ);
  const canRevoke = canManage && !readOnly;
  const confirm = useConfirm();
  const toast = useToast();
  const { pendingIds, run } = usePendingIds();
  const [removeMember] = useRemoveBatchMemberMutation();

  // the next page, so "Next" is instant
  const prefetchMembers = batchesApi.usePrefetch("getBatchMembers");
  useEffect(() => {
    if (data?.meta?.hasNext) prefetchMembers({ ...args, page: args.page + 1 }, { ifOlderThan: 30 });
  }, [data?.meta?.hasNext, args, prefetchMembers]);

  // and the learner a row is about to open
  const prefetchLearner = learnerApi.usePrefetch("getLearner");
  const onRowPrefetch = useCallback(
    (member) => prefetchLearner(member.learnerId, { ifOlderThan: 60 }),
    [prefetchLearner],
  );

  const onRevoke = useCallback(
    async (member) => {
      const done = await confirm({
        title: `Revoke ${member.fullName}'s membership?`,
        description: `They lose access to ${batch.name}'s courses and tests straight away. Their attempts and scores are kept.`,
        confirmLabel: "Revoke membership",
        tone: "danger",
        icon: "userX",
        onConfirm: () =>
          run(member.learnerId, async () => {
            try {
              await removeMember({ batchId, learnerId: member.learnerId }).unwrap();
            } catch (err) {
              throw asUserSafe(
                getUserMessage(err, err?.code === "NOT_FOUND" ? NOT_FOUND_COPY : "Couldn't revoke the membership. Please try again."),
              );
            }
          }),
      });
      if (done) toast.success(`${member.fullName} no longer has access to ${batch.name}`);
    },
    [confirm, run, removeMember, batchId, batch.name, toast],
  );

  const columns = useMemo(
    () => [
      {
        id: "member",
        header: "Member",
        mobile: "primary",
        cell: (member) => {
          const name = (
            <>
              <span className="block truncate font-semibold text-text-primary transition-colors duration-200 group-hover/row:text-accent">
                {member.fullName}
              </span>
              <span className="block truncate text-[13px] text-text-muted">{member.email ?? "No email"}</span>
            </>
          );
          return (
            <span className="flex min-w-0 items-center gap-3">
              <Avatar name={member.fullName} />
              {canOpenLearner ? (
                <RowLink to={`/admin/manage-users/${member.learnerId}`} className="min-w-0">
                  {name}
                </RowLink>
              ) : (
                <span className="min-w-0">{name}</span>
              )}
            </span>
          );
        },
      },
      {
        id: "status",
        header: "Access",
        width: "9rem",
        cell: (member) => <StatusBadge status={member.isActive ? "active" : "revoked"} />,
      },
      {
        id: "joined",
        header: "Joined",
        width: "9.5rem",
        cell: (member) => (
          <span className="text-[13px] text-text-muted tabular-nums md:text-sm">
            <span className="md:sr-only">Joined </span>
            {formatDate(member.joinedAt)}
          </span>
        ),
      },
      ...(canRevoke
        ? [
            {
              id: "actions",
              header: <span className="sr-only">Actions</span>,
              width: "4.5rem",
              align: "end",
              mobile: "end",
              className: "relative z-10",
              cell: (member) => (
                <RowActions
                  label={`Actions for ${member.fullName}`}
                  items={[
                    {
                      id: "revoke",
                      label: "Revoke membership",
                      description: "Ends access; history is kept",
                      icon: "userX",
                      tone: "danger",
                      hidden: !member.isActive,
                      onSelect: () => onRevoke(member),
                    },
                  ]}
                />
              ),
            },
          ]
        : []),
    ],
    [canOpenLearner, canRevoke, onRevoke],
  );

  if (isError) return <LoadError what="members" error={error} onRetry={refetch} />;

  return (
    <div className="flex flex-col gap-4">
      <DataTable
        caption={`Members of ${batch.name}`}
        columns={columns}
        rows={rows}
        getRowId={(member) => member.learnerId}
        isLoading={isLoading}
        isFetching={isFetching}
        onRowPrefetch={canOpenLearner ? onRowPrefetch : undefined}
        pendingIds={pendingIds}
        skeletonRows={4}
        empty={
          <EmptyState
            compact
            icon="users"
            title="No members yet"
            description={emptyCopy(batch)}
            action={
              batch.status === BATCH_STATUS.ACTIVE &&
              batch.enrollmentOpen && (
                <Can perm={PERMISSIONS.ENROLLMENT_REVIEW}>
                  <Button to={`/admin/enrollments?batchId=${batchId}`} variant="secondary" iconRight="arrowRight">
                    Review requests
                  </Button>
                </Can>
              )
            }
          />
        }
      />
      <Pagination meta={data?.meta} onPageChange={setPage} itemLabel="members" isFetching={isFetching} />
    </div>
  );
}
