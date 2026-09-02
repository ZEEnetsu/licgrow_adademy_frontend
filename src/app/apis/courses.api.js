/**
 * Course tree — `api-contracts/08-course.md` (staff-admin authoring).
 *
 * Permissions: `course:read` for reads, `course:author` for writes.
 *
 * CACHING NOTE: §3 returns the entire course as one document (units, their
 * chapters, and each unit's quiz reference). So every mutation anywhere in the
 * tree — a chapter three levels down — invalidates that one Course tag. Tagging
 * units or chapters separately would be finer-grained but wrong: nothing reads
 * them independently.
 *
 * Language: English only here. Bilingual applies to test questions alone
 * (conventions §9), so no Accept-Language handling.
 */

import { createApi } from "@reduxjs/toolkit/query/react";

import baseQueryWithReauth from "./baseQuery.js";
import {
  normalizeApiError,
  noContentResponseHandler,
} from "./apiError.js";
import { registerApi } from "./registry.js";
import { testSlice } from "./tests.api.js";

export const COURSE_STATUS = Object.freeze({
  DRAFT: "draft",
  PUBLISHED: "published",
  ARCHIVED: "archived",
});

const unwrap = (response) => response?.data ?? null;

const unwrapList = (response) => ({
  items: Array.isArray(response?.data) ? response.data : [],
  meta: response?.meta ?? null,
});

const courseTag = (id) => ({ type: "Course", id });

/** Every write inside a course invalidates that course plus the list summary. */
const invalidateCourse = (_r, _e, arg) => [
  courseTag(typeof arg === "string" ? arg : arg.courseId),
  courseTag("LIST"),
];

