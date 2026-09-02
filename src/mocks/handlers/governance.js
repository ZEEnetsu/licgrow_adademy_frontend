/**
 * Administrator accounts — `03-staff-admin.md` and `04-super-admin.md`.
 *
 * SUPER-ADMIN ONLY, every endpoint. 03 is explicit: "Staff-admins cannot
 * create or modify each other." That is checked by actor type, not by
 * permission, so no RBAC role can grant it.
 *
 * Admin passwords are held to a stricter rule than learners' — 12–128 with a
 * symbol (03 §1, 04 §2) versus 8–128 letters+digits (02 §1). The shared rule
 * lives in passwords.js so the self-service change-password endpoint applies
 * the right one per actor.
 *
 * TEMPORARY DEV SCAFFOLDING. See src/mocks/README.md.
 */

import { db, nextId } from "../db.js";
import { requireActor } from "../guard.js";
import { adminPasswordIssue } from "../passwords.js";
import {
  created,
  fail,
  notFound,
  ok,
  paginate,
  validationError,
} from "../respond.js";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const USERNAME = /^[a-z0-9_]+$/;

const staffView = (account) => {
  const role = db.roleById(account.roleId);
  return {
    id: account.id,
    fullName: account.fullName,
    email: account.email,
    username: account.username,
    role: role ? { id: role.id, name: role.name } : null,
    isActive: account.status === "active",
    createdBy: account.createdBy ?? null,
    createdAt: account.createdAt ?? "2026-06-01T09:00:00Z",
  };
};

const superView = (account) => ({
  id: account.id,
  fullName: account.fullName,
  email: account.email,
  username: account.username,
  isActive: account.status === "active",
  createdAt: account.createdAt ?? "2026-06-01T09:00:00Z",
});

/** Shared account-shape validation for both admin kinds. */
function validateAdminBody(body, { requireRole }) {
  const details = [];

  if (!body?.fullName || body.fullName.length < 2 || body.fullName.length > 120) {
    details.push({ field: "fullName", issue: "Required, 2-120 characters" });
  }
  if (!EMAIL.test(body?.email ?? "") || body.email.length > 255) {
    details.push({ field: "email", issue: "Required, a valid email address" });
  }
  if (
    !body?.username ||
    !USERNAME.test(body.username) ||
    body.username.length < 3 ||
    body.username.length > 30
  ) {
    details.push({
      field: "username",
      issue: "Required, 3-30 characters: lowercase letters, digits, underscore",
    });
  }

  const passwordIssue = adminPasswordIssue(body?.password);
  if (passwordIssue) details.push({ field: "password", issue: passwordIssue });

  if (requireRole && !body?.roleId) {
    details.push({ field: "roleId", issue: "Required" });
  }

  return details;
}

/** Uniqueness is checked across ALL accounts — identities cannot collide. */
function uniquenessConflict(body) {
  const emailTaken = db.accounts.some(
    (a) => a.email.toLowerCase() === body.email.toLowerCase(),
  );
  if (emailTaken) {
    return fail(409, "EMAIL_TAKEN", "That email is already registered.");
  }

  const usernameTaken = db.accounts.some(
    (a) => a.username?.toLowerCase() === body.username.toLowerCase(),
  );
  if (usernameTaken) {
    return fail(409, "USERNAME_TAKEN", "That username is already taken.");
  }
  return null;
}

// ── 03 §1–6 staff-admins ───────────────────────────────────────────────────

async function createStaffAdmin(request) {
  const auth = requireActor(request, "super_admin");
  if (auth.response) return auth.response;

  const body = await request.json().catch(() => null);
  if (!body) return fail(400, "MALFORMED_JSON", "Body is not valid JSON.");

  const details = validateAdminBody(body, { requireRole: true });
  if (details.length) return validationError(details);

  const conflict = uniquenessConflict(body);
  if (conflict) return conflict;

  if (!db.roleById(body.roleId)) {
    return fail(422, "ROLE_NOT_FOUND", "That role does not exist.");
  }

  const account = {
    id: nextId("ad"),
    type: "staff_admin",
    email: body.email,
    username: body.username,
    fullName: body.fullName,
    status: "active",
    roleId: body.roleId,
    createdBy: auth.account.id,
    createdAt: new Date().toISOString(),
  };
  db.accounts.push(account);
  db.setPassword(account.id, body.password);

  return created(staffView(account));
}

function listStaffAdmins(request, _params, url) {
  const auth = requireActor(request, "super_admin");
  if (auth.response) return auth.response;

  const { searchParams } = url;
  let rows = db.accounts.filter((a) => a.type === "staff_admin");

  const isActive = searchParams.get("isActive");
  const roleId = searchParams.get("roleId");
  const q = searchParams.get("q");

  if (isActive !== null) {
    rows = rows.filter((a) => String(a.status === "active") === isActive);
  }
  if (roleId) rows = rows.filter((a) => a.roleId === roleId);
  if (q) {
    const needle = q.toLowerCase();
    rows = rows.filter(
      (a) =>
        a.fullName.toLowerCase().includes(needle) ||
        a.email.toLowerCase().includes(needle),
    );
  }

  const { slice, meta } = paginate(rows, searchParams);
  return ok(slice.map(staffView), meta);
}

