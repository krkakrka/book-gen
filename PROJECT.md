# PROJECT.md — Storyseed (Book Management Webapp)

## What this is
A web app for creating, reading, editing, and deleting personalized children's picture books (ages 3–6). Each book teaches one human value/trait (e.g. Courage, Kindness) through a short illustrated story, built by a parent/guardian via a guided multi-step creation flow.

## Core use cases
1. **Login** — user signs in to access their library.
2. **View books** — see a library (grid) of saved books, click one, and read it by flipping through pages back and forth (like an e-reader).
3. **Create a book** — via a 5-step guided form:
   - **Step 1 — Value:** choose one human value/trait from a set (e.g. "Responsible — someone who takes ownership and follows through"). Each option's full description appears on hover rather than being shown up front.
   - **Step 2 — Story:** pick from a list of story titles for that value; clicking a title expands it to show the full detailed story; user must choose exactly one.
   - **Step 3 — Pages:** the chosen story is broken into sections/pages. Each section has an image description (what the illustration should show) and narrator text (what's read aloud on that page). User can add, remove, and edit these sections freely.
   - **Step 4 — Style:** the same page is previewed in 3 different illustration styles; user picks one style for the whole book.
   - **Step 5 — Review:** every page is shown rendered in the chosen style; user reviews and either accepts (saves to library) or declines (goes back to make changes).
4. **Edit a book** — reopen any saved book through the same step flow, prefilled, and save changes.
5. **Delete a book** — remove a book from the library (with a confirmation step).

## Audience & tone
Children ages 3–6 are the reader; parents/guardians are the ones logging in and building books. Visual tone is playful, colorful, and energetic ("Bold Pop" direction — bold outlines, hard drop-shadows, bright saturated colors) — one of 3 directions explored (Crayon Sunshine, Soft Storybook, Bold Pop); Bold Pop was the one selected.

## Scope decisions made during design
- **Login:** kept intentionally simple — a visual sign-in screen only; any input proceeds. No real authentication required at the prototype stage.
- **Persistence:** created/edited books persist across refresh, saved in the browser (localStorage) rather than requiring a backend for the prototype.
- **Reading view:** pages are treated as image/scan-style pages the reader flips through, one at a time, forward and back — not a plain running-text e-reader.
- **Platform:** responsive — must work on both desktop and mobile layouts, not a single fixed size.
- **Visual exploration:** three visual directions were designed and screened side by side before building the full app; the user chose Direction C, "Bold Pop."

## What's simulated vs. real (as of this prototype)
- **Auth** is real — session-based login/logout against a Django backend, with a single seeded dev user (no self-serve signup flow yet).
- **Storage** is a real shared database — books are persisted via a Django REST Framework API backed by PostgreSQL, not localStorage, so libraries sync across devices/browsers for the logged-in user.
- **Illustrations** are not generated or uploaded — pages show a colored placeholder plus the typed image description as a caption. Real artwork generation/upload is the main remaining gap before this is production-ready.
- **Stories** offered in Step 2 are a small fixed set of templates per value, not an open-ended generation system (though the design assumes more stories/values could be added the same way).

## Suggested next steps (not yet built, would need sign-off)
- Self-serve signup/account management (today there's a single seeded dev user).
- A real illustration pipeline (text-to-image generation from each page's image description, or an artist upload flow) to replace the placeholder art.
- Expanding the story template library, or generating stories per value dynamically.
- Native app packaging if this needs to run as an actual mobile app rather than a responsive web app.

---
See also `ARCHITECTURE.md` for the technical stack, `design/README.md` for the visual/interaction spec, and `TEST_CONTRACT.md` for the exact selector/behavior contract.
