/**
 * Roles & permissions — `api-contracts/05-rbac.md`.
 *
 * Caching note: the permission catalog is effectively static (it changes on
 * deploy), and roles change only through the two mutations below. Both are
 * cached aggressively — this is where the caching work actually pays off.
 */

import { createApi } from "@reduxjs/toolkit/query/react";

import baseQueryWithReauth from "./baseQuery.js";
import { normalizeApiError } from "./apiError.js";
import { registerApi } from "./registry.js";

export const rbacApi = createApi({
  reducerPath: "rbacApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Permission", "Role"],
  endpoints: (builder) => ({
    /** §1 — the master catalog. `[{ name, description }]` */
    getPermissionCatalog: builder.query({
      query: () => "/admin/permissions",
      transformResponse: (response) => response.data,
      transformErrorResponse: normalizeApiError,
      providesTags: [{ type: "Permission", id: "CATALOG" }],
      // static for the life of a deploy — an hour is conservative
      keepUnusedDataFor: 3600,
    }),

    /** §2 — every role with its permission set. */
    getRoles: builder.query({
      query: () => "/admin/roles",
      transformResponse: (response) => response.data,
      transformErrorResponse: normalizeApiError,
      providesTags: (result) => [
        { type: "Role", id: "LIST" },
        ...(result ?? []).map((role) => ({ type: "Role", id: role.id })),
      ],
      keepUnusedDataFor: 600,
    }),

    /** §3 — a single role. */
    getRole: builder.query({
      query: (roleId) => `/admin/roles/${roleId}`,
      transformResponse: (response) => response.data,
      transformErrorResponse: normalizeApiError,
      providesTags: (_result, _error, roleId) => [{ type: "Role", id: roleId }],
      keepUnusedDataFor: 600,
    }),

    /**
     * §4 — create a custom role (super-admin only).
     * Body: `{ name, description?, permissions[] }`
     */
    createRole: builder.mutation({
      query: (body) => ({ url: "/admin/roles", method: "POST", body }),
      transformResponse: (response) => response.data,
      transformErrorResponse: normalizeApiError,
      invalidatesTags: [{ type: "Role", id: "LIST" }],
    }),

    /**
     * §5 — replace a role's permissions wholesale (super-admin only).
     * This is a full replacement, not a patch.
     *
     * Server-side note worth surfacing in any admin UI built on this:
     * permission changes take effect on the affected staff-admin's NEXT LOGIN,
     * because permissions are embedded in the access token at login. A revoke
     * is not instant.
     */
    replaceRolePermissions: builder.mutation({
      query: ({ roleId, permissions }) => ({
        url: `/admin/roles/${roleId}/permissions`,
        method: "PUT",
        body: { permissions },
      }),
      transformResponse: (response) => response.data,
      transformErrorResponse: normalizeApiError,
      invalidatesTags: (_result, _error, { roleId }) => [
        { type: "Role", id: roleId },
        { type: "Role", id: "LIST" },
      ],
    }),
  }),
});

registerApi(rbacApi);

export const {
  useGetPermissionCatalogQuery,
  useGetRolesQuery,
  useGetRoleQuery,
  useCreateRoleMutation,
  useReplaceRolePermissionsMutation,
} = rbacApi;

export default rbacApi;
