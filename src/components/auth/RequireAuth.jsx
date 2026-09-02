import { useMemo } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

import {
  selectActorType,
  selectIsAuthenticated,
  selectIsBootstrapped,
} from "../../app/features/auth/auth.selectors.js";

/**
 * Route guard: requires an authenticated session, optionally of a specific
 * actor type.
 *
 * NOT A SECURITY BOUNDARY — see conventions §10. This stops an unauthenticated
 * user from seeing a broken shell; the server rejects the underlying requests
 * regardless of what renders.
 *
 * Renders `fallback` until `bootstrapAuth()` settles, which is what prevents
 * the login screen flashing on every page refresh (the access token is
 * memory-only, so a cold load is briefly indistinguishable from signed-out).
 *
 * @example
 * // wrapping a subtree
 * <Route element={<RequireAuth actor={ACTOR.STAFF_ADMIN} />}>
 *   <Route path="/admin" element={<Admin />} />
 * </Route>
 *
 * // or wrapping children directly
 * <RequireAuth><Admin /></RequireAuth>
 */
const RequireAuth = ({
  children,
  actor,
  redirectTo = "/login",
  fallback = null,
}) => {
  const location = useLocation();
  const isBootstrapped = useSelector(selectIsBootstrapped);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const actorType = useSelector(selectActorType);

  /*
   * MUST be memoized. React Router's <Navigate> lists `state` in its effect
   * dependency array, so an inline `state={{ from: location }}` is a new
   * object on every render: the effect re-fires, navigates, re-renders, and
   * loops until React throws "Maximum update depth exceeded".
   *
   * Keyed on the path strings rather than the location object, which itself
   * gets a fresh identity on every navigation.
   */
  const redirectState = useMemo(
    () => ({
      from: { pathname: location.pathname, search: location.search },
    }),
    [location.pathname, location.search],
  );

  if (!isBootstrapped) return fallback;

  if (!isAuthenticated) {
    // `state.from` lets the login page send the user back where they were
    return <Navigate to={redirectTo} replace state={redirectState} />;
  }

  if (actor) {
    const allowed = Array.isArray(actor) ? actor : [actor];
    if (!allowed.includes(actorType)) {
      return <Navigate to={redirectTo} replace state={redirectState} />;
    }
  }

  return children ?? <Outlet />;
};

export default RequireAuth;
