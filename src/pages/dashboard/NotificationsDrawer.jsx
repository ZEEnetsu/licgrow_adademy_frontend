import { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { relativeTime } from './formatters.js';
import { shadow, EASE, transitionHover } from './styles.js';

function typeIcon(type) {
  if (type === 'enrollment_approved')
    return (
      <span className="text-[#2EBF8A]" aria-hidden>
        ✅
      </span>
    );
  if (type === 'webinar_starting')
    return (
      <span className="text-[#F59E0B]" aria-hidden>
        📹
      </span>
    );
  return (
    <span className="text-[#56CFE1]" aria-hidden>
      🧪
    </span>
  );
}

export default function NotificationsDrawer({
  open,
  onClose,
  notifications,
  onMarkRead,
  onMarkAllRead,
}) {
  const unreadCount = useMemo(
    () => notifications.data.filter((n) => !n.isRead).length,
    [notifications.data],
  );

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            key="notif-backdrop"
            type="button"
            aria-label="Close notifications"
            className="fixed inset-0 z-[100] bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            onClick={onClose}
          />
          <motion.aside
            key="notif-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dash-notif-title"
            className={`fixed inset-y-0 right-0 z-[110] flex w-[380px] max-w-[100vw] flex-col border-l border-white/[0.06] bg-[#0D1117] ${shadow.drawer}`}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%', transition: { duration: 0.3, ease: EASE } }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
              <div className="flex items-center gap-2">
                <h2 id="dash-notif-title" className="text-base font-semibold text-[#F1F5F9]">
                  Notifications
                </h2>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-[#F43F5E] px-2 py-0.5 text-[11px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={onMarkAllRead}
                className={`text-xs font-semibold text-[#64748B] ${transitionHover} hover:text-[#2EBF8A]`}
              >
                Mark all read
              </button>
            </div>
            <ul className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[#1C2A3E] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#475569]">
              {notifications.data.map((n, i) => (
                <motion.li
                  key={n.notificationId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.05 * i, ease: EASE }}
                >
                  <button
                    type="button"
                    onClick={() => onMarkRead(n.notificationId)}
                    className={`flex w-full gap-3 border-b border-white/[0.04] px-4 py-4 text-left ${transitionHover} hover:bg-[#161F2E] ${
                      !n.isRead
                        ? 'border-l-[3px] border-l-[#2EBF8A] bg-[rgba(46,191,138,0.04)] pl-[calc(1rem-3px)]'
                        : 'border-l-[3px] border-l-transparent'
                    }`}
                  >
                    <span className="text-lg">{typeIcon(n.type)}</span>
                    <div className="min-w-0">
                      <p className={`text-[0.875rem] font-medium ${n.isRead ? 'text-[#94A3B8]' : 'text-[#F1F5F9]'}`}>
                        {n.title}
                      </p>
                      <p className="mt-1 text-[0.8125rem] font-normal leading-relaxed text-[#94A3B8]">{n.body}</p>
                      <p className="mt-2 text-[11px] text-[#64748B]">{relativeTime(n.createdAt)}</p>
                    </div>
                  </button>
                </motion.li>
              ))}
            </ul>
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
