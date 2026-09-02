# 06 — Batch

The **batch** is the learner's arena (a cohort, "like a semester"). Courses and tests are authored **globally** and *published into* batches; a learner gains access to that content by being an **approved member** of the batch. Assumes [`00-conventions.md`](./00-conventions.md).

**Core relationships**
```
batch ──< batch_courses >── course     (a course can be published to many batches)
batch ──< batch_tests   >── test       (a full-length test can be published to many batches)
batch ──< batch_members >── learner    (membership granted on enrollment approval)
batch ──< announcements                (batch-scoped; see 11-announcement.md)
```
**Access invariant (enforced everywhere):** a learner may read/attempt content only if it is published into a batch they are an **active member** of. Referenced by course, test, and submission docs; violations return **403 `NOT_A_BATCH_MEMBER`** (or **404** where existence is privileged).

**Lifecycle:** `status ∈ draft | active | archived`, plus an independent `enrollmentOpen` boolean.
- `draft` — admin is setting it up; invisible to learners.
- `active` — visible to members; content live. Enrollment is accepted only when `enrollmentOpen = true`.
- `archived` — read-only; no new enrollment; content still viewable by existing members (configurable later).

**Endpoints**

| # | Method | Path | Actor | Permission |
|---|--------|------|-------|-----------|
| 1 | POST | `/admin/batches` | staff-admin | `batch:manage` |
| 2 | GET | `/admin/batches` | staff-admin | `batch:read` |
| 3 | GET | `/admin/batches/:batchId` | staff-admin | `batch:read` |
| 4 | PATCH | `/admin/batches/:batchId` | staff-admin | `batch:manage` |
| 5 | POST | `/admin/batches/:batchId/archive` | staff-admin | `batch:manage` |
| 6 | POST | `/admin/batches/:batchId/courses` | staff-admin | `batch:manage` |
| 7 | DELETE | `/admin/batches/:batchId/courses/:courseId` | staff-admin | `batch:manage` |
| 8 | POST | `/admin/batches/:batchId/tests` | staff-admin | `batch:manage` |
| 9 | DELETE | `/admin/batches/:batchId/tests/:testId` | staff-admin | `batch:manage` |
| 10 | GET | `/admin/batches/:batchId/members` | staff-admin | `batch:read` |
| 11 | DELETE | `/admin/batches/:batchId/members/:learnerId` | staff-admin | `batch:manage` |
| 12 | GET | `/batches/available` | learner | — |
| 13 | GET | `/me/batches` | learner | — (member) |
| 14 | GET | `/me/batches/:batchId` | learner | — (member) |

---

## 1. Create a batch  (`batch:manage`)

`POST /api/v1/admin/batches`

**Body**

| Field | Type | Req | Rules |
|-------|------|-----|-------|
| **`name`** | string | ✅ | 3–120 chars |
| `description` | string | ⬜ | 0–2000 chars |
| **`startDate`** | string (date) | ✅ | `YYYY-MM-DD` |
| **`endDate`** | string (date) | ✅ | `YYYY-MM-DD`, ≥ `startDate` |
| `enrollmentOpen` | boolean | ⬜ | default `false` |

`201 Created` → the batch (starts `status: "draft"`).
```json
{ "data": { "id": "8f1c…", "name": "IC-38 — Aug 2026 Cohort", "description": "…", "status": "draft", "enrollmentOpen": false, "startDate": "2026-08-15", "endDate": "2026-11-15", "counts": { "courses": 0, "tests": 0, "members": 0 }, "createdBy": "amit-uuid", "createdAt": "…" } }
```

| Status | `code` | When |
|--------|--------|------|
| 400 | `VALIDATION_ERROR` | bad dates (`endDate < startDate`), bad name |
| 403 | `FORBIDDEN` | missing `batch:manage` |

---

## 2–3. List / get batches  (`batch:read`)

`GET /api/v1/admin/batches` — query: `status`, `enrollmentOpen`, `q` (name search), standard pagination. `200 OK` → paginated batch summaries (incl. `counts`).

`GET /api/v1/admin/batches/:batchId` — `200 OK` → full batch incl. `counts` and `status`; `404 NOT_FOUND` otherwise.

---

## 4. Update a batch  (`batch:manage`)

`PATCH /api/v1/admin/batches/:batchId`

Partial update. Fields: `name`, `description`, `startDate`, `endDate`, `status` (`draft→active` transition; `→archived` via §5 only), `enrollmentOpen`.

`200 OK` → updated batch.

| Status | `code` | When |
|--------|--------|------|
| 400 | `VALIDATION_ERROR` | bad field(s) |
| 404 | `NOT_FOUND` | no such batch |
| 422 | `INVALID_STATUS_TRANSITION` | e.g. `archived → active`, or activating a batch with zero published content (guard) |
| 422 | `BATCH_ARCHIVED` | editing an archived batch |

