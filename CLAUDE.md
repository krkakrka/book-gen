# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Storyseed** — a children's picture-book creator & reader. For the product brief and use cases see `PROJECT.md`; for the tech stack and structural decisions see `ARCHITECTURE.md`.

This repo is a **tests-first "red-spec" harness**. The test suite (Jest + Playwright) is written and **failing on purpose**. The job is to implement `app/` and `components/` until the suite is green. **Do not weaken or edit tests to make them pass** — implement the behavior. The stable selector/behavior contract lives in `TEST_CONTRACT.md`; the visual/copy spec lives in `design/README.md`.

## SDLC

This project follows a spec-first SDLC (adapted from the "New SDLC with vibe coding" model — specs and evals drive implementation, rather than implementation driving specs). Concretely, for this repo:

1. **Requirements — already done.** `PROJECT.md` (product) and `TEST_CONTRACT.md` (behavior/selectors) are the spec. If either seems wrong or incomplete for what you're implementing, fix the doc in the same change rather than quietly diverging from it in code.
2. **Architecture — human-owned.** Stack and structural decisions live in `ARCHITECTURE.md`. Implement against it; if a task seems to require a different structural choice (new dependency, new data shape, dropping the "no backend" constraint), raise it rather than deciding unilaterally.
3. **Implementation — the actual task here.** Fill in `app/` and `components/` against `lib/` + `TEST_CONTRACT.md` + `design/README.md`. Guardrails: never edit `__tests__/`, `e2e/`, or `lib/` to make something pass; never rename a `data-testid` without updating its test in the same change.
4. **Testing/QA — the acceptance bar is green tests, not a manual demo.** `pnpm test`, `pnpm typecheck`, and `pnpm test:e2e` (in that order — see `scripts/loop.sh`) are the eval suite. A page that "looks right" but fails a test is not done.
5. **Review** — run `/code-review` on the diff before considering a change finished.
6. **Maintenance** — once a view's tests are green, its behavior is pinned; refactors are safe as long as the suite stays green.

## Commands

This project uses **pnpm** (see `pnpm-lock.yaml` / `pnpm-workspace.yaml`).

```bash
pnpm install
pnpm dev             # dev server → http://localhost:3000
pnpm test            # Jest component/unit tests (__tests__/)
pnpm test:watch      # Jest in watch mode
pnpm test StoryPage            # run a single Jest test file by name
pnpm test:e2e        # Playwright e2e (e2e/). First run: pnpm exec playwright install
pnpm test:e2e:ui     # Playwright interactive UI
pnpm test:e2e library          # run a single e2e spec by name
pnpm typecheck       # tsc --noEmit
pnpm lint            # next lint
pnpm build           # production build
```

Playwright auto-starts the dev server (`playwright.config.ts` `webServer`), so you don't need a server running for e2e.

### Agent loop

`scripts/loop.sh` drives one task at a time from `TASKS.md` — see `LOOP.md` for the full design. It plans first (writes `plan.md`), blocks on your approval before touching any code, then implements and iterates a bash-checked test loop (feeding failures back into the same resumed session) followed by a fresh-context code review (`review-result.json`), repeating until both are clean or `MAX_ITERS` is hit. It does not sweep the backlog or run unattended across multiple tasks — that's a deliberate v1 scope limit. `MAX_ITERS`, `CLAUDE_BIN`, `CLAUDE_MODEL`, and `SKIP_E2E=1` are env-var knobs. It uses `--dangerously-skip-permissions`, so run it only in a trusted working copy.

## Architecture

The codebase splits cleanly into **done** (reference data) and **to-implement** (UI):

- **`lib/` — DONE. Do not reimplement; import from here.** This is deterministic reference data the tests assert against verbatim.
  - `lib/types.ts` — `Book`, `Section`, `ValueDef`, `StyleDef`, `StoryTemplate`. The `Book`/`Section` shape is the contract a future API must honor.
  - `lib/data.ts` — `VALUES` (9), `STYLES` (3), `buildStories(valueName)`, `seedBooks()`, plus `valueById`/`styleName` helpers. Story/value copy here is asserted exactly by tests.
  - `lib/storage.ts` — `loadOrSeedBooks`, `persistBooks`, `upsertBook`, `deleteBookById`. SSR-safe (guards `window`).
  - `lib/tokens.ts` — design tokens (`COLORS`, `SHADOW(n)`, `HOVER_MOTION`, `FONTS`). **Use these instead of hard-coding hex values.**
- **`app/` — STUBS to implement.** App Router pages, each currently a one-line placeholder. Routes: `/` (redirects to `/login`), `/login`, `/library`, `/book/[id]` (reader), `/create`, `/edit/[id]`. Create and Edit are the same 5-step wizard in two modes.
- **`components/StoryPage.tsx` — STUB to implement.** A single presentational renderer for one book cover or one page, in 3 art styles. Used by the reader, library cards, and wizard steps 4–5. Note: its style prop is named **`variant`** (not `styleId`).
- **`__tests__/`** — Jest + React Testing Library component specs. **`e2e/`** — Playwright specs (login, library, reader, wizard).

### Data flow

`loadOrSeedBooks()` seeds 3 sample books on first load (`seed-courage-0`, `seed-kindness-1`, `seed-perseverance-2`). The wizard's accept action calls `upsertBook` + `persistBooks` then returns to the library. The reader renders the page list `[cover, ...book.sections]` — page index 0 is always the cover.

## Conventions & gotchas

- **`data-testid` values and accessible names are a fixed API.** `TEST_CONTRACT.md` is the source of truth for every selector and behavior; read it before implementing a view. If a testid genuinely must change, update the test in the same change.
- **`@/*` path alias** maps to the repo root (e.g. `@/lib/data`, `@/components/StoryPage`). Configured in both `tsconfig.json` and `jest.config.js`.
- **Client components:** anything using `localStorage`, `useState`, or navigation needs `"use client"`.
- **Wizard step gating** (Next disabled until valid): step 1 value selected · step 2 story chosen · step 3 ≥1 page AND every page has non-empty narrator text · step 4 style selected. Selecting a different value resets chosen story/sections/title; choosing a story sets the title and copies its sections.
- **Design files** (`design/design_files/*.dc.html`) are HTML prototypes to read for layout/copy/behavior, **not** code to port. `support.js` is prototype runtime — ignore it entirely.
- **Jest scope:** only `__tests__/**/*.test.{ts,tsx}` runs under Jest; `e2e/` is excluded from both Jest and `tsconfig.json`.
- **CI/Linux caveat:** `next/jest` uses the `@next/swc` native binary, which can `SIGBUS` in some constrained arm64 Linux sandboxes (fine on macOS). If hit, switch the Jest transform to `ts-jest`/`babel-jest`.
