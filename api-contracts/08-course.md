# 08 — Course tree

Courses are **global, reusable** content authored as a tree: **course → units → chapters**, where each **chapter** carries an embedded **YouTube link** and a unit may optionally end in **one quiz**. Courses are published into batches ([`06-batch.md`](./06-batch.md)); learners read them through their batch. Assumes [`00-conventions.md`](./00-conventions.md).

```
course
 └─ unit (ordered by sequence)
     ├─ chapter (ordered; title + youtubeUrl + optional description)
     └─ …
     └─ quiz  (0 or 1 per unit — a test with kind="quiz", authored in 09-test.md, linked via unitId)
```

- **Course status:** `draft | published | archived`. Only `published` courses can be added to a batch ([`06`](./06-batch.md) §6). `archived` is read-only.
- **Ordering:** `sequence` (integer) is unique within a parent; reorder endpoints reassign it atomically.
- **Language:** English only (bilingual applies to test questions only — conventions §9). No `Accept-Language` handling here.
- **Quiz link:** a unit's quiz is created in the test module with `kind:"quiz"` + `unitId`; this module *surfaces* the link but doesn't create quizzes.

**Endpoints** — authoring is staff-admin (`course:author`/`course:read`); reading is learner (batch member).

| # | Method | Path | Actor | Permission |
|---|--------|------|-------|-----------|
| 1 | POST | `/admin/courses` | staff-admin | `course:author` |
| 2 | GET | `/admin/courses` | staff-admin | `course:read` |
| 3 | GET | `/admin/courses/:courseId` | staff-admin | `course:read` |
| 4 | PATCH | `/admin/courses/:courseId` | staff-admin | `course:author` |
| 5 | POST | `/admin/courses/:courseId/publish` | staff-admin | `course:author` |
| 6 | POST | `/admin/courses/:courseId/archive` | staff-admin | `course:author` |
| 7 | POST | `/admin/courses/:courseId/units` | staff-admin | `course:author` |
| 8 | PATCH | `/admin/courses/:courseId/units/:unitId` | staff-admin | `course:author` |
| 9 | DELETE | `/admin/courses/:courseId/units/:unitId` | staff-admin | `course:author` |
| 10 | PUT | `/admin/courses/:courseId/units/reorder` | staff-admin | `course:author` |
| 11 | POST | `/admin/courses/:courseId/units/:unitId/chapters` | staff-admin | `course:author` |
| 12 | PATCH | `/admin/courses/:courseId/units/:unitId/chapters/:chapterId` | staff-admin | `course:author` |
| 13 | DELETE | `/admin/courses/:courseId/units/:unitId/chapters/:chapterId` | staff-admin | `course:author` |
| 14 | PUT | `/admin/courses/:courseId/units/:unitId/chapters/reorder` | staff-admin | `course:author` |
| 15 | GET | `/me/batches/:batchId/courses/:courseId` | learner | — (member) |

---

## 1. Create a course  (`course:author`)

`POST /api/v1/admin/courses`

**Body**

| Field | Type | Req | Rules |
|-------|------|-----|-------|
| **`title`** | string | ✅ | 3–160 chars |
| `description` | string | ⬜ | 0–4000 chars |
| `examTarget` | string | ⬜ | e.g. `IC-38`; 0–40 chars |

`201 Created` → course, `status: "draft"`, empty `units: []`.

---

## 2–3. List / get courses  (`course:read`)

`GET /api/v1/admin/courses` — query `status`, `q`, pagination. `200 OK` → summaries `{ id, title, examTarget, status, unitCount, updatedAt }`.

`GET /api/v1/admin/courses/:courseId` — `200 OK` → the **full tree** (admin view):
```json
{
  "data": {
    "id": "c1", "title": "Life Insurance Basics", "examTarget": "IC-38", "status": "draft",
    "units": [
      {
        "id": "u1", "title": "Introduction", "sequence": 1,
        "chapters": [
          { "id": "ch1", "title": "What is Life Insurance", "youtubeUrl": "https://youtu.be/abc123", "description": null, "sequence": 1 }
        ],
        "quiz": { "id": "t9", "title": "Unit 1 Quiz", "kind": "quiz", "status": "published", "questionCount": 10 }
      }
    ]
  }
}
```
`quiz` is `null` when the unit has none. `404 NOT_FOUND` if the course doesn't exist.

---

## 4. Update course metadata  (`course:author`)

`PATCH /api/v1/admin/courses/:courseId` — fields `title`, `description`, `examTarget`. `200 OK` → updated course. `422 COURSE_ARCHIVED` if archived. `404` if absent.

---

## 5–6. Publish / archive a course  (`course:author`)

