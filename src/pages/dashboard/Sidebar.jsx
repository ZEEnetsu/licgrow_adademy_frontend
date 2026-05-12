import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

import { ShieldIcon } from './ShieldIcon.jsx';
import { shadow, EASE, transitionHover } from './styles.js';

export default function Sidebar({
  user,
  role,
  enrollmentLabel,
  unreadCount,
  onNotificationsClick,
  onSignOut,
  sidebarOpen,
  onCloseMobile,
}) {
  const initials = (user.fullName || 'LG')
    .split(/\s+/)
    .filter(Boolean)
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.button
            type="button"
            aria-label="Close menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={onCloseMobile}
          />
        )}
      </AnimatePresence>

      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex h-screen w-[260px] flex-col bg-[#0D1117]',
          shadow.sidebar,
          'transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] md:w-16 lg:w-[260px] lg:sticky lg:top-0 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
      >
        <div className="flex h-[52px] items-center gap-2.5 px-4 lg:justify-start">
          <span className="grid h-9 w-9 shrink-0 place-items-center text-[#2EBF8A]">
            <ShieldIcon className="h-6 w-6" />
          </span>
          <span className="hidden truncate font-medium tracking-tight text-[#F1F5F9] lg:inline lg:text-[0.875rem]">
            LICPro <span className="text-[#2EBF8A]">Academy</span>
          </span>
        </div>

        <div className="hidden border-t border-white/[0.04] px-4 py-4 lg:block">
          <div className="flex items-center gap-3">
            <div
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/[0.08] bg-[#161F2E] text-sm font-semibold text-[#2EBF8A]"
              aria-hidden
            >
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[0.875rem] font-medium text-[#F1F5F9]">{user.fullName}</p>
              <p className="truncate text-[0.75rem] font-normal text-[#64748B]">{user.username}</p>
              <span className="mt-1.5 inline-block rounded-full border border-[#2EBF8A]/25 bg-[#2EBF8A]/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#2EBF8A]">
                {enrollmentLabel ?? '—'}
              </span>
            </div>
          </div>
        </div>

        <nav
          className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-3 lg:px-3 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[#1C2A3E] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#475569]"
          aria-label="Dashboard navigation"
        >
          {role === 'ADMIN' ? (
            <>
              <NavRow
                icon="📊"
                label="Admin overview"
                to="/dashboard/admin"
                onNavigate={onCloseMobile}
              />
              <NavRow
                icon="📚"
                label="Courses"
                to="/dashboard/admin/courses"
                onNavigate={onCloseMobile}
              />
              <NavRow
                icon="🧪"
                label="Mock tests"
                to="/dashboard/admin/tests"
                onNavigate={onCloseMobile}
              />
            </>
          ) : (
            <>
              <NavRow icon="📊" label="Overview" to="/dashboard" onNavigate={onCloseMobile} />
              <NavRow icon="📚" label="My Course" to="/dashboard" onNavigate={onCloseMobile} />
              <NavRow icon="🧪" label="Mock Tests" to="/mock-tests" onNavigate={onCloseMobile} />
            </>
          )}
          {role === 'ADMIN' ? null : (
            <NavRow icon="📹" label="Webinars" />
          )}
          {role === 'ADMIN' ? null : (
            <NavRow icon="📣" label="Announcements" />
          )}
          <NavRow
            icon="🔔"
            label="Notifications"
            badge={unreadCount}
            onClick={onNotificationsClick}
          />
          <NavRow icon="🔑" label="Change Password" />
        </nav>

        <div className="border-t border-white/[0.04] p-3">
          <button
            type="button"
            onClick={onSignOut}
            className={`flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[12px] border border-white/[0.05] bg-[#111827] px-3 py-2.5 text-[0.875rem] font-normal text-[#64748B] ${transitionHover} hover:border-rose-500/20 hover:bg-rose-950/25 hover:text-rose-300 md:justify-center lg:justify-start`}
          >
            <span className="text-[#475569] lg:inline">⎋</span>
            <span className="hidden lg:inline">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

function NavRow({ icon, label, active, badge, onClick, to, onNavigate }) {
  const inner = (
    <>
      <span className={`text-base md:text-lg lg:text-base ${active ? 'text-[#2EBF8A]' : 'text-[#475569]'}`}>
        {icon}
      </span>
      <span
        className={`hidden flex-1 truncate text-left text-[0.875rem] lg:inline ${active ? 'font-medium text-[#F1F5F9]' : 'font-normal text-[#64748B]'}`}
      >
        {label}
      </span>
      {badge > 0 && (
        <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[#F43F5E] px-1 text-[10px] font-bold text-white">
          {badge}
        </span>
      )}
    </>
  );

  const base =
    `flex w-full min-h-[48px] items-center gap-3 rounded-[12px] px-3 py-2 md:justify-center lg:justify-start ${transitionHover}`;

  const inactive =
    'border border-transparent hover:bg-[#161F2E] hover:text-[#CBD5E1] [&:hover_span]:text-[#94A3B8]';
  const activeCls =
    'border border-[rgba(46,191,138,0.12)] bg-[rgba(46,191,138,0.06)] pl-[calc(0.75rem-3px)] lg:border-l-[3px] lg:border-l-[#2EBF8A]';

  if (to) {
    return (
      <Link to={to} onClick={onNavigate} className={`${base} ${inactive}`}>
        {inner}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${base} ${inactive}`}>
        {inner}
      </button>
    );
  }

  return (
    <button type="button" className={`${base} ${active ? activeCls : inactive}`}>
      {inner}
    </button>
  );
}
