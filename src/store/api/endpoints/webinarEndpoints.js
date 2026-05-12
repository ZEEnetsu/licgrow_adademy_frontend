import { apiSlice } from '../apiSlice.js';
import { unwrapApiData, unwrapListResponse } from '../transforms.js';

export const {
  useGetUpcomingWebinarsQuery,
  useGetPastWebinarsQuery,
  useRegisterWebinarMutation,
  useJoinWebinarQuery,
  useLazyJoinWebinarQuery,
} = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUpcomingWebinars: builder.query({
      query: () => ({ url: '/webinars/upcoming', method: 'GET' }),
      transformResponse: (response) => unwrapListResponse(response).items ?? [],
      providesTags: ['Webinar'],
    }),

    getPastWebinars: builder.query({
      query: () => ({ url: '/webinars/past', method: 'GET' }),
      transformResponse: (response) => unwrapListResponse(response).items ?? [],
      providesTags: ['Webinar'],
    }),

    registerWebinar: builder.mutation({
      query: (webinarId) => ({
        url: `/webinars/${webinarId}/register`,
        method: 'POST',
      }),
      transformResponse: (response) => unwrapApiData(response),
      invalidatesTags: ['Webinar'],
    }),

    /** Pass `skip: true` until user clicks Join; webinar must be live. §7 */
    joinWebinar: builder.query({
      query: (webinarId) => ({
        url: `/webinars/${webinarId}/join`,
        method: 'GET',
      }),
      transformResponse: (response) => unwrapApiData(response),
    }),
  }),
  overrideExisting: false,
});
