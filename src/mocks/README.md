# Mock API — temporary scaffolding

A dev-only stand-in for the platform API, implementing `api-contracts/` faithfully.

**The real backend already exists.** This is here only while it's unreachable, and is
built to be deleted without a trace.

## Enable

Add to `.env.local`:

```
VITE_USE_MOCKS=true
```

Then `npm run dev`. A console banner confirms it's active and lists the seeded logins.

Leave the variable out (the default) and the app talks to the real API through the Vite proxy,
exactly as it would in production.

## Seeded accounts

Password for all: `password123`

| Actor | Email | Role / notes |
|---|---|---|
| super-admin | `ops@licgrow.test` | bypasses all permission checks |
| staff-admin | `mentor@licgrow.test` | `mentor` — all 13 permissions |
| staff-admin | `co@licgrow.test` | `co_mentor` — no `batch:manage`, no `learner:suspend` |
| staff-admin | `viewer@licgrow.test` | `viewer` — read-only |
| learner | `priya@example.com` | no permissions |
| learner | `suspended@example.com` | returns 403 `ACCOUNT_SUSPENDED` |

Signing in as `viewer` and then trying to create a test is the quickest way to see
RBAC actually enforced server-side rather than just hidden in the UI.

## What it covers

The 24 endpoints that currently have client code:

- **auth** (6) — `01-auth.md`
- **rbac** (5) — `05-rbac.md`
- **test authoring** (13) — `09-test.md`

Anything else returns a 404 with a console warning naming the missing route.

## What it models faithfully

- `{ data }` / `{ data, meta }` envelopes and the `{ error: { code, message, details } }` shape
- Real 15-minute access-token expiry, so the client's refresh-and-retry path genuinely fires
- A token blocklist, so logout really does invalidate
- **No refresh-token rotation** — v1 doesn't rotate (`01-auth.md` §4), so the refresh response
  carries only `accessToken`, which is what makes the client's rotation-readiness a true no-op today
- RBAC enforced server-side, including the `:manage`/`:author` ⇒ `:read` implication
- Publish validation: `test-0002` has a question with no Hindi, so publishing it returns
  422 `TEST_NOT_PUBLISHABLE` with per-field `details`
- Strict schemas: unknown fields on create are rejected with 400
- `INVALID_CREDENTIALS` returned identically for unknown user, wrong password, and wrong
  actor type — no user enumeration

## Deliberate duplication

`db.js` and `guard.js` transcribe the permission catalog and the implication rule
**independently** from `05-rbac.md`, rather than importing
`src/app/features/auth/permissions.js`.

That is intentional. The mock is a test oracle, and an oracle that imports the code it
is checking cannot catch a mistake in it. If the two disagree, a real bug is surfacing.

## Removal

When the real API is reachable:

1. Delete `src/mocks/`
2. Remove the `VITE_USE_MOCKS` block from `src/main.jsx` (it's marked with a comment)
3. Remove `VITE_USE_MOCKS` from `.env.local`

No dependency to uninstall, no generated files, nothing else references it.

## Reusing the handlers as a conformance check

When the backend comes back, the handlers here are a written-down statement of what the
contracts say each endpoint does. Diffing real responses against them is the fastest way
to find where server and spec have drifted.
