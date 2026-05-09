import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { setCredentials, setEnrollmentStatus, logout } from './authSlice.js';
import { dummyUsers } from '../data/userDummyData.js';
import { dummyLogin, dummyRegister } from '../services/dummyAuthService.js';

/**
 * apiSlice
 * --------------------------------------------------------------------------
 * Single RTK Query slice that maps strictly to the LIC Grow ER schema:
 *
 *   USERS                 →  /auth/*  +  /users/me
 *   COURSES               →  /courses
 *   ENROLLMENT_REQUESTS   →  /enrollments
 *   COURSE_ASSIGNMENTS    →  surfaced through `enrollment_status` on /users/me
 *
 * Cache tags ('User', 'Course', 'Enrollment') are wired so that mutating one
 * resource transparently refetches anything that reads from the same tag.
 *
 * Dev: `VITE_API_PATH_PREFIX` (default `/api/v1`) + Vite proxy → `VITE_API_TARGET`.
 * Prod: set `VITE_API_URL` to the full API base (often ends with `/api/v1`).
 */

function resolveApiBaseUrl() {
  const fromEnv = import.meta.env.VITE_API_URL;
  if (typeof fromEnv === 'string' && fromEnv.trim() !== '') {
    return fromEnv.replace(/\/$/, '');
  }
  if (import.meta.env.DEV) {
    const prefix = import.meta.env.VITE_API_PATH_PREFIX;
    const base =
      typeof prefix === 'string' && prefix.trim() !== ''
        ? prefix
        : '/api/v1';
    return base.replace(/\/$/, '');
  }
  return '';
}

const API_BASE = resolveApiBaseUrl();

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    headers.set('Accept', 'application/json');
    if (API_BASE.includes('ngrok')) {
      headers.set('ngrok-skip-browser-warning', 'true');
    }
    return headers;
  },
});

// Wrap baseQuery so a 401 response automatically clears local credentials.
const baseQueryWithAuthGuard = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);
  if (result?.error?.status === 401) {
    api.dispatch(logout());
  }
  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithAuthGuard,
  tagTypes: ['User', 'Course', 'Enrollment'],
  endpoints: (builder) => ({
    /* ---------------------------------------------------------------------- */
    /*  USERS                                                                   */
    /* ---------------------------------------------------------------------- */
    login: builder.mutation({
      /** Body: { username, password } — must match backend auth contract */
      async queryFn(body, _api, _extraOptions, _fetchWithBQ) {
        try {
          // TODO: Replace with real API call when backend is ready
          const result = await dummyLogin(body);
          const { accessToken, user } = result.data;
          return {
            data: {
              user_id: user.userId,
              role: 'STUDENT',
              token: accessToken,
              enrollment_status: user.hasActiveEnrollment ? 'APPROVED' : 'NONE',
            },
          };
        } catch (err) {
          return {
            error: {
              status: 401,
              data: { message: err?.message ?? 'Invalid username or password.' },
            },
          };
        }
      },
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Expected response: { user_id, role, token, enrollment_status }
          dispatch(setCredentials(data));
        } catch {
          /* surface error to the component via the mutation result */
        }
      },
      invalidatesTags: ['User', 'Enrollment'],
    }),

    register: builder.mutation({
      async queryFn(body, _api, _extraOptions, _fetchWithBQ) {
        try {
          // TODO: Replace with real API call when backend is ready
          const result = await dummyRegister(body);
          return {
            data: {
              credentialsPendingLogin: true,
              message: result.data.message,
              username: result.data.username,
              temporaryPassword: result.data.temporaryPassword,
            },
          };
        } catch (err) {
          return {
            error: {
              status: 400,
              data: {
                message: err?.message ?? 'Registration failed.',
              },
            },
          };
        }
      },
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.credentialsPendingLogin) {
            dispatch(logout());
            return;
          }
          dispatch(setCredentials(data));
        } catch {
          /* noop */
        }
      },
      invalidatesTags: ['User'],
    }),

    /**
     * Fetches the current user's profile + computed enrollment status.
     * Used during app bootstrap to rehydrate the session from a stored token.
     */
    getCurrentUser: builder.query({
      async queryFn(_arg, api, _extraOptions, _fetchWithBQ) {
        try {
          // TODO: Replace with real API call when backend is ready
          const token = api.getState().auth.token;
          const user = dummyUsers.find((u) => u.accessToken === token);
          if (!user) {
            return {
              error: {
                status: 401,
                data: { message: 'Unauthorized' },
              },
            };
          }
          return {
            data: {
              user_id: user.userId,
              role: 'STUDENT',
              token: user.accessToken,
              enrollment_status: user.hasActiveEnrollment ? 'APPROVED' : 'NONE',
            },
          };
        } catch {
          return {
            error: { status: 500, data: { message: 'Session restore failed' } },
          };
        }
      },
      providesTags: ['User'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
        } catch {
          dispatch(logout());
        }
      },
    }),

    /* ---------------------------------------------------------------------- */
    /*  COURSES                                                                 */
    /* ---------------------------------------------------------------------- */
    getAvailableCourses: builder.query({
      query: () => '/courses',
      providesTags: (result) =>
        result
          ? [
              ...result.map((c) => ({ type: 'Course', id: c.course_id })),
              { type: 'Course', id: 'LIST' },
            ]
          : [{ type: 'Course', id: 'LIST' }],
    }),

    /* ---------------------------------------------------------------------- */
    /*  ENROLLMENT_REQUESTS                                                     */
    /* ---------------------------------------------------------------------- */
    submitEnrollment: builder.mutation({
      // Body is strictly { course_id, lic_agent_code } — both required.
      query: ({ course_id, lic_agent_code }) => ({
        url: '/enrollments',
        method: 'POST',
        body: { course_id, lic_agent_code },
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Server creates an ENROLLMENT_REQUESTS row with status 'PENDING'.
          dispatch(setEnrollmentStatus('PENDING'));
        } catch {
          /* error is exposed via the mutation result */
        }
      },
      invalidatesTags: ['Enrollment', 'User'],
    }),

    /**
     * Polled by `/pending-approval` so the UI flips to the dashboard the
     * moment an admin creates the COURSE_ASSIGNMENTS row.
     *
     *   Recommended polling cadence (component side):
     *     useCheckEnrollmentStatusQuery(undefined, { pollingInterval: 5000 })
     */
    checkEnrollmentStatus: builder.query({
      query: () => '/enrollments/status',
      providesTags: ['Enrollment'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Expected: { enrollment_status: 'NONE' | 'PENDING' | 'APPROVED' }
          if (data?.enrollment_status) {
            dispatch(setEnrollmentStatus(data.enrollment_status));
          }
        } catch {
          /* keep last known status */
        }
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetCurrentUserQuery,
  useGetAvailableCoursesQuery,
  useSubmitEnrollmentMutation,
  useCheckEnrollmentStatusQuery,
} = apiSlice;
