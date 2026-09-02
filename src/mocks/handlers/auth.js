/**
 * Auth handlers — `api-contracts/01-auth.md`.
 *
 * TEMPORARY DEV SCAFFOLDING. See src/mocks/README.md.
 */

import { db } from "../db.js";
import {
  blocklistToken,
  bearerFrom,
  issueAccessToken,
  issueRefreshToken,
  verifyToken,
} from "../tokens.js";
import { authenticate, publicActor } from "../guard.js";
import { fail, noContent, ok, validationError } from "../respond.js";

/**
 * Shared login for all three actors (§1–3). Identical request/response shape;
 * only the permitted actor type differs.
 */
async function login(request, expectedType) {
  const body = await request.json().catch(() => null);

  const details = [];
  if (!body?.identifier || String(body.identifier).length < 3) {
    details.push({ field: "identifier", issue: "Required, 3–255 characters" });
  }
  if (!body?.password || String(body.password).length < 8) {
    details.push({ field: "password", issue: "Required, 8–128 characters" });
  }
  if (details.length) return validationError(details);

  const account = db.findAccountByIdentifier(body.identifier);

  /*
   * 01-auth.md §1 security note: INVALID_CREDENTIALS is returned identically
   * for "unknown user" and "wrong password" — no user enumeration. The wrong
   * actor type is folded in for the same reason: probing /auth/ops/login with
   * a learner's email must not confirm the account exists.
   */
  const credentialsBad =
    !account ||
    body.password !== db.passwordFor(account.id) ||
    account.type !== expectedType;

  if (credentialsBad) {
    return fail(
      401,
      "INVALID_CREDENTIALS",
      "Invalid email/username or password.",
    );
  }

  // correct password but the account isn't active → 403, distinct from 401
  if (account.status !== "active") {
    return fail(
      403,
      "ACCOUNT_SUSPENDED",
      "Your account is suspended. Contact support.",
    );
  }

  const permissions = db.permissionsFor(account);
  const { token, expiresIn } = issueAccessToken(account, permissions);

  return ok({
    accessToken: token,
    refreshToken: issueRefreshToken(account),
    tokenType: "Bearer",
    expiresIn,
    actor: publicActor(account),
  });
}

/** §4 — refresh. Deliberately does NOT rotate: v1 doesn't (01-auth.md §4). */
async function refresh(request) {
  const body = await request.json().catch(() => null);

  if (!body?.refreshToken || typeof body.refreshToken !== "string") {
    return validationError([
      { field: "refreshToken", issue: "Required, must be a string" },
    ]);
  }

  const result = verifyToken(body.refreshToken);
  if (!result.ok || result.payload.kind !== "refresh") {
    return fail(401, "INVALID_REFRESH_TOKEN", "Refresh token is not usable.");
  }

  const account = db.findAccountById(result.payload.sub);
  if (!account || account.status !== "active") {
    return fail(401, "INVALID_REFRESH_TOKEN", "Account is no longer active.");
  }

  const { token, expiresIn } = issueAccessToken(
    account,
    db.permissionsFor(account),
  );

  // note: no `refreshToken` in this response — matches v1 exactly, which is
  // what makes the client's rotation-readiness a genuine no-op today
  return ok({ accessToken: token, tokenType: "Bearer", expiresIn });
}

/** §5 — logout. Blocklists the access token, and the refresh token if sent. */
async function logout(request) {
  const access = bearerFrom(request);
  if (!verifyToken(access).ok) {
    return fail(401, "UNAUTHENTICATED", "Missing or invalid access token.");
  }

  blocklistToken(access);

  const body = await request.json().catch(() => null);
  if (body?.refreshToken) blocklistToken(body.refreshToken);

  return noContent();
}

/** §6 — current identity, including the permission array. */
function me(request) {
  const auth = authenticate(request);
  if (auth.response) return auth.response;
  return ok(publicActor(auth.account, { includePermissions: true }));
}

export const authRoutes = [
  { method: "POST", path: "/auth/login", handler: (r) => login(r, "learner") },
  { method: "POST", path: "/auth/admin/login", handler: (r) => login(r, "staff_admin") },
  { method: "POST", path: "/auth/ops/login", handler: (r) => login(r, "super_admin") },
  { method: "POST", path: "/auth/refresh", handler: refresh },
  { method: "POST", path: "/auth/logout", handler: logout },
  { method: "GET", path: "/auth/me", handler: me },
];
