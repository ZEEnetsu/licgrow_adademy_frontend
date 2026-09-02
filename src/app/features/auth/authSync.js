/**
 * Cross-tab auth signalling over BroadcastChannel.
 *
 * Purpose: when the user logs out in one tab, every other tab should stop
 * rendering an authenticated shell immediately rather than waiting to discover
 * its token is dead on the next request.
 *
 * KNOWN LIMITATION (follows from the sessionStorage choice in tokenStorage.js):
 * sessionStorage is per-tab, so two tabs hold two independent sessions. A
 * LOGIN in tab A therefore cannot authenticate tab B — there is no shared
 * refresh token to hand over. Logout broadcast still works and is worth having.
 * This is the accepted cost of keeping the refresh token out of localStorage.
 */

const CHANNEL_NAME = "licgrow.auth";

export const AUTH_EVENTS = Object.freeze({
  LOGOUT: "logout",
  SESSION_ESTABLISHED: "session_established",
});

const supported = typeof BroadcastChannel !== "undefined";

let channel = null;

function getChannel() {
  if (!supported) return null;
  if (!channel) channel = new BroadcastChannel(CHANNEL_NAME);
  return channel;
}

/**
 * Announce an auth event to other tabs.
 * Silently no-ops where BroadcastChannel is unavailable.
 *
 * @param {string} type one of AUTH_EVENTS
 * @param {object} [payload] must be structured-cloneable — never include tokens
 */
export function broadcastAuthEvent(type, payload = {}) {
  try {
    getChannel()?.postMessage({ type, payload, at: Date.now() });
  } catch {
    // a broadcast failure must never break the auth flow
  }
}

/**
 * Listen for auth events from other tabs.
 *
 * @param {(event: {type: string, payload: object, at: number}) => void} handler
 * @returns {() => void} unsubscribe
 */
export function subscribeToAuthEvents(handler) {
  const ch = getChannel();
  if (!ch) return () => {};

  const listener = (event) => {
    if (event?.data?.type) handler(event.data);
  };

  ch.addEventListener("message", listener);
  return () => ch.removeEventListener("message", listener);
}

/** Tear down the channel — for tests and hot-reload cleanliness. */
export function closeAuthChannel() {
  try {
    channel?.close();
  } catch {
    // ignore
  }
  channel = null;
}
