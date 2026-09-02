# 03 — Staff-admin accounts

Provisioning and lifecycle of **staff-admin** accounts (mentors/operators). Assumes [`00-conventions.md`](./00-conventions.md).

- **Who manages staff-admins:** **super-admins only.** Staff-admins cannot create or modify each other.
- Roles/permissions themselves are defined in [`05-rbac.md`](./05-rbac.md); this doc assigns a role to an account.
- A staff-admin's own login is in [`01-auth.md`](./01-auth.md) §2.

**Base path:** `/api/v1/admin/staff-admins` · **Actor:** `super_admin` for all endpoints

| # | Method | Path | Idempotency |
|---|--------|------|-------------|
| 1 | POST | `/admin/staff-admins` | recommended |
| 2 | GET | `/admin/staff-admins` | — |
| 3 | GET | `/admin/staff-admins/:adminId` | — |
| 4 | PUT | `/admin/staff-admins/:adminId/role` | — |
| 5 | POST | `/admin/staff-admins/:adminId/deactivate` | — |
| 6 | POST | `/admin/staff-admins/:adminId/reactivate` | — |

All endpoints return `403 FORBIDDEN` if the caller is not a super-admin.

---

## 1. Provision a staff-admin

`POST /api/v1/admin/staff-admins`

**Body**

| Field | Type | Req | Rules |
|-------|------|-----|-------|
| **`fullName`** | string | ✅ | 2–120 chars |
| **`email`** | string | ✅ | valid, ≤255, unique among staff-admins |
| **`username`** | string | ✅ | 3–30, `^[a-z0-9_]+$`, unique |
| **`password`** | string | ✅ | 12–128, letters+digits+symbol (stricter than learners) |
| **`roleId`** | string (uuid) | ✅ | must exist ([`05-rbac.md`](./05-rbac.md)) |

`201 Created`
```json
{ "data": { "id": "amit-uuid", "fullName": "Amit Rao", "email": "amit@org.in", "username": "amitr", "role": { "id": "role-uuid", "name": "mentor" }, "isActive": true, "createdBy": "superadmin-uuid", "createdAt": "…" } }
```

| Status | `code` | When |
|--------|--------|------|
| 400 | `VALIDATION_ERROR` | bad field(s); weak password |
| 409 | `EMAIL_TAKEN` / `USERNAME_TAKEN` | already used |
| 422 | `ROLE_NOT_FOUND` | `roleId` doesn't exist |

> The password is set by the super-admin at creation and delivered out-of-band. A "staff-admin sets own password via invite link" flow is a planned enhancement, not in v1.

---

## 2. List staff-admins

`GET /api/v1/admin/staff-admins`

**Query:** `isActive` (`true|false`), `roleId`, `q` (name/email search), standard pagination.

`200 OK` → paginated summaries `{ id, fullName, email, role: { id, name }, isActive, createdAt }`.

---

## 3. Get a staff-admin

`GET /api/v1/admin/staff-admins/:adminId` → `200 OK` full object, or `404 NOT_FOUND`.

---

## 4. Change role

`PUT /api/v1/admin/staff-admins/:adminId/role`

**Body:** `{ "roleId": "role-uuid" }`

`200 OK` → the updated staff-admin.

| Status | `code` | When |
|--------|--------|------|
| 404 | `NOT_FOUND` | no such staff-admin |
| 422 | `ROLE_NOT_FOUND` | `roleId` invalid |

> Takes effect on the admin's next login (permissions are embedded at login — see [`05-rbac.md`](./05-rbac.md)).

---

## 5 & 6. Deactivate / reactivate

`POST …/:adminId/deactivate` · `POST …/:adminId/reactivate`

Deactivate sets `isActive=false` (blocks login immediately at auth time); reactivate reverses it.

`200 OK` → `{ "data": { "id": "…", "isActive": false } }`

| Status | `code` | When |
|--------|--------|------|
| 404 | `NOT_FOUND` | no such staff-admin |
| 200 | *(idempotent no-op)* | already in target state |

---

## Module error codes

| HTTP | `code` | User-safe? |
|------|--------|-----------|
| 409 | `EMAIL_TAKEN` / `USERNAME_TAKEN` | yes |
| 422 | `ROLE_NOT_FOUND` | yes (admin UI) |
