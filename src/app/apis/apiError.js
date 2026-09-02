/**
 * One place that understands the platform error envelope (conventions §4/§11).
 *
 * Every non-2xx response looks like:
 *   { "error": { "code", "message", "details"?, "requestId"? } }
 *
 * `code` is the stable machine-readable string — branch on it, NEVER on
 * `message` (conventions §4).
 */

/** Global codes from conventions §11 plus the auth/rbac module codes. */
export const ERROR_CODES = Object.freeze({
  // global
  VALIDATION_ERROR: "VALIDATION_ERROR",
  MALFORMED_JSON: "MALFORMED_JSON",
  IDEMPOTENCY_KEY_REQUIRED: "IDEMPOTENCY_KEY_REQUIRED",
  UNAUTHENTICATED: "UNAUTHENTICATED",
  FORBIDDEN: "FORBIDDEN",
  ACCOUNT_SUSPENDED: "ACCOUNT_SUSPENDED",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  PAYLOAD_TOO_LARGE: "PAYLOAD_TOO_LARGE",
  UNPROCESSABLE: "UNPROCESSABLE",
  IDEMPOTENCY_KEY_REUSED: "IDEMPOTENCY_KEY_REUSED",
  RATE_LIMITED: "RATE_LIMITED",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  // 01-auth.md
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  INVALID_REFRESH_TOKEN: "INVALID_REFRESH_TOKEN",
  // 05-rbac.md
  ROLE_NAME_TAKEN: "ROLE_NAME_TAKEN",
  UNKNOWN_PERMISSION: "UNKNOWN_PERMISSION",
  SYSTEM_ROLE_IMMUTABLE: "SYSTEM_ROLE_IMMUTABLE",
  // client-side only (no HTTP response reached us)
  NETWORK_ERROR: "NETWORK_ERROR",
});

/**
 * Codes the module docs explicitly mark as safe to show end users.
 *
 * This matters for security, not just polish:
 * - INVALID_CREDENTIALS is deliberately identical for "unknown user" and
 *   "wrong password" (01-auth.md §1) — surfacing it verbatim is safe and
 *   avoids user enumeration.
 * - INVALID_REFRESH_TOKEN is explicitly marked NOT user-safe — it should
 *   trigger a silent re-login, never a visible message.
 */
const USER_SAFE_CODES = new Set([
  ERROR_CODES.VALIDATION_ERROR,
  ERROR_CODES.INVALID_CREDENTIALS,
  ERROR_CODES.ACCOUNT_SUSPENDED,
  ERROR_CODES.RATE_LIMITED,
  ERROR_CODES.ROLE_NAME_TAKEN,
  ERROR_CODES.UNKNOWN_PERMISSION,
  ERROR_CODES.SYSTEM_ROLE_IMMUTABLE,
  ERROR_CODES.NETWORK_ERROR,
]);

/** Copy for the codes we surface. Keys not listed fall back to GENERIC_MESSAGE. */
const USER_MESSAGES = Object.freeze({
  [ERROR_CODES.INVALID_CREDENTIALS]: "Invalid email/username or password.",
  [ERROR_CODES.ACCOUNT_SUSPENDED]:
    "Your account is suspended. Contact support.",
  [ERROR_CODES.RATE_LIMITED]: "Too many attempts. Please try again shortly.",
  [ERROR_CODES.VALIDATION_ERROR]: "Please check the highlighted fields.",
  [ERROR_CODES.ROLE_NAME_TAKEN]: "A role with that name already exists.",
  [ERROR_CODES.UNKNOWN_PERMISSION]:
    "One or more permissions are not recognised.",
  [ERROR_CODES.SYSTEM_ROLE_IMMUTABLE]:
    "Built-in roles can't be edited. Create a custom role instead.",
  [ERROR_CODES.NETWORK_ERROR]:
    "Can't reach the server. Check your connection and try again.",
});

export const GENERIC_MESSAGE = "Something went wrong. Please try again.";

