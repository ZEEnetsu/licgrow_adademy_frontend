import { apiSlice } from '../apiSlice.js';
import { unwrapApiData, unwrapListResponse } from '../transforms.js';

/**
 * Admin-facing surface — `APIdocs.md` §12.
 * All URLs are relative to `/admin/…` on the same API base.
 */

function adminRowTags(rows, entity) {
  if (!Array.isArray(rows))
    return [{ type: entity, id: 'LIST' }];
  const ids = rows.map((row) => ({
    type: entity,
    id:
      row.enrollmentId ??
      row.courseId ??
      row.webinarId ??
      row.testId ??
      row.announcementId ??
      row.userId ??
      'UNKNOWN',
  }));
  return [...ids, { type: entity, id: 'LIST' }];
}

export const {
  useGetAdminOverviewQuery,
  useGetAdminEnrollmentsQuery,
  usePatchAdminEnrollmentMutation,
  useGetAdminCoursesQuery,
  usePostAdminCourseMutation,
  usePatchAdminCourseMutation,
  usePublishAdminCourseMutation,
  useArchiveAdminCourseMutation,
  useGetAdminWebinarsQuery,
  usePostAdminWebinarMutation,
  useStartAdminWebinarMutation,
  useEndAdminWebinarMutation,
  useCancelAdminWebinarMutation,
  useGetAdminTestsQuery,
  usePostAdminTestMutation,
  useGetAdminTestBuilderQuery,
  usePostAdminTestQuestionsMutation,
  useDeleteAdminTestQuestionMutation,
  usePublishAdminTestMutation,
  useArchiveAdminTestMutation,
  useGetAdminTestAnalyticsQuery,
  useGetAdminUsersQuery,
  useGetAdminUserDetailQuery,
  useGetAdminAnnouncementsQuery,
  usePostAdminAnnouncementMutation,
  usePatchAdminAnnouncementMutation,
  useDeleteAdminAnnouncementMutation,
} = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdminOverview: builder.query({
      query: () => ({ url: '/admin/stats/overview', method: 'GET' }),
      transformResponse: (r) => unwrapApiData(r),
      providesTags: ['AdminStats'],
    }),

    getAdminEnrollments: builder.query({
      query: (params) => ({ url: '/admin/enrollments', method: 'GET', params }),
      transformResponse: (r) => unwrapListResponse(r).items ?? [],
      providesTags: (res) => adminRowTags(res, 'AdminEnrollment'),
    }),

    patchAdminEnrollment: builder.mutation({
      query: ({ enrollmentId, ...body }) => ({
        url: `/admin/enrollments/${enrollmentId}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (r) => unwrapApiData(r),
      invalidatesTags: ['AdminEnrollment', 'Enrollment'],
    }),

    getAdminCourses: builder.query({
      query: (params) => ({ url: '/admin/courses', method: 'GET', params }),
      transformResponse: (r) => unwrapListResponse(r).items ?? [],
      providesTags: (res) => adminRowTags(res, 'AdminCourse'),
    }),

    postAdminCourse: builder.mutation({
      query: (body) => ({ url: '/admin/courses', method: 'POST', body }),
      transformResponse: (r) => unwrapApiData(r),
      invalidatesTags: ['AdminCourse', 'Course'],
    }),

    patchAdminCourse: builder.mutation({
      query: ({ courseId, ...body }) => ({
        url: `/admin/courses/${courseId}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (r) => unwrapApiData(r),
      invalidatesTags: ['AdminCourse', 'Course'],
    }),

    publishAdminCourse: builder.mutation({
      query: (courseId) => ({
        url: `/admin/courses/${courseId}/publish`,
        method: 'POST',
      }),
      transformResponse: (r) => unwrapApiData(r),
      invalidatesTags: ['AdminCourse', 'Course'],
    }),

    archiveAdminCourse: builder.mutation({
      query: (courseId) => ({
        url: `/admin/courses/${courseId}/archive`,
        method: 'POST',
      }),
      transformResponse: (r) => unwrapApiData(r),
      invalidatesTags: ['AdminCourse', 'Course'],
    }),

    getAdminWebinars: builder.query({
      query: (params) => ({ url: '/admin/webinars', method: 'GET', params }),
      transformResponse: (r) => unwrapListResponse(r).items ?? [],
      providesTags: (res) => adminRowTags(res, 'AdminWebinar'),
    }),

    postAdminWebinar: builder.mutation({
      query: (body) => ({ url: '/admin/webinars', method: 'POST', body }),
      transformResponse: (r) => unwrapApiData(r),
      invalidatesTags: ['AdminWebinar', 'Webinar'],
    }),

    startAdminWebinar: builder.mutation({
      query: (webinarId) => ({
        url: `/admin/webinars/${webinarId}/start`,
        method: 'POST',
      }),
      transformResponse: (r) => unwrapApiData(r),
      invalidatesTags: ['AdminWebinar', 'Webinar'],
    }),

    endAdminWebinar: builder.mutation({
      query: (webinarId) => ({
        url: `/admin/webinars/${webinarId}/end`,
        method: 'POST',
      }),
      transformResponse: (r) => unwrapApiData(r),
      invalidatesTags: ['AdminWebinar', 'Webinar'],
    }),

    cancelAdminWebinar: builder.mutation({
      query: (webinarId) => ({
        url: `/admin/webinars/${webinarId}/cancel`,
        method: 'POST',
      }),
      transformResponse: (r) => unwrapApiData(r),
      invalidatesTags: ['AdminWebinar', 'Webinar'],
    }),

    getAdminTests: builder.query({
      query: (params) => ({ url: '/admin/tests', method: 'GET', params }),
      transformResponse: (r) => unwrapListResponse(r).items ?? [],
      providesTags: (res) => adminRowTags(res, 'AdminTest'),
    }),

    postAdminTest: builder.mutation({
      query: (body) => ({ url: '/admin/tests', method: 'POST', body }),
      transformResponse: (r) => unwrapApiData(r),
      invalidatesTags: [
        { type: 'AdminTest', id: 'LIST' },
        'AdminTest',
        'Test',
      ],
    }),

    getAdminTestBuilder: builder.query({
      query: (testId) => ({ url: `/admin/tests/${testId}`, method: 'GET' }),
      transformResponse: (r) => unwrapApiData(r),
      providesTags: (_data, _e, id) => [{ type: 'AdminTest', id }],
    }),

    postAdminTestQuestions: builder.mutation({
      query: ({ testId, ...body }) => ({
        url: `/admin/tests/${testId}/questions`,
        method: 'POST',
        body,
      }),
      transformResponse: (r) => unwrapApiData(r),
      invalidatesTags: (_d, _e, arg) => [
        { type: 'AdminTest', id: arg.testId },
        { type: 'AdminTest', id: 'LIST' },
        'Test',
      ],
    }),

    deleteAdminTestQuestion: builder.mutation({
      query: ({ testId, questionId }) => ({
        url: `/admin/tests/${testId}/questions/${questionId}`,
        method: 'DELETE',
      }),
      transformResponse: (r) => unwrapApiData(r),
      invalidatesTags: (_d, _e, { testId }) => [{ type: 'AdminTest', id: testId }],
    }),

    publishAdminTest: builder.mutation({
      query: (testId) => ({
        url: `/admin/tests/${testId}/publish`,
        method: 'POST',
      }),
      transformResponse: (r) => unwrapApiData(r),
      invalidatesTags: (_d, _e, testId) => [
        { type: 'AdminTest', id: testId },
        { type: 'AdminTest', id: 'LIST' },
        'Test',
      ],
    }),

    archiveAdminTest: builder.mutation({
      query: (testId) => ({
        url: `/admin/tests/${testId}/archive`,
        method: 'POST',
      }),
      transformResponse: (r) => unwrapApiData(r),
      invalidatesTags: (_d, _e, testId) => [
        { type: 'AdminTest', id: testId },
        { type: 'AdminTest', id: 'LIST' },
        'Test',
      ],
    }),

    getAdminTestAnalytics: builder.query({
      query: (testId) => ({
        url: `/admin/tests/${testId}/analytics`,
        method: 'GET',
      }),
      transformResponse: (r) => unwrapApiData(r),
      providesTags: (_d, _e, id) => [{ type: 'AdminTest', id }],
    }),

    getAdminUsers: builder.query({
      query: (params) => ({ url: '/admin/users', method: 'GET', params }),
      transformResponse: (r) => unwrapListResponse(r).items ?? [],
      providesTags: (res) => adminRowTags(res, 'AdminUser'),
    }),

    getAdminUserDetail: builder.query({
      query: (userId) => ({ url: `/admin/users/${userId}`, method: 'GET' }),
      transformResponse: (r) => unwrapApiData(r),
      providesTags: (_d, _e, id) => [{ type: 'AdminUser', id }],
    }),

    getAdminAnnouncements: builder.query({
      query: (params) => ({ url: '/admin/announcements', method: 'GET', params }),
      transformResponse: (r) => unwrapListResponse(r).items ?? [],
      providesTags: (res) => adminRowTags(res, 'AdminAnnouncement'),
    }),

    postAdminAnnouncement: builder.mutation({
      query: (body) => ({ url: '/admin/announcements', method: 'POST', body }),
      transformResponse: (r) => unwrapApiData(r),
      invalidatesTags: ['AdminAnnouncement', 'Announcement'],
    }),

    patchAdminAnnouncement: builder.mutation({
      query: ({ announcementId, ...body }) => ({
        url: `/admin/announcements/${announcementId}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (r) => unwrapApiData(r),
      invalidatesTags: ['AdminAnnouncement', 'Announcement'],
    }),

    deleteAdminAnnouncement: builder.mutation({
      query: (announcementId) => ({
        url: `/admin/announcements/${announcementId}`,
        method: 'DELETE',
      }),
      transformResponse: (r) => unwrapApiData(r),
      invalidatesTags: ['AdminAnnouncement', 'Announcement'],
    }),
  }),
  overrideExisting: false,
});
