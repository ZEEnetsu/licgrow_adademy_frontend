# API Reference — Test Platform

**Base path:** `/api/v1` · All routes require `Authorization: Bearer <jwt>`

**Role legend:** `[admin]` `[student]` `[both]`

---

## Table of Contents

- [1. Tests — Admin](#1-tests--admin)
- [2. Questions — Admin](#2-questions--admin)
- [3. Tests — Student](#3-tests--student)
- [4. Submissions](#4-submissions)
- [5. Submission Analytics — Admin](#5-submission-analytics--admin)
- [6. Leaderboard](#6-leaderboard)
- [7. Courses — Admin](#7-courses--admin)
- [8. Batches — Admin](#8-batches--admin)
- [9. Courses — Student](#9-courses--student)

---

## 1. Tests — Admin

### `POST /admin/tests` · `[admin]`

Create a test (starts in `draft`).

**Request body**
```json
{
  "title": "string",
  "language": "Hindi | English",
  "durationMinutes": "number",
  "courseId": "string (optional)"

}
```

**Response `201`**
```json
{
  "testId": "uuid",
  "status": "draft",
  "createdAt": "timestamp"
}
```

---

### `GET /admin/tests` · `[admin]`

List all tests (paginated).

**Query params**
```
status?    "draft" | "live" | "closed"
courseId?  string
page       number
limit      number
```

**Response `200`**
```json
{
  "tests": [
    {
      "testId": "uuid",
      "title": "string",
      "language": "string",
      "status": "string",
      "questionCount": "number",
      "durationMinutes": "number"
    }
  ],
  "total": "number",
  "page": "number",
  "limit": "number"
}
```

---

### `GET /admin/tests/:testId` · `[admin]`

Get full test detail — includes the correct answer per question.

**Response `200`**
```json
{
  "testId": "uuid",
  "title": "string",
  "language": "string",
  "status": "string",
  "durationMinutes": "number",
  "questions": [
    {
      "questionId": "uuid",
      "text": "string",
      "correctOptionId": "uuid",
      "options": [
        { "optionId": "uuid", "text": "string", "position": "number" }
      ],
      "explanation": "string | null",
      "position": "number"
      //:: leave the explanation and position paert as of now, we'll deal with it later and could be done independently
    }
  ]
}
```

> ⚠️ `correctOptionId` is present here. Never use this serializer for student routes.

---

### `PATCH /admin/tests/:testId` · `[admin]`

Update test metadata — draft only.

**Request body**
```json
{
  "title": "string (optional)",
  "language": "Hindi | English (optional)",
  "durationMinutes": "number (optional)"
}
```

**Response `200`**
```json
{
  "testId": "uuid",
  "title": "string",
  "language": "string",
  "durationMinutes": "number"
}
```

- `422` if `status ≠ draft`

---

### `POST /admin/tests/:testId/publish` · `[admin]`

Publish test: `draft -> live`.

**Response `200`**
```json
{
  "testId": "uuid",
  "status": "live",
  "publishedAt": "timestamp"
}
```

- Fires `TestPublished` → notification push to all enrolled users
- `422` if `questionCount = 0` or `status ≠ draft`

---

### `POST /admin/tests/:testId/close` · `[admin]`

Close test: `live -> closed`.

**Response `200`**
```json
{
  "testId": "uuid",
  "status": "closed",
  "closedAt": "timestamp"
}
```

- 🔔 Fires `TestClosed` → leaderboard becomes visible to students
- `422` if `status ≠ live`

---

### `DELETE /admin/tests/:testId` · `[admin]`

Delete a test — draft only.

**Response `204`** — no body.

- `422` if `status ≠ draft`

---

## 2. Questions — Admin

> **Answer key design note:** `isCorrect` is not a field on options. The correct answer is stored separately (`question_answers` table: `question_id → correct_option_id`). On create/update, pass `correctOptionIndex` (0-based index into the `options` array you're sending). On read, the response returns `correctOptionId` (the UUID of the correct option).

---

### `POST /admin/tests/:testId/questions` · `[admin]`

Add a single question manually.

**Request body**
```json
{
  "text": "string",
  "options": [
    { "text": "string" },
    { "text": "string" }
  ],
  "correctOptionIndex": "number (0-based index into the options array above)",
  "explanation": "string (optional)"
}
```

- Min 2 options, max 4 options.

**Response `201`**
```json
{
  "questionId": "uuid",
  "text": "string",
  "correctOptionId": "uuid",
  "options": [
    { "optionId": "uuid", "text": "string", "position": "number" }
  ],
  "explanation": "string | null",
  "position": "number"
}
```

- `422` if test is not `draft`
- `422` if question count would exceed 50 (AR invariant)

---

### `POST /admin/tests/:testId/questions/import` · `[admin]`

Bulk import questions from a PDF.

**Request** — `multipart/form-data`
```
file       PDF  (max 10 MB)
language?  "Hindi" | "English"
```

**Response `200`**
```json
{
  "imported": "number",
  "skipped": "number",
  "questions": [
    {
      "questionId": "uuid",
      "text": "string",
      "correctOptionId": "uuid",
      "options": [{ "optionId": "uuid", "text": "string" }]
    }
  ],
  "warnings": ["string"]
}
```

- 🔔 Fires `QuestionImported`
- `422` if importing would push total past 50 — the entire import is rejected atomically (no partial saves)
- `422` if test is not `draft`

---

### `PUT /admin/tests/:testId/questions/:questionId` · `[admin]`

Update a question — draft only.

**Request body**
```json
{
  "text": "string (optional)",
  "options": [
    { "optionId": "uuid (omit for new options)", "text": "string" }
  ],
  "correctOptionIndex": "number (0-based, into the options array above — required if options are changed)",
  "explanation": "string | null (optional)"
}
```

**Response `200`**
```json
{
  "questionId": "uuid",
  "text": "string",
  "correctOptionId": "uuid",
  "options": [
    { "optionId": "uuid", "text": "string", "position": "number" }
  ],
  "explanation": "string | null"
}
```

- `422` if test is not `draft`
- Options without `optionId` are treated as new; existing `optionId`s are updated in place.

---

### `DELETE /admin/tests/:testId/questions/:questionId` · `[admin]`

Remove a question — draft only.

**Response `204`** — no body.

- `422` if test is not `draft`

---

## 3. Tests — Student

### `GET /tests` · `[student]`

List live tests accessible via the user's batch.

**Query params**
```
courseId?  string
page       number
limit      number
```

**Response `200`**
```json
{
  "tests": [
    {
      "testId": "uuid",
      "title": "string",
      "language": "string",
      "durationMinutes": "number",
      "questionCount": "number",
      "mySubmissionStatus": "in_progress | submitted | timed_out | null"
    }
  ],
  "total": "number"
}
```

- Only returns `live` tests the user's batch has access to. Never returns `draft` or `closed`.
- `mySubmissionStatus` is `null` if the user has not started the test yet.

---

### `GET /tests/:testId` · `[student]`

Get test with questions — no correct answer information present.

**Response `200`**
```json
{
  "testId": "uuid",
  "title": "string",
  "language": "string",
  "durationMinutes": "number",
  "questions": [
    {
      "questionId": "uuid",
      "text": "string",
      "position": "number",
      "options": [
        { "optionId": "uuid", "text": "string", "position": "number" }
      ]
    }
  ]
}
```

- `correctOptionId` must be absent. Use a dedicated student DTO — never the admin serializer.
- `403` if user's batch does not have access to this test.

---

## 4. Submissions

> **Naming note:** "Submission" replaces "Attempt" from the component diagram everywhere — routes, DB tables (`submissions`, `submission_answers`), domain types.

**Frontend flow for starting / resuming:**
1. `GET /tests/:testId/submission` first.
2. If `200` and `status = in_progress` → resume using returned answers.
3. If `404` → call `POST /tests/:testId/submission` to start fresh.
4. Never call `POST` without checking first — it will `409` on refresh.

---

### `POST /tests/:testId/submission` · `[student]`

Start a new submission.

**Response `201`**
```json
{
  "submissionId": "uuid",
  "status": "in_progress",
  "startedAt": "timestamp",
  "expiresAt": "timestamp"
}
```

- `409` if a submission already exists for this `(userId, testId)` — call `GET` first.
- `403` if user's batch does not grant access to this test.
- DB `UNIQUE (user_id, test_id)` enforces the one-submission invariant at DB level in addition to the domain check.

---

### `GET /tests/:testId/submission` · `[student]`

Get current submission state — used to resume.

**Response `200`**
```json
{
  "submissionId": "uuid",
  "status": "in_progress | submitted | timed_out",
  "startedAt": "timestamp",
  "expiresAt": "timestamp",
  "timeRemainingSeconds": "number",
  "answers": [
    { "questionId": "uuid", "selectedOptionId": "uuid" }
  ]
}
```

- `404` if no submission exists for this user + test.

---

### `PUT /tests/:testId/submission/answers` · `[student]`

Auto-save answers. Called periodically by the frontend (e.g. every 30 s).

**Request body**
```json
{
  "answers": [
    { "questionId": "uuid", "selectedOptionId": "uuid" }
  ]
}
```

**Response `200`**
```json
{
  "saved": true,
  "timeRemainingSeconds": "number"
}
```

- `422` if `status ≠ in_progress` or `expiresAt < NOW`.
- Saving after `timed_out` is explicitly rejected — do not accept stale saves.

---

### `POST /tests/:testId/submission/submit` · `[student]`

Finalize the submission: `in_progress → submitted`.

No request body — answers are already persisted via `PUT /answers`.

**Response `200`**
```json
{
  "submissionId": "uuid",
  "status": "submitted",
  "score": "number",
  "totalMarks": "number",
  "submittedAt": "timestamp"
}
```

- 🔔 Fires `SubmissionCreated` → `ScoringService` → `LeaderboardService` → `LeaderboardUpdated`
- `422` if `expiresAt < NOW` — checked atomically at DB level.
- `422` if `status ≠ in_progress` (already submitted or timed out).

---

### `GET /tests/:testId/submission/result` · `[student]`

Detailed result with per-question breakdown.

**Response `200`**
```json
{
  "submissionId": "uuid",
  "score": "number",
  "totalMarks": "number",
  "correctCount": "number",
  "wrongCount": "number",
  "unattemptedCount": "number",
  "timeTakenSeconds": "number",
  "answers": [
    {
      "questionId": "uuid",
      "selectedOptionId": "uuid | null",
      "correctOptionId": "uuid",
      "isCorrect": "boolean",
      "explanation": "string | null"
    }
  ]
}
```

- `403` if `status = in_progress` — result not available yet.
- `404` if no submission exists.

---

## 5. Submission Analytics — Admin

### `GET /admin/tests/:testId/submissions` · `[admin]`

List all submissions for a test.

**Query params**
```
status?  "in_progress" | "submitted" | "timed_out"
page     number
limit    number
```

**Response `200`**
```json
{
  "submissions": [
    {
      "submissionId": "uuid",
      "userId": "uuid",
      "name": "string",
      "score": "number | null",
      "status": "string",
      "submittedAt": "timestamp | null",
      "timeTakenSeconds": "number | null"
    }
  ],
  "total": "number"
}
```

---

## 6. Leaderboard

### `GET /tests/:testId/leaderboard` · `[both]`

Ranked leaderboard — visible only after the test is closed.

**Query params**
```
page   number
limit  number
```

**Response `200`**
```json
{
  "testId": "uuid",
  "total": "number",
  "myRank": "number | null",
  "ranks": [
    {
      "rank": "number",
      "userId": "uuid",
      "name": "string",
      "score": "number",
      "totalMarks": "number",
      "submittedAt": "timestamp",
      "timeTakenSeconds": "number"
    }
  ]
}
```

- `403` if `status = live` or `draft`. Leaderboard is only visible after `closed` — prevents score-peeking mid-test.

---

## 7. Courses — Admin

### `POST /admin/courses` · `[admin]`

Create a course.

**Request body**
```json
{
  "title": "string",
  "description": "string (optional)"
}
```

**Response `201`**
```json
{
  "courseId": "uuid",
  "title": "string",
  "createdAt": "timestamp"
}
```

---

### `GET /admin/courses` · `[admin]`

List all courses.

**Response `200`**
```json
{
  "courses": [
    {
      "courseId": "uuid",
      "title": "string",
      "testCount": "number",
      "batchCount": "number"
    }
  ]
}
```

---

### `GET /admin/courses/:courseId` · `[admin]`

Get course detail with tests and batches.

**Response `200`**
```json
{
  "courseId": "uuid",
  "title": "string",
  "tests": [
    { "testId": "uuid", "title": "string", "status": "string" }
  ],
  "batches": [
    { "batchId": "uuid", "name": "string", "memberCount": "number" }
  ]
}
```

---

### `PATCH /admin/courses/:courseId` · `[admin]`

Update course metadata.

**Request body**
```json
{
  "title": "string (optional)",
  "description": "string (optional)"
}
```

**Response `200`**
```json
{
  "courseId": "uuid",
  "title": "string",
  "description": "string | null"
}
```

---

### `POST /admin/courses/:courseId/tests` · `[admin]`

Attach a test to a course.

**Request body**
```json
{
  "testId": "uuid"
}
```

**Response `200`**
```json
{
  "courseId": "uuid",
  "testId": "uuid"
}
```

> ⚠️ **Schema decision pending:** does a test belong to exactly one course (FK on `tests`) or many (join table)? This endpoint's behaviour and the DB schema differ between the two. Resolve before building.

---

### `DELETE /admin/courses/:courseId/tests/:testId` · `[admin]`

Detach a test from a course.

**Response `204`** — no body.

- `422` if test is `live` — detaching mid-session breaks student access.

---

## 8. Batches — Admin

### `POST /admin/batches` · `[admin]`

Create a batch.

**Request body**
```json
{
  "name": "string",
  "courseId": "uuid (optional)"
}
```

**Response `201`**
```json
{
  "batchId": "uuid",
  "name": "string",
  "memberCount": 0
}
```

---

### `GET /admin/batches/:batchId` · `[admin]`

Get batch with members list.

**Response `200`**
```json
{
  "batchId": "uuid",
  "name": "string",
  "total": "number",
  "members": [
    { "userId": "uuid", "name": "string", "enrolledAt": "timestamp" }
  ]
}
```

---

### `POST /admin/batches/:batchId/members` · `[admin]`

Enroll users in a batch (bulk).

**Request body**
```json
{
  "userIds": ["uuid"]
}
```

**Response `200`**
```json
{
  "enrolled": "number",
  "alreadyMember": ["uuid"]
}
```

- 🔔 Fires `BatchEnrolled` for each newly added member.
- Partial success — newly added users are enrolled, already-enrolled IDs are returned in `alreadyMember`. The whole batch is never rejected.

---

### `DELETE /admin/batches/:batchId/members/:userId` · `[admin]`

Remove a user from a batch.

**Response `204`** — no body.

- `404` if the user is not a member of this batch.

---

## 9. Courses — Student

### `GET /courses` · `[student]`

List courses the user can access (via their batch membership).

**Response `200`**
```json
{
  "courses": [
    { "courseId": "uuid", "title": "string", "testCount": "number" }
  ]
}
```

---

### `GET /courses/:courseId` · `[student]`

Get course with live tests.

**Response `200`**
```json
{
  "courseId": "uuid",
  "title": "string",
  "tests": [
    {
      "testId": "uuid",
      "title": "string",
      "language": "string",
      "durationMinutes": "number",
      "mySubmissionStatus": "in_progress | submitted | timed_out | null"
    }
  ]
}
```

- Only `live` tests are included. `draft` and `closed` tests are excluded.