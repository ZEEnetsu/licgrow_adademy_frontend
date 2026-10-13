import { memo, useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";

import Icon from "../../../../components/ui/Icon.jsx";
import {
  Button,
  Card,
  EmptyState,
  LoadError,
  PageHeader,
  Pagination,
  RowActions,
  SegmentedTabs,
  SkeletonCard,
  StatusBadge,
  Toolbar,
  cx,
  useClampPage,
  useConfirm,
  useListParams,
  useModalParam,
  usePendingIds,
  useToast,
} from "../../../../components/admin";
import { formatDate, formatDateTime, timeAgo } from "../../../../components/admin/format.js";
import { selectCan } from "../../../../app/features/auth/auth.selectors.js";
import { PERMISSIONS } from "../../../../app/features/auth/permissions.js";
import { getUserMessage } from "../../../../app/apis/apiError.js";
import announcementApi, {
  ANNOUNCEMENT_SCOPE,
  useDeleteAnnouncementMutation,
  useGetAnnouncementsQuery,
  useSetAnnouncementPinnedMutation,
} from "../../../../app/apis/announcement.api.js";
import AnnouncementForm, { ScopeBadge } from "./AnnouncementForm.jsx";

/**
 * Announcement management — `api-contracts/11-announcement.md` §1–5.
 *
 *   PageHeader → Toolbar (scope tabs) → announcement cards → Pagination
 *
 * Admins see everything, including expired announcements — which is why an
 * "Expired" badge is shown rather than the card being hidden. The contract
 * has no text search (§2 filters by scope, batch and pin only), so there is
 * no search box. The server sorts pinned first, then newest.
 *
 * Pin / unpin is optimistic (`setAnnouncementPinned`); delete confirms and
 * only that card goes busy. "New announcement" lives at `?new=1`, which the
 * dashboard and the command palette link to.
 */

const TABS = [
  { value: null, label: "All" },
  { value: ANNOUNCEMENT_SCOPE.GLOBAL, label: "Everyone" },
  { value: ANNOUNCEMENT_SCOPE.BATCH, label: "Batches" },
];

const EMPTY_FILTERED = {
  [ANNOUNCEMENT_SCOPE.GLOBAL]: { title: "Nothing posted to everyone", description: "Every announcement so far went to a single batch." },
  [ANNOUNCEMENT_SCOPE.BATCH]: { title: "No batch announcements", description: "Every announcement so far went to all learners." },
};

// 24 a page: a card grid, divisible by its 1 and 2 columns
const PAGE_SIZE = 24;

const AnnouncementManager = () => {
  const list = useListParams({ filters: { scope: null }, limit: PAGE_SIZE });
  const { data, isLoading, isFetching, isError, error, refetch } = useGetAnnouncementsQuery(list.args);
  const items = data?.items ?? [];
  useClampPage(data?.meta, list.page, list.setPage);

  const can = useSelector(selectCan);
  const canManage = can(PERMISSIONS.ANNOUNCEMENT_MANAGE);
  const confirm = useConfirm();
  const toast = useToast();
  const { pendingIds, run } = usePendingIds();
  const [setPinned] = useSetAnnouncementPinnedMutation();
  const [remove] = useDeleteAnnouncementMutation();

  // "expired" is judged against the time the page opened, not every render
  const [now] = useState(() => Date.now());

  const [isNewOpen, openNew, closeNew] = useModalParam("new");
  // the announcement outlives `open`, so the dialog keeps its content while it animates out
  const [editing, setEditing] = useState({ open: false, announcement: null });
  const closeEdit = useCallback(() => setEditing((current) => ({ ...current, open: false })), []);

  // the next page, so "Next" is instant
  const prefetchList = announcementApi.usePrefetch("getAnnouncements");
  useEffect(() => {
    if (data?.meta?.hasNext) prefetchList({ ...list.args, page: list.page + 1 }, { ifOlderThan: 30 });
  }, [data?.meta?.hasNext, list.args, list.page, prefetchList]);

  const onPin = useCallback(
    async (announcement) => {
      const next = !announcement.isPinned;
      const name = `“${announcement.title}”`;
      try {
        await setPinned({ id: announcement.id, isPinned: next }).unwrap();
        toast.success(next ? `${name} is pinned` : `${name} is unpinned`, {
          description: next ? "It sits above the rest for admins and learners." : undefined,
          action: {
            label: "Undo",
            onClick: () => setPinned({ id: announcement.id, isPinned: !next }),
          },
        });
      } catch (err) {
        toast.error(next ? `Couldn't pin ${name}` : `Couldn't unpin ${name}`, { description: getUserMessage(err) });
      }
    },
    [setPinned, toast],
  );

  const onEdit = useCallback((announcement) => setEditing({ open: true, announcement }), []);

  const onDelete = useCallback(
    async (announcement) => {
      const done = await confirm({
        title: `Delete “${announcement.title}”?`,
        description: "Learners stop seeing it straight away. This can't be undone.",
        confirmLabel: "Delete announcement",
        tone: "danger",
        icon: "trash",
        onConfirm: () => run(announcement.id, () => remove(announcement.id).unwrap()),
      });
      if (done) toast.success(`“${announcement.title}” is deleted`);
    },
    [confirm, remove, run, toast],
  );

  const scope = list.filters.scope;
  const dim = isFetching && !isLoading;

  let content;
  if (isError) {
    content = <LoadError what="announcements" error={error} onRetry={refetch} />;
  } else if (isLoading) {
    content = (
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  } else if (items.length === 0) {
    content =
      scope && EMPTY_FILTERED[scope] ? (
        <EmptyState
          icon="megaphone"
          title={EMPTY_FILTERED[scope].title}
          description={EMPTY_FILTERED[scope].description}
          action={
            <Button variant="secondary" onClick={() => list.setFilter("scope", null)}>
              Show all announcements
            </Button>
          }
        />
      ) : (
        <EmptyState
          icon="megaphone"
          title="Nothing announced yet"
          description="A batch announcement notifies that batch's members; one for everyone reaches every learner."
          action={
            canManage && (
              <Button variant="secondary" icon="plus" onClick={openNew}>
                New announcement
              </Button>
            )
          }
        />
      );
  } else {
    content = (
      <div className="flex flex-col gap-4">
        <div
          aria-busy={isFetching || undefined}
          className={cx(
            "grid grid-cols-1 gap-4 transition-opacity duration-200 xl:grid-cols-2",
            dim && "opacity-70 delay-100",
          )}
        >
          {items.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              now={now}
              canManage={canManage}
              pending={pendingIds.has(announcement.id)}
              onPin={onPin}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
        <Pagination meta={data?.meta} onPageChange={list.setPage} itemLabel="announcements" isFetching={isFetching} />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Communication"
        title="Announcements"
        description="News for learners, posted to one batch or to everyone. Pinned ones stay on top; expired ones stay here but leave learner feeds."
        actions={
          canManage && (
            <Button variant="primary" icon="plus" onClick={openNew}>
              New announcement
            </Button>
          )
        }
      />

      <Toolbar
        isFetching={dim}
        start={
          <SegmentedTabs
            layoutId="announcement-scope-filter"
            ariaLabel="Filter announcements by audience"
            items={TABS}
            value={scope}
            onChange={(value) => list.setFilter("scope", value)}
          />
        }
      />

      {content}

      {canManage && (
        <>
          <AnnouncementForm open={isNewOpen} onClose={closeNew} />
          <AnnouncementForm open={editing.open} announcement={editing.announcement} onClose={closeEdit} />
        </>
      )}
    </>
  );
};

export default AnnouncementManager;

/* ── card ───────────────────────────────────────────────────────────────── */

/**
 * One announcement. Memoised with handlers that take the record, so pinning
 * one card (or a refetch that leaves the rest unchanged) re-renders only it.
 */
const AnnouncementCard = memo(function AnnouncementCard({ announcement, now, canManage, pending, onPin, onEdit, onDelete }) {
  const expiresAt = announcement.expiresAt ? Date.parse(announcement.expiresAt) : null;
  const expired = expiresAt !== null && expiresAt <= now;

  return (
    <Card
      as="article"
      aria-busy={pending || undefined}
      className={cx("flex min-w-0 flex-col gap-3 transition-opacity duration-200", pending && "pointer-events-none opacity-55")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <ScopeBadge announcement={announcement} />
          {announcement.isPinned && <StatusBadge status="pinned" />}
          {expired && <StatusBadge status="expired" />}
        </div>
        {canManage && (
          <div className="-mt-1 -mr-1.5">
            <RowActions
              label={`Actions for “${announcement.title}”`}
              items={[
                {
                  id: "pin",
                  label: announcement.isPinned ? "Unpin" : "Pin to the top",
                  icon: "pushpin",
                  onSelect: () => onPin(announcement),
                },
                { id: "edit", label: "Edit", icon: "pencil", onSelect: () => onEdit(announcement) },
                {
                  id: "delete",
                  label: "Delete",
                  icon: "trash",
                  tone: "danger",
                  separatorBefore: true,
                  onSelect: () => onDelete(announcement),
                },
              ]}
            />
          </div>
        )}
      </div>

      <div className="min-w-0">
        <h2 className="font-display text-lg leading-snug font-bold tracking-tight wrap-break-word text-text-primary">
          {announcement.title}
        </h2>
        <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed wrap-break-word whitespace-pre-line text-text-muted">
          {announcement.body}
        </p>
      </div>

      <p className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border-muted pt-3 text-[13px] text-text-muted">
        <span className="inline-flex items-center gap-1.5">
          <Icon name="send" className="h-3.5 w-3.5" />
          <span>
            Posted{" "}
            <time dateTime={announcement.publishedAt} title={formatDateTime(announcement.publishedAt)}>
              {timeAgo(announcement.publishedAt)}
            </time>
          </span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Icon name="clock" className="h-3.5 w-3.5" />
          {expiresAt === null ? (
            "No expiry"
          ) : (
            <span>
              {expired ? "Expired" : "Expires"}{" "}
              <time dateTime={announcement.expiresAt} className="tabular-nums">
                {formatDate(announcement.expiresAt)}
              </time>
            </span>
          )}
        </span>
      </p>
    </Card>
  );
});
