/**
 * Roles & permissions handlers — `api-contracts/05-rbac.md`.
 *
 * TEMPORARY DEV SCAFFOLDING. See src/mocks/README.md.
 */

import { db, nextId, PERMISSION_CATALOG } from "../db.js";
import { authenticate, requireActor } from "../guard.js";
import { fail, created, notFound, ok, validationError } from "../respond.js";

const CATALOG_NAMES = new Set(PERMISSION_CATALOG.map((p) => p.name));

/** Reads are open to any staff-admin or super-admin (§1–3). */
function requireAdminReader(request) {
  const auth = authenticate(request);
  if (auth.response) return auth;

  if (!["staff_admin", "super_admin"].includes(auth.account.type)) {
    return { response: fail(403, "FORBIDDEN", "Administrators only.") };
  }
  return auth;
}

/** §1 — the master catalog. */
function listPermissions(request) {
  const auth = requireAdminReader(request);
  if (auth.response) return auth.response;
  return ok(PERMISSION_CATALOG);
}

/** §2 — roles with their permission sets. */
function listRoles(request) {
  const auth = requireAdminReader(request);
  if (auth.response) return auth.response;
  return ok(db.roles);
}

/** §3 — one role. */
function getRole(request, { roleId }) {
  const auth = requireAdminReader(request);
  if (auth.response) return auth.response;

  const role = db.roleById(roleId);
  return role ? ok(role) : notFound("Role");
}

/** §4 — create a custom role. Super-admin only. */
async function createRole(request) {
  const auth = requireActor(request, "super_admin");
  if (auth.response) return auth.response;

  const body = await request.json().catch(() => null);
  const details = [];

  if (!body?.name || !/^[a-z][a-z0-9_]+$/.test(body.name) || body.name.length > 50) {
    details.push({
      field: "name",
      issue: "3–50 chars, must match ^[a-z][a-z0-9_]+$",
    });
  }
  if (!Array.isArray(body?.permissions) || body.permissions.length === 0) {
    details.push({ field: "permissions", issue: "Required, non-empty array" });
  }
  if (details.length) return validationError(details);

  if (db.roles.some((r) => r.name === body.name)) {
    return fail(409, "ROLE_NAME_TAKEN", "A role with that name exists.");
  }

  const unknown = body.permissions.filter((p) => !CATALOG_NAMES.has(p));
  if (unknown.length) {
    return fail(
      422,
      "UNKNOWN_PERMISSION",
      "One or more permissions are not in the catalog.",
      unknown.map((p) => ({ field: "permissions", issue: `Unknown: ${p}` })),
    );
  }

  const role = {
    id: nextId("role"),
    name: body.name,
    description: body.description ?? null,
    permissions: [...body.permissions],
    isSystem: false,
  };
  db.roles.push(role);

  return created(role);
}

/** §5 — replace a role's permissions wholesale. Super-admin only. */
async function replacePermissions(request, { roleId }) {
  const auth = requireActor(request, "super_admin");
  if (auth.response) return auth.response;

  const role = db.roleById(roleId);
  if (!role) return notFound("Role");

  // seeded roles are immutable
  if (role.isSystem) {
    return fail(
      422,
      "SYSTEM_ROLE_IMMUTABLE",
      "Built-in roles can't be edited. Create a custom role instead.",
    );
  }

  const body = await request.json().catch(() => null);
  if (!Array.isArray(body?.permissions)) {
    return validationError([
      { field: "permissions", issue: "Required, must be an array" },
    ]);
  }

  const unknown = body.permissions.filter((p) => !CATALOG_NAMES.has(p));
  if (unknown.length) {
    return fail(
      422,
      "UNKNOWN_PERMISSION",
      "One or more permissions are not in the catalog.",
      unknown.map((p) => ({ field: "permissions", issue: `Unknown: ${p}` })),
    );
  }

  /*
   * 05-rbac.md closing note: this affects staff-admins only on their NEXT
   * login, because permissions are embedded in the access token at login.
   * The mock reflects that — existing tokens keep their old set.
   */
  role.permissions = [...body.permissions];

  return ok(role);
}

export const rbacRoutes = [
  { method: "GET", path: "/admin/permissions", handler: listPermissions },
  { method: "GET", path: "/admin/roles", handler: listRoles },
  { method: "GET", path: "/admin/roles/:roleId", handler: getRole },
  { method: "POST", path: "/admin/roles", handler: createRole },
  { method: "PUT", path: "/admin/roles/:roleId/permissions", handler: replacePermissions },
];
