/**
 * Analytics — `api-contracts/13-analytics.md`.
 *
 * Read-only. Two permission tiers: `analytics:view` for platform/batch/learner,
 * `test:view_results` for the per-test endpoints.
 *
 * COUNTING RULE, worth knowing before reading any figure: score averages, pass
 * rates and the histogram all use each learner's BEST attempt. Only
 * `attempts.total` counts every attempt. Mixing the two produces numbers that
 * look plausible and are wrong.
 *
 * Everything is computed on read, so these carry a short cache life rather
 * than tag-based invalidation — an attempt submitted anywhere changes them.
 */

import { createApi } from "@reduxjs/toolkit/query/react";

import baseQueryWithReauth from "./baseQuery.js";
import { normalizeApiError } from "./apiError.js";
import { registerApi } from "./registry.js";

const unwrap = (response) => response?.data ?? null;

/** Figures move constantly; a minute is long enough to spare a re-render. */
const FRESH_FOR = 60;

export const analyticsApi = createApi({
  reducerPath: "analyticsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Analytics"],
  endpoints: (builder) => ({
    /** §1 — learners, batches, content, enrollments, 30-day activity. */
    getPlatformAnalytics: builder.query({
      query: (params = {}) => ({ url: "/admin/analytics/platform", params }),
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      keepUnusedDataFor: FRESH_FOR,
    }),

    /** §2 — membership, enrollment funnel, performance, 7-day engagement. */
    getBatchAnalytics: builder.query({
      query: ({ batchId, ...params }) => ({
        url: `/admin/analytics/batches/${batchId}`,
        params,
      }),
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      keepUnusedDataFor: FRESH_FOR,
    }),

    /** §3 — one learner's batches, summary and per-test breakdown. */
    getLearnerAnalytics: builder.query({
      query: (learnerId) => `/admin/analytics/learners/${learnerId}`,
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      keepUnusedDataFor: FRESH_FOR,
    }),

    /** §4 — attempt counts, score stats, average time taken. */
    getTestSummary: builder.query({
      query: (testId) => `/admin/tests/${testId}/analytics/summary`,
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      keepUnusedDataFor: FRESH_FOR,
    }),

    /** §5 — ten fixed 10% buckets, empty ones included for a stable axis. */
    getScoreDistribution: builder.query({
      query: (testId) => `/admin/tests/${testId}/analytics/score-distribution`,
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      keepUnusedDataFor: FRESH_FOR,
    }),

    /** §6 — per-question correct rate plus the most-chosen wrong option. */
    getQuestionPerformance: builder.query({
      query: (testId) => `/admin/tests/${testId}/analytics/question-performance`,
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      keepUnusedDataFor: FRESH_FOR,
    }),
  }),
});

registerApi(analyticsApi);

export const {
  useGetPlatformAnalyticsQuery,
  useGetBatchAnalyticsQuery,
  useGetLearnerAnalyticsQuery,
  useGetTestSummaryQuery,
  useGetScoreDistributionQuery,
  useGetQuestionPerformanceQuery,
} = analyticsApi;

export default analyticsApi;
