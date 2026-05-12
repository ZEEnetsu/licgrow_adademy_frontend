import { apiSlice } from '../apiSlice.js';
import { unwrapApiData, unwrapListResponse } from '../transforms.js';

export const { useGetAnnouncementsQuery } = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAnnouncements: builder.query({
      query: () => ({ url: '/announcements', method: 'GET' }),
      transformResponse: (response) => unwrapListResponse(response).items ?? [],
      providesTags: ['Announcement'],
    }),
  }),
  overrideExisting: false,
});
