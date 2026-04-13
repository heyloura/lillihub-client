# Lillihub 2.0 Plan

Grounded in [SOUL.md](SOUL.md). The goal of 2.0 is not new features — it's **structural clarity** so the soul of the project can breathe again. No behavior changes users will notice, except where UI polish is explicitly called out in Phase 7.

Phases are ordered so each one makes the next one easier. Each phase should be tackled in small commits so a bisect can find a regression if anything goes sideways.

---

## Phase 0 — Smoke test harness ✅

**Why first**: insurance for the main.js split. Catches dumb mistakes (missed import, wrong function name) in 2 seconds instead of 28 manual page loads.

- [x] Create `tests/` directory + `tests/fixtures/` with 11 minimal JSON fixtures
- [x] Create `tests/smoke_test.js` — stubs `globalThis.fetch` with URL-pattern routing to fixtures, calls each layout's template function with a mock user
- [x] Added `deno.json` with `dev` and `test` tasks, documented in README
- [x] 15 tests covering: timeline (streaming), discover, tagmoji, mentions, replies, user, bookmarks (both populated and empty), books, notebooks, notes, single, favorites + 2 regression tests for the `?error=` banner feature
- [x] `deno task test` runs in **762ms** (target was <5s)

**Not yet covered** (add if needed during refactor):
- blog, media, editor (form-heavy, would need richer fixtures)
- conversations.js (uses `Deno.openKv`, needs either mocking or a real local KV)
- lillihub.js (works via test env var, but not currently in the test suite — easy to add)
- admin, users, bookshelves, bookshelf, book, note-new, note-view (low value for Phase 1 safety net)

**Deliverable**: ✅ `deno task test` → 15 passed, 0 failed. Safety net in place for the main.js split.

---

## Phase 1 — main.js split (mechanical) ✅

**Why**: the single biggest structural mess. main.js was 1,567 lines, 64 routes, one giant `handler()`. Splitting by route group collapses the "everything app" feeling without changing any behavior.

**Result**:
- main.js: **155 lines** (down from 1,567 — a 90% reduction, now a thin dispatcher)
- 9 route files in `routes/`, each owning a feature group with its own URL patterns and `tryHandle(req, ctx)` export
- `SESSION` map extracted to `scripts/server/session.js` so main.js and auth.js can both touch it without circular imports
- Per-file line counts: admin 20, settings 28, static 67, books 121, auth 130, bookmarks 183, blog 216, social 315, notes 350
- All 15 smoke tests green throughout. Final validation: `deno run main.js` boots cleanly to the `serve(handler)` call (parses + module-loads + dispatcher constructed without errors)

**Deviations from the original plan**:
- ROBOT_ROUTE stayed inline in main.js (it must run *before* the bot filter, which would otherwise 401 search engine crawlers fetching `/robots.txt`)
- SESSION extraction added as Step 0 of Phase 1 to enable auth.js without circular imports

---

## Phase 2 — Middleware extraction ✅

**Why**: now that routes are split, the request-prep work (cookie → session → user → token) is repeated in `ctx` construction. Pull it into a single builder so each file's logic only deals with business rules.

**Result**:
- `scripts/server/request-context.js` (52 lines) — `buildRequestContext(req)` returns `{ user, accessToken, accessTokenValue }`
- `scripts/server/pre-filters.js` (50 lines) — `tryPreFilter(req)` handles robots.txt, bot blocking, WordPress probe denial as a unified middleware step
- main.js dropped from 155 → **69 lines**, with the actual `handler()` function at ~25 lines. Three-step dispatch flow: pre-filter → static → context+route loop
- `ROUTE_GROUPS` array dedupes the per-group dispatcher boilerplate (8 blocks × 4 lines → one `for...of` over 8 entries)
- All 15 smoke tests green; main.js boots cleanly to `Listening on http://localhost:8000/`

**Not done** (deferred — TODO mentioned as "consider"):
- `requireUser(ctx)` helper. The current `if (ROUTE.exec(req.url) && user)` pattern is short and clear; a helper would add indirection without saving code. Skipped intentionally.
- Per-route audit of `user`/`accessTokenValue`/cookie parsing simplification. None of the route files do their own cookie parsing — they all just destructure ctx. Already clean.

