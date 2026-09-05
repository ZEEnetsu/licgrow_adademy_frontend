import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

import ToggleBtn from "../../components/ToggleBtn.jsx";
import { selectTheme } from "../../app/features/theme.slice.js";
// dark-theme icons
import dashboard from "../../assets/dashboardIcons/dashboard.svg";
import user from "../../assets/dashboardIcons/account.svg";
import batch from "../../assets/dashboardIcons/batch.svg";
import test from "../../assets/dashboardIcons/test.svg";
import announcement from "../../assets/dashboardIcons/announcement.svg";
import settings from "../../assets/dashboardIcons/settings.svg";
import course from "../../assets/dashboardIcons/course.svg";
import enrollment from "../../assets/dashboardIcons/enrollment.svg";
import toggleMenu from '../../assets/dashboardIcons/toggleMenu.svg'
// light-theme icons
import dashboard_light from "../../assets/dashboardIcons/lightTheme/dashboard.svg";
import account from "../../assets/dashboardIcons/lightTheme/account.svg";
import batch_light from "../../assets/dashboardIcons/lightTheme/batch.svg";
import cource_light from "../../assets/dashboardIcons/lightTheme/course.svg";
import test_light from "../../assets/dashboardIcons/lightTheme/test.svg";
import announcement_light from "../../assets/dashboardIcons/lightTheme/announcement.svg";
import setting_light from "../../assets/dashboardIcons/lightTheme/setting.svg";
import enrollment_light from "../../assets/dashboardIcons/lightTheme/enrollment.svg";
import toggleMenu_light from '../../assets/dashboardIcons/lightTheme/toggleMenu.svg';
/**
 * Admin sidebar.
 *
 * Two behaviours, one component:
 *  · desktop — collapses to an icon rail, animating its own width
 *  · mobile  — slides in over the content with a backdrop, because pushing a
 *              240px panel on a phone leaves nothing to read
 *
 * Only `width` and `transform` are animated. Animating layout properties like
 * padding or margin here would make every frame re-layout the whole grid, and
 * the charts to the right would jitter for the duration.
 */

const MENU = [
  { id: 1, title: "Dashboard", to: "/admin/overview", dark: dashboard, light: dashboard_light },
  { id: 2, title: "User", to: "/admin/manage-users", dark: user, light: account },
  { id: 3, title: "Batch", to: "/admin/manage-batch", dark: batch, light: batch_light },
  { id: 4, title: "Course", to: "/admin/manage-course", dark: course, light: cource_light },
  { id: 5, title: "Test", to: "/admin/manage-test", dark: test, light: test_light },
  { id: 6, title: "Enrollments", to: "/admin/enrollments", dark: enrollment, light: enrollment_light },
  { id: 8, title: "Announcements", to: "/admin/announcements", dark: announcement, light: announcement_light },
  { id: 9, title: "Administrators", to: "/admin/administrators", dark: settings, light: setting_light },
];

const AdminMenu = ({ collapsed, mobileOpen, onToggle, onNavigate }) => {
  const mode = useSelector(selectTheme);

  return (
    <>
      {/* backdrop — mobile only, and only while the drawer is out */}
      <button
        type="button"
        aria-hidden={!mobileOpen}
        tabIndex={-1}
        onClick={onNavigate}
        className={`fixed inset-0 z-30 bg-black/50 md:hidden transition-opacity duration-300 ${
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      <aside
        className={`
          z-40 shrink-0 flex flex-col border-r border-border bg-surface
          transition-[width,transform] duration-300 ease-in-out
          max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:w-60
          ${mobileOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full"}
          ${collapsed ? "md:w-16" : "md:w-60"}
        `}
      >
        <div className="h-16 shrink-0 flex items-center gap-2 px-3 border-b border-border">
          <button
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? "Expand menu" : "Collapse menu"}
            aria-expanded={!collapsed}
            className="h-9 w-9 shrink-0 grid place-items-center rounded-md bg-accent-muted hover:bg-accent/20 transition-colors cursor-pointer"
          >
            {/* a chevron, not a hamburger: it has to say which way it goes */}
            <span
              aria-hidden
              className={`block text-text-muted text-lg leading-none transition-transform duration-300 ${
                collapsed ? "rotate-180" : ""
              }`}
            >
            <img src={ mode === 'dark'? toggleMenu : toggleMenu_light} alt="" className="h-5" />
            </span>
          </button>

          {/*
            The wordmark collapses by animating width to zero rather than
            unmounting, so the rail does not visibly reflow mid-transition.
          */}
          <span
            className={`overflow-hidden whitespace-nowrap font-bold text-text-primary transition-all duration-300 ${
              collapsed ? "md:w-0 md:opacity-0" : "w-auto opacity-100"
            }`}
            style={{ fontFamily: '"Playwrite GB J", cursive' }}
          >
            Licgroww.
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3">
          {MENU.map((item) => (
            <NavLink
              key={item.id}
              to={item.to}
              onClick={onNavigate}
              title={collapsed ? item.title : undefined}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 mx-2 my-0.5 px-4 h-10 rounded-3xl transition-colors
                 ${
                   isActive
                     ? "bg-accent-solid text-accent-solid-contrast shadow-elevate"
                     : "text-text-muted hover:bg-surface-hover hover:text-text-primary"
                 }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* active marker, so the icon rail still shows selection */}
                  <span
                    aria-hidden
                    className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r transition-opacity ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  {/*
                    These are fixed-fill SVGs behind an <img>, so CSS cannot
                    recolour them — the variant has to match what is behind it.
                    The pale one goes on the solid accent fill and on the dark
                    theme's sidebar; the black one only on a light sidebar.
                  */}
                  <img
                    src={isActive || mode === "dark" ? item.dark : item.light}
                    alt=""
                    className="h-5 w-5 shrink-0"
                  />
                  <span
                    className={`text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${
                      collapsed ? "md:w-0 md:opacity-0" : "w-auto opacity-100"
                    }`}
                  >
                    {item.title}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div
          className={`h-14 shrink-0 flex items-center border-t border-border px-3 justify-between ${
            collapsed ? "md:justify-center" : ""
          }`}
        >
          {/* the switch itself carries the accessible name; this is decoration */}
          <span
            aria-hidden
            className={`text-xs text-text-muted font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${
              collapsed ? "md:w-0 md:opacity-0" : "w-auto opacity-100"
            }`}
          >
            Dark mode
          </span>
          <ToggleBtn />
        </div>
      </aside>
    </>
  );
};

export default AdminMenu;
