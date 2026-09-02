/**
 * Token storage — deliberately OUTSIDE Redux.
 *
 * Strategy (chosen for a SPA with no BFF, per conventions §1 which says
 * "never in localStorage for the web SPA if avoidable"):
 *
 *   accessToken  -> module-scoped variable. Never touches disk, never appears
 *                   in Redux DevTools, dies with the JS context.
 *   refreshToken -> sessionStorage. Survives F5, cleared on tab close, and is
 *                   scoped to a single tab so the blast radius stays small.
 *
 * Why not keep tokens in Redux: Redux state is serializable and DevTools-
 * visible, so any future redux-persist, SSR serialization, or error-reporter
 * state dump would leak credentials. The auth slice holds IDENTITY, not
 * CREDENTIALS.
 *
 * MIGRATING TO A BFF / httpOnly COOKIE LATER: this is the only file that
 * changes. Make `getRefresh`/`setRefresh`/`clearRefresh` no-ops and let the
 * cookie ride along via `credentials: "include"` in `baseQuery.js`. Nothing
 * else in the codebase touches token persistence.
 */

const REFRESH_TOKEN_KEY = "licgrow.rt";

/** Refresh a little early so in-flight requests never race the expiry. */
export const REFRESH_SKEW_MS = 60_000;

// ── access token: memory only ──────────────────────────────────────────────

let accessToken = null;
/** Epoch ms at which the access token expires, or null when unknown. */
let accessExpiresAt = null;

// ── refresh token: sessionStorage, guarded ─────────────────────────────────

/**
 * sessionStorage throws in Safari private mode and when site data is blocked,
 * so every access is wrapped. A storage failure degrades to an in-memory-only
 * session rather than crashing the app.
 */
let refreshTokenFallback = null;

function readRefresh() {
  try {
    return sessionStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return refreshTokenFallback;
  }
}

function writeRefresh(token) {
  refreshTokenFallback = token;
  try {
    if (token) sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
    else sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // in-memory fallback already set above
  }
}

export const tokenStorage = {
  getAccess() {
    return accessToken;
  },

  /**
   * @param {string} token
   * @param {number} [expiresInSeconds] from the login/refresh response
   */
  setAccess(token, expiresInSeconds) {
    accessToken = token ?? null;
    accessExpiresAt =
      token && Number.isFinite(expiresInSeconds)
        ? Date.now() + expiresInSeconds * 1000
        : null;
  },

  /** Epoch ms, or null if unknown. */
  getAccessExpiry() {
    return accessExpiresAt;
  },

  /** Ms until the access token should be proactively refreshed (may be <= 0). */
  msUntilRefresh() {
    if (!accessExpiresAt) return null;
    return accessExpiresAt - REFRESH_SKEW_MS - Date.now();
  },

  getRefresh() {
    return readRefresh();
  },

  setRefresh(token) {
    writeRefresh(token ?? null);
  },

  /** True when a refresh token exists — i.e. a session is worth rehydrating. */
  hasSession() {
    return Boolean(readRefresh());
  },

  /** Wipe everything. Called on logout and on any unrecoverable auth failure. */
  clear() {
    accessToken = null;
    accessExpiresAt = null;
    writeRefresh(null);
  },
};

export default tokenStorage;
