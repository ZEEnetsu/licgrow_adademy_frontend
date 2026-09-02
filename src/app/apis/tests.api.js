/**
 * Test / quiz authoring — `api-contracts/09-test.md` (staff-admin).
 *
 * One engine serves both quizzes (attached to a course unit) and full-length
 * tests (published into a batch). They differ by a `kind` flag, not mechanism.
 *
 * Permissions: `test:read` for reads, `test:author` for writes (05-rbac.md).
 * Auth headers and 401 recovery come from the shared `baseQueryWithReauth`.
 *
 * NOTE ON LANGUAGE: admin authoring reads return BOTH `en` and `hi` regardless
 * of `Accept-Language` (conventions §9) — the author needs to edit either. So
 * no language header is sent here. Learner-facing reads (10-submission.md) are
 * where `Accept-Language` matters.
 */

import { createApi } from "@reduxjs/toolkit/query/react";

import baseQueryWithReauth from "./baseQuery.js";
import {
  normalizeApiError,
  noContentResponseHandler,
} from "./apiError.js";
import { registerApi } from "./registry.js";

export const TEST_KIND = Object.freeze({ QUIZ: "quiz", TEST: "test" });
export const TEST_STATUS = Object.freeze({
  DRAFT: "draft",
  PUBLISHED: "published",
  ARCHIVED: "archived",
});

/** Single-resource endpoints: unwrap `{ data: … }` (conventions §4). */
const unwrap = (response) => response?.data ?? null;

/**
 * Collection endpoints: unwrap to `{ items, meta }`.
 *
 * The contract returns `{ data: [...], meta: { page, limit, total, … } }`.
 * Flattening to a bare array would throw away pagination, so both are kept
 * under stable names.
 */
const unwrapList = (response) => ({
  items: Array.isArray(response?.data) ? response.data : [],
  meta: response?.meta ?? null,
});

const testTag = (id) => ({ type: "Test", id });
const questionListTag = (testId) => ({ type: "Question", id: `LIST:${testId}` });

