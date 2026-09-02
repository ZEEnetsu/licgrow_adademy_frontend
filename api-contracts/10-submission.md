# 10 — Submission (learner attempts)

The learner side of the assessment engine: start, resume, autosave, submit, review, and history for quizzes and tests. This is the highest-risk contract — read the invariants first. Assumes [`00-conventions.md`](./00-conventions.md); authoring is [`09-test.md`](./09-test.md).

## Invariants (enforced server-side, every endpoint)

1. **Access:** the learner must reach the test through a batch they're an **active member** of — a `kind=test` published into that batch, or a `kind=quiz` whose unit's course is published into that batch ([`06`](./06-batch.md)). Otherwise **403 `NOT_A_BATCH_MEMBER`** (test existence is otherwise hidden → **404**).
2. **Answer-key protection:** in-progress questions use the **`LearnerQuestion`** shape — `{ id, statement, options:[{id,text}] }` in the selected language, **no** `correctOptionId`, **no** `explanation`. Correct answers/explanations appear only in a **result** and only when the reveal policy allows.
3. **Reveal policy** (from `09`): `quiz → immediate` (full per-question review right after submit); `test → after_close` (score only until `availableUntil` passes, then full review).
4. **One active attempt** per (learner, test) at a time.
5. **Atomic state transitions** (no lost writes): submit and the timeout sweep use mutually-exclusive conditional updates (below).

## Attempt state machine
```
                POST …/attempts            POST …/submit
   (none) ─────────────────────▶ in_progress ───────────────▶ submitted   (scored)
                                     │
                                     │ timeout sweep (expiresAt < now)
                                     └───────────────────────▶ timed_out   (auto-scored from saved answers)
```
`submitted` and `timed_out` are terminal. Each attempt keeps its own row → **full score history** is retained across attempts.

**Endpoints** (learner; all require batch access)

| # | Method | Path | Idempotency | Rate tier |
|---|--------|------|-------------|-----------|
| 1 | GET | `/me/tests/:testId` | — | standard |
| 2 | GET | `/me/tests/:testId/attempts` | — | standard |
| 3 | POST | `/me/tests/:testId/attempts` | **required** | standard |
| 4 | GET | `/me/attempts/:attemptId` | — | standard |
| 5 | PUT | `/me/attempts/:attemptId/answers` | — | autosave |
| 6 | POST | `/me/attempts/:attemptId/submit` | **required** | standard |
| 7 | GET | `/me/tests/:testId/leaderboard` | — | standard |

---

## 1. Test overview  (learner)

`GET /api/v1/me/tests/:testId`

Everything the UI needs to render the pre-attempt screen. No questions here.

`200 OK`
```json
{
  "data": {
    "id": "t1", "kind": "test", "title": "Full Mock 1", "description": "…",
    "durationMinutes": 60, "totalMarks": 50, "passingMarks": 25,
    "maxAttempts": 2, "attemptsUsed": 1, "attemptsRemaining": 1, "cooldownMinutes": 0,
    "window": { "availableFrom": "2026-09-01T00:00:00Z", "availableUntil": "2026-09-07T23:59:59Z", "isOpen": true },
    "reviewPolicy": "after_close", "leaderboardEnabled": true, "leaderboardOpen": false,
    "myBestScorePct": 68,
    "activeAttemptId": null,
    "canStart": true,
    "startBlockedReason": null
  }
}
```
- `startBlockedReason` ∈ `null | "no_attempts_left" | "cooldown" | "window_closed" | "attempt_in_progress"` — lets the UI disable the button with a reason without a failed POST. `activeAttemptId` is set when one is in progress (resume it).
- For a `quiz`, `window`/`leaderboard*` are null/false and `reviewPolicy` is `immediate`.

`403 NOT_A_BATCH_MEMBER` / `404 NOT_FOUND` per invariant 1.

---

## 2. My attempt history  (learner)

`GET /api/v1/me/tests/:testId/attempts` → newest first.

`200 OK`
```json
{
  "data": [
    { "attemptId": "a2", "attemptNumber": 2, "status": "submitted", "score": 34, "totalMarks": 50, "percentage": 68, "passed": true, "startedAt": "…", "submittedAt": "…" },
    { "attemptId": "a1", "attemptNumber": 1, "status": "timed_out", "score": 22, "totalMarks": 50, "percentage": 44, "passed": false, "startedAt": "…", "submittedAt": null }
  ],
  "meta": { "…": "…" }
}
```

---

## 3. Start an attempt  (learner)

`POST /api/v1/me/tests/:testId/attempts`

**Headers:** `Authorization`, `Idempotency-Key: <uuid>` *(required)*, `Accept-Language: en|hi`.
**Body:** none.

