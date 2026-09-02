import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

import NotificationBell from "../../components/NotificationBell.jsx";
import search from "../../assets/search.svg";
import adminAvatar from "../../assets/avatar/adminAvatar.jpg";
import { useAuth } from "../../app/features/auth/useAuth.js";
import { ACTOR } from "../../app/features/auth/permissions.js";

const ACTOR_LABEL = {
  [ACTOR.SUPER_ADMIN]: "Super admin",
  [ACTOR.STAFF_ADMIN]: "Staff admin",
  [ACTOR.LEARNER]: "Learner",
};

/**
 * Longest prefix wins, so `/admin/manage-users/ln-123` still reads "Users".
 * The title used to come from a `activeLink` state that no menu item updated
 * any more, so it was stuck on "Dashboard" for every page.
 */
const TITLES = [
  ["/admin/manage-users", "Users"],
  ["/admin/manage-batch", "Batches"],
  ["/admin/manage-course", "Courses"],
  ["/admin/manage-test", "Tests"],
  ["/admin/enrollments", "Enrollments"],
  ["/admin/announcements", "Announcements"],
  ["/admin/administrators", "Administrators"],
  ["/admin/notifications", "Notifications"],
  ["/admin/test-history", "Test history"],
  ["/admin/overview", "Dashboard"],
];

const titleFor = (pathname) =>
  TITLES.find(([prefix]) => pathname.startsWith(prefix))?.[1] ?? "Dashboard";

/** Avatar menu: who you are, what you can do, and the way out. */
const AccountMenu = () => {
  const { actor, actorType, role, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

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

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="block rounded-full focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer"
      >
        <img src={adminAvatar} alt="" className="h-9 w-9 rounded-full" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-12 z-50 w-56 rounded-lg border border-border bg-surface-elevated shadow-lg overflow-hidden"
        >
          <div className="px-3 py-3 border-b border-border">
            <p className="text-sm font-medium text-text-primary truncate">
              {actor?.fullName ?? "Signed in"}
            </p>
            <p className="text-xs text-text-muted truncate">
              {actor?.email}
            </p>
            <p className="text-[10px] text-text-muted mt-1 uppercase tracking-wide">
              {ACTOR_LABEL[actorType] ?? actorType}
              {role ? ` · ${role}` : ""}
            </p>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-surface-elevated-hover transition-colors cursor-pointer"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * Header bar.
 *
 * `h-16 shrink-0` — a fixed height, matching the sidebar's own header so the
 * two hairlines line up. It was `row-span-1` of a 12-row grid before, which
 * made its height a fraction of the viewport: cramped on a laptop, absurd on a
 * tall monitor.
 *
 * The date and search box drop out below `lg`, in that order, because they are
 * the least load-bearing things here — the title, notifications and account
 * menu stay at every width.
 */
const AdminHeader = ({ onOpenDrawer }) => {
  const { pathname } = useLocation();
  const [currentDate] = useState(() =>
    new Date().toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  );

  return (
    <header className="h-16 shrink-0 flex items-center gap-3 px-4 sm:px-6 border-b border-border bg-surface">
      <button
        type="button"
        onClick={onOpenDrawer}
        aria-label="Open menu"
        className="md:hidden h-9 w-9 shrink-0 grid place-items-center rounded-md text-text-muted hover:bg-surface-hover transition-colors cursor-pointer"
      >
        <span aria-hidden>☰</span>
      </button>

      <h1 className="text-xl sm:text-2xl font-semibold text-text-primary truncate">
        {titleFor(pathname)}
      </h1>

      <div className="ml-auto flex items-center gap-3 sm:gap-4">
        <span className="hidden xl:block text-text-muted text-xs font-semibold whitespace-nowrap">
          {currentDate}
        </span>

        <label className="hidden lg:flex items-center gap-2 h-9 px-3 rounded-lg bg-bg">
          <img src={search} alt="" className="h-4 w-4 opacity-60" />
          <input
            placeholder="Search"
            aria-label="Search"
            className="w-36 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
          />
        </label>

        <NotificationBell deepLink={false} />
        <AccountMenu />
      </div>
    </header>
  );
};

export default AdminHeader;
