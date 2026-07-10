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

