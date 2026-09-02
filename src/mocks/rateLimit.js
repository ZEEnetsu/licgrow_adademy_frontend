/**
 * Rate limiting — `api-contracts/00-conventions.md` §7.
 *
 * Only the tiers the app actually exercises are enforced. Emitting the headers
 * without ever enforcing them would leave the client's 429 handling (the
 * lockout countdown built in Phase 1) permanently untested.
 *
 * Tiers from the contract:
 *   auth-strict   10 / 15 min  per IP   (login, refresh)
 *   auth-register  5 / hour    per IP   (register, enrollment submit)
 *   standard     100 / min     per account
 *   autosave       2 / sec     per account
 *
 * TEMPORARY DEV SCAFFOLDING. See src/mocks/README.md.
 */

import { fail } from "./respond.js";

export const TIERS = Object.freeze({
  AUTH_STRICT: { name: "auth-strict", limit: 10, windowMs: 15 * 60 * 1000 },
  AUTH_REGISTER: { name: "auth-register", limit: 5, windowMs: 60 * 60 * 1000 },
  STANDARD: { name: "standard", limit: 100, windowMs: 60 * 1000 },
  AUTOSAVE: { name: "autosave", limit: 2, windowMs: 1000 },
});

/** `${tier}|${bucket}` → timestamps[] */
const hits = new Map();

/**
 * There is no real client IP in a browser mock, so per-IP tiers share one
 * bucket. That is stricter than production, which is the safe direction for a
 * dev tool: it surfaces 429 handling rather than hiding it.
 */
const IP_BUCKET = "local";

let enabled = true;

/** Disabled by default in test suites, which fire far more than 5 requests. */
export function __setRateLimiting(on) {
  enabled = on;
}

export function __resetRateLimits() {
  hits.clear();
}

/**
 * @param {object} tier one of TIERS
 * @param {string} [bucket] account id for per-account tiers
 * @returns {Response|null} a 429 when the window is exhausted
 */
export function checkRateLimit(tier, bucket = IP_BUCKET) {
  if (!enabled) return null;

  const key = `${tier.name}|${bucket}`;
  const now = Date.now();
  const window = (hits.get(key) ?? []).filter((at) => now - at < tier.windowMs);

  if (window.length >= tier.limit) {
    const oldest = window[0];
    const retryAfter = Math.ceil((tier.windowMs - (now - oldest)) / 1000);

    const response = fail(
      429,
      "RATE_LIMITED",
      `Too many requests. Try again in ${retryAfter}s.`,
    );
    response.headers.set("Retry-After", String(retryAfter));
    return response;
  }

  window.push(now);
  hits.set(key, window);
  return null;
}

/** Wrap a handler in a tier. */
export function rateLimited(handler, tier) {
  return async (request, params, url) => {
    const blocked = checkRateLimit(tier);
    if (blocked) return blocked;
    return handler(request, params, url);
  };
}
