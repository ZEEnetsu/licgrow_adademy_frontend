import { useMemo } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

import {
  selectCan,
  selectIsAuthenticated,
  selectIsBootstrapped,
} from "../../app/features/auth/auth.selectors.js";

/**
 * Route guard: requires specific RBAC permission(s).
 *
 * NOT A SECURITY BOUNDARY — see conventions §10. The server re-checks every
 * permission; this only avoids rendering a page the user would get 403s from.
 *
 * Remember the implication rule (05-rbac.md): `test:author` satisfies a
 * `test:read` requirement, and a super-admin satisfies everything.
 *
 * @param {string|string[]} perm required `resource:action` string(s)
 * @param {"all"|"any"} [mode] how to combine multiple — defaults to "all"
 *
 * @example
 * <Route element={<RequirePermission perm={PERMISSIONS.TEST_AUTHOR} />}>
 *   <Route path="manage-test" element={<Test />} />
 * </Route>
 */
const RequirePermission = ({
  children,
  perm,
  mode = "all",
  redirectTo = "/admin/overview",
  loginTo = "/login",
  fallback = null,
}) => {
  const location = useLocation();
  const isBootstrapped = useSelector(selectIsBootstrapped);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const can = useSelector(selectCan);

  // memoized for the same reason as RequireAuth: <Navigate> has `state` in its
  // effect deps, so an inline object loops until React bails out
  const redirectState = useMemo(
    () => ({
      from: { pathname: location.pathname, search: location.search },
    }),
    [location.pathname, location.search],
  );

  if (!isBootstrapped) return fallback;

  if (!isAuthenticated) {
    return <Navigate to={loginTo} replace state={redirectState} />;
  }

  if (!can(perm, { mode })) {
    // authenticated but not permitted — bounce somewhere they can be, rather
    // than to login, which would read as "your session expired"
    return <Navigate to={redirectTo} replace />;
  }

  return children ?? <Outlet />;
};

export default RequirePermission;
