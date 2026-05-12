import { setEnrollmentStatus } from '../../authSlice.js';
import { apiSlice } from '../apiSlice.js';
import { unwrapApiData, unwrapListResponse } from '../transforms.js';
import { fetchEnrollmentStatuses } from '../enrollmentGate.js';

export const {
  useGetMyEnrollmentsQuery,
  useGetMyAssignmentsQuery,
  useSubmitEnrollmentMutation,
  useCheckEnrollmentStatusQuery,
} = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMyEnrollments: builder.query({
      query: () => ({ url: '/enrollments/me', method: 'GET' }),
      transformResponse: (response) => {
        const { items } = unwrapListResponse(response);
        return items;
      },
      providesTags: ['Enrollment'],
    }),

    getMyAssignments: builder.query({
      query: () => ({ url: '/enrollments/me/assignments', method: 'GET' }),
      transformResponse: (response) => {
        const { items } = unwrapListResponse(response);
        return items;
      },
      providesTags: ['Assignment'],
    }),

    submitEnrollment: builder.mutation({
      query: (body) => ({
        url: '/enrollments',
        method: 'POST',
        body,
      }),
      transformResponse: (response) => unwrapApiData(response),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(setEnrollmentStatus('PENDING'));
        } catch {
          /* mutation error surface */
        }
      },
      invalidatesTags: ['Enrollment', 'Assignment', 'User'],
    }),

    /**
     * Polling helper for `/pending-approval`: recomputes gate from §5 endpoints.
     * Replaces deprecated `GET /enrollments/status`.
     */
    checkEnrollmentStatus: builder.query({
      async queryFn(_arg, api, _extraOpts, _fetchWithBQ) {
        const enrollment_status = await fetchEnrollmentStatuses(api);
        return { data: { enrollment_status } };
      },
      providesTags: ['Enrollment', 'Assignment'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.enrollment_status) {
            dispatch(setEnrollmentStatus(data.enrollment_status));
          }
        } catch {
          /* keep last known */
        }
      },
    }),
  }),
  overrideExisting: false,
});
