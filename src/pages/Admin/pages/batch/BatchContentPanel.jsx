import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import Icon from "../../../../components/ui/Icon.jsx";
import { useDebouncedValue } from "../../../../hooks/useDebouncedValue.js";
import {
  Button,
  EmptyState,
  EntityCombobox,
  Field,
  LoadError,
  Pagination,
  Panel,
  RowActions,
  RowLink,
  Skeleton,
  StatusBadge,
  cx,
  useClampPage,
  useConfirm,
  usePendingIds,
  useToast,
} from "../../../../components/admin";
import { plural } from "../../../../components/admin/format.js";
import { getUserMessage } from "../../../../app/apis/apiError.js";
import {
  BATCH_STATUS,
  useGetBatchCoursesQuery,
  useGetBatchTestsQuery,
  usePublishCourseToBatchMutation,
  usePublishTestToBatchMutation,
  useUnpublishCourseFromBatchMutation,
  useUnpublishTestFromBatchMutation,
} from "../../../../app/apis/batches.api.js";
import { COURSE_STATUS, useGetCoursesQuery } from "../../../../app/apis/courses.api.js";
import { TEST_KIND, TEST_STATUS, useGetTestsQuery } from "../../../../app/apis/tests.api.js";

/**
 * Courses or tests published into a batch — `06-batch.md` §6–9.
 *
 * The picker only ever offers eligible content, asked of the server rather
 * than filtered here, because the server refuses the rest:
 *   · only `published` content may enter a batch (CONTENT_NOT_PUBLISHED)
 *   · a quiz never enters a batch — it reaches learners through its unit's
 *     course (10-submission.md §1) — so tests are asked for with `kind=test`
 *   · already-linked content would 409 ALREADY_PUBLISHED, so it's excluded
 *
 * Picking doesn't add straight away: adding notifies every member, so it
 * takes a second, deliberate click. Removing revokes member access and asks
 * first. Each row has its own pending state.
 *
 * The page number is local state, not `?page`, so it can't leak between the
 * detail page's tabs.
 */

// a batch rarely holds more than a few dozen items; past that, paginate
const LINKED_LIMIT = 50;
const PICKER_LIMIT = 20;

const KIND = {
  courses: {
    one: "course",
    many: "courses",
    icon: "book",
    title: "Courses in this batch",
    hint: "Only published courses can join a batch.",
    href: (id) => `/admin/manage-course/${id}`,
    describe: (course) => [course.examTarget, plural(course.unitCount ?? 0, "unit")].filter(Boolean).join(" · "),
    removeBody:
      "Members lose access to it straight away. Their progress is kept, and you can add it back later.",
  },
  tests: {
    one: "test",
    many: "tests",
    icon: "clipboardCheck",
    title: "Tests in this batch",
    hint: "Only published full-length tests. Quizzes reach learners through their course.",
    href: (id) => `/admin/manage-test/tests/${id}`,
    describe: (test) =>
      [
        plural(test.totalMarks ?? 0, "mark"),
        test.durationMinutes ? `${test.durationMinutes} min` : "Untimed",
        test.questionCount != null ? plural(test.questionCount, "question") : null,
      ]
        .filter(Boolean)
        .join(" · "),
    removeBody:
      "No one can start a new attempt. Attempts already in progress can finish, and every score is kept.",
  },
};

/*
 * The contract marks these codes user-safe (06, "Module error codes"), but
 * apiError.js doesn't list them, so getUserMessage would fall back to a
 * generic line. These fallbacks say what actually went wrong.
 */
const ERROR_COPY = {
  CONTENT_NOT_PUBLISHED: "Only published content can join a batch. Publish it first.",
  ALREADY_PUBLISHED: "It's already in this batch.",
  INVALID_TEST_CONFIG: "Quizzes reach learners through their course, not a batch.",
  BATCH_ARCHIVED: "This batch is archived, so its content can't change.",
  NOT_FOUND: "It isn't in this batch any more.",
};
const explain = (error) => getUserMessage(error, ERROR_COPY[error?.code] ?? "Please try again.");

/** For a confirm dialog's `onConfirm`: it shows `getUserMessage(error)` inline. */
const asUserSafe = (message) => Object.assign(new Error(message), { userSafe: true, code: "BATCH_ACTION_FAILED" });

/**
 * @param {object} props
 * @param {object} props.batch
 * @param {"courses"|"tests"} props.kind
 * @param {boolean} props.canManage   holds `batch:manage`
 * @param {boolean} props.readOnly    the batch is archived
 * @param {number} [props.focusSignal] bump to focus the picker ("Add content")
 */
