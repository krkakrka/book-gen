# Storyseed

A children's picture-book creator & reader. Next.js (App Router) + React + TypeScript frontend, with a Django + DRF + PostgreSQL backend (`backend/`) for persistence and session auth.

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

## Backend

The Django project lives in `backend/`, as a sibling app directory to the Next.js frontend (not a monorepo tool). It requires a local PostgreSQL instance.

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate       # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env            # then adjust DB/dev-user credentials as needed
# create the Postgres role/db to match .env, e.g.:
#   createuser storyseed && createdb storyseed_dev -O storyseed

python manage.py migrate        # also seeds a dev user (see .env for email/password)
python manage.py runserver      # → http://localhost:8000
```

Key endpoints (mounted under `/api/`):

| Endpoint | What it does |
|---|---|
| `GET /api/health/` | DB connectivity check |
| `POST /api/auth/login/` | Session login (`email`, `password`) — seeded dev user from `.env` |
| `POST /api/auth/logout/` | Session logout |
| `/api/books/` | DRF `BookViewSet` (list/retrieve/create/update/delete) |
| `/admin/` | Django admin |

Run the backend test suite with `python manage.py test` from `backend/`.

`config.settings.local` (the default `DJANGO_SETTINGS_MODULE`, set in `manage.py`/`wsgi.py`/`asgi.py`) is dev-only: `DEBUG=True`, `ALLOWED_HOSTS=["*"]`, insecure cookie/secret-key fallbacks, and it seeds a weak-password dev user via migration. A real deployment must set `DJANGO_SETTINGS_MODULE=config.settings.production`, which requires `DJANGO_SECRET_KEY`, `DJANGO_ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, and `CSRF_TRUSTED_ORIGINS` to be set explicitly (raises at startup otherwise), forces secure cookies + HTTPS redirect/HSTS, and skips the dev-user seed.

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
