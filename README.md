# LIC Grow — Frontend

Educational and testing platform for LIC agents and students.
React (plain JS) · TailwindCSS · React Router v6 · Redux Toolkit + RTK Query · Vite.

## Quick start

```bash
npm install
cp .env.example .env.local   # set VITE_API_TARGET to your backend URL
npm run dev
```

The dev server runs on `http://localhost:5173`. RTK Query uses **`/api/v1`**
by default; Vite proxies that prefix to `VITE_API_TARGET` **without** stripping,
so the backend receives paths like **`/api/v1/auth/register`** (see `vite.config.js`).
If your API is mounted at the host root (`/auth/register`), set in `.env.local`:
`VITE_API_PATH_PREFIX=/api` and `VITE_PROXY_STRIP_PREFIX=true`.

## Architecture

The onboarding pipeline maps directly to four DB tables:

| Table                  | Touch points in the app                                                                   |
| ---------------------- | ----------------------------------------------------------------------------------------- |
| `USERS`                | `/auth/login`, `/auth/register`, `/users/me` — backs `authSlice`                          |
| `COURSES`              | `getAvailableCourses` query rendered on `/register-course`                                |
| `ENROLLMENT_REQUESTS`  | `submitEnrollment` mutation; row created when student submits LIC agent code              |
| `COURSE_ASSIGNMENTS`   | Surfaces as `enrollment_status === 'APPROVED'` via `checkEnrollmentStatus` polling query  |

`enrollment_status` is the single field that drives the entire routing pipeline:

- `'NONE'`     — authenticated, no enrollment row → `/register-course`
- `'PENDING'`  — enrollment row exists, no assignment → `/pending-approval`
- `'APPROVED'` — assignment row exists → `/dashboard`

`ProtectedRoute` (`src/routes/ProtectedRoute.jsx`) is the only guard
component. It accepts `stage="public" | "intermediary" | "dashboard"` and
encodes the full decision matrix.

### Theming

Tailwind runs in `darkMode: 'class'`. Only `DashboardLayout` adds the `dark`
class to the document root — public and intermediary layouts always render
light. The transition between `/pending-approval` (light) and `/dashboard`
(dark) is masked by `ThemeTransitionOverlay`, which fades a full-screen panel
in/out for ~450ms whenever the route crosses the light↔dark boundary.

## File structure

```
licgrow/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env.example
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── components/
    │   └── ThemeTransitionOverlay.jsx
    ├── layouts/
    │   ├── PublicLayout.jsx          # Layout A — light, Dribbble-inspired
    │   ├── IntermediaryLayout.jsx    # Layout B — light, focused chrome
    │   └── DashboardLayout.jsx       # Layout C — dark, code-editor aesthetic
    ├── pages/
    │   ├── Landing.jsx               # /
    │   ├── Auth.jsx                  # /login + /register
    │   ├── CourseRegister.jsx        # /register-course
    │   ├── PendingApproval.jsx       # /pending-approval
    │   └── Dashboard.jsx             # /dashboard
    ├── routes/
    │   └── ProtectedRoute.jsx
    └── store/
        ├── store.js
        ├── authSlice.js
        └── apiSlice.js
```