export const coursesApi = createApi({
  reducerPath: "coursesApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Course"],
  endpoints: (builder) => ({
    // ── courses ────────────────────────────────────────────────────────────

    /** §2 — summaries `{ id, title, examTarget, status, unitCount, updatedAt }`. */
    getCourses: builder.query({
      query: (params = {}) => ({ url: "/admin/courses", params }),
      transformResponse: unwrapList,
      transformErrorResponse: normalizeApiError,
      providesTags: (result) => [
        courseTag("LIST"),
        ...(result?.items ?? []).map((course) => courseTag(course.id)),
      ],
    }),

    /** §3 — the full tree: units → chapters, plus each unit's quiz reference. */
    getCourse: builder.query({
      query: (courseId) => `/admin/courses/${courseId}`,
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      providesTags: (_r, _e, courseId) => [courseTag(courseId)],
    }),

    /** §1 — create. Body: `{ title, description?, examTarget? }`. */
    createCourse: builder.mutation({
      query: (body) => ({ url: "/admin/courses", method: "POST", body }),
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      invalidatesTags: [courseTag("LIST")],
    }),

    /** §4 — metadata only: title, description, examTarget. */
    updateCourse: builder.mutation({
      query: ({ courseId, ...body }) => ({
        url: `/admin/courses/${courseId}`,
        method: "PATCH",
        body,
      }),
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      invalidatesTags: invalidateCourse,
    }),

    /** §5 — publish. 422 `EMPTY_COURSE` unless ≥1 unit has ≥1 chapter. */
    publishCourse: builder.mutation({
      query: (courseId) => ({
        url: `/admin/courses/${courseId}/publish`,
        method: "POST",
      }),
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      invalidatesTags: invalidateCourse,
    }),

    /** §6 — archive. Idempotent; the course becomes read-only. */
    archiveCourse: builder.mutation({
      query: (courseId) => ({
        url: `/admin/courses/${courseId}/archive`,
        method: "POST",
      }),
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      invalidatesTags: invalidateCourse,
    }),

    /**
     * §15 — learner read, scoped to a batch they belong to.
     *
     * Deferred from Phase 3 because it needs batch membership. Two distinct
     * failures: 403 NOT_A_BATCH_MEMBER when the caller isn't a member, and 404
     * when the course simply isn't published into that batch (existence is
     * privileged, so the two must not be distinguishable to an outsider).
     */
    getMyCourse: builder.query({
      query: ({ batchId, courseId }) =>
        `/me/batches/${batchId}/courses/${courseId}`,
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      providesTags: (_r, _e, { courseId }) => [courseTag(courseId)],
    }),

    // ── units ──────────────────────────────────────────────────────────────

    /** §7 — add. `sequence` omitted means append. */
    addUnit: builder.mutation({
      query: ({ courseId, ...body }) => ({
        url: `/admin/courses/${courseId}/units`,
        method: "POST",
        body,
      }),
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      invalidatesTags: invalidateCourse,
    }),

    /** §8 — rename. */
    updateUnit: builder.mutation({
      query: ({ courseId, unitId, ...body }) => ({
        url: `/admin/courses/${courseId}/units/${unitId}`,
        method: "PATCH",
        body,
      }),
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      invalidatesTags: invalidateCourse,
    }),

    /**
     * §9 — delete. Chapters cascade. A linked quiz is NOT deleted — its
     * `unitId` is cleared, leaving the test orphaned but intact.
     *
     * That side effect crosses module boundaries: the quiz lives in
     * tests.api.js, whose cached copy still claims a `unitId`. A Course tag
     * can't reach it, so the tests cache is invalidated explicitly. Without
     * this the test list shows a stale attachment until something else
     * happens to refetch it.
     */
    deleteUnit: builder.mutation({
      query: ({ courseId, unitId }) => ({
        url: `/admin/courses/${courseId}/units/${unitId}`,
        method: "DELETE",
        responseHandler: noContentResponseHandler,
      }),
      transformErrorResponse: normalizeApiError,
      invalidatesTags: invalidateCourse,
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(testSlice.util.invalidateTags([{ type: "Test", id: "LIST" }]));
        } catch {
          // deletion failed — nothing to invalidate
        }
      },
    }),

    /** §10 — full-array reorder: `{ orderedUnitIds }`, exact current set. */
    reorderUnits: builder.mutation({
      query: ({ courseId, orderedUnitIds }) => ({
        url: `/admin/courses/${courseId}/units/reorder`,
        method: "PUT",
        body: { orderedUnitIds },
      }),
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      invalidatesTags: invalidateCourse,
    }),

    // ── chapters ───────────────────────────────────────────────────────────

    /** §11 — add. `youtubeUrl` is required and edge-validated. */
    addChapter: builder.mutation({
      query: ({ courseId, unitId, ...body }) => ({
        url: `/admin/courses/${courseId}/units/${unitId}/chapters`,
        method: "POST",
        body,
      }),
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      invalidatesTags: invalidateCourse,
    }),

    /** §12 — update title / youtubeUrl / description. */
    updateChapter: builder.mutation({
      query: ({ courseId, unitId, chapterId, ...body }) => ({
        url: `/admin/courses/${courseId}/units/${unitId}/chapters/${chapterId}`,
        method: "PATCH",
        body,
      }),
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      invalidatesTags: invalidateCourse,
    }),

    /** §13 — delete. */
    deleteChapter: builder.mutation({
      query: ({ courseId, unitId, chapterId }) => ({
        url: `/admin/courses/${courseId}/units/${unitId}/chapters/${chapterId}`,
        method: "DELETE",
        responseHandler: noContentResponseHandler,
      }),
      transformErrorResponse: normalizeApiError,
      invalidatesTags: invalidateCourse,
    }),

    /** §14 — full-array reorder within a unit. */
    reorderChapters: builder.mutation({
      query: ({ courseId, unitId, orderedChapterIds }) => ({
        url: `/admin/courses/${courseId}/units/${unitId}/chapters/reorder`,
        method: "PUT",
        body: { orderedChapterIds },
      }),
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      invalidatesTags: invalidateCourse,
    }),
  }),
});

registerApi(coursesApi);

export const {
  useGetCoursesQuery,
  useGetCourseQuery,
  useGetMyCourseQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  usePublishCourseMutation,
  useArchiveCourseMutation,
  useAddUnitMutation,
  useUpdateUnitMutation,
  useDeleteUnitMutation,
  useReorderUnitsMutation,
  useAddChapterMutation,
  useUpdateChapterMutation,
  useDeleteChapterMutation,
  useReorderChaptersMutation,
} = coursesApi;

export default coursesApi;
