import { useCallback, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import Icon from "../../../../components/ui/Icon.jsx";
import {
  Button,
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
  useModalParam,
  usePendingIds,
  useToast,
} from "../../../../components/admin";
import { formatDate, plural } from "../../../../components/admin/format.js";
import { selectCan } from "../../../../app/features/auth/auth.selectors.js";
import { PERMISSIONS } from "../../../../app/features/auth/permissions.js";
import testSlice, {
  TEST_KIND,
  TEST_STATUS,
  useArchiveTestMutation,
  useDeleteTestMutation,
  useGetTestsQuery,
} from "../../../../app/apis/tests.api.js";
import CreateTestForm from "./CreateTestForm.jsx";
import { asUserError } from "./questionDraft.js";

/**
 * Tests and quizzes — `api-contracts/09-test.md` §2. The `manage-test` index.
 *
 * Built on the reference list (LearnerList.jsx):
 *
 *   PageHeader → Toolbar (status tabs, kind tabs, search) → DataTable → Pagination
 *
 * Every filter is a server query param (`status`, `kind`, `q`), so counts and
 * pages stay right past page one. This replaces the old overview, which
 * fetched the first 20 tests and grouped them by status on the client.
 *
 * "Draft a test" opens in a modal driven by `?new=1`, so the dashboard and the
 * command palette can link straight to it.
 */

const STATUS_TABS = [
  { value: null, label: "All" },
  { value: TEST_STATUS.DRAFT, label: "Draft" },
  { value: TEST_STATUS.PUBLISHED, label: "Published" },
  { value: TEST_STATUS.ARCHIVED, label: "Archived" },
];

const KIND_TABS = [
  { value: null, label: "All kinds" },
  { value: TEST_KIND.TEST, label: "Tests" },
  { value: TEST_KIND.QUIZ, label: "Quizzes" },
];

/*
 * §2 documents no sort whitelist. `updatedAt:desc` is what the dashboard's
 * "Recently edited" widget already sends (queries.js), so the list asks for
 * the same order and offers no other.
 */
const SORTS = ["updatedAt:desc"];

const KIND_LABEL = { [TEST_KIND.TEST]: "Test", [TEST_KIND.QUIZ]: "Quiz" };
const KIND_ICON = { [TEST_KIND.TEST]: "fileText", [TEST_KIND.QUIZ]: "listOrdered" };

const testPath = (id) => `/admin/manage-test/tests/${id}`;

const kindWord = (test) => KIND_LABEL[test.kind]?.toLowerCase() ?? "test";

const TestList = () => {
  const list = useListParams({
    filters: { status: null, kind: null },
    sorts: SORTS,
    defaultSort: "updatedAt:desc",
  });
  const { data, isLoading, isFetching, isError, error, refetch } = useGetTestsQuery(list.args);
  const items = data?.items ?? [];
  useClampPage(data?.meta, list.page, list.setPage);

  const navigate = useNavigate();
  const can = useSelector(selectCan);
  const canAuthor = can(PERMISSIONS.TEST_AUTHOR);
  const confirm = useConfirm();
  const toast = useToast();
  const { pendingIds, run } = usePendingIds();
  const [archiveTest] = useArchiveTestMutation();
  const [deleteTest] = useDeleteTestMutation();
  const [isNewOpen, openNew, closeNew] = useModalParam("new");

  // warm the cache for the test a row is about to open
  const prefetchTest = testSlice.usePrefetch("getTestDetail");
  const onRowPrefetch = useCallback((row) => prefetchTest(row.id, { ifOlderThan: 60 }), [prefetchTest]);

  // and the next page, so "Next" is instant
  const prefetchList = testSlice.usePrefetch("getTests");
  useEffect(() => {
    if (data?.meta?.hasNext) prefetchList({ ...list.args, page: list.page + 1 }, { ifOlderThan: 30 });
  }, [data?.meta?.hasNext, list.args, list.page, prefetchList]);

  const onArchive = useCallback(
    async (test) => {
      const done = await confirm({
        title: `Archive “${test.title}”?`,
        description:
          "Learners can't start new attempts, and it's taken out of every batch it was in. Past attempts and scores are kept.",
        confirmLabel: `Archive ${kindWord(test)}`,
        tone: "danger",
        icon: "archive",
        onConfirm: () =>
          run(test.id, async () => {
            try {
              await archiveTest(test.id).unwrap();
            } catch (err) {
              throw asUserError(err, "Couldn't archive it. Please try again.");
            }
          }),
      });
      if (done) toast.success(`“${test.title}” is archived`);
    },
    [archiveTest, confirm, run, toast],
  );

  const onDelete = useCallback(
    async (test) => {
      const done = await confirm({
        title: `Delete “${test.title}”?`,
        description: `The draft and its ${plural(test.questionCount ?? 0, "question")} are removed for good. This can't be undone.`,
        confirmLabel: `Delete ${kindWord(test)}`,
        tone: "danger",
        icon: "trash",
        onConfirm: () =>
          run(test.id, async () => {
            try {
              await deleteTest(test.id).unwrap();
            } catch (err) {
              throw asUserError(err, "Couldn't delete it. Please try again.");
            }
          }),
      });
      if (done) toast.success(`“${test.title}” is deleted`);
    },
    [confirm, deleteTest, run, toast],
  );

  const columns = useMemo(
    () => [
      {
        id: "title",
        header: "Title",
        mobile: "primary",
        cell: (test) => (
          <span className="flex min-w-0 items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-tint-slate text-text-primary">
              <Icon name={KIND_ICON[test.kind] ?? "fileText"} className="h-[18px] w-[18px]" />
            </span>
            <RowLink to={testPath(test.id)} className="min-w-0">
              <span className="block truncate font-semibold text-text-primary transition-colors duration-200 group-hover/row:text-accent">
                {test.title}
              </span>
              {/* what the hidden columns would have said, on narrower screens */}
              <span className="block truncate text-[13px] text-text-muted xl:hidden">
                {KIND_LABEL[test.kind] ?? "Test"}
                <span className="lg:hidden">
                  {" · "}
                  {plural(test.questionCount ?? 0, "question")} · {plural(test.totalMarks ?? 0, "mark")}
                </span>
                <span className="max-md:hidden">
                  {" · "}updated {formatDate(test.updatedAt)}
                </span>
              </span>
            </RowLink>
          </span>
        ),
      },
      {
        id: "kind",
        header: "Kind",
        width: "6.5rem",
        hideBelow: "xl",
        mobile: "hidden",
        cell: (test) => <span className="text-text-muted">{KIND_LABEL[test.kind] ?? "Test"}</span>,
      },
      {
        id: "questions",
        header: "Questions",
        width: "7rem",
        align: "end",
        hideBelow: "lg",
        mobile: "hidden",
        cell: (test) => <span className="tabular-nums">{test.questionCount ?? 0}</span>,
      },
      {
        id: "marks",
        header: "Marks",
        width: "6rem",
        align: "end",
        hideBelow: "lg",
        mobile: "hidden",
        cell: (test) => <span className="tabular-nums">{test.totalMarks ?? 0}</span>,
      },
      {
        id: "status",
        header: "Status",
        width: "9rem",
        cell: (test) => (
          <span className="flex min-w-0 items-center gap-2.5">
            <StatusBadge status={test.status} />
            {/* phones have no Updated column, and this row has the room */}
            <span className="truncate text-[13px] text-text-muted tabular-nums md:hidden">
              Updated {formatDate(test.updatedAt)}
            </span>
          </span>
        ),
      },
      {
        id: "updated",
        header: "Updated",
        width: "8.5rem",
        hideBelow: "xl",
        mobile: "hidden",
        cell: (test) => <span className="text-text-muted tabular-nums">{formatDate(test.updatedAt)}</span>,
      },
      {
        id: "actions",
        header: <span className="sr-only">Actions</span>,
        width: "4.5rem",
        align: "end",
        mobile: "end",
        className: "relative z-10",
        cell: (test) => (
          <RowActions
            label={`Actions for ${test.title}`}
            items={[
              {
                id: "open",
                label: `Open ${kindWord(test)}`,
                icon: "arrowRight",
                onSelect: () => navigate(testPath(test.id)),
              },
              {
                id: "archive",
                label: `Archive ${kindWord(test)}`,
                description: "No new attempts; scores are kept",
                icon: "archive",
                tone: "danger",
                separatorBefore: true,
                hidden: !canAuthor || test.status === TEST_STATUS.ARCHIVED,
                onSelect: () => onArchive(test),
              },
              {
                id: "delete",
                label: "Delete draft",
                description: "Only drafts nobody has attempted",
                icon: "trash",
                tone: "danger",
                hidden: !canAuthor || test.status !== TEST_STATUS.DRAFT,
                onSelect: () => onDelete(test),
              },
            ]}
          />
        ),
      },
    ],
    [canAuthor, navigate, onArchive, onDelete],
  );

  const onCreated = useCallback(
    (test) => {
      toast.success(`“${test.title}” is drafted`, {
        description: "Add questions in English and Hindi, then publish it.",
      });
      // replace the `?new=1` entry, so Back from the new test returns here
      // without reopening the form
      navigate(testPath(test.id), { replace: true });
    },
    [navigate, toast],
  );

  // hidden, not disabled, for admins who can't author (guidelines §12)
  const draftButton = canAuthor ? (
    <Button variant="primary" icon="plus" onClick={openNew}>
      Draft a test
    </Button>
  ) : null;

  const { status, kind } = list.filters;
  const noun = kind === TEST_KIND.QUIZ ? "quizzes" : "tests";

  return (
    <>
      <PageHeader
        eyebrow="Learning"
        title="Tests"
        description="Full-length tests for batches and practice quizzes for course units. Draft one, add questions in English and Hindi, then publish."
        actions={draftButton}
      />

      <Toolbar
        isFetching={isFetching && !isLoading}
        start={
          <>
            <SegmentedTabs
              layoutId="test-status"
              ariaLabel="Filter by status"
              items={STATUS_TABS}
              value={status}
              onChange={(value) => list.setFilter("status", value)}
            />
            <SegmentedTabs
              layoutId="test-kind"
              ariaLabel="Filter by kind"
              size="sm"
              items={KIND_TABS}
              value={kind}
              onChange={(value) => list.setFilter("kind", value)}
            />
          </>
        }
        end={
          <SearchInput
            label="Search tests"
            placeholder="Search by title…"
            value={list.search.value}
            onChange={list.search.onChange}
            isSearching={list.search.isPending || (isFetching && Boolean(list.search.committed))}
          />
        }
      />

      {isError ? (
        <LoadError what="tests" error={error} onRetry={refetch} />
      ) : (
        <div className="flex flex-col gap-4">
          <DataTable
            caption="Tests and quizzes"
            columns={columns}
            rows={items}
            isLoading={isLoading}
            isFetching={isFetching}
            sort={list.sort}
            onRowPrefetch={onRowPrefetch}
            pendingIds={pendingIds}
            empty={
              list.isFiltered ? (
                <EmptyState
                  compact
                  icon="search"
                  title={`No ${noun} match`}
                  description={
                    list.search.committed
                      ? `Nothing titled “${list.search.committed}” with these filters.`
                      : "Nothing has this status and kind yet. Try another filter."
                  }
                />
              ) : (
                <EmptyState
                  icon="clipboardCheck"
                  title="No tests yet"
                  description="Draft a test or a unit quiz, add bilingual questions, then publish it."
                  action={draftButton}
                />
              )
            }
          />
          <Pagination meta={data?.meta} onPageChange={list.setPage} itemLabel={noun} isFetching={isFetching} />
        </div>
      )}

      <CreateTestForm open={isNewOpen && canAuthor} onClose={closeNew} onCreated={onCreated} />
    </>
  );
};

export default TestList;
