/**
 * Query args shared between admin screens.
 *
 * RTK Query caches by serialised args, so two components passing the SAME
 * args share one cache entry and one request. The sidebar's pending badge and
 * the dashboard's "Needs attention" list both read PENDING_PREVIEW — the badge
 * uses `meta.total`, the dashboard renders the five items — for the price of
 * a single call.
 */
export const PENDING_PREVIEW = { status: "pending", limit: 5, sort: "submittedAt:asc" };

export const RECENT_TESTS = { limit: 5, sort: "updatedAt:desc" };

/** How often the sidebar re-checks the pending count. */
export const PENDING_POLL_MS = 60_000;
