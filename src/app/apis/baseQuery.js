/**
 * The shared base query: auth headers in, 401-refresh-retry out.
 *
 * Implements the flow mandated by 01-auth.md ("Frontend flow notes"):
 *   "On any 401 mid-session: attempt one refresh, retry the original request
 *    once, then fall back to login. Don't loop."
 */

import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import tokenStorage from "../features/auth/tokenStorage.js";
import {
  sessionCleared,
  rateLimited,
  authErrored,
  LOGOUT_REASON,
} from "../features/auth/auth.slice.js";
import { broadcastAuthEvent, AUTH_EVENTS } from "../features/auth/authSync.js";
import { ERROR_CODES, normalizeApiError } from "./apiError.js";

/**
 * Vite proxies `/api` to the API host — see vite.config.js.
 * Optional-chained so this module can also be imported outside Vite (tests).
 */
export const API_BASE_URL =
  import.meta.env?.VITE_API_BASE_URL ?? "/api/v1";

/**
 * Endpoints that must never trigger a refresh attempt. A 401 from *login*
 * means bad credentials, not an expired session — refreshing there would be a
 * pointless round trip and could trip the auth-strict rate limiter.
 */
const PUBLIC_ENDPOINTS = new Set([
  "loginLearner",
  "loginStaffAdmin",
  "loginSuperAdmin",
  "refresh",
  "register",
]);

function requestId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { endpoint }) => {
    headers.set("Accept", "application/json");
    // X-Request-Id is echoed back in responses/errors for tracing (§3)
    if (!headers.has("X-Request-Id")) headers.set("X-Request-Id", requestId());
    // dev-only tunnel courtesy; harmless in production
    headers.set("ngrok-skip-browser-warning", "true");

    const token = tokenStorage.getAccess();
    if (token && !PUBLIC_ENDPOINTS.has(endpoint)) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

// ── single-flight refresh ──────────────────────────────────────────────────

/**
 * Gate so that N concurrent 401s produce exactly ONE refresh call. Without it
 * a page with six parallel queries fires six refreshes, burning the
 * auth-strict budget (10 per 15 min per IP) in a single navigation.
 * @type {Promise<boolean>|null}
 */
let refreshPromise = null;

/**
 * Exchange the refresh token for a new access token.
 *
 * Uses a bare `fetch` rather than the wrapped base query on purpose — routing
 * this through `baseQueryWithReauth` would recurse infinitely the moment the
 * refresh itself 401s.
 *
 * @returns {Promise<boolean>} whether a usable access token is now in storage
 */
async function performRefresh() {
  const refreshToken = tokenStorage.getRefresh();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Request-Id": requestId(),
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) return false;

    const payload = await response.json();
    const data = payload?.data ?? {};
    if (!data.accessToken) return false;

    tokenStorage.setAccess(data.accessToken, data.expiresIn);

    /*
     * FORWARD-COMPATIBILITY WITH ROTATION.
     *
     * 01-auth.md §4: "v1 does not rotate refresh tokens ... Rotation is a
     * planned hardening step; the contract won't change for clients when it
     * lands (you already call /refresh and read accessToken)."
     *
     * So today `data.refreshToken` is always undefined and this is a no-op.
     * The day the server starts rotating, the new token is picked up here
     * automatically — no client change required.
     */
    if (data.refreshToken) tokenStorage.setRefresh(data.refreshToken);

    return true;
  } catch {
    return false;
  }
}

/**
 * Coalesces concurrent callers onto one in-flight refresh.
 * Exported so `bootstrapAuth()` can reuse the same gate on app load.
 *
 * @returns {Promise<boolean>}
 */
export function refreshOnce() {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

// ── proactive refresh timer ────────────────────────────────────────────────

let refreshTimer = null;

/**
 * Refresh ~60s before the 15-minute access token expires, so most requests
 * never see a 401 at all. This is the difference between a dashboard that
 * feels stable and one that stutters every quarter hour.
 */
export function scheduleProactiveRefresh(dispatch) {
  cancelProactiveRefresh();

  const delay = tokenStorage.msUntilRefresh();
  if (delay === null) return;

  refreshTimer = setTimeout(
    async () => {
      const ok = await refreshOnce();
      if (ok) {
        scheduleProactiveRefresh(dispatch);
      } else {
        forceSignOut(dispatch, LOGOUT_REASON.REFRESH_FAILED);
      }
    },
    Math.max(delay, 1_000),
  );
}

export function cancelProactiveRefresh() {
  if (refreshTimer) clearTimeout(refreshTimer);
  refreshTimer = null;
}

/** Purge everything locally. Used when the session is unrecoverable. */
export function forceSignOut(dispatch, reason) {
  cancelProactiveRefresh();
  tokenStorage.clear();
  dispatch(sessionCleared(reason));
  broadcastAuthEvent(AUTH_EVENTS.LOGOUT, { reason });
}

// ── the exported base query ────────────────────────────────────────────────

export const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (!result.error) return result;

  const error = normalizeApiError(result.error);

  // 429 — record the lockout window, do not retry (conventions §7)
  if (result.error.status === 429) {
    api.dispatch(rateLimited(error.retryAfter ?? 60));
    api.dispatch(authErrored(error));
    return result;
  }

  // a valid token whose account went inactive — unrecoverable, sign out now
  if (error.code === ERROR_CODES.ACCOUNT_SUSPENDED) {
    api.dispatch(authErrored(error));
    forceSignOut(api.dispatch, LOGOUT_REASON.ACCOUNT_SUSPENDED);
    return result;
  }

  if (result.error.status !== 401) return result;

  // a 401 from login/refresh is a credential problem, not an expiry
  if (PUBLIC_ENDPOINTS.has(api.endpoint)) return result;

  /*
   * Not every 401 is an expired session. 02-learner.md §4 returns
   * 401 INVALID_CURRENT_PASSWORD for a mistyped password — a business error
   * about the SUBMITTED password, not about the bearer token.
   *
   * Refreshing on those would retry a request that fails identically, then
   * sign the user out for getting a form field wrong. Only an
   * UNAUTHENTICATED code (or a bare 401 with no envelope, which some
   * framework-level rejections send) means the token itself is the problem.
   */
  if (error.code !== ERROR_CODES.UNAUTHENTICATED) return result;

  const refreshed = await refreshOnce();

  if (!refreshed) {
    forceSignOut(api.dispatch, LOGOUT_REASON.REFRESH_FAILED);
    return result;
  }

  scheduleProactiveRefresh(api.dispatch);

  // retry EXACTLY once — the contract says don't loop
  result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    forceSignOut(api.dispatch, LOGOUT_REASON.REFRESH_FAILED);
  }

  return result;
};

export default baseQueryWithReauth;
