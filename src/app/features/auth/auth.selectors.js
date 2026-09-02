/**
 * Memoized auth selectors.
 *
 * `createSelector` is not a micro-optimisation here. `expandPermissions`
 * returns a NEW Set on every call, and `useSelector` compares by reference —
 * without memoization every guarded component in the tree would re-render on
 * every dispatch in the app, including unrelated ones like theme toggles.
 */

import { createSelector } from "@reduxjs/toolkit";

import { AUTH_STATUS } from "./auth.slice.js";
import { ACTOR, checkExpanded, expandPermissions } from "./permissions.js";

// ── primitives ─────────────────────────────────────────────────────────────

export const selectAuthState = (state) => state.auth;
export const selectAuthStatus = (state) => state.auth.status;
export const selectActor = (state) => state.auth.actor;
export const selectAuthError = (state) => state.auth.error;
export const selectRawPermissions = (state) => state.auth.permissions;
export const selectIsBootstrapped = (state) => state.auth.bootstrapped;
export const selectLastLogoutReason = (state) => state.auth.lastLogoutReason;
export const selectLockedUntil = (state) => state.auth.lockedUntil;

export const selectActorType = (state) => state.auth.actor?.type ?? null;

export const selectIsAuthenticated = (state) =>
  state.auth.status === AUTH_STATUS.AUTHENTICATED && Boolean(state.auth.actor);

export const selectIsBootstrapping = (state) =>
  state.auth.status === AUTH_STATUS.BOOTSTRAPPING;

/** The staff-admin's role name, or null for other actors. */
export const selectRole = (state) => state.auth.actor?.role ?? null;

// ── derived ────────────────────────────────────────────────────────────────

/**
 * Granted permissions plus the ones they imply (`:manage`/`:author` ⇒ `:read`).
 * @type {(state: object) => Set<string>}
 */
export const selectEffectivePermissions = createSelector(
  [selectRawPermissions],
  (permissions) => expandPermissions(permissions),
);

/**
 * A stable predicate for permission checks.
 *
 * @example
 * const can = useSelector(selectCan);
 * can(PERMISSIONS.TEST_AUTHOR);
 * can([PERMISSIONS.TEST_AUTHOR, PERMISSIONS.BATCH_MANAGE], { mode: "any" });
 */
export const selectCan = createSelector(
  [selectActorType, selectEffectivePermissions],
  (actorType, effective) =>
    (required, options) =>
      checkExpanded(actorType, effective, required, options),
);

export const selectIsStaffAdmin = createSelector(
  [selectActorType],
  (type) => type === ACTOR.STAFF_ADMIN,
);

export const selectIsSuperAdmin = createSelector(
  [selectActorType],
  (type) => type === ACTOR.SUPER_ADMIN,
);

export const selectIsLearner = createSelector(
  [selectActorType],
  (type) => type === ACTOR.LEARNER,
);

/** Can this actor reach the admin area at all? */
export const selectCanAccessAdmin = createSelector(
  [selectActorType],
  (type) => type === ACTOR.STAFF_ADMIN || type === ACTOR.SUPER_ADMIN,
);

/**
 * Auth-strict rate-limit lockout (conventions §7).
 * Note this is derived at call time, so read it from `useIsLockedOut()` if you
 * need it to tick down live.
 */
export const selectIsLockedOut = (state) => {
  const until = state.auth.lockedUntil;
  return Boolean(until && until > Date.now());
};
