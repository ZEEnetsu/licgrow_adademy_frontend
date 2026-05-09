import { createSlice } from '@reduxjs/toolkit';

/**
 * authSlice
 * --------------------------------------------------------------------------
 * Mirrors the relevant columns from the `USERS` table together with the
 * computed `enrollment_status` derived from the `ENROLLMENT_REQUESTS` and
 * `COURSE_ASSIGNMENTS` tables:
 *
 *   - 'NONE'      → user has no row in ENROLLMENT_REQUESTS.
 *   - 'PENDING'   → row exists in ENROLLMENT_REQUESTS, no COURSE_ASSIGNMENTS row.
 *   - 'APPROVED'  → COURSE_ASSIGNMENTS row exists for this user.
 *
 * The token is persisted to localStorage so the session survives a refresh.
 * Everything else is rehydrated from the API on boot.
 */

const TOKEN_KEY = 'licgrow.auth.token';

const loadInitialToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

const initialState = {
  user_id: null,
  role: null, // 'STUDENT' | 'ADMIN' | null
  token: loadInitialToken(),
  enrollment_status: 'NONE', // 'NONE' | 'PENDING' | 'APPROVED'
  // `bootstrapped` flips to `true` once we have synced auth state with the
  // server (or determined we have no session). Used by ProtectedRoute to avoid
  // flashing redirects on first paint.
  bootstrapped: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Sets the full session payload after a successful login or session
     * rehydration. Expected shape:
     *   { user_id, role, token, enrollment_status }
     */
    setCredentials(state, action) {
      const { user_id, role, token, enrollment_status } = action.payload;
      state.user_id = user_id ?? null;
      state.role = role ?? null;
      state.token = token ?? state.token;
      state.enrollment_status = enrollment_status ?? 'NONE';
      state.bootstrapped = true;

      try {
        if (token) localStorage.setItem(TOKEN_KEY, token);
      } catch {
        /* localStorage unavailable — non-fatal */
      }
    },

    /**
     * Updates only the enrollment status. Called after `submitEnrollment`
     * succeeds (→ 'PENDING') or after `checkEnrollmentStatus` polling reveals
     * an admin approval (→ 'APPROVED').
     */
    setEnrollmentStatus(state, action) {
      state.enrollment_status = action.payload;
    },

    markBootstrapped(state) {
      state.bootstrapped = true;
    },

    logout(state) {
      state.user_id = null;
      state.role = null;
      state.token = null;
      state.enrollment_status = 'NONE';
      state.bootstrapped = true;

      try {
        localStorage.removeItem(TOKEN_KEY);
      } catch {
        /* ignore */
      }
    },
  },
});

export const { setCredentials, setEnrollmentStatus, markBootstrapped, logout } =
  authSlice.actions;

export default authSlice.reducer;

/* -------------------------------------------------------------------------- */
/*  Selectors                                                                  */
/* -------------------------------------------------------------------------- */
export const selectAuth = (state) => state.auth;
export const selectIsAuthenticated = (state) => Boolean(state.auth.token);
export const selectEnrollmentStatus = (state) => state.auth.enrollment_status;
export const selectUserId = (state) => state.auth.user_id;
export const selectRole = (state) => state.auth.role;
export const selectBootstrapped = (state) => state.auth.bootstrapped;
