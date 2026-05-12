import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { logout } from '../authSlice.js';

/** Canonical API root from `APIdocs.md`; must align with dev `VITE_API_PATH_PREFIX` default. */
const API_VERSION_ROOT = '/api/v1';

/**
 * When `VITE_API_URL` is only an origin (e.g. `https://tunnel.ngrok-free.app`),
 * browsers would hit `/auth/register` → 404. Backend routes are mounted at `API_VERSION_ROOT`.
 */
export function normalizePublicApiBase(url) {
  const trimmed =
    typeof url === 'string' ? url.trim().replace(/\/$/, '') : '';
  if (!trimmed) return '';
  try {
    const href =
      /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed) || trimmed.startsWith('//')
        ? trimmed.startsWith('//')
          ? `https:${trimmed}`
          : trimmed
        : `https://${trimmed}`;
    const u = new URL(href);
    let path =
      u.pathname.length > 1 && u.pathname.endsWith('/')
        ? u.pathname.slice(0, -1)
        : u.pathname;
    if (path === '' || path === '/') {
      u.pathname = API_VERSION_ROOT;
      return u.href.replace(/\/?$/, '');
    }
    return trimmed;
  } catch {
    return trimmed;
  }
}

/**
 * Resolve browser-facing API base (`APIdocs.md`: `/api/v1`).
 * Prod / direct tunnels: full base via `VITE_API_URL` (include `/api/v1`, or omit path and we append it).
 * Dev without `VITE_API_URL`: same-origin prefix proxied by Vite (`VITE_API_PATH_PREFIX`).
 */
export function resolveApiBaseUrl() {
  const full = import.meta.env.VITE_API_URL;
  if (typeof full === 'string' && full.trim()) {
    return normalizePublicApiBase(full.replace(/\/$/, ''));
  }
  if (import.meta.env.DEV) {
    const prefix =
      typeof import.meta.env.VITE_API_PATH_PREFIX === 'string' &&
      import.meta.env.VITE_API_PATH_PREFIX.trim()
        ? import.meta.env.VITE_API_PATH_PREFIX
        : '/api/v1';
    return prefix.replace(/\/$/, '');
  }
  return '';
}

export const API_BASE = resolveApiBaseUrl();

export const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    headers.set('Accept', 'application/json');

    /** Do not send `ngrok-skip-browser-warning` from the browser: it is a non-simple header,
     *  triggers CORS preflight, and backends must list it in `Access-Control-Allow-Headers`
     *  (most do not). Vite's dev proxy still adds it on `proxyReq` for same-origin `/api/v1`. */

    return headers;
  },
});

/** On 401, clear Redux + localStorage session (credentials invalid / expired). */
export const baseQueryWithAuthGuard = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  if (result?.error?.status === 401) {
    api.dispatch(logout());
  }
  return result;
};
