/**
 * Server-side authentication and authorization — the checks a real backend
 * performs regardless of what the frontend renders (conventions §10).
 *
 * The permission-implication rule is implemented INDEPENDENTLY here rather
 * than imported from the client. Same reasoning as db.js: an oracle that
 * shares code with the thing under test proves nothing.
 *
 * TEMPORARY DEV SCAFFOLDING. See src/mocks/README.md.
 */

import { db } from "./db.js";
import { bearerFrom, verifyToken } from "./tokens.js";
import { fail, forbidden, unauthenticated } from "./respond.js";

/**
 * 05-rbac.md: "A `:manage`/`:author` permission implies the corresponding
 * `:read`." Note `:view_results` implies nothing.
 */
function effectivePermissions(granted) {
  const set = new Set(granted);
  for (const permission of granted) {
    const [resource, action] = permission.split(":");
    if (action === "manage" || action === "author") set.add(`${resource}:read`);
  }
  return set;
}

/**
 * Resolve the caller from the Authorization header.
 *
 * @returns {{ account: object, permissions: string[] } | { response: Response }}
 */
export function authenticate(request) {
  const token = bearerFrom(request);
  const result = verifyToken(token);

  // 401 for missing/invalid/expired/blocklisted (conventions §1)
  if (!result.ok) return { response: unauthenticated() };

  const account = db.findAccountById(result.payload.sub);
  if (!account) return { response: unauthenticated() };

  // a valid token whose account went inactive → 403, not 401
  if (account.status !== "active") {
    return {
      response: fail(
        403,
        "ACCOUNT_SUSPENDED",
        "Your account is suspended. Contact support.",
      ),
    };
  }

  return { account, permissions: db.permissionsFor(account) };
}

/** Require a specific actor type (e.g. super-admin-only endpoints). */
export function requireActor(request, ...allowedTypes) {
  const auth = authenticate(request);
  if (auth.response) return auth;

  if (!allowedTypes.includes(auth.account.type)) {
    return { response: forbidden("Wrong actor type for this endpoint.") };
  }
  return auth;
}

/**
 * Require an RBAC permission.
 *
 * - super_admin bypasses by actor type
 * - learners are never permitted on admin endpoints
 * - staff_admin is checked against their role, with implication applied
 */
export function requirePermission(request, permission) {
  const auth = authenticate(request);
  if (auth.response) return auth;

  const { account, permissions } = auth;

  if (account.type === "super_admin") return auth;

  if (account.type !== "staff_admin") {
    return { response: forbidden("This endpoint is for staff administrators.") };
  }

  if (!effectivePermissions(permissions).has(permission)) {
    return {
      response: forbidden(`Missing required permission: ${permission}`),
    };
  }

  return auth;
}

/** Shape an account for `actor` / `/auth/me` responses (01-auth.md §1, §6). */
export function publicActor(account, { includePermissions = false } = {}) {
  const actor = {
    id: account.id,
    type: account.type,
    fullName: account.fullName,
    email: account.email,
  };

  if (account.type === "staff_admin") {
    actor.role = db.roleById(account.roleId)?.name ?? null;
  }

  if (includePermissions) {
    actor.status = account.status;
    actor.permissions = db.permissionsFor(account);
  }

  return actor;
}
