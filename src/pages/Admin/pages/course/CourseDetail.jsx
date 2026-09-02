import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import DashboardCompLayout from "../../../../layouts/DashboardCompLayout.jsx";
import Btn from "../../components/Btn.jsx";
import Can from "../../../../components/auth/Can.jsx";
import UnitAccordion from "./UnitAccordion.jsx";
import { PERMISSIONS } from "../../../../app/features/auth/permissions.js";
import { getUserMessage } from "../../../../app/apis/apiError.js";
import {
  useAddUnitMutation,
  useArchiveCourseMutation,
  useGetCourseQuery,
  usePublishCourseMutation,
  useReorderUnitsMutation,
  COURSE_STATUS,
} from "../../../../app/apis/courses.api.js";

/**
 * Course authoring tree — `api-contracts/08-course.md` §3, §5–14.
 *
 * One request returns the whole tree, so everything below renders from a
 * single cache entry and every mutation invalidates it.
 */

const STATUS_TONE = {
  [COURSE_STATUS.PUBLISHED]: "bg-success-muted text-success",
  [COURSE_STATUS.ARCHIVED]: "bg-danger-muted text-danger",
  [COURSE_STATUS.DRAFT]: "bg-surface-elevated-hover text-text-primary",
};

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [addingUnit, setAddingUnit] = useState(false);
  const [unitTitle, setUnitTitle] = useState("");
  const [publishError, setPublishError] = useState(null);

  const { data: course, isLoading, isError, error } = useGetCourseQuery(courseId, {
    skip: !courseId,
  });

  const [addUnit, addUnitState] = useAddUnitMutation();
  const [reorderUnits, reorderState] = useReorderUnitsMutation();
  const [publishCourse, publishState] = usePublishCourseMutation();
  const [archiveCourse, archiveState] = useArchiveCourseMutation();

  const handleAddUnit = async (event) => {
    event.preventDefault();
    if (unitTitle.trim().length < 3) return;
    await addUnit({ courseId, title: unitTitle.trim() });
    setUnitTitle("");
    setAddingUnit(false);
  };

  const moveUnit = async (from, direction) => {
    const next = [...course.units];
    const to = from + direction;
    if (to < 0 || to >= next.length) return;
    [next[from], next[to]] = [next[to], next[from]];

    await reorderUnits({
      courseId,
      orderedUnitIds: next.map((unit) => unit.id),
    });
  };

  const handlePublish = async () => {
    setPublishError(null);
    try {
      await publishCourse(courseId).unwrap();
    } catch (err) {
      // 422 EMPTY_COURSE is user-safe and actionable (§5)
      setPublishError(getUserMessage(err, "Couldn't publish this course."));
    }
  };

  if (isLoading) {
    return (
      <DashboardCompLayout>
        <p className="text-text-muted">Loading course…</p>
      </DashboardCompLayout>
    );
  }

  if (isError || !course) {
    return (
      <DashboardCompLayout>
        <p className="text-danger">
          Couldn&apos;t load this course — {getUserMessage(error)}
        </p>
        <button
          type="button"
          onClick={() => navigate("/admin/manage-course")}
          className="mt-3 text-sm text-accent underline cursor-pointer"
        >
          Back to courses
        </button>
      </DashboardCompLayout>
    );
  }

  const units = course.units ?? [];
  const chapterCount = units.reduce(
    (sum, unit) => sum + (unit.chapters?.length ?? 0),
    0,
  );
  const isArchived = course.status === COURSE_STATUS.ARCHIVED;
  const busy = reorderState.isLoading;

  return (
    <>
      <DashboardCompLayout>
        <button
          type="button"
          onClick={() => navigate("/admin/manage-course")}
          className="mb-4 text-sm text-text-muted hover:text-text-primary cursor-pointer"
        >
          ← Back to courses
        </button>

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-text-primary">
                {course.title}
              </h1>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
                  STATUS_TONE[course.status] ?? STATUS_TONE.draft
                }`}
              >
                {course.status}
              </span>
            </div>
            {course.examTarget && (
              <p className="text-xs text-accent mt-1">{course.examTarget}</p>
            )}
            {course.description && (
              <p className="text-sm text-text-muted mt-2 max-w-prose">
                {course.description}
              </p>
            )}
          </div>

          <p className="text-xs text-text-muted shrink-0">
            {units.length} unit{units.length === 1 ? "" : "s"} · {chapterCount}{" "}
            chapter{chapterCount === 1 ? "" : "s"}
          </p>
        </div>

        <Can perm={PERMISSIONS.COURSE_AUTHOR}>
          <div className="flex gap-3 mt-4 max-w-md">
            {course.status === COURSE_STATUS.DRAFT && (
              <Btn
                title={publishState.isLoading ? "Publishing…" : "Publish"}
                variant="primary"
                size="sm"
                onClick={handlePublish}
                disabled={publishState.isLoading}
              />
            )}
            {!isArchived && (
              <Btn
                title={archiveState.isLoading ? "Archiving…" : "Archive"}
                variant="secondary"
                size="sm"
                onClick={() => archiveCourse(courseId)}
                disabled={archiveState.isLoading}
              />
            )}
          </div>
        </Can>

        {publishError && (
          <div className="mt-4 rounded-md bg-warning-muted border border-warning/40 px-4 py-3">
            <p className="text-warning text-xs font-semibold">
              {publishError}
            </p>
          </div>
        )}

        {isArchived && (
          <p className="mt-4 text-xs text-danger">
            This course is archived and read-only.
          </p>
        )}
      </DashboardCompLayout>

      <DashboardCompLayout>
        <div className={`flex flex-col gap-3 ${busy ? "opacity-60" : ""}`}>
          {units.length === 0 && (
            <p className="text-text-muted text-sm">
              No units yet. A course needs at least one unit with a chapter
              before it can be published.
            </p>
          )}

          {units.map((unit, index) => (
            <UnitAccordion
              key={unit.id}
              courseId={courseId}
              unit={unit}
              index={index}
              total={units.length}
              busy={busy}
              onMove={moveUnit}
            />
          ))}

          {!isArchived && (
            <Can perm={PERMISSIONS.COURSE_AUTHOR}>
              {addingUnit ? (
                <form onSubmit={handleAddUnit} className="flex gap-2 max-w-md">
                  <input
                    autoFocus
                    value={unitTitle}
                    onChange={(event) => setUnitTitle(event.target.value)}
                    placeholder="Unit title"
                    className="flex-1 text-sm py-2 px-3 bg-bg border border-border rounded-md outline-none text-text-primary placeholder:text-text-muted"
                  />
                  <div className="w-24">
                    <Btn
                      type="submit"
                      title={addUnitState.isLoading ? "…" : "Add"}
                      variant="primary"
                      size="sm"
                      disabled={addUnitState.isLoading}
                    />
                  </div>
                  <div className="w-24">
                    <Btn
                      type="button"
                      title="Cancel"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setAddingUnit(false);
                        setUnitTitle("");
                      }}
                    />
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setAddingUnit(true)}
                  className="self-start text-sm text-text-muted hover:text-text-primary cursor-pointer"
                >
                  + add unit
                </button>
              )}
            </Can>
          )}
        </div>
      </DashboardCompLayout>
    </>
  );
};

export default CourseDetail;
