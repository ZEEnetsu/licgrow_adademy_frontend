import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from "framer-motion";

import Icon from "./ui/Icon.jsx";
import { EXPO } from "./motion/primitives.js";
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
 * Shared by the admin header and the student layout. `links` maps a
 * notification's `relatedEntityType` to a route; it defaults to the learner
 * portal's routes, and `deepLink={false}` turns navigation off entirely.
 */

/** `relatedEntityType` → where clicking should take a learner. */
const LEARNER_LINKS = {
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

const NotificationBell = ({ deepLink = true, links = LEARNER_LINKS }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const reduced = useReducedMotion();
  const bell = useAnimationControls();
  const lastUnread = useRef(null);

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

  // a short ring when something new arrives — not on first load
  useEffect(() => {
    if (lastUnread.current !== null && unread > lastUnread.current && !reduced) {
      bell.start({ rotate: [0, -16, 13, -9, 6, 0], transition: { duration: 0.7, ease: "easeInOut" } });
    }
    lastUnread.current = unread;
  }, [unread, reduced, bell]);

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
      ? links[notification.relatedEntityType]?.(notification.relatedEntityId)
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
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={
          unread > 0 ? `Notifications, ${unread} unread` : "Notifications"
        }
        className={`relative grid h-9 w-9 cursor-pointer place-items-center rounded-full text-text-muted transition-colors duration-200 hover:bg-surface-hover hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
          open ? "bg-surface-hover text-text-primary" : ""
        }`}
      >
        <motion.span animate={bell} className="grid place-items-center" style={{ transformOrigin: "50% 15%" }}>
          <Icon name="bell" className="h-[18px] w-[18px]" strokeWidth={1.9} />
        </motion.span>
        <AnimatePresence>
          {unread > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1, transition: { type: "spring", stiffness: 500, damping: 22 } }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-ember-deep px-1 text-[10px] font-bold text-white ring-2 ring-bg tabular-nums"
            >
              {unread > 9 ? "9+" : unread}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Notifications"
            initial={{ opacity: 0, scale: 0.96, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.2, ease: EXPO } }}
            exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.12 } }}
            style={{ transformOrigin: "top right" }}
            className="absolute top-12 right-0 z-50 flex max-h-[min(28rem,70dvh)] w-[min(22rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl bg-surface-elevated shadow-pop ring-1 ring-border"
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3">
              <p className="font-display text-[15px] font-bold tracking-tight text-text-primary">
                Notifications
              </p>
              {unread > 0 && (
                <button
                  type="button"
                  onClick={() => markAllRead()}
                  disabled={markAllState.isLoading}
                  className="cursor-pointer rounded-full px-2.5 py-1 text-xs font-semibold text-accent transition-colors duration-200 hover:bg-accent-muted disabled:opacity-50"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="scroll-panel min-h-0 flex-1 overflow-y-auto p-1.5">
              {isLoading ? (
                <div className="flex flex-col gap-2 p-2" aria-label="Loading notifications">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="skeleton block h-12 rounded-xl" />
                  ))}
                </div>
              ) : items.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <span className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-tint-mint text-success">
                    <Icon name="check" className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <p className="mt-3 text-sm font-semibold text-text-primary">You&apos;re all caught up</p>
                  <p className="mt-0.5 text-xs text-text-muted">New activity will show up here.</p>
                </div>
              ) : (
                items.map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => handleClick(notification)}
                    className="flex w-full cursor-pointer items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-150 hover:bg-surface-hover focus-visible:bg-surface-hover focus-visible:outline-none"
                  >
                    <span
                      aria-hidden
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        notification.isRead ? "bg-transparent" : "bg-ember"
                      }`}
                    />
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block truncate text-sm ${
                          notification.isRead ? "text-text-muted" : "font-semibold text-text-primary"
                        }`}
                      >
                        {notification.title}
                      </span>
                      <span className="mt-0.5 block text-xs text-text-muted line-clamp-2">
                        {notification.body}
                      </span>
                      <span className="mt-1 block text-[11px] text-text-muted">
                        {timeAgo(notification.createdAt)}
                      </span>
                    </span>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
