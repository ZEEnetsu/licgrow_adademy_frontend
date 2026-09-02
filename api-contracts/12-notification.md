# 12 — Notifications

In-app notification delivery. Notifications are **system-generated** on domain events (enrollment decisions, new announcements, new content, etc.) — there is no client "create notification" endpoint in v1. Recipients are **learners** or **staff-admins**; each reads their own. Assumes [`00-conventions.md`](./00-conventions.md). English only.

## Model

| Field | Type | Notes |
|-------|------|-------|
| `id` | uuid | |
| `type` | enum | see catalog |
| `title` | string | |
| `body` | string | |
| `relatedEntityType` | string \| null | e.g. `enrollment`, `announcement`, `test`, `batch` |
| `relatedEntityId` | uuid \| null | for client-side deep-linking |
| `isRead` | boolean | |
| `readAt` | timestamp \| null | |
| `createdAt` | timestamp | |

### Type catalog (extensible)

| `type` | Recipient | Fired when |
|--------|-----------|-----------|
| `ENROLLMENT_REQUESTED` | staff-admin | a learner submits an enrollment request |
| `ENROLLMENT_APPROVED` | learner | request approved |
| `ENROLLMENT_REJECTED` | learner | request rejected |
| `ANNOUNCEMENT_POSTED` | learner | an announcement targets their batch (or global) |
| `TEST_PUBLISHED` | learner | a test/quiz is added to their batch |
| `COURSE_PUBLISHED` | learner | a course is added to their batch |

> Delivery is best-effort and **never blocks** the triggering action (the notification service swallows and logs its own failures). Treat missing notifications as non-fatal.

**Endpoints** (any authenticated actor; each sees only their own)

| # | Method | Path | Rate tier |
|---|--------|------|-----------|
| 1 | GET | `/me/notifications` | standard |
| 2 | GET | `/me/notifications/unread-count` | standard |
| 3 | POST | `/me/notifications/:id/read` | standard |
| 4 | POST | `/me/notifications/read-all` | standard |

---

## 1. List  (any actor)

`GET /api/v1/me/notifications`

**Query:** `isRead` (`true|false`), `type`, standard pagination (newest first).

`200 OK`
```json
{
  "data": [
    { "id": "n1", "type": "ENROLLMENT_APPROVED", "title": "You're in!", "body": "Your enrollment for IC-38 — Aug 2026 Cohort was approved.",
      "relatedEntityType": "batch", "relatedEntityId": "8f1c…", "isRead": false, "readAt": null, "createdAt": "…" }
  ],
  "meta": { "…": "…" }
}
```

## 2. Unread count  (any actor)

`GET /api/v1/me/notifications/unread-count` → `200 OK` `{ "data": { "unread": 3 } }`. Cheap; safe to poll for a badge.

## 3. Mark one read  (any actor)

`POST /api/v1/me/notifications/:id/read` → `200 OK` `{ "data": { "id": "n1", "isRead": true, "readAt": "…" } }`.

| Status | `code` | When |
|--------|--------|------|
| 404 | `NOT_FOUND` | not the caller's notification (existence hidden) |
| 200 | *(idempotent)* | already read |

## 4. Mark all read  (any actor)

`POST /api/v1/me/notifications/read-all` → `200 OK` `{ "data": { "markedRead": 3 } }`.

---

## Frontend flow notes

- **Badge:** poll `unread-count` (cheap) on an interval; fetch the list when the tray opens.
- **Deep-link:** use `relatedEntityType` + `relatedEntityId` to route (e.g. `batch` → the arena; `enrollment` → the request).
- **No realtime in v1** (polling only); a push/websocket channel is a later enhancement and won't change these shapes.