`POST …/publish` → `draft → published` (course becomes eligible to add to batches). Guard: **≥1 unit with ≥1 chapter**, else `422 EMPTY_COURSE`.
`POST …/archive` → `→ archived` (read-only; can't be newly added to batches; existing batch links keep working unless unpublished). Idempotent no-ops on repeat. `200 OK` → the course.

---

## 7–10. Units  (`course:author`)

**Add** `POST /admin/courses/:courseId/units` — body `{ "title": "…", "sequence"?: number }`. If `sequence` omitted, appended to the end. `201 Created` → the unit.

**Update** `PATCH …/units/:unitId` — body `{ "title": "…" }`. `200 OK`.

**Delete** `DELETE …/units/:unitId` — removes the unit and **its chapters** (cascade); if the unit has a quiz, the quiz's `unitId` is cleared (the test is not deleted). `204 No Content`.

**Reorder** `PUT …/units/reorder` — body `{ "orderedUnitIds": ["u2","u1","u3"] }` (must be exactly the course's current unit ids). Server reassigns `sequence` 1..N atomically. `200 OK` → the reordered unit list. `422 REORDER_SET_MISMATCH` if the id set doesn't match.

| Status | `code` | When (units) |
|--------|--------|------|
| 404 | `NOT_FOUND` | course/unit absent |
| 422 | `COURSE_ARCHIVED` | editing an archived course |
| 422 | `REORDER_SET_MISMATCH` | reorder ids ≠ current set |

---

## 11–14. Chapters  (`course:author`)

**Add** `POST …/units/:unitId/chapters`

| Field | Type | Req | Rules |
|-------|------|-----|-------|
| **`title`** | string | ✅ | 3–160 chars |
| **`youtubeUrl`** | string | ✅ | valid YouTube URL or 11-char video id; validated at the edge |
| `description` | string | ⬜ | 0–2000 chars |
| `sequence` | number | ⬜ | default = append |

`201 Created` → the chapter.

**Update** `PATCH …/chapters/:chapterId` — any of `title`, `youtubeUrl`, `description`. **Delete** `DELETE …/chapters/:chapterId` → `204`. **Reorder** `PUT …/units/:unitId/chapters/reorder` — body `{ "orderedChapterIds": [...] }`, same rules as unit reorder.

| Status | `code` | When (chapters) |
|--------|--------|------|
| 400 | `VALIDATION_ERROR` | bad `youtubeUrl` (fails the YouTube pattern) |
| 404 | `NOT_FOUND` | course/unit/chapter absent |
| 422 | `COURSE_ARCHIVED` | course archived |

---

## 15. Read a course  (learner · batch member)

`GET /api/v1/me/batches/:batchId/courses/:courseId`

Returns the course tree for a learner, **scoped to a batch they belong to** where the course is published. Same tree shape as the admin view, minus authoring-only fields; the per-unit `quiz` is surfaced as a reference the learner can launch via [`10-submission.md`](./10-submission.md).

```json
{
  "data": {
    "id": "c1", "title": "Life Insurance Basics",
    "units": [
      { "id": "u1", "title": "Introduction", "sequence": 1,
        "chapters": [ { "id": "ch1", "title": "What is Life Insurance", "youtubeUrl": "https://youtu.be/abc123", "description": null, "sequence": 1 } ],
        "quiz": { "id": "t9", "title": "Unit 1 Quiz", "kind": "quiz", "questionCount": 10, "myBestScorePct": 80 } }
    ]
  }
}
```

| Status | `code` | When |
|--------|--------|------|
| 403 | `NOT_A_BATCH_MEMBER` | caller isn't an active member of `:batchId` |
| 404 | `NOT_FOUND` | batch/course absent, or the course isn't published into this batch (existence hidden) |

> No answer keys ever appear in the course tree — a unit's `quiz` is only a reference (id, title, counts, the learner's own best score). Question content and correctness are governed entirely by the test/submission contracts.

---

## Module error codes

| HTTP | `code` | User-safe? |
|------|--------|-----------|
| 422 | `EMPTY_COURSE` | yes — "Add at least one unit with a chapter before publishing." |
| 422 | `COURSE_ARCHIVED` | yes |
| 422 | `REORDER_SET_MISMATCH` | yes (admin UI) |
| 403 | `NOT_A_BATCH_MEMBER` | no — treat as locked |

## Frontend flow notes

- **Authoring** is a VS-Code-folder-style tree: create course → add units → add chapters (paste YouTube link) → optionally attach a unit quiz (created in the test module with `unitId`) → publish → an admin adds the course to a batch (`06`).
- **Reordering** uses full-array `PUT …/reorder` (send every id in the new order), not per-item moves — simpler and race-free.
- **Learner** reaches a course only through `GET /me/batches/:batchId/courses/:courseId`; there's no global "open any course" route.
