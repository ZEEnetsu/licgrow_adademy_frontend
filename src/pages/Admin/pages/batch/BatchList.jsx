import { memo, useCallback, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";

import Icon from "../../../../components/ui/Icon.jsx";
import Can from "../../../../components/auth/Can.jsx";
import {
  Button,
  Card,
  CardGrid,
  EmptyState,
  LoadError,
  PageHeader,
  Pagination,
  SearchInput,
  SegmentedTabs,
  Skeleton,
  StatusBadge,
  Toolbar,
  cx,
  useClampPage,
  useListParams,
  useModalParam,
} from "../../../../components/admin";
import { formatRange, plural } from "../../../../components/admin/format.js";
import { selectCan } from "../../../../app/features/auth/auth.selectors.js";
import { PERMISSIONS } from "../../../../app/features/auth/permissions.js";
import batchesApi, { BATCH_STATUS, useGetBatchesQuery } from "../../../../app/apis/batches.api.js";
import CreateBatchForm from "./CreateBatchForm.jsx";

/**
 * Batch list — `api-contracts/06-batch.md` §2.
 *
 *   PageHeader → Toolbar (status tabs + search) → CardGrid → Pagination
 *
 * Follows the reference list (LearnerList): state lives in the URL through
 * useListParams (?status, ?q, ?page), the grid keeps the previous page on
 * screen while the next loads, and hovering a card prefetches the batch.
 *
 * `status` and `enrollmentOpen` are independent, so every card shows both: an
 * active batch with enrollment closed is invisible to learners who aren't
 * members yet (§12), and that is worth seeing at a glance.
 *
 * "New batch" opens the create dialog through `?new=1`, which is how the
 * dashboard and the command palette link straight to it.
 */

const TABS = [
  { value: null, label: "All" },
  { value: BATCH_STATUS.DRAFT, label: "Draft" },
  { value: BATCH_STATUS.ACTIVE, label: "Active" },
  { value: BATCH_STATUS.ARCHIVED, label: "Archived" },
];

// card grids page by 24 (divisible by 2, 3 and 4 columns)
const PAGE_SIZE = 24;

const BatchList = () => {
  // §2 documents no sort parameter, so none is sent
  const list = useListParams({ filters: { status: null }, limit: PAGE_SIZE });
  const { data, isLoading, isFetching, isError, error, refetch } = useGetBatchesQuery(list.args);
  const items = data?.items ?? [];
  useClampPage(data?.meta, list.page, list.setPage);

  const can = useSelector(selectCan);
  const canManage = can(PERMISSIONS.BATCH_MANAGE);
  const [creating, openCreate, closeCreate] = useModalParam("new");
  const [, setParams] = useSearchParams();

  // warm the cache for the batch a card is about to open
  const prefetchBatch = batchesApi.usePrefetch("getBatch");
  const onPrefetch = useCallback((id) => prefetchBatch(id, { ifOlderThan: 60 }), [prefetchBatch]);

  // and the next page, so "Next" is instant
  const prefetchList = batchesApi.usePrefetch("getBatches");
  useEffect(() => {
    if (data?.meta?.hasNext) prefetchList({ ...list.args, page: list.page + 1 }, { ifOlderThan: 30 });
  }, [data?.meta?.hasNext, list.args, list.page, prefetchList]);

  const clearFilters = () =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        ["status", "q", "page"].forEach((key) => next.delete(key));
        return next;
      },
      { replace: true },
    );

  // "draft", "active"… — undefined on the All tab
  const statusLabel = list.filters.status
    ? TABS.find((tab) => tab.value === list.filters.status)?.label.toLowerCase()
    : undefined;

  return (
    <>
      <PageHeader
        eyebrow="Learning"
        title="Batches"
        description="The cohorts learners join to reach your courses and tests. Each one starts as a draft: add published content, activate it, then open enrollment."
        actions={
          <Can perm={PERMISSIONS.BATCH_MANAGE}>
            <Button variant="primary" icon="plus" onClick={openCreate}>
              New batch
            </Button>
          </Can>
        }
      />

      <Toolbar
        isFetching={isFetching && !isLoading}
        start={
          <SegmentedTabs
            layoutId="batch-status"
            ariaLabel="Filter batches by status"
            items={TABS}
            value={list.filters.status}
            onChange={(value) => list.setFilter("status", value)}
          />
        }
        end={
          <SearchInput
            label="Search batches"
            placeholder="Search batch names…"
            value={list.search.value}
            onChange={list.search.onChange}
            isSearching={list.search.isPending || (isFetching && Boolean(list.search.committed))}
          />
        }
      />

      {isError ? (
        <LoadError what="batches" error={error} onRetry={refetch} />
      ) : isLoading ? (
        <div aria-busy>
          <span className="sr-only">Loading batches</span>
          <CardGrid cols={3}>
            {Array.from({ length: 6 }, (_, i) => (
              <BatchCardSkeleton key={i} />
            ))}
          </CardGrid>
        </div>
      ) : items.length === 0 ? (
        list.isFiltered ? (
          <EmptyState
            icon="search"
            title="No batches match"
            description={
              list.search.committed
                ? statusLabel
                  ? `No ${statusLabel} batch names contain “${list.search.committed}”.`
                  : `No batch names contain “${list.search.committed}”.`
                : statusLabel
                  ? `There are no ${statusLabel} batches right now.`
                  : "No batches have this status."
            }
            action={
              <Button variant="secondary" icon="x" onClick={clearFilters}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon="layers"
            title="No batches yet"
            description="A batch is the cohort learners join. Create one, add published courses or tests, then open enrollment."
            action={
              canManage && (
                <Button variant="tonal" icon="plus" onClick={openCreate}>
                  Create your first batch
                </Button>
              )
            }
          />
        )
      ) : (
        <div className="flex flex-col gap-6">
          <div
            aria-busy={isFetching || undefined}
            className={cx("transition-opacity duration-200", isFetching && "opacity-70 delay-100")}
          >
            <CardGrid cols={3}>
              {items.map((batch) => (
                <BatchCard key={batch.id} batch={batch} onPrefetch={onPrefetch} />
              ))}
            </CardGrid>
          </div>
          <Pagination meta={data?.meta} onPageChange={list.setPage} itemLabel="batches" isFetching={isFetching} />
        </div>
      )}

      <CreateBatchForm open={creating && canManage} onClose={closeCreate} />
    </>
  );
};

