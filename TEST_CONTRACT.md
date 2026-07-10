# Test Contract

This is the **stable interface** the tests assert against. The agent loop's job is
to implement the UI (in `app/` and `components/`) so that every selector and behavior
below exists and works. Treat the `data-testid` values and accessible names here as a
**fixed API** — don't rename them; if you must, update the tests in the same change.

Reference for visuals/copy/behavior: `design/README.md` and `design/design_files/*.dc.html`.
Reference data (values, stories, styles, seed) is already implemented in `lib/`.

## Routes (real URLs)

| Route          | View          |
| -------------- | ------------- |
| `/login`       | Login         |
| `/library`     | Library       |
| `/book/:id`    | Reader        |
| `/create`      | Create wizard |
| `/edit/:id`    | Edit wizard   |
| `/`            | redirect → `/login` |

Persistence: `localStorage` key `storyseed.books.v1`, seeded with 3 sample books on
first load (already implemented in `lib/storage.ts` / `lib/data.ts`). Seeded book ids:
`seed-courage-0`, `seed-kindness-1`, `seed-perseverance-2`.

## Login (`/login`)

| testid / selector        | element                              |
| ------------------------ | ------------------------------------ |
| `input[name="email"]`    | email input (placeholder `parent@home.com`) |
| `input[name="password"]` | password input (`type="password"`)   |
| `signin-button`          | "Sign in" button                     |

Behavior: clicking **Sign in** with any (even empty) values navigates to `/library`.
Headline text "Little stories that grow big hearts." is present.

## Library (`/library`)

| testid                | element                                                   |
| --------------------- | --------------------------------------------------------- |
| `library-view`        | root                                                      |
| `user-eyebrow`        | "Welcome back, Maya" (uppercased via CSS is fine)         |
| `new-story-button`    | "+ New story" → navigates to `/create`                    |
| `create-tile`         | "Create a story" CTA tile → navigates to `/create`        |
| `book-card`           | one per book; has attribute `data-book-id="<id>"`         |
| `signout-button`      | "Sign out" → navigates to `/login`                        |
| `user-avatar`         | avatar showing first initial of userName ("M")            |

Per `book-card`:

| testid             | element                                                 |
| ------------------ | ------------------------------------------------------- |
| `book-cover`       | clickable cover → navigates to `/book/:id`              |
| `edit-book`        | ✎ button → navigates to `/edit/:id` (must `stopPropagation`) |
| `delete-book`      | 🗑 button → `window.confirm`, then removes the card     |
| `book-meta`        | text "{N} pages · {Style name}"                         |

- Heading "Your library" present.
- After seeding there are exactly **3** `book-card`s. One shows title
  "Pip and the Whispering Forest".
- Deleting a confirmed card reduces the count by 1 and re-persists.

## Reader (`/book/:id`)

| testid             | element                                                      |
| ------------------ | ------------------------------------------------------------ |
| `reader-view`      | root                                                         |
| `reader-back`      | "← Library" → navigates to `/library`                        |
| `reader-title`     | book title                                                   |
| `reader-value`     | value display name                                           |
| `page-indicator`   | "Cover" on cover, else "Page X / N" (N = section count)      |
| `reader-prev`      | ‹ button; `disabled` on cover (page 0)                       |
| `reader-next`      | › button; `disabled` on last page                            |
| `reader-dot`       | one per page incl. cover; current has attribute `data-active="true"` |
| `story-page`       | the StoryPage renderer (see component contract)              |

Behavior:
- Pages = `[cover, ...sections]`. Open lands on cover: `page-indicator` = "Cover",
  `reader-prev` disabled.
- Click `reader-next` → "Page 1 / N", prev enabled.
- On last page `reader-next` is disabled.
- Clicking the last `reader-dot` jumps to the last page.

## Create / Edit Wizard (`/create`, `/edit/:id`)

