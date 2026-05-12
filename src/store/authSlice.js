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
const ROLE_KEY = 'licgrow.auth.role';
const PROFILE_KEY = 'licgrow.auth.profile';

const ALLOWED_STORAGE_ROLES = new Set(['STUDENT', 'ADMIN', 'ADMINISTRATOR']);

const loadInitialToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

const loadInitialRole = () => {
  try {
    const r = localStorage.getItem(ROLE_KEY);
    return ALLOWED_STORAGE_ROLES.has(r) ? r : null;
  } catch {
    return null;
  }
};

const loadInitialProfile = () => {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const initialState = {
  user_id: null,
  role: loadInitialRole(), // 'STUDENT' | 'ADMIN' | 'ADMINISTRATOR' | null
  token: loadInitialToken(),
  profile: loadInitialProfile(),
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
     *   { user_id, role, token, enrollment_status, profile? }
     */
    setCredentials(state, action) {
      const { user_id, role, token, enrollment_status, profile } = action.payload;
      state.user_id = user_id ?? null;
      if (role != null) state.role = role;
      state.token = token ?? state.token;
      state.enrollment_status = enrollment_status ?? 'NONE';
      if ('profile' in action.payload && action.payload.profile !== undefined) {
        state.profile = action.payload.profile;
      }
      state.bootstrapped = true;

      try {
        if (token) localStorage.setItem(TOKEN_KEY, token);
        if (state.role)
          localStorage.setItem(ROLE_KEY, state.role);
        if (state.profile)
          localStorage.setItem(PROFILE_KEY, JSON.stringify(state.profile));
        else localStorage.removeItem(PROFILE_KEY);
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
      state.profile = null;
      state.enrollment_status = 'NONE';
      state.bootstrapped = true;

      try {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(ROLE_KEY);
        localStorage.removeItem(PROFILE_KEY);
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
export const selectUserProfile = (state) => state.auth.profile;

/** Sidebar / chrome: `{ fullName, username, … }`. */
export const selectDeskUser = (state) => {
  const p = state.auth.profile;
  if (p?.fullName) return { ...p, hasActiveEnrollment: true };
  return {
    userId: state.auth.user_id,
    username: state.auth.role === 'ADMIN' ? 'admin' : '—',
    fullName: state.auth.role === 'ADMIN' ? 'Administrator' : 'Learner',
    email: '',
    hasActiveEnrollment: state.auth.enrollment_status === 'APPROVED',
  };
};
