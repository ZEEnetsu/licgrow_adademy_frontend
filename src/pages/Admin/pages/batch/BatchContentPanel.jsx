import { useState } from "react";
import { NavLink } from "react-router-dom";

import Btn from "../../components/Btn.jsx";
import Can from "../../../../components/auth/Can.jsx";
import { PERMISSIONS } from "../../../../app/features/auth/permissions.js";
import { getUserMessage } from "../../../../app/apis/apiError.js";
import {
  useGetBatchCoursesQuery,
  useGetBatchTestsQuery,
  usePublishCourseToBatchMutation,
  usePublishTestToBatchMutation,
  useUnpublishCourseFromBatchMutation,
  useUnpublishTestFromBatchMutation,
} from "../../../../app/apis/batches.api.js";
import {
  useGetCoursesQuery,
  COURSE_STATUS,
} from "../../../../app/apis/courses.api.js";
import {
  useGetTestsQuery,
  TEST_STATUS,
  TEST_KIND,
} from "../../../../app/apis/tests.api.js";

/**
 * Courses / tests published into a batch — `06-batch.md` §6–9.
 *
 * The picker only ever offers eligible content, because the server refuses the
 * rest and a dropdown full of choices that 422 is worse than a short one:
 *   · only `published` content may enter a batch (CONTENT_NOT_PUBLISHED)
 *   · a quiz never enters a batch at all — it reaches learners through its
 *     unit's course (10-submission.md §1)
 *   · already-linked content would 409 ALREADY_PUBLISHED
 */
const BatchContentPanel = ({ batchId, kind, readOnly }) => {
  const isCourses = kind === "courses";
  const [picking, setPicking] = useState(false);
  const [selected, setSelected] = useState("");
  const [actionError, setActionError] = useState(null);

  const linkedCourses = useGetBatchCoursesQuery(
    { batchId },
    { skip: !isCourses },
  );
  const linkedTests = useGetBatchTestsQuery({ batchId }, { skip: isCourses });
  const linked = isCourses ? linkedCourses : linkedTests;

  // candidates are only fetched once the picker opens
  const allCourses = useGetCoursesQuery(
    { status: COURSE_STATUS.PUBLISHED },
    { skip: !picking || !isCourses },
  );
  const allTests = useGetTestsQuery(
    { status: TEST_STATUS.PUBLISHED },
    { skip: !picking || isCourses },
  );

  const [publishCourse, publishCourseState] = usePublishCourseToBatchMutation();
  const [publishTest, publishTestState] = usePublishTestToBatchMutation();
  const [unpublishCourse] = useUnpublishCourseFromBatchMutation();
  const [unpublishTest] = useUnpublishTestFromBatchMutation();

  const publishing =
    publishCourseState.isLoading || publishTestState.isLoading;

  const items = linked.data?.items ?? [];
  const linkedIds = new Set(items.map((item) => item.id));

  const candidates = (
    isCourses
      ? (allCourses.data?.items ?? [])
      : (allTests.data?.items ?? []).filter(
          // quizzes reach learners via their course, never via a batch
          (test) => test.kind === TEST_KIND.TEST,
        )
  ).filter((item) => !linkedIds.has(item.id));

  const handlePublish = async (event) => {
    event.preventDefault();
    if (!selected) return;
    setActionError(null);

    try {
      if (isCourses) {
        await publishCourse({ batchId, courseId: selected }).unwrap();
      } else {
        await publishTest({ batchId, testId: selected }).unwrap();
      }
      setSelected("");
      setPicking(false);
    } catch (err) {
      setActionError(getUserMessage(err, "That content was rejected."));
    }
  };

  const handleRemove = (id) =>
    isCourses
      ? unpublishCourse({ batchId, courseId: id })
      : unpublishTest({ batchId, testId: id });

  if (linked.isLoading) {
    return <p className="text-text-muted text-sm">Loading…</p>;
  }

  if (linked.isError) {
    return (
      <p className="text-danger text-sm">
        Couldn&apos;t load — {getUserMessage(linked.error)}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {items.length === 0 && (
        <p className="text-text-muted text-sm">
          No {isCourses ? "courses" : "tests"} published into this batch yet.
        </p>
      )}

      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-3 py-2 px-3 rounded-md bg-surface/50 hover:bg-surface transition-colors"
        >
          <NavLink
            to={
              isCourses
                ? `/admin/manage-course/${item.id}`
                : `/admin/manage-test/tests/${item.id}`
            }
            className="min-w-0 flex-1"
          >
            <p className="text-sm text-text-primary truncate">{item.title}</p>
            <p className="text-[11px] text-text-muted">
              {isCourses
                ? `${item.unitCount} unit${item.unitCount === 1 ? "" : "s"}`
                : `${item.totalMarks ?? 0} marks${
                    item.durationMinutes ? ` · ${item.durationMinutes}m` : " · untimed"
                  }`}
            </p>
          </NavLink>

          {!readOnly && (
            <Can perm={PERMISSIONS.BATCH_MANAGE}>
              <button
                type="button"
                onClick={() => handleRemove(item.id)}
                title="Remove from batch"
                className="text-xs text-text-muted hover:text-danger px-2 py-1 cursor-pointer"
              >
                remove
              </button>
            </Can>
          )}
        </div>
      ))}

      {!readOnly && (
        <Can perm={PERMISSIONS.BATCH_MANAGE}>
          {picking ? (
            <form onSubmit={handlePublish} className="flex gap-2 mt-2 max-w-2xl">
              <select
                value={selected}
                onChange={(event) => setSelected(event.target.value)}
                className="flex-1 text-sm py-2 px-3 bg-bg border border-border rounded-md outline-none text-text-primary"
              >
                <option value="">
                  {candidates.length
                    ? `Select a published ${isCourses ? "course" : "test"}…`
                    : `No eligible ${isCourses ? "courses" : "tests"}`}
                </option>
                {candidates.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
              <div className="w-28">
                <Btn
                  type="submit"
                  title={publishing ? "…" : "Add"}
                  variant="primary"
                  size="sm"
                  disabled={!selected || publishing}
                />
              </div>
              <div className="w-28">
                <Btn
                  type="button"
                  title="Cancel"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setPicking(false);
                    setSelected("");
                    setActionError(null);
                  }}
                />
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setPicking(true)}
              className="self-start text-sm text-text-muted hover:text-text-primary mt-2 cursor-pointer"
            >
              + publish {isCourses ? "a course" : "a test"} into this batch
            </button>
          )}
        </Can>
      )}

      {actionError && (
        <p className="text-warning text-xs font-semibold mt-1">
          {actionError}
        </p>
      )}

      {picking && candidates.length === 0 && (
        <p className="text-[11px] text-text-muted mt-1">
          Only published {isCourses ? "courses" : "tests"} can be added.
          {!isCourses && " Quizzes reach learners through their unit's course."}
        </p>
      )}
    </div>
  );
};

export default BatchContentPanel;
