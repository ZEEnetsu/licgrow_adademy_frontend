/**
 * Batches — `api-contracts/06-batch.md`.
 *
 * The batch is the platform's access boundary: content is authored globally
 * and *published into* batches, and a learner reaches it only by being an
 * active member. Every learner-facing read below is gated on that.
 *
 * Includes the two list endpoints described in §6–9's prose but absent from
 * the numbered table (`GET …/courses`, `GET …/tests`).
 */

import { createApi } from "@reduxjs/toolkit/query/react";

import baseQueryWithReauth from "./baseQuery.js";
import {
  normalizeApiError,
  noContentResponseHandler,
} from "./apiError.js";
import { registerApi } from "./registry.js";

export const BATCH_STATUS = Object.freeze({
  DRAFT: "draft",
  ACTIVE: "active",
  ARCHIVED: "archived",
});

/** `myEnrollmentStatus` on §12 — drives Join / Pending / Enrolled. */
export const ENROLLMENT_STATUS = Object.freeze({
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
});

const unwrap = (response) => response?.data ?? null;
const unwrapList = (response) => ({
  items: Array.isArray(response?.data) ? response.data : [],
  meta: response?.meta ?? null,
});

const batchTag = (id) => ({ type: "Batch", id });

/** Content and membership changes both alter the batch's `counts`. */
const invalidateBatch = (_r, _e, arg) => [
  batchTag(arg.batchId ?? arg),
  batchTag("LIST"),
  { type: "BatchContent", id: arg.batchId ?? arg },
  { type: "MyBatch", id: "LIST" },
];