/**
 * Normalize anything RTK Query hands back into a flat, predictable shape.
 *
 * Handles the three fetchBaseQuery failure modes (`FETCH_ERROR`,
 * `PARSING_ERROR`, `TIMEOUT_ERROR`) as well as real HTTP errors carrying the
 * contract envelope.
 *
 * @returns {{
 *   status: number|string|null,
 *   code: string,
 *   message: string,
 *   details: Array<{field: string, issue: string}>,
 *   requestId: string|null,
 *   userSafe: boolean,
 *   retryAfter: number|null
 * }}
 */
export function normalizeApiError(error) {
  if (!error) {
    return build(null, ERROR_CODES.INTERNAL_ERROR, GENERIC_MESSAGE);
  }

  // transport-level failures — no HTTP response at all
  if (
    error.status === "FETCH_ERROR" ||
    error.status === "TIMEOUT_ERROR" ||
    error.status === "PARSING_ERROR"
  ) {
    return build(
      error.status,
      ERROR_CODES.NETWORK_ERROR,
      error.error ?? "Network request failed",
    );
  }

  const envelope = error.data?.error ?? {};
  const code = envelope.code ?? fallbackCodeForStatus(error.status);

  return build(
    error.status ?? null,
    code,
    envelope.message ?? GENERIC_MESSAGE,
    Array.isArray(envelope.details) ? envelope.details : [],
    envelope.requestId ?? null,
    readRetryAfter(error),
  );
}

function build(
  status,
  code,
  message,
  details = [],
  requestId = null,
  retryAfter = null,
) {
  return {
    status,
    code,
    message,
    details,
    requestId,
    retryAfter,
    userSafe: USER_SAFE_CODES.has(code),
  };
}

/** Some framework-level 401s ship without the envelope (conventions §4). */
function fallbackCodeForStatus(status) {
  switch (status) {
    case 400:
      return ERROR_CODES.VALIDATION_ERROR;
    case 401:
      return ERROR_CODES.UNAUTHENTICATED;
    case 403:
      return ERROR_CODES.FORBIDDEN;
    case 404:
      return ERROR_CODES.NOT_FOUND;
    case 409:
      return ERROR_CODES.CONFLICT;
    case 413:
      return ERROR_CODES.PAYLOAD_TOO_LARGE;
    case 422:
      return ERROR_CODES.UNPROCESSABLE;
    case 429:
      return ERROR_CODES.RATE_LIMITED;
    default:
      return ERROR_CODES.INTERNAL_ERROR;
  }
}

/**
 * Seconds from the `Retry-After` header on a 429 (conventions §7).
 * RTK Query only exposes headers when the endpoint opts into a raw response,
 * so we also accept it from the error body as a fallback.
 */
function readRetryAfter(error) {
  const fromBody = error.data?.error?.retryAfter;
  if (Number.isFinite(fromBody)) return fromBody;

  const raw = error.meta?.response?.headers?.get?.("Retry-After");
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * The string to actually render. Never leaks a developer-facing `message` for
 * a code the contracts didn't mark user-safe.
 *
 * @param {object} error raw RTK Query error, or an already-normalized one
 * @param {string} [fallback]
 */
export function getUserMessage(error, fallback = GENERIC_MESSAGE) {
  const normalized = error?.userSafe === undefined
    ? normalizeApiError(error)
    : error;

  if (!normalized.userSafe) return fallback;
  return USER_MESSAGES[normalized.code] ?? normalized.message ?? fallback;
}

/** Convenience predicate used by the base query and the auth slice. */
export function isCode(error, code) {
  return normalizeApiError(error).code === code;
}

/**
 * Response handler for endpoints that return `204 No Content` on success.
 *
 * `responseHandler: "text"` looks like the obvious choice, but RTK Query
 * applies it to ERROR responses too — so a 404 or a 401 would arrive as a raw
 * JSON string, `normalizeApiError` would find no `error.code`, and every
 * failure on a 204-shaped endpoint would collapse into the generic status
 * fallback. This parses JSON whenever there is a body, and returns null when
 * there genuinely isn't one.
 */
export async function noContentResponseHandler(response) {
  if (response.status === 204) return null;

  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
