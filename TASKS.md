# TASKS.md

Flat backlog for the single-task loop described in `LOOP.md`. `scripts/loop.sh`
always picks the first unchecked task, top to bottom — no priority or
dependency ordering yet.

Add tasks as one checkbox line each, e.g. a line reading `- [ ] <description>`.
The loop script checks a task off (`- [x]`) and appends its approved plan
underneath once it succeeds — see `LOOP.md`'s "Artifacts & lifecycle".

- [x] Scaffold a new Django backend project at `backend/` (sibling to the Next.js app) wired to PostgreSQL via Django REST Framework, per ARCHITECTURE.md's backend section: `psycopg`, settings split for local dev, a `requirements.txt` (or `pyproject.toml`), and a single health-check endpoint (`GET /api/health/` returning `{"status": "ok"}`) proving the app boots and connects to Postgres — no Book/Section models, no auth, and no frontend wiring yet.

  <details><summary>plan</summary>

  # Plan — Scaffold Django backend at `backend/`
  
  ## Goal
  Stand up a minimal, real Django + DRF + PostgreSQL project at `backend/` (sibling
  to the Next.js app), per `ARCHITECTURE.md`'s backend section. Deliverable is a
  booting app with one endpoint (`GET /api/health/` → `{"status": "ok"}`) that
  proves DB connectivity. No `Book`/`Section` models, no auth, no frontend wiring —
  those are separate `TASKS.md` items.
  
  ## Prerequisite: Python version
  System `python3` here is 3.9.6 (macOS Command Line Tools). Django's current
  stable release requires Python 3.10+. Implementation step 0 is installing a
  compatible interpreter (e.g. `brew install python@3.12`) and creating the
  venv with it — not the system `python3`. This is a one-time local dev-env
  fix, not a code change, but calling it out since `pip install django` will
  simply fail otherwise.
  
  ## Directory layout
  ```
  backend/
    manage.py
    requirements.txt
    .env.example
    .gitignore                # backend-specific ignores
    config/                    # Django project package (not an "app")
      __init__.py
      urls.py                  # root URLConf, mounts /api/health/
      wsgi.py
      asgi.py
      settings/
        __init__.py            # empty
        base.py                 # shared settings (INSTALLED_APPS, DRF, DB engine, etc.)
        local.py                 # DEBUG=True, dev DB defaults, imports base.*
    core/                       # small app for the health check
      __init__.py
      apps.py
      views.py                 # health_check view
      urls.py                  # /api/health/
      tests.py                 # smoke test for the endpoint
  ```
  Rationale: a tiny `core` app (rather than inlining the view in `config/`) gives
  the health endpoint a natural home and keeps `config/` as pure
  project-wiring, matching where `Book`/`Section` apps will land in the next task.
  
  ## Dependencies (`requirements.txt`)
  - `django`
  - `djangorestframework`
  - `psycopg[binary]` (per ARCHITECTURE.md — psycopg 3, not psycopg2)
  - `python-dotenv` (load `.env` for local dev secrets/DB config; avoids hand-rolling env parsing)
  
  ## Settings split
  - `base.py`: `INSTALLED_APPS` (`django.contrib.admin`, `auth`, `contenttypes`,
    `sessions`, `messages`, `staticfiles`, `rest_framework`, `core`), middleware,
    `ROOT_URLCONF = "config.urls"`, `DATABASES` built from env vars
    (`POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_HOST`,
    `POSTGRES_PORT`) via `os.environ.get(...)` with local-friendly defaults,
    `ENGINE = "django.db.backends.postgresql"` (psycopg 3 is used automatically
    as of Django 4.2+ when installed).
  - `local.py`: `from .base import *`, `DEBUG = True`, `ALLOWED_HOSTS = ["*"]`,
    `SECRET_KEY` from env with a dev fallback string.
  - `manage.py` sets `DJANGO_SETTINGS_MODULE` default to `config.settings.local`
    (only "local dev" split is needed now, per the task scope — no `production.py`
    yet).
  - `.env.example` documents `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`,
    `POSTGRES_HOST`, `POSTGRES_PORT`, `DJANGO_SECRET_KEY`.
  
  ## Health endpoint
  `core/views.py`: a DRF `@api_view(["GET"])` function that executes
  `connection.cursor().execute("SELECT 1")` (proving the Postgres connection is
  live) and returns `Response({"status": "ok"})`. An unhandled DB error surfaces
  as a 500 — no bespoke error handling needed for this minimal check.
  Mounted at `/api/health/` via `core/urls.py` included from `config/urls.py`.
  
  ## Tests
  `core/tests.py`: one DRF `APITestCase` hitting `GET /api/health/`, asserting
  `200` and body `{"status": "ok"}`. Requires a real Postgres connection to run
  (no mocking the DB per project convention elsewhere) — documented in a short
  note in the test file about needing local Postgres running.
  
  ## gitignore
  Add `backend/.gitignore` covering: `.venv/`, `__pycache__/`, `*.pyc`, `.env`,
  `*.sqlite3`, `staticfiles/`.
  
  ## Out of scope (explicitly, per task)
  - No `Book`/`Section`/`Value`/`Style` models or migrations.
  - No auth endpoints/session wiring beyond Django defaults.
  - No changes to `app/`, `components/`, or `lib/` — frontend is not wired to
    this backend yet.
  - No Celery.
  
  ## Verification (manual, part of implementation stage)
  1. `cd backend && python3.12 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt`
  2. Local Postgres running with a `storyseed_dev` DB matching `.env` defaults.
  3. `python manage.py migrate` (applies only Django's built-in tables — no app
     migrations yet since there are no models).
  4. `python manage.py runserver` then `curl localhost:8000/api/health/` →
     `{"status": "ok"}`.
  5. `python manage.py test core`.

  </details>