export const batchesApi = createApi({
  reducerPath: "batchesApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Batch", "BatchContent", "BatchMember", "MyBatch"],
  endpoints: (builder) => ({
    // ── admin: lifecycle ───────────────────────────────────────────────────

    /** §2 — query `status`, `enrollmentOpen`, `q`, pagination. */
    getBatches: builder.query({
      query: (params = {}) => ({ url: "/admin/batches", params }),
      transformResponse: unwrapList,
      transformErrorResponse: normalizeApiError,
      providesTags: (result) => [
        batchTag("LIST"),
        ...(result?.items ?? []).map((batch) => batchTag(batch.id)),
      ],
    }),

    /** §3 — full batch including `counts`. */
    getBatch: builder.query({
      query: (batchId) => `/admin/batches/${batchId}`,
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      providesTags: (_r, _e, batchId) => [batchTag(batchId)],
    }),

    /** §1 — create. Always starts `draft`; `enrollmentOpen` can't be set yet. */
    createBatch: builder.mutation({
      query: (body) => ({ url: "/admin/batches", method: "POST", body }),
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      invalidatesTags: [batchTag("LIST")],
    }),

    /**
     * §4 — partial update, including the `draft → active` transition and
     * `enrollmentOpen`. Three rules interact here; see the mock handler or the
     * contract for the exact 422s.
     */
    updateBatch: builder.mutation({
      query: ({ batchId, ...body }) => ({
        url: `/admin/batches/${batchId}`,
        method: "PATCH",
        body,
      }),
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      invalidatesTags: invalidateBatch,
    }),

    /** §5 — archive. Forces `enrollmentOpen: false`. Idempotent. */
    archiveBatch: builder.mutation({
      query: (batchId) => ({
        url: `/admin/batches/${batchId}/archive`,
        method: "POST",
      }),
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      invalidatesTags: invalidateBatch,
    }),

    // ── admin: content ─────────────────────────────────────────────────────

    /** Prose-only endpoint: what courses are published into this batch. */
    getBatchCourses: builder.query({
      query: ({ batchId, ...params }) => ({
        url: `/admin/batches/${batchId}/courses`,
        params,
      }),
      transformResponse: unwrapList,
      transformErrorResponse: normalizeApiError,
      providesTags: (_r, _e, { batchId }) => [
        { type: "BatchContent", id: batchId },
      ],
    }),

    /** §6 — 422 `CONTENT_NOT_PUBLISHED` for draft courses, 409 if already in. */
    publishCourseToBatch: builder.mutation({
      query: ({ batchId, courseId }) => ({
        url: `/admin/batches/${batchId}/courses`,
        method: "POST",
        body: { courseId },
      }),
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      invalidatesTags: invalidateBatch,
    }),

    /** §7 — revokes member access; attempt/score history is retained. */
    unpublishCourseFromBatch: builder.mutation({
      query: ({ batchId, courseId }) => ({
        url: `/admin/batches/${batchId}/courses/${courseId}`,
        method: "DELETE",
        responseHandler: noContentResponseHandler,
      }),
      transformErrorResponse: normalizeApiError,
      invalidatesTags: invalidateBatch,
    }),

    /** Prose-only endpoint: what tests are published into this batch. */
    getBatchTests: builder.query({
      query: ({ batchId, ...params }) => ({
        url: `/admin/batches/${batchId}/tests`,
        params,
      }),
      transformResponse: unwrapList,
      transformErrorResponse: normalizeApiError,
      providesTags: (_r, _e, { batchId }) => [
        { type: "BatchContent", id: batchId },
      ],
    }),

    /**
     * §8 — only `kind:"test"` belongs in a batch. A quiz reaches learners via
     * its unit's course (10-submission.md §1), so sending one is a modelling
     * error the server rejects.
     */
    publishTestToBatch: builder.mutation({
      query: ({ batchId, testId }) => ({
        url: `/admin/batches/${batchId}/tests`,
        method: "POST",
        body: { testId },
      }),
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      invalidatesTags: invalidateBatch,
    }),

    /** §9 — in-progress attempts get a grace period; none can start after. */
    unpublishTestFromBatch: builder.mutation({
      query: ({ batchId, testId }) => ({
        url: `/admin/batches/${batchId}/tests/${testId}`,
        method: "DELETE",
        responseHandler: noContentResponseHandler,
      }),
      transformErrorResponse: normalizeApiError,
      invalidatesTags: invalidateBatch,
    }),

    // ── admin: members ─────────────────────────────────────────────────────

    /**
     * §10 — membership is created ONLY by enrollment approval (07). There is
     * deliberately no "add member" endpoint in v1.
     */
    getBatchMembers: builder.query({
      query: ({ batchId, ...params }) => ({
        url: `/admin/batches/${batchId}/members`,
        params,
      }),
      transformResponse: unwrapList,
      transformErrorResponse: normalizeApiError,
      providesTags: (_r, _e, { batchId }) => [
        { type: "BatchMember", id: batchId },
      ],
    }),

    /** §11 — revoke. Access ends, history is kept. */
    removeBatchMember: builder.mutation({
      query: ({ batchId, learnerId }) => ({
        url: `/admin/batches/${batchId}/members/${learnerId}`,
        method: "DELETE",
        responseHandler: noContentResponseHandler,
      }),
      transformErrorResponse: normalizeApiError,
      invalidatesTags: (_r, _e, { batchId }) => [
        { type: "BatchMember", id: batchId },
        batchTag(batchId),
        batchTag("LIST"),
      ],
    }),

    // ── learner ────────────────────────────────────────────────────────────

    /** §12 — discovery. Annotated with the caller's own enrollment status. */
    getAvailableBatches: builder.query({
      query: (params = {}) => ({ url: "/batches/available", params }),
      transformResponse: unwrapList,
      transformErrorResponse: normalizeApiError,
      providesTags: [{ type: "MyBatch", id: "AVAILABLE" }],
    }),

    /** §13 — batches I'm an active member of. */
    getMyBatches: builder.query({
      query: () => "/me/batches",
      transformResponse: (response) =>
        Array.isArray(response?.data) ? response.data : [],
      transformErrorResponse: normalizeApiError,
      providesTags: [{ type: "MyBatch", id: "LIST" }],
    }),

    /** §14 — the arena dashboard: courses, tests, announcements. */
    getMyBatchArena: builder.query({
      query: (batchId) => `/me/batches/${batchId}`,
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      providesTags: (_r, _e, batchId) => [{ type: "MyBatch", id: batchId }],
    }),
  }),
});

registerApi(batchesApi);

export const {
  useGetBatchesQuery,
  useGetBatchQuery,
  useCreateBatchMutation,
  useUpdateBatchMutation,
  useArchiveBatchMutation,
  useGetBatchCoursesQuery,
  usePublishCourseToBatchMutation,
  useUnpublishCourseFromBatchMutation,
  useGetBatchTestsQuery,
  usePublishTestToBatchMutation,
  useUnpublishTestFromBatchMutation,
  useGetBatchMembersQuery,
  useRemoveBatchMemberMutation,
  useGetAvailableBatchesQuery,
  useGetMyBatchesQuery,
  useGetMyBatchArenaQuery,
} = batchesApi;

export default batchesApi;
