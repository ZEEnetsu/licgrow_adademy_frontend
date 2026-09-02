/**
 * Idempotency-Key handling — `api-contracts/00-conventions.md` §8.
 *
 * Wraps a handler so an unsafe POST runs at most once per
 * `(key, endpoint, actor)` tuple:
 *
 *   · replay with the SAME body  → the original response + Idempotency-Replayed
 *   · replay with a DIFFERENT body → 422 IDEMPOTENCY_KEY_REUSED
 *   · missing key where required → 400 IDEMPOTENCY_KEY_REQUIRED
 *
 * The contract's own caveat applies: the store is in-memory and per-instance.
 * The safe-retry semantics are the contract; the storage is an implementation
 * detail.
 *
 * TEMPORARY DEV SCAFFOLDING. See src/mocks/README.md.
 */

import { bearerFrom, verifyToken } from "./tokens.js";
import { fail } from "./respond.js";

const TTL_MS = 24 * 60 * 60 * 1000;

/** `${key}|${endpoint}|${actorId}` → { bodyHash, status, body, at } */
const store = new Map();

/** Cheap, stable hash — this only needs to detect "different body". */
function hash(text) {
  let h = 0;
  for (let i = 0; i < text.length; i += 1) {
    h = (h * 31 + text.charCodeAt(i)) | 0;
  }
  return String(h);
}

function actorOf(request) {
  const result = verifyToken(bearerFrom(request));
  return result.ok ? result.payload.sub : "anonymous";
}

function prune() {
  const cutoff = Date.now() - TTL_MS;
  for (const [key, entry] of store) {
    if (entry.at < cutoff) store.delete(key);
  }
}

/**
 * @param {Function} handler the wrapped route handler
 * @param {{ required?: boolean, endpoint: string }} options
 *   `required` mirrors the per-endpoint marking in the contracts; `endpoint`
 *   scopes the key so the same uuid on two different routes can't collide.
 */
export function idempotent(handler, { required = false, endpoint }) {
  return async (request, params, url) => {
    const key = request.headers.get("Idempotency-Key");

    if (!key) {
      if (required) {
        return fail(
          400,
          "IDEMPOTENCY_KEY_REQUIRED",
          "This endpoint requires an Idempotency-Key header.",
        );
      }
      return handler(request, params, url);
    }

    prune();

    const cacheKey = `${key}|${endpoint}|${actorOf(request)}`;
    // read a copy: the handler still needs to consume the original body
    const rawBody = await request.clone().text().catch(() => "");
    const bodyHash = hash(rawBody);

    const cached = store.get(cacheKey);
    if (cached) {
      if (cached.bodyHash !== bodyHash) {
        return fail(
          422,
          "IDEMPOTENCY_KEY_REUSED",
          "That Idempotency-Key was already used with a different body.",
        );
      }

      return new Response(cached.body, {
        status: cached.status,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Idempotency-Replayed": "true",
        },
      });
    }

    const response = await handler(request, params, url);

    // only successful state changes are worth replaying; a failure should be
    // retryable with the same key once the caller fixes the request
    if (response.status >= 200 && response.status < 300) {
      const body = await response.clone().text();
      store.set(cacheKey, {
        bodyHash,
        status: response.status,
        body,
        at: Date.now(),
      });
    }

    return response;
  };
}

export function __resetIdempotency() {
  store.clear();
}
