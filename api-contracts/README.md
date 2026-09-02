# LIC IC-38 Platform — API Contracts

> **Audience:** Frontend engineers (web SPA now, mobile later) building against the platform API.
> **Status:** v1 draft. This is the source of truth until Swagger/OpenAPI is generated later.
> **Read [`00-conventions.md`](./00-conventions.md) first.** Every module doc assumes it.

## How to read these docs

Each module doc lists its endpoints. For every endpoint you get: the method + path, who can call it (actor + permission), the request (headers, path/query params, body — with **mandatory vs optional** marked), every possible response with its status code and body shape, the validation rules, and any rate-limit / idempotency / security notes that differ from the global defaults in `00-conventions.md`.

Anything not restated in a module doc follows the global convention. If a rule here disagrees with a module doc, **the module doc wins** for that endpoint (and it's a bug in the docs — flag it).

## Index

| # | Doc | Scope |
|---|-----|-------|
| 00 | [conventions](./00-conventions.md) | Cross-cutting rules: auth, response/error shape, validation, rate-limiting, idempotency, pagination, localization, security |
| 01 | [auth](./01-auth.md) | Login (all 3 actors), token refresh, logout, current-identity |
| 02 | [learner](./02-learner.md) | Learner register + self-service (profile, password); admin learner management |
| 03 | [staff-admin](./03-staff-admin.md) | Managing staff-admin accounts (provision, role, deactivate) |
| 04 | [super-admin](./04-super-admin.md) | Root accounts; bootstrap note |
| 05 | [rbac](./05-rbac.md) | Roles & the master permission catalog |
| 06 | [batch](./06-batch.md) | Batch CRUD, publish course/test into a batch, membership, learner arena |
| 07 | [enrollment](./07-enrollment.md) | Learner enrollment request → admin approve/reject → access grant |
| 08 | [course](./08-course.md) | Course → unit → chapter tree authoring + learner reading |
| 09 | [test](./09-test.md) | Unified test/quiz authoring, bilingual questions & options |
| 10 | [submission](./10-submission.md) | Learner attempts: start, resume, save, submit, score history, leaderboard |
| 11 | [announcement](./11-announcement.md) | Batch-scoped & global announcements |
| 12 | [notification](./12-notification.md) | In-app notification delivery: list, unread count, mark read |
| 13 | [analytics](./13-analytics.md) | Platform / batch / learner / test analytics |

## Actors (quick reference)

| Actor | Who | Auth endpoint | Token `type` |
|-------|-----|---------------|--------------|
| **learner** | End user training for the IC-38 exam | `POST /auth/login` | `learner` |
| **staff-admin** | Mentor / operator with RBAC-scoped powers | `POST /auth/admin/login` | `staff_admin` |
| **super-admin** | Root; provisions staff-admins, owns platform config | `POST /auth/ops/login` | `super_admin` |

## Conventions decisions baked into these docs (flag if you want changes)

These were chosen as v1 defaults and are cheap to change **only now**, before the set is complete:

- JSON bodies are **camelCase** (backend maps to/from snake_case DB internally).
- Success responses use an envelope `{ "data": ... }`; errors use `{ "error": { "code", "message", ... } }`.
- **400** = malformed / failed schema validation · **422** = well-formed but violates a business/state rule.
- Access token in `Authorization: Bearer`; refresh token returned in the login response body.
- Bilingual applies to **test/quiz questions + options only** (`Accept-Language: en | hi`); everything else is English-only in v1.
- Pagination is `?page=&limit=` (offset-style) with a `meta` block.

See `00-conventions.md` for the full rationale and exact shapes.
