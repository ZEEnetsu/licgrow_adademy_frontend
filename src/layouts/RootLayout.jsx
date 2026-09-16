import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { useAuthBootstrap } from "../app/features/auth/useAuth.js";
import { useThemeSync } from "../app/features/useThemeSync.js";

/**
 * Which surface a route actually paints, regardless of the theme preference.
 *
 * The marketing and auth pages hardcode their own palette — the landing page
 * is white whatever the toggle says, and /login is near-black for the same
 * reason. Only the product routes follow the theme. `data-surface` carries
 * that to CSS, which uses it for `color-scheme` and the scrollbar (see the
 * SCROLLBARS block in index.css).
 */
const LIGHT_ONLY = ["/", "/benefits"];
const DARK_ONLY = ["/login", "/register"];

function surfaceFor(pathname) {
  if (LIGHT_ONLY.includes(pathname)) return "light";
  if (DARK_ONLY.includes(pathname)) return "dark";
  return "app";
}

function useSurfaceSync() {
  const { pathname } = useLocation();
  useEffect(() => {
    document.documentElement.dataset.surface = surfaceFor(pathname);
  }, [pathname]);
}

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
      // Anchors keep the CSS `scroll-behavior: smooth` glide — that movement
      // tells the reader where in the document they were sent.
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView();
        return;
      }
    }
    /*
     * A route change is a jump cut, not a glide. Without `instant` this call
     * inherits the global smooth behaviour and animates the whole way up —
     * from the foot of /benefits that is a 22,000px scroll through four
     * chapters of someone else's content on the way to a page they already
     * asked for.
     */
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
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
  useSurfaceSync();
  useRouteScroll();
  // theme + accent were only applied inside /admin, so a learner's pages never
  // followed the preference at all
  useThemeSync();
  return <Outlet />;
};

export default RootLayout;
