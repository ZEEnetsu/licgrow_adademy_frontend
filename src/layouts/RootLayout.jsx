import { Outlet } from "react-router-dom";

import { useAuthBootstrap } from "../app/features/auth/useAuth.js";
import { useThemeSync } from "../app/features/useThemeSync.js";

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
  // theme + accent were only applied inside /admin, so a learner's pages never
  // followed the preference at all
  useThemeSync();
  return <Outlet />;
};

export default RootLayout;
