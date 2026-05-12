import { setCredentials, logout, markBootstrapped } from '../../authSlice.js';
import { apiSlice } from '../apiSlice.js';
import { unwrapApiData, normalizeUserDeskProfile } from '../transforms.js';
import { fetchEnrollmentStatuses } from '../enrollmentGate.js';

export const {
  useGetCurrentUserQuery,
  useLazyGetCurrentUserQuery,
  useChangePasswordMutation,
  useGetMyDashboardStatsQuery,
  useLazyGetMyDashboardStatsQuery,
} = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /** Bootstrap: `GET /users/me` + enrollment gate (assignments + requests). APIdocs §4 + §5. */
    getCurrentUser: builder.query({
      async queryFn(_arg, api, _extraOpts, fetchWithBQ) {
        const meRes = await fetchWithBQ({ url: '/users/me', method: 'GET' });
        if (meRes.error) return meRes;

        const user = unwrapApiData(meRes.data);
        const enrollment_status = await fetchEnrollmentStatuses(api);

        const priorRole = api.getState().auth.role;
        const role =
          priorRole === 'ADMIN' || priorRole === 'ADMINISTRATOR'
            ? priorRole
            : 'STUDENT';

        return {
          data: {
            user_id: user?.userId ?? user?.user_id ?? null,
            role,
            enrollment_status,
            profile: normalizeUserDeskProfile(user),
          },
        };
      },
      providesTags: ['User', 'Enrollment', 'Assignment'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
        } catch (err) {
          const status =
            (typeof err?.error?.status === 'number' && err.error.status) ||
            (typeof err?.status === 'number' && err.status) ||
            undefined;
          if (status === 401) dispatch(logout());
          else dispatch(markBootstrapped());
        }
      },
    }),

    changePassword: builder.mutation({
      query: (body) => ({
        url: '/users/me/password',
        method: 'PATCH',
        body,
      }),
      transformResponse: (response) => unwrapApiData(response),
      invalidatesTags: ['Auth', 'User'],
    }),

    /** Guard: USER + ENROLLED — APIdocs §4 */
    getMyDashboardStats: builder.query({
      query: () => ({ url: '/users/me/stats', method: 'GET' }),
      transformResponse: (response) => unwrapApiData(response),
      providesTags: ['UserStats'],
    }),
  }),
  overrideExisting: false,
});
