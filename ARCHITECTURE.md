# ARCHITECTURE.md

Technical stack and structural decisions for Storyseed. For *what* the product does, see `PROJECT.md`. For *how the agent should work*, see `CLAUDE.md`. For the visual spec, see `design/README.md`.

## Stack

| Layer | Choice | Version (see `package.json` for current) |
|---|---|---|
| Framework | Next.js, App Router | 16.x |
| UI | React | 19.x |
| Language | TypeScript | 6.x, `strict: true` |
| Package manager | pnpm | see `pnpm-lock.yaml` |
| Component tests | Jest + React Testing Library | 30.x / 16.x |
| E2E tests | Playwright | 1.x |
| Backend framework | Django | latest stable |
| API | Django REST Framework | latest stable |
| Database | PostgreSQL | latest stable |
| Task queue | Celery | **deferred** — not wired up until a real async job exists (e.g. illustration generation) |
| Backend auth | Django's built-in session auth | — |

**Dependency policy:** track the latest stable major of each dependency above. When upgrading, bump in one change and fix whatever the compiler/tests surface — don't pin to an old major "to be safe."

## Structural decisions

- **Backend: Django + DRF + PostgreSQL, real but minimal.** This reverses the project's original "no backend" prototype decision. Books move from `localStorage` to Postgres via a REST API. Auth becomes real (Django sessions) but minimal — a single seeded dev user, no self-serve signup flow yet. Celery is explicitly deferred; do not add it speculatively.
- **Repo layout:** the Django project lives in `backend/` at the repo root, as a sibling to the Next.js app — not a monorepo tool (Nx/Turborepo etc.), just two independent app directories for now.
- **Frontend/backend models are related but not identical (DDD-ish translation, not 1:1 mirroring).** `lib/types.ts`'s `Book`/`Section` shapes stay the contract for *rendering* on the frontend. Django's models are normalized for persistence and query needs, and may not match the frontend shape field-for-field. The DRF serializer layer at the API boundary is where translation happens; the frontend is expected to do light transformation when calling the API rather than assuming the wire format is identical to its view models.
- **`lib/storage.ts`'s transition off `localStorage` is an implementation task, not decided in full here.** Whether it becomes a thin API client, keeps a local cache layer, or is replaced outright is left to the task that wires the frontend to the new API — see `TASKS.md`.
- **`lib/` is the reference layer, already implemented and not to be changed by feature work:**
  - `lib/types.ts` — `Book`, `Section`, `ValueDef`, `StyleDef`, `StoryTemplate` shapes.
  - `lib/data.ts` — the fixed set of values/stories/styles and `seedBooks()`.
  - `lib/storage.ts` — SSR-safe load/persist/upsert/delete helpers.
  - `lib/tokens.ts` — design tokens (colors, shadows, fonts); use these instead of hard-coded hex values.
- **`app/` (routes) and `components/StoryPage.tsx` are the implementation surface** — see `CLAUDE.md` for what's stubbed vs. done.
- **`@/*` path alias** maps to the repo root, configured identically in `tsconfig.json` and `jest.config.js`.
- **Routing is real** (`/login`, `/library`, `/book/[id]`, `/create`, `/edit/[id]`), not client-side view-state — this was a deliberate upgrade from the original HTML prototype, which used a single in-memory `view` variable.
- **No native app / backend auth** are in scope — see `PROJECT.md`'s "what's simulated vs. real" for the current boundary.
