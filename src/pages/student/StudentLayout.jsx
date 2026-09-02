import { NavLink, Outlet } from "react-router-dom";

import { useAuth } from "../../app/features/auth/useAuth.js";
import NotificationBell from "../../components/NotificationBell.jsx";

/**
 * Learner shell.
 *
 * Deliberately minimal: everything a learner can actually do today is reached
 * from `GET /me/batches` (06 §13) and `GET /batches/available` (06 §12).
 * Attempts, results and notifications arrive in later phases.
 */

const NAV = [
  { to: "/student", label: "Dashboard", end: true },
  { to: "/student/courses", label: "My courses" },
  { to: "/student/history", label: "Test history" },
  { to: "/student/batches", label: "My batches" },
  { to: "/student/announcements", label: "Announcements" },
];

const StudentLayout = () => {
  const { actor, logout } = useAuth();

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <header className="border-b border-border-muted">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center gap-6">
          <span
            className="text-text-primary font-bold"
            style={{ fontFamily: '"Playwrite GB J", cursive' }}
          >
            Licgroww.
          </span>

          <nav className="flex gap-4 flex-1 overflow-x-auto whitespace-nowrap">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `text-sm transition-colors ${
                    isActive
                      ? "text-text-primary font-medium"
                      : "text-text-muted hover:text-text-primary"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <NotificationBell />
            <NavLink to={'profile'} className="text-xs text-text-muted hidden sm:inline">
              {actor?.fullName}
            </NavLink>
            <button
              type="button"
              onClick={logout}
              className="text-xs text-text-muted hover:text-text-primary cursor-pointer"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default StudentLayout;
