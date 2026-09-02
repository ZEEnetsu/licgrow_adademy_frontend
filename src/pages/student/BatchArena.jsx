import { NavLink, useNavigate, useParams } from "react-router-dom";

import { useGetMyBatchArenaQuery } from "../../app/apis/batches.api.js";
import { ERROR_CODES, getUserMessage } from "../../app/apis/apiError.js";

/**
 * The learner arena — `api-contracts/06-batch.md` §14.
 *
 * One request returns the batch, its published courses, its published tests
 * (with the caller's own attempt status), and announcements.
 *
 * NOT_A_BATCH_MEMBER is deliberately shown as "locked" rather than explained:
 * the contract marks that code as not user-safe, since spelling out why would
 * leak the batch's composition.
 */
const BatchArena = () => {
  const { batchId } = useParams();
  const navigate = useNavigate();

  const { data: arena, isLoading, isError, error } = useGetMyBatchArenaQuery(
    batchId,
    { skip: !batchId },
  );

  if (isLoading) {
    return <p className="text-text-muted text-sm">Loading…</p>;
  }

  if (isError) {
    const locked = error?.code === ERROR_CODES.NOT_A_BATCH_MEMBER;
    return (
      <div>
        <p className="text-danger text-sm">
          {locked
            ? "This batch is locked. You are not currently a member."
            : `Couldn't load this batch — ${getUserMessage(error)}`}
        </p>
        <button
          type="button"
          onClick={() => navigate("/student")}
          className="mt-3 text-sm text-accent underline cursor-pointer"
        >
          Back to my batches
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate("/student")}
        className="text-sm text-text-muted hover:text-text-primary cursor-pointer"
      >
        ← My batches
      </button>

      <h1 className="text-2xl font-semibold mt-3">{arena.name}</h1>
      <p className="text-xs text-text-muted mt-1">
        {arena.startDate} → {arena.endDate}
      </p>
      {arena.description && (
        <p className="text-sm text-text-muted mt-2">{arena.description}</p>
      )}

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
          Courses
        </h2>
        {arena.courses.length === 0 ? (
          <p className="text-text-muted text-sm mt-2">
            No courses published into this batch yet.
          </p>
        ) : (
          <div className="grid gap-3 mt-3 md:grid-cols-2">
            {arena.courses.map((course) => (
              <NavLink
                key={course.id}
                to={`/student/batches/${batchId}/courses/${course.id}`}
                className="rounded-lg border border-border-muted bg-surface hover:bg-surface-hover transition-colors p-4"
              >
                <p className="font-medium text-text-primary">{course.title}</p>
                <p className="text-xs text-text-muted mt-1">
                  {course.unitCount} unit{course.unitCount === 1 ? "" : "s"}
                </p>
              </NavLink>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
          Mock tests
        </h2>
        {arena.tests.length === 0 ? (
          <p className="text-text-muted text-sm mt-2">
            No tests published into this batch yet.
          </p>
        ) : (
          <div className="flex flex-col gap-2 mt-3">
            {arena.tests.map((test) => (
              <div
                key={test.id}
                className="flex items-center gap-4 rounded-lg border border-border-muted bg-surface p-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-text-primary truncate">
                    {test.title}
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    {test.durationMinutes
                      ? `${test.durationMinutes} minutes`
                      : "Untimed"}
                    {test.myBestScorePct !== null &&
                      ` · best ${test.myBestScorePct}%`}
                  </p>
                </div>
                <NavLink
                  to={`/student/tests/${test.id}`}
                  className="px-4 py-2 rounded-md text-sm bg-accent/20 text-accent hover:bg-accent/30 transition-colors shrink-0"
                >
                  {test.myStatus === "not_started" ? "Start" : "Resume"}
                </NavLink>
              </div>
            ))}
          </div>
        )}
      </section>

      {arena.announcements.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
            Announcements
          </h2>
          <div className="flex flex-col gap-2 mt-3">
            {arena.announcements.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-border-muted p-3"
              >
                <p className="text-sm text-text-primary">
                  {item.isPinned && <span className="text-accent mr-2">📌</span>}
                  {item.title}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default BatchArena;
