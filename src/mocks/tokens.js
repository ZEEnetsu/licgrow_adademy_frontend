/**
 * Token mechanics — `api-contracts/00-conventions.md` §1, `01-auth.md`.
 *
 * These are NOT real JWTs: there is no signing, because nothing here is a
 * security boundary. They carry the same three-segment shape and the same
 * claims, which is all the client can legitimately depend on (conventions §1:
 * "clients must not depend on decoding it").
 *
 * Models faithfully:
 *   - 15-minute access tokens, 7-day refresh tokens
 *   - real expiry, so the client's refresh-retry path actually fires
 *   - a blocklist, so logout genuinely invalidates (01-auth.md §5)
 *   - NO refresh-token rotation — v1 doesn't rotate (01-auth.md §4)
 *
 * TEMPORARY DEV SCAFFOLDING. See src/mocks/README.md.
 */

const ACCESS_TTL_SECONDS = 15 * 60;
const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60;

/** Shortenable in tests to force an expiry without waiting 15 minutes. */
let accessTtl = ACCESS_TTL_SECONDS;
export function __setAccessTtl(seconds) {
  accessTtl = seconds;
}
export function __resetAccessTtl() {
  accessTtl = ACCESS_TTL_SECONDS;
}

/** Tokens invalidated by logout, held until they'd expire anyway. */
const blocklist = new Set();

const b64url = (value) =>
  btoa(unescape(encodeURIComponent(JSON.stringify(value))))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const fromB64url = (segment) =>
  JSON.parse(
    decodeURIComponent(
      escape(atob(segment.replace(/-/g, "+").replace(/_/g, "/"))),
    ),
  );

function sign(payload) {
  const header = b64url({ alg: "none", typ: "JWT" });
  return `${header}.${b64url(payload)}.mock`;
}

export function issueAccessToken(account, permissions = []) {
  const now = Math.floor(Date.now() / 1000);
  return {
    token: sign({
      sub: account.id,
      type: account.type,
      permissions,
      iat: now,
      exp: now + accessTtl,
    }),
    expiresIn: accessTtl,
  };
}

export function issueRefreshToken(account) {
  const now = Math.floor(Date.now() / 1000);
  return sign({
    sub: account.id,
    type: account.type,
    kind: "refresh",
    iat: now,
    exp: now + REFRESH_TTL_SECONDS,
  });
}

/**
 * @returns {{ ok: true, payload: object } | { ok: false, reason: string }}
 */
export function verifyToken(token) {
  if (!token) return { ok: false, reason: "missing" };
  if (blocklist.has(token)) return { ok: false, reason: "blocklisted" };

  const segments = String(token).split(".");
  if (segments.length !== 3) return { ok: false, reason: "malformed" };

  let payload;
  try {
    payload = fromB64url(segments[1]);
  } catch {
    return { ok: false, reason: "malformed" };
  }

  if (payload.exp * 1000 < Date.now()) return { ok: false, reason: "expired" };

  return { ok: true, payload };
}

/** Logout (01-auth.md §5) — idempotent by nature of a Set. */
export function blocklistToken(token) {
  if (token) blocklist.add(token);
}

export function bearerFrom(request) {
  const header = request.headers.get("Authorization") ?? "";
  return header.startsWith("Bearer ") ? header.slice(7) : null;
}

export function __resetTokens() {
  blocklist.clear();
  __resetAccessTtl();
}
