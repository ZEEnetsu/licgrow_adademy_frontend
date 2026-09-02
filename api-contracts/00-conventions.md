# 00 — API Conventions (read first)

Global rules that every endpoint follows. Module docs only restate a rule when they **deviate** from it.

- **Base URL:** `https://api.<env>.example.com` (placeholder — final hosts TBD)
- **API prefix / version:** all routes are under `/api/v1`
- **Transport:** HTTPS only. HTTP requests are rejected/redirected.
- **Content type:** `application/json; charset=utf-8` for request and response bodies (except `204 No Content`).
- **Casing:** request and response JSON use **camelCase**. (The DB is snake_case; the API layer maps both ways. Never expose DB column names.)
- **Time:** all timestamps are ISO 8601 in **UTC** with a `Z` suffix, e.g. `2026-08-08T17:24:03Z`.
- **IDs:** all resource identifiers are **UUID** strings.

---

## 1. Authentication

The platform has **three actor types**, each with its own account table and its own login endpoint, but all share the same token mechanics.

| Actor | Login | Token `type` claim |
|-------|-------|--------------------|
| learner | `POST /api/v1/auth/login` | `learner` |
| staff-admin | `POST /api/v1/auth/admin/login` | `staff_admin` |
| super-admin | `POST /api/v1/auth/ops/login` | `super_admin` |

### Tokens

- **Access token** — short-lived JWT (**15 minutes**). Sent on every authenticated request:
  ```
  Authorization: Bearer <accessToken>
  ```
- **Refresh token** — long-lived JWT (**7 days**). Returned in the login response body. The client stores it securely (web: httpOnly cookie via your BFF, or secure storage; mobile: Keychain/Keystore) and exchanges it at `POST /api/v1/auth/refresh` for a new access token.
- **Logout** (`POST /api/v1/auth/logout`) adds the current token to a server-side blocklist until it expires. *(v1: in-memory, per-instance — see §7.)*

### JWT payload (informational — clients must not depend on decoding it)

```json
{
  "sub": "b2ad096b-...-uuid",   // account id
  "type": "learner",            // learner | staff_admin | super_admin
  "permissions": ["test:read", "batch:manage"],  // staff-admin only; [] otherwise
  "iat": 1770000000,
  "exp": 1770000900
}
```

- **401 vs 403:** a missing/invalid/expired/blocklisted token → **401**. A valid token whose actor/permission isn't allowed for the route → **403**.
- A learner whose account is `suspended`/`inactive` gets **403** with code `ACCOUNT_SUSPENDED` even with a valid token.

## 2. Authorization

- **learner** endpoints require `type: learner`.
- **staff-admin** endpoints require `type: staff_admin` **and** the specific permission listed on the endpoint (RBAC, `resource:action` naming, e.g. `batch:manage`, `test:author`, `enrollment:review`). Missing permission → **403** `FORBIDDEN`.
- **super-admin** endpoints require `type: super_admin`.
- **Ownership / membership invariants** are enforced beyond RBAC. Example: a learner may only read a test if their batch grants it. These are documented per-endpoint and return **403** `NOT_A_BATCH_MEMBER` (or **404** where existence itself is privileged — noted per endpoint).

## 3. Request format

### Standard headers

| Header | When | Notes |
|--------|------|-------|
| `Authorization: Bearer <token>` | all authenticated endpoints | see §1 |
| `Content-Type: application/json` | requests with a body | |
| `Accept-Language: en \| hi` | optional | selects language for bilingual reads (default `en`); see §9 |
| `Idempotency-Key: <uuid>` | required on some POSTs | see §8 |
| `X-Request-Id: <uuid>` | optional | echoed back in responses/errors for tracing; server generates one if absent |

### Body field notation used in these docs

- **`field`** *(required)* — request fails with **400** if missing.
- `field` *(optional)* — may be omitted; default (if any) is documented.
- Max JSON body size is **1 MB**; larger → **413 Payload Too Large**.
- Unknown fields are **rejected** (strict schemas) → **400** `VALIDATION_ERROR`. Don't send fields not in the contract.

