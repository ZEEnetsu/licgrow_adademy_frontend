# 07 — Enrollment

A learner requests to join a **batch**; a staff-admin reviews it; on approval the learner becomes a batch member and gains access to everything published into that batch. Assumes [`00-conventions.md`](./00-conventions.md). Batch objects themselves are defined in [`06-batch.md`](./06-batch.md).

**State machine**
```
        submit                 approve
 (none) ─────────▶ pending ───────────────▶ approved   → learner is a batch member
                     │  reject
                     └───────────▶ rejected → learner may submit again (re-application allowed)
```
- One **active** request per (learner, batch): a `pending` or `approved` request blocks a new submit (**409**). A `rejected` request does **not** — re-application is allowed.
- Only `pending` requests can be approved/rejected. Acting on a finalized request is a **422** (except the idempotent no-op below).

**Endpoints**

| # | Method | Path | Actor | Permission | Rate tier | Idempotency |
|---|--------|------|-------|-----------|-----------|-------------|
| 1 | POST | `/enrollments` | learner | — | auth-register | **required** |
| 2 | GET | `/enrollments/me` | learner | — | standard | — |
| 3 | GET | `/enrollments/:enrollmentId` | learner | — (must own) | standard | — |
| 4 | GET | `/admin/enrollments` | staff-admin | `enrollment:review` | standard | — |
| 5 | GET | `/admin/enrollments/:enrollmentId` | staff-admin | `enrollment:review` | standard | — |
| 6 | POST | `/admin/enrollments/:enrollmentId/approve` | staff-admin | `enrollment:review` | standard | recommended |
| 7 | POST | `/admin/enrollments/:enrollmentId/reject` | staff-admin | `enrollment:review` | standard | recommended |

---

## 1. Submit an enrollment request  (learner)

`POST /api/v1/enrollments`

**Precondition:** the learner's profile must be complete (`licAgentCode`, `dob`, `city`, `experienceYears` — see [`02-learner.md`](./02-learner.md)). The request captures a **snapshot** of those profile fields for the reviewer; only per-application fields are sent in the body.

**Headers:** `Authorization: Bearer <learner access token>`, `Idempotency-Key: <uuid>` *(required)*

**Body**

| Field | Type | Req | Rules |
|-------|------|-----|-------|
| **`batchId`** | string (uuid) | ✅ | must reference a batch that is `open` for enrollment |
| `motivation` | string | ⬜ | 0–1000 chars; why they want to join (per-application, not stored on profile) |

```json
{ "batchId": "8f1c…", "motivation": "Preparing for the IC-38 exam this quarter." }
```

**Responses**

`201 Created`
```json
{
  "data": {
    "id": "e7a2…",
    "batchId": "8f1c…",
    "batchName": "IC-38 — Aug 2026 Cohort",
    "status": "pending",
    "motivation": "Preparing for the IC-38 exam this quarter.",
    "applicantSnapshot": { "licAgentCode": "LIC-4471", "city": "Pune", "experienceYears": 2 },
    "submittedAt": "2026-08-08T17:24:03Z",
    "reviewedAt": null,
    "reviewNote": null
  }
}
```

| Status | `code` | When |
|--------|--------|------|
| 400 | `VALIDATION_ERROR` | bad/missing `batchId`, oversize `motivation` |
| 400 | `IDEMPOTENCY_KEY_REQUIRED` | header missing |
| 403 | `ACCOUNT_SUSPENDED` | learner not active |
| 404 | `NOT_FOUND` | `batchId` doesn't exist |
| 409 | `ENROLLMENT_ALREADY_ACTIVE` | learner already has a `pending` or `approved` request for this batch |
| 422 | `PROFILE_INCOMPLETE` | required profile fields missing; `details` lists them |
| 422 | `BATCH_NOT_OPEN` | batch exists but isn't accepting enrollments |
| 429 | `RATE_LIMITED` | auth-register tier (5/hr/IP) |

---

## 2. List my enrollment requests  (learner)

`GET /api/v1/enrollments/me`

Returns the caller's own requests across all batches (most recent first).

**Query:** `status` *(optional: `pending|approved|rejected`)*, plus standard pagination.

`200 OK`
```json
{
  "data": [
    { "id": "e7a2…", "batchId": "8f1c…", "batchName": "IC-38 — Aug 2026 Cohort", "status": "approved", "submittedAt": "…", "reviewedAt": "…", "reviewNote": null }
  ],
  "meta": { "page": 1, "limit": 20, "total": 1, "totalPages": 1, "hasNext": false, "hasPrev": false }
}
```

Only `401`/`403` beyond the success case.

---

## 3. Get one of my requests  (learner)

`GET /api/v1/enrollments/:enrollmentId`

`200 OK` → same object shape as §1's `data`.

