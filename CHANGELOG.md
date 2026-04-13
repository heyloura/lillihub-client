# Changelog

## 2.0 — 2026-04-11

Lillihub 2.0 is a **structural refactor release**. The goal was to make the
app easier to live with: clearer code, fewer files, less clutter, fewer
bugs. Most visible changes are polish rather than new features — but the
codebase underneath is dramatically simpler than 0.2.5 and the project is
now in a place where future features can ship faster.

### The soul of the project

Before the refactor, Lillihub committed to a
[SOUL.md](SOUL.md): server-rendered HTML, progressive enhancement,
conversation-centric reading, fun and nostalgic dark UI, minimal JavaScript,
tying together micro.blog features in a unified workflow. 2.0 leans into
all of that.

### Highlights

- **90%+ reduction in the main dispatcher.** `main.js` went from 1,567
  lines (one giant `handler()` with 64 routes) to **69 lines** (a clean
  dispatcher that walks a `ROUTE_GROUPS` array). Routes are now split into
  8 feature files under `routes/`.
- **Full-coverage smoke tests.** New `tests/smoke_test.js` uses fixture
  JSON to stub `globalThis.fetch` and validates every GET-rendering
  layout. Runs in under a second via `deno task test`. This safety net
  protected every refactor phase and will catch regressions going forward.
- **Dark mode only.** Light mode was removed (along with the dark-mode
  toggle and ~80 lines of theme-switching machinery). The dark theme is
  hardcoded as the sole palette. Less code, clearer identity.
- **Spectre.css fully removed** — plus `~5,600 lines of dead CSS` deleted
  across the two Spectre files and a targeted cleanup pass in lillihub.css.
- **Favorites, Lillihub feed, and Lillihub admin removed.** Three whole
  features unshipped. ~10 files deleted, routes collapsed, star icons
  purged from the action button rows.
- **Templates reorganized** into 7 feature-based subdirectories under
  `templates/` (was a flat 47-file mess).

### What's new

- **Error banners for note/notebook write failures.** Add/delete/rename/
  move actions on notes and notebooks now redirect with a `?error=` param
  that renders a dismissible toast at the top of the page. A distinct
  `move_duplicate` variant warns the user when a move copied successfully
  but the delete of the original failed.
- **Bookmarks lazy-load.** The bookmarks page used to fetch every
  bookmark (up to 1,000) on every load. It now shows the first page and
  offers a "Load all bookmarks" link. Search auto-promotes to full load.
  Big speedup for users with lots of bookmarks.
- **"Not following" marker** (`+` badge) appears next to usernames of
  people the current user doesn't follow, on both post headers and inline
  reply headers. Subtle hint that a follow action is available.
- **Follow set prefetch across all feed layouts.** Previously discover,
  mentions, replies, user profiles, and bookmarks all fired N+1
  `is_following` API calls per feed (one per post). Now a single
  `getFollowingList` call is made per page and passed into `PostTemplate`
  as a Set. Same pattern as timeline.
- **Concurrency-limited conversation fetches.** Feed layouts that
  hydrate conversations (`timeline`, `mentions`, `conversations`, `user`,
  `lillihub`) now cap parallel `getConversation` calls at 5 via a new
  `createLimit()` helper. The 5-minute `_convoCache` helps repeated views.
- **`sanitizeHTML()` helper** — blog posts are now sanitized via ammonia
  before rendering. Previously a blog post could inject `<style>` or
  `<script>` into the Lillihub UI via raw HTML in its markdown. Now
  stripped at the server side. Double-sanitize step also prevents
  `linkedom`'s serializer from producing self-closing `<p />` that browsers
  would parse as an unclosed tag, which would collapse subsequent posts
  into the first post's card.
- **Streaming timeline preserved and cleaned up.** `HTMLPage`, `HTMLPageStart`,
  and `HTMLPageEnd` now share a single source of truth (`_pageShellStart`
  / `_pageShellEnd` helpers) — no more ~180 lines of duplicated page chrome.

### Architecture changes

- **`main.js` is now a thin dispatcher.** Entry point reads as:
  pre-filter → static → request context build → `for` loop over 8 route
  groups → 404. The whole handler fits on one screen.
- **New server modules:**
  - `scripts/server/request-context.js` — cookie → session → user resolution
  - `scripts/server/pre-filters.js` — robots.txt, bot filter, WP probe filter
  - `scripts/server/session.js` — in-memory `SESSION` cache shared between
    the request context builder and the auth route
- **Routes split** into 8 files under `routes/`:
  `auth`, `blog`, `bookmarks`, `books`, `notes`, `settings` (since removed
  in Phase 7), `social`, `static` — each exporting a `tryHandle(req, ctx)`.
- **Templates reorganized** into 7 subdirectories matching the routes.

### Bug fixes

- **Error handling holes closed.** Every `fetch` + `.json()` in the app
  that previously crashed on network errors or malformed responses is now
  wrapped in try/catch. Affected: `getConversation`, `getIsFollowingUser`
  (removed), bookmarks/tags fetches, media upload/delete, notes
  pagination, indieauth token exchange, bookmarks render paths, notes
  render paths. A micro.blog hiccup no longer crashes entire page renders.
- **Silent write failures now visible.** `ADD_NOTE`, `DELETE_NOTE`,
  `ADD_NOTEBOOK`, `RENAME_NOTEBOOK`, `DELETE_NOTEBOOK`, `COPY_NOTE`,
  `MOVE_NOTE` previously redirected on failure as if successful. Now they
  check `posting.ok` and emit an error code in the redirect URL, which is
  displayed as a toast on the destination page.
- **N+1 `is_following` API calls eliminated** across discover, tagmoji,
  user profiles, books, bookmarks (new form), mentions, replies,
  conversations, and the user posts tab.
