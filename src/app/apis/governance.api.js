/**
 * Administrator accounts — `03-staff-admin.md` and `04-super-admin.md`.
 *
 * SUPER-ADMIN ONLY. 03 states that staff-admins cannot create or modify each
 * other, and the server enforces that by ACTOR TYPE — no RBAC role can grant
 * it. So these screens are gated on the actor, not on a permission.
 *
 * Admin passwords follow a stricter rule than learners': 12–128 with a symbol.
 *
 * Note there is deliberately no "reactivate super-admin" endpoint. 04 says
 * reactivation is an audited CLI action, so a compromised super-admin cannot
 * silently restore another.
 */

import { createApi } from "@reduxjs/toolkit/query/react";

import baseQueryWithReauth from "./baseQuery.js";
import { normalizeApiError } from "./apiError.js";
import { registerApi } from "./registry.js";

const unwrap = (response) => response?.data ?? null;
const unwrapList = (response) => ({
  items: Array.isArray(response?.data) ? response.data : [],
  meta: response?.meta ?? null,
});

const STAFF_LIST = { type: "StaffAdmin", id: "LIST" };
const SUPER_LIST = { type: "SuperAdmin", id: "LIST" };

export const governanceApi = createApi({
  reducerPath: "governanceApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["StaffAdmin", "SuperAdmin"],
  endpoints: (builder) => ({
    // ── 03 staff-admins ────────────────────────────────────────────────────

    /** §2 — query `isActive`, `roleId`, `q`, pagination. */
    getStaffAdmins: builder.query({
      query: (params = {}) => ({ url: "/admin/staff-admins", params }),
      transformResponse: unwrapList,
      transformErrorResponse: normalizeApiError,
      providesTags: (result) => [
        STAFF_LIST,
        ...(result?.items ?? []).map((a) => ({ type: "StaffAdmin", id: a.id })),
      ],
    }),

    /** §3 — one staff-admin. */
    getStaffAdmin: builder.query({
      query: (adminId) => `/admin/staff-admins/${adminId}`,
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      providesTags: (_r, _e, adminId) => [{ type: "StaffAdmin", id: adminId }],
    }),

    /**
     * §1 — provision. The password is set here and delivered out-of-band;
     * an invite-link flow is a planned enhancement, not v1.
     */
    createStaffAdmin: builder.mutation({
      query: (body) => ({ url: "/admin/staff-admins", method: "POST", body }),
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      invalidatesTags: [STAFF_LIST],
    }),

    /**
     * §4 — change role. Takes effect on that admin's NEXT LOGIN, because
     * permissions are embedded in the access token at login (05-rbac.md).
     */
    changeStaffAdminRole: builder.mutation({
      query: ({ adminId, roleId }) => ({
        url: `/admin/staff-admins/${adminId}/role`,
        method: "PUT",
        body: { roleId },
      }),
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      invalidatesTags: (_r, _e, { adminId }) => [
        { type: "StaffAdmin", id: adminId },
        STAFF_LIST,
      ],
    }),

    /** §5 — deactivate. Blocks login immediately at auth time. Idempotent. */
    deactivateStaffAdmin: builder.mutation({
      query: (adminId) => ({
        url: `/admin/staff-admins/${adminId}/deactivate`,
        method: "POST",
      }),
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      invalidatesTags: (_r, _e, adminId) => [
        { type: "StaffAdmin", id: adminId },
        STAFF_LIST,
      ],
    }),

    /** §6 — reactivate. Idempotent. */
    reactivateStaffAdmin: builder.mutation({
      query: (adminId) => ({
        url: `/admin/staff-admins/${adminId}/reactivate`,
        method: "POST",
      }),
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      invalidatesTags: (_r, _e, adminId) => [
        { type: "StaffAdmin", id: adminId },
        STAFF_LIST,
      ],
    }),

    // ── 04 super-admins ────────────────────────────────────────────────────

    /** §1 — list. */
    getSuperAdmins: builder.query({
      query: (params = {}) => ({ url: "/admin/super-admins", params }),
      transformResponse: unwrapList,
      transformErrorResponse: normalizeApiError,
      providesTags: [SUPER_LIST],
    }),

    /** §2 — create another root account. The password is never echoed back. */
    createSuperAdmin: builder.mutation({
      query: (body) => ({ url: "/admin/super-admins", method: "POST", body }),
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      invalidatesTags: [SUPER_LIST],
    }),

    /**
     * §3 — deactivate. Two guards stop the platform locking itself out:
     * 422 CANNOT_DEACTIVATE_SELF and 422 LAST_SUPER_ADMIN.
     */
    deactivateSuperAdmin: builder.mutation({
      query: (id) => ({
        url: `/admin/super-admins/${id}/deactivate`,
        method: "POST",
      }),
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      invalidatesTags: [SUPER_LIST],
    }),
  }),
});

registerApi(governanceApi);

export const {
  useGetStaffAdminsQuery,
  useGetStaffAdminQuery,
  useCreateStaffAdminMutation,
  useChangeStaffAdminRoleMutation,
  useDeactivateStaffAdminMutation,
  useReactivateStaffAdminMutation,
  useGetSuperAdminsQuery,
  useCreateSuperAdminMutation,
  useDeactivateSuperAdminMutation,
} = governanceApi;

export default governanceApi;