## 4. Response format

### Success envelope

Single resource:
```json
{ "data": { "id": "…", "…": "…" } }
```
Collection (paginated — see §6):
```json
{ "data": [ { "…": "…" } ], "meta": { "page": 1, "limit": 20, "total": 57, "totalPages": 3, "hasNext": true, "hasPrev": false } }
```
- `204 No Content` responses have **no body**.
- Times are UTC ISO 8601; absent values are `null` (keys are present), except where a doc says a key is omitted.

### Error envelope

Every non-2xx response (except some framework-level 401s) uses:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable summary (safe to surface to users only if the doc says so).",
    "details": [
      { "field": "email", "issue": "Invalid email address" }
    ],
    "requestId": "b1f2…"
  }
}
```
- `code` is a **stable machine-readable string** — branch on this, never on `message`.
- `details` is present for validation errors (**400**) and some **422**s; omitted otherwise.
- `message` is for developers/logs. Only show it to end users when a module doc marks the code as user-safe.

## 5. Status codes

| Code | Meaning in this API |
|------|---------------------|
| **200** | OK — read succeeded, or an action/update returning a body |
| **201** | Created — a new resource was created (body = the resource) |
| **204** | No Content — success with no body (most deletes, some actions) |
| **400** | Bad Request — malformed JSON, wrong types, or **failed schema validation** (see `details`) |
| **401** | Unauthenticated — missing/invalid/expired/blocklisted token |
| **403** | Forbidden — authenticated but not allowed (wrong actor, missing permission, not a batch member, suspended) |
| **404** | Not Found — resource doesn't exist (or is hidden from this actor) |
| **409** | Conflict — duplicate/unique violation or a concurrent-state clash (e.g. already enrolled, active attempt exists) |
| **422** | Unprocessable Entity — well-formed and authorized, but violates a **business/state rule** (e.g. publishing a test with 0 questions, submitting an expired attempt) |
| **429** | Too Many Requests — rate limit hit (see §7) |
| **500** | Internal Server Error — unexpected; `requestId` included for support |

**400 vs 422 rule of thumb:** if the request shape is wrong → 400. If the shape is fine but the *action* isn't legal right now → 422.

## 6. Pagination, filtering, sorting

Applies to all list (`GET` collection) endpoints unless a doc says otherwise.

| Query param | Default | Rules |
|-------------|---------|-------|
| `page` | `1` | 1-based |
| `limit` | `20` | 1–100; `>100` is clamped to 100 |
| `sort` | per-endpoint | `field:asc` or `field:desc`; only whitelisted fields (listed per endpoint) |
| filters | — | endpoint-specific (e.g. `status=pending`); documented per endpoint |

Response includes the `meta` block shown in §4. An out-of-range `page` returns `200` with an empty `data` array (not 404).

## 7. Rate limiting

Every response carries rate-limit headers:
```
RateLimit-Limit: 100
RateLimit-Remaining: 96
RateLimit-Reset: 34          # seconds until the window resets
```
On a breach → **429** with `Retry-After: <seconds>` and body code `RATE_LIMITED`.

### Tiers (v1)

| Tier | Applies to | Limit |
|------|-----------|-------|
| **auth-strict** | `login` (all actors), `refresh` | 10 requests / 15 min **per IP** |
| **auth-register** | learner self-registration, enrollment submit | 5 requests / hour **per IP** |
| **standard** | all other authenticated endpoints | 100 requests / min **per account** |
| **autosave** | submission answer autosave (`PUT …/answers`) | 2 requests / sec **per account** (burst-friendly) |

> **v1 caveat:** the limiter is **in-memory and per-instance**. With N app instances the effective global limit is ~N×. Interfaces are designed so a Redis-backed limiter drops in later without contract changes. Treat these numbers as per-instance for now.

## 8. Idempotency

Unsafe `POST`s that **create or advance state** support an `Idempotency-Key` header (a client-generated UUID).

- **Required** on: enrollment submit, start attempt, submit attempt. *(Marked per endpoint.)*
- **Recommended** on all other creating `POST`s.
- **Behavior:** the server caches the first response for a `(key, endpoint, actor)` tuple for **24 hours**. A retry with the same key returns the **original** response plus header `Idempotency-Replayed: true` — the action runs at most once.
- Reusing a key with a **different body** → **422** `IDEMPOTENCY_KEY_REUSED`.
- Omitting the header on an endpoint that requires it → **400** `IDEMPOTENCY_KEY_REQUIRED`.

> **v1 caveat:** idempotency cache is in-memory/per-instance like rate limiting; Redis-backed later. Safe-retry semantics are the contract; the storage is an implementation detail.

## 9. Localization (bilingual content)

**Scope (v1): bilingual applies to test/quiz *questions and their options* only.** Everything else — course / unit / chapter content, announcements, notifications, account fields, labels — is single-language (**English**) for now. Endpoints outside the test/submission modules ignore `Accept-Language`.

Questions and options are authored in **English (`en`) and Hindi (`hi`)**.

- **Learner reads** (fetching a test/quiz to attempt): the server returns question/option text in the language from `Accept-Language` (`en` default). If a translation is missing it falls back to `en` and sets `contentLang` on the affected question to what was actually returned.
- **Admin authoring reads** (fetching a question to edit): the server returns **both** languages so the author can edit either.
- Non-content fields (ids, timestamps, enums, marks) are never localized.

## 10. Security measures (baseline for every endpoint)

- **HTTPS + HSTS**, secure headers via Helmet (CSP, `X-Content-Type-Options`, `X-Frame-Options`, etc.).
- **CORS:** only the configured web origins are allowed; credentials enabled. Non-allowlisted origins are rejected.
- **Passwords** are hashed with **argon2**; never returned in any response, never logged.
- **Secrets / tokens / password hashes** never appear in responses or logs. `requestId` is safe to log/share.
- **Input validation** is strict (Zod) at the edge; unknown fields rejected; body size capped at 1 MB (§3).
- **Answer-key protection:** a question's correct option / `isCorrect` / `explanation` is **never** included in learner-facing responses before the rules allow it. Admin and learner use separate response shapes (`AdminTestDetail` vs `LearnerTestDetail`). This is a contract guarantee, not just a filter.
- **Authorization is defense-in-depth:** RBAC permission **and** ownership/membership invariants are both checked server-side; the frontend hiding a button is never the only guard.
- **Enumeration protection:** where revealing existence is itself sensitive, a forbidden resource returns **404** rather than 403 (noted per endpoint).
- **Account state:** suspended/inactive accounts are rejected at auth time (**403** `ACCOUNT_SUSPENDED`).

## 11. Common error codes

Domain-specific codes are listed in each module doc. These are global:

| HTTP | `code` | Meaning |
|------|--------|---------|
| 400 | `VALIDATION_ERROR` | Body/query/path failed schema validation (see `details`) |
| 400 | `MALFORMED_JSON` | Body isn't valid JSON |
| 400 | `IDEMPOTENCY_KEY_REQUIRED` | Endpoint requires `Idempotency-Key` and it was missing |
| 401 | `UNAUTHENTICATED` | Missing/invalid/expired/blocklisted token |
| 403 | `FORBIDDEN` | Actor/permission not allowed |
| 403 | `ACCOUNT_SUSPENDED` | Account is not active |
| 404 | `NOT_FOUND` | Resource does not exist (or is hidden from this actor) |
| 409 | `CONFLICT` | Generic uniqueness/state conflict (module docs give specific codes) |
| 413 | `PAYLOAD_TOO_LARGE` | Body exceeds 1 MB |
| 422 | `UNPROCESSABLE` | Generic business-rule violation (module docs give specific codes) |
| 422 | `IDEMPOTENCY_KEY_REUSED` | Same idempotency key, different body |
| 429 | `RATE_LIMITED` | Too many requests; see `Retry-After` |
| 500 | `INTERNAL_ERROR` | Unexpected server error |
