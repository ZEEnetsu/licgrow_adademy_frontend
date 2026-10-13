import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";

import Icon from "../../../../components/ui/Icon.jsx";
import { EXPO } from "../../../../components/motion/primitives.js";
import { useDebouncedValue } from "../../../../hooks/useDebouncedValue.js";
import {
  Avatar,
  Button,
  Callout,
  Card,
  EmptyState,
  EntityCombobox,
  LoadError,
  PageHeader,
  Pagination,
  SegmentedTabs,
  SkeletonCard,
  StatusBadge,
  Toolbar,
  cx,
  statusMeta,
  useClampPage,
  useConfirm,
  useListParams,
  usePendingIds,
  useToast,
} from "../../../../components/admin";
import { formatDateTime, formatRange, plural, timeAgo } from "../../../../components/admin/format.js";
import { selectCan } from "../../../../app/features/auth/auth.selectors.js";
import { PERMISSIONS } from "../../../../app/features/auth/permissions.js";
import { getUserMessage } from "../../../../app/apis/apiError.js";
import enrollmentApi, {
  ENROLLMENT_STATUS,
  useApproveEnrollmentMutation,
  useGetEnrollmentsQuery,
  useRejectEnrollmentMutation,
} from "../../../../app/apis/enrollment.api.js";
import { useGetBatchQuery, useGetBatchesQuery } from "../../../../app/apis/batches.api.js";
import { PENDING_PREVIEW } from "../../queries.js";

/**
 * Enrollment review queue — `api-contracts/07-enrollment.md` §4–7.
 *
 *   PageHeader → Toolbar (status tabs, batch filter · sort) → request cards → Pagination
 *
 * Approving is the ONLY way a batch member is created (06 §10), so this screen
 * is the write side of everything the batch module reads. Only `pending`
 * requests can be acted on; a decided request is kept as a record.
 *
 * Requests are cards rather than table rows because the reviewer needs the
 * applicant's own words (motivation) and their profile snapshot side by side.
 *
 * Sort: the API defaults to newest first, but a review queue is worked oldest
 * first (first come, first served — the dashboard's preview agrees, see
 * `PENDING_PREVIEW`). Decided requests are a history, read newest first. So
 * the default sort follows the status tab, and an explicit choice in the URL
 * wins over both.
 */

const STATUS_TABS = [
  { value: ENROLLMENT_STATUS.PENDING, label: "Pending" },
  { value: ENROLLMENT_STATUS.APPROVED, label: "Approved" },
  { value: ENROLLMENT_STATUS.REJECTED, label: "Rejected" },
  { value: "all", label: "All" },
];
const STATUS_VALUES = STATUS_TABS.map((tab) => tab.value);

// the contract's sort whitelist (§4)
const OLDEST_FIRST = "submittedAt:asc";
const NEWEST_FIRST = "submittedAt:desc";
const SORTS = [OLDEST_FIRST, NEWEST_FIRST];
const SORT_TABS = [
  { value: OLDEST_FIRST, label: "Oldest first" },
  { value: NEWEST_FIRST, label: "Newest first" },
];

// 24 per page: divisible by the one- and two-column layouts
const PAGE_SIZE = 24;

const EMPTY_COPY = {
  approved: {
    title: "No approved requests yet",
    description: "Requests you approve are kept here as a record of who joined which batch.",
  },
  rejected: {
    title: "No declined requests",
    description: "Requests you decline are kept here, with the note the learner was sent.",
  },
  all: {
    title: "No enrollment requests yet",
    description: "Requests appear here as soon as learners apply to join a batch.",
  },
};

