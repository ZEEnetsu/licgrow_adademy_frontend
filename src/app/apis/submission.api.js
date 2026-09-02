/**
 * Submission — `api-contracts/10-submission.md`. The learner assessment flow.
 *
 * FIRST BILINGUAL READ PATH. Everything bilingual so far has been authoring,
 * where both languages always come back (conventions §9). Here the server
 * returns ONE language chosen by `Accept-Language`, falling back to `en` and
 * reporting what it actually served via `contentLang`.
 *
 * ANSWER-KEY PROTECTION: in-progress questions arrive in the `LearnerQuestion`
 * shape — no `correctOptionId`, no `explanation`. Correct answers appear only
 * in a result, and only when the reveal policy allows (quiz: immediately;
 * test: after the window closes). That is a contract guarantee; the client
 * must never try to reconstruct answers from anything else.
 */

import { createApi } from "@reduxjs/toolkit/query/react";

import baseQueryWithReauth from "./baseQuery.js";
import { normalizeApiError } from "./apiError.js";
import { registerApi } from "./registry.js";
import { withIdempotencyKey, release } from "./idempotency.js";

/** `startBlockedReason` values (10 §1) — the UI explains rather than fails. */
export const START_BLOCKED = Object.freeze({
  NO_ATTEMPTS_LEFT: "no_attempts_left",
  COOLDOWN: "cooldown",
  WINDOW_CLOSED: "window_closed",
  ATTEMPT_IN_PROGRESS: "attempt_in_progress",
});

export const ATTEMPT_STATUS = Object.freeze({
  IN_PROGRESS: "in_progress",
  SUBMITTED: "submitted",
  TIMED_OUT: "timed_out",
});

const unwrap = (response) => response?.data ?? null;
const unwrapList = (response) => ({
  items: Array.isArray(response?.data) ? response.data : [],
  meta: response?.meta ?? null,
});

const languageHeader = (lang) => (lang ? { "Accept-Language": lang } : {});

export const submissionApi = createApi({
  reducerPath: "submissionApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["TestOverview", "Attempt", "AttemptHistory", "Leaderboard"],
  endpoints: (builder) => ({
    /**
     * §1 — the pre-attempt screen. Carries `activeAttemptId` and
     * `startBlockedReason`, which together make the canonical flow possible
     * without ever provoking a 409.
     */
    getTestOverview: builder.query({
      query: (testId) => `/me/tests/${testId}`,
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      providesTags: (_r, _e, testId) => [{ type: "TestOverview", id: testId }],
    }),

    /** §2 — every attempt, newest first. One row per attempt = full history. */
    getAttemptHistory: builder.query({
      query: ({ testId, ...params }) => ({
        url: `/me/tests/${testId}/attempts`,
        params,
      }),
      transformResponse: unwrapList,
      transformErrorResponse: normalizeApiError,
      providesTags: (_r, _e, { testId }) => [
        { type: "AttemptHistory", id: testId },
      ],
    }),

    /**
     * §3 — start. `Idempotency-Key` required: a double-tap must not burn two
     * of a learner's limited attempts.
     *
     * The key is scoped to the test, and released only once the attempt is
     * terminal — so every retry of THIS start replays, while a genuinely new
     * attempt later gets a fresh key.
     */
    startAttempt: builder.mutation({
      query: ({ testId, lang }) =>
        withIdempotencyKey(`attempt:${testId}`, {
          url: `/me/tests/${testId}/attempts`,
          method: "POST",
          headers: languageHeader(lang),
        }),
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      invalidatesTags: (_r, _e, { testId }) => [
        { type: "TestOverview", id: testId },
        { type: "AttemptHistory", id: testId },
      ],
    }),

    /** §4 — get or resume. In progress: questions + saved answers + clock. */
    getAttempt: builder.query({
      query: (attemptId) => `/me/attempts/${attemptId}`,
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      providesTags: (_r, _e, attemptId) => [{ type: "Attempt", id: attemptId }],
    }),

    /**
     * §5 — autosave. Idempotent by nature: last write per question wins.
     *
     * Deliberately does NOT invalidate the attempt cache. Autosave fires on
     * every selection (the tier allows ~2/s) and refetching the whole paper
     * each time would fight the learner's own typing.
     */
    saveAnswers: builder.mutation({
      query: ({ attemptId, answers }) => ({
        url: `/me/attempts/${attemptId}/answers`,
        method: "PUT",
        body: { answers },
      }),
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
    }),

    /**
     * §6 — submit. `Idempotency-Key` required; a retry returns the same
     * result rather than scoring twice.
     */
    submitAttempt: builder.mutation({
      query: ({ attemptId, answers }) =>
        withIdempotencyKey(`submit:${attemptId}`, {
          url: `/me/attempts/${attemptId}/submit`,
          method: "POST",
          body: answers?.length ? { answers } : {},
        }),
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      invalidatesTags: (_r, _e, { attemptId, testId }) => [
        { type: "Attempt", id: attemptId },
        ...(testId
          ? [
              { type: "TestOverview", id: testId },
              { type: "AttemptHistory", id: testId },
              { type: "Leaderboard", id: testId },
            ]
          : []),
      ],
      async onQueryStarted({ attemptId, testId }, { queryFulfilled }) {
        try {
          await queryFulfilled;
          // the attempt is terminal now — both keys are spent
          release(`submit:${attemptId}`);
          if (testId) release(`attempt:${testId}`);
        } catch {
          // keep them: a retry of this submit must replay, not re-score
        }
      },
    }),

    /** §7 — opens only for a closed `kind=test` with the leaderboard enabled. */
    getLeaderboard: builder.query({
      query: (testId) => `/me/tests/${testId}/leaderboard`,
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      providesTags: (_r, _e, testId) => [{ type: "Leaderboard", id: testId }],
    }),
  }),
});

registerApi(submissionApi);

export const {
  useGetTestOverviewQuery,
  useGetAttemptHistoryQuery,
  useStartAttemptMutation,
  useGetAttemptQuery,
  useSaveAnswersMutation,
  useSubmitAttemptMutation,
  useGetLeaderboardQuery,
} = submissionApi;

export default submissionApi;