---

## Phase 3 — templates.js consolidation ✅

**Why**: `HTMLPage` and `HTMLPageStart`/`HTMLPageEnd` were ~90% duplicate code. Change the sidebar, edit it twice.

**Result**:
- Two private helpers in templates.js: `_pageShellStart(title, user, redirect, navContent, context)` (the head + body + nav + sidebar + page-nav through `<div class="content">`) and `_pageShellEnd()` (closing tags)
- `HTMLPage` is now a 5-line wrapper: `_pageShellStart(...) + contentHTML + _pageShellEnd()`
- `HTMLPageStart` and `HTMLPageEnd` are 3-line wrappers around the same helpers
- templates.js: 383 → **307 lines** (76 lines of duplication gone)
- Timeline streaming smoke test passes — confirms HTMLPageStart/HTMLPageEnd seam still works
- All 15 smoke tests green; main.js boots cleanly to `Listening on http://localhost:8000/`

**Tiny behavior change**: the original `HTMLPage` indented `${contentHTML}` with 12 spaces inside the content div. The refactored version inserts `contentHTML` at column 0 (matching how the streaming variant already worked). Visually identical to users — browsers ignore whitespace inside `<div>` — but the served HTML source has slightly different whitespace.

**Note for future cleanup**: `HTMLPage` and `HTMLPageStart` both still take `token` as their first positional parameter, but neither function uses it. Removing it would cascade through every layout. Saved for Phase 7's polish pass.

---

## Phase 4 — Finish Spectre removal ✅

**Surprise finding during the audit**: Spectre wasn't being loaded at all! No `<link>` in templates.js, no `Deno.readFile` in any layout, no `@import` in lillihub.css. The two `styles/spectre*.css` files were pure dead weight, and "half-migrated" was actually "fully unloaded but the dead files were still on disk." That changed Phase 4 from a risky migration into a 4-step cleanup.

