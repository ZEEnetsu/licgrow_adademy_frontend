# 04 — Super-admin accounts

The **root** actor: provisions staff-admins ([`03-staff-admin.md`](./03-staff-admin.md)), manages roles ([`05-rbac.md`](./05-rbac.md)), and can call any staff-admin endpoint (bypasses RBAC by actor type). This doc covers the super-admin accounts **themselves**. Assumes [`00-conventions.md`](./00-conventions.md).

- **Bootstrap:** the *first* super-admin is created by a server-side CLI script (`scripts/bootstrap_administrator.ts`), **not** via the API — there is no public/self-serve path to become a super-admin.
- Super-admin login is in [`01-auth.md`](./01-auth.md) §3.

**Base path:** `/api/v1/admin/super-admins` (management) and `/api/v1/me` (self) · **Actor:** `super_admin`

| # | Method | Path | Purpose |
|---|--------|------|---------|
| 1 | GET | `/admin/super-admins` | list super-admins |
| 2 | POST | `/admin/super-admins` | create another super-admin |
| 3 | POST | `/admin/super-admins/:id/deactivate` | deactivate (cannot deactivate self) |
| 4 | POST | `/me/change-password` | change own password |

All `/admin/*` endpoints return `403 FORBIDDEN` if the caller is not a super-admin.

---

## 1. List super-admins

`GET /api/v1/admin/super-admins`

`200 OK` → paginated `{ id, fullName, email, username, isActive, createdAt }`.

---

## 2. Create a super-admin

`POST /api/v1/admin/super-admins`

**Body**

| Field | Type | Req | Rules |
|-------|------|-----|-------|
| **`fullName`** | string | ✅ | 2–120 chars |
| **`email`** | string | ✅ | valid, unique among super-admins |
| **`username`** | string | ✅ | 3–30, `^[a-z0-9_]+$`, unique |
| **`password`** | string | ✅ | 12–128, letters+digits+symbol |

`201 Created` → the created super-admin (no password in response).

| Status | `code` | When |
|--------|--------|------|
| 400 | `VALIDATION_ERROR` | bad field(s) |
| 409 | `EMAIL_TAKEN` / `USERNAME_TAKEN` | already used |

---

## 3. Deactivate a super-admin

`POST /api/v1/admin/super-admins/:id/deactivate`

`200 OK` → `{ "data": { "id": "…", "isActive": false } }`

| Status | `code` | When |
|--------|--------|------|
| 404 | `NOT_FOUND` | no such super-admin |
| 422 | `CANNOT_DEACTIVATE_SELF` | `:id` is the caller |
| 422 | `LAST_SUPER_ADMIN` | would leave zero active super-admins |
| 200 | *(idempotent no-op)* | already inactive |

> There is intentionally no "reactivate super-admin" API in v1 — reactivation is a deliberate, audited action done via the bootstrap CLI, to avoid a compromised super-admin silently restoring another.

---

## 4. Change own password

`POST /api/v1/me/change-password` *(shared self endpoint; identical contract to [`02-learner.md`](./02-learner.md) §4)*

`currentPassword` + `newPassword` (12–128, letters+digits+symbol). `204 No Content` on success; `401 INVALID_CURRENT_PASSWORD` on mismatch.

---

## Module error codes

| HTTP | `code` | User-safe? |
|------|--------|-----------|
| 422 | `CANNOT_DEACTIVATE_SELF` | yes |
| 422 | `LAST_SUPER_ADMIN` | yes — "At least one active super-admin is required." |
