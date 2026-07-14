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

- [x] Add DRF serializers and REST endpoints (list/create/retrieve/update/delete) for `Book` under `/api/books/`, backed by the models from the previous task, matching the `Book`/`Section` JSON shape in `lib/types.ts` as closely as practical (note any deliberate deviations in the plan) — include DRF test coverage for each endpoint; the Next.js app is not wired to this API yet.

  <details><summary>plan</summary>

  # Plan — DRF serializers & REST endpoints for `Book` under `/api/books/`
  
  ## Goal
  Expose `Book`/`Section` (from `backend/books/models.py`, done in the prior task) over
  a REST API — list/create/retrieve/update/delete on `/api/books/` — with DRF test
  coverage. Wire format follows `lib/types.ts`'s `Book`/`Section` shapes as closely as
  practical; deliberate deviations are called out below. **No frontend changes** —
  `lib/storage.ts` keeps reading/writing `localStorage` until a later wiring task.
  
  ## Wire shape and deviations from `lib/types.ts`
  
  Response shape per book:
  ```json
  {
    "id": "3fa8...uuid",
    "valueId": "courage",
    "value": "Courage",
    "accent": "#2E6BFF",
    "title": "Pip and the Whispering Forest",
    "storyId": "forest",
    "styleId": "crayon",
    "sections": [
      { "imageDesc": "...", "text": "..." }
    ]
  }
  ```
  - `value` (display name) and `accent` (hex) are read-only, derived from the `Value`
    FK (`source="value.name"` / `source="value.color"`) — present in the response for
    parity with the frontend `Book` type, but not accepted on write.
  - `valueId` / `styleId` are the write inputs (`PrimaryKeyRelatedField(source="value")`
    / `source="style"`), matching the frontend's naming (not Django's `value`/`style`).
  - `id`: **deviation** — a UUID string, not `lib/data.ts`'s seed-style ids
    (`"seed-courage-0"`). Already flagged in the models-task plan; frontend must treat
    `id` as an opaque string either way, so no further translation needed here.
  - `sections`: nested list, ordered by `order`, but `order` itself is **not** in the
    wire shape (position in the array is the order, matching how the frontend indexes
    `book.sections[i]`) — reconstructed from array index on write.
  - `created_at`/`updated_at`: **not** in `lib/types.ts`'s `Book`, but included as
    read-only `createdAt`/`updatedAt` — reasonable additions for a real API, additive
    only, won't break frontend code that doesn't know about them.
  - `storyId` is accepted as-is (`CharField`), not validated against `buildStories`
    output — reconstructing full story text server-side is out of scope per the
    models-task plan; the API only persists the chosen id + the (already-expanded)
    sections the client sends.
  
  ## Files
  
  ```
  backend/books/
    serializers.py   # SectionSerializer, BookSerializer
    views.py         # BookViewSet (ModelViewSet)
    urls.py          # router registering "books" -> BookViewSet
    tests.py         # append DRF APITestCase classes (existing model tests stay)
  backend/core/urls.py   # add: path("", include("books.urls"))
  ```
  Rationale: mirrors the `core` app's `views.py`/`urls.py` split; `books/urls.py` is
  included from `core/urls.py` (already mounted at `/api/` from `config/urls.py`), so
  routes land at `/api/books/` without changing `config/urls.py`.
  
  ## Serializers (`books/serializers.py`)
  
  ```python
  class SectionSerializer(serializers.ModelSerializer):
      imageDesc = serializers.CharField(source="image_desc")
      text = serializers.CharField()
  
      class Meta:
          model = Section
          fields = ["imageDesc", "text"]
  
  
  class BookSerializer(serializers.ModelSerializer):
      id = serializers.UUIDField(read_only=True)
      valueId = serializers.PrimaryKeyRelatedField(source="value", queryset=Value.objects.all())
      value = serializers.CharField(source="value.name", read_only=True)
      accent = serializers.CharField(source="value.color", read_only=True)
      storyId = serializers.CharField(source="story_id")
      styleId = serializers.PrimaryKeyRelatedField(source="style", queryset=Style.objects.all())
      sections = SectionSerializer(many=True)
      createdAt = serializers.DateTimeField(source="created_at", read_only=True)
      updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)
  
      class Meta:
          model = Book
          fields = ["id", "valueId", "value", "accent", "title", "storyId",
                    "styleId", "sections", "createdAt", "updatedAt"]
  
      def validate_sections(self, value):
          if not value:
              raise serializers.ValidationError("A book must have at least one section.")
          return value
  
      def create(self, validated_data):
          sections_data = validated_data.pop("sections")
          book = Book.objects.create(**validated_data)
          Section.objects.bulk_create([
              Section(book=book, order=i, **s) for i, s in enumerate(sections_data)
          ])
          return book
  
      def update(self, instance, validated_data):
          sections_data = validated_data.pop("sections", None)
          for attr, val in validated_data.items():
              setattr(instance, attr, val)
          instance.save()
          if sections_data is not None:
              instance.sections.all().delete()
              Section.objects.bulk_create([
                  Section(book=instance, order=i, **s) for i, s in enumerate(sections_data)
              ])
          return instance
  ```
  - `sections` is required on create (step-3 gating already guarantees ≥1 page
    client-side; the API enforces it too since it doesn't trust the client).
  - On update, `sections` is optional — a `PATCH` that only changes `title`/`styleId`
    doesn't need to resend pages; when present, full replace (delete + recreate) is the
    simplest correct way to reconcile `order` and avoids a diffing algorithm the task
    doesn't call for.
  - `PrimaryKeyRelatedField` on `valueId`/`styleId` gives free 400s for unknown
    ids (e.g. `"styleId": "nope"` → `{"styleId": ["Object with id=nope does not exist."]}`),
    which is the DRF-idiomatic way to validate FK-backed writes.
  
  ## View (`books/views.py`)
  ```python
  class BookViewSet(viewsets.ModelViewSet):
      queryset = Book.objects.select_related("value", "style").prefetch_related("sections")
      serializer_class = BookSerializer
  ```
  `ModelViewSet` gives list/create/retrieve/update(`PUT`)/partial_update(`PATCH`)/destroy
  for free — matches the task's "list/create/retrieve/update/delete" ask without
  hand-writing five views. `select_related`/`prefetch_related` avoid N+1s on list.
  
  No auth/permission class added yet — the auth task is next in `TASKS.md` and is
  explicitly scoped to add login/logout; `Book` has no `owner` field yet either (per
  the models-task plan), so there's nothing to scope a permission check to. Leaving
  `AllowAny` (DRF default) here rather than guessing at a permission shape.
  
  ## Routing (`books/urls.py`)
  ```python
  router = DefaultRouter()
  router.register("books", BookViewSet, basename="book")
  urlpatterns = router.urls
  ```
  `core/urls.py` adds `path("", include("books.urls"))` alongside its existing
  `health/` path — final route: `/api/books/`, `/api/books/<uuid:pk>/`.
  
  ## Tests (`books/tests.py`)
  Append `APITestCase` classes (existing `TestCase` model tests from the prior task
  are untouched):
  
  - **`BookListCreateAPITests`**
    - `GET /api/books/` empty → `200`, `[]`.
    - `GET /api/books/` with 2 seeded books → `200`, both present, `sections` ordered,
      `value`/`accent` correctly derived from the FK.
    - `POST /api/books/` with valid payload (valueId/styleId/title/storyId/sections)
      → `201`, row + sections persisted in DB, response echoes generated `id`.
    - `POST` with empty `sections: []` → `400`.
    - `POST` with unknown `valueId`/`styleId` → `400`.
    - `POST` with missing `title` → `400`.
  - **`BookRetrieveAPITests`**
    - `GET /api/books/<id>/` existing → `200`, full shape incl. nested sections in order.
    - `GET /api/books/<id>/` unknown UUID → `404`.
  - **`BookUpdateAPITests`**
    - `PATCH` title/styleId only (no `sections` key) → `200`, sections unchanged.
    - `PUT` full payload with a different/reordered `sections` list → `200`, old
      `Section` rows replaced, new ones persisted in the new order.
  - **`BookDeleteAPITests`**
    - `DELETE /api/books/<id>/` → `204`, book gone, cascade removes its `Section`s
      (reusing the cascade behavior already proven at the model level).
    - `DELETE` unknown UUID → `404`.
  
  All tests run against the real local Postgres test DB (project convention, no
  mocking) — same note as `books/tests.py`'s existing header comment.
  
  ## Out of scope (explicitly, per task)
  - No auth/permissions/ownership on `Book` — next `TASKS.md` item.
  - No frontend wiring — `lib/storage.ts`, `app/`, `components/` untouched.
  - No pagination/filtering/search on the list endpoint — not asked for, and the
    library view doesn't need it at current book counts.
  - No `StoryTemplate` endpoint — `story_id` is opaque to the API per the models plan.
  
  ## Verification (manual, part of implementation stage)
  1. `cd backend && source .venv/bin/activate`
  2. `python manage.py test books`
  3. `python manage.py runserver` then manually: `curl -X POST localhost:8000/api/books/ -H "Content-Type: application/json" -d '{...}'`, `curl localhost:8000/api/books/`, `curl -X PATCH .../<id>/`, `curl -X DELETE .../<id>/`.

  </details>

- [x] Add minimal real authentication to the Django backend: session-based login/logout endpoints (`/api/auth/login/`, `/api/auth/logout/`) backed by Django's built-in auth with a single seeded dev user (no self-serve signup flow) — backend-only; the Next.js login page keeps its current simulated flow until a separate task wires it up.

  <details><summary>plan</summary>

  # Plan — Session-based auth (`/api/auth/login/`, `/api/auth/logout/`)
  
  ## Goal
  Add minimal, real authentication to the Django backend: session-based
  login/logout backed by Django's built-in `auth` app, with a single seeded dev
  user (no self-serve signup). **Backend-only** — `app/login/page.tsx` keeps its
  current simulated flow (per `PROJECT.md`: "any input proceeds") until a
  separate task wires the frontend to these endpoints. No changes to `app/`,
  `components/`, or `lib/`.
  
  ## Where this lives: extend `core`, no new app
  `core` is already the infra-only app (health check, no models). Auth here
  needs no new persisted model — it uses Django's built-in `User` — so it fits
  `core` rather than justifying a new `accounts` app for two views and one seed
  migration. `books` got its own app because it owns real domain models
  (`Book`/`Section`/`Value`/`Style`); this doesn't.
  
  ```
  backend/core/
    serializers.py     # new: LoginSerializer
    views.py           # append: login_view, logout_view
    urls.py            # append: auth/login/, auth/logout/
    migrations/         # new (core has none yet)
      __init__.py
      0001_seed_dev_user.py   # RunPython: creates the single dev user
    tests.py           # append: LoginTests, LogoutTests
  ```
  
  ## Seeded dev user (`core/migrations/0001_seed_dev_user.py`)
  Mirrors the `books` app's `0002_seed_reference_data.py` pattern (data
  migration, not a management command, so `migrate` alone seeds a fresh DB —
  consistent with how `Value`/`Style` are seeded).
  
  - Depends on `("auth", "0012_alter_user_first_name_max_length")` (current
    latest `auth` migration in this env) so the `User` table exists first.
  - Forward: `get_user_model().objects.get_or_create(username=email, defaults={"email": email})`
    then `set_password(...)` + `save()` — idempotent, safe to rerun.
  - Email/username: `DJANGO_DEV_USER_EMAIL` env var, default
    `"parent@home.com"` — deliberately matches the login form's existing
    placeholder in `design/README.md` / `TEST_CONTRACT.md`, so the *future*
    frontend-wiring task has an obvious credential to point the form at rather
    than inventing one now.
  - Password: `DJANGO_DEV_USER_PASSWORD` env var, default `"storyseed-dev"` —
    same "dev-friendly default via env var" convention already used for
    `POSTGRES_PASSWORD` in `config/settings/base.py`.
  - Reverse: delete the user by username, so `migrate` backwards / test-DB
    teardown stays clean.
  - Add both new env vars to `backend/.env.example`, next to the existing
    `POSTGRES_*` block.
  
  ## Serializer (`core/serializers.py`)
  ```python
  class LoginSerializer(serializers.Serializer):
      email = serializers.CharField()
      password = serializers.CharField(trim_whitespace=False)
  ```
  Field is named `email` (not Django's native `username`) to match the
  frontend's `input[name="email"]` (`TEST_CONTRACT.md`) — the view maps
  `email` → `authenticate(request, username=email, password=...)`, since the
  seeded user's `username` *is* the email string. Keeps the translation at the
  API boundary, same pattern as `valueId`/`styleId` in `books/serializers.py`.
  
  ## Views (`core/views.py`)
  ```python
  @api_view(["POST"])
  @authentication_classes([])       # no session/basic auth expected pre-login
  @permission_classes([AllowAny])
  def login_view(request):
      serializer = LoginSerializer(data=request.data)
      serializer.is_valid(raise_exception=True)
      user = authenticate(
          request,
          username=serializer.validated_data["email"],
          password=serializer.validated_data["password"],
      )
      if user is None:
          return Response({"detail": "Invalid credentials."}, status=400)
      login(request, user)  # django.contrib.auth.login — establishes the session
      return Response({"email": user.email})
  
  
  @api_view(["POST"])
  @permission_classes([IsAuthenticated])
  def logout_view(request):
      logout(request)
      return Response(status=204)
  ```
  - `login_view` is deliberately `@csrf_exempt` in effect (via empty
    `authentication_classes`, which skips DRF's `SessionAuthentication` and
    its CSRF enforcement) — there is no session/CSRF cookie yet at the point a
    client is trying to establish one. This is a known, common minimal
    simplification for a first-cut session-login endpoint.
    **Flagging, not solving:** the future frontend-wiring task will need a way
    to fetch a CSRF cookie before POSTing to authenticated endpoints (e.g. a
    `GET` that calls `django.middleware.csrf.get_token`, or accepting that
    `logout_view` — which *does* go through normal `SessionAuthentication` and
    thus normal CSRF enforcement — needs the token). Not deciding that here.
  - `logout_view` requires `IsAuthenticated`, so calling it without a valid
    session returns `401` (DRF's default for `IsAuthenticated` with no
    authenticated user attempted).
  - No rate limiting / lockout on failed login attempts — not asked for, and
    out of scope for "minimal."
  
  ## URLs (`core/urls.py`)
  ```python
  urlpatterns = [
      path("health/", views.health_check, name="health-check"),
      path("auth/login/", views.login_view, name="auth-login"),
      path("auth/logout/", views.logout_view, name="auth-logout"),
      path("", include("books.urls")),
  ]
  ```
  Final routes: `/api/auth/login/`, `/api/auth/logout/` (via
  `config/urls.py`'s existing `/api/` mount — unchanged).
  
  ## Settings
  No `REST_FRAMEWORK` block exists in `base.py` today, so DRF's defaults
  (`SessionAuthentication` + `BasicAuthentication`, `AllowAny`) already apply
  globally — no change needed there. **Not** adding a global
  `DEFAULT_PERMISSION_CLASSES = [IsAuthenticated]`: that would lock down
  `/api/books/`, which the previous task deliberately left `AllowAny` pending
  this exact auth task, but *this* task's scope is the login/logout endpoints
  only, not retrofitting permissions onto `BookViewSet`. Flagging gating
  `/api/books/` behind auth as a reasonable next `TASKS.md` item rather than
  deciding it here — doing it unilaterally would also break the existing
  `books` DRF tests, which assume unauthenticated access.
  
  ## Tests (`core/tests.py`, appended — existing `HealthCheckTests` untouched)
  Real Postgres test DB per project convention (no mocking); the seed
  migration runs automatically against the test DB.
  
  - **`LoginTests`**
    - `POST /api/auth/login/` with the seeded dev user's email/password → `200`,
      body `{"email": "parent@home.com"}`, and the response sets a session
      cookie (`response.cookies` contains `sessionid`).
    - `POST /api/auth/login/` with wrong password → `400`,
      `{"detail": "Invalid credentials."}`, no session cookie set.
    - `POST /api/auth/login/` with unknown email → `400`, same shape.
    - `POST /api/auth/login/` missing `password` → `400` (serializer
      validation error).
  - **`LogoutTests`**
    - Log in first (`self.client.login(...)` or hitting the login endpoint),
      then `POST /api/auth/logout/` → `204`; a subsequent authenticated-only
      check (e.g. re-`POST /api/auth/logout/`) → `401`, proving the session
      was actually cleared.
    - `POST /api/auth/logout/` while not logged in → `401`.
  - **`DevUserSeedTests`** (parallels `books/tests.py`'s
    `ReferenceDataSeedTests`)
    - Exactly one `User` exists after migration with the expected username;
      `check_password` against the configured (or default) dev password
      succeeds.
  
  ## Out of scope (explicitly, per task)
  - No signup/registration endpoint.
  - No password reset / change-password flow.
  - No frontend changes — `app/login/page.tsx` keeps its simulated "any input
    proceeds" behavior; wiring it to these endpoints (including handling the
    CSRF-cookie bootstrap flagged above) is a separate task.
  - No permission changes on `/api/books/` — flagged above as a follow-up, not
    decided here.
  - No token-based auth (JWT/DRF tokens) — `ARCHITECTURE.md` specifies Django
    session auth.
  - No rate limiting / login throttling.
  
  ## Verification (manual, part of implementation stage)
  1. `cd backend && source .venv/bin/activate`
  2. `python manage.py migrate` → confirm `core.0001_seed_dev_user` applies
     cleanly against local Postgres and seeds one user.
  3. `python manage.py shell -c "from django.contrib.auth import get_user_model; U=get_user_model(); print(U.objects.count(), U.objects.first().username)"` → `1 parent@home.com`.
  4. `python manage.py test core`.
  5. `python manage.py runserver`, then manually:
     `curl -c cookies.txt -X POST localhost:8000/api/auth/login/ -H "Content-Type: application/json" -d '{"email":"parent@home.com","password":"storyseed-dev"}'` → `200`;
     `curl -b cookies.txt -X POST localhost:8000/api/auth/logout/` → `204`;
     repeating the logout call without `-b cookies.txt` → `401`.

  </details>

- [x] Add CORS + CSRF plumbing to the Django backend so the Next.js dev server (`localhost:3000`) can make credentialed requests to the API (`localhost:8000`): `django-cors-headers` with `CORS_ALLOWED_ORIGINS`/`CORS_ALLOW_CREDENTIALS`, `CSRF_TRUSTED_ORIGINS`, a same-site-friendly session/CSRF cookie config for local dev, and a way for the frontend to obtain a CSRF token before its first unsafe (`POST`/`PATCH`/`DELETE`) request (e.g. a `GET` endpoint that calls `django.middleware.csrf.get_token`) — backend-only, no frontend changes; unblocks the login-wiring and API-client tasks below, both of which need to send cookies/CSRF headers cross-origin.

  <details><summary>plan</summary>

  # Plan — CORS + CSRF plumbing for cross-origin credentialed requests
  
  ## Goal
  Let the Next.js dev server (`localhost:3000`) make credentialed (`fetch(..., {credentials:
  "include"})`) requests to the Django API (`localhost:8000`): CORS headers via
  `django-cors-headers`, `CSRF_TRUSTED_ORIGINS`, same-site-friendly session/CSRF cookies for
  local dev, and a `GET` endpoint the frontend can hit first to receive a CSRF cookie before
  its first `POST`/`PATCH`/`DELETE`. **Backend-only** — no changes to `app/`, `components/`,
  or `lib/`. This directly resolves the "flagging, not solving" note left in the auth task's
  plan (`TASKS.md`, login/logout task): `login_view` currently skips `SessionAuthentication`
  entirely because there's no way yet for a client to have a CSRF cookie before it's
  authenticated; this task adds that bootstrap without touching `login_view`/`logout_view`
  themselves.
  
  ## Why cross-origin cookies need explicit config
  Browsers only send/accept cookies cross-origin (`:3000` → `:8000` is cross-origin — different
  port) when: (1) the response has a specific `Access-Control-Allow-Origin` (not `*`) plus
  `Access-Control-Allow-Credentials: true`, and the request opts in with `credentials:
  "include"`; (2) cookies aren't blocked by `SameSite`. `SameSite` is scoped to
  scheme+registrable-domain ("site"), not full origin, so `http://localhost:3000` and
  `http://localhost:8000` are cross-*origin* but same-*site* — `SameSite=Lax` (Django's
  default) already permits the cookie on these fetches, so no cookie-attribute relaxation is
  needed for this same-machine-different-port setup. `CORS_ALLOW_CREDENTIALS=True` is still
  required separately, for the JS-visible `fetch` call itself to succeed rather than being
  blocked by CORS. Both are set explicitly below rather than left as unstated defaults, so the
  reasoning is visible in code.
  
  ## Dependency
  Add `django-cors-headers` to `backend/requirements.txt` (alphabetical-ish, next to
  `djangorestframework`).
  
  ## Settings changes (`backend/config/settings/base.py`)
  
  - **`INSTALLED_APPS`**: add `"corsheaders"` (before `"core"`/`"books"`, position doesn't
    matter for apps without templates — placing near `"django.contrib.staticfiles"` per the
    package's own install docs).
  - **`MIDDLEWARE`**: insert `"corsheaders.middleware.CorsMiddleware"` as high as possible —
    directly after `SecurityMiddleware`, before `CommonMiddleware` — per `django-cors-headers`
    docs (it must run before `CommonMiddleware` so preflight `OPTIONS` responses get CORS
    headers before any other middleware could short-circuit the request).
  - **New CORS/CSRF block**, env-driven with local-dev defaults (matching the existing
    `POSTGRES_*` / `DJANGO_DEV_USER_*` convention of `os.environ.get(..., "<dev default>")`):
    ```python
    CORS_ALLOWED_ORIGINS = os.environ.get(
        "CORS_ALLOWED_ORIGINS", "http://localhost:3000"
    ).split(",")
    CORS_ALLOW_CREDENTIALS = True
  
    CSRF_TRUSTED_ORIGINS = os.environ.get(
        "CSRF_TRUSTED_ORIGINS", "http://localhost:3000"
    ).split(",")
    ```
    Splitting a comma-separated env var (rather than hardcoding the list) matches how a
    future non-dev environment would override it without a settings-file change — consistent
    with existing env-var-driven config, not a speculative addition since `CLAUDE.md`/
    `ARCHITECTURE.md` already establish a local/base settings split with env overrides.
  - **Cookie config** (same-site-friendly for local dev, explicit rather than relying on
    Django defaults so the reasoning above is visible in code):
    ```python
    SESSION_COOKIE_SAMESITE = "Lax"
    CSRF_COOKIE_SAMESITE = "Lax"
    SESSION_COOKIE_SECURE = False   # plain http://localhost in dev
    CSRF_COOKIE_SECURE = False
    CSRF_COOKIE_HTTPONLY = False    # must be JS-readable so the frontend can echo it in X-CSRFToken
    ```
    `CSRF_COOKIE_HTTPONLY = False` is Django's default already (calling it out explicitly
    since it's load-bearing for the get-token endpoint below to be useful — a frontend can't
    read an HttpOnly cookie to put it in a request header).
  
  No changes to `config/settings/local.py` — the new settings are dev-safe defaults in
  `base.py` itself (same pattern as `DATABASES`), not `local.py`-only.
  
  ## New endpoint: `GET /api/auth/csrf/`
  
  Lives in `core/` (same app as `login_view`/`logout_view` — no new app, this is auth
  plumbing, not a domain concern).
  
  `backend/core/views.py`, appended:
  ```python
  from django.middleware.csrf import get_token
  
  
  @api_view(["GET"])
  @permission_classes([AllowAny])
  def csrf_view(request):
      return Response({"detail": get_token(request)})
  ```
  Calling `get_token(request)` is what makes Django set the `csrftoken` cookie on the
  response (it's a side effect of the call, not just a return value) — this is the
  documented pattern for SPA/cross-origin CSRF bootstrapping. `AllowAny` since this must be
  callable *before* login (a client has no session yet at this point). Response body is
  included as a convenience/debugging aid but the cookie is what the frontend actually needs
  to read (`document.cookie`) to populate the `X-CSRFToken` header on its next unsafe
  request — Django's `CsrfViewMiddleware` accepts that header name by default
  (`CSRF_HEADER_NAME`, unchanged).
  
  `backend/core/urls.py`, add one line:
  ```python
  path("auth/csrf/", views.csrf_view, name="auth-csrf"),
  ```
  alongside the existing `auth/login/`/`auth/logout/` entries. Final route: `/api/auth/csrf/`.
  
  ## Out of scope (explicitly, per task)
  - No frontend changes — fetching `/api/auth/csrf/` and sending `X-CSRFToken` back is the
    *next* task's job (`login-wiring`), which this task unblocks but does not do.
  - No change to `login_view`'s `@authentication_classes([])` CSRF-exemption — that stays as
    is; the login-wiring task decides whether to route the CSRF-fetch-then-login flow through
    the now-available cookie or leave login exempt permanently. Not deciding that here.
  - No production/HTTPS cookie settings (`Secure=True`, real trusted-origin domains) — out of
    scope per "local dev" framing in the task description; a `production.py` settings module
    doesn't exist yet (per the scaffold task's plan, deliberately deferred).
  - No changes to `/api/books/` permissions or `BookViewSet`.
  
  ## Tests (`backend/core/tests.py`, appended — existing tests untouched)
  Real Postgres test DB per project convention (no mocking):
  - **`CsrfTokenTests`**
    - `GET /api/auth/csrf/` → `200`; response sets a `csrftoken` cookie
      (`response.cookies["csrftoken"]` present and non-empty).
    - A subsequent unsafe request (e.g. `POST /api/auth/logout/` while authenticated, or a
      lightweight `books` POST) made through Django's test client with
      `enforce_csrf_checks=True`, using the cookie value in the `X-CSRFToken` header, is not
      rejected for CSRF (i.e. proves the round-trip actually satisfies
      `CsrfViewMiddleware` — the default test client has `enforce_csrf_checks=False`, so
      this test must construct a client with it explicitly on to be meaningful).
  - **CORS smoke check**: a request with an `Origin: http://localhost:3000` header to
    `GET /api/health/` gets back `Access-Control-Allow-Origin: http://localhost:3000` and
    `Access-Control-Allow-Credentials: true` in the response headers.
  
  ## Verification (manual, part of implementation stage)
  1. `cd backend && source .venv/bin/activate && pip install -r requirements.txt`
  2. `python manage.py test core`
  3. `python manage.py runserver`, then from a terminal:
     `curl -i -H "Origin: http://localhost:3000" localhost:8000/api/health/` → response
     includes `Access-Control-Allow-Origin: http://localhost:3000`.
     `curl -i -c cookies.txt localhost:8000/api/auth/csrf/` → `200`, `Set-Cookie: csrftoken=...`.

  </details>


- [x] Wire `/login` to the real backend: replace `LoginForm`'s simulated "any input proceeds" submit with a `POST /api/auth/login/` call (crediting the CSRF/cookie plumbing from the previous task), show an inline error for a `400` (invalid credentials) instead of navigating away, and only call `router.push("/library")` on a real `200`; wire `AppHeader`'s `signout-button` to `POST /api/auth/logout/` before navigating to `/login`. Update `PROJECT.md`'s "What's simulated vs. real" section in the same change, since it currently says auth is "a visual gate only" — that's no longer accurate once this lands. Does not touch `/api/books/` or `lib/storage.ts`.

  <details><summary>plan</summary>

  Done as part of a combined pass implementing this task plus the 3 below it (route guard, books auth-gating, storage→API client), driven by a "deploy to production" request that surfaced these as blockers first. `LoginForm.tsx` now calls `lib/api.ts`'s `login()`, shows a `data-testid="signin-error"` message on failure, and disables the submit button while in flight. `app/library/page.tsx` wires sign-out to `lib/api.ts`'s `logout()` before navigating. `PROJECT.md`'s simulated-vs-real section updated. Also changed the seeded dev user's default password from `storyseed-dev` to `secret` (`.env.example`, migration fallback) to match `e2e/login.spec.ts`'s hardcoded credentials — flagged and confirmed with the user rather than silently decided.

  </details>

- [x] Add a route guard so `/library`, `/create`, `/edit/[id]`, and `/book/[id]` redirect to `/login` for anyone without a valid session (today they render freely for any deep link, since login is purely simulated) — needs a small new backend "who am I" endpoint (e.g. `GET /api/auth/session/` → `200` with the user, or `401`) since there's no way to inspect a Django session cookie from the client otherwise, plus a client-side check (layout-level effect or shared hook) that redirects on `401`. Builds on the login-wiring task; keep the check narrowly scoped to these four routes so `/login` itself doesn't loop.

  <details><summary>plan</summary>

  Added `GET /api/auth/session/` (`backend/core/views.py`), which checks `request.user.is_authenticated` manually and returns a clean `401`/`200` rather than DRF's usual 403-on-SessionAuthentication fallback. Added `lib/useRequireSession.ts`, a client hook that calls it and `router.replace`s to `/login` on no session; applied at the top of `app/library/page.tsx`, `app/book/[id]/page.tsx`, and inside `components/CreateWizard.tsx` (covers both `/create` and `/edit/[id]`, which share it).

  Known gap, confirmed with the user rather than silently decided: `e2e/reader.spec.ts` and the "Edit wizard" test in `e2e/wizard.spec.ts` hardcode literal URLs like `/book/seed-courage-0`, but `Book.id` is a UUID (unchanged — see the storage/API-client task below), so those 6 tests are expected to stay red until updated to use real ids. The user has taken that on themselves.

  Also added a Playwright auth-setup project (`e2e/auth.setup.ts`, new file, plus `playwright.config.ts` changes only) so the rest of the e2e suite runs pre-authenticated against this new guard, without editing any existing spec file's content.

  </details>

- [x] Gate `/api/books/` behind authentication: add `permission_classes = [IsAuthenticated]` (DRF session auth) to `BookViewSet` in `backend/books/views.py`, which currently has none and so falls back to DRF's global `AllowAny` default — this was explicitly flagged as a follow-up in the login/logout task's plan ("Flagging gating `/api/books/` behind auth as a reasonable next `TASKS.md` item rather than deciding it here") but never turned into an item. Update the existing `books/tests.py` `APITestCase`s, which currently assume unauthenticated access, to log in as the seeded dev user first. Backend-only — no frontend changes. Must land before the `lib/storage.ts` API-client task below, which already assumes `/api/books/` requires an authenticated, credentialed request.

  <details><summary>plan</summary>

  `BookViewSet.permission_classes = [IsAuthenticated]`. Added `BookAuthRequiredTests` (list/create/delete without auth → 401/403) and logged the seeded dev user in via `self.client.login(...)` in `setUp` for the existing list/retrieve/update/delete `APITestCase`s. `test_list_empty` and the seeded-books list test now explicitly `Book.objects.all().delete()` in setup, since the new seed migration below means the DB is no longer empty by default. All 39 backend tests green (`python manage.py test`).

  </details>

- [x] Replace `lib/storage.ts`'s `localStorage`-backed persistence with a thin API client against `/api/books/` (list/create/retrieve/update/delete), translating the DRF wire shape (`valueId`/`styleId`/`value`/`accent`/`createdAt`/`updatedAt`) to and from `lib/types.ts`'s `Book`/`Section` shapes per `ARCHITECTURE.md`'s "frontend/backend models are related but not identical" note; update `app/library/page.tsx`, `app/book/[id]/page.tsx`, and `components/CreateWizard.tsx` (shared by `/create` and `/edit/[id]`) to call it instead of `loadOrSeedBooks`/`upsertBook`/`persistBooks`/`deleteBookById`. Flag rather than silently decide: whether the 3 sample books still get seeded client-side against an empty backend, or move to a backend seed migration like `Value`/`Style` did. Requires the auth/CSRF work above to be in place first since these become authenticated, credentialed requests.

  <details><summary>plan</summary>

  Decided (flagged and confirmed with the user): seeding moved to a backend migration (`backend/books/migrations/0003_seed_books.py`, mirroring the `Value`/`Style` pattern), content shared with a new `backend/books/management/commands/reset_seed_data.py` command via `backend/books/seed_data.py`. `Book.id` stays a UUID (not changed to match `e2e/reader.spec.ts`'s literal seed-id strings — see the route-guard task's known-gap note above).

  `lib/storage.ts` rewritten as an async API client (`listBooks`/`getBook`/`createBook`/`updateBook`/`deleteBook`) on top of a new `lib/api.ts` (fetch wrapper handling the CSRF cookie/header dance and `credentials: "include"`). `CreateWizard.tsx` no longer generates a client-side `book-${Date.now()}` id — new books get their id from the backend's create response.

  Also had to fix e2e test-infra fallout from moving off per-context localStorage to a real shared Postgres DB: added `e2e/global-setup.ts` (resets to the 3 seed books before the whole run) and split `library.spec.ts`/`wizard.spec.ts` into their own Playwright projects, each with its own fresh `reset_seed_data` run chained so wizard's reset happens *after* library's mutations (its delete test) rather than racing/leaking into wizard's absolute book-count assertions. Also gave `library.spec.ts`'s "sign out" test (which performs a real backend logout) an isolated session/project so it can't invalidate the shared session used by every other spec file. `workers` forced to `1` — tests mutate shared backend state now, not per-context storage. All config/new-file changes; no existing spec file content edited.

  </details>

- [ ] Remove the "Create an account" link from the `/login` page (`components/LoginForm.tsx`) — there is no self-serve signup flow (backend only seeds a single dev user), so the link is dead UI.

- [ ] Make the logo in `AppHeader` (`components/AppHeader.tsx`, the `Brand` component at line 21) link to `/` when clicked.

- [ ] Remove the "Library" `<span>` badge from `AppHeader` (`components/AppHeader.tsx:23-35`).

- [ ] Display the full username in `AppHeader`'s avatar/user area (`components/AppHeader.tsx:53`, currently `userName.charAt(0)`) instead of just the first character.

- [ ] Replace the `window.confirm` browser dialog used for delete confirmation (`app/library/page.tsx:27`) with a proper UI modal matching the app's visual style (see `design/README.md` / `lib/tokens.ts`), instead of the native browser prompt.

- [ ] Remove the "New story" button on `/library` (`app/library/page.tsx:74`, `data-testid="new-story-button"`) — it duplicates the `CreateTile` card (`app/library/page.tsx:100`) that already triggers the same `/create` navigation.

