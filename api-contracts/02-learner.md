# 02 — Learner

Learner self-registration and self-service, plus staff-admin management of learner accounts. Assumes [`00-conventions.md`](./00-conventions.md).

| # | Method | Path | Actor | Permission | Rate tier | Idempotency |
|---|--------|------|-------|-----------|-----------|-------------|
| 1 | POST | `/auth/register` | public | — | auth-register | recommended |
| 2 | GET | `/me/profile` | learner | — | standard | — |
| 3 | PUT | `/me/profile` | learner | — | standard | — |
| 4 | POST | `/me/change-password` | learner | — | standard | — |
| 5 | GET | `/admin/learners` | staff-admin | `learner:read` | standard | — |
| 6 | GET | `/admin/learners/:learnerId` | staff-admin | `learner:read` | standard | — |
| 7 | POST | `/admin/learners/:learnerId/suspend` | staff-admin | `learner:suspend` | standard | — |
| 8 | POST | `/admin/learners/:learnerId/reactivate` | staff-admin | `learner:suspend` | standard | — |

---

## 1. Register  (public)

`POST /api/v1/auth/register`

Creates a learner account and returns tokens (auto-login). The account starts `active` but has **no batch access** until an enrollment is approved ([`07-enrollment.md`](./07-enrollment.md)).

**Headers:** `Content-Type: application/json`, `Idempotency-Key: <uuid>` *(recommended)*

**Body**

| Field | Type | Req | Rules |
|-------|------|-----|-------|
| **`fullName`** | string | ✅ | 2–120 chars |
| **`email`** | string | ✅ | valid email, ≤255, unique |
| **`password`** | string | ✅ | 8–128 chars; must include letters + digits |
| `username` | string | ⬜ | 3–30 chars, `^[a-z0-9_]+$`, unique; if omitted, login is by email only |
| `phone` | string | ⬜ | E.164, e.g. `+919812345678` |

`201 Created` → same token+actor shape as `POST /auth/login` (see [`01-auth.md`](./01-auth.md) §1).

| Status | `code` | When |
|--------|--------|------|
| 400 | `VALIDATION_ERROR` | bad field(s); password too weak |
| 409 | `EMAIL_TAKEN` | email already registered |
| 409 | `USERNAME_TAKEN` | username already taken |
| 429 | `RATE_LIMITED` | auth-register (5/hr/IP) |

---

## 2. Get my profile  (learner)

`GET /api/v1/me/profile`

`200 OK`
```json
{
  "data": {
    "id": "b2ad…",
    "fullName": "Priya Sharma",
    "email": "priya@example.com",
    "username": "priyas",
    "phone": "+919812345678",
    "status": "active",
    "profile": {
      "licAgentCode": "LIC-4471",
      "dob": "1996-03-14",
      "city": "Pune",
      "experienceYears": 2,
      "isComplete": true
    },
    "createdAt": "2026-06-01T09:00:00Z"
  }
}
```
- `profile.isComplete` is `true` when all enrollment-required fields (`licAgentCode`, `dob`, `city`, `experienceYears`) are present. The frontend uses this to gate the enrollment flow.

---

## 3. Update my profile  (learner)

`PUT /api/v1/me/profile`

Partial update allowed (send only changed fields). This is how a learner completes the profile required for enrollment.

**Body** (all optional, but `isComplete` only flips true when all four profile fields exist)

| Field | Type | Rules |
|-------|------|-------|
| `fullName` | string | 2–120 chars |
| `phone` | string | E.164 |
| `licAgentCode` | string | 3–40 chars |
| `dob` | string (date) | `YYYY-MM-DD`, age ≥ 18 |
| `city` | string | 2–85 chars |
| `experienceYears` | integer | 0–60 |

`200 OK` → the updated profile (same shape as §2).

| Status | `code` | When |
|--------|--------|------|
| 400 | `VALIDATION_ERROR` | bad field(s); DOB under 18 |
| 403 | `ACCOUNT_SUSPENDED` | learner not active |

> Email and username are **not** editable here (they're identity). Changing them, if ever allowed, would be a separate verified flow.

---

## 4. Change my password  (learner)

`POST /api/v1/me/change-password`

**Body**

| Field | Type | Req | Rules |
|-------|------|-----|-------|
| **`currentPassword`** | string | ✅ | must match |
| **`newPassword`** | string | ✅ | 8–128, letters+digits, ≠ current |

`204 No Content` on success. All of the learner's other sessions are left as-is in v1 (no forced global logout).

| Status | `code` | When |
|--------|--------|------|
| 400 | `VALIDATION_ERROR` | weak/identical new password |
| 401 | `INVALID_CURRENT_PASSWORD` | `currentPassword` wrong |

---

## 5. List learners  (staff-admin · `learner:read`)

`GET /api/v1/admin/learners`

**Query**

| Param | Rules |
|-------|-------|
| `status` | `active \| suspended \| inactive` |
| `q` | free-text search over name/email/username (≥2 chars) |
| `batchId` | only learners who are members of this batch |
| `sort` | `createdAt:desc` (default), `fullName:asc` |
| `page`,`limit` | standard |

`200 OK` → paginated list of learner summaries `{ id, fullName, email, status, createdAt }` with the `meta` block.

`403 FORBIDDEN` without `learner:read`.

---

## 6. Get a learner  (staff-admin · `learner:read`)

`GET /api/v1/admin/learners/:learnerId`

`200 OK` → full learner incl. `profile` and a `stats` block:
```json
{
  "data": {
    "id": "b2ad…", "fullName": "Priya Sharma", "email": "…", "status": "active",
    "profile": { "licAgentCode": "…", "city": "Pune", "experienceYears": 2, "isComplete": true },
    "stats": { "batchesActive": 1, "testsAttempted": 4, "averageScorePct": 72.5, "lastActiveAt": "2026-08-07T12:00:00Z" }
  }
}
```
`404 NOT_FOUND` if no such learner.

---

## 7 & 8. Suspend / reactivate a learner  (staff-admin · `learner:suspend`)

`POST /api/v1/admin/learners/:learnerId/suspend` · `POST /api/v1/admin/learners/:learnerId/reactivate`

Suspend sets status `suspended` (blocks login + all access, §1 of conventions); reactivate returns it to `active`.

**Suspend body** *(optional)*: `{ "reason": "string, 0–255" }` — stored for audit.

`200 OK` → `{ "data": { "id": "…", "status": "suspended" } }`

| Status | `code` | When |
|--------|--------|------|
| 403 | `FORBIDDEN` | missing `learner:suspend` |
| 404 | `NOT_FOUND` | no such learner |
| 200 | *(idempotent no-op)* | already in the target status |

---

## Module error codes

| HTTP | `code` | User-safe? |
|------|--------|-----------|
| 409 | `EMAIL_TAKEN` | yes — "That email is already registered." |
| 409 | `USERNAME_TAKEN` | yes |
| 401 | `INVALID_CURRENT_PASSWORD` | yes — "Current password is incorrect." |

## Frontend flow notes

- **After register**, you're auto-logged-in (tokens returned). Send the learner to profile completion, then to browse/enroll in a batch.
- **Gate the enrollment CTA** on `profile.isComplete`; if false, deep-link to the profile form.
