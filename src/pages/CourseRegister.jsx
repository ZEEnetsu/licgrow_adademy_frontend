import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  formatMutationError,
  useGetAvailableCoursesQuery,
  useSubmitEnrollmentMutation,
} from "../store/api/index.js";
import { Button, Card, Input, SectionHeading } from "../components/shared";

const CourseRegister = () => {
  const navigate = useNavigate();
  const {
    data: courses = [],
    isLoading,
    isError,
    refetch,
  } = useGetAvailableCoursesQuery();

  const [submitEnrollment, { isLoading: submitting, error: submitError }] =
    useSubmitEnrollmentMutation();

  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [licAgentCode, setLicAgentCode] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourseId || !licAgentCode.trim()) return;

    const result = await submitEnrollment({
      courseId: selectedCourseId,
      licAgentCode: licAgentCode.trim(),
    });

    if (!result.error) {
      navigate("/pending-approval", { replace: true });
    }
  };

  return (
    <div className="space-y-10">
      <SectionHeading
        label="Gate 02 · Course allocation"
        title="Select immersion track & verify LIC agent code"
        subtitle="Your selection provisions sandbox environments and mentor pairing. Administrator attestation is mandatory before dashboard ingress."
      />

      <section>
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
          Available cohorts
        </h2>

        {isLoading && <CoursesSkeleton />}

        {isError && (
          <Card
            variant="surface"
            className="flex flex-wrap items-center justify-between gap-4"
          >
            <p className="text-sm text-rose-300">
              Endpoint unreachable — retry or escalate to IT desk.
            </p>
            <Button variant="outline" size="sm" onClick={refetch}>
              Retry fetch
            </Button>
          </Card>
        )}

        {!isLoading && !isError && courses.length === 0 && (
          <Card
            variant="flat"
            className="border-slate-800 text-sm text-slate-400"
          >
            No public cohorts accepting enrollment at this timestamp.
          </Card>
        )}

        {!isLoading && courses.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {courses.map((course) => {
              const courseId = course.courseId ?? course.course_id;
              const selected = selectedCourseId === courseId;
              return (
                <Card
                  as="button"
                  type="button"
                  key={courseId}
                  onClick={() => setSelectedCourseId(courseId)}
                  variant="surface"
                  interactive
                  className={[
                    "text-left",
                    selected ? "border-indigo-500/50 shadow-indigo-900/30" : "",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-semibold text-slate-50">
                      {course.title}
                    </h3>
                    <span
                      className={[
                        "mt-1 h-3 w-3 flex-shrink-0 rounded-sm border",
                        selected
                          ? "border-indigo-400 bg-indigo-500"
                          : "border-slate-600 bg-slate-900",
                      ].join(" ")}
                      aria-hidden
                    />
                  </div>
                  <p className="mt-2 text-sm text-slate-400">
                    {course.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3 text-[11px] text-slate-500">
                    {course.duration_weeks && (
                      <span>{course.duration_weeks} weeks</span>
                    )}
                    {course.modules_count != null && (
                      <span>{course.modules_count} modules</span>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <Card variant="surface" padding="lg" as="form" onSubmit={handleSubmit}>
        <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
          Regulatory identifier
        </h2>
        <Input
          label="LIC agent code"
          required
          value={licAgentCode}
          onChange={(e) => setLicAgentCode(e.target.value)}
          placeholder="Official alphanumeric code"
          hint="Submitted to compliance queue — typical review SLA 24–48 hours."
          className="mt-6"
        />

        {submitError && (
          <p className="mt-4 rounded-sm border border-rose-500/35 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-200">
            {formatMutationError(submitError) ||
              "Submission rejected — validate formatting or contact desk."}
          </p>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            {selectedCourseId ? "Cohort locked." : "Select cohort row above."}
          </p>
          <Button
            type="submit"
            variant="primary"
            disabled={submitting || !selectedCourseId || !licAgentCode.trim()}
          >
            {submitting ? "Transmitting…" : "Submit for attestation"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

const CoursesSkeleton = () => (
  <div className="grid gap-4 sm:grid-cols-2">
    {[0, 1, 2, 3].map((i) => (
      <div
        key={i}
        className="rounded border border-slate-800 bg-slate-900/50 p-6"
      >
        <div className="h-4 w-2/3 rounded-sm bg-slate-800" />
        <div className="mt-3 h-3 w-full rounded-sm bg-slate-800/80" />
        <div className="mt-2 h-3 w-5/6 rounded-sm bg-slate-800/80" />
      </div>
    ))}
  </div>
);

export default CourseRegister;
