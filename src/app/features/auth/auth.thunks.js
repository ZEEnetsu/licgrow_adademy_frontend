/**
 * Auth thunks that need to coordinate the slice, the API caches and storage.
 *
 * These live in their own module on purpose: `auth.slice.js` must not import
 * the API slices (they import it), and putting the orchestration here keeps the
 * dependency graph acyclic.
 */

import { createAsyncThunk } from "@reduxjs/toolkit";

import tokenStorage from "./tokenStorage.js";
import {
  bootstrapStarted,
  sessionEstablished,
  sessionCleared,
  LOGOUT_REASON,
} from "./auth.slice.js";
import { broadcastAuthEvent, AUTH_EVENTS } from "./authSync.js";
import authApi from "../../apis/auth.api.js";
import { resetAllApis } from "../../apis/registry.js";
import {
  refreshOnce,
  scheduleProactiveRefresh,
  cancelProactiveRefresh,
} from "../../apis/baseQuery.js";

// side-effect imports: each slice self-registers with the reset registry, so
// logout purges them even though nothing here references them directly
import "../../apis/rbac.api.js";
import "../../apis/tests.api.js";

/**
 * Drop every cached server response.
 *
 * This is not housekeeping — it is a security control. Without it, the next
 * account to sign in on this tab renders the PREVIOUS account's cached tests,
 * roles and analytics until each query happens to refetch.
 *
 * Backed by the self-registration list in `apis/registry.js` rather than a
 * hand-written one, so a newly added API slice can't be forgotten here.
 */
function resetAllApiCaches(dispatch) {
  resetAllApis(dispatch);
}

/**
 * Rehydrate a session on app load.
 *
 * The access token is memory-only, so a cold load never has one — the entry
 * point is always the refresh token. Flow per 01-auth.md ("Frontend flow
 * notes"): no refresh token -> unauthenticated; otherwise refresh, then
 * `GET /auth/me`; any failure -> signed out.
 *
 * Mount this once, high in the tree, and gate rendering on
 * `selectIsBootstrapped` so guards don't flash the login screen.
 */
export const bootstrapAuth = createAsyncThunk(
  "auth/bootstrap",
  async (_arg, { dispatch }) => {
    dispatch(bootstrapStarted());

    if (!tokenStorage.hasSession()) {
      dispatch(sessionCleared(LOGOUT_REASON.NO_SESSION));
      return { authenticated: false };
    }

    const refreshed = await refreshOnce();
    if (!refreshed) {
      tokenStorage.clear();
      dispatch(sessionCleared(LOGOUT_REASON.REFRESH_FAILED));
      return { authenticated: false };
    }

    try {
      const me = await dispatch(
        authApi.endpoints.getMe.initiate(undefined, { forceRefetch: true }),
      ).unwrap();

      dispatch(
        sessionEstablished({ actor: me, permissions: me?.permissions ?? [] }),
      );
      scheduleProactiveRefresh(dispatch);
      return { authenticated: true };
    } catch {
      tokenStorage.clear();
      dispatch(sessionCleared(LOGOUT_REASON.REFRESH_FAILED));
      return { authenticated: false };
    }
  },
);

/**
 * Sign out.
 *
 * Order matters. The network call goes first so the server can blocklist both
 * tokens (01-auth.md §5 — the refresh token is only blocklisted if we send it
 * in the body). Everything after runs in `finally`, so a failed or offline
 * logout still purges this device completely.
 */
export const logout = createAsyncThunk(
  "auth/logout",
  async (_arg, { dispatch }) => {
    const refreshToken = tokenStorage.getRefresh();

    try {
      await dispatch(authApi.endpoints.logout.initiate(refreshToken)).unwrap();
    } catch {
      // Already-blocklisted or unreachable — local teardown proceeds regardless.
      // The token expires server-side on its own within 15 minutes.
    } finally {
      cancelProactiveRefresh();
      tokenStorage.clear();
      resetAllApiCaches(dispatch);
      dispatch(sessionCleared(LOGOUT_REASON.USER_INITIATED));
      broadcastAuthEvent(AUTH_EVENTS.LOGOUT, {
        reason: LOGOUT_REASON.USER_INITIATED,
      });
    }

    return { ok: true };
  },
);

/**
 * Handle a logout broadcast from another tab: tear down locally without
 * re-calling the API (the other tab already blocklisted the tokens).
 */
export const syncLogoutFromOtherTab = createAsyncThunk(
  "auth/syncLogout",
  async (_arg, { dispatch }) => {
    cancelProactiveRefresh();
    tokenStorage.clear();
    resetAllApiCaches(dispatch);
    dispatch(sessionCleared(LOGOUT_REASON.CROSS_TAB));
  },
);
