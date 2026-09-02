import { useCallback, useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import AdminLayout from "../../layouts/AdminLayout.jsx";
import AdminMenu from "./AdminMenu.jsx";
import AdminHeader from "./AdminHeader.jsx";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";

const PREF_KEY = "licgrow.admin.menuCollapsed";

/** Reading localStorage throws in some privacy modes; a lost preference is fine. */
const readPref = () => {
  try {
    return window.localStorage.getItem(PREF_KEY) === "true";
  } catch {
    return false;
  }
};

const Admin = () => {
  // Desktop and mobile are two different behaviours, so they get two states:
  // the rail collapses in place on desktop, and slides over the content on
  // mobile. A single flag would have "collapsed" and "hidden" fighting.
  const [collapsed, setCollapsed] = useState(readPref);
  const { pathname } = useLocation();

  // The drawer records *which route* it was opened on rather than a bare
  // boolean, so navigating anywhere closes it by derivation — including via the
  // browser's back button, which no click handler would catch.
  const [openedOn, setOpenedOn] = useState(null);
  const mobileOpen = openedOn === pathname;

  const closeMobile = useCallback(() => setOpenedOn(null), []);
  const openMobile = useCallback(() => setOpenedOn(pathname), [pathname]);

  const toggle = useCallback(() => {
    // On mobile the same button is the drawer's close button.
    if (mobileOpen) {
      setOpenedOn(null);
      return;
    }
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(PREF_KEY, String(next));
      } catch {
        /* preference is a nicety, not a requirement */
      }
      return next;
    });
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpenedOn(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  // Resizing past the breakpoint with the drawer open would otherwise leave it
  // marked open, so the next narrow viewport shows it uninvited.
  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const onChange = (event) => {
      if (event.matches) setOpenedOn(null);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return (
    <AdminLayout>
      <AdminMenu
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggle={toggle}
        onNavigate={closeMobile}
      />
      {/* min-w-0 lets wide tables scroll inside instead of stretching the shell */}
      <div className="flex-1 min-w-0 flex flex-col">
        <AdminHeader onOpenDrawer={openMobile} />
        <DashboardLayout>
          <Outlet />
        </DashboardLayout>
      </div>
    </AdminLayout>
  );
};

export default Admin;
