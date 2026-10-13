import { useCallback, useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

import AdminLayout from "../../layouts/AdminLayout.jsx";
import { EXPO } from "../../components/motion/primitives.js";
import { useHotkey } from "../../hooks/useHotkey.js";
import AdminMenu from "./shell/AdminMenu.jsx";
import AdminHeader from "./shell/AdminHeader.jsx";
import CommandPalette from "./shell/CommandPalette.jsx";

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
  const mainRef = useRef(null);
  const firstRoute = useRef(true);
  const [scrolled, setScrolled] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  // The drawer records *which route* it was opened on rather than a bare
  // boolean, so navigating anywhere closes it by derivation — including via the
  // browser's back button, which no click handler would catch.
  const [openedOn, setOpenedOn] = useState(null);
  const mobileOpen = openedOn === pathname;

  const closeMobile = useCallback(() => setOpenedOn(null), []);
  const openMobile = useCallback(() => setOpenedOn(pathname), [pathname]);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(PREF_KEY, String(next));
      } catch {
        /* preference is a nicety, not a requirement */
      }
      return next;
    });
  }, []);

  useHotkey("escape", closeMobile, { enabled: mobileOpen, allowInInputs: true });
  useHotkey(
    "mod+k",
    (event) => {
      event.preventDefault();
      setPaletteOpen((open) => !open);
    },
    { allowInInputs: true },
  );

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

  // <main> is the scroll container, not the window, so a new page has to be
  // scrolled back to the top here (RootLayout only resets `window`). Focus
  // moves to <main> too, so a screen reader starts reading the new page.
  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;
    main.scrollTo({ top: 0 });
    if (firstRoute.current) {
      firstRoute.current = false;
      return;
    }
    main.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <AdminLayout>
      <AdminMenu
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggle={toggleCollapsed}
        onCloseMobile={closeMobile}
      />

      {/* inert while the drawer is over it, so Tab can't wander behind the scrim */}
      <div className="flex min-w-0 flex-1 flex-col" inert={mobileOpen ? "" : undefined}>
        <AdminHeader
          onOpenDrawer={openMobile}
          onOpenPalette={() => setPaletteOpen(true)}
          scrolled={scrolled}
        />
        <main
          id="admin-main"
          ref={mainRef}
          tabIndex={-1}
          onScroll={(event) => setScrolled(event.currentTarget.scrollTop > 4)}
          className="scroll-panel min-h-0 flex-1 overflow-x-hidden overflow-y-auto outline-none"
        >
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: EXPO }}
            className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-1 pt-2 pb-16 sm:px-3 lg:gap-8 lg:px-6"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </AdminLayout>
  );
};

export default Admin;
