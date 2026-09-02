/**
 * Enrollment — `api-contracts/07-enrollment.md`.
 *
 * This module is the WRITE side of batch membership: approving a request is
 * the only way a batch member is created (06 §10). Approval therefore has to
 * invalidate the batch caches too, which is why this slice reaches across into
 * batchesApi below.
 */

import { createApi } from "@reduxjs/toolkit/query/react";

import baseQueryWithReauth from "./baseQuery.js";
import { normalizeApiError } from "./apiError.js";
import { registerApi } from "./registry.js";
import { withIdempotencyKey, release } from "./idempotency.js";
import batchesApi from "./batches.api.js";

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

/**
 * A review decision changes batch membership, so every batch-shaped cache is
 * now stale: the admin roster, the batch counts, and — for the approved
 * learner — their own batch list and the discovery annotation.
 */
function invalidateBatchCaches(dispatch) {
  dispatch(
    batchesApi.util.invalidateTags([
      { type: "Batch", id: "LIST" },
      { type: "BatchMember", id: "LIST" },
      { type: "MyBatch", id: "LIST" },
      { type: "MyBatch", id: "AVAILABLE" },
    ]),
  );
}

export const enrollmentApi = createApi({
  reducerPath: "enrollmentApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Enrollment", "MyEnrollment"],
  endpoints: (builder) => ({
    /**
     * §1 — submit. `Idempotency-Key` is REQUIRED; omitting it is a 400.
     *
     * The key is derived from the batch, not from the click, so a double-tap
     * or a network retry reuses it and cannot create two requests.
     */
    submitEnrollment: builder.mutation({
      query: ({ batchId, motivation }) =>
        withIdempotencyKey(`enroll:${batchId}`, {
          url: "/enrollments",
          method: "POST",
          body: motivation ? { batchId, motivation } : { batchId },
        }),
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      invalidatesTags: [
        { type: "MyEnrollment", id: "LIST" },
        { type: "Enrollment", id: "LIST" },
      ],
      async onQueryStarted({ batchId }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // the action completed — a later request for this batch is genuinely
          // new and must not replay this one
          release(`enroll:${batchId}`);
          dispatch(
            batchesApi.util.invalidateTags([{ type: "MyBatch", id: "AVAILABLE" }]),
          );
        } catch {
          // keep the key: a retry of this same submit should replay, not duplicate
        }
      },
    }),

    /** §2 — my requests across all batches. */
    getMyEnrollments: builder.query({
      query: (params = {}) => ({ url: "/enrollments/me", params }),
      transformResponse: unwrapList,
      transformErrorResponse: normalizeApiError,
      providesTags: [{ type: "MyEnrollment", id: "LIST" }],
    }),

    /** §3 — one of mine. 404 also covers "belongs to someone else". */
    getMyEnrollment: builder.query({
      query: (enrollmentId) => `/enrollments/${enrollmentId}`,
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      providesTags: (_r, _e, id) => [{ type: "MyEnrollment", id }],
    }),

    // ── admin review queue ─────────────────────────────────────────────────

    /** §4 — query `batchId`, `status`, `sort`, pagination. */
    getEnrollments: builder.query({
      query: (params = {}) => ({ url: "/admin/enrollments", params }),
      transformResponse: unwrapList,
      transformErrorResponse: normalizeApiError,
      providesTags: (result) => [
        { type: "Enrollment", id: "LIST" },
        ...(result?.items ?? []).map((e) => ({ type: "Enrollment", id: e.id })),
      ],
    }),

    /** §5 — one request, with learner, batch, snapshot and review fields. */
    getEnrollment: builder.query({
      query: (enrollmentId) => `/admin/enrollments/${enrollmentId}`,
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      providesTags: (_r, _e, id) => [{ type: "Enrollment", id }],
    }),

    /** §6 — approve, which grants batch membership in the same step. */
    approveEnrollment: builder.mutation({
      query: (enrollmentId) =>
        withIdempotencyKey(`approve:${enrollmentId}`, {
          url: `/admin/enrollments/${enrollmentId}/approve`,
          method: "POST",
        }),
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      invalidatesTags: (_r, _e, id) => [
        { type: "Enrollment", id },
        { type: "Enrollment", id: "LIST" },
      ],
      async onQueryStarted(enrollmentId, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          release(`approve:${enrollmentId}`);
          invalidateBatchCaches(dispatch);
        } catch {
          // leave the key in place so a retry replays
        }
      },
    }),

    /** §7 — reject. The learner may re-apply afterwards. */
    rejectEnrollment: builder.mutation({
      query: ({ enrollmentId, reviewNote }) =>
        withIdempotencyKey(`reject:${enrollmentId}`, {
          url: `/admin/enrollments/${enrollmentId}/reject`,
          method: "POST",
          body: reviewNote ? { reviewNote } : {},
        }),
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      invalidatesTags: (_r, _e, { enrollmentId }) => [
        { type: "Enrollment", id: enrollmentId },
        { type: "Enrollment", id: "LIST" },
      ],
      async onQueryStarted({ enrollmentId }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          release(`reject:${enrollmentId}`);
          dispatch(
            batchesApi.util.invalidateTags([{ type: "MyBatch", id: "AVAILABLE" }]),
          );
        } catch {
          // leave the key in place
        }
      },
    }),
  }),
});

registerApi(enrollmentApi);

export const {
  useSubmitEnrollmentMutation,
  useGetMyEnrollmentsQuery,
  useGetMyEnrollmentQuery,
  useGetEnrollmentsQuery,
  useGetEnrollmentQuery,
  useApproveEnrollmentMutation,
  useRejectEnrollmentMutation,
} = enrollmentApi;

export default enrollmentApi;
