/**
 * Client-side `Idempotency-Key` support — `api-contracts/00-conventions.md` §8.
 *
 * The contract's guarantee is "the action runs at most once", and it only
 * holds if a RETRY reuses the SAME key. A key generated inside the query
 * function would be regenerated on every retry, which quietly defeats the
 * whole mechanism — so keys are minted per logical operation and held here
 * until that operation succeeds.
 *
 * Required by contract on:
 *   POST /enrollments                      (07 §1)
 *   POST /me/tests/:testId/attempts        (10 §3)
 *   POST /me/attempts/:attemptId/submit    (10 §6)
 */

function uuid() {
  try {
    return crypto.randomUUID();
  } catch {
    // non-secure contexts and older runtimes
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}

/** operationId -> key, held across retries of the same logical action. */
const inFlight = new Map();

/**
 * The key for a logical operation. Stable across retries; call `release` once
 * the operation has definitively finished so a genuinely new action gets a
 * fresh key.
 *
 * @param {string} operationId something that identifies the ACTION, not the
 *   attempt — e.g. `enroll:${batchId}`, not a random per-click value.
 */
export function keyFor(operationId) {
  if (!inFlight.has(operationId)) inFlight.set(operationId, uuid());
  return inFlight.get(operationId);
}

/** Forget the key so the next invocation is treated as a new action. */
export function release(operationId) {
  inFlight.delete(operationId);
}

/**
 * Wrap a query descriptor with an idempotency key.
 *
 * @example
 * query: ({ batchId, motivation }) => withIdempotencyKey(`enroll:${batchId}`, {
 *   url: "/enrollments", method: "POST", body: { batchId, motivation },
 * })
 */
export function withIdempotencyKey(operationId, descriptor) {
  return {
    ...descriptor,
    headers: {
      ...(descriptor.headers ?? {}),
      "Idempotency-Key": keyFor(operationId),
    },
  };
}

export function __reset() {
  inFlight.clear();
}