| Status | `code` | When |
|--------|--------|------|
| 404 | `NOT_FOUND` | id doesn't exist **or** belongs to another learner (existence is hidden — see conventions §10) |

---

## 4. List enrollment requests  (staff-admin)

`GET /api/v1/admin/enrollments`

The review queue. Defaults to newest first.

**Permission:** `enrollment:review`

**Query**

| Param | Req | Rules |
|-------|-----|-------|
| `batchId` | ⬜ | filter to one batch |
| `status` | ⬜ | `pending` (default view teams use) `\| approved \| rejected` |
| `sort` | ⬜ | `submittedAt:asc\|desc` (default `submittedAt:desc`) |
| `page`,`limit` | ⬜ | standard pagination |

`200 OK`
```json
{
  "data": [
    {
      "id": "e7a2…",
      "status": "pending",
      "batch": { "id": "8f1c…", "name": "IC-38 — Aug 2026 Cohort" },
      "learner": { "id": "b2ad…", "fullName": "Priya Sharma", "email": "priya@example.com" },
      "applicantSnapshot": { "licAgentCode": "LIC-4471", "city": "Pune", "experienceYears": 2 },
      "submittedAt": "2026-08-08T17:24:03Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 12, "totalPages": 1, "hasNext": false, "hasPrev": false }
}
```

`403 FORBIDDEN` if the admin lacks `enrollment:review`.

---

## 5. Get an enrollment request  (staff-admin)

`GET /api/v1/admin/enrollments/:enrollmentId`

`200 OK` → the full request incl. `learner`, `batch`, `applicantSnapshot`, `motivation`, review fields.

`404 NOT_FOUND` if it doesn't exist.

---

## 6. Approve a request  (staff-admin)

`POST /api/v1/admin/enrollments/:enrollmentId/approve`

Transitions `pending → approved` and **grants batch membership** (creates the learner's access to the batch's courses/tests) in one transaction.

**Permission:** `enrollment:review` · **Headers:** `Idempotency-Key: <uuid>` *(recommended)*

**Body:** none.

`200 OK`
```json
{
  "data": {
    "id": "e7a2…",
    "status": "approved",
    "batchId": "8f1c…",
    "learnerId": "b2ad…",
    "reviewedBy": "amit-admin-uuid",
    "reviewedAt": "2026-08-08T18:02:11Z",
    "membership": { "batchId": "8f1c…", "isActive": true, "grantedAt": "2026-08-08T18:02:11Z" }
  }
}
```

| Status | `code` | When |
|--------|--------|------|
| 403 | `FORBIDDEN` | missing permission |
| 404 | `NOT_FOUND` | no such request |
| 422 | `ENROLLMENT_ALREADY_FINALIZED` | request is `rejected` (can't approve) |
| 200 | *(idempotent no-op)* | request is already `approved` → returns current state (does not re-grant) |

---

## 7. Reject a request  (staff-admin)

`POST /api/v1/admin/enrollments/:enrollmentId/reject`

Transitions `pending → rejected`. The learner may re-apply afterward.

**Permission:** `enrollment:review`

**Body**

| Field | Type | Req | Rules |
|-------|------|-----|-------|
| `reviewNote` | string | ⬜ | 0–500 chars; shown to the learner as the rejection reason |

`200 OK` → the request with `status: "rejected"`, `reviewNote`, `reviewedBy`, `reviewedAt`.

| Status | `code` | When |
|--------|--------|------|
| 404 | `NOT_FOUND` | no such request |
| 422 | `ENROLLMENT_ALREADY_FINALIZED` | request is `approved` (can't reject an approved grant here — use batch member removal in `06-batch.md`) |
| 200 | *(idempotent no-op)* | already `rejected` → returns current state |

---

## Module error codes

| HTTP | `code` | User-safe? |
|------|--------|-----------|
| 409 | `ENROLLMENT_ALREADY_ACTIVE` | yes — "You already have a pending or approved request for this batch." |
| 422 | `PROFILE_INCOMPLETE` | yes — surface `details` fields to prompt profile completion |
| 422 | `BATCH_NOT_OPEN` | yes — "This batch isn't accepting enrollments right now." |
| 422 | `ENROLLMENT_ALREADY_FINALIZED` | yes (admin UI) |

## Frontend flow notes

- **Before submit:** check profile completeness (`GET /auth/me` + learner profile). If incomplete, route to the profile form — a submit would 422 anyway.
- **Submit** always with a fresh `Idempotency-Key`; on a network retry, reuse the **same** key so a double-tap can't create two requests.
- **After approval**, the learner's batch content unlocks; refetch the batch list / dashboard.
- **Reviewer queue:** poll or refetch `GET /admin/enrollments?status=pending`. Approve/reject are safe to retry (idempotent no-op on already-finalized-same-direction).
