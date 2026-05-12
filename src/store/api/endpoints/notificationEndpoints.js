import { apiSlice } from '../apiSlice.js';
import { unwrapApiData } from '../transforms.js';

/** §11 — Notifications list wraps pagination inside `data`. */
export const {
  useGetNotificationsQuery,
  useLazyGetNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: (paramsArg = {}) => ({
        url: '/notifications',
        method: 'GET',
        params: paramsArg,
      }),
      transformResponse: (response) => unwrapApiData(response),
      providesTags: ['Notification'],
    }),

    getUnreadNotificationCount: builder.query({
      query: () => ({ url: '/notifications/unread-count', method: 'GET' }),
      transformResponse: (response) => unwrapApiData(response),
      providesTags: ['Notification'],
    }),

    markNotificationRead: builder.mutation({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}/read`,
        method: 'PATCH',
      }),
      transformResponse: (response) => unwrapApiData(response),
      invalidatesTags: ['Notification'],
    }),

    markAllNotificationsRead: builder.mutation({
      query: () => ({
        url: '/notifications/read-all',
        method: 'PATCH',
      }),
      transformResponse: (response) => unwrapApiData(response),
      invalidatesTags: ['Notification'],
    }),
  }),
  overrideExisting: false,
});