> Setting `enrollmentOpen: true` requires `status: active` (you can't open enrollment on a draft). Attempting it → `422 INVALID_STATUS_TRANSITION`.

---

## 5. Archive a batch  (`batch:manage`)

`POST /api/v1/admin/batches/:batchId/archive`

Sets `status: archived`, forces `enrollmentOpen: false`. `200 OK` → the batch. Idempotent no-op if already archived. `404` if not found.

---

## 6–9. Publish / unpublish content into a batch  (`batch:manage`)

**Publish a course:** `POST /api/v1/admin/batches/:batchId/courses` — body `{ "courseId": "…" }`.
**Publish a test:** `POST /api/v1/admin/batches/:batchId/tests` — body `{ "testId": "…" }`.

`201 Created` → `{ "data": { "batchId": "…", "courseId": "…", "publishedAt": "…" } }` (or `testId`).

| Status | `code` | When |
|--------|--------|------|
| 404 | `NOT_FOUND` | batch, course, or test doesn't exist |
| 409 | `ALREADY_PUBLISHED` | that course/test is already in this batch |
| 422 | `CONTENT_NOT_PUBLISHED` | the course/test is still `draft` (only `published` content can go into a batch) |

**Unpublish:** `DELETE …/courses/:courseId` · `DELETE …/tests/:testId` → `204 No Content`. Removing a course/test **revokes member access** to it but retains historical attempt/score data. `404` if the link doesn't exist. `GET` variants (`GET …/courses`, `GET …/tests`) list what's published (paginated, `batch:read`).

> Unpublishing a test that has **in-progress** attempts: those attempts are allowed to finish (grace); no new attempts can start. Noted again in [`10-submission.md`](./10-submission.md).

---

## 10–11. Members  (`batch:read` / `batch:manage`)

`GET /api/v1/admin/batches/:batchId/members` — paginated `{ learnerId, fullName, email, isActive, joinedAt }`. Members are added **only** via enrollment approval ([`07-enrollment.md`](./07-enrollment.md)) — there is no direct "add member" API in v1.

`DELETE /api/v1/admin/batches/:batchId/members/:learnerId` — revokes membership (`isActive:false`); the learner loses access to the batch's content but keeps their history. `204 No Content`; `404` if not a member.

---

## 12. Browse batches open for enrollment  (learner)

`GET /api/v1/batches/available`

Discovery list a learner uses to find a batch to join. Returns batches with `status: active` and `enrollmentOpen: true`, annotated with the caller's own enrollment status for each.

`200 OK`
```json
{
  "data": [
    { "id": "8f1c…", "name": "IC-38 — Aug 2026 Cohort", "description": "…", "startDate": "2026-08-15", "endDate": "2026-11-15",
      "myEnrollmentStatus": null }
  ],
  "meta": { "…": "…" }
}
```
`myEnrollmentStatus` ∈ `null | "pending" | "approved" | "rejected"` — lets the UI show "Request to join" vs "Pending" vs "Enrolled".

---

## 13–14. My batches  (learner · member)

`GET /api/v1/me/batches` — batches the caller is an **active member** of. `200 OK` → summaries `{ id, name, startDate, endDate, counts: { courses, tests } }`.

`GET /api/v1/me/batches/:batchId` — the **arena dashboard** for one batch: batch info + published courses (summaries) + published tests (summaries with the learner's own attempt status) + recent/pinned announcements.
```json
{
  "data": {
    "id": "8f1c…", "name": "IC-38 — Aug 2026 Cohort", "startDate": "…", "endDate": "…",
    "courses": [ { "id": "c1", "title": "Life Insurance Basics", "unitCount": 6 } ],
    "tests":   [ { "id": "t1", "title": "Full Mock 1", "kind": "test", "durationMinutes": 60, "myStatus": "not_started", "myBestScorePct": null } ],
    "announcements": [ { "id": "a1", "title": "Batch starts Monday", "isPinned": true, "publishedAt": "…" } ]
  }
}
```

| Status | `code` | When |
|--------|--------|------|
| 403 | `NOT_A_BATCH_MEMBER` | caller isn't an active member (or `404` if you prefer to hide existence — this endpoint uses **403**) |
| 404 | `NOT_FOUND` | batch doesn't exist |

---

## Module error codes

| HTTP | `code` | User-safe? |
|------|--------|-----------|
| 409 | `ALREADY_PUBLISHED` | yes (admin UI) |
| 422 | `CONTENT_NOT_PUBLISHED` | yes — "Publish the course/test before adding it to a batch." |
| 422 | `INVALID_STATUS_TRANSITION` | yes (admin UI) |
| 403 | `NOT_A_BATCH_MEMBER` | no — treat as "content locked" |

## Frontend flow notes

- **Learner discovery → enrollment:** `GET /batches/available` → "Request to join" calls `POST /enrollments` (`07`). On approval, the batch appears in `GET /me/batches`.
- **Learner arena:** `GET /me/batches/:batchId` is the dashboard; drill into a course via `08-course.md`, a test via `10-submission.md`.
- **Admin setup order:** create batch (draft) → publish courses/tests into it → set `active` + `enrollmentOpen`. Activating with zero content is blocked (`422`).