- [x] Define Django models for `Book` and `Section` (plus read-only reference models/fixtures for `Value` and `Style`) that mirror the shapes in `lib/types.ts`, with migrations, Django admin registration, and model-level tests — persistence only, no API endpoints or serializers yet, builds on the `backend/` scaffold from the previous task.

  <details><summary>plan</summary>

  # Plan — Django models for `Book`/`Section` (+ reference `Value`/`Style`)
  
  ## Goal
  Add persistence models mirroring `lib/types.ts`'s `Book`/`Section`/`ValueDef`/`StyleDef`
  shapes, on top of the `backend/` scaffold from the previous task. Migrations,
  Django admin registration, and model-level tests only — **no serializers, no
  DRF views/routes, no auth wiring**. Those are the next two `TASKS.md` items.
  
  ## New app: `backend/books/`
  The scaffold's `core` app stays infra-only (health check). Domain models get
  their own app, per the scaffold plan's note that `core` was kept minimal "matching
  where Book/Section apps will land in the next task."
  
  ```
  backend/books/
    __init__.py
    apps.py
    models.py          # Value, Style, Book, Section
    admin.py
    fixtures/
      values.json       # 9 ValueDef rows, copied verbatim from lib/data.ts VALUES
      styles.json        # 3 StyleDef rows, copied verbatim from lib/data.ts STYLES
    migrations/
      __init__.py
      0001_initial.py    # creates Value, Style, Book, Section tables
      0002_seed_reference_data.py  # RunPython: loaddata values.json + styles.json
    tests.py
  ```
  Register `"books"` in `INSTALLED_APPS` (`backend/config/settings/base.py`), after `"core"`.
  
  ## Models (`books/models.py`)
  
  **`Value`** — mirrors `ValueDef`. Reference table, 9 fixed rows.
  - `id`: `CharField(primary_key=True, max_length=30)` — slug (`"courage"`, …), matches frontend `valueId`.
  - `name`, `color` (hex `CharField(max_length=7)`), `short`, `desc` (`CharField`/`TextField`) — copied field-for-field from `ValueDef`.
  
  **`Style`** — mirrors `StyleDef`. Reference table, 3 fixed rows (`crayon`, `cutout`, `watercolor`).
  - `id`: `CharField(primary_key=True, max_length=20)`.
  - `name`, `desc`.
  
  **`Book`** — normalized persistence shape, not a 1:1 port of the frontend `Book` (per `ARCHITECTURE.md`: "DDD-ish translation, not 1:1 mirroring").
  - `id`: `UUIDField(primary_key=True, default=uuid.uuid4, editable=False)`. **Deviation from frontend** (frontend uses strings like `"seed-courage-0"`) — noted for the API task, which owns translating at the serializer boundary.
  - `value`: `ForeignKey(Value, on_delete=models.PROTECT, related_name="books")` — replaces frontend's redundant `valueId` + `value` (display name) pair; both are derivable from the FK.
  - `title`: `CharField(max_length=255)`.
  - `story_id`: `CharField(max_length=50)` — records which template story (`"forest"`/`"meadow"`/`"river"`) was chosen. **`StoryTemplate` itself is intentionally not modeled as a DB table**: `buildStories(valueName)` is a deterministic pure function of the value's name (interpolating `vl` into the copy), not standalone stored content, so there's nothing stable to persist beyond the chosen id — reconstructing full story text stays a frontend/reference-layer concern.
  - `style`: `ForeignKey(Style, on_delete=models.PROTECT, related_name="books")`.
  - `created_at` (`auto_now_add=True`), `updated_at` (`auto_now=True`) — standard audit fields, not in the frontend type but reasonable for a real persistence layer.
  - **Dropped vs. frontend `Book`:** `accent` (= `value.color`, would just drift) and `value` display name (= `value.name`) — both derivable from the FK, added back at the serializer layer if the API needs them flattened.
  - **Deliberately not added:** an `owner`/user FK. `PROJECT.md` implies per-account libraries eventually, but the auth task (last item in `TASKS.md`) is still just login/logout with a single seeded user — adding ownership now would be guessing at a shape that task hasn't decided. Flagging it there rather than deciding here.
  - `__str__` → `f"{self.title} ({self.value_id})"`.
  
  **`Section`** — mirrors `Section`, ordered pages within a `Book`.
  - `book`: `ForeignKey(Book, on_delete=models.CASCADE, related_name="sections")`.
  - `order`: `PositiveIntegerField()` — 0-indexed position; matches `book.sections[i]` in the frontend (the cover is `Book` itself, not a `Section`, so no off-by-one).
  - `image_desc`: `TextField()`, `text`: `TextField()`.
  - `Meta`: `ordering = ["order"]`, `constraints = [UniqueConstraint(fields=["book", "order"], name="unique_section_order_per_book")]`.
  
  ## Migrations
  - `0001_initial`: standard `makemigrations` output for all four models.
  - `0002_seed_reference_data`: `RunPython` calling `management.call_command("loaddata", "values.json")` / `"styles.json"` forward, and a matching reverse (`Value.objects.all().delete()` / `Style.objects.all().delete()`) so `migrate` alone seeds a fresh DB — no separate manual fixture-loading step needed for tests or local dev. Fixture content is transcribed verbatim from `lib/data.ts`'s `VALUES`/`STYLES` arrays (same colors, copy, and ids) since tests will assert against it exactly.
  
  ## Admin (`books/admin.py`)
  - `Value`, `Style`: registered as read-only reference data — `list_display` of their fields, and `has_add_permission`/`has_delete_permission`/`has_change_permission` overridden to return `False` (rows come from the fixture migration only).
  - `Book`: registered with a `SectionInline` (`TabularInline`, ordered by `order`) so pages are editable alongside the book; `list_display` on `title`, `value`, `style`, `created_at`.
  
  ## Tests (`books/tests.py`)
  Plain `TestCase`s (no DB mocking, per project convention) run against the real Postgres test DB, covering:
  1. Migration seeding: exactly 9 `Value` rows and 3 `Style` rows exist after `migrate`; spot-check a couple of exact field values (e.g. `Value.objects.get(pk="courage").color == "#2E6BFF"`, `Style.objects.get(pk="watercolor").name == "Soft Watercolor"`) against `lib/data.ts`.
  2. `Book` creation via FK to `Value`/`Style`; `__str__` output.
  3. `Section` ordering: creating sections out of order and asserting `book.sections.all()` comes back sorted by `order`.
  4. `UniqueConstraint`: two sections with the same `(book, order)` raises `IntegrityError`.
  5. Cascade delete: deleting a `Book` deletes its `Section`s; deleting a `Value`/`Style` that's still referenced by a `Book` raises `ProtectedError` (`PROTECT`).
  
  ## Out of scope (explicitly, per task)
  - No serializers, no DRF viewsets/routes, no `/api/books/` — next task.
  - No auth/ownership on `Book` — task after that.
  - No changes to `app/`, `components/`, or `lib/` — frontend still reads/writes `localStorage` via `lib/storage.ts` until a later task wires it to the API.
  - No changes to `core/`.
  
  ## Verification (manual, part of implementation stage)
  1. `cd backend && source .venv/bin/activate`
  2. `python manage.py makemigrations books` (confirm it matches the hand-planned `0001_initial`) then write `0002_seed_reference_data.py` by hand.
  3. `python manage.py migrate` → confirm no errors against local Postgres.
  4. `python manage.py shell -c "from books.models import Value, Style; print(Value.objects.count(), Style.objects.count())"` → `9 3`.
  5. `python manage.py test books`.
  6. `python manage.py createsuperuser` (or reuse existing) + `runserver`, spot-check `/admin/` shows `Book`/`Section`/`Value`/`Style` with `Value`/`Style` add/delete buttons disabled.

  </details>

- [ ] Add DRF serializers and REST endpoints (list/create/retrieve/update/delete) for `Book` under `/api/books/`, backed by the models from the previous task, matching the `Book`/`Section` JSON shape in `lib/types.ts` as closely as practical (note any deliberate deviations in the plan) — include DRF test coverage for each endpoint; the Next.js app is not wired to this API yet.
- [ ] Add minimal real authentication to the Django backend: session-based login/logout endpoints (`/api/auth/login/`, `/api/auth/logout/`) backed by Django's built-in auth with a single seeded dev user (no self-serve signup flow) — backend-only; the Next.js login page keeps its current simulated flow until a separate task wires it up.
