import { useGetLearnerQuery } from "../../../app/apis/learner.api.js";
import { useGetBatchQuery } from "../../../app/apis/batches.api.js";
import { useGetCourseQuery } from "../../../app/apis/courses.api.js";
import { useGetTestDetailQuery } from "../../../app/apis/tests.api.js";

/*
 * Breadcrumb labels for detail routes. Each reads the same RTK Query cache
 * entry the page itself fills, so the crumb costs no extra request — it shows
 * the generic word for the moment the page is still loading, then the name.
 * `currentData` (not `data`) so a 404 never shows the previous record's name.
 */

export function LearnerCrumb({ id }) {
  const { currentData: data } = useGetLearnerQuery(id);
  return data?.fullName ?? "Learner";
}

export function BatchCrumb({ id }) {
  const { currentData: data } = useGetBatchQuery(id);
  return data?.name ?? "Batch";
}

export function CourseCrumb({ id }) {
  const { currentData: data } = useGetCourseQuery(id);
  return data?.title ?? "Course";
}

export function TestCrumb({ id }) {
  const { currentData: data } = useGetTestDetailQuery(id);
  return data?.title ?? "Test";
}
