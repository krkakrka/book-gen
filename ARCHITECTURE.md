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

**Dependency policy:** track the latest stable major of each dependency above. When upgrading, bump in one change and fix whatever the compiler/tests surface — don't pin to an old major "to be safe."

## Structural decisions

- **No backend.** Books persist client-side only, in `localStorage` under `storyseed.books.v1`. There is no API layer and no database in this codebase — see `lib/storage.ts`. A future backend should preserve the `Book`/`Section` shape in `lib/types.ts` as its contract.
- **`lib/` is the reference layer, already implemented and not to be changed by feature work:**
  - `lib/types.ts` — `Book`, `Section`, `ValueDef`, `StyleDef`, `StoryTemplate` shapes.
  - `lib/data.ts` — the fixed set of values/stories/styles and `seedBooks()`.
  - `lib/storage.ts` — SSR-safe load/persist/upsert/delete helpers.
  - `lib/tokens.ts` — design tokens (colors, shadows, fonts); use these instead of hard-coded hex values.
- **`app/` (routes) and `components/StoryPage.tsx` are the implementation surface** — see `CLAUDE.md` for what's stubbed vs. done.
- **`@/*` path alias** maps to the repo root, configured identically in `tsconfig.json` and `jest.config.js`.
- **Routing is real** (`/login`, `/library`, `/book/[id]`, `/create`, `/edit/[id]`), not client-side view-state — this was a deliberate upgrade from the original HTML prototype, which used a single in-memory `view` variable.
- **No native app / backend auth** are in scope — see `PROJECT.md`'s "what's simulated vs. real" for the current boundary.
