/**
 * Learner accounts — `api-contracts/02-learner.md`.
 *
 * Self-registration and self-service, plus staff-admin management.
 *
 * `profile.isComplete` is computed SERVER-side and gates the enrollment flow
 * (07 §1). The client reads that flag rather than re-deriving the rule, so the
 * two can never disagree.
 */

import { createApi } from "@reduxjs/toolkit/query/react";

import baseQueryWithReauth, { scheduleProactiveRefresh } from "./baseQuery.js";
import {
  normalizeApiError,
  noContentResponseHandler,
} from "./apiError.js";
import { registerApi, resetAllApis } from "./registry.js";
import tokenStorage from "../features/auth/tokenStorage.js";
import { sessionEstablished } from "../features/auth/auth.slice.js";
import authApi from "./auth.api.js";

const unwrap = (response) => response?.data ?? null;
const unwrapList = (response) => ({
  items: Array.isArray(response?.data) ? response.data : [],
  meta: response?.meta ?? null,
});

export const learnerApi = createApi({
  reducerPath: "learnerApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Profile", "Learner"],
  endpoints: (builder) => ({
    /**
     * §1 — register. Returns tokens, so the learner is signed in immediately.
     *
     * The token-stashing here mirrors auth.api.js exactly: credentials are
     * moved into tokenStorage inside `transformResponse`, BEFORE RTK Query
     * caches the mutation, so they never reach Redux.
     */
    register: builder.mutation({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
      transformResponse: (response) => {
        const { accessToken, refreshToken, ...rest } = response.data ?? {};
        if (accessToken) tokenStorage.setAccess(accessToken, rest.expiresIn);
        if (refreshToken) tokenStorage.setRefresh(refreshToken);
        return rest;
      },
      transformErrorResponse: normalizeApiError,
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          scheduleProactiveRefresh(dispatch);
          // a brand-new identity: clear anything cached for a previous one
          resetAllApis(dispatch, { except: [learnerApi] });

          let actor = data.actor ?? null;
          try {
            actor = await dispatch(
              authApi.endpoints.getMe.initiate(undefined, { forceRefetch: true }),
            ).unwrap();
          } catch {
            // tokens are good; proceed with the registration actor
          }
          dispatch(sessionEstablished({ actor, permissions: [] }));
        } catch {
          // rendered from the mutation's own error state
        }
      },
    }),

    /** §2 — my profile, including the `isComplete` gate flag. */
    getMyProfile: builder.query({
      query: () => "/me/profile",
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      providesTags: ["Profile"],
    }),

    /** §3 — partial update. Email and username are identity, not editable. */
    updateMyProfile: builder.mutation({
      query: (body) => ({ url: "/me/profile", method: "PUT", body }),
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      invalidatesTags: ["Profile"],
    }),

    /** §4 — 204 on success; other sessions are left signed in (v1). */
    changePassword: builder.mutation({
      query: (body) => ({
        url: "/me/change-password",
        method: "POST",
        body,
        responseHandler: noContentResponseHandler,
      }),
      transformErrorResponse: normalizeApiError,
    }),

    // ── admin ──────────────────────────────────────────────────────────────

    /** §5 — query `status`, `q` (≥2 chars), `batchId`, `sort`, pagination. */
    getLearners: builder.query({
      query: (params = {}) => ({ url: "/admin/learners", params }),
      transformResponse: unwrapList,
      transformErrorResponse: normalizeApiError,
      providesTags: (result) => [
        { type: "Learner", id: "LIST" },
        ...(result?.items ?? []).map((l) => ({ type: "Learner", id: l.id })),
      ],
    }),

    /** §6 — full learner including profile and a stats block. */
    getLearner: builder.query({
      query: (learnerId) => `/admin/learners/${learnerId}`,
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      providesTags: (_r, _e, learnerId) => [{ type: "Learner", id: learnerId }],
    }),

    /** §7 — suspend. Blocks login and all access. Idempotent. */
    suspendLearner: builder.mutation({
      query: ({ learnerId, reason }) => ({
        url: `/admin/learners/${learnerId}/suspend`,
        method: "POST",
        body: reason ? { reason } : undefined,
      }),
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      invalidatesTags: (_r, _e, { learnerId }) => [
        { type: "Learner", id: learnerId },
        { type: "Learner", id: "LIST" },
      ],
    }),

    /** §8 — reactivate. Idempotent. */
    reactivateLearner: builder.mutation({
      query: (learnerId) => ({
        url: `/admin/learners/${learnerId}/reactivate`,
        method: "POST",
      }),
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      invalidatesTags: (_r, _e, learnerId) => [
        { type: "Learner", id: learnerId },
        { type: "Learner", id: "LIST" },
      ],
    }),
  }),
});

registerApi(learnerApi);

export const {
  useRegisterMutation,
  useGetMyProfileQuery,
  useUpdateMyProfileMutation,
  useChangePasswordMutation,
  useGetLearnersQuery,
  useGetLearnerQuery,
  useSuspendLearnerMutation,
  useReactivateLearnerMutation,
} = learnerApi;

export default learnerApi;
