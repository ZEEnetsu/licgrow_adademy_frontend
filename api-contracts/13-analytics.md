# 13 — Analytics

Read-only insight for admins: platform, batch, learner, and per-test analytics. All figures are computed from submissions/enrollments — no writes. Assumes [`00-conventions.md`](./00-conventions.md).

- Platform/batch/learner analytics require **`analytics:view`**.
- Per-test analytics require **`test:view_results`**.
- No learner-facing analytics endpoints in v1 (a learner sees their own scores via [`10-submission.md`](./10-submission.md); the leaderboard is there too).

**Endpoints** (staff-admin)

| # | Method | Path | Permission |
|---|--------|------|-----------|
| 1 | GET | `/admin/analytics/platform` | `analytics:view` |
| 2 | GET | `/admin/analytics/batches/:batchId` | `analytics:view` |
| 3 | GET | `/admin/analytics/learners/:learnerId` | `analytics:view` |
| 4 | GET | `/admin/tests/:testId/analytics/summary` | `test:view_results` |
| 5 | GET | `/admin/tests/:testId/analytics/score-distribution` | `test:view_results` |
| 6 | GET | `/admin/tests/:testId/analytics/question-performance` | `test:view_results` |

Common optional query: `from`, `to` (ISO dates) to bound time-based metrics; defaults to all-time.

---

## 1. Platform overview

`GET /api/v1/admin/analytics/platform`

`200 OK`
```json
{
  "data": {
    "learners": { "total": 1240, "active": 870, "suspended": 12 },
    "batches": { "total": 8, "active": 3, "archived": 5 },
    "content": { "courses": 14, "tests": 22, "quizzes": 61 },
    "enrollments": { "pending": 17, "approvedLast30d": 210 },
    "activity": { "attemptsLast30d": 3421, "avgScorePctLast30d": 64.2 }
  }
}
```

## 2. Batch analytics

`GET /api/v1/admin/analytics/batches/:batchId`

`200 OK`
```json
{
  "data": {
    "batchId": "8f1c…", "name": "IC-38 — Aug 2026 Cohort",
    "members": { "active": 120, "removed": 3 },
    "enrollmentFunnel": { "pending": 5, "approved": 120, "rejected": 8 },
    "content": { "courses": 3, "tests": 4 },
    "performance": { "avgScorePct": 66.5, "passRatePct": 58.0, "testCompletionPct": 72.0 },
    "engagement": { "activeLast7d": 88 }
  }
}
```
`404 NOT_FOUND` if the batch doesn't exist.

## 3. Learner analytics

`GET /api/v1/admin/analytics/learners/:learnerId`

`200 OK`
```json
{
  "data": {
    "learnerId": "b2ad…", "fullName": "Priya Sharma",
    "batches": [ { "batchId": "8f1c…", "name": "…" } ],
    "summary": { "testsAttempted": 6, "avgScorePct": 71.0, "passRatePct": 83.0, "lastActiveAt": "…" },
    "perTest": [ { "testId": "t1", "title": "Full Mock 1", "attempts": 2, "bestScorePct": 68, "passed": true } ]
  }
}
```
`404 NOT_FOUND` if no such learner.

---

## 4. Test summary  (`test:view_results`)

`GET /api/v1/admin/tests/:testId/analytics/summary`

`200 OK`
```json
{
  "data": {
    "testId": "t1", "title": "Full Mock 1", "kind": "test",
    "attempts": { "total": 340, "uniqueLearners": 210, "submitted": 300, "timedOut": 40 },
    "scores": { "avgPct": 64.2, "medianPct": 66.0, "passRatePct": 57.0 },
    "avgTimeTakenSeconds": 2870
  }
}
```

## 5. Score distribution  (`test:view_results`)

`GET /api/v1/admin/tests/:testId/analytics/score-distribution`

Histogram in fixed 10% buckets (best attempt per learner).
```json
{ "data": { "testId": "t1", "buckets": [ { "range": "0-9", "count": 3 }, { "range": "10-19", "count": 6 }, { "range": "…", "count": 0 }, { "range": "90-100", "count": 12 } ] } }
```

## 6. Question performance  (`test:view_results`)

`GET /api/v1/admin/tests/:testId/analytics/question-performance`

Per-question correct-rate — surfaces weak questions or bad distractors.
```json
{
  "data": {
    "testId": "t1",
    "questions": [
      { "questionId": "q1", "sequence": 1, "statementEn": "Which of these is a term plan feature?", "answered": 300, "correctPct": 71.0, "mostChosenWrongOptionId": "o3" }
    ]
  }
}
```

---

## Notes

- All endpoints return `403 FORBIDDEN` without the required permission and `404 NOT_FOUND` for missing `:batchId`/`:learnerId`/`:testId`.
- Figures use each learner's **best** attempt unless noted (e.g. `attempts.total` counts all attempts). "Completion" = learners with ≥1 submitted attempt ÷ eligible members.
- v1 computes these on-read from the submissions tables. If volume grows, a materialized/rollup layer can back the same contracts unchanged.
