/**
 * Auth endpoints — `api-contracts/01-auth.md`.
 *
 * All three actors share one request/response shape and differ only by URL and
 * the resulting `actor.type`.
 */

import { createApi } from "@reduxjs/toolkit/query/react";

import baseQueryWithReauth, {
  scheduleProactiveRefresh,
  cancelProactiveRefresh,
} from "./baseQuery.js";
import {
  normalizeApiError,
  noContentResponseHandler,
} from "./apiError.js";
import { registerApi, resetAllApis } from "./registry.js";
import tokenStorage from "../features/auth/tokenStorage.js";
import {
  sessionEstablished,
  authErrored,
  rateLimited,
} from "../features/auth/auth.slice.js";
import {
  broadcastAuthEvent,
  AUTH_EVENTS,
} from "../features/auth/authSync.js";

/**
 * Move the tokens out of the response and into `tokenStorage` BEFORE RTK Query
 * caches anything.
 *
 * `transformResponse` is the only hook that runs between receiving a response
 * and caching it. Reading the tokens in `onQueryStarted` instead would leave
 * them sitting in `state.authApi.mutations[…].data` — visible in Redux
 * DevTools and captured by any state serialization. Credentials must never
 * reach the store; see tokenStorage.js.
 */
function stashTokens(response) {
  const { accessToken, refreshToken, ...rest } = response.data ?? {};

  if (accessToken) tokenStorage.setAccess(accessToken, rest.expiresIn);
  if (refreshToken) tokenStorage.setRefresh(refreshToken);

  return rest; // { tokenType, expiresIn, actor } — nothing sensitive
}

/**
 * Shared post-login work.
 *
 * The login response's `actor` does NOT carry `permissions` — those are
 * embedded in the JWT, and conventions §1 says "clients must not depend on
 * decoding it". So we call `GET /auth/me` to learn the permission set from the
 * server rather than cracking open the token.
 */
async function establishSession({ dispatch, queryFulfilled }) {
  try {
    // tokens were already persisted by stashTokens()
    const { data } = await queryFulfilled;
    scheduleProactiveRefresh(dispatch);

    /*
     * Whoever was signed in before is gone. Purge every other slice's cache so
     * the incoming account can't be shown the previous account's data — the
     * same guard logout performs. authApi is excluded because clearing it
     * mid-flight would destroy the login form's own isSuccess/error state.
     */
    resetAllApis(dispatch, { except: [authApi] });

    let actor = data.actor ?? null;
    let permissions = [];

    try {
      const me = await dispatch(
        authApi.endpoints.getMe.initiate(undefined, { forceRefetch: true }),
      ).unwrap();
      actor = me ?? actor;
      permissions = me?.permissions ?? [];
    } catch {
      // /auth/me failed but the tokens are good — proceed with the login
      // actor and no permissions rather than dropping a valid session.
    }

    dispatch(sessionEstablished({ actor, permissions }));
    broadcastAuthEvent(AUTH_EVENTS.SESSION_ESTABLISHED, {
      actorId: actor?.id ?? null,
    });
  } catch (error) {
    const normalized = normalizeApiError(error?.error);
    if (normalized.status === 429) {
      dispatch(rateLimited(normalized.retryAfter ?? 900));
    }
    dispatch(authErrored(normalized));
  }
}

/**
 * `{ identifier, password }` — identical for all three login endpoints.
 *
 * Deliberately NO `invalidatesTags: ["Auth"]`. Tag invalidation would kick off
 * its own `getMe` refetch that races the explicit one in `establishSession`,
 * and the racing request can still be carrying the PREVIOUS account's token —
 * which silently keeps the old identity after a user switch. The explicit
 * `forceRefetch` above is the single, ordered path.
 */
const loginMutation = (url) => ({
  query: (credentials) => ({ url, method: "POST", body: credentials }),
  transformResponse: stashTokens,
  transformErrorResponse: normalizeApiError,
  onQueryStarted: (_arg, api) => establishSession(api),
});

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Auth"],
  endpoints: (builder) => ({
    // §1 — learner
    loginLearner: builder.mutation(loginMutation("/auth/login")),
    // §2 — staff-admin (token carries the RBAC permission array)
    loginStaffAdmin: builder.mutation(loginMutation("/auth/admin/login")),
    // §3 — super-admin (permissions always [], bypasses by actor type)
    loginSuperAdmin: builder.mutation(loginMutation("/auth/ops/login")),

    /**
     * §4 — refresh.
     *
     * Exposed for completeness, but the 401 recovery path in `baseQuery.js`
     * does its own single-flight refresh with a bare fetch; routing that
     * through RTK Query would recurse. Prefer letting the base query handle it.
     */
    refresh: builder.mutation({
      query: (refreshToken) => ({
        url: "/auth/refresh",
        method: "POST",
        body: { refreshToken },
      }),
      // same reasoning as login: the token is stashed, never cached
      transformResponse: stashTokens,
      transformErrorResponse: normalizeApiError,
    }),

    /**
     * §5 — logout. Blocklists the access token, and the refresh token too when
     * supplied in the body, so it can't be used to refresh afterwards.
     *
     * Prefer the `logout()` thunk in `auth.thunks.js` — it also clears local
     * storage and purges every RTK Query cache.
     */
    logout: builder.mutation({
      query: (refreshToken) => ({
        url: "/auth/logout",
        method: "POST",
        body: refreshToken ? { refreshToken } : undefined,
        responseHandler: noContentResponseHandler,
      }),
      transformErrorResponse: normalizeApiError,
      invalidatesTags: ["Auth"],
      onQueryStarted: () => cancelProactiveRefresh(),
    }),

    /** §6 — current identity. The source of truth for `permissions`. */
    getMe: builder.query({
      query: () => "/auth/me",
      transformResponse: (response) => response.data,
      transformErrorResponse: normalizeApiError,
      providesTags: ["Auth"],
      keepUnusedDataFor: 300,
    }),
  }),
});

registerApi(authApi);

export const {
  useLoginLearnerMutation,
  useLoginStaffAdminMutation,
  useLoginSuperAdminMutation,
  useRefreshMutation,
  useLogoutMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
} = authApi;

export default authApi;
