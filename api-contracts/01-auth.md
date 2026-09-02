# 01 — Auth

Login for all three actors, token refresh, logout, and "who am I". Assumes [`00-conventions.md`](./00-conventions.md).

**Base path:** `/api/v1/auth`

| # | Method | Path | Actor | Auth required | Rate tier |
|---|--------|------|-------|---------------|-----------|
| 1 | POST | `/auth/login` | learner | no | auth-strict |
| 2 | POST | `/auth/admin/login` | staff-admin | no | auth-strict |
| 3 | POST | `/auth/ops/login` | super-admin | no | auth-strict |
| 4 | POST | `/auth/refresh` | any | no (refresh token in body) | auth-strict |
| 5 | POST | `/auth/logout` | any | yes (access token) | standard |
| 6 | GET | `/auth/me` | any | yes (access token) | standard |

Learner **registration** lives in the learner module ([`02-learner.md`](./02-learner.md), `POST /auth/register`) because it creates an account rather than authenticating one; cross-referenced here for discoverability.

---

## 1. Learner login

`POST /api/v1/auth/login`

Authenticates a learner and returns an access + refresh token pair.

**Headers:** `Content-Type: application/json`

**Body**

| Field | Type | Req | Rules |
|-------|------|-----|-------|
| **`identifier`** | string | ✅ | learner's email or username; 3–255 chars |
| **`password`** | string | ✅ | 8–128 chars |

```json
{ "identifier": "priya@example.com", "password": "correct horse battery" }
```

**Responses**

`200 OK`
```json
{
  "data": {
    "accessToken": "eyJhbGciOi…",
    "refreshToken": "eyJhbGciOi…",
    "tokenType": "Bearer",
    "expiresIn": 900,
    "actor": {
      "id": "b2ad096b-…",
      "type": "learner",
      "fullName": "Priya Sharma",
      "email": "priya@example.com"
    }
  }
}
```

| Status | `code` | When |
|--------|--------|------|
| 400 | `VALIDATION_ERROR` | missing/invalid `identifier` or `password` |
| 401 | `INVALID_CREDENTIALS` | no match, or wrong password. **Message is deliberately generic** — do not reveal whether the account exists. |
| 403 | `ACCOUNT_SUSPENDED` | account exists and password is correct but status ≠ active |
| 429 | `RATE_LIMITED` | >10 attempts / 15 min per IP |

**Security notes**
- `INVALID_CREDENTIALS` is returned identically for "unknown user" and "wrong password" (no user enumeration).
- Password is never echoed or logged. Failed attempts are counted toward the IP rate limit.

---

## 2. Staff-admin login

`POST /api/v1/auth/admin/login`

Same request/response shape as §1, with two differences:
- `actor.type` is `staff_admin`.
- The access token embeds the admin's **permissions** array (from their RBAC role). `actor` additionally includes `role`:

```json
{
  "data": {
    "accessToken": "…", "refreshToken": "…", "tokenType": "Bearer", "expiresIn": 900,
    "actor": { "id": "…", "type": "staff_admin", "fullName": "Amit Rao", "email": "amit@org.in", "role": "mentor" }
  }
}
```

Error codes identical to §1 (`INVALID_CREDENTIALS`, `ACCOUNT_SUSPENDED` when `isActive = false`).

---

## 3. Super-admin login

`POST /api/v1/auth/ops/login`

Same shape as §1. `actor.type` is `super_admin`; `permissions` in the token is `[]` (super-admin bypasses per-permission checks by actor type). Error codes identical to §1.

---

## 4. Refresh access token

`POST /api/v1/auth/refresh`

Exchanges a valid refresh token for a new access token. Works for all actors (the actor is derived from the refresh token).

**Body**

| Field | Type | Req | Rules |
|-------|------|-----|-------|
| **`refreshToken`** | string | ✅ | a valid, unexpired, non-blocklisted refresh JWT |

**Responses**

`200 OK`
```json
{ "data": { "accessToken": "eyJ…", "tokenType": "Bearer", "expiresIn": 900 } }
```

| Status | `code` | When |
|--------|--------|------|
| 400 | `VALIDATION_ERROR` | `refreshToken` missing/not a string |
| 401 | `INVALID_REFRESH_TOKEN` | expired, malformed, blocklisted (e.g. after logout), or actor no longer active |
| 429 | `RATE_LIMITED` | auth-strict tier |

> v1 does **not** rotate refresh tokens (the same refresh token is reused until it expires). Rotation is a planned hardening step; the contract won't change for clients when it lands (you already call `/refresh` and read `accessToken`).

---

## 5. Logout

`POST /api/v1/auth/logout`

Blocklists the presented access token (and, if supplied, the refresh token) until expiry.

**Headers:** `Authorization: Bearer <accessToken>`

**Body** *(optional)*

| Field | Type | Req | Rules |
|-------|------|-----|-------|
| `refreshToken` | string | ⬜ | if provided, it is also blocklisted so it can't refresh afterward |

**Responses**

| Status | Body | When |
|--------|------|------|
| 204 | *(none)* | logged out (idempotent — logging out an already-blocklisted token still returns 204) |
| 401 | `UNAUTHENTICATED` | no/invalid access token |

> v1 caveat: the blocklist is in-memory/per-instance (§7/§1 of conventions). A token could still be accepted by another instance until it expires. Redis-backed blocklist is planned.

---

## 6. Current identity

`GET /api/v1/auth/me`

Returns the authenticated actor. Handy for the frontend to rehydrate session state on load.

**Headers:** `Authorization: Bearer <accessToken>`

**Responses**

`200 OK` — learner example:
```json
{
  "data": {
    "id": "b2ad096b-…",
    "type": "learner",
    "fullName": "Priya Sharma",
    "email": "priya@example.com",
    "status": "active",
    "permissions": []
  }
}
```
For `staff_admin`, `permissions` is populated and `role` is included. For `super_admin`, `permissions` is `[]`.

| Status | `code` | When |
|--------|--------|------|
| 401 | `UNAUTHENTICATED` | missing/invalid/expired/blocklisted token |
| 403 | `ACCOUNT_SUSPENDED` | token valid but account no longer active |

---

## Module error codes (in addition to the global set in `00-conventions.md`)

| HTTP | `code` | User-safe message? |
|------|--------|--------------------|
| 401 | `INVALID_CREDENTIALS` | yes — "Invalid email/username or password." |
| 401 | `INVALID_REFRESH_TOKEN` | no — trigger silent re-login |
| 403 | `ACCOUNT_SUSPENDED` | yes — "Your account is suspended. Contact support." |

## Frontend flow notes

- **On app load:** if an access token exists, call `GET /auth/me`. On `401`, try `POST /auth/refresh`; if that also fails, route to login.
- **On any `401` mid-session:** attempt one `refresh`, retry the original request once, then fall back to login. Don't loop.
- **Store tokens** per platform guidance in `00-conventions.md §1` — never in `localStorage` for the web SPA if avoidable.
