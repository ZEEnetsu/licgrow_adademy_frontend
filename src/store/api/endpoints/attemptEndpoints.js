import { apiSlice } from '../apiSlice.js';
import { unwrapApiData, unwrapListResponse } from '../transforms.js';

export const {
  useStartAttemptMutation,
  useSaveAttemptAnswerMutation,
  useSubmitAttemptMutation,
  useGetAttemptResultQuery,
  useLazyGetAttemptResultQuery,
  useGetTestAttemptsQuery,
  useGetRecentAttemptsQuery,
} = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    startAttempt: builder.mutation({
      query: (testId) => ({
        url: `/tests/${testId}/attempts`,
        method: 'POST',
      }),
      transformResponse: (response) => unwrapApiData(response),
      invalidatesTags: ['Attempt', 'Test'],
    }),

    saveAttemptAnswer: builder.mutation({
      query: ({ attemptId, questionId, selectedOption }) => ({
        url: `/attempts/${attemptId}/answers`,
        method: 'PATCH',
        body: { questionId, selectedOption },
      }),
      transformResponse: (response) => unwrapApiData(response),
      invalidatesTags: ['Attempt'],
    }),

    submitAttempt: builder.mutation({
      query: (attemptId) => ({
        url: `/attempts/${attemptId}/submit`,
        method: 'POST',
      }),
      transformResponse: (response) => unwrapApiData(response),
      invalidatesTags: ['Attempt', 'Test', 'UserStats'],
    }),

    getAttemptResult: builder.query({
      query: (attemptId) => ({
        url: `/attempts/${attemptId}/result`,
        method: 'GET',
      }),
      transformResponse: (response) => unwrapApiData(response),
      providesTags: (_r, _e, id) => [{ type: 'Attempt', id }],
    }),

    getTestAttempts: builder.query({
      query: (testId) => ({
        url: `/tests/${testId}/attempts`,
        method: 'GET',
      }),
      transformResponse: (response) => unwrapListResponse(response).items ?? [],
      providesTags: (_r, _e, id) => [{ type: 'Test', id }],
    }),

    /** `?limit=5` max 20 per §9 */
    getRecentAttempts: builder.query({
      query: ({ limit = 5 } = {}) => ({
        url: '/attempts/recent',
        method: 'GET',
        params: { limit },
      }),
      transformResponse: (response) => unwrapListResponse(response).items ?? [],
      providesTags: ['Attempt'],
    }),
  }),
  overrideExisting: false,
});
