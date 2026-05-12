import { motion } from "framer-motion";

import { formatDateTime, relativeTime } from "./formatters.js";
import { shadow, EASE, transitionHover } from "./styles.js";

export function WebinarItem({ webinar, onRegister, registeringId }) {
  const isLive = webinar.status === "live";
  return (
    <li
      className={`rounded-[12px] border border-white/[0.05] bg-[#161F2E] pl-3 ${isLive ? "border-l-[3px] border-l-[#2EBF8A]" : "border-l-[3px] border-l-[#475569]"}`}
    >
      <div className="p-3 pl-2">
        <p className="text-[0.875rem] font-medium text-[#CBD5E1]">
          {webinar.title}
        </p>
        <p className="mt-1 text-[0.75rem] font-normal text-[#64748B]">
          {formatDateTime(webinar.scheduledAt)}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {isLive ? (
            <>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#2EBF8A]/25 bg-[#2EBF8A]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#2EBF8A]">
                <motion.span
                  className="inline-block h-1.5 w-1.5 rounded-full bg-[#2EBF8A]"
                  animate={{ opacity: [1, 0.4, 1], scale: [1, 1.15, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: EASE }}
                />
                Live
              </span>
              <button
                type="button"
                className={`rounded-[12px] border border-[rgba(46,191,138,0.3)] bg-[#161F2E] px-3 py-1.5 text-[0.75rem] font-medium text-[#2EBF8A] ${transitionHover} hover:bg-[#1C2A3E]`}
              >
                Join Now
              </button>
            </>
          ) : (
            <span className="rounded-full border border-[#475569]/30 bg-[#475569]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#64748B]">
              Scheduled
            </span>
          )}
          {!webinar.isRegistered && !isLive && (
            <button
              type="button"
              disabled={Boolean(registeringId)}
              onClick={() => onRegister?.(webinar.webinarId)}
              className={`text-[0.75rem] font-medium text-[#2EBF8A] underline-offset-4 ${transitionHover} hover:text-[#94A3B8] hover:underline disabled:opacity-40`}
            >
              {registeringId === webinar.webinarId ? "Registering…" : "Register"}
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

export function AnnouncementItem({ announcement }) {
  return (
    <li
      className={`flex gap-2 rounded-[12px] border border-white/[0.04] px-3 py-2.5 ${announcement.isPinned ? "border-l-[3px] border-l-[#F59E0B] bg-[rgba(245,158,11,0.04)]" : ""}`}
    >
      <span className="shrink-0 text-[#F59E0B]" aria-hidden>
        {announcement.isPinned ? "📌" : ""}
      </span>
      <div className="min-w-0">
        <p className="text-[0.875rem] font-medium text-[#CBD5E1]">
          {announcement.title}
        </p>
        <p className="text-[0.75rem] font-normal text-[#64748B]">
          {relativeTime(announcement.postedAt)}
        </p>
      </div>
    </li>
  );
}

export default function UpcomingPanel({
  webinars,
  announcements,
  onRegisterWebinar,
  registeringWebinarId,
}) {
  const panel = `rounded-[16px] border border-white/[0.05] bg-[#111827] ${shadow.card} ${shadow.cardHover} ${transitionHover} hover:border-white/[0.08] hover:bg-[#161F2E]`;

  return (
    <section className={`${panel} flex flex-col p-5 lg:p-6`}>
      <h2 className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#64748B]">
        Upcoming Sessions
      </h2>
      <ul className="mt-4 space-y-3">
        {webinars.map((w) => (
          <WebinarItem
            key={w.webinarId}
            webinar={w}
            onRegister={onRegisterWebinar}
            registeringId={registeringWebinarId}
          />
        ))}
      </ul>

      <hr className="my-5 border-white/[0.04]" />

      <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#64748B]">
        Announcements
      </h3>
      <ul className="mt-3 space-y-2">
        {announcements.map((a) => (
          <AnnouncementItem key={a.announcementId} announcement={a} />
        ))}
      </ul>
    </section>
  );
}
