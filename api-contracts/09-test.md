# 09 — Test / Quiz authoring

One engine serves both **quizzes** (attached to a course unit, for practice) and **full-length tests** (published into a batch, exam-style). They differ only by a `kind` flag and config, not by mechanism. This doc is the **authoring** side (staff-admin); learners attempt via [`10-submission.md`](./10-submission.md). Assumes [`00-conventions.md`](./00-conventions.md).

## Model

| Field | Type | Notes |
|-------|------|-------|
| `id` | uuid | |
| `kind` | `quiz \| test` | immutable after create |
| `unitId` | uuid \| null | **required** when `kind=quiz` (the owning unit); **must be null** when `kind=test` |
| `title` | string | |
| `description` | string \| null | |
| `durationMinutes` | int \| null | `null` = untimed (typical for quizzes); timed only meaningful for tests |
| `totalMarks` | int | **computed** = Σ question marks (read-only) |
| `passingMarks` | int | author-set; `0 ≤ passingMarks ≤ totalMarks` |
| `maxAttempts` | int \| null | **required in the create payload** — `null` = unlimited, or an integer ≥ 1. No implicit default. |
| `cooldownMinutes` | int | ≥ 0; min gap between a learner's attempts (default 0) |
| `shuffleQuestions` | boolean | default false |
| `availableFrom` / `availableUntil` | timestamp \| null | **tests only**; the exam window |
| `leaderboardEnabled` | boolean | **tests only**; default false; leaderboard opens after `availableUntil` |
| `reviewPolicy` | `immediate \| after_close` | **derived**, read-only: `quiz → immediate`, `test → after_close` |
| `status` | `draft \| published \| archived` | |

**`kind` constraints (enforced):** `quiz` ⇒ `unitId` set, `availableFrom/Until` null, `leaderboardEnabled` false. `test` ⇒ `unitId` null. Violations → `422 INVALID_TEST_CONFIG`.

## Bilingual questions & answer-key protection

- Every **question** and every **option** carries **English + Hindi** text (conventions §9). `explanation` is optional and may be one or both languages.
- Exactly **one** correct option per question (single-choice).
- **Two response shapes, never mixed:**
  - **`AdminQuestion`** (this doc): both languages, `correctOptionId`, `explanation` — for authors.
  - **`LearnerQuestion`** ([`10`](./10-submission.md)): selected language only, options are `{ id, text }` — **no** `correctOptionId`, **no** `explanation` (until reveal rules allow). This is a contract guarantee.

**Endpoints** (staff-admin)

| # | Method | Path | Permission |
|---|--------|------|-----------|
| 1 | POST | `/admin/tests` | `test:author` |
| 2 | GET | `/admin/tests` | `test:read` |
| 3 | GET | `/admin/tests/:testId` | `test:read` |
| 4 | PATCH | `/admin/tests/:testId` | `test:author` |
| 5 | DELETE | `/admin/tests/:testId` | `test:author` |
| 6 | POST | `/admin/tests/:testId/publish` | `test:author` |
| 7 | POST | `/admin/tests/:testId/archive` | `test:author` |
| 8 | POST | `/admin/tests/:testId/questions` | `test:author` |
| 9 | GET | `/admin/tests/:testId/questions` | `test:read` |
| 10 | GET | `/admin/tests/:testId/questions/:questionId` | `test:read` |
| 11 | PATCH | `/admin/tests/:testId/questions/:questionId` | `test:author` |
| 12 | DELETE | `/admin/tests/:testId/questions/:questionId` | `test:author` |
| 13 | PUT | `/admin/tests/:testId/questions/reorder` | `test:author` |

---

## 1. Create a test/quiz  (`test:author`)

`POST /api/v1/admin/tests`

**Body**

| Field | Type | Req | Rules |
|-------|------|-----|-------|
| **`kind`** | `quiz\|test` | ✅ | immutable |
| `unitId` | uuid | cond. | required if `kind=quiz`; forbidden if `kind=test` |
| **`title`** | string | ✅ | 3–160 |
| `description` | string | ⬜ | 0–2000 |
| `durationMinutes` | int | ⬜ | ≥1; omit/null = untimed |
| **`passingMarks`** | int | ✅ | ≥0 (validated ≤ totalMarks at publish) |
| **`maxAttempts`** | int \| null | ✅ | ≥1, or `null` for unlimited — **must be present** |
| `cooldownMinutes` | int | ⬜ | ≥0, default 0 |
| `shuffleQuestions` | bool | ⬜ | default false |
| `availableFrom` / `availableUntil` | timestamp | ⬜ | tests only; `until > from` |
| `leaderboardEnabled` | bool | ⬜ | tests only; default false |

`201 Created` → the test, `status: "draft"`, `totalMarks: 0`.

| Status | `code` | When |
|--------|--------|------|
| 400 | `VALIDATION_ERROR` | bad/missing fields incl. missing `maxAttempts` |
| 404 | `NOT_FOUND` | `unitId` doesn't exist (quiz) |
| 422 | `INVALID_TEST_CONFIG` | `kind`/`unitId`/window/leaderboard combination violates the constraints above |
| 409 | `UNIT_QUIZ_EXISTS` | that unit already has a quiz (max one per unit) |

---

## 2–3. List / get  (`test:read`)

`GET /admin/tests` — query `kind`, `status`, `unitId`, `courseId` (via unit), `q`, pagination. `200 OK` → summaries `{ id, kind, title, status, totalMarks, questionCount, updatedAt }`.

`GET /admin/tests/:testId` — `200 OK` → full metadata + `questionCount` (questions fetched via §9). `404` otherwise.

---

## 4. Update metadata  (`test:author`)

`PATCH /admin/tests/:testId` — any config field except `kind`. `200 OK`.