export default function BatchContentPanel({ batch, kind, canManage, readOnly, focusSignal = 0 }) {
  const copy = KIND[kind];
  const isCourses = kind === "courses";
  const batchId = batch.id;
  const canEdit = canManage && !readOnly;

  const confirm = useConfirm();
  const toast = useToast();
  const { pendingIds, run } = usePendingIds();

  // ── what's linked ────────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const linkedArgs = { batchId, page, limit: LINKED_LIMIT };
  const linkedCourses = useGetBatchCoursesQuery(linkedArgs, { skip: !isCourses });
  const linkedTests = useGetBatchTestsQuery(linkedArgs, { skip: isCourses });
  const linked = isCourses ? linkedCourses : linkedTests;
  const items = useMemo(() => linked.data?.items ?? [], [linked.data]);
  const meta = linked.data?.meta;
  useClampPage(meta, page, setPage);

  const linkedIds = useMemo(() => new Set(items.map((item) => item.id)), [items]);

  // ── the picker ───────────────────────────────────────────────────────────
  // candidates load on first intent (hover or focus), not on every tab visit
  const [armed, setArmed] = useState(false);
  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState(null);
  const q = useDebouncedValue(search.trim(), 300);
  const pickerArgs = { status: COURSE_STATUS.PUBLISHED, limit: PICKER_LIMIT, ...(q.length >= 2 && { q }) };
  const courseOptions = useGetCoursesQuery(pickerArgs, { skip: !canEdit || !armed || !isCourses });
  const testOptions = useGetTestsQuery(
    { ...pickerArgs, status: TEST_STATUS.PUBLISHED, kind: TEST_KIND.TEST },
    { skip: !canEdit || !armed || isCourses },
  );
  const options = isCourses ? courseOptions : testOptions;
  const pickerRef = useRef(null);

  // "Add content" in the page header lands here
  useEffect(() => {
    if (!focusSignal) return;
    const input = pickerRef.current?.querySelector("input");
    if (!input) return;
    input.scrollIntoView({ block: "center" });
    input.focus({ preventScroll: true });
  }, [focusSignal]);

  // ── actions ──────────────────────────────────────────────────────────────
  const [addCourse, addCourseState] = usePublishCourseToBatchMutation();
  const [addTest, addTestState] = usePublishTestToBatchMutation();
  const [removeCourse] = useUnpublishCourseFromBatchMutation();
  const [removeTest] = useUnpublishTestFromBatchMutation();
  const adding = addCourseState.isLoading || addTestState.isLoading;

  const removeItem = useCallback(
    (item) =>
      (isCourses ? removeCourse({ batchId, courseId: item.id }) : removeTest({ batchId, testId: item.id })).unwrap(),
    [isCourses, removeCourse, removeTest, batchId],
  );

  const undoAdd = (item) =>
    run(item.id, async () => {
      try {
        await removeItem(item);
        toast.info(`Took ${item.title} back out of ${batch.name}`);
      } catch (error) {
        toast.error(`Couldn't remove ${item.title}`, { description: explain(error) });
      }
    });

  const onAdd = async (event) => {
    event.preventDefault();
    if (!picked) {
      pickerRef.current?.querySelector("input")?.focus();
      return;
    }
    const item = picked;
    try {
      await (isCourses ? addCourse({ batchId, courseId: item.id }) : addTest({ batchId, testId: item.id })).unwrap();
      setPicked(null);
      toast.success(`Added ${item.title}`, {
        description:
          batch.status === BATCH_STATUS.ACTIVE
            ? `Members of ${batch.name} can open it now.`
            : `Members can open it once ${batch.name} is active.`,
        action: { label: "Undo", onClick: () => undoAdd(item) },
      });
    } catch (error) {
      toast.error(`Couldn't add ${item.title}`, { description: explain(error) });
    }
  };

  const onRemove = useCallback(
    async (item) => {
      const done = await confirm({
        title: `Remove ${item.title} from this batch?`,
        description: KIND[kind].removeBody,
        confirmLabel: "Remove from batch",
        tone: "danger",
        icon: "unlink",
        onConfirm: () =>
          run(item.id, async () => {
            try {
              await removeItem(item);
            } catch (error) {
              throw asUserSafe(explain(error));
            }
          }),
      });
      if (done) toast.success(`Removed ${item.title} from ${batch.name}`);
    },
    [confirm, kind, run, removeItem, toast, batch.name],
  );

  // ── render ───────────────────────────────────────────────────────────────
  const total = meta?.total;
  const searching = q.length >= 2;
  const emptyText = options.isError
    ? getUserMessage(options.error, `Couldn't load ${copy.many}.`)
    : searching
      ? `No published ${copy.many} match “${q}”`
      : `No published ${copy.many} left to add`;

  return (
    <Panel
      title={copy.title}
      icon={copy.icon}
      description={total ? plural(total, copy.one, copy.many) : undefined}
    >
      <div className="flex flex-col gap-5">
        {canEdit && (
          <form
            onSubmit={onAdd}
            className="grid grid-cols-1 gap-3 rounded-2xl bg-surface-muted p-4 ring-1 ring-inset ring-border/60 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start"
          >
            <div ref={pickerRef} onFocusCapture={() => setArmed(true)} onPointerEnter={() => setArmed(true)}>
              <Field label={`Add a published ${copy.one}`} hint={copy.hint}>
                <EntityCombobox
                  items={options.data?.items}
                  isFetching={options.isFetching}
                  search={search}
                  onSearchChange={setSearch}
                  value={picked}
                  onChange={setPicked}
                  getLabel={(item) => item.title}
                  getDescription={copy.describe}
                  exclude={linkedIds}
                  placeholder={`Search published ${copy.many}…`}
                  emptyText={emptyText}
                  footer={(options.data?.meta?.total ?? 0) > PICKER_LIMIT ? "Type to narrow the list" : null}
                />
              </Field>
            </div>
            <Button type="submit" variant="tonal" icon="plus" loading={adding} disabled={!picked} className="sm:mt-7">
              {`Add ${copy.one}`}
            </Button>
          </form>
        )}

        {linked.isLoading ? (
          <RowsSkeleton />
        ) : linked.isError ? (
          <LoadError what={copy.many} error={linked.error} onRetry={linked.refetch} />
        ) : items.length === 0 ? (
          <EmptyState
            compact
            icon={copy.icon}
            title={`No ${copy.many} in this batch yet`}
            description={
              canEdit
                ? `Pick a published ${copy.one} above. Members reach ${copy.many} only through a batch they belong to.`
                : `${copy.many[0].toUpperCase()}${copy.many.slice(1)} added to this batch will appear here.`
            }
          />
        ) : (
          <ul
            aria-busy={linked.isFetching || undefined}
            className={cx(
              "-mx-2 flex flex-col transition-opacity duration-200",
              linked.isFetching && "opacity-70 delay-100",
            )}
          >
            {items.map((item) => (
              <ContentRow
                key={item.id}
                item={item}
                kind={kind}
                pending={pendingIds.has(item.id)}
                onRemove={canEdit ? onRemove : undefined}
              />
            ))}
          </ul>
        )}

        {meta?.totalPages > 1 && (
          <Pagination meta={meta} onPageChange={setPage} itemLabel={copy.many} isFetching={linked.isFetching} />
        )}
      </div>
    </Panel>
  );
}

