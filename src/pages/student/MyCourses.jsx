import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

import {
  EmptyState,
  InteractiveCard,
  Pill,
  SectionTitle,
} from "../../components/ui/Surface.jsx";
import {
  batchesApi,
  useGetMyBatchArenaQuery,
  useGetMyBatchesQuery,
} from "../../app/apis/batches.api.js";

/**
 * My courses — every course published into a batch the learner belongs to.
 *
 * There is deliberately no global "list my courses" endpoint: 08 §15 states
 * that a learner reaches a course only through a batch
 * (`/me/batches/:batchId/courses/:courseId`), and there is "no global 'open
 * any course' route". So this composes the list from each batch's arena and
 * keeps the batch context on every link — without it the reader would have no
 * valid URL to navigate to.
 */

const ArenaSubscription = ({ batchId }) => {
  useGetMyBatchArenaQuery(batchId);
  return null;
};

const MyCourses = () => {
  const { data: batches = [], isLoading } = useGetMyBatchesQuery();

  // select the arenas already being fetched by the subscriptions below
  const arenas = useSelector((state) =>
    batches.map((batch) => ({
      batch,
      query: batchesApi.endpoints.getMyBatchArena.select(batch.id)(state),
    })),
  );

  const subscriptions = batches.map((batch) => (
    <ArenaSubscription key={batch.id} batchId={batch.id} />
  ));

  if (isLoading || arenas.some((a) => a.query.isLoading || a.query.isUninitialized)) {
    return (
      <>
        {subscriptions}
        <p className="text-text-muted text-sm">Loading your courses…</p>
      </>
    );
  }

  if (batches.length === 0) {
    return (
      <>
        {subscriptions}
        <EmptyState
          title="You're not in a batch yet"
          hint="Courses are published into batches — join one to start learning."
          action={
            <NavLink
              to="/student/browse"
              className="inline-block px-4 py-2 rounded-md bg-accent/20 text-accent text-sm font-medium hover:bg-accent/30 transition-colors"
            >
              Browse batches →
            </NavLink>
          }
        />
      </>
    );
  }

  const withCourses = arenas.filter((a) => (a.query.data?.courses ?? []).length > 0);
  const total = withCourses.reduce(
    (sum, a) => sum + a.query.data.courses.length,
    0,
  );

  return (
    <div>
      {subscriptions}

      <h1 className="text-2xl font-semibold text-text-primary">My courses</h1>
      <p className="text-sm text-text-muted mt-1">
        {total} course{total === 1 ? "" : "s"} across {batches.length} batch
        {batches.length === 1 ? "" : "es"}.
      </p>

      {withCourses.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No courses published yet"
            hint="Your batch has no course material yet. Check back soon."
          />
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-8">
          {/* grouped by batch, because the batch is part of the course's URL */}
          {withCourses.map(({ batch, query }) => (
            <section key={batch.id}>
              <SectionTitle
                action={
                  <NavLink
                    to={`/student/batches/${batch.id}`}
                    className="text-[11px] text-accent hover:underline normal-case tracking-normal"
                  >
                    Open batch →
                  </NavLink>
                }
              >
                {batch.name}
              </SectionTitle>

              <div className="grid gap-3 md:grid-cols-2">
                {query.data.courses.map((course) => (
                  <InteractiveCard
                    key={course.id}
                    as={NavLink}
                    to={`/student/batches/${batch.id}/courses/${course.id}`}
                    className="block"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-medium text-text-primary">
                        {course.title}
                      </p>
                      <Pill tone="accent">
                        {course.unitCount} unit{course.unitCount === 1 ? "" : "s"}
                      </Pill>
                    </div>
                    <p className="text-[11px] text-text-muted mt-2">
                      Video lessons, with a quiz at the end of each unit.
                    </p>
                  </InteractiveCard>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCourses;
