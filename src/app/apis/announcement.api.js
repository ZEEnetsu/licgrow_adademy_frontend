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

    /**
     * §4, pin / unpin only. OPTIMISTIC (admin UI guidelines §6): the flag
     * flips at once in every cached admin list that holds this announcement
     * (and in its single view), and flips back if the PATCH fails. The lists
     * still refetch afterwards — the server sorts pinned first, and the
     * learner feeds have to follow.
     */
    setAnnouncementPinned: builder.mutation({
      query: ({ id, isPinned }) => ({
        url: `/admin/announcements/${id}`,
        method: "PATCH",
        body: { isPinned },
      }),
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      async onQueryStarted({ id, isPinned }, { dispatch, getState, queryFulfilled }) {
        // every cache entry tagged with this id: the lists it appears in,
        // whatever their filters and page, plus getAnnouncement(id)
        const entries = announcementApi.util.selectInvalidatedBy(getState(), [{ type: "Announcement", id }]);
        const patches = entries.flatMap(({ endpointName, originalArgs }) => {
          if (endpointName === "getAnnouncements") {
            return dispatch(
              announcementApi.util.updateQueryData("getAnnouncements", originalArgs, (draft) => {
                const item = draft?.items?.find((a) => a.id === id);
                if (item) item.isPinned = isPinned;
              }),
            );
          }
          if (endpointName === "getAnnouncement") {
            return dispatch(
              announcementApi.util.updateQueryData("getAnnouncement", originalArgs, (draft) => {
                if (draft) draft.isPinned = isPinned;
              }),
            );
          }
          return [];
        });
        try {
          await queryFulfilled;
        } catch {
          patches.forEach((patch) => patch.undo());
        }
      },
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
  useSetAnnouncementPinnedMutation,
  useDeleteAnnouncementMutation,
  useGetMyAnnouncementsQuery,
  useGetBatchAnnouncementsQuery,
} = announcementApi;

export default announcementApi;
