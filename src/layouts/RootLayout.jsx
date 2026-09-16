import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { useAuthBootstrap } from "../app/features/auth/useAuth.js";
import { useThemeSync } from "../app/features/useThemeSync.js";

/**
 * A route change used to keep the previous page's scroll offset, so following
 * a link from halfway down the landing page opened the next route halfway
 * down. Plain in-page `<a href="#x">` clicks never reach useLocation, so the
 * docs TOC still scrolls natively and is unaffected by this.
 */
function useRouteScroll() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView();
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
}

/**
 * Router root. Its only job is to rehydrate the session exactly once, before
 * any guarded route evaluates.
 *
 * It deliberately does NOT block rendering on bootstrap: public routes (the
 * landing page, /login) should paint immediately. Only the guards wait, via
 * their `fallback` prop.
 */
const RootLayout = () => {
  useAuthBootstrap();
  useRouteScroll();
  // theme + accent were only applied inside /admin, so a learner's pages never
  // followed the preference at all
  useThemeSync();
  return <Outlet />;
};

export default RootLayout;
