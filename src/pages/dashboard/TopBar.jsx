import { Link } from 'react-router-dom';

import { transitionHover } from './styles.js';

export default function TopBar({
  user,
  unreadCount,
  onBellClick,
  onMenuClick,
  welcomeTitle = 'Your Desk',
  tagline,
  primaryCta = { href: '/mock-tests', label: 'Start mock test' },
}) {
  const subtitle =
    tagline ??
    "Jump into your next mock or join today's live session when you're ready.";

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.04] bg-[#080C14]/95 px-4 py-4 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start gap-4">
        <button
          type="button"
          className={`flex min-h-[48px] min-w-[48px] items-center justify-center rounded-[12px] border border-white/[0.05] bg-[#111827] text-[#64748B] lg:hidden ${transitionHover} hover:border-white/[0.1] hover:bg-[#161F2E] hover:text-[#F1F5F9]`}
          aria-label="Open menu"
          onClick={onMenuClick}
        >
          ☰
        </button>

        <div className="min-w-0 flex-1">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-[#2EBF8A]">
            {welcomeTitle}
          </p>
          <h1 className="mt-1 text-[clamp(1.25rem,3vw,1.5rem)] font-bold leading-tight tracking-tight text-[#F1F5F9]">
            Welcome back, {user.fullName}
          </h1>
          <p className="mt-2 max-w-2xl text-[clamp(0.8125rem,2vw,0.875rem)] font-normal leading-relaxed text-[#64748B]">
            {subtitle}
          </p>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <button
            type="button"
            onClick={onBellClick}
            className={`relative grid min-h-[48px] min-w-[48px] place-items-center rounded-[12px] border border-white/[0.05] bg-[#111827] text-[#64748B] ${transitionHover} hover:border-white/[0.1] hover:bg-[#161F2E] hover:text-[#F1F5F9]`}
            aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
          >
            🔔
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[#F43F5E] px-1 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>
          <Link
            to={primaryCta.href}
            className={`flex min-h-[48px] items-center justify-center rounded-[12px] border border-[rgba(46,191,138,0.3)] bg-[#111827] px-5 py-2.5 text-[0.875rem] font-medium text-[#2EBF8A] ${transitionHover} hover:border-[rgba(46,191,138,0.5)] hover:bg-[#161F2E]`}
          >
            {primaryCta.label}
          </Link>
        </div>
      </div>
    </header>
  );
}
