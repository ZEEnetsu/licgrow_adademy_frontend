/**
 * Announcements — `api-contracts/11-announcement.md`.
 *
 * Admin and learner reads return the same records through different lenses:
 * admins see everything including expired, learners see only global plus their
 * own active batches with expired excluded. Because the two views can diverge,
 * they carry separate cache tags — invalidating one must refresh the other.
 *
 * English only (conventions §9).
 */

import { createApi } from "@reduxjs/toolkit/query/react";

import baseQueryWithReauth from "./baseQuery.js";
import { normalizeApiError, noContentResponseHandler } from "./apiError.js";
import { registerApi } from "./registry.js";

export const ANNOUNCEMENT_SCOPE = Object.freeze({
  GLOBAL: "global",
  BATCH: "batch",
});

const unwrap = (response) => response?.data ?? null;
const unwrapList = (response) => ({
  items: Array.isArray(response?.data) ? response.data : [],
  meta: response?.meta ?? null,
});

/**
 * A write changes what BOTH audiences see, so every mutation invalidates the
 * admin list, the learner feed, and the batch arena that embeds announcements.
 */
const invalidateEverywhere = [
  { type: "Announcement", id: "LIST" },
  { type: "MyAnnouncement", id: "LIST" },
];

export const announcementApi = createApi({
  reducerPath: "announcementApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Announcement", "MyAnnouncement"],
  endpoints: (builder) => ({
    // ── admin ──────────────────────────────────────────────────────────────

    /** §2 — query `scope`, `batchId`, `isPinned`, `includeExpired`. */
    getAnnouncements: builder.query({
      query: (params = {}) => ({ url: "/admin/announcements", params }),
      transformResponse: unwrapList,
      transformErrorResponse: normalizeApiError,
      providesTags: (result) => [
        { type: "Announcement", id: "LIST" },
        ...(result?.items ?? []).map((a) => ({ type: "Announcement", id: a.id })),
      ],
    }),

    /** §3 — one announcement, admin view. */
    getAnnouncement: builder.query({
      query: (id) => `/admin/announcements/${id}`,
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      providesTags: (_r, _e, id) => [{ type: "Announcement", id }],
    }),

    /**
     * §1 — create. `scope` and `batchId` must agree in both directions, else
     * 422 INVALID_SCOPE. A batch announcement fans out ANNOUNCEMENT_POSTED
     * notifications to that batch's members (12).
     */
    createAnnouncement: builder.mutation({
      query: (body) => ({ url: "/admin/announcements", method: "POST", body }),
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      invalidatesTags: invalidateEverywhere,
    }),

    /** §4 — title, body, isPinned, expiresAt only. Scope is fixed at creation. */
    updateAnnouncement: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/announcements/${id}`,
        method: "PATCH",
        body,
      }),
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Announcement", id },
        ...invalidateEverywhere,
      ],
    }),

    /** §5 — delete. */
    deleteAnnouncement: builder.mutation({
      query: (id) => ({
        url: `/admin/announcements/${id}`,
        method: "DELETE",
        responseHandler: noContentResponseHandler,
      }),
      transformErrorResponse: normalizeApiError,
      invalidatesTags: invalidateEverywhere,
    }),

    // ── learner ────────────────────────────────────────────────────────────

    /** §6 — merged feed, pinned first then newest, expired excluded. */
    getMyAnnouncements: builder.query({
      query: (params = {}) => ({ url: "/me/announcements", params }),
      transformResponse: unwrapList,
      transformErrorResponse: normalizeApiError,
      providesTags: [{ type: "MyAnnouncement", id: "LIST" }],
    }),

    /** §7 — one batch's announcements plus global. Membership required. */
    getBatchAnnouncements: builder.query({
      query: ({ batchId, ...params }) => ({
        url: `/me/batches/${batchId}/announcements`,
        params,
      }),
      transformResponse: unwrapList,
      transformErrorResponse: normalizeApiError,
      providesTags: (_r, _e, { batchId }) => [
        { type: "MyAnnouncement", id: batchId },
        { type: "MyAnnouncement", id: "LIST" },
      ],
    }),
  }),
});

registerApi(announcementApi);

export const {
  useGetAnnouncementsQuery,
  useGetAnnouncementQuery,
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation,
  useGetMyAnnouncementsQuery,
  useGetBatchAnnouncementsQuery,
} = announcementApi;

export default announcementApi;