| Status | `code` | When |
|--------|--------|------|
| 422 | `TEST_HAS_ATTEMPTS` | test has recorded attempts — only non-scoring fields (`title`, `description`, `availableUntil` extension) are editable; structural/scoring changes are blocked (clone instead) |
| 422 | `INVALID_TEST_CONFIG` | broken constraint |
| 422 | `PASSING_EXCEEDS_TOTAL` | `passingMarks > totalMarks` |

---

## 5. Delete  (`test:author`)

`DELETE /admin/tests/:testId` → `204`. Allowed only when `status=draft` **and** zero attempts; else `422 TEST_NOT_DELETABLE` (archive instead).

---

## 6. Publish  (`test:author`)

`POST /admin/tests/:testId/publish` → `draft → published`.

**Publish validation (all must pass, else `422 TEST_NOT_PUBLISHABLE` with `details`):**
- ≥ 1 question.
- every question has **both** `en` + `hi` for the statement and **every** option.
- every question has exactly one correct option.
- `0 ≤ passingMarks ≤ totalMarks`.
- `kind=test` intended for a batch must still be added to a batch separately ([`06`](./06-batch.md)); `kind=quiz` becomes visible to learners whose batch includes the unit's course.

`200 OK` → the published test.

## 7. Archive  (`test:author`)

`POST /admin/tests/:testId/archive` → `archived` (no new attempts; existing history retained; auto-removed from batches on archive). Idempotent. `200 OK`.

---

## 8. Add questions  (`test:author`)

`POST /admin/tests/:testId/questions` — add one or many (atomic: all or nothing).

**Body**
```json
{
  "questions": [
    {
      "marks": 1,
      "statement": { "en": "Which of these is a term plan feature?", "hi": "इनमें से कौन सा टर्म प्लान की विशेषता है?" },
      "explanation": { "en": "Term plans provide pure risk cover.", "hi": "…" },
      "options": [
        { "text": { "en": "Maturity benefit", "hi": "…" } },
        { "text": { "en": "Pure risk cover",   "hi": "…" } },
        { "text": { "en": "Guaranteed bonus",  "hi": "…" } },
        { "text": { "en": "Loyalty addition",  "hi": "…" } }
      ],
      "correctIndex": 1
    }
  ]
}
```

**Rules per question:** `marks` ≥ 1; 2–6 `options`; `correctIndex` in range; drafts may omit `hi` (completeness enforced at publish), but `en` statement + `en` for each option are required even in draft.

`201 Created` → the created questions in `AdminQuestion` shape (server-assigned `id`, `sequence`, and `options[].id`, plus `correctOptionId`). `totalMarks` on the test is recomputed.

| Status | `code` | When |
|--------|--------|------|
| 400 | `VALIDATION_ERROR` | bad shape, `correctIndex` out of range, <2 options |
| 404 | `NOT_FOUND` | test doesn't exist |
| 422 | `TEST_HAS_ATTEMPTS` | can't alter questions once attempts exist |

---

## 9–10. List / get questions  (`test:read`) — Admin shape

`GET /admin/tests/:testId/questions` → `200 OK`
```json
{
  "data": [
    {
      "id": "q1", "sequence": 1, "marks": 1,
      "statement": { "en": "…", "hi": "…" },
      "explanation": { "en": "…", "hi": "…" },
      "options": [ { "id": "o1", "text": { "en": "…", "hi": "…" } }, { "id": "o2", "text": { "en": "…", "hi": "…" } } ],
      "correctOptionId": "o2"
    }
  ]
}
```
`GET …/questions/:questionId` → single `AdminQuestion`. Both include `correctOptionId` + `explanation` (admin only).

## 11. Update a question  (`test:author`)

`PATCH /admin/tests/:testId/questions/:questionId` — update `marks`, `statement`, `explanation`, option texts (by option `id`), or move the correct answer (`correctOptionId`). Adding/removing options replaces the option set (send full `options`). `200 OK` → updated `AdminQuestion`. `422 TEST_HAS_ATTEMPTS` if attempts exist.

## 12. Delete a question  (`test:author`)

`DELETE …/questions/:questionId` → `204`. Recomputes `totalMarks`. `422 TEST_HAS_ATTEMPTS` if attempts exist.

## 13. Reorder questions  (`test:author`)

`PUT /admin/tests/:testId/questions/reorder` — body `{ "orderedQuestionIds": [...] }` (exact current set). `200 OK`. `422 REORDER_SET_MISMATCH` on mismatch.

---

## Module error codes

| HTTP | `code` | User-safe? |
|------|--------|-----------|
| 422 | `INVALID_TEST_CONFIG` | yes (admin UI) |
| 409 | `UNIT_QUIZ_EXISTS` | yes — "This unit already has a quiz." |
| 422 | `TEST_NOT_PUBLISHABLE` | yes — surface `details` (missing translations, no correct option, etc.) |
| 422 | `TEST_HAS_ATTEMPTS` | yes — "This test has attempts; clone it to make changes." |
| 422 | `PASSING_EXCEEDS_TOTAL` | yes |
| 422 | `TEST_NOT_DELETABLE` | yes |
| 422 | `REORDER_SET_MISMATCH` | yes |

## Frontend flow notes (authoring)

- **Quiz:** create with `kind:"quiz"` + `unitId` → add bilingual questions → publish → it appears under that unit for members of any batch the course is in.
- **Full test:** create with `kind:"test"` (+ optional window/duration/leaderboard) → add questions → publish → **add it to a batch** (`06` §8) to make it live.
- The author UI should build the `AdminQuestion` shape (both languages, one correct option) and rely on publish validation to catch incompleteness — drafts can be saved half-translated.
