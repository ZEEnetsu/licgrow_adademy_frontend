/**
 * Auth state — IDENTITY, never CREDENTIALS.
 *
 * Tokens live in `tokenStorage.js` (memory + sessionStorage), deliberately
 * outside Redux. Nothing in this state tree is sensitive, so it is safe in
 * DevTools and safe to serialize.
 */

import { createSlice } from "@reduxjs/toolkit";
import { ACTOR } from "./permissions.js";

export const AUTH_STATUS = Object.freeze({
  /** Nothing attempted yet — app just booted. */
  IDLE: "idle",
  /** `bootstrapAuth()` is rehydrating a session from the refresh token. */
  BOOTSTRAPPING: "bootstrapping",
  /** A valid actor is loaded. */
  AUTHENTICATED: "authenticated",
  /** Confirmed signed-out. Distinct from IDLE: we've actually checked. */
  UNAUTHENTICATED: "unauthenticated",
});

/** Why a session ended — lets the UI show the right message on the login page. */
export const LOGOUT_REASON = Object.freeze({
  USER_INITIATED: "user_initiated",
  REFRESH_FAILED: "refresh_failed",
  ACCOUNT_SUSPENDED: "account_suspended",
  CROSS_TAB: "cross_tab",
  /** Cold start with nothing to rehydrate — never signed in, not signed out. */
  NO_SESSION: "no_session",
});

const initialState = {
  status: AUTH_STATUS.IDLE,
  /** @type {null | {id, type, fullName, email, status, role?}} */
  actor: null,
  /** Raw permission strings from the server. Expansion happens in selectors. */
  permissions: [],
  /** @type {null | {code, message, userSafe, details}} */
  error: null,
  /** Epoch ms until which auth attempts are rate-limited (conventions §7). */
  lockedUntil: null,
  /** @type {null | keyof LOGOUT_REASON} */
  lastLogoutReason: null,
  /** True once bootstrapAuth has settled — guards render the app shell on it. */
  bootstrapped: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    bootstrapStarted(state) {
      state.status = AUTH_STATUS.BOOTSTRAPPING;
      state.error = null;
    },

    /**
     * A session is live. Payload comes from a login response's `actor`, or
     * from `GET /auth/me`.
     */
    sessionEstablished(state, action) {
      const { actor, permissions } = action.payload ?? {};
      state.status = AUTH_STATUS.AUTHENTICATED;
      state.actor = actor ?? null;
      // learners and super-admins always come back with [] (05-rbac.md)
      state.permissions =
        actor?.type === ACTOR.STAFF_ADMIN ? (permissions ?? []) : [];
      state.error = null;
      state.lastLogoutReason = null;
      state.bootstrapped = true;
    },

    /** Session ended, for any reason. Tokens are cleared by the caller. */
    sessionCleared(state, action) {
      state.status = AUTH_STATUS.UNAUTHENTICATED;
      state.actor = null;
      state.permissions = [];
      state.lastLogoutReason = action.payload ?? LOGOUT_REASON.USER_INITIATED;
      state.bootstrapped = true;
      // deliberately preserves `error` and `lockedUntil` so the login screen
      // can explain what happened
    },

    authErrored(state, action) {
      state.error = action.payload ?? null;
      state.bootstrapped = true;
    },

    errorCleared(state) {
      state.error = null;
    },

    /**
     * A 429 from the auth-strict tier (10 req / 15 min per IP).
     * @param {number} action.payload seconds from `Retry-After`
     */
    rateLimited(state, action) {
      const seconds = Number.isFinite(action.payload) ? action.payload : 60;
      state.lockedUntil = Date.now() + seconds * 1000;
    },

    lockoutCleared(state) {
      state.lockedUntil = null;
    },
  },
});

export const {
  bootstrapStarted,
  sessionEstablished,
  sessionCleared,
  authErrored,
  errorCleared,
  rateLimited,
  lockoutCleared,
} = authSlice.actions;

export default authSlice.reducer;
