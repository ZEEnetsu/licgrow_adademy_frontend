import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { useAuthBootstrap } from "../app/features/auth/useAuth.js";
import { useThemeSync } from "../app/features/useThemeSync.js";
import { LIGHT_PATHS } from "../pages/site/sections.js";

/**
 * Which surface a route actually paints, regardless of the theme preference.
 *
 * The public and sign-in pages hardcode their own cream palette whatever the
 * toggle says (LIGHT_PATHS); only the product routes follow the theme.
 * `data-surface` carries that to CSS, which uses it for `color-scheme` and
 * the scrollbar (see the SCROLLBARS block in index.css).
 */
function surfaceFor(pathname) {
  return LIGHT_PATHS.includes(pathname) ? "light" : "app";
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
  const lastPath = useRef(pathname);
  useEffect(() => {
    const samePage = lastPath.current === pathname;
    lastPath.current = pathname;

    if (hash) {
      const id = hash.slice(1);
      const el = document.getElementById(id);
      if (el && samePage) {
        // Same page: keep the CSS `scroll-behavior: smooth` glide — that
        // movement tells the reader where in the document they were sent.
        el.scrollIntoView();
        return;
      }
      if (el) {
        /*
         * Arriving from another route, the new page is still settling:
         * pinned chapters measure their scroll length after first paint and
         * grow by thousands of pixels, pushing the target down after a
         * single jump. Jump now, then re-align as layout settles — unless
         * the reader starts scrolling first.
         */
        const align = () => document.getElementById(id)?.scrollIntoView({ behavior: "instant", block: "start" });
        align();
        const timers = [80, 300, 700, 1200].map((ms) => window.setTimeout(align, ms));
        const stop = () => timers.forEach((tm) => window.clearTimeout(tm));
        const opts = { once: true, passive: true };
        window.addEventListener("wheel", stop, opts);
        window.addEventListener("touchstart", stop, opts);
        window.addEventListener("keydown", stop, opts);
        return () => {
          stop();
          window.removeEventListener("wheel", stop);
          window.removeEventListener("touchstart", stop);
          window.removeEventListener("keydown", stop);
        };
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