export const testSlice = createApi({
  reducerPath: "test",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Test", "Question"],
  endpoints: (builder) => ({
    // ── tests ──────────────────────────────────────────────────────────────

    /**
     * §2 — list. Query params: `kind`, `status`, `unitId`, `courseId`, `q`,
     * `page`, `limit`, `sort`. Returns summaries:
     * `{ id, kind, title, status, totalMarks, questionCount, updatedAt }`.
     */
    getTests: builder.query({
      query: (params = {}) => ({ url: "/admin/tests", params }),
      transformResponse: unwrapList,
      transformErrorResponse: normalizeApiError,
      providesTags: (result) => [
        testTag("LIST"),
        ...(result?.items ?? []).map((test) => testTag(test.id)),
      ],
    }),

    /** §3 — full metadata + `questionCount`. Questions come from §9. */
    getTestDetail: builder.query({
      query: (testId) => `/admin/tests/${testId}`,
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      providesTags: (_r, _e, testId) => [testTag(testId)],
    }),

    /**
     * §1 — create. Starts as `draft` with `totalMarks: 0`.
     *
     * Required: `kind`, `title`, `passingMarks`, `maxAttempts`
     * (`maxAttempts` must be PRESENT — `null` means unlimited, but the key
     * cannot be omitted). Unknown fields are rejected by the strict schema,
     * so send only documented keys.
     */
    createTest: builder.mutation({
      query: (body) => ({ url: "/admin/tests", method: "POST", body }),
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      invalidatesTags: [testTag("LIST")],
    }),

    /** §4 — update any config field except `kind`. */
    updateTest: builder.mutation({
      query: ({ testId, ...body }) => ({
        url: `/admin/tests/${testId}`,
        method: "PATCH",
        body,
      }),
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      invalidatesTags: (_r, _e, { testId }) => [testTag(testId), testTag("LIST")],
    }),

    /** §5 — delete. Only when `draft` with zero attempts, else 422. */
    deleteTest: builder.mutation({
      query: (testId) => ({
        url: `/admin/tests/${testId}`,
        method: "DELETE",
        responseHandler: noContentResponseHandler,
      }),
      transformErrorResponse: normalizeApiError,
      invalidatesTags: (_r, _e, testId) => [testTag(testId), testTag("LIST")],
    }),

    /**
     * §6 — publish (`draft → published`).
     * On failure returns 422 `TEST_NOT_PUBLISHABLE` whose `details` lists what
     * is missing (untranslated questions, no correct option, marks mismatch).
     */
    publishTest: builder.mutation({
      query: (testId) => ({
        url: `/admin/tests/${testId}/publish`,
        method: "POST",
      }),
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      invalidatesTags: (_r, _e, testId) => [testTag(testId), testTag("LIST")],
    }),

    /** §7 — archive. Idempotent; auto-removed from batches. */
    archiveTest: builder.mutation({
      query: (testId) => ({
        url: `/admin/tests/${testId}/archive`,
        method: "POST",
      }),
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      invalidatesTags: (_r, _e, testId) => [testTag(testId), testTag("LIST")],
    }),

    // ── questions ──────────────────────────────────────────────────────────

    /**
     * §9 — the question list, in `AdminQuestion` shape:
     * `{ id, sequence, marks, statement:{en,hi}, explanation:{en,hi},
     *    options:[{ id, text:{en,hi} }], correctOptionId }`
     *
     * `correctOptionId` and `explanation` are admin-only and never appear in
     * the learner shape — that separation is a contract guarantee, not a
     * filter (conventions §10).
     */
    getTestQuestions: builder.query({
      query: (testId) => `/admin/tests/${testId}/questions`,
      transformResponse: (response) =>
        Array.isArray(response?.data) ? response.data : [],
      transformErrorResponse: normalizeApiError,
      providesTags: (result, _e, testId) => [
        questionListTag(testId),
        ...(result ?? []).map((q) => ({ type: "Question", id: q.id })),
      ],
    }),

    /** §10 — a single question, admin shape. */
    getQuestion: builder.query({
      query: ({ testId, questionId }) =>
        `/admin/tests/${testId}/questions/${questionId}`,
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      providesTags: (_r, _e, { questionId }) => [
        { type: "Question", id: questionId },
      ],
    }),

    /**
     * §8 — bulk-add (atomic: all or nothing).
     *
     * Body: `{ questions: [{ marks, statement:{en,hi}, explanation?:{en,hi},
     *          options:[{ text:{en,hi} }] (2–6), correctIndex }] }`
     *
     * Drafts may omit `hi`; `en` is required for the statement and every
     * option. Full bilingual completeness is enforced at publish.
     *
     * Invalidates the parent test too — `totalMarks` is recomputed server-side.
     */
    addQuestions: builder.mutation({
      query: ({ testId, questions }) => ({
        url: `/admin/tests/${testId}/questions`,
        method: "POST",
        body: { questions },
      }),
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      invalidatesTags: (_r, _e, { testId }) => [
        questionListTag(testId),
        testTag(testId),
        testTag("LIST"),
      ],
    }),

    /**
     * §11 — update a question. Adding/removing options replaces the whole
     * option set, so send the full `options` array when changing them.
     */
    updateQuestion: builder.mutation({
      query: ({ testId, questionId, ...body }) => ({
        url: `/admin/tests/${testId}/questions/${questionId}`,
        method: "PATCH",
        body,
      }),
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      invalidatesTags: (_r, _e, { testId, questionId }) => [
        { type: "Question", id: questionId },
        questionListTag(testId),
        testTag(testId),
      ],
    }),

    /** §12 — delete a question. Recomputes `totalMarks`. */
    deleteQuestion: builder.mutation({
      query: ({ testId, questionId }) => ({
        url: `/admin/tests/${testId}/questions/${questionId}`,
        method: "DELETE",
        responseHandler: noContentResponseHandler,
      }),
      transformErrorResponse: normalizeApiError,
      invalidatesTags: (_r, _e, { testId, questionId }) => [
        { type: "Question", id: questionId },
        questionListTag(testId),
        testTag(testId),
      ],
    }),

    /**
     * §13 — reorder. `orderedQuestionIds` must be the EXACT current set,
     * else 422 `REORDER_SET_MISMATCH`.
     */
    reorderQuestions: builder.mutation({
      query: ({ testId, orderedQuestionIds }) => ({
        url: `/admin/tests/${testId}/questions/reorder`,
        method: "PUT",
        body: { orderedQuestionIds },
      }),
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      invalidatesTags: (_r, _e, { testId }) => [questionListTag(testId)],
    }),
  }),
});

registerApi(testSlice);

export const {
  // tests
  useGetTestsQuery,
  useGetTestDetailQuery,
  useCreateTestMutation,
  useUpdateTestMutation,
  useDeleteTestMutation,
  usePublishTestMutation,
  useArchiveTestMutation,
  // questions
  useGetTestQuestionsQuery,
  useGetQuestionQuery,
  useAddQuestionsMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
  useReorderQuestionsMutation,
} = testSlice;

export default testSlice;