Creates an attempt, snapshots question order (stable for resume), and sets `expiresAt` when timed.

`201 Created`
```json
{
  "data": {
    "attemptId": "a3", "testId": "t1", "attemptNumber": 3, "status": "in_progress",
    "startedAt": "2026-09-02T10:00:00Z", "expiresAt": "2026-09-02T11:00:00Z",
    "durationMinutes": 60, "timeRemainingSeconds": 3600, "contentLang": "en",
    "questions": [
      { "id": "q1", "sequence": 1, "marks": 1, "statement": "Which of these is a term plan feature?",
        "options": [ { "id": "o1", "text": "Maturity benefit" }, { "id": "o2", "text": "Pure risk cover" } ] }
    ]
  }
}
```

| Status | `code` | When |
|--------|--------|------|
| 400 | `IDEMPOTENCY_KEY_REQUIRED` | header missing |
| 403 | `NOT_A_BATCH_MEMBER` | access invariant |
| 404 | `NOT_FOUND` | test not visible to this learner |
| 409 | `ATTEMPT_IN_PROGRESS` | an attempt is already active — body includes `activeAttemptId`; the client should **GET** it (§4), not start again |
| 422 | `TEST_NOT_AVAILABLE` | outside `[availableFrom, availableUntil]` (tests) |
| 422 | `ATTEMPT_LIMIT_REACHED` | `attemptsUsed >= maxAttempts` |
| 422 | `COOLDOWN_ACTIVE` | last attempt too recent; body includes `retryAfterSeconds` |
| 422 | `TEST_NOT_PUBLISHED` | test is draft/archived |

> **Canonical flow (do this, always):** call `GET /me/tests/:testId` first. If `activeAttemptId` is set → **GET** that attempt to resume. Only `POST` a new attempt when there's no active one. This avoids the `409`.

---

## 4. Get / resume an attempt  (learner)

`GET /api/v1/me/attempts/:attemptId`

- **`in_progress`** → the `LearnerQuestion` list + the learner's **saved answers** + live `timeRemainingSeconds` (so a refresh/reconnect resumes exactly):
```json
{ "data": { "attemptId": "a3", "status": "in_progress", "timeRemainingSeconds": 2480, "contentLang": "en",
  "questions": [ { "id": "q1", "sequence": 1, "marks": 1, "statement": "…", "options": [ { "id": "o1", "text": "…" } ] } ],
  "savedAnswers": [ { "questionId": "q1", "selectedOptionId": "o2" } ] } }
```
- **`submitted` / `timed_out`** → the **result** (see §6 for the reveal rules; identical shape).

`403 NOT_YOUR_ATTEMPT` if the attempt belongs to another learner (existence hidden → `404`). `404 NOT_FOUND` otherwise.

---

## 5. Autosave answers  (learner)

`PUT /api/v1/me/attempts/:attemptId/answers`

Upserts one or more answers. Idempotent by nature (last write per question wins). Call it as the learner picks options.

**Body**
```json
{ "answers": [ { "questionId": "q1", "selectedOptionId": "o2" }, { "questionId": "q2", "selectedOptionId": null } ] }
```
`selectedOptionId: null` clears a previously-saved answer. Each `selectedOptionId` must belong to that question.

`200 OK` → `{ "data": { "savedCount": 2, "timeRemainingSeconds": 2470 } }`

| Status | `code` | When |
|--------|--------|------|
| 400 | `VALIDATION_ERROR` | option doesn't belong to the question |
| 422 | `ATTEMPT_NOT_ACTIVE` | attempt is `submitted`/`timed_out` |
| 422 | `ATTEMPT_EXPIRED` | `expiresAt` has passed (the sweep will/҃did mark it `timed_out`); frontend should show "time's up" and route to the result |

> The server enforces the same atomic `status='in_progress' AND expiresAt > now()` guard as submit — you cannot save onto an expired/finished attempt even if the sweep hasn't run yet.

---

## 6. Submit an attempt  (learner)

`POST /api/v1/me/attempts/:attemptId/submit`

**Headers:** `Idempotency-Key: <uuid>` *(required)*.
**Body** *(optional)*: `{ "answers": [ … ] }` — a final batch of answers applied before scoring (same shape as §5).

Atomic transition: `UPDATE … SET status='submitted' WHERE attemptId=$1 AND status='in_progress' AND expiresAt > now()`. If it affects 0 rows, the attempt was already terminal → the request is treated as idempotent (returns the existing result) unless it expired unsubmitted (→ `422 ATTEMPT_EXPIRED`, already scored as `timed_out`).

