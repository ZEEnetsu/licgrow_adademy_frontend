/**
 * RBAC vocabulary — mirrors `api-contracts/05-rbac.md`.
 *
 * IMPORTANT: everything here is for building UI affordances (hiding buttons,
 * gating routes). It is NOT a security boundary. Per conventions §10, the
 * server re-checks every permission and ownership invariant on its own —
 * "the frontend hiding a button is never the only guard".
 */

/** Actor types, matching the JWT `type` claim (conventions §1). */
export const ACTOR = Object.freeze({
  LEARNER: "learner",
  STAFF_ADMIN: "staff_admin",
  SUPER_ADMIN: "super_admin",
});

/**
 * The master permission catalog (05-rbac.md). Every `resource:action` string
 * used anywhere in the contracts is defined here.
 */
export const PERMISSIONS = Object.freeze({
  BATCH_READ: "batch:read",
  BATCH_MANAGE: "batch:manage",
  ENROLLMENT_REVIEW: "enrollment:review",
  COURSE_READ: "course:read",
  COURSE_AUTHOR: "course:author",
  TEST_READ: "test:read",
  TEST_AUTHOR: "test:author",
  TEST_VIEW_RESULTS: "test:view_results",
  ANNOUNCEMENT_READ: "announcement:read",
  ANNOUNCEMENT_MANAGE: "announcement:manage",
  LEARNER_READ: "learner:read",
  LEARNER_SUSPEND: "learner:suspend",
  ANALYTICS_VIEW: "analytics:view",
});

/** Flat list of every catalog permission — handy for validation and pickers. */
export const PERMISSION_LIST = Object.freeze(Object.values(PERMISSIONS));

const PERMISSION_SET = new Set(PERMISSION_LIST);

/** Seeded system roles (05-rbac.md). These cannot be edited server-side. */
export const SYSTEM_ROLES = Object.freeze({
  MENTOR: "mentor",
  CO_MENTOR: "co_mentor",
  VIEWER: "viewer",
});

/**
 * Mirror of the seeded role → permission table.
 *
 * NOT AUTHORITATIVE. The server owns role definitions and they are editable by
 * super-admins (`PUT /admin/roles/:roleId/permissions`). Use this only for
 * optimistic UI, fixtures, and tests — read the real thing from
 * `useGetRolesQuery()` in `rbac.api.js`.
 */
export const DEFAULT_ROLE_PERMISSIONS = Object.freeze({
  [SYSTEM_ROLES.MENTOR]: Object.freeze([...PERMISSION_LIST]),
  [SYSTEM_ROLES.CO_MENTOR]: Object.freeze([
    PERMISSIONS.BATCH_READ,
    PERMISSIONS.ENROLLMENT_REVIEW,
    PERMISSIONS.COURSE_AUTHOR,
    PERMISSIONS.TEST_AUTHOR,
    PERMISSIONS.TEST_VIEW_RESULTS,
    PERMISSIONS.ANNOUNCEMENT_MANAGE,
    PERMISSIONS.LEARNER_READ,
    PERMISSIONS.ANALYTICS_VIEW,
  ]),
  [SYSTEM_ROLES.VIEWER]: Object.freeze([
    PERMISSIONS.BATCH_READ,
    PERMISSIONS.COURSE_READ,
    PERMISSIONS.TEST_READ,
    PERMISSIONS.ANNOUNCEMENT_READ,
    PERMISSIONS.LEARNER_READ,
    PERMISSIONS.TEST_VIEW_RESULTS,
    PERMISSIONS.ANALYTICS_VIEW,
  ]),
});

/**
 * Actions that implicitly grant the matching `:read` on the same resource.
 *
 * 05-rbac.md: "A `:manage`/`:author` permission **implies** the corresponding
 * `:read`." Note this is deliberately narrow — `test:view_results` is neither
 * `manage` nor `author`, so it does NOT imply `test:read`.
 */
const IMPLIES_READ = new Set(["manage", "author"]);

/**
 * Expand a granted permission list into its full effective set, applying the
 * implication rule above.
 *
 * @param {string[]} granted raw permission strings from the token / `/auth/me`
 * @returns {Set<string>} effective permissions
 *
 * @example
 * expandPermissions(["test:author"]) // Set { "test:author", "test:read" }
 */
export function expandPermissions(granted = []) {
  const effective = new Set(granted);

  for (const permission of granted) {
    const [resource, action] = String(permission).split(":");
    if (resource && IMPLIES_READ.has(action)) {
      effective.add(`${resource}:read`);
    }
  }

  return effective;
}

/**
 * The authoritative client-side permission check.
 *
 * Encodes the actor semantics from 05-rbac.md:
 * - `super_admin` bypasses permission checks entirely (by actor type).
 * - `learner` has no permissions, ever.
 * - only `staff_admin` is governed by RBAC.
 *
 * @param {{ actorType: string, permissions?: string[] }} identity
 * @param {string|string[]} required one or many `resource:action` strings
 * @param {{ mode?: "all"|"any" }} [options] how to combine multiple requirements
 * @returns {boolean}
 */
export function checkPermission(identity, required, options = {}) {
  const { actorType, permissions = [] } = identity ?? {};
  const { mode = "all" } = options;

  if (actorType === ACTOR.SUPER_ADMIN) return true;
  if (actorType !== ACTOR.STAFF_ADMIN) return false;

  const list = Array.isArray(required) ? required : [required];
  const wanted = list.filter(Boolean);
  if (wanted.length === 0) return true;

  const effective = expandPermissions(permissions);

  return mode === "any"
    ? wanted.some((permission) => effective.has(permission))
    : wanted.every((permission) => effective.has(permission));
}

/**
 * Same check, but against an already-expanded set — avoids re-expanding on
 * every call. Used by the memoized selectors in `auth.selectors.js`.
 *
 * @param {string} actorType
 * @param {Set<string>} effective result of `expandPermissions`
 * @param {string|string[]} required
 * @param {{ mode?: "all"|"any" }} [options]
 */
export function checkExpanded(actorType, effective, required, options = {}) {
  const { mode = "all" } = options;

  if (actorType === ACTOR.SUPER_ADMIN) return true;
  if (actorType !== ACTOR.STAFF_ADMIN) return false;

  const list = Array.isArray(required) ? required : [required];
  const wanted = list.filter(Boolean);
  if (wanted.length === 0) return true;

  return mode === "any"
    ? wanted.some((permission) => effective.has(permission))
    : wanted.every((permission) => effective.has(permission));
}

/** Is this string part of the documented catalog? */
export function isKnownPermission(permission) {
  return PERMISSION_SET.has(permission);
}
