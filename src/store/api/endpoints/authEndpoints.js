import { setCredentials, logout } from '../../authSlice.js';
import { apiSlice } from '../apiSlice.js';
import { unwrapApiData, normalizeAuthSessionData, normalizeUserDeskProfile } from '../transforms.js';
import { enrollmentStatusFromLoginUser } from '../enrollmentGate.js';

const LOGOUT_INVALIDATES = [
  'Auth',
  'User',
  'UserStats',
  'Enrollment',
  'Assignment',
  'Course',
  'Webinar',
  'Test',
  'Attempt',
  'Announcement',
  'Notification',
];

export const {
  useLoginMutation,
  useRegisterMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
  useAdminLoginMutation,
  useOpsLoginMutation,
} = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
      transformResponse: (response) => {
        const data = normalizeAuthSessionData(unwrapApiData(response));
        const user = data.user ?? {};
        return {
          user_id: user.userId ?? null,
          role: 'STUDENT',
          token: data.accessToken ?? null,
          refreshToken: data.refreshToken ?? null,
          enrollment_status: enrollmentStatusFromLoginUser(user),
          profile: normalizeUserDeskProfile(user),
        };
      },
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
        } catch {
          /* Auth.jsx surfaces mutation.error */
        }
      },
      invalidatesTags: ['Auth', 'User', 'Enrollment', 'Assignment'],
    }),

    register: builder.mutation({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body,
      }),
      transformResponse: (response) => {
        const data = unwrapApiData(response);
        return {
          credentialsPendingLogin: true,
          message: data?.message ?? 'Registration successful.',
          username: data?.username ?? '',
          temporaryPassword: data?.temporaryPassword ?? '',
        };
      },
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(logout());
        } catch {
          /* noop */
        }
      },
      invalidatesTags: ['Auth', 'User'],
    }),

    refreshToken: builder.mutation({
      query: (body) => ({
        url: '/auth/refresh',
        method: 'POST',
        body,
      }),
      transformResponse: (response) => {
        const data = normalizeAuthSessionData(unwrapApiData(response));
        return { accessToken: data.accessToken ?? null };
      },
      async onQueryStarted(_arg, { dispatch, queryFulfilled, getState }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            setCredentials({
              user_id: getState().auth.user_id,
              role: getState().auth.role,
              token: data.accessToken,
              enrollment_status: getState().auth.enrollment_status,
            }),
          );
        } catch {
          dispatch(logout());
        }
      },
      invalidatesTags: ['Auth', 'User'],
    }),

    logout: builder.mutation({
      query: (body) => ({
        url: '/auth/logout',
        method: 'POST',
        body,
      }),
      transformResponse: (response) => unwrapApiData(response),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          dispatch(logout());
        }
      },
      invalidatesTags: LOGOUT_INVALIDATES,
    }),

    adminLogin: builder.mutation({
      query: (body) => ({
        url: '/auth/admin/login',
        method: 'POST',
        body,
      }),
      transformResponse: (response) => {
        const data = normalizeAuthSessionData(unwrapApiData(response));
        const admin = data.admin ?? {};
        return {
          user_id: admin.adminId ?? null,
          role: 'ADMIN',
          token: data.accessToken ?? null,
          refreshToken: data.refreshToken ?? null,
          enrollment_status: 'APPROVED',
          profile: normalizeUserDeskProfile(admin),
        };
      },
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
        } catch {
          /* surface in UI */
        }
      },
      invalidatesTags: ['Auth', 'User'],
    }),

    opsLogin: builder.mutation({
      query: (body) => ({
        url: '/auth/ops/login',
        method: 'POST',
        body,
      }),
      transformResponse: (response) => {
        const data = normalizeAuthSessionData(unwrapApiData(response));
        const admin = data.admin ?? {};
        return {
          user_id: admin.adminId ?? null,
          role: 'ADMINISTRATOR',
          token: data.accessToken ?? null,
          refreshToken: data.refreshToken ?? null,
          enrollment_status: 'APPROVED',
          profile: normalizeUserDeskProfile(admin),
        };
      },
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
        } catch {
          /* surface in UI */
        }
      },
      invalidatesTags: ['Auth', 'User'],
    }),
  }),
  overrideExisting: false,
});
