import { apiSlice } from '../apiSlice.js';
import { unwrapApiData, unwrapListResponse } from '../transforms.js';

export const { useGetTestsQuery, useGetTestByIdQuery, useLazyGetTestByIdQuery } =
  apiSlice.injectEndpoints({
    endpoints: (builder) => ({
      /** USER + ENROLLED — §8 */
      getTests: builder.query({
        query: () => ({ url: '/tests', method: 'GET' }),
        transformResponse: (response) => unwrapListResponse(response).items ?? [],
        providesTags: (result) =>
          result?.length
            ? [
                ...result.map((t) => ({ type: 'Test', id: t.testId })),
                { type: 'Test', id: 'LIST' },
              ]
            : [{ type: 'Test', id: 'LIST' }],
      }),

      getTestById: builder.query({
        query: (testId) => ({ url: `/tests/${testId}`, method: 'GET' }),
        transformResponse: (response) => unwrapApiData(response),
        providesTags: (_r, _e, id) => [{ type: 'Test', id }],
      }),
    }),
    overrideExisting: false,
  });
