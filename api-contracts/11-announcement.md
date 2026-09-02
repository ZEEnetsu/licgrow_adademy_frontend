# 11 — Announcements

Admins post announcements to a **batch** (visible to its members) or **globally** (visible to all learners). Learners read them in their arena. Assumes [`00-conventions.md`](./00-conventions.md). English only (conventions §9).

## Model

| Field | Type | Notes |
|-------|------|-------|
| `id` | uuid | |
| `scope` | `global \| batch` | |
| `batchId` | uuid \| null | required when `scope=batch`; null when `global` |
| `title` | string | |
| `body` | string | |
| `isPinned` | boolean | pinned sort to the top |
| `publishedAt` | timestamp | |
| `expiresAt` | timestamp \| null | hidden from learners after this; null = never |
| `createdBy` | uuid | staff-admin |

**Visibility:** `global` → every authenticated learner. `batch` → active members of that batch. Expired announcements are excluded from learner reads (still visible to admins).

**Endpoints**

| # | Method | Path | Actor | Permission |
|---|--------|------|-------|-----------|
| 1 | POST | `/admin/announcements` | staff-admin | `announcement:manage` |
| 2 | GET | `/admin/announcements` | staff-admin | `announcement:read` |
| 3 | GET | `/admin/announcements/:id` | staff-admin | `announcement:read` |
| 4 | PATCH | `/admin/announcements/:id` | staff-admin | `announcement:manage` |
| 5 | DELETE | `/admin/announcements/:id` | staff-admin | `announcement:manage` |
| 6 | GET | `/me/announcements` | learner | — |
| 7 | GET | `/me/batches/:batchId/announcements` | learner | — (member) |

---

## 1. Create  (`announcement:manage`)

`POST /api/v1/admin/announcements`

**Body**

| Field | Type | Req | Rules |
|-------|------|-----|-------|
| **`scope`** | `global\|batch` | ✅ | |
| `batchId` | uuid | cond. | required if `scope=batch`; forbidden if `global` |
| **`title`** | string | ✅ | 3–160 |
| **`body`** | string | ✅ | 1–5000 |
| `isPinned` | boolean | ⬜ | default false |
| `expiresAt` | timestamp | ⬜ | must be future |

`201 Created` → the announcement (`publishedAt` = now). Creating a batch announcement fans out `ANNOUNCEMENT_POSTED` notifications to members ([`12`](./12-notification.md)).

| Status | `code` | When |
|--------|--------|------|
| 400 | `VALIDATION_ERROR` | bad fields; past `expiresAt` |
| 404 | `NOT_FOUND` | `batchId` doesn't exist |
| 422 | `INVALID_SCOPE` | `batchId` present for `global`, or missing for `batch` |

---

## 2–5. List / get / update / delete  (admin)

`GET /admin/announcements` — query `scope`, `batchId`, `isPinned`, `includeExpired` (default true for admins), pagination. `200 OK` → paginated list.

`GET /admin/announcements/:id` → `200 OK` / `404`.

`PATCH /admin/announcements/:id` — `title`, `body`, `isPinned`, `expiresAt`. `200 OK`.

`DELETE /admin/announcements/:id` → `204`.

---

## 6. My announcements  (learner)

`GET /api/v1/me/announcements`

Merged feed across the learner's active batches **plus** global, excluding expired. Sort: pinned first, then `publishedAt` desc.

`200 OK`
```json
{
  "data": [
    { "id": "a1", "scope": "batch", "batchId": "8f1c…", "batchName": "IC-38 — Aug 2026 Cohort", "title": "Batch starts Monday", "body": "…", "isPinned": true, "publishedAt": "…", "expiresAt": null },
    { "id": "a0", "scope": "global", "batchId": null, "batchName": null, "title": "Platform maintenance", "body": "…", "isPinned": false, "publishedAt": "…", "expiresAt": "…" }
  ],
  "meta": { "…": "…" }
}
```

## 7. Batch announcements  (learner · member)

`GET /api/v1/me/batches/:batchId/announcements` — that batch's announcements + global, same sort/filters. `403 NOT_A_BATCH_MEMBER` if not a member; `404` if the batch is absent.

---

## Module error codes

| HTTP | `code` | User-safe? |
|------|--------|-----------|
| 422 | `INVALID_SCOPE` | yes (admin UI) |
| 403 | `NOT_A_BATCH_MEMBER` | no |
