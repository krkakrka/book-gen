# Storyseed

A children's picture-book creator & reader. Next.js (App Router) + React + TypeScript. No backend — books persist in the browser's `localStorage`.

## Getting started

```bash
pnpm install
pnpm dev             # → http://localhost:3000
```

```bash
pnpm test            # Jest component/unit tests
pnpm test:e2e        # Playwright e2e (first run: pnpm exec playwright install)
pnpm typecheck
pnpm lint
pnpm build
```

## Project status

This repo is a **tests-first "red-spec" harness**: the test suite is written and intentionally failing, and the task is implementing `app/` and `components/` until it's green. See `CLAUDE.md` for the full agent-facing instructions and SDLC.

## Docs

| Doc | What's in it |
|---|---|
| [`PROJECT.md`](./PROJECT.md) | Product brief — use cases, audience, scope, roadmap |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Tech stack, versions, structural decisions |
| [`design/README.md`](./design/README.md) | Visual language, design tokens, screen-by-screen spec |
| [`TEST_CONTRACT.md`](./TEST_CONTRACT.md) | The fixed `data-testid`/behavior contract the tests assert against |
| [`CLAUDE.md`](./CLAUDE.md) | Instructions for Claude Code / agents working in this repo, including the SDLC |
