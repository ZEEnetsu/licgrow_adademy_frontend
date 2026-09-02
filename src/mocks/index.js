/**
 * Dev-only mock API — a temporary stand-in for the real backend.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * THIS IS SCAFFOLDING. The real API already exists; this exists only while
 * it's unreachable. See src/mocks/README.md for how to remove it.
 *
 * Design constraints it holds to:
 *   - NOTHING in src/app, src/pages or src/components imports from here.
 *     The dependency runs one way only, so deleting this folder is safe.
 *   - OFF unless VITE_USE_MOCKS === "true".
 *   - Loaded via dynamic import from main.jsx, so production builds
 *     tree-shake it out entirely.
 * ─────────────────────────────────────────────────────────────────────────
 */

import { createRouter } from "./router.js";
import { authRoutes } from "./handlers/auth.js";
import { rbacRoutes } from "./handlers/rbac.js";
import { testRoutes } from "./handlers/tests.js";
import { courseRoutes } from "./handlers/courses.js";
import { batchRoutes } from "./handlers/batches.js";
import { learnerRoutes } from "./handlers/learner.js";
import { enrollmentRoutes } from "./handlers/enrollment.js";
import { submissionRoutes } from "./handlers/submission.js";
import { announcementRoutes } from "./handlers/announcement.js";
import { notificationRoutes } from "./handlers/notification.js";
import { analyticsRoutes } from "./handlers/analytics.js";
import { governanceRoutes } from "./handlers/governance.js";
import { db, SEED_PASSWORD } from "./db.js";
import { __resetTokens } from "./tokens.js";
import { __resetIdempotency } from "./idempotency.js";
import { __resetRateLimits, __setRateLimiting } from "./rateLimit.js";

const API_PREFIX = "/api/v1";

/** Small delay so loading states are actually visible during development. */
const LATENCY_MS = 180;

const match = createRouter([
  ...authRoutes,
  ...rbacRoutes,
  ...testRoutes,
  ...courseRoutes,
  ...batchRoutes,
  ...learnerRoutes,
  ...enrollmentRoutes,
  ...submissionRoutes,
  ...announcementRoutes,
  ...notificationRoutes,
  ...analyticsRoutes,
  ...governanceRoutes,
]);

let originalFetch = null;

/**
 * Normalize the two shapes fetch is called with: `fetch(Request)` (what RTK
 * Query does) and `fetch(url, init)` (what the refresh path in baseQuery does).
 */
function toRequest(input, init) {
  if (input instanceof Request) return input;
  const url = String(input);
  const absolute = url.startsWith("http")
    ? url
    : `${globalThis.location?.origin ?? "http://localhost"}${url}`;
  return new Request(absolute, init);
}

export async function start({ latency = LATENCY_MS, quiet = false } = {}) {
  if (originalFetch) return; // already installed

  originalFetch = globalThis.fetch.bind(globalThis);

  globalThis.fetch = async (input, init) => {
    const request = toRequest(input, init);
    const url = new URL(request.url);

    // anything that isn't the platform API passes straight through
    if (!url.pathname.startsWith(API_PREFIX)) {
      return originalFetch(input, init);
    }

    const pathname = url.pathname.slice(API_PREFIX.length) || "/";
    const found = match(request.method.toUpperCase(), pathname);

    if (latency) await new Promise((r) => setTimeout(r, latency));

    if (!found) {
      if (!quiet) {
        console.warn(`[mock] no handler for ${request.method} ${pathname}`);
      }
      return new Response(
        JSON.stringify({
          error: {
            code: "NOT_FOUND",
            message: `No mock handler for ${request.method} ${pathname}`,
          },
        }),
        { status: 404, headers: { "Content-Type": "application/json" } },
      );
    }

    try {
      return await found.handler(request, found.params, url);
    } catch (error) {
      if (!quiet) console.error("[mock] handler threw", error);
      return new Response(
        JSON.stringify({
          error: { code: "INTERNAL_ERROR", message: String(error) },
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }
  };

  if (!quiet) banner();
}

/** Restore the real fetch. Used by tests; rarely needed in the app. */
export function stop() {
  if (originalFetch) globalThis.fetch = originalFetch;
  originalFetch = null;
}

/** Fresh seed data and an empty token blocklist. */
export function reset({ demo = true } = {}) {
  db.reset({ demo });
  __resetTokens();
  __resetIdempotency();
  __resetRateLimits();
}

/**
 * Rate limiting is real (see rateLimit.js) but test suites fire far more
 * requests than the auth-register tier allows, so they turn it off.
 */
export { __setRateLimiting, __resetRateLimits };

/**
 * Fixtures only — no demo volume.
 *
 * The test suites pin to the minimal fixtures (priya, batch-0001, test-0001…).
 * seedExtra.js adds breadth for the UI, which would otherwise shift every
 * count they assert.
 */
export function resetMinimal() {
  reset({ demo: false });
}

function banner() {
  const accounts = db.accounts
    .filter((a) => a.status === "active")
    .map((a) => `  ${a.type.padEnd(12)} ${a.email}`)
    .join("\n");

  console.info(
    `%c[mock API active]%c serving ${API_PREFIX} from src/mocks — the real backend is NOT being called.\n\n` +
      `Sign in with any of these (password: ${SEED_PASSWORD}):\n${accounts}\n\n` +
      `Disable by removing VITE_USE_MOCKS from .env.local`,
    "color:#44e978;font-weight:bold",
    "color:inherit",
  );
}

export { db, SEED_PASSWORD };
