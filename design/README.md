# Handoff: Storyseed — Children's Book Creator & Reader

## Overview
Storyseed is a responsive web app for creating, reading, editing, and deleting illustrated children's picture books (target audience: kids ages 3–6). Each book teaches a single human **value** (e.g. Courage, Kindness) through a short illustrated story. The core experience is a guided **5-step creation wizard**, plus a **library** of saved books and an **e-reader** that flips through a book's pages one at a time.

The app has four top-level views:
1. **Login** — visual sign-in gate.
2. **Library** — grid of book covers with create / edit / delete.
3. **Reader** — page-by-page flip viewer (cover → pages).
4. **Create/Edit Wizard** — a 5-step form that produces or edits a book.

---

## About the Design Files
The files in `design_files/` are **design references created in HTML** — interactive prototypes that demonstrate the intended look, layout, copy, interactions, and state behavior. **They are not production code to ship directly.**

- `Storyseed.dc.html` — the full app (all four views + wizard + state logic).
- `StoryPage.dc.html` — a reusable renderer for a single book cover or page, in 3 art styles.
- `support.js` — an auto-generated runtime that powers the `.dc.html` prototype format. **Ignore it for implementation** — it is scaffolding for the prototype only, not part of the design.

These `.dc.html` files use a custom prototyping runtime (a template + a `Component` logic class). Read them for **layout, exact values, copy, and behavior**, then **recreate the designs in your target codebase** using its established framework, component library, and patterns. If no codebase exists yet, the recommended stack is **React** (the prototype's structure maps almost 1:1 to React function components with `useState`) plus a backend for auth and persistence.

> How to read a `.dc.html` file: the top portion (between the markup tags) is the **view template** — treat `{{ name }}` as a bound value and `style="..."` as the literal CSS for that element. The `class Component extends DCLogic { ... }` block at the bottom is the **logic** — `state` is the component state, `renderVals()` returns the values/handlers the template binds to, and the other methods are event handlers. `<dc-import name="StoryPage" ...>` mounts the StoryPage component with the given props.

---

## Fidelity
**High-fidelity (hifi).** Colors, typography, spacing, border treatments, shadows, copy, and interactions are all final and intentional. Recreate the UI faithfully using your codebase's libraries. Exact tokens are listed in **Design Tokens** below.

The one deliberate placeholder: **book artwork**. The prototype does not contain real illustrations. Covers and pages render a colored background (per art style) and, on story pages, show the *image description text* as a caption. In production this is where generated or uploaded illustrations go (see **Assets** and **Production Notes**).

---

## Visual Language ("Bold Pop")
A high-contrast, playful, sticker-like aesthetic:
- Thick **3px solid dark outlines** (`#1E1B2E`) on nearly every surface (cards, buttons, inputs, avatars, chips).
- **Hard offset drop-shadows** in the same dark color (no blur), e.g. `4px 4px 0 #1E1B2E`. Shadows grow on hover and shrink/translate on active (a "press" effect).
- Rounded corners throughout (10–26px depending on element).
- Bright saturated accent colors against warm off-white backgrounds.
- Chunky display headings (Fredoka), clean body/UI text (Poppins).

### Standard hover/active motion (used on most buttons & cards)
- **Default:** `box-shadow: 4px 4px 0 #1E1B2E;`
- **Hover:** `transform: translate(-2px,-2px); box-shadow: 6px 6px 0 #1E1B2E;`
- **Active (press):** `transform: translate(2px,2px); box-shadow: 1px 1px 0 #1E1B2E;`
- Cards often use a lighter variant (hover `translateY(-4px/-5px)` with a 5–6px shadow).
- Transition: short, ~`.12s` on transforms where specified; the prototype mostly relies on instant CSS state changes.

---

## Design Tokens

### Colors
| Token | Hex | Usage |
|---|---|---|
| Ink (outline/text) | `#1E1B2E` | All outlines, primary text, hard shadows |
| Canvas | `#FFFDF7` | App background (off-white) |
| Reader canvas | `#FFF6E0` | Reader background (warm cream) |
| Surface | `#FFFFFF` | Cards, inputs, headers |
| Yellow (brand) | `#FFD23F` | Login left panel, library header bar, accents, "next page" button |
| Pink/Red (primary action) | `#FF4D6D` | Primary buttons, active step, selection rings |
| Green (success/add) | `#2BC48A` | Accept/save, "add page", chosen-story button, completed steps |
| Blue | `#2E6BFF` | Avatar, default cover accent, value: Courage |
| Purple | `#9B6BFF` | Value: Patience |
| Orange | `#FF8A3D` | Value: Generosity |
| Soft yellow band | `#FFF1C2` | Page-card headers in wizard step 3 |
| Muted text | `#6b6680` / `#8a85a0` | Secondary/caption text |
| Input border (inactive) | `#d9d5e8` | Textarea borders in wizard |
| Dashed accent | `#FFC94D` / value colors | Dashed borders on create tiles |

**Value palette** (used as cover/accent color per value):
Courage `#2E6BFF` · Kindness `#FF4D6D` · Honesty `#2BC48A` · Patience `#9B6BFF` · Generosity `#FF8A3D` · Perseverance `#00BBD1` · Responsibility `#C879FF` · Empathy `#FF6FB5` · Gratitude `#7BC043`

### Typography
- **Display / headings:** `'Fredoka'`, weights 400–700. Used for logo, H1/H2, button labels, step numbers.
- **Body / UI:** `'Poppins'`, weights 400–800. Used for paragraphs, labels, captions, chips.
- **Captions on art (image description):** `'Courier New', monospace`, italic-feel, low opacity — signals "placeholder / art note".
- Both Google Fonts. Heading sizes use `clamp()` for fluidity, e.g. H2 `clamp(24px, 3.2vw, 34px)`, page H1 `clamp(30px, 4vw, 40px)`. Body/UI typically 13–17px.

### Spacing & Radius
- Card radius: 16–22px; chips/pills: 999px; buttons: 12–14px; inputs: 12px.
- Section padding scales with `clamp()`, e.g. `clamp(24px,3.5vw,44px)`.
- Library grid: `repeat(auto-fill, minmax(230px, 1fr))`, gap 24px.
- Wizard content max-width: 1080px, centered. Library max-width: 1240px.

### Shadows
- Hard offset only (no blur): `Npx Npx 0 #1E1B2E`, N ∈ {1,2,3,4,5,6}. Larger = more "lifted".
- Selected/active accents sometimes use a colored hard shadow, e.g. chosen story card `5px 5px 0 #FF4D6D`.

---

## Screens / Views

### 1. Login
- **Purpose:** Visual sign-in gate. **Any** email/password proceeds (no real auth in prototype).
- **Layout:** Two-column flex that wraps on narrow screens.
  - **Left panel** (`flex:1 1 420px`, background `#FFD23F`, 4px right border): brand lockup (logo tile + "Storyseed"), large display headline ("Little stories that grow big hearts."), subhead. Decorative outlined circles/squares (pink, blue, green) bleed off the panel edges.
  - **Right panel** (`flex:1 1 380px`, canvas bg): centered form card (max-width 380px) — "Welcome back 👋", Email input, Password input, full-width **Sign in** button (pink, hard shadow), and a "Create an account" link (non-functional in prototype).
- **Components:** Inputs are full-width, 3px ink border, 12px radius, 14px padding. Sign in button: pink `#FF4D6D`, white text, Fredoka 18px, standard hover/active motion.
- **Behavior:** Clicking **Sign in** sets view → `library`. Inputs are controlled but their values are not validated or stored.

### 2. Library
- **Purpose:** Browse saved books; entry point to create, read, edit, delete.
- **Layout:**
  - **Header bar** (yellow `#FFD23F`, 4px bottom border, sticky-feel): logo lockup left; right side has a "Library" pill (active nav), user avatar (blue rounded square with first initial), and a "Sign out" text link.
  - **Body** (max-width 1240px): a header row with eyebrow ("WELCOME BACK, MAYA"), H1 "Your library", and a pink **+ New story** button. Below, a responsive grid.
  - **Grid:** first cell is a **"Create a story"** tile (dashed-feel CTA: green "+" tile, label, "teach a value in 5 steps"). Remaining cells are book cards.
- **Book card:** a `StoryPage` cover (see component) at 330px tall; on hover the cover lifts (`translateY(-5px)`). Top-right overlay has two icon buttons: **✎ edit** (hover → yellow) and **🗑 delete** (hover → pink/white). Below the cover: "{N} pages · {Style name}".
- **Behavior:**
  - Card body click → open Reader for that book.
  - ✎ → open wizard in **edit** mode prefilled with the book (uses `stopPropagation` so it doesn't also open the reader).
  - 🗑 → `window.confirm(...)` then delete + re-persist.
  - **+ New story** / Create tile → open wizard in **create** mode.

### 3. Reader
- **Purpose:** Read a book one page at a time, forward/back.
- **Layout:** Full-height column, warm cream bg.
  - **Top bar** (white, 4px bottom border): **← Library** button (left), centered book title + value label, and a yellow pill page indicator ("Cover" or "Page X / N") on the right.
  - **Center stage:** large round **‹** prev button, the current page (a `StoryPage`, max-width 680px, height `min(74vh, 760px)`), large round **›** next button. Prev disabled on cover; next disabled on last page (disabled = muted bg `#eee7d2`, default cursor). Next button is yellow when enabled.
  - **Bottom:** a row of **page dots** — current dot is wider (26px) and pink; others are 11px white. Dots are clickable to jump directly to a page.
- **Behavior:** Pages array = `[cover, ...sections]`. Prev/next clamp to range. Dot click jumps. `readerPage` index held in state.

### 4. Create / Edit Wizard (5 steps)
- **Shell:** Sticky **header** (heading "Create a new story" / "Edit story" + **✕ Cancel**, plus a **stepper**), scrolling content area, sticky **footer nav** (**← Back**, "Step X of 5", **Next →** / **Review →**). Footer nav shows on steps 1–4 only (step 5 has its own accept/decline bar).
- **Stepper:** 5 nodes (Value, Story, Pages, Style, Review). Completed = green with ✓; active = pink; future = white. Connecting lines turn green as you progress. You can click a node to jump **back** to any step ≤ current (not forward).
- **Gating (Next disabled until valid):**
  - Step 1: a value is selected.
  - Step 2: a story is chosen.
  - Step 3: ≥1 page **and every page has non-empty narrator text**.
  - Step 4: an art style is selected.
  - Disabled Next = muted `#d9d5e8`, `cursor:not-allowed`.

**Step 1 — Value**
- H2 "What should this story teach?" + hint to hover.
- Grid (`minmax(150px,1fr)`) of 9 value cards: name (Fredoka 18) + short tagline. Selected card fills with the value's color and white text; others white with ink outline. Hover lifts slightly.
- Below the grid: a dark **definition panel** (`#1E1B2E`, white text) showing the hovered (or selected) value's name + full description, with a swatch in the value's color. Hovering a card updates this panel live; selecting also sets it.
- **Side effect:** changing the selected value resets the chosen story, sections, and title (since stories are value-specific).

**Step 2 — Story**
- H2 "Choose a story" + "Three tales about {value}. Tap a title to read it, then pick your favorite."
- A vertical list of 3 expandable story cards. Each card header: emoji dot, title (Fredoka), one-line blurb, and a "Read ▼" / "Hide ▲" toggle. Expanding reveals the **full multi-paragraph story** (`white-space: pre-line`) and a **Choose this story** button.
- Chosen card: header bg `#FFF1C2`, colored hard shadow `5px 5px 0 #FF4D6D`, button turns green "✓ Chosen".
- **Side effect:** choosing a story sets the draft **title** and copies that story's **sections** (image description + narrator text per page) into the draft.

**Step 3 — Pages**
- H2 "Build the pages."
- **Story title** text input (controlled, max-width 520px).
- A list of **page cards**. Each: header ("Page N" with a numbered dot) + **Remove** button; body is a 2-column responsive grid of two textareas — **🖼 Picture** (image/illustration description) and **🗣 Narrator text**.
- **+ Add a page** button (full-width, green, dashed border) appends an empty page.
- Add / remove / edit all mutate `draft.sections`.

**Step 4 — Style**
- H2 "Pick an art style" + "Here is page 1 in three styles."
- 3 selectable preview cards, each rendering the book's **first page** via `StoryPage` in that style (`crayon`, `cutout`, `watercolor`). Selected card gets a pink ring + light pink panel + green ✓ checkmark.
- If there are no pages yet, a sample page is shown so styles still preview.

**Step 5 — Review**
- H2 "Review your book" + "Every page in {Style} style."
- A grid showing the **cover** plus **every page** rendered in the chosen style (read-only `StoryPage`s).
- A summary bar: "{N} pages · teaches {value} · {Style} style", with **↩ Make changes** (→ back to step 3) and **✓ Add to library** / **✓ Save changes** (accept).
- **Accept:** builds the final book object and either updates the existing book (edit) or appends a new one (create), persists to storage, returns to **Library**, and sets it as current.

---

## Interactions & Behavior (summary)
- **Navigation between views** is state-driven (`view` ∈ `login | library | reader | create`). No router in the prototype, but URL routing is recommended in production (`/login`, `/library`, `/book/:id`, `/create`, `/edit/:id`).
- **Hover/active motion:** see Visual Language. Apply consistently to buttons and cards.
- **Form validation:** only the wizard gating rules above (per-step). Login is unvalidated.
- **Confirm on delete** via a blocking confirm dialog — replace with your app's modal/toast pattern.
- **Responsive:** all layouts are fluid. Two-column login wraps to stacked; grids use `auto-fill/auto-fit minmax`; type scales with `clamp()`. Verify down to ~360px wide.
- **Animations:** entry animations were intentionally removed from the prototype (they interfered with static capture). Keyframes `ss-pop`, `ss-fade`, `ss-page` are defined and may be re-applied as enter transitions in production if desired (pop/scale, fade-up, page-slide).

---

## State Management
Prototype state (in the `Component` class of `Storyseed.dc.html`) — map to your store/hooks:

| State | Meaning |
|---|---|
| `view` | active view: `login` / `library` / `reader` / `create` |
| `loginEmail`, `loginPass` | controlled login inputs (not persisted) |
| `userName` | display name ("Maya") for greeting + avatar initial |
| `books[]` | all saved books (the persisted collection) |
| `currentBookId` | which book the reader is showing |
| `readerPage` | current page index in the reader (0 = cover) |
| `step` | wizard step 1–5 |
| `draft` | the book being created/edited (see data model) |
| `editingId` | id of book being edited, or null for create |
| `expandedStoryId` | which story card is expanded in step 2 |
| `hoverValueId` | which value's description shows in step 1 panel |

**Key transitions/triggers:** sign in → library; open book → reader; new/create tile → wizard(create); edit icon → wizard(edit, prefilled); next/back/jump → change `step` (gated); choose value → set accent + reset story/sections/title; choose story → set title + copy sections; accept → upsert into `books` + persist + return to library.

### Data model
```
Book {
  id: string
  valueId: string          // e.g. "courage"
  value: string            // display name e.g. "Courage"
  accent: string           // hex, derived from the value
  title: string
  storyId: string          // which template story was chosen
  styleId: string          // "crayon" | "cutout" | "watercolor"
  sections: Section[]
}
Section {                  // one page
  imageDesc: string        // illustration description (placeholder art today)
  text: string             // narrator text shown on the page
}
```
The reader's page list is `[{kind:'cover'}, ...sections.map(kind:'page')]`.

---

## The StoryPage component (`StoryPage.dc.html`)
A single reusable renderer for **one cover or one page**, in one of 3 art styles. Recreate as a presentational component.

**Props:** `kind` (`cover` | `page`), `title`, `value`, `accent` (hex), `imageDesc`, `text`, `variant` (`crayon` | `cutout` | `watercolor`), `pageNum`, `pageTotal`.

> Note: the style prop is named **`variant`**, not `styleId` — in the prototype runtime any attribute beginning with `style-` is reserved, so `style-id` must be avoided. Name it whatever you like in your codebase; just don't collide with framework-reserved names.

**Structure:** an outlined, rounded, hard-shadowed card filling its container (`width/height:100%`).
- **Illustration area** (flex-grows): background depends on `kind` + `variant`:
  - Cover → solid `accent` color.
  - `crayon` → diagonal hatch lines over warm yellow.
  - `watercolor` → two soft radial-gradient blooms over pale blue.
  - `cutout` → flat green with two outlined decorative shapes (circle + rounded square).
  - **Cover** overlays a pill chip (the value name) + the large title (Fredoka, clamp 24–50px).
  - **Page** overlays the image description as a small monospace caption ("✎ …") at the bottom of the art — this is the **placeholder for real illustration**.
- **Text band** (pages only): bottom band (`variant`-tinted) with the narrator `text` (Poppins, clamp 14–21px) and a "Page N" label.

The 3 styles are expressed purely via palette/pattern/texture — there is no real illustration art in the prototype.

---

## Assets
- **Fonts:** Google Fonts — **Fredoka** and **Poppins**. (The prototype also references Baloo 2 / Nunito / Quicksand from exploration; only Fredoka + Poppins are used in the final.)
- **Icons/emoji:** plain Unicode emoji (🦊 🐰 🐻 🖼 🗣 ✎ 🗑 ✓ ← → ‹ ›). Swap for your icon set if you prefer crisp icons.
- **Illustrations:** **none included — this is the main asset gap.** Each page carries an `imageDesc`. In production, generate art from that text (text-to-image) or let users upload/commission illustrations, and render the image in StoryPage's illustration area in place of the colored placeholder.
- **No external images, logos, or SVG files** are required to reproduce the UI.

---

## Production Notes (what's faked in the prototype)
1. **Auth** — login accepts anything. Replace with real authentication; gate the library/reader/wizard behind it.
2. **Persistence** — books are stored in browser `localStorage` under key `storyseed.books.v1`, seeded with 3 sample books on first load. Replace with a database + API so books sync across devices. Keep the same `Book`/`Section` shape as a starting contract.
3. **Stories** — step 2 offers 3 hard-coded template stories generated from the chosen value's name. In production these would likely be generated per-value (e.g. via an LLM) or authored/curated.
4. **Artwork** — see Assets. The biggest real-world piece.
5. **Routing** — add real URL routes for shareable/bookmarkable views.

---

## Files (in this bundle)
- `design_files/Storyseed.dc.html` — full app: all four views, the 5-step wizard, and all state logic. **Primary reference.**
- `design_files/StoryPage.dc.html` — the cover/page renderer (3 art styles).
- `design_files/support.js` — prototype runtime only; **not part of the design, do not port.**

To view the prototypes' behavior, open `Storyseed.dc.html` in a browser (it loads `support.js` and the fonts). Everything else in this README is sufficient to implement the design without running it.
