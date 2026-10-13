import { useCallback, useId, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import Icon from "../../../../components/ui/Icon.jsx";
import {
  Button,
  Callout,
  Card,
  EmptyState,
  IconButton,
  LoadError,
  PageHeader,
  RowActions,
  Skeleton,
  StatusBadge,
  humanize,
  useConfirm,
  usePendingIds,
  useToast,
} from "../../../../components/admin";
import { plural } from "../../../../components/admin/format.js";
import { selectCan } from "../../../../app/features/auth/auth.selectors.js";
import { PERMISSIONS } from "../../../../app/features/auth/permissions.js";
import { getUserMessage } from "../../../../app/apis/apiError.js";
import {
  COURSE_STATUS,
  useAddUnitMutation,
  useArchiveCourseMutation,
  useDeleteUnitMutation,
  useGetCourseQuery,
  usePublishCourseMutation,
  useReorderUnitsMutation,
  useUpdateUnitMutation,
} from "../../../../app/apis/courses.api.js";
import UnitAccordion, { UnitTitleForm } from "./UnitAccordion.jsx";

/**
 * Course authoring — `api-contracts/08-course.md` §3–14.
 *
 *   PageHeader (back · status · Publish · ⋯ Archive)
 *   publish problems (a Callout listing the API's 422 details)
 *   Curriculum: unit accordions → chapters → quiz reference; "Add unit"
 *
 * One request returns the whole tree, so everything renders from one cache
 * entry (shared with the breadcrumb) and every write invalidates it. Unit and
 * chapter reorders are optimistic (courses.api.js); every other write is
 * pessimistic, marks just its own row busy, and toasts its outcome.
 *
 * Remounted per course (`key`), so local state — an open form, a publish
 * problem — never leaks from one course into the next.
 */

// a stable empty list, so callbacks keyed on `units` don't change every render
const NO_UNITS = [];

const BACK = { to: "/admin/manage-course", label: "All courses" };

const CourseDetail = () => {
  const { courseId } = useParams();
  return <CourseAuthoring key={courseId} courseId={courseId} />;
};

export default CourseDetail;

function CourseAuthoring({ courseId }) {
  const { data: course, isLoading, isError, error, refetch } = useGetCourseQuery(courseId, { skip: !courseId });

  const can = useSelector(selectCan);
  const canAuthor = can(PERMISSIONS.COURSE_AUTHOR);
  const confirm = useConfirm();
  const toast = useToast();
  const { pendingIds, run } = usePendingIds();

  const [publishCourse, publishState] = usePublishCourseMutation();
  const [archiveCourse] = useArchiveCourseMutation();
  const [addUnit] = useAddUnitMutation();
  const [updateUnit] = useUpdateUnitMutation();
  const [deleteUnit] = useDeleteUnitMutation();
  const [reorderUnits] = useReorderUnitsMutation();

  const [publishProblem, setPublishProblem] = useState(null);
  const [addingUnit, setAddingUnit] = useState(false);
  const unitFocus = useRef(null);
  const headingId = useId();

  const units = course?.units ?? NO_UNITS;
  const title = course?.title ?? "this course";

  /* ── course actions ── */

  const onPublish = async () => {
    // a 422 closes the dialog and lands in the Callout below the header;
    // anything else (network, 5xx) stays in the dialog for a retry
    let problem = null;
    const done = await confirm({
      title: `Publish “${title}”?`,
      description:
        "It becomes available to batches: an admin can add it to a batch, and that batch's learners can start the chapters. You can keep editing units and chapters after publishing.",
      confirmLabel: "Publish course",
      icon: "send",
      onConfirm: async () => {
        setPublishProblem(null);
        try {
          await publishCourse(courseId).unwrap();
        } catch (err) {
          if (err?.status !== 422) throw err;
          problem = err;
        }
      },
    });
    if (!done) return;
    if (problem) {
      setPublishProblem(problem);
      toast.error(`Couldn't publish “${title}”`, { description: getUserMessage(problem, "It isn't ready to publish yet.") });
    } else {
      toast.success(`“${title}” is published`, { description: "Add it to a batch to give learners access." });
    }
  };

  const onArchive = async () => {
    const done = await confirm({
      title: `Archive “${title}”?`,
      description:
        "It becomes read-only and can't be added to new batches. Batches that already include it keep it, and every unit, chapter and quiz link is kept.",
      confirmLabel: "Archive course",
      tone: "danger",
      icon: "archive",
      onConfirm: () => archiveCourse(courseId).unwrap(),
    });
    if (done) toast.success(`“${title}” is archived`, { description: "It's read-only now." });
  };

  /* ── unit actions ── */

  const restoreUnits = useCallback(
    async (orderedUnitIds) => {
      try {
        await reorderUnits({ courseId, orderedUnitIds }).unwrap();
        toast.info("Unit order restored");
      } catch (err) {
        toast.error("Couldn't restore the unit order", { description: getUserMessage(err, "Please try again.") });
      }
    },
    [courseId, reorderUnits, toast],
  );

  const onMoveUnit = useCallback(
    async (unit, delta) => {
      const ids = units.map((item) => item.id);
      const from = ids.indexOf(unit.id);
      const to = from + delta;
      if (from < 0 || to < 0 || to >= ids.length) return;
      const next = [...ids];
      [next[from], next[to]] = [next[to], next[from]];

      const direction = delta < 0 ? "up" : "down";
      // keyboard focus follows the unit to its new place (UnitAccordion)
      unitFocus.current = { id: unit.id, direction, index: to };
      try {
        await reorderUnits({ courseId, orderedUnitIds: next }).unwrap();
        toast.success(`Moved “${unit.title}” ${direction}`, {
          id: `reorder-units-${courseId}`,
          description: `It's unit ${to + 1} of ${ids.length}.`,
          action: { label: "Undo", onClick: () => restoreUnits(ids) },
        });
      } catch (err) {
        if (unitFocus.current?.id === unit.id) unitFocus.current = null;
        toast.error(`Couldn't move “${unit.title}”`, {
          description: getUserMessage(err, "The previous order is back. Please try again."),
        });
      }
    },
    [units, courseId, reorderUnits, restoreUnits, toast],
  );

  const onRenameUnit = useCallback(
    (unit, nextTitle) =>
      run(unit.id, async () => {
        await updateUnit({ courseId, unitId: unit.id, title: nextTitle }).unwrap();
        toast.success(`Renamed to “${nextTitle}”`);
      }),
    [courseId, run, toast, updateUnit],
  );

  const onDeleteUnit = useCallback(
    async (unit) => {
      const count = unit.chapters?.length ?? 0;
      const consequence = [
        count === 0
          ? "It has no chapters."
          : count === 1
            ? "Its 1 chapter is deleted with it."
            : `All ${count} of its chapters are deleted with it.`,
        unit.quiz ? `Its quiz, “${unit.quiz.title}”, is kept in Tests but no longer linked to a unit.` : null,
        "This can't be undone.",
      ]
        .filter(Boolean)
        .join(" ");

      const done = await confirm({
        title: `Delete “${unit.title}”?`,
        description: consequence,
        confirmLabel: count ? `Delete unit and ${plural(count, "chapter")}` : "Delete unit",
        tone: "danger",
        icon: "trash",
        onConfirm: () => run(unit.id, () => deleteUnit({ courseId, unitId: unit.id }).unwrap()),
      });
      if (done) {
        toast.success(`“${unit.title}” is deleted`, {
          description: count ? `${plural(count, "chapter")} went with it.` : undefined,
        });
      }
    },
    [confirm, courseId, deleteUnit, run, toast],
  );

  const onAddUnit = async (unitTitle) => {
    await addUnit({ courseId, title: unitTitle }).unwrap();
    toast.success(`Added “${unitTitle}”`, { description: "Now add its first chapter." });
    setAddingUnit(false);
  };

  /* ── states ── */

  if (isLoading) return <DetailSkeleton />;

  if (isError || !course) {
    const missing = error?.code === "NOT_FOUND";
    return (
      <>
        <PageHeader
          back={BACK}
          eyebrow="Course"
          title={missing ? "Course not found" : "Course unavailable"}
        />
        {missing ? (
          <EmptyState
            icon="book"
            title="This course doesn't exist"
            description="It may have been removed, or the link is wrong."
            action={
              <Button to="/admin/manage-course" variant="secondary" icon="arrowLeft">
                All courses
              </Button>
            }
          />
        ) : (
          <LoadError what="this course" error={error} onRetry={refetch} />
        )}
      </>
    );
  }

  const isArchived = course.status === COURSE_STATUS.ARCHIVED;
  const isDraft = course.status === COURSE_STATUS.DRAFT;
  const canEdit = canAuthor && !isArchived;
  const chapterCount = units.reduce((sum, unit) => sum + (unit.chapters?.length ?? 0), 0);
  const quizCount = units.filter((unit) => unit.quiz).length;
  const problemDetails = publishProblem?.details ?? [];

  return (
    <>
      <PageHeader
        back={BACK}
        eyebrow="Course"
        title={course.title}
        meta={
          <>
            <StatusBadge status={course.status} />
            {course.examTarget && (
              <span className="caps inline-flex items-center gap-1.5 rounded-full bg-tint-mint px-2.5 py-1 text-[10.5px] font-bold text-success ring-1 ring-success/15 ring-inset">
                <Icon name="target" className="h-3 w-3" strokeWidth={2.25} />
                {course.examTarget}
              </span>
            )}
          </>
        }
        description={course.description || undefined}
        actions={
          canEdit && (
            <>
              {isDraft && (
                <Button variant="primary" icon="send" loading={publishState.isLoading} onClick={onPublish}>
                  Publish
                </Button>
              )}
              <RowActions
                label="More course actions"
                size="lg"
                items={[
                  {
                    id: "archive",
                    label: "Archive course",
                    description: "Read-only; not addable to new batches",
                    icon: "archive",
                    tone: "danger",
                    onSelect: onArchive,
                  },
                ]}
              />
            </>
          )
        }
      />

      {publishProblem && (
        <Callout
          tone="warning"
          title={`“${course.title}” can't be published yet`}
          action={<IconButton icon="x" label="Dismiss" size="sm" onClick={() => setPublishProblem(null)} />}
        >
          {problemDetails.length > 0 ? (
            <ul className="mt-1 flex list-disc flex-col gap-0.5 pl-4">
              {problemDetails.map((detail, i) => (
                <li key={`${detail.field ?? "course"}-${i}`}>
                  {detail.field && <span className="font-semibold">{humanize(detail.field)}: </span>}
                  {detail.issue}
                </li>
              ))}
            </ul>
          ) : (
            <p>{getUserMessage(publishProblem, "It isn't ready to publish yet. Check its units and chapters.")}</p>
          )}
        </Callout>
      )}

      {isArchived && (
        <Callout tone="info" icon="archive" title="This course is archived">
          {"It's read-only and can't be added to new batches. Batches that already include it keep it."}
        </Callout>
      )}

      <section aria-labelledby={headingId} className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <h2 id={headingId} className="font-display text-[19px] font-extrabold tracking-tight text-text-primary">
              Curriculum
            </h2>
            <p className="mt-0.5 text-[13px] text-text-muted tabular-nums">
              {plural(units.length, "unit")}
              <span aria-hidden> · </span>
              {plural(chapterCount, "chapter")}
              <span aria-hidden> · </span>
              {plural(quizCount, "quiz", "quizzes")}
            </p>
          </div>
          {canEdit && units.length > 0 && (
            <Button variant="secondary" icon="plus" onClick={() => setAddingUnit(true)} disabled={addingUnit}>
              Add unit
            </Button>
          )}
        </div>

        {units.length > 0 && (
          <ul aria-label="Units" className="flex flex-col gap-3">
            {units.map((unit, index) => (
              <UnitAccordion
                key={unit.id}
                courseId={courseId}
                unit={unit}
                index={index}
                total={units.length}
                canEdit={canEdit}
                pending={pendingIds.has(unit.id)}
                focusRef={unitFocus}
                onMove={onMoveUnit}
                onRename={onRenameUnit}
                onDelete={onDeleteUnit}
              />
            ))}
          </ul>
        )}

        {addingUnit ? (
          <Card tone="muted" padding="md">
            <UnitTitleForm
              label={`Unit ${units.length + 1} title`}
              submitLabel="Add unit"
              onSubmit={onAddUnit}
              onCancel={() => setAddingUnit(false)}
            />
          </Card>
        ) : (
          units.length === 0 && (
            <EmptyState
              icon="layers"
              title={canEdit ? "No units yet" : "No units"}
              description={
                canEdit
                  ? "A course is a list of units, each holding chapters. Add the first unit, then paste YouTube links into it."
                  : "This course has no units."
              }
              action={
                canEdit && (
                  <Button variant="secondary" icon="plus" onClick={() => setAddingUnit(true)}>
                    Add the first unit
                  </Button>
                )
              }
            />
          )
        )}
      </section>
    </>
  );
}

/** First load: the header and three unit cards, shaped like what's coming. */
function DetailSkeleton() {
  return (
    <>
      <PageHeader
        back={BACK}
        eyebrow="Course"
        title={
          <>
            <span className="sr-only">Loading course</span>
            <Skeleton className="h-9 w-[min(26rem,70vw)]" />
          </>
        }
      />
      <div className="flex flex-col gap-3" aria-hidden>
        <Skeleton className="h-5 w-40" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3 rounded-[24px] bg-surface-elevated p-4 shadow-elevate ring-1 ring-border/70 ring-inset">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="flex-1">
              <Skeleton className="h-3.5 w-1/3" />
              <Skeleton className="mt-2 h-3 w-1/5" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
