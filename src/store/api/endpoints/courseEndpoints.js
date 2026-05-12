import { apiSlice } from '../apiSlice.js';
import { unwrapApiData, unwrapListResponse } from '../transforms.js';

export const {
  useGetCoursesQuery,
  useLazyGetCoursesQuery,
  useGetCourseByIdQuery,
} = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCourses: builder.query({
      query: () => ({ url: '/courses', method: 'GET' }),
      transformResponse: (response) => unwrapListResponse(response).items ?? [],
      providesTags: (result) =>
        result?.length
          ? [
              ...result.map((c) => ({
                type: 'Course',
                id: c.courseId ?? c.course_id,
              })),
              { type: 'Course', id: 'LIST' },
            ]
          : [{ type: 'Course', id: 'LIST' }],
    }),

    /** USER + ENROLLED — §6 */
    getCourseById: builder.query({
      query: (courseId) => ({
        url: `/courses/${courseId}`,
        method: 'GET',
      }),
      transformResponse: (response) => unwrapApiData(response),
      providesTags: (_r, _e, id) => [{ type: 'Course', id }],
    }),
  }),
  overrideExisting: false,
});