export default BatchList;

/* ── card ───────────────────────────────────────────────────────────────── */

const COUNTS = [
  { key: "courses", icon: "book", one: "course", many: "courses" },
  { key: "tests", icon: "clipboardCheck", one: "test", many: "tests" },
  { key: "members", icon: "users", one: "member", many: "members" },
];

/**
 * One batch. The whole card is the link to its detail page, so middle-click
 * and "open in new tab" work; hover or focus prefetches it.
 */
const BatchCard = memo(function BatchCard({ batch, onPrefetch }) {
  const counts = batch.counts ?? {};
  return (
    <Card
      as={Link}
      to={`/admin/manage-batch/${batch.id}`}
      interactive
      onPointerEnter={() => onPrefetch(batch.id)}
      onFocus={() => onPrefetch(batch.id)}
      className="flex h-full flex-col gap-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <StatusBadge status={batch.status} size="sm" />
          <StatusBadge status={batch.enrollmentOpen ? "enrollmentOpen" : "enrollmentClosed"} size="sm" />
        </div>
        <span
          aria-hidden
          className="-mt-1 -mr-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface-muted text-text-muted transition-[transform,background-color,color] duration-500 ease-out-expo group-hover/card:rotate-45 group-hover/card:bg-accent-solid group-hover/card:text-accent-solid-contrast"
        >
          <Icon name="arrowUpRight" className="h-4 w-4" strokeWidth={2} />
        </span>
      </div>

      <div className="min-w-0">
        <h2 className="line-clamp-2 font-display text-lg leading-snug font-extrabold tracking-tight wrap-break-word text-text-primary transition-colors duration-200 group-hover/card:text-accent">
          {batch.name}
        </h2>
        <p className="mt-2 flex items-center gap-2 text-[13px] text-text-muted tabular-nums">
          <Icon name="calendar" className="h-4 w-4 shrink-0" />
          {formatRange(batch.startDate, batch.endDate)}
        </p>
      </div>

      <dl className="mt-auto grid grid-cols-3 gap-2 rounded-2xl bg-surface-muted p-2.5 ring-1 ring-inset ring-border/60">
        {COUNTS.map((count) => {
          const value = counts[count.key] ?? 0;
          return (
            <div key={count.key} className="flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-center">
              <dt className="flex items-center gap-1.5 text-text-muted">
                <Icon name={count.icon} className="h-3.5 w-3.5 shrink-0" />
                <span className="caps truncate text-[10px] font-bold">{count.many}</span>
              </dt>
              <dd className="font-display text-lg leading-none font-extrabold text-text-primary tabular-nums">
                <span aria-hidden>{value}</span>
                <span className="sr-only">{plural(value, count.one, count.many)}</span>
              </dd>
            </div>
          );
        })}
      </dl>
    </Card>
  );
});

function BatchCardSkeleton() {
  return (
    <Card aria-hidden className="flex flex-col gap-5">
      <div className="flex items-center gap-1.5">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-28 rounded-full" />
      </div>
      <div>
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="mt-3 h-3.5 w-2/5" />
      </div>
      <Skeleton className="h-16 w-full rounded-2xl" />
    </Card>
  );
}