const EnrollmentQueue = () => {
  // the default sort depends on the status tab (see the note above)
  const [params] = useSearchParams();
  const rawStatus = params.get("status");
  const defaultSort = !rawStatus || rawStatus === ENROLLMENT_STATUS.PENDING ? OLDEST_FIRST : NEWEST_FIRST;

  const list = useListParams({
    filters: { status: ENROLLMENT_STATUS.PENDING, batchId: null },
    sorts: SORTS,
    defaultSort,
    limit: PAGE_SIZE,
  });

  // an unknown ?status= falls back to the queue rather than reaching the API
  const status = STATUS_VALUES.includes(list.filters.status) ? list.filters.status : ENROLLMENT_STATUS.PENDING;
  const queryArgs = useMemo(
    () => (status === list.filters.status ? list.args : { ...list.args, status }),
    [status, list.filters.status, list.args],
  );

  // the server says 403 without `enrollment:review`; say why instead of asking
  const can = useSelector(selectCan);
  const canReview = can(PERMISSIONS.ENROLLMENT_REVIEW);
  const canReadBatches = canReview && can(PERMISSIONS.BATCH_READ);
  const canReadLearners = can(PERMISSIONS.LEARNER_READ);

  const { data, isLoading, isFetching, isError, error, refetch } = useGetEnrollmentsQuery(queryArgs, { skip: !canReview });
  const items = data?.items ?? [];
  useClampPage(data?.meta, list.page, list.setPage);

  // the sidebar badge's query: same args, same cache entry, no extra request
  const { pendingTotal } = useGetEnrollmentsQuery(PENDING_PREVIEW, {
    skip: !canReview,
    selectFromResult: ({ data: preview }) => ({ pendingTotal: preview?.meta?.total }),
  });

  // and the next page, so "Next" is instant
  const prefetchList = enrollmentApi.usePrefetch("getEnrollments");
  useEffect(() => {
    if (data?.meta?.hasNext) prefetchList({ ...queryArgs, page: list.page + 1 }, { ifOlderThan: 30 });
  }, [data?.meta?.hasNext, queryArgs, list.page, prefetchList]);

  /* ── batch filter ─────────────────────────────────────────────────────── */

  const batchId = list.filters.batchId;
  const [batchSearch, setBatchSearch] = useState("");
  const batchQ = useDebouncedValue(batchSearch.trim(), 250);
  const batches = useGetBatchesQuery(
    { limit: 20, ...(batchQ.length >= 2 && { q: batchQ }) },
    { skip: !canReadBatches },
  );
  // the picked batch has to be named even when it isn't in the first 20
  // results (a reload, a shared link)
  const pickedBatch = useGetBatchQuery(batchId, { skip: !batchId || !canReadBatches });
  const selectedBatch = batchId
    ? pickedBatch.data ??
      batches.data?.items.find((batch) => batch.id === batchId) ??
      items.find((request) => request.batch?.id === batchId)?.batch ?? {
        id: batchId,
        name: pickedBatch.isError ? "Unknown batch" : "Loading batch…",
      }
    : null;

  const { setFilter } = list;
  const setBatch = useCallback((batch) => setFilter("batchId", batch?.id ?? null), [setFilter]);
  const clearBatch = useCallback(() => setFilter("batchId", null), [setFilter]);

  /* ── review actions ───────────────────────────────────────────────────── */

  const confirm = useConfirm();
  const toast = useToast();
  const { pendingIds, run } = usePendingIds();
  const [approve] = useApproveEnrollmentMutation();
  const [reject] = useRejectEnrollmentMutation();

  // a decision shows on its card at once, while the list refetches and the
  // request moves out of the queue
  const [decided, setDecided] = useState({});
  const markDecided = useCallback(
    (id, decision) => setDecided((current) => ({ ...current, [id]: decision })),
    [],
  );

  const onApprove = useCallback(
    (request) =>
      run(request.id, async () => {
        const name = request.learner?.fullName ?? "the learner";
        try {
          await approve(request.id).unwrap();
          markDecided(request.id, { status: ENROLLMENT_STATUS.APPROVED });
          toast.success(`Approved ${name}`, {
            description: request.batch ? `They're now a member of ${request.batch.name}.` : undefined,
          });
        } catch (err) {
          toast.error(`Couldn't approve ${name}`, {
            description: getUserMessage(
              err,
              err?.code === "ENROLLMENT_ALREADY_FINALIZED"
                ? "This request has already been declined. Refresh to see its latest state."
                : undefined,
            ),
          });
        }
      }),
    [approve, markDecided, run, toast],
  );

  const onDecline = useCallback(
    async (request) => {
      const name = request.learner?.fullName ?? "this learner";
      let note = "";
      const done = await confirm({
        title: `Decline ${name}'s request?`,
        description: `They'll see that their request${request.batch ? ` to join ${request.batch.name}` : ""} was declined, with your note, and can apply again later.`,
        confirmLabel: "Decline request",
        tone: "danger",
        icon: "userX",
        input: {
          label: "Note to the learner",
          placeholder: "e.g. This batch is full — please apply to the next one.",
          maxLength: 500,
        },
        onConfirm: (value) =>
          run(request.id, async () => {
            note = value;
            await reject({ enrollmentId: request.id, reviewNote: value || undefined }).unwrap();
            markDecided(request.id, { status: ENROLLMENT_STATUS.REJECTED, reviewNote: value || null });
          }),
      });
      if (done) {
        toast.success(`Declined ${name}'s request`, {
          description: note ? "They'll see your note with the decision." : "They can apply again later.",
        });
      }
    },
    [confirm, markDecided, reject, run, toast],
  );

  /* ── render ───────────────────────────────────────────────────────────── */

  const dim = isFetching && !isLoading;
  const statusTabs = STATUS_TABS.map((tab) =>
    tab.value === ENROLLMENT_STATUS.PENDING && pendingTotal > 0 ? { ...tab, count: pendingTotal } : tab,
  );

  let empty = null;
  if (status === ENROLLMENT_STATUS.PENDING && !batchId) {
    empty = (
      <EmptyState
        tone="mint"
        icon="checkCircle"
        title="Inbox zero"
        description="No enrollment requests are waiting for review. New ones appear here as learners apply."
        action={
          <Button variant="secondary" size="sm" iconRight="arrowRight" onClick={() => list.setFilter("status", "all")}>
            See past decisions
          </Button>
        }
      />
    );
  } else if (batchId) {
    const which = status === "all" ? "" : `${statusMeta(status).label.toLowerCase()} `;
    empty = (
      <EmptyState
        compact
        icon="search"
        title="No requests match"
        description={`There are no ${which}requests for ${selectedBatch?.name ?? "this batch"}.`}
        action={
          <Button variant="secondary" size="sm" icon="x" onClick={clearBatch}>
            Clear batch filter
          </Button>
        }
      />
    );
  } else {
    const copy = EMPTY_COPY[status] ?? EMPTY_COPY.all;
    empty = <EmptyState icon="inbox" title={copy.title} description={copy.description} />;
  }

  const header = (
    <PageHeader
      eyebrow="People"
      title="Enrollments"
      description="Learners asking to join a batch. Approving adds them to the batch straight away; declining lets them apply again later."
    />
  );

  if (!canReview) {
    return (
      <>
        {header}
        <EmptyState
          icon="lock"
          title="Enrollment review isn't part of your role"
          description="Reviewing requests needs the enrollment review permission. A super admin can add it to your role."
        />
      </>
    );
  }

  return (
    <>
      {header}

      <Toolbar
        isFetching={dim}
        start={
          <>
            <SegmentedTabs
              layoutId="enrollment-status"
              ariaLabel="Filter requests by status"
              items={statusTabs}
              value={status}
              onChange={(value) => list.setFilter("status", value)}
            />
            {canReadBatches && (
              <div className="w-full sm:w-72">
                  <EntityCombobox
                    aria-label="Filter by batch"
                    placeholder="All batches"
                    items={batches.data?.items}
                    isFetching={batches.isFetching}
                    search={batchSearch}
                    onSearchChange={setBatchSearch}
                    value={selectedBatch}
                    onChange={setBatch}
                    getLabel={(batch) => batch.name}
                    getDescription={(batch) =>
                      [statusMeta(batch.status).label, batch.startDate && formatRange(batch.startDate, batch.endDate)]
                        .filter(Boolean)
                        .join(" · ")
                    }
                    emptyText="No batches match"
                  />
              </div>
            )}
          </>
        }
        end={
          <SegmentedTabs
            size="sm"
            layoutId="enrollment-sort"
            ariaLabel="Sort requests"
            items={SORT_TABS}
            value={list.sort}
            onChange={list.setSort}
          />
        }
      />

      {isError ? (
        <LoadError what="enrollment requests" error={error} onRetry={refetch} />
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2" aria-busy>
          <span className="sr-only">Loading enrollment requests…</span>
          {Array.from({ length: 4 }, (_, i) => (
            <SkeletonCard key={i} className="min-h-56" />
          ))}
        </div>
      ) : items.length === 0 ? (
        empty
      ) : (
        <div className="flex flex-col gap-4">
          <div
            aria-busy={isFetching || undefined}
            className={cx(
              "grid grid-cols-1 gap-4 transition-opacity duration-200 xl:grid-cols-2",
              dim && "opacity-70 delay-100",
            )}
          >
            {items.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                decision={decided[request.id]}
                busy={pendingIds.has(request.id)}
                canReview={canReview}
                learnerHref={canReadLearners && request.learner?.id ? `/admin/manage-users/${request.learner.id}` : null}
                batchHref={canReadBatches && request.batch?.id ? `/admin/manage-batch/${request.batch.id}` : null}
                onApprove={onApprove}
                onDecline={onDecline}
              />
            ))}
          </div>
          <Pagination meta={data?.meta} onPageChange={list.setPage} itemLabel="requests" isFetching={isFetching} />
        </div>
      )}
    </>
  );
};

