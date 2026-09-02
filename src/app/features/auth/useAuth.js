/**
 * Primary auth hook — the one components should reach for.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  selectActor,
  selectActorType,
  selectAuthError,
  selectAuthStatus,
  selectIsAuthenticated,
  selectIsBootstrapped,
  selectIsBootstrapping,
  selectCanAccessAdmin,
  selectLastLogoutReason,
  selectLockedUntil,
  selectRole,
} from "./auth.selectors.js";
import { errorCleared, lockoutCleared } from "./auth.slice.js";
import {
  bootstrapAuth,
  logout as logoutThunk,
  syncLogoutFromOtherTab,
} from "./auth.thunks.js";
import { subscribeToAuthEvents, AUTH_EVENTS } from "./authSync.js";

export function useAuth() {
  const dispatch = useDispatch();

  const actor = useSelector(selectActor);
  const actorType = useSelector(selectActorType);
  const status = useSelector(selectAuthStatus);
  const error = useSelector(selectAuthError);
  const role = useSelector(selectRole);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isBootstrapped = useSelector(selectIsBootstrapped);
  const isBootstrapping = useSelector(selectIsBootstrapping);
  const canAccessAdmin = useSelector(selectCanAccessAdmin);
  const lastLogoutReason = useSelector(selectLastLogoutReason);

  const logout = useCallback(() => dispatch(logoutThunk()), [dispatch]);
  const clearError = useCallback(() => dispatch(errorCleared()), [dispatch]);
  const clearLockout = useCallback(
    () => dispatch(lockoutCleared()),
    [dispatch],
  );

  return {
    actor,
    actorType,
    role,
    status,
    error,
    isAuthenticated,
    isBootstrapped,
    isBootstrapping,
    canAccessAdmin,
    lastLogoutReason,
    logout,
    clearError,
    clearLockout,
  };
}

/**
 * Mount ONCE at the top of the app (or the admin shell). Rehydrates the
 * session from the refresh token and wires up cross-tab logout.
 *
 * @example
 * const { isBootstrapped } = useAuthBootstrap();
 * if (!isBootstrapped) return <Splash />;
 */
export function useAuthBootstrap() {
  const dispatch = useDispatch();
  const isBootstrapped = useSelector(selectIsBootstrapped);

  useEffect(() => {
    dispatch(bootstrapAuth());
  }, [dispatch]);

  useEffect(
    () =>
      subscribeToAuthEvents((event) => {
        if (event.type === AUTH_EVENTS.LOGOUT) {
          dispatch(syncLogoutFromOtherTab());
        }
      }),
    [dispatch],
  );

  return { isBootstrapped };
}

/**
 * Live countdown for the auth-strict rate limit, for disabling a login button.
 * @returns {{ locked: boolean, secondsRemaining: number }}
 */
export function useIsLockedOut() {
  const lockedUntil = useSelector(selectLockedUntil);
  const [now, setNow] = useState(() => Date.now());

  const locked = Boolean(lockedUntil && lockedUntil > now);

  useEffect(() => {
    if (!locked) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [locked]);

  return useMemo(
    () => ({
      locked,
      secondsRemaining: locked
        ? Math.max(0, Math.ceil((lockedUntil - now) / 1000))
        : 0,
    }),
    [locked, lockedUntil, now],
  );
}

export default useAuth;
