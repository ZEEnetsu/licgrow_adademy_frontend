import { apiSlice } from '../apiSlice.js';
import { unwrapApiData, unwrapListResponse } from '../transforms.js';

/** `APIdocs.md` §13 — Ops / Administrator JWT. */
export const {
  useGetOpsHealthQuery,
  useGetOpsHealthTimeseriesQuery,
  useGetOpsLogsQuery,
  useGetOpsAdminsQuery,
  usePostOpsAdminMutation,
  usePatchOpsAdminMutation,
  useGetOpsRolesQuery,
} = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOpsHealth: builder.query({
      query: () => ({ url: '/ops/health', method: 'GET' }),
      transformResponse: (r) => unwrapApiData(r),
      providesTags: ['OpsHealth'],
    }),

    getOpsHealthTimeseries: builder.query({
      query: ({ metricName, ...params }) => ({
        url: `/ops/health/${metricName}/timeseries`,
        method: 'GET',
        params,
      }),
      transformResponse: (r) => unwrapApiData(r),
      providesTags: (_d, _e, arg) => [{ type: 'OpsHealth', id: arg?.metricName ?? 'SERIES' }],
    }),

    getOpsLogs: builder.query({
      query: (params) => ({ url: '/ops/logs', method: 'GET', params }),
      transformResponse: (r) => unwrapListResponse(r).items ?? [],
      providesTags: ['OpsLog'],
    }),

    getOpsAdmins: builder.query({
      query: (params) => ({ url: '/ops/admins', method: 'GET', params }),
      transformResponse: (r) => unwrapListResponse(r).items ?? [],
      providesTags: (rows) =>
        Array.isArray(rows)
          ? [...rows.map((a) => ({ type: 'OpsAdmin', id: a.adminId })), { type: 'OpsAdmin', id: 'LIST' }]
          : [{ type: 'OpsAdmin', id: 'LIST' }],
    }),

    postOpsAdmin: builder.mutation({
      query: (body) => ({ url: '/ops/admins', method: 'POST', body }),
      transformResponse: (r) => unwrapApiData(r),
      invalidatesTags: ['OpsAdmin'],
    }),

    patchOpsAdmin: builder.mutation({
      query: ({ adminId, ...body }) => ({
        url: `/ops/admins/${adminId}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (r) => unwrapApiData(r),
      invalidatesTags: ['OpsAdmin'],
    }),

    getOpsRoles: builder.query({
      query: () => ({ url: '/ops/roles', method: 'GET' }),
      transformResponse: (r) => unwrapListResponse(r).items ?? unwrapApiData(r) ?? [],
      providesTags: ['OpsRole'],
    }),
  }),
  overrideExisting: false,
});
