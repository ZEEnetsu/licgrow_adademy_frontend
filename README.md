# licgrow

Recruitment site and learning portal for licgrow. React · Tailwind CSS · Framer Motion · Vite.

## Quick start

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## What's included

**Public site** (bilingual Hindi / English, `src/i18n/`)

- `src/pages/home/` — the landing page: a scrolling story in chapters (`content.js` holds its copy)
- `src/pages/site/` — Bima Sakhi, Benefits, Procedure, Career and the long-form pages, rendered from `src/content/generated/*.json`
- `src/pages/apply/`, `src/pages/contact/` — orientation sign-up and contact forms (UI only; see `src/components/forms/submitLead.js`)
- `src/components/` — `AcademyNav.jsx` (header) with `nav/`, plus `motion/`, `ui/`, `content/` (renderer for the generated JSON), `forms/`, `auth/` (sign-in / sign-up shell)
- `src/pages/Login.jsx`, `src/pages/Register.jsx` — sign-in and sign-up

**Content pipeline** — the client's reference site `src/pages/site/index.html` is turned into `src/content/generated/` by the scripts in `scripts/` (images: `src/pages/site/assets/` → `public/site-assets/`).

**App** — `src/pages/Admin/` and `src/pages/student/` behind `RequireAuth`, with the API layer in `src/app/`. `src/mocks/` serves the API locally while `VITE_USE_MOCKS=true` (see `src/mocks/README.md`).
