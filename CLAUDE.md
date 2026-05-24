# Curriculum — AI Résumé & Cover Letter Workspace

A diploma project: authenticated, multi-user web app that generates AI-tailored résumés and cover letters from a saved profile.

## Architecture

Nx monorepo, two apps:

- **`backend/`** — NestJS 11. OpenAI (GPT-4.1, o3) for generation, PDFKit for rendering, Supabase Postgres for persistence. JWTs are verified against Supabase's JWKS endpoint (asymmetric publishable/secret key pair) via `jose`; no other auth state lives in the backend.
- **`frontend/`** — React 19 + Vite 6 + Tailwind 3, React Router 6, TanStack Query, `supabase-js` for auth + session storage. Talks to NestJS via Axios; never reads/writes the DB directly.

```
Browser → supabase.auth → JWT → Axios (Bearer) → NestJS (SupabaseAuthGuard) → Supabase Postgres
                                                              ↓
                                                         OpenAI / PDFKit
```

## App routes

| Route | Screen | Notes |
|-------|--------|-------|
| `/signin` | Sign In | Email + password (sign in / sign up tabs) and Google OAuth. Public. |
| `/onboarding` | 6-step profile intake | Personal → Skills → Experience → Education → Projects → Review. Forced for new users. |
| `/` | Documents home | Greeting + 2 CTAs + filterable doc grid (résumés + letters) with download / re-draft / delete per card. |
| `/resume` | Résumé wizard | Brief (target role, company, JD, creativity slider) → animated 5-stage Pipeline → Harvard-style Proof preview. State persisted in `sessionStorage`. |
| `/letter` | Cover Letter wizard | Brief (company, role, recipient salutation + optional contact name, JD, creativity slider) → 4-stage Pipeline → letterhead Proof. State persisted in `sessionStorage`. |
| `/profile` | Profile edit | Side-tabbed reuse of onboarding section components. Debounced autosave (~800 ms) with save-state indicator. |
| `/archive` | Stub | Placeholder, reserved for future. |

`<AuthGate mode="…">` wraps every route. Modes: `guest` (signed-in → `/`), `authed-any` (no session → `/signin`; used for onboarding), `authed` (no session → `/signin`; incomplete profile → `/onboarding`).

All authenticated routes render inside `<WorkspaceShell>`, which provides the off-canvas Sidebar, sticky TopAppBar, mobile bottom nav, and footer.

## Design system

Aesthetic: brutalist / editorial monochrome. **Inter** (sans), **JetBrains Mono** (mono), **Material Symbols Outlined** (icons). Hard borders, hard shadows (`shadow-[4px_4px_0_var(--ink)]`), grid-paper backgrounds, mono labels in uppercase tracking.

CSS variables on `<html>`:
- `--ink` — primary text/border
- `--paper` — primary background
- `--accent` — currently same as `--ink`; user-switchable via Tweaks panel
- `--border-weight` — 1–3 px
- `--font-sans`, `--font-mono` — switchable

Tailwind theme tokens (palette, type scale, spacing) extended in `tailwind.config.js`. Global CSS (folder tab clips, grid paper, marquee, blink, density variants, fade-in / check-pop animations) lives in `frontend/src/styles.css`.

**Mobile adaptive.** Sidebar collapses to an off-canvas drawer (`fixed left-0 -translate-x-full lg:translate-x-0`) controlled by `MobileMenuContext`. A 5-column `MobileBottomNav` (Docs / Résumé / Letter / Profile / More) is shown `lg:hidden`. TopAppBar swaps in a hamburger and stacks tabs below the header on mobile. Padding uses the `p-5 md:p-10` pattern throughout.

**Gotcha.** Tailwind doesn't expand hyphenated custom spacing value-keys (e.g. `margin-desktop: '40px'` does not generate a `px-margin-desktop` utility). Use the built-in scale (`px-10`, `p-10`) instead.

## Database schema

Three tables. RLS policy on each: "user can CRUD their own rows". Experience / education / skills live as JSON inside `profiles` to keep it simple.

- `profiles(user_id PK, full_name, title, email, phone, location, links jsonb, summary, skills text[], experience jsonb, education jsonb, personal_projects jsonb, onboarding_complete, updated_at)`
- `resumes(id PK, user_id FK, target_role, company, job_description, cv_json jsonb, created_at)`
- `cover_letters(id PK, user_id FK, company, role, job_description, body_text, edited_text, created_at)`

`profiles` rows are auto-created by a trigger on `auth.users` INSERT, and `updated_at` is maintained by a `touch_updated_at` trigger.

PDFs are regenerated on demand from `cv_json` / `body_text` — no Storage bucket. Each document type exposes a `GET /api/<resumes|cover-letters>/:id/pdf` endpoint that loads the row + profile and re-renders the PDF (no AI re-run).

Migrations live in `supabase/migrations/`:
- `0001_init.sql` — three tables, RLS, auto-create-profile + touch_updated_at triggers.
- `0002_personal_projects.sql` — adds `personal_projects jsonb default '[]'` to `profiles`.

Apply via Supabase Studio SQL editor or `supabase db push` (the linked project is `cv-creator` / `lpbczrhzlylkfcyyvtaq`).

## Environment variables

**Backend** (`backend/.env`):
```
OPENAI_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=   # the secret key (sb_secret_…) — bypasses RLS
PORT=3000
```

