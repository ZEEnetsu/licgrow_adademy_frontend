import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  UNREAD_POLL_MS,
} from "../app/apis/notification.api.js";

/**
 * Notification tray — `api-contracts/12-notification.md`.
 *
 * Follows the contract's own flow note exactly: poll the cheap
 * `unread-count` for the badge, and fetch the list only when the tray opens.
 * Fetching the full list on a timer would be wasteful for a badge that is
 * usually zero.
 *
 * No realtime in v1 — polling is the documented approach, and a push channel
 * later "won't change these shapes".
 */

/** `relatedEntityType` → where clicking should take you. */
const DEEP_LINK = {
  batch: (id) => `/student/batches/${id}`,
  test: (id) => `/student/tests/${id}`,
  course: () => "/student",
  enrollment: () => "/student/profile",
  announcement: () => "/student",
};

const timeAgo = (iso) => {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

const NotificationBell = ({ deepLink = true }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const { data: unread = 0 } = useGetUnreadCountQuery(undefined, {
    pollingInterval: UNREAD_POLL_MS,
  });

  // the list is only fetched once the tray is actually opened
  const { data, isLoading } = useGetNotificationsQuery(
    { limit: 15 },
    { skip: !open },
  );

  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, markAllState] = useMarkAllNotificationsReadMutation();

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const handleClick = (notification) => {
    if (!notification.isRead) markRead(notification.id);

    const to = deepLink
      ? DEEP_LINK[notification.relatedEntityType]?.(notification.relatedEntityId)
      : null;

    if (to) {
      setOpen(false);
      navigate(to);
    }
  };

  const items = data?.items ?? [];

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={
          unread > 0 ? `Notifications, ${unread} unread` : "Notifications"
        }
        className="relative h-8 w-8 grid place-items-center rounded-full bg-surface hover:bg-surface-hover transition-colors cursor-pointer"
      >
        <span aria-hidden className="text-sm">
          🔔
        </span>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 grid place-items-center rounded-full bg-danger text-bg text-[10px] font-bold">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-10 z-50 w-80 max-h-96 overflow-y-auto rounded-lg bg-surface-elevated shadow-elevate-hover"
        >
          <div className="flex items-center justify-between px-3 py-2 border-b border-border sticky top-0 bg-bg">
            <p className="text-sm font-medium text-text-primary">
              Notifications
            </p>
            {unread > 0 && (
              <button
                type="button"
                onClick={() => markAllRead()}
                disabled={markAllState.isLoading}
                className="text-[11px] text-accent hover:underline disabled:opacity-50 cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>

          {isLoading ? (
            <p className="px-3 py-6 text-sm text-text-muted text-center">
              Loading…
            </p>
          ) : items.length === 0 ? (
            <p className="px-3 py-6 text-sm text-text-muted text-center">
              Nothing yet.
            </p>
          ) : (
            items.map((notification) => (
              <button
                key={notification.id}
                type="button"
                role="menuitem"
                onClick={() => handleClick(notification)}
                className={`w-full text-left px-3 py-2.5 border-b border-border last:border-b-0 hover:bg-surface transition-colors cursor-pointer ${
                  notification.isRead ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start gap-2">
                  {!notification.isRead && (
                    <span
                      aria-hidden
                      className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent shrink-0"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-text-primary truncate">
                      {notification.title}
                    </p>
                    <p className="text-[11px] text-text-muted line-clamp-2">
                      {notification.body}
                    </p>
                    <p className="text-[10px] text-text-muted mt-1 opacity-70">
                      {timeAgo(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