export default EnrollmentQueue;

/* ── one request ────────────────────────────────────────────────────────── */

const LINK_CLASS = "focus-ring rounded-md transition-colors duration-200 hover:text-accent";

/** The profile fields frozen at submit time (07 §1); only the ones present. */
function snapshotFacts(snapshot) {
  if (!snapshot) return [];
  const facts = [];
  if (snapshot.licAgentCode) {
    facts.push({ key: "code", label: "LIC agent code", icon: "shield", value: snapshot.licAgentCode });
  }
  if (snapshot.city) facts.push({ key: "city", label: "City", icon: "pin", value: snapshot.city });
  if (snapshot.experienceYears != null) {
    facts.push({
      key: "experience",
      label: "Experience",
      icon: "briefcase",
      value: snapshot.experienceYears === 0 ? "Under a year's experience" : `${plural(snapshot.experienceYears, "year")} experience`,
    });
  }
  return facts;
}

const RequestCard = memo(function RequestCard({ request, decision, busy, canReview, learnerHref, batchHref, onApprove, onDecline }) {
  const status = decision?.status ?? request.status;
  const reviewNote = decision ? decision.reviewNote : request.reviewNote;
  const name = request.learner?.fullName ?? "Unknown learner";
  const titleId = `enrollment-${request.id}`;
  const facts = snapshotFacts(request.applicantSnapshot);
  const actionable = canReview && status === ENROLLMENT_STATUS.PENDING;

  return (
    <Card
      as={motion.article}
      layout="position"
      transition={{ layout: { duration: 0.5, ease: EXPO } }}
      padding="none"
      aria-labelledby={titleId}
      aria-busy={busy || undefined}
      className="flex min-w-0 flex-col"
    >
      <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <Avatar name={name} />
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="truncate text-[15px] font-semibold text-text-primary">
              {learnerHref ? (
                <Link to={learnerHref} className={LINK_CLASS}>
                  {name}
                </Link>
              ) : (
                name
              )}
            </h2>
            {request.learner?.email && <p className="truncate text-[13px] text-text-muted">{request.learner.email}</p>}
          </div>
          <StatusBadge status={status} />
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-text-muted">
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <Icon name="layers" className="h-4 w-4 shrink-0" />
            <span className="sr-only">Batch:</span>
            {batchHref ? (
              <Link to={batchHref} className={cx(LINK_CLASS, "truncate font-semibold text-text-primary")}>
                {request.batch.name}
              </Link>
            ) : (
              <span className="truncate font-semibold text-text-primary">{request.batch?.name ?? "Unknown batch"}</span>
            )}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Icon name="clock" className="h-4 w-4 shrink-0" />
            <time dateTime={request.submittedAt} title={formatDateTime(request.submittedAt)}>
              Applied {timeAgo(request.submittedAt)}
            </time>
          </span>
          {status !== ENROLLMENT_STATUS.PENDING && request.reviewedAt && (
            <span className="inline-flex items-center gap-1.5">
              <Icon name={status === ENROLLMENT_STATUS.APPROVED ? "userCheck" : "userX"} className="h-4 w-4 shrink-0" />
              <time dateTime={request.reviewedAt} title={formatDateTime(request.reviewedAt)}>
                Reviewed {timeAgo(request.reviewedAt)}
              </time>
            </span>
          )}
        </div>

        {facts.length > 0 && (
          <dl className="flex flex-wrap gap-2" aria-label="Profile when they applied">
            {facts.map((fact) => (
              <div
                key={fact.key}
                className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1 text-[13px] ring-1 ring-inset ring-border/60"
              >
                <dt className="flex shrink-0 text-text-muted">
                  <Icon name={fact.icon} className="h-3.5 w-3.5" strokeWidth={2} />
                  <span className="sr-only">{fact.label}</span>
                </dt>
                <dd className="truncate font-medium text-text-primary tabular-nums">{fact.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {request.motivation && (
          <figure className="rounded-2xl bg-surface-muted px-4 py-3.5 ring-1 ring-inset ring-border/60">
            <figcaption className="caps text-[10.5px] font-bold text-text-muted">Why they applied</figcaption>
            <blockquote className="mt-1.5 text-sm leading-relaxed wrap-break-word whitespace-pre-line text-text-primary">
              {request.motivation}
            </blockquote>
          </figure>
        )}

        {status === ENROLLMENT_STATUS.REJECTED && reviewNote && (
          <Callout title="Note sent to the learner">
            <p className="wrap-break-word whitespace-pre-line">{reviewNote}</p>
          </Callout>
        )}
      </div>

      {actionable && (
        <div className="flex items-center gap-2 border-t border-border/70 px-5 py-3.5 sm:justify-end sm:px-6">
          <Button
            variant="ghost"
            size="sm"
            icon="x"
            disabled={busy}
            onClick={() => onDecline(request)}
            className="flex-1 sm:flex-none"
            aria-label={`Decline ${name}'s request`}
          >
            Decline
          </Button>
          <Button
            variant="tonal"
            size="sm"
            icon="check"
            loading={busy}
            onClick={() => onApprove(request)}
            className="flex-1 sm:flex-none"
            aria-label={`Approve ${name}'s request`}
          >
            Approve
          </Button>
        </div>
      )}
    </Card>
  );
});
