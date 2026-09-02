/**
 * Response envelope helpers — `api-contracts/00-conventions.md` §4.
 *
 * TEMPORARY DEV SCAFFOLDING. See src/mocks/README.md.
 */

function requestId() {
  try {
    return crypto.randomUUID().slice(0, 8);
  } catch {
    return Math.random().toString(16).slice(2, 10);
  }
}

const JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8" };

/**
 * Rate-limit headers ride on every response (conventions §7). The mock never
 * actually limits, but emitting the headers keeps the client honest.
 */
function baseHeaders(extra = {}) {
  return {
    ...JSON_HEADERS,
    "RateLimit-Limit": "100",
    "RateLimit-Remaining": "99",
    "RateLimit-Reset": "60",
    ...extra,
  };
}

/** `{ data }`, optionally with a `meta` block. */
export function ok(data, meta) {
  const body = meta === undefined ? { data } : { data, meta };
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: baseHeaders(),
  });
}

export function created(data) {
  return new Response(JSON.stringify({ data }), {
    status: 201,
    headers: baseHeaders(),
  });
}

/** 204 responses have no body (conventions §4). */
export function noContent() {
  return new Response(null, { status: 204, headers: baseHeaders() });
}

/**
 * `{ error: { code, message, details?, requestId } }`
 * @param {number} status
 * @param {string} code stable machine-readable string — clients branch on this
 * @param {string} message developer-facing
 * @param {Array<{field: string, issue: string}>} [details] for 400s and some 422s
 */
export function fail(status, code, message, details) {
  const error = { code, message, requestId: requestId() };
  if (details?.length) error.details = details;

  return new Response(JSON.stringify({ error }), {
    status,
    headers: baseHeaders(
      status === 429 ? { "Retry-After": "900" } : undefined,
    ),
  });
}

// ── common failures ────────────────────────────────────────────────────────

export const unauthenticated = () =>
  fail(401, "UNAUTHENTICATED", "Missing, invalid or expired access token.");

export const forbidden = (message = "You don't have permission to do that.") =>
  fail(403, "FORBIDDEN", message);

export const notFound = (what = "Resource") =>
  fail(404, "NOT_FOUND", `${what} not found.`);

export const validationError = (details, message = "Request failed validation.") =>
  fail(400, "VALIDATION_ERROR", message, details);

export const unprocessable = (code, message, details) =>
  fail(422, code, message, details);

// ── pagination ─────────────────────────────────────────────────────────────

/**
 * Offset pagination per conventions §6: `page` (1-based), `limit` (1–100,
 * clamped). An out-of-range page returns an empty array with 200, not a 404.
 */
export function paginate(items, searchParams) {
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const rawLimit = Number(searchParams.get("limit")) || 20;
  const limit = Math.min(100, Math.max(1, rawLimit));

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;

  return {
    slice: items.slice(start, start + limit),
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}