function getStaffAdmin(request, { adminId }) {
  const auth = requireActor(request, "super_admin");
  if (auth.response) return auth.response;

  const account = db.accounts.find(
    (a) => a.id === adminId && a.type === "staff_admin",
  );
  return account ? ok(staffView(account)) : notFound("Staff admin");
}

/**
 * §4 — change role. Note the contract's warning: this takes effect on the
 * admin's NEXT LOGIN, because permissions are embedded in the token at login.
 */
async function changeStaffAdminRole(request, { adminId }) {
  const auth = requireActor(request, "super_admin");
  if (auth.response) return auth.response;

  const account = db.accounts.find(
    (a) => a.id === adminId && a.type === "staff_admin",
  );
  if (!account) return notFound("Staff admin");

  const body = await request.json().catch(() => null);
  if (!body?.roleId) {
    return validationError([{ field: "roleId", issue: "Required" }]);
  }
  if (!db.roleById(body.roleId)) {
    return fail(422, "ROLE_NOT_FOUND", "That role does not exist.");
  }

  account.roleId = body.roleId;
  return ok(staffView(account));
}

/** §5/§6 — deactivate / reactivate. Idempotent no-ops when already there. */
const setStaffStatus = (target) =>
  function handler(request, { adminId }) {
    const auth = requireActor(request, "super_admin");
    if (auth.response) return auth.response;

    const account = db.accounts.find(
      (a) => a.id === adminId && a.type === "staff_admin",
    );
    if (!account) return notFound("Staff admin");

    account.status = target;
    return ok({ id: account.id, isActive: account.status === "active" });
  };

// ── 04 §1–3 super-admins ───────────────────────────────────────────────────

function listSuperAdmins(request, _params, url) {
  const auth = requireActor(request, "super_admin");
  if (auth.response) return auth.response;

  const rows = db.accounts.filter((a) => a.type === "super_admin");
  const { slice, meta } = paginate(rows, url.searchParams);
  return ok(slice.map(superView), meta);
}

async function createSuperAdmin(request) {
  const auth = requireActor(request, "super_admin");
  if (auth.response) return auth.response;

  const body = await request.json().catch(() => null);
  if (!body) return fail(400, "MALFORMED_JSON", "Body is not valid JSON.");

  const details = validateAdminBody(body, { requireRole: false });
  if (details.length) return validationError(details);

  const conflict = uniquenessConflict(body);
  if (conflict) return conflict;

  const account = {
    id: nextId("sa"),
    type: "super_admin",
    email: body.email,
    username: body.username,
    fullName: body.fullName,
    status: "active",
    roleId: null,
    createdAt: new Date().toISOString(),
  };
  db.accounts.push(account);
  db.setPassword(account.id, body.password);

  // the password is never echoed back (conventions §10)
  return created(superView(account));
}

/**
 * §3 — deactivate. Two guards that exist to stop the platform locking itself
 * out, and there is deliberately NO reactivate endpoint: 04 says reactivation
 * is an audited CLI action, so a compromised super-admin cannot silently
 * restore another.
 */
function deactivateSuperAdmin(request, { id }) {
  const auth = requireActor(request, "super_admin");
  if (auth.response) return auth.response;

  const account = db.accounts.find(
    (a) => a.id === id && a.type === "super_admin",
  );
  if (!account) return notFound("Super admin");

  if (account.id === auth.account.id) {
    return fail(
      422,
      "CANNOT_DEACTIVATE_SELF",
      "You cannot deactivate your own account.",
    );
  }

  // already inactive: idempotent no-op, and must not trip the last-admin guard
  if (account.status !== "active") {
    return ok({ id: account.id, isActive: false });
  }

  const activeCount = db.accounts.filter(
    (a) => a.type === "super_admin" && a.status === "active",
  ).length;
  if (activeCount <= 1) {
    return fail(
      422,
      "LAST_SUPER_ADMIN",
      "At least one active super-admin is required.",
    );
  }

  account.status = "inactive";
  return ok({ id: account.id, isActive: false });
}

export const governanceRoutes = [
  { method: "GET", path: "/admin/staff-admins", handler: listStaffAdmins },
  { method: "POST", path: "/admin/staff-admins", handler: createStaffAdmin },
  { method: "GET", path: "/admin/staff-admins/:adminId", handler: getStaffAdmin },
  {
    method: "PUT",
    path: "/admin/staff-admins/:adminId/role",
    handler: changeStaffAdminRole,
  },
  {
    method: "POST",
    path: "/admin/staff-admins/:adminId/deactivate",
    handler: setStaffStatus("inactive"),
  },
  {
    method: "POST",
    path: "/admin/staff-admins/:adminId/reactivate",
    handler: setStaffStatus("active"),
  },

  { method: "GET", path: "/admin/super-admins", handler: listSuperAdmins },
  { method: "POST", path: "/admin/super-admins", handler: createSuperAdmin },
  {
    method: "POST",
    path: "/admin/super-admins/:id/deactivate",
    handler: deactivateSuperAdmin,
  },
];
