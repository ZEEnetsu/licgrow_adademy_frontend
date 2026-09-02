/**
 * Permission hooks.
 *
 * REMINDER: these gate UI, not access. Conventions §10 — "Authorization is
 * defense-in-depth: RBAC permission and ownership/membership invariants are
 * both checked server-side; the frontend hiding a button is never the only
 * guard." Hiding a control is a courtesy to the user, not a security measure.
 */

import { useMemo } from "react";
import { useSelector } from "react-redux";

import {
  selectCan,
  selectEffectivePermissions,
  selectActorType,
} from "./auth.selectors.js";

/**
 * Does the current actor hold the given permission(s)?
 *
 * @param {string|string[]} required one or many `resource:action` strings
 * @param {{ mode?: "all"|"any" }} [options] defaults to "all"
 * @returns {boolean}
 *
 * @example
 * const canAuthor = usePermission(PERMISSIONS.TEST_AUTHOR);
 * const canSeeAny = usePermission([PERMISSIONS.BATCH_READ, PERMISSIONS.COURSE_READ], { mode: "any" });
 */
export function usePermission(required, options) {
  const can = useSelector(selectCan);
  const mode = options?.mode ?? "all";

  // `required` is often an inline array literal, so a fresh reference every
  // render; key the memo on its contents instead.
  const key = Array.isArray(required) ? required.join("|") : required;

  return useMemo(() => can(required, { mode }), [can, key, mode]); // eslint-disable-line react-hooks/exhaustive-deps
}

/**
 * The predicate itself, for imperative checks (event handlers, loops over a
 * menu config) where calling a hook per item isn't possible.
 *
 * @example
 * const can = useCan();
 * const visible = menuItems.filter((item) => !item.perm || can(item.perm));
 */
export function useCan() {
  return useSelector(selectCan);
}

/** The full effective permission set, implications already applied. */
export function useEffectivePermissions() {
  return useSelector(selectEffectivePermissions);
}

/** Current actor type, or null when signed out. */
export function useActorType() {
  return useSelector(selectActorType);
}

export default usePermission;