| testid             | element                                                        |
| ------------------ | ------------------------------------------------------------- |
| `wizard-view`      | root                                                          |
| `wizard-heading`   | "Create a new story" (create) / "Edit story" (edit)           |
| `wizard-cancel`    | "✕ Cancel" → navigates to `/library`                          |
| `step-node`        | 5 stepper nodes; each has `data-step="1..5"` and `data-state="active\|done\|future"` |
| `step-counter`     | "Step X of 5" (steps 1–4)                                     |
| `prev-step`        | "← Back" (disabled on step 1)                                  |
| `next-step`        | "Next →" (steps 1–3) / "Review →" (step 4); `disabled` when step invalid |

Stepper labels in order: Value, Story, Pages, Style, Review.
Clicking a `step-node` with `data-step` ≤ current jumps back to it. Forward jump is a no-op.

### Step 1 — Value

| testid             | element                                                        |
| ------------------ | ------------------------------------------------------------- |
| `value-card`       | 9 cards; each `data-value-id="<id>"`; selected has `data-selected="true"` |
| `value-definition` | dark panel showing hovered/selected value's name + description |

- `next-step` disabled until a value is selected.
- Selecting a value sets `data-selected` and updates `value-definition`.
- Changing the selected value resets chosen story, sections, and title.

### Step 2 — Story

| testid             | element                                                        |
| ------------------ | ------------------------------------------------------------- |
| `story-card`       | 3 cards; each `data-story-id="forest\|meadow\|river"`; chosen has `data-chosen="true"` |
| `story-toggle`     | "Read ▼" / "Hide ▲" expand toggle within a card               |
| `story-full`       | full story text, visible only when expanded                   |
| `story-choose`     | "Choose this story" / "✓ Chosen" button (visible when expanded) |

- `next-step` disabled until a story is chosen.
- Choosing a story sets draft title + copies its sections.

### Step 3 — Pages

| testid                | element                                                    |
| --------------------- | ---------------------------------------------------------- |
| `story-title-input`   | controlled title `<input>`                                 |
| `page-card`           | one per section; `data-index="0..n-1"`                     |
| `page-image-input`    | 🖼 Picture textarea within a page card                     |
| `page-text-input`     | 🗣 Narrator textarea within a page card                    |
| `remove-page`         | "Remove" button within a page card                         |
| `add-page`            | "+ Add a page" → appends an empty page                     |

- `next-step` disabled unless ≥1 page **and every page has non-empty narrator text**.

### Step 4 — Style

| testid             | element                                                        |
| ------------------ | ------------------------------------------------------------- |
| `style-card`       | 3 cards; each `data-style-id="crayon\|cutout\|watercolor"`; selected has `data-selected="true"` |

- Each card previews page 1 via `story-page`.
- `next-step` (label "Review →") disabled until a style is selected.

### Step 5 — Review

| testid             | element                                                        |
| ------------------ | ------------------------------------------------------------- |
| `review-page`      | one `story-page` per page (cover + sections)                  |
| `review-summary`   | "{N} pages · teaches {value} · {Style} style"                 |
| `decline-review`   | "↩ Make changes" → back to step 3                             |
| `accept-book`      | "✓ Add to library" (create) / "✓ Save changes" (edit)         |

- Accept upserts into the books collection, persists, and navigates to `/library`.

## StoryPage component (`components/StoryPage.tsx`)

Props: `kind` (`cover`|`page`), `title`, `value`, `accent`, `imageDesc`, `text`,
`variant` (`crayon`|`cutout`|`watercolor`), `pageNum`, `pageTotal`.

| testid              | element                                                       |
| ------------------- | ------------------------------------------------------------ |
| `story-page`        | root card                                                     |
| `story-page-title`  | (cover) the title                                             |
| `story-page-value`  | (cover) the value chip                                        |
| `story-page-caption`| (page) monospace caption "✎  {imageDesc}"                    |
| `story-page-text`   | (page) narrator text band                                     |
| `story-page-label`  | (page) "Page {pageNum}"                                       |

- Cover renders title + value chip; no caption/text band.
- Page renders caption (image desc), narrator text band, and "Page N" label.
- When `imageDesc` is empty, caption falls back to "✎  illustration goes here".