- **Unbounded fan-out in feed layouts fixed** via the new `createLimit(5)`
  concurrency cap.
- **Logout now clears the in-memory `SESSION` entry** so a stale cookie
  from another browser can't re-authenticate against the same encrypted
  token. Previously, the cookie was cleared but the server-side session
  cache entry remained.
- **State cookie hardened** on the discover / unauthenticated landing page
  — added `SameSite=Lax`, `Secure`, `Path=/` (previously only `HttpOnly`).
- **Add Follower / Add Bookmark buttons now have a hover effect.** Was
  broken because `.inline-action { display: inline }` gave the form no
  hover hit area. Fixed with `display: inline-block` plus a backup hover
  selector.
- **Sidebar area nav links now retain their per-area color on hover.**
  A global `a:hover` rule was overriding the per-color classes; fixed by
  scoping the per-color rules with `.sidebar-nav-item.sidebar-nav-X:hover`
  specificity.
- **Refresh button at bottom of timeline now uses correct dark text.**
  Same underlying issue as the sidebar nav bug — global `a` rules
  overriding `.paging a`.
- **Mobile FAB no longer hides the Next button on the Uploads page.**
  Added `padding-bottom: 5rem` inside the mobile media query.
- **Add Book button on discover books page now aligns with sibling
  actions** and has the correct red hover color (was green).
- **Per-area hover colors on action buttons.** Previously every area's
  action buttons hovered to green regardless of area. Now bookmarks
  hovers purple, bookshelves hovers red, notes hovers orange, blog
  hovers blue. Paging buttons also picked up per-area colors.
- **Spinner on form submit is now visible.** Was grey on a green button
  (invisible). Now white.

### UI polish

- **Post card action buttons have a clearer, more distinct hover effect.**
  Bolder gradient swing with box-shadow lift and `opacity: 1 !important`
  so `<a>` and `<button>` variants match.
- **Placeholder text in all inputs and textareas** now uses the theme's
  `--overlay-1` color instead of the browser default grey.
- **Inline replies now use the full post card shell** (card header /
  body / footer) with a raised `--mantle` background and indentation to
  nest under the parent post. Replaces the old compact tile-style layout.
- **Sidebar footer simplified.** Was: settings link + logout + github +
  version + built-by. Now: avatar/username + a `⋯` overflow menu
  (`<details>`-based, no JS) containing logout / github / version /
  built-by.
- **User profile actions** (follow button + gear dropdown) restyled to
  a subtle outline look. Content leads, actions recede.
- **Tagmoji chips** get a hover state and now include a "× Clear"
  chip at the end of the list to return to unfiltered discover.
- **Post single-view icon** changed from `bi-binoculars` to
  `bi-arrows-angle-expand` with a "View post" title tooltip.
- **Reply form** has more spacing under recipient checkboxes and long
  cross-instance usernames (e.g., `@user@mastodon.social`) now wrap
  cleanly on mobile instead of overflowing.
- **Bookmarks "Load all" button** picks up the area's purple accent
  color. Paging buttons across areas (blog blue, books red, notes
  orange) also respect their area color.

### Removed

- **Settings page** — the only remaining option (dark mode toggle) was
  removed along with light mode, and "Clear secret key" already exists
  on the notebooks page. Route, layout, template, and sidebar link all
  deleted.
- **Favorites** — full feature removal. Routes, layout, templates,
  `feeds` array from prefs cookie, `display` field from prefs cookie,
  star icons on post action rows, sidebar nav link, page nav link.
- **Lillihub feed** (`/lillihub`) — experimental feed removed along
  with `LILLIHUB_TOKEN` env var.
- **Lillihub admin** (`/lillihub-admin`) — heyloura-only dashboard
  removed.
- **Dark mode toggle and entire light theme** (Phase 6b).
- **`CSSThemeColors()` function** (~80 lines of theme-switching JS).
- **Dead client JS:** `liveSearch`, `toggleCard`, and `show-menu` legacy
  handler removed from `common.js`. Client JS now 23 lines of all-live
  code (was 41).
- **Dead CSS rules** — ~75 orphan class definitions deleted from what
  was `lillihub.css` and `style.css`. CodeMirror/EasyMDE rules,
  unused color text/border families (24 classes), modal/off-canvas
  rules (Spectre modal system never wired up), masonry/image-carousel
  layouts never shipped.
- **`style.css` file** — merged into `lillihub.css`. `styles/` went
  from 5 files (8,800+ lines total) to **2 files** (`lillihub.css`
  and `icons.css`).
- **3 orphan template files** (`_dropdown.html`, `_reply_form.html`,
  `_timeline_settings.html`) — confirmed unused via exhaustive grep.

### Changed

- **`deno.json`** added with `dev` and `test` tasks. Run the dev server
  with `deno task dev`; run the smoke tests with `deno task test`.
- **README** updated with test instructions.

### Known issues carried forward to post-2.0

A curated `ideas.md` file tracks remaining polish, features, and
questions. Notable items:

- **Videos in timeline posts don't play** — possibly a browser issue on
  my end, not confirmed to be a Lillihub bug. Needs investigation.
- **Highlights page is a placeholder** — the data layer is there
  (`fetchAllHighlights`) but the layout just says "coming soon".
- **"New posts available" alert** — design question pending.
- **`lh_prefs` cookie currently stores `{}`** — favorites was the last
  consumer. Machinery is kept as scaffolding for a future user pref.

See `ideas.md` for the full list.

---

## 0.2.5 and earlier

See git history. Lillihub started as a personal experiment to build a
micro.blog client with as little JavaScript as possible. 2.0 is the
first release that treats the codebase like a long-lived project
instead of a scratch pad.
