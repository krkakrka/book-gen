# TASKS.md

Flat backlog for the single-task loop described in `LOOP.md`. `scripts/loop.sh`
always picks the first unchecked task, top to bottom — no priority or
dependency ordering yet.

Add tasks as one checkbox line each, e.g. a line reading `- [ ] <description>`.
The loop script checks a task off (`- [x]`) and appends its approved plan
underneath once it succeeds — see `LOOP.md`'s "Artifacts & lifecycle".

- [ ] Scaffold a new Django backend project at `backend/` (sibling to the Next.js app) wired to PostgreSQL via Django REST Framework, per ARCHITECTURE.md's backend section: `psycopg`, settings split for local dev, a `requirements.txt` (or `pyproject.toml`), and a single health-check endpoint (`GET /api/health/` returning `{"status": "ok"}`) proving the app boots and connects to Postgres — no Book/Section models, no auth, and no frontend wiring yet.
- [ ] Define Django models for `Book` and `Section` (plus read-only reference models/fixtures for `Value` and `Style`) that mirror the shapes in `lib/types.ts`, with migrations, Django admin registration, and model-level tests — persistence only, no API endpoints or serializers yet, builds on the `backend/` scaffold from the previous task.
- [ ] Add DRF serializers and REST endpoints (list/create/retrieve/update/delete) for `Book` under `/api/books/`, backed by the models from the previous task, matching the `Book`/`Section` JSON shape in `lib/types.ts` as closely as practical (note any deliberate deviations in the plan) — include DRF test coverage for each endpoint; the Next.js app is not wired to this API yet.
- [ ] Add minimal real authentication to the Django backend: session-based login/logout endpoints (`/api/auth/login/`, `/api/auth/logout/`) backed by Django's built-in auth with a single seeded dev user (no self-serve signup flow) — backend-only; the Next.js login page keeps its current simulated flow until a separate task wires it up.