**Result**:
- Deleted `styles/spectre.css` (5,589 lines) and `styles/spectre.min.css`. `styles/` now contains only `icons.css`, `lillihub.css`, `style.css` — exactly the deliverable.
- **Bug fix**: added `.toast`, `.toast-warning`, `.toast-error`, `.btn-clear` to lillihub.css. These were referenced by the `errorBanner()` helper added in Phase 2 but had no CSS rules — the error banners we built were unstyled (a Phase 2 regression I didn't catch).
- Updated the lillihub.css header comment from "replaces Spectre.css progressively" to reflect that Spectre is now fully gone.
- Audit produced a list of ~30 other orphaned classes (referenced in templates but not styled by lillihub.css/style.css). **Not addressed in Phase 4** because the app currently renders fine for the user without them. They get reviewed in Phase 6 (CSS cleanup) or Phase 7 (feature walkthrough) where each can be deliberately styled, removed, or left as a no-op hook. See below for the list.
- All 15 smoke tests green; main.js boots cleanly.

### Orphan classes deferred to Phase 6/7

These appear in templates/layouts but have no CSS rule. The user reports the app currently renders correctly, so most are likely either decorative or replaced by parent layout constraints. Visit these during the feature walkthrough:

**Spectre-style utilities** (probably safe to remove from templates): `btn-block`, `btn-sm`, `c-hand`, `container`, `d-block`, `d-inline-block`, `dropdown-toggle`, `form-group`, `input-group-btn`, `p-centered`, `page-item`, `pagination`, `text-left`

**Lillihub-specific orphans** (might want minimal styles, or might be safe to remove): `blog-page`, `blog-toolbar` (defined but only `blog-toolbar-row` is in style.css), `book-card`, `bookmarks` (likely stale), `editor-checklist-item`, `favorites-tile`, `media-row`, `media-row-actions`, `media-row-main`, `note`, `note-card`, `note-title-text`, `post-summary`, `sidebar-action-orange`, `sidebar-action-purple`, `sidebar-action-red`

---

## Phase 5 — Template directory reorganization ✅

**Why**: 47 files in a flat templates directory, partials and pages intermixed. After the routes split, the templates should mirror the structure.

**Result**:
- 7 subdirectories: `templates/social/`, `templates/bookmarks/`, `templates/books/`, `templates/blog/`, `templates/notes/`, `templates/settings/`, `templates/_shared/`
- All 44 templates moved with `git mv` so blame history is preserved
- All `Deno.readFile("templates/...")` paths updated across 21 layouts and 2 route files
- 3 orphan templates deleted (`_dropdown.html`, `_reply_form.html`, `_timeline_settings.html`) — confirmed unused via exhaustive grep
- No `auth/` subdirectory needed: settings.html sits alone (and could go elsewhere if it grows), and the auth-related partials (`_login.html`, `_cta.html`) live under `social/` because they're used exclusively by the discover layout
- All 15 smoke tests green; main.js boots cleanly to `Listening on http://localhost:8000/`

**Final layout** (7 directories, 44 files):
- `_shared/` (5): `_post`, `_conversation`, `_comments`, `_actions`, `_reply` — the post-rendering primitives used by `_post.js`
- `social/` (15): timeline, discover, mentions, conversations, lillihub, user, users + 8 partials
- `bookmarks/` (4): bookmarks, bookmark-new + 2 partials
- `books/` (6): books, bookshelves, bookshelf, book + 2 partials
- `blog/` (6): blog, editor, media + 3 partials
- `notes/` (7): notebooks, notes, note-view, note-view-todo, note-edit, notebook-new, _note
- `settings/` (1): settings

---

## Phase 6 — Targeted CSS cleanup ✅

**Why**: now the baseline is stable (Spectre gone, structure clean) you can finally look honestly at `lillihub.css` and `style.css`.

- [ ] Audit `lillihub.css` and `style.css` for unused rules. Grep each class name against templates/ and layouts/. Delete dead rules
- [ ] Consolidate duplicates between the two files
- [ ] Reorganize rules by component: theme vars → reset/base → layout shell → nav → post card → conversation → toolbars → forms → utilities
- [ ] Consider splitting: `styles/base.css` (theme + reset + semantic element defaults), `styles/components.css` (post, nav, sidebar, form components), `styles/utilities.css` (helper classes). Only split if it helps — one big organized file is also fine
- [ ] **Decision point**: at this stage, re-evaluate the "style HTML tags directly, targeted classes when needed" direction you're interested in. If you want to lean into it, that's a Phase 6b. If the cleanup alone is enough — stop here.

**Deliverable**: CSS you enjoy reading.

---

## Phase 7 — Feature walkthrough + UI polish

**Why**: with a clean base, walk through every feature as a user and note UX issues you've been ignoring because the code was too tangled to touch.

- [ ] Walk through each area with fresh eyes: Timeline → Discover → Mentions → Replies → Favorites → User profile → Bookmarks → Highlights → Bookshelves → Book detail → Notes → Notebook → Note view → Todos → Blog → Editor → Media → Settings → Auth flow
- [ ] For each, write 1-3 lines: what's working, what's awkward, what's missing. Don't fix anything during the walkthrough
- [ ] After the walkthrough, pick the top 5 polish items and do them
- [ ] Wire up the `?error=` banner display we built in batch 2 (currently emits the param but doesn't read it)
- [ ] Consider removing dead PostTemplate parameters (`token`, `getFollowing` — both unused after Batch 3) now that you're editing every call site anyway

**Deliverable**: a 2.0 release you feel good about.

---

## Phase 8 — (Optional) expanded tests

Only if the smoke tests feel too thin after the refactor dust settles.

- [ ] Add integration-ish tests for mutation handlers: add note, move note (both success and partial-failure paths), create bookmark with tags, rename notebook
- [ ] Stub fetch for different failure modes: network throw, non-2xx, malformed JSON, empty items
- [ ] Goal: "I can refactor a mutation handler without clicking through the UI to verify"

---

## Operating principles for the whole refactor

- **Commit after every natural pause.** Small diffs are easier to review when you forget what you did last weekend.
- **Run `deno test` before every commit** once Phase 0 is in.
- **No new features during the refactor.** Feature ideas go into a separate "ideas.md" — not this file.
- **When in doubt, do less.** The soul is already here. We're removing noise, not adding signal.
- **Check against [SOUL.md](SOUL.md) when tempted to add anything.** If a change doesn't serve server-rendered HTML, progressive enhancement, conversation-centric reading, or unified micro.blog workflow — skip it.
