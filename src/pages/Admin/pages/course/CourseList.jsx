import { useState } from "react";
import { NavLink, useSearchParams } from "react-router-dom";

import DashboardCompLayout from "../../../../layouts/DashboardCompLayout.jsx";
import Btn from "../../components/Btn.jsx";
import Can from "../../../../components/auth/Can.jsx";
import ProtalLayout from "../../../../layouts/PortalLayput.jsx";
import CreateCourseForm from "./CreateCourseForm.jsx";
import { PERMISSIONS } from "../../../../app/features/auth/permissions.js";
import { getUserMessage } from "../../../../app/apis/apiError.js";
import {
  useGetCoursesQuery,
  COURSE_STATUS,
} from "../../../../app/apis/courses.api.js";

/**
 * Course catalogue — `api-contracts/08-course.md` §2.
 *
 * A course carries no thumbnail, instructor or duration: the contract's course
 * is a curriculum tree, and its imagery comes from the chapters' YouTube
 * videos. The card therefore leads with exam target and structure.
 */

const TABS = [
  { label: "All", status: null },
  { label: "Draft", status: COURSE_STATUS.DRAFT },
  { label: "Published", status: COURSE_STATUS.PUBLISHED },
  { label: "Archived", status: COURSE_STATUS.ARCHIVED },
];

const STATUS_TONE = {
  [COURSE_STATUS.PUBLISHED]: "bg-success-muted text-success",
  [COURSE_STATUS.ARCHIVED]: "bg-danger-muted text-danger",
  [COURSE_STATUS.DRAFT]: "bg-surface-elevated-hover text-text-primary",
};

const CourseCard = ({ course }) => (
  <NavLink
    to={course.id}
    className="flex flex-col justify-between rounded-lg bg-surface-elevated shadow-elevate hover:bg-surface-elevated-hover hover:shadow-elevate-hover transition-[background-color,box-shadow] duration-200 p-4 min-h-36"
  >
    <div>
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-text-primary leading-snug">
          {course.title}
        </p>
        <span
          className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
            STATUS_TONE[course.status] ?? STATUS_TONE.draft
          }`}
        >
          {course.status}
        </span>
      </div>
      {course.examTarget && (
        <p className="text-xs text-accent mt-1">{course.examTarget}</p>
      )}
    </div>

    <p className="text-xs text-text-muted mt-3">
      {course.unitCount} unit{course.unitCount === 1 ? "" : "s"}
    </p>
  </NavLink>
);

const CourseList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [creating, setCreating] = useState(false);

  const status = searchParams.get("status");
  const { data, isLoading, isError, error, isFetching } = useGetCoursesQuery(
    status ? { status } : undefined,
  );

  const courses = data?.items ?? [];

  return (
    <DashboardCompLayout>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex flex-wrap gap-4 items-center">
          {TABS.map((tab) => (
            <button
              key={tab.label}
              type="button"
              onClick={() =>
                setSearchParams(tab.status ? { status: tab.status } : {})
              }
              className={`text-sm transition-colors cursor-pointer ${
                status === tab.status
                  ? "text-text-primary font-medium"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <Can perm={PERMISSIONS.COURSE_AUTHOR}>
          <div className="w-40">
            <Btn
              title="New course"
              variant="secondary"
              size="sm"
              onClick={() => setCreating(true)}
            />
          </div>
        </Can>
      </div>

      {isLoading ? (
        <p className="text-text-muted text-sm">Loading courses…</p>
      ) : isError ? (
        <p className="text-danger text-sm">
          Couldn&apos;t load courses — {getUserMessage(error)}
        </p>
      ) : courses.length === 0 ? (
        <div>
          <p className="font-semibold text-text-muted">
            {status ? `No ${status} courses.` : "No courses yet."}
          </p>
          <p className="text-text-muted text-xs mt-1">
            A course is a tree of units and chapters, each chapter a YouTube
            lesson.
          </p>
        </div>
      ) : (
        <div
          className={`grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4 ${
            isFetching ? "opacity-60 transition-opacity" : ""
          }`}
        >
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}

      {creating && (
        <ProtalLayout heading="New course" onClose={() => setCreating(false)}>
          <CreateCourseForm onClose={() => setCreating(false)} />
        </ProtalLayout>
      )}
    </DashboardCompLayout>
  );
};

export default CourseList;
