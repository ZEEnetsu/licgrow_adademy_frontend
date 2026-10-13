import { memo, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import Icon from "../../../../components/ui/Icon.jsx";
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
  SkeletonCard,
  StatusBadge,
  Toolbar,
  cx,
  useClampPage,
  useListParams,
  useModalParam,
} from "../../../../components/admin";
import { plural, timeAgo } from "../../../../components/admin/format.js";
import { selectCan } from "../../../../app/features/auth/auth.selectors.js";
import { PERMISSIONS } from "../../../../app/features/auth/permissions.js";
import coursesApi, { COURSE_STATUS, useGetCoursesQuery } from "../../../../app/apis/courses.api.js";
import CreateCourseForm from "./CreateCourseForm.jsx";

/**
 * Course catalogue — `api-contracts/08-course.md` §1–2.
 *
 *   PageHeader → Toolbar (status tabs + search) → CardGrid → Pagination
 *
 * Follows the reference list page (learner/LearnerList.jsx): state lives in
 * the URL (`?status`, `?q`, `?page`), the grid keeps the previous page on
 * screen, dimmed, while the next one loads, and hovering a card warms the
 * course tree it opens. "New course" is `?new=1`, so the dashboard and the
 * command palette link straight to it.
 *
 * A course has no thumbnail, instructor or duration — the contract's course
 * is a curriculum tree whose imagery lives in its chapters' videos — so a
 * card leads with exam target, status and structure.
 */

const TABS = [
  { value: null, label: "All" },
  { value: COURSE_STATUS.DRAFT, label: "Draft" },
  { value: COURSE_STATUS.PUBLISHED, label: "Published" },
  { value: COURSE_STATUS.ARCHIVED, label: "Archived" },
];

// card grids page by 24: divisible by the grid's 2, 3 and 4 columns
const PAGE_SIZE = 24;

const CourseList = () => {
  const list = useListParams({ filters: { status: null }, limit: PAGE_SIZE });
  const { data, isLoading, isFetching, isError, error, refetch } = useGetCoursesQuery(list.args);
  const courses = data?.items ?? [];
  useClampPage(data?.meta, list.page, list.setPage);

  const can = useSelector(selectCan);
  const canAuthor = can(PERMISSIONS.COURSE_AUTHOR);
  const [isCreating, openCreate, closeCreate] = useModalParam("new");

  // warm the tree a card is about to open
  const prefetchCourse = coursesApi.usePrefetch("getCourse");
  const onCardPrefetch = useCallback((id) => prefetchCourse(id, { ifOlderThan: 60 }), [prefetchCourse]);

  // and the next page, so "Next" is instant
  const prefetchList = coursesApi.usePrefetch("getCourses");
  useEffect(() => {
    if (data?.meta?.hasNext) prefetchList({ ...list.args, page: list.page + 1 }, { ifOlderThan: 30 });
  }, [data?.meta?.hasNext, list.args, list.page, prefetchList]);

  const statusLabel = TABS.find((tab) => tab.value === list.filters.status)?.label.toLowerCase();

  return (
    <>
      <PageHeader
        eyebrow="Learning"
        title="Courses"
        description="Video curricula of units and chapters. Publish a course to make it available to batches."
        actions={
          canAuthor && (
            <Button variant="primary" icon="plus" onClick={openCreate}>
              New course
            </Button>
          )
        }
      />

      <Toolbar
        isFetching={isFetching && !isLoading}
        start={
          <SegmentedTabs
            layoutId="course-status"
            ariaLabel="Filter courses by status"
            items={TABS}
            value={list.filters.status}
            onChange={(value) => list.setFilter("status", value)}
          />
        }
        end={
          <SearchInput
            label="Search courses"
            placeholder="Search course titles…"
            value={list.search.value}
            onChange={list.search.onChange}
            isSearching={list.search.isPending || (isFetching && Boolean(list.search.committed))}
          />
        }
      />

      {isError ? (
        <LoadError what="courses" error={error} onRetry={refetch} />
      ) : isLoading ? (
        <CardGrid cols={4}>
          {Array.from({ length: 8 }, (_, i) => (
            <SkeletonCard key={i} className="min-h-54" />
          ))}
        </CardGrid>
      ) : courses.length === 0 ? (
        list.isFiltered ? (
          <EmptyState
            icon="search"
            title="No courses match"
            description={
              list.search.committed
                ? `Nothing for “${list.search.committed}”${list.filters.status ? ` among ${statusLabel} courses` : ""}.`
                : `There are no ${statusLabel} courses right now.`
            }
            action={
              <Button
                variant="secondary"
                icon="x"
                onClick={() => {
                  list.search.onChange("");
                  list.setFilter("status", null);
                }}
              >
                Clear filters
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon="book"
            tone="mint"
            title="No courses yet"
            description="A course is a tree of units and chapters, each chapter a YouTube lesson. Build one, then publish it into a batch."
            action={
              canAuthor && (
                <Button variant="primary" icon="plus" onClick={openCreate}>
                  Create your first course
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
            <CardGrid cols={4}>
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} onPrefetch={onCardPrefetch} />
              ))}
            </CardGrid>
          </div>
          <Pagination meta={data?.meta} onPageChange={list.setPage} itemLabel="courses" isFetching={isFetching} />
        </div>
      )}

      <CreateCourseForm open={isCreating && canAuthor} onClose={closeCreate} />
    </>
  );
};

export default CourseList;

/* ── card ───────────────────────────────────────────────────────────────── */

const CourseCard = memo(function CourseCard({ course, onPrefetch }) {
  const prefetch = () => onPrefetch(course.id);

  return (
    <Card
      as={Link}
      to={`/admin/manage-course/${course.id}`}
      interactive
      onMouseEnter={prefetch}
      onFocus={prefetch}
      className="flex h-full min-h-54 flex-col"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-tint-slate text-text-primary">
          <Icon name="book" className="h-5 w-5" />
        </span>
        <StatusBadge status={course.status} size="sm" />
      </div>

      <div className="mt-5 min-w-0 flex-1">
        {course.examTarget && <ExamChip>{course.examTarget}</ExamChip>}
        <h2 className="mt-2.5 line-clamp-2 font-display text-[17px] leading-snug font-bold tracking-tight wrap-break-word text-text-primary transition-colors duration-200 group-hover/card:text-accent">
          {course.title}
        </h2>
      </div>

      <div className="mt-5 flex items-center gap-3 border-t border-border/70 pt-4">
        <p className="min-w-0 flex-1 truncate text-[13px] text-text-muted">
          <span className="font-semibold text-text-primary tabular-nums">{plural(course.unitCount ?? 0, "unit")}</span>
          <span aria-hidden> · </span>
          updated {timeAgo(course.updatedAt)}
        </p>
        <span
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface-muted text-text-muted transition-[transform,background-color,color] duration-500 ease-out-expo group-hover/card:rotate-45 group-hover/card:bg-accent-solid group-hover/card:text-accent-solid-contrast"
          aria-hidden
        >
          <Icon name="arrowUpRight" className="h-4 w-4" strokeWidth={2} />
        </span>
      </div>
    </Card>
  );
});

/** The exam a course prepares for, as a small mint caps chip (the Eyebrow look, card-sized). */
function ExamChip({ children }) {
  return (
    <span className="caps inline-flex max-w-full items-center gap-1.5 rounded-full bg-tint-mint px-2.5 py-1 text-[10px] font-bold text-success ring-1 ring-inset ring-success/15">
      <Icon name="target" className="h-3 w-3 shrink-0" strokeWidth={2.25} />
      <span className="truncate">{children}</span>
    </span>
  );
}