/** One linked course or test: the row opens it; ⋯ removes it from the batch. */
const ContentRow = memo(function ContentRow({ item, kind, pending, onRemove }) {
  const copy = KIND[kind];
  return (
    <li
      aria-busy={pending || undefined}
      className={cx(
        "group/row relative flex items-center gap-3 rounded-2xl px-2 py-2.5 transition-[background-color,opacity] duration-200 hover:bg-surface-hover/60 focus-within:bg-surface-hover/60",
        pending && "pointer-events-none opacity-55",
      )}
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-tint-slate text-text-primary">
        <Icon name={copy.icon} className="h-4.5 w-4.5" />
      </span>
      <RowLink to={copy.href(item.id)} className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-text-primary transition-colors duration-200 group-hover/row:text-accent">
          {item.title}
        </span>
        <span className="block truncate text-[13px] text-text-muted tabular-nums">{copy.describe(item)}</span>
        {/* phones: the badge drops under the title so the title keeps its width */}
        <StatusBadge status={item.status} size="sm" className="mt-1.5 sm:hidden" />
      </RowLink>
      <StatusBadge status={item.status} size="sm" className="max-sm:hidden" />
      {onRemove && (
        <span className="relative z-10">
          <RowActions
            label={`Actions for ${item.title}`}
            items={[
              {
                id: "remove",
                label: "Remove from batch",
                description: "Members lose access; history is kept",
                icon: "unlink",
                tone: "danger",
                onSelect: () => onRemove(item),
              },
            ]}
          />
        </span>
      )}
    </li>
  );
});

function RowsSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="flex-1">
            <Skeleton className="h-3.5 w-1/2" />
            <Skeleton className="mt-2 h-3 w-1/3" />
          </div>
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}
