/**
 * A registry of every RTK Query API slice, so cached server data can be purged
 * wholesale on sign-out or identity change.
 *
 * Why a registry rather than a hand-written list: forgetting to add a new API
 * slice to the purge path is a cross-user data leak — the next account to sign
 * in on this tab would see the previous account's cached responses. Slices
 * register themselves at module load, so the purge can't fall out of date.
 *
 * This module imports nothing, which keeps it free of import cycles.
 */

const registered = new Set();

/** Called by each API slice at module scope. */
export function registerApi(api) {
  if (api?.util?.resetApiState) registered.add(api);
}

/**
 * Drop all cached queries and mutations.
 *
 * @param {Function} dispatch
 * @param {{ except?: object[] }} [options] slices to leave untouched — used
 *   during login, where clearing the in-flight login mutation would yank the
 *   `isSuccess`/`error` state out from under the form component.
 */
export function resetAllApis(dispatch, { except = [] } = {}) {
  for (const api of registered) {
    if (except.includes(api)) continue;
    dispatch(api.util.resetApiState());
  }
}
