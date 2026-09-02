/**
 * Notifications — `api-contracts/12-notification.md`.
 *
 * Read-and-mark only. Notifications are system-generated on domain events;
 * there is no create endpoint in v1, and the client must never assume one
 * exists.
 *
 * No realtime in v1 — the contract says polling only, and that a push channel
 * later "won't change these shapes". So `unread-count` is polled for the badge
 * and the list is fetched when the tray opens, exactly as §"Frontend flow
 * notes" prescribes.
 */

import { createApi } from "@reduxjs/toolkit/query/react";

import baseQueryWithReauth from "./baseQuery.js";
import { normalizeApiError } from "./apiError.js";
import { registerApi } from "./registry.js";

export const NOTIFICATION_TYPE = Object.freeze({
  ENROLLMENT_REQUESTED: "ENROLLMENT_REQUESTED",
  ENROLLMENT_APPROVED: "ENROLLMENT_APPROVED",
  ENROLLMENT_REJECTED: "ENROLLMENT_REJECTED",
  ANNOUNCEMENT_POSTED: "ANNOUNCEMENT_POSTED",
  TEST_PUBLISHED: "TEST_PUBLISHED",
  COURSE_PUBLISHED: "COURSE_PUBLISHED",
});

/** How long the badge waits between polls. */
export const UNREAD_POLL_MS = 60_000;

const unwrap = (response) => response?.data ?? null;
const unwrapList = (response) => ({
  items: Array.isArray(response?.data) ? response.data : [],
  meta: response?.meta ?? null,
});

const LIST = { type: "Notification", id: "LIST" };
const COUNT = { type: "Notification", id: "UNREAD" };

export const notificationApi = createApi({
  reducerPath: "notificationApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Notification"],
  endpoints: (builder) => ({
    /** §1 — newest first. Query `isRead`, `type`, pagination. */
    getNotifications: builder.query({
      query: (params = {}) => ({ url: "/me/notifications", params }),
      transformResponse: unwrapList,
      transformErrorResponse: normalizeApiError,
      providesTags: [LIST],
    }),

    /** §2 — cheap by design; the contract calls it safe to poll. */
    getUnreadCount: builder.query({
      query: () => "/me/notifications/unread-count",
      transformResponse: (response) => response?.data?.unread ?? 0,
      transformErrorResponse: normalizeApiError,
      providesTags: [COUNT],
    }),

    /** §3 — idempotent; marking an already-read one returns the same shape. */
    markNotificationRead: builder.mutation({
      query: (id) => ({ url: `/me/notifications/${id}/read`, method: "POST" }),
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      invalidatesTags: [LIST, COUNT],
    }),

    /** §4 — returns how many were actually flipped. */
    markAllNotificationsRead: builder.mutation({
      query: () => ({ url: "/me/notifications/read-all", method: "POST" }),
      transformResponse: unwrap,
      transformErrorResponse: normalizeApiError,
      invalidatesTags: [LIST, COUNT],
    }),
  }),
});

registerApi(notificationApi);

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = notificationApi;

export default notificationApi;