Scoring: `score = Σ marks of questions whose saved answer == correct option`. No negative marking (v1). `passed = score >= passingMarks`.

`200 OK` — **quiz (immediate reveal):**
```json
{
  "data": {
    "attemptId": "a3", "status": "submitted", "score": 8, "totalMarks": 10, "percentage": 80, "passed": true, "submittedAt": "…",
    "review": [
      { "questionId": "q1", "yourOptionId": "o2", "correctOptionId": "o2", "isCorrect": true, "explanation": "Term plans provide pure risk cover." }
    ]
  }
}
```

`200 OK` — **full test (after_close policy), before the window closes:**
```json
{
  "data": {
    "attemptId": "a3", "status": "submitted", "score": 34, "totalMarks": 50, "percentage": 68, "passed": true, "submittedAt": "…",
    "review": null,
    "reviewAvailableAt": "2026-09-07T23:59:59Z"
  }
}
```
After `reviewAvailableAt`, `GET /me/attempts/:attemptId` returns the same object with `review` populated (correct options + explanations).

| Status | `code` | When |
|--------|--------|------|
| 400 | `IDEMPOTENCY_KEY_REQUIRED` | header missing |
| 422 | `ATTEMPT_EXPIRED` | expired before submit (auto-scored as `timed_out`; fetch the result) |
| 403 | `NOT_YOUR_ATTEMPT` | not the caller's attempt (→ `404`) |

---

## 7. Leaderboard  (learner)

`GET /api/v1/me/tests/:testId/leaderboard`

Only for `kind=test` with `leaderboardEnabled=true`, and only **after** `availableUntil`. Ranked by each learner's **best** attempt.

`200 OK`
```json
{
  "data": {
    "testId": "t1", "closedAt": "2026-09-07T23:59:59Z",
    "top": [ { "rank": 1, "learnerName": "Priya S.", "bestScorePct": 92 }, { "rank": 2, "learnerName": "Amit K.", "bestScorePct": 88 } ],
    "me": { "rank": 14, "bestScorePct": 68 }
  }
}
```
Names are shown as first name + last initial (light privacy). 

| Status | `code` | When |
|--------|--------|------|
| 403 | `LEADERBOARD_LOCKED` | test still open, or `leaderboardEnabled=false`, or it's a quiz |
| 403 | `NOT_A_BATCH_MEMBER` | access invariant |

---

## Timeout sweep (server-side, no endpoint)

A scheduled job marks expired live attempts: `UPDATE … SET status='timed_out' WHERE status='in_progress' AND expiresAt < now()`, then scores them from saved answers. This is mutually exclusive with the submit guard (`expiresAt > now()`), so exactly one of submit/sweep wins a given attempt — no double-processing. Learners still receive a score for a timed-out attempt (via §2/§4).

## Content edited or unpublished mid-attempt

- A test is frozen at attempt start (question order snapshotted); question edits are blocked once attempts exist ([`09`](./09-test.md) §4).
- If an admin unpublishes/archives the test while an attempt is `in_progress`, that attempt may still be submitted (grace); no **new** attempts can start.

## Module error codes

| HTTP | `code` | User-safe? |
|------|--------|-----------|
| 409 | `ATTEMPT_IN_PROGRESS` | yes — resume via `activeAttemptId` |
| 422 | `TEST_NOT_AVAILABLE` | yes — show the window |
| 422 | `ATTEMPT_LIMIT_REACHED` | yes |
| 422 | `COOLDOWN_ACTIVE` | yes — show `retryAfterSeconds` |
| 422 | `ATTEMPT_EXPIRED` | yes — "Your time is up." |
| 422 | `ATTEMPT_NOT_ACTIVE` | yes |
| 403 | `LEADERBOARD_LOCKED` | yes — "Leaderboard opens when the test closes." |
| 403/404 | `NOT_YOUR_ATTEMPT` | no |

## Frontend flow notes

- **Start/resume:** `GET /me/tests/:testId` → if `activeAttemptId`, `GET /me/attempts/:id` to resume; else `POST …/attempts` with a fresh `Idempotency-Key`.
- **During:** autosave via `PUT …/answers` on each selection (autosave tier allows ~2/s); keep a local timer synced to `timeRemainingSeconds`.
- **Submit:** `POST …/submit` with an `Idempotency-Key`; a double-tap or retry returns the same result, never a second attempt.
- **On `ATTEMPT_EXPIRED` anywhere:** stop, fetch the attempt, show the (timed-out) result.
- **Quiz vs test UX:** quizzes show the full review instantly; tests show score now and unlock review + leaderboard after `reviewAvailableAt`/close.
