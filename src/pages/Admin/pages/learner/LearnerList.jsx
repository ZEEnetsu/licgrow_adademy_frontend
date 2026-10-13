import { useCallback, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";

import {
  Avatar,
  DataTable,
  EmptyState,
  LoadError,
  PageHeader,
  Pagination,
  RowActions,
  RowLink,
  SearchInput,
  SegmentedTabs,
  StatusBadge,
  Toolbar,
  useClampPage,
  useConfirm,
  useListParams,
  usePendingIds,
  useToast,
} from "../../../../components/admin";
import { formatDate } from "../../../../components/admin/format.js";
import { selectCan } from "../../../../app/features/auth/auth.selectors.js";
import { PERMISSIONS } from "../../../../app/features/auth/permissions.js";
import { getUserMessage } from "../../../../app/apis/apiError.js";
import learnerApi, {
  useGetLearnersQuery,
  useReactivateLearnerMutation,
  useSuspendLearnerMutation,
} from "../../../../app/apis/learner.api.js";

/**
 * Learner management — `api-contracts/02-learner.md` §5–8.
 *
 * THE REFERENCE LIST PAGE. Every admin list follows this shape (see
 * docs/admin-ui-guidelines.md, "Lists"):
 *
 *   PageHeader → Toolbar (tabs + search) → DataTable → Pagination
 *
 *   · state lives in the URL via useListParams (?status, ?q, ?sort, ?page)
 *   · the table keeps the previous page on screen, dimmed, while the next loads
 *   · row actions run through usePendingIds, so only that row goes busy
 *   · destructive actions confirm; every outcome toasts
 *   · hovering a row prefetches the learner's profile
 *
 * Suspending blocks login and every access path (conventions §1), which is a
 * heavier action than revoking one batch membership — hence the confirm step.
 */

const TABS = [
  { value: null, label: "All" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
];

// the contract's sort whitelist (§5)
const SORTS = ["createdAt:desc", "fullName:asc"];

const LearnerList = () => {
  const list = useListParams({
    filters: { status: null },
    sorts: SORTS,
    defaultSort: "createdAt:desc",
  });
  const { data, isLoading, isFetching, isError, error, refetch } = useGetLearnersQuery(list.args);
  const items = data?.items ?? [];
  useClampPage(data?.meta, list.page, list.setPage);

  const can = useSelector(selectCan);
  const canSuspend = can(PERMISSIONS.LEARNER_SUSPEND);
  const confirm = useConfirm();
  const toast = useToast();
  const { pendingIds, run } = usePendingIds();
  const [suspend] = useSuspendLearnerMutation();
  const [reactivate] = useReactivateLearnerMutation();

  // warm the cache for the profile a row is about to open
  const prefetchLearner = learnerApi.usePrefetch("getLearner");
  const onRowPrefetch = useCallback((row) => prefetchLearner(row.id, { ifOlderThan: 60 }), [prefetchLearner]);

  // and for the next page, so "Next" is instant
  const prefetchList = learnerApi.usePrefetch("getLearners");
  useEffect(() => {
    if (data?.meta?.hasNext) prefetchList({ ...list.args, page: list.page + 1 }, { ifOlderThan: 30 });
  }, [data?.meta?.hasNext, list.args, list.page, prefetchList]);

  const onSuspend = useCallback(
    async (learner) => {
      const done = await confirm({
        title: `Suspend ${learner.fullName}?`,
        description:
          "They're signed out everywhere and can't sign in or reach any batch until reactivated. Their history and scores are kept.",
        confirmLabel: "Suspend learner",
        tone: "danger",
        icon: "userX",
        onConfirm: () => run(learner.id, () => suspend({ learnerId: learner.id }).unwrap()),
      });
      if (done) toast.success(`${learner.fullName} is suspended`);
    },
    [confirm, run, suspend, toast],
  );

  const onReactivate = useCallback(
    (learner) =>
      run(learner.id, async () => {
        try {
          await reactivate(learner.id).unwrap();
          toast.success(`${learner.fullName} is active again`, { description: "They can sign in and use their batches." });
        } catch (err) {
          toast.error(`Couldn't reactivate ${learner.fullName}`, { description: getUserMessage(err) });
        }
      }),
    [reactivate, run, toast],
  );

  const columns = useMemo(
    () => [
      {
        id: "learner",
        header: "Learner",
        sortKeys: { asc: "fullName:asc" },
        mobile: "primary",
        cell: (learner) => (
          <span className="flex min-w-0 items-center gap-3">
            <Avatar name={learner.fullName} />
            <RowLink to={learner.id} className="min-w-0">
              <span className="block truncate font-semibold text-text-primary transition-colors duration-200 group-hover/row:text-accent">
                {learner.fullName}
              </span>
              <span className="block truncate text-[13px] text-text-muted">{learner.email}</span>
            </RowLink>
          </span>
        ),
      },
      {
        id: "status",
        header: "Status",
        width: "9rem",
        cell: (learner) => <StatusBadge status={learner.status} />,
      },
      {
        id: "joined",
        header: "Joined",
        width: "10rem",
        hideBelow: "lg",
        sortKeys: { desc: "createdAt:desc" },
        cell: (learner) => <span className="text-text-muted tabular-nums">{formatDate(learner.createdAt)}</span>,
      },
      {
        id: "actions",
        header: <span className="sr-only">Actions</span>,
        width: "4.5rem",
        align: "end",
        mobile: "end",
        className: "relative z-10",
        cell: (learner) => (
          <RowActions
            label={`Actions for ${learner.fullName}`}
            items={[
              {
                id: "suspend",
                label: "Suspend learner",
                description: "Blocks sign-in and all access",
                icon: "userX",
                tone: "danger",
                hidden: !canSuspend || learner.status !== "active",
                onSelect: () => onSuspend(learner),
              },
              {
                id: "reactivate",
                label: "Reactivate learner",
                icon: "refresh",
                hidden: !canSuspend || learner.status === "active",
                onSelect: () => onReactivate(learner),
              },
            ]}
          />
        ),
      },
    ],
    [canSuspend, onSuspend, onReactivate],
  );

  const filtered = list.isFiltered;

  return (
    <>
      <PageHeader
        eyebrow="People"
        title="Learners"
        description="Everyone with a learner account. Open a profile for batches and test performance, or suspend an account to block all access."
      />

      <Toolbar
        isFetching={isFetching && !isLoading}
        start={
          <SegmentedTabs
            layoutId="learner-status"
            ariaLabel="Filter learners by status"
            items={TABS}
            value={list.filters.status}
            onChange={(value) => list.setFilter("status", value)}
          />
        }
        end={
          <SearchInput
            label="Search learners"
            placeholder="Search name or email…"
            value={list.search.value}
            onChange={list.search.onChange}
            isSearching={list.search.isPending || (isFetching && Boolean(list.search.committed))}
          />
        }
      />

      {isError ? (
        <LoadError what="learners" error={error} onRetry={refetch} />
      ) : (
        <div className="flex flex-col gap-4">
          <DataTable
            caption="Learners"
            columns={columns}
            rows={items}
            isLoading={isLoading}
            isFetching={isFetching}
            sort={list.sort}
            onSortChange={list.setSort}
            onRowPrefetch={onRowPrefetch}
            pendingIds={pendingIds}
            empty={
              filtered ? (
                <EmptyState
                  compact
                  icon="search"
                  title="No learners match"
                  description={list.search.committed ? `Nothing for “${list.search.committed}” with these filters.` : "No learners have this status."}
                />
              ) : (
                <EmptyState
                  icon="users"
                  title="No learners yet"
                  description="Learners appear here as soon as they register on the site."
                />
              )
            }
          />
          <Pagination meta={data?.meta} onPageChange={list.setPage} itemLabel="learners" isFetching={isFetching} />
        </div>
      )}
    </>
  );
};

export default LearnerList;