**Frontend** (`frontend/.env`):
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=      # the publishable key (sb_publishable_…)
VITE_API_URL=http://localhost:3000
```

The backend verifies JWTs against Supabase's JWKS endpoint (`<SUPABASE_URL>/auth/v1/.well-known/jwks.json`) using `jose` (`createRemoteJWKSet` + `jwtVerify`), so no shared `JWT_SECRET` is needed. This is the asymmetric publishable/secret key flow — the legacy HS256 path is not used.

## Backend conventions

- All authenticated controllers use the global `SupabaseAuthGuard`. `req.user = { id, email }` is populated from the JWT.
- DB access goes through `SupabaseService.serviceClient()` (service role; bypasses RLS — controllers must scope every query with `.eq('user_id', req.user.id)`).
- AI services (`backend/src/ai/`) take a `Profile` parameter rather than reading hardcoded constants. CV output uses a Harvard-style JSON shape: `{ summary, technicalStrengths, experience[], projects[], education[] }`. `inferYearsOfExperience` derives seniority from the profile's experience entries.
- One Nest module per domain: `profile`, `resumes`, `cover-letters`, `supabase`, `auth`. The legacy `job` and `ai` modules are kept as the generation entrypoints (`POST /api/job/cv`, `POST /api/job/cover-letter`); `resumes` / `cover-letters` modules handle persistence + retrieval + on-demand PDF render.

## Frontend conventions

- Screens live in `frontend/src/screens/`; one file per route.
- Shared chrome in `frontend/src/components/chrome/`: `Sidebar`, `TopAppBar`, `FooterBar`, `Icon`, `Tag`, `ToastStack`, `MobileBottomNav`, `MobileMenuContext`, `WorkspaceShell`.
- Profile section components in `frontend/src/components/profile/`: `PersonalSection`, `SkillsSection`, `ExperienceSection`, `EducationSection`, `PersonalProjectsSection`, `ReviewSection`, plus a `primitives.tsx` with the shared `inputCls`. The same `<ProfileSection id="…" />` dispatcher renders inside both the onboarding stepper and the `/profile` tab layout.
- Server state via TanStack Query (`useQuery`/`useMutation`); local state via `useState`. No global store.
- Reusable hooks in `src/lib/`:
  - `useAuth()` (auth.tsx) — session/user + `signInWith*` / `signUpWithPassword` / `signOut`. Axios interceptor in `src/lib/api.ts` attaches the JWT automatically.
  - `useProfileEditor()` — loads the profile, debounces autosave (~800 ms), exposes `saveState` (`idle | pending | saving | saved | error`) and `flush()` for explicit save points.
  - `useSessionState<T>(key, initial)` — `useState` mirrored to `sessionStorage`; backs wizard step persistence (keys prefixed `resume.` / `letter.`).
  - `usePipelineRun()` — gates the wizard's Proof step on `Promise.all([animation, apiCall])`. Uses a `startedRef` to survive React 18 StrictMode double-mount; no cancel/cleanup flag (it was the source of an earlier "second run skipped" bug).
  - `creativity.ts` — shared `creativityLabel` / `creativityHint` helpers used by both wizards' sliders.

## Streaming UX

The Pipeline step of each wizard does NOT real-stream from OpenAI. The real API call fires immediately; a fixed animation plays in parallel; the Proof step waits on `Promise.all([animation, api])` via `usePipelineRun`. Animation log messages are scripted, not LLM token output. This is a deliberate trade-off — single backend call, no SSE plumbing, deterministic timing.

Both wizards expose a single **creativity** slider (Very strict → Very creative, 0–100) instead of separate tone/length knobs. The slider value maps to a hint string injected into the prompt's `additionalComments`. The cover-letter wizard additionally takes a recipient salutation (Hiring Manager | Recruiter | Named contact | Team) and optional contact name, combined with the creativity hint via `combineLetterHint`.

## Common commands

```bash
yarn install
yarn dev               # both apps concurrently
yarn dev:backend       # backend only (:3000)
yarn dev:frontend      # frontend only (:4200)
yarn build:all
yarn lint
yarn test
```

## Adding a new screen

1. Add the file to `src/screens/`.
2. Add a `<Route>` in `src/app/app.tsx`. Wrap with `<AuthGate>` if authenticated.
3. Add a `<NavLink>` entry in `src/components/chrome/Sidebar.tsx` if it's part of the main nav.
4. Page-level layout: use `<TopAppBar />` at the top, normal content below, `<FooterBar />` rendered by the layout shell.

## What's intentionally NOT here

- Job tracker / kanban (replaced by Documents home).
- Manual CV form (removed in favor of AI wizard + profile-driven generation).
- Magic-link sign-in (only email/password + Google OAuth ship).
- `/templates` route — removed entirely. `/archive` remains as a stub.
- OpenAI streaming over SSE.
- A `documents` Storage bucket — PDFs are regenerated on demand.
- Profile preferences (salary, relocation, visa, sectors) from the design — they don't influence prompts.
- Tone / length controls in the wizards — collapsed into the single creativity slider.
- Tweaks panel UI (dark mode, accent, density, fonts). The CSS is wired (`body[data-mode="dark"]`, `body[data-density="…"]`), but no toggle UI ships. Adding one is straightforward — set the data attribute on `<body>` from a component and persist to `localStorage`.
