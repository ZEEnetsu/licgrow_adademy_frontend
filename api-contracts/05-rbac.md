# 05 — RBAC (roles & permissions)

The authorization vocabulary for **staff-admins**. Assumes [`00-conventions.md`](./00-conventions.md).

- **Learners** and **super-admins** are *not* governed by RBAC. Learners have no permissions; super-admins bypass permission checks by actor type (they can call any staff-admin endpoint).
- A **staff-admin** has exactly one **role**; the role carries a set of **permissions** (`resource:action`). Permissions are embedded in the staff-admin's access token at login and re-checked server-side.
- Roles & permissions are managed by **super-admins**.

**Base path:** `/api/v1/admin`

| # | Method | Path | Actor | Notes |
|---|--------|------|-------|-------|
| 1 | GET | `/admin/permissions` | staff-admin (any) or super-admin | the full catalog below |
| 2 | GET | `/admin/roles` | staff-admin (any) or super-admin | roles + their permissions |
| 3 | GET | `/admin/roles/:roleId` | staff-admin (any) or super-admin | one role |
| 4 | POST | `/admin/roles` | **super-admin** | create a custom role |
| 5 | PUT | `/admin/roles/:roleId/permissions` | **super-admin** | replace a role's permission set |

---

## Permission catalog (the master reference)

Every `resource:action` string used anywhere in these docs is defined here. A `:manage`/`:author` permission **implies** the corresponding `:read`.

| Permission | Grants |
|-----------|--------|
| `batch:read` | View batches and their published content/membership |
| `batch:manage` | Create/update/archive batches; publish courses & tests into a batch; add/remove members |
| `enrollment:review` | List, approve, reject enrollment requests |
| `course:read` | View the course tree (units, chapters) |
| `course:author` | Create/update/reorder/publish/archive courses, units, chapters |
| `test:read` | View tests/quizzes and their questions (admin shape, includes answer keys) |
| `test:author` | Create/update tests, questions, options; publish/archive; import |
| `test:view_results` | View attempts, scores, and test analytics |
| `announcement:read` | View announcements (admin view) |
| `announcement:manage` | Create/update/delete announcements (batch-scoped & global) |
| `learner:read` | View learner accounts, profiles, and learner analytics |
| `learner:suspend` | Suspend / reactivate learner accounts |
| `analytics:view` | View platform- and batch-level analytics |

## Default roles (seeded)

| Role | Permissions |
|------|-------------|
| `mentor` | **all** permissions above (full staff powers) |
| `co_mentor` | `batch:read`, `enrollment:review`, `course:author`, `test:author`, `test:view_results`, `announcement:manage`, `learner:read`, `analytics:view` — *(no `batch:manage`, no `learner:suspend`)* |
| `viewer` | all `:read` permissions + `test:view_results` + `analytics:view` (read-only) |

> Staff-admin **account** provisioning and role assignment are **super-admin** actions — see [`03-staff-admin.md`](./03-staff-admin.md). This module only defines and edits the roles themselves.

---

## 1. List permissions

`GET /api/v1/admin/permissions`

`200 OK`
```json
{ "data": [ { "name": "batch:manage", "description": "Create/update/archive batches…" }, { "name": "enrollment:review", "description": "…" } ] }
```

## 2. List roles

`GET /api/v1/admin/roles`

`200 OK`
```json
{
  "data": [
    { "id": "role-uuid", "name": "mentor", "description": "Full staff powers", "permissions": ["batch:manage", "enrollment:review", "…"], "isSystem": true }
  ]
}
```

## 3. Get a role

`GET /api/v1/admin/roles/:roleId` → `200 OK` with the single role object, or `404 NOT_FOUND`.

## 4. Create a role  (super-admin)

`POST /api/v1/admin/roles`

**Body**

| Field | Type | Req | Rules |
|-------|------|-----|-------|
| **`name`** | string | ✅ | 3–50 chars, `^[a-z][a-z0-9_]+$`, unique |
| `description` | string | ⬜ | 0–255 chars |
| **`permissions`** | string[] | ✅ | each must exist in the catalog; non-empty |

`201 Created` → the created role.

| Status | `code` | When |
|--------|--------|------|
| 400 | `VALIDATION_ERROR` | bad name/permissions shape |
| 403 | `FORBIDDEN` | caller is not a super-admin |
| 409 | `ROLE_NAME_TAKEN` | a role with that name exists |
| 422 | `UNKNOWN_PERMISSION` | a permission string isn't in the catalog (`details` lists them) |

## 5. Replace a role's permissions  (super-admin)

`PUT /api/v1/admin/roles/:roleId/permissions`

**Body:** `{ "permissions": ["batch:read", "course:author", …] }` (full replacement, not a patch).

`200 OK` → the updated role.

| Status | `code` | When |
|--------|--------|------|
| 403 | `FORBIDDEN` | not a super-admin |
| 404 | `NOT_FOUND` | no such role |
| 422 | `UNKNOWN_PERMISSION` | unknown permission in the set |
| 422 | `SYSTEM_ROLE_IMMUTABLE` | attempt to edit a seeded `isSystem` role (`mentor`/`co_mentor`/`viewer`) |

> Changing a role's permissions affects staff-admins **on their next login** (permissions are embedded at login). Existing tokens keep their old permission set until they expire/refresh. Document this to admins so a permission revoke isn't assumed to be instant.

## Module error codes

| HTTP | `code` | User-safe? |
|------|--------|-----------|
| 409 | `ROLE_NAME_TAKEN` | yes |
| 422 | `UNKNOWN_PERMISSION` | yes (admin UI) |
| 422 | `SYSTEM_ROLE_IMMUTABLE` | yes (admin UI) |
