# Ideas — post-2.0

Tracking work that didn't make it into 2.0. Scratchpad for polish, features,
bugs, and design questions. Groupings are loose — promote items out of here
when you're ready to act on them.

Resolved items from the 2.0 work have been moved into [CHANGELOG.md](CHANGELOG.md).

---

## Bugs


---

## UI polish

### Post action row

- **Add Follower and Add Bookmark hover — belt-and-suspenders selector cleanup.**
  The current fix has both `.inline-action { display: inline-block }` AND a
  backup `.card-header-actions .inline-action:hover button.btn-link` selector.
  Only one is probably needed. When the CSS cleanup pass from the ideas list
  below happens, remove whichever is redundant.

### Discover

- **Inline replies on discover (and tagmoji pages).** Currently discover and
  tagmoji render posts via `_post.js` but don't fetch conversations, so reply
  context is missing. Adding it would require per-item `getConversation` calls
  with the existing `createLimit(5)` concurrency cap. `_convoCache` would help
  on repeat views. **Needs a discussion about API call budget first** — if a
  user opens discover then timeline, that's two waves of conversation fetches
  even with caching. Is the reply context worth the latency on a "browse and
  skim" surface?

### Replies

- **Load conversation context for each reply** so the user can see what they
  were replying to. Currently the replies feed shows your reply with no
  parent. Same API-call concern as the discover inline replies idea. Same
  decision needed.

### Following

- **Manage followers tool.** Walk the user's following list, fetch each
  user's last post date, surface stale/dead accounts so the user can prune.
  Needs a new server route, a rate-limit strategy with concurrency capping,
  and a review/bulk-unfollow UI. Bigger feature.

### New Post / Editor

- **Tags and Share/syndicate UI styling.** Checkbox lists are too small and
  dense; should pick up the blog area's accent color (blue).

- **Blog destination dropdown is too small.** Hard to tap on mobile. Needs
  more padding, larger font, possibly a different control (radio buttons or
  a list).

- **Split publish/draft status into two buttons: "Save draft" and "Publish".**
  Cleaner UX — the user picks the action, not the target state.

- **Image attach workflow needs to wait for AI alt text.** Micro.blog
  generates alt descriptions but returns the image URL before the alt is
  ready (seconds later). Currently the inserted markdown has no alt. Need a
  polling/refresh pattern: insert a placeholder image link with a sentinel
  alt text, then poll a server endpoint and replace the sentinel when ready.
  Related to the "new posts available" alert — same underlying "wait for
  something" pattern.

- **Image preview after attaching.** Currently the user sees the inserted
  markdown `![](url)` but no visual preview. A small thumbnail or rendered
  preview pane below the textarea would close the loop.

- **Support for micro.blog post `summary`, `lat`, and `lng`.** Micro.blog's
  API supports these on posts. Add form fields + plumb through ADD_POST /
  EDIT_POST handlers.

- **Smart character count** like micro.blog's — counts displayed text (not
  raw markdown). Needs ~10 lines of vanilla JS for a live counter under the
  textarea.

- **IndieWeb post-type support: rsvp, u-like.** Micropub supports richer
  post types. Adding rsvp and u-like would let Lillihub interact with
  calendar invitations and IndieWeb-style "like" posts. Editor UI + ADD_POST
  handler fields needed.

- **Editor uses green (social) accent color but it's a blog-area page.**
  The editor sits in the blog area (blue) but has green styling on action
  buttons. Should pick up `area-blog` styling. Tied to the "link color per
  area" design question below.

### User profile

- **Move user actions (follow, mute, block) to the bottom of the profile
  card.** Already subtler post-2.0, but positioning them at the bottom
  would further reinforce "content first, actions recede."

### Bookmarks

- **More obvious tag chip hover.** Bookmark tag chips have a hover state
  but it's too subtle. (Post-2.0 note: partially addressed by the global
  `.chip:has(a):hover` rule, but specific bookmark tag chips may need more
  contrast.)

- **Header spacing: "bookmarked (date)" is too large.** Tighten the
  typography of the metadata row so the avatar anchors the row instead of
  competing with the date.

- **The "X highlights" chip is hard to read.** `bookmark-highlight-chip`
  uses yellow-on-dark which technically has contrast but reads oddly.
  Pick a more distinct treatment.

- **AI summary styling differs between bookmarks and media pages.**
  Same kind of AI-generated content, different visual treatment. Pick one.

- **Fall back to a Reader excerpt when there's no AI summary.** Show the
  first ~200 characters of reader content. Better than blank.

- **Jump back to the edited bookmark after tag changes.** Use a
  `#bookmark-${id}` fragment in the redirect URL.

### Highlights

- **Finish the highlights feature.** The route exists at `routes/bookmarks.js`
  but the layout just renders `<p>Highlights coming soon.</p>`. The data
  layer is there (`fetchAllHighlights` in `layouts/bookmarks.js`). Needs
  a layout + template, probably with tag filtering.

### Bookshelves

- **Card-based UI for the bookshelves list.** Currently a flat list.
  Each shelf as a card with maybe a cover thumbnail from one of its books.

- **Rename "Add book" → "Discover books" everywhere.** The action takes
  you to the discover-books page; current label misrepresents it. Affects
  `PrimaryAction` / `FabAction` in `layouts/templates.js` plus any inline
  link text.

- **Book detail: add padding under the "remove from shelf" button.**
  Currently flush against the bottom edge.

### Notes

- **Redesign the notebooks manage area (delete, rename).** Rename input
  and delete confirmation are crammed into a dropdown action button menu.
  Needs a dedicated edit page or a cleaner inline-edit affordance.

- **Rethink the edit/delete button placement inside a note.** Currently
  awkward. Options: top-right of the note view, sticky toolbar, footer row.

- **Note editor needs proper labels on title and tags inputs.** Currently
  placeholder-only, which disappears when typing.

### Todos

- **"New todo" button on the todos tab.** Currently the user has to switch
  to notes mode, click "New note", and manually type a todo.txt header.
  Needs a dedicated button that pre-creates a note with the right metadata.

### Blog posts list

- **Move the blog destination selector to the left side** to match the
  post editor layout. Consistency.

- **No delete option for a blog post in the editor.** Add a "Delete post"
  action when editing an existing post (`?edit=...` mode). Needs a
  micropub `action=delete` call in the EDIT_POST handler.

### Uploads / Media

- **Move blog destination selector to the left side** — same consistency
  win as the blog posts page.

- **Context-aware primary action on `/media`.** `PrimaryAction` and
  `FabAction` in `layouts/templates.js` already branch on area; add a check
  for `title === 'Media'` so the FAB and sidebar action become "Upload"
  instead of "New post" when on the Uploads page.

- **Layout tweaks for the alternating-row media list:**
  - Spacing feels cramped
  - Date/time is too large
  - Media link is too small
  - Hover action buttons on desktop should be upper-right like post cards
  - Worth a focused CSS pass on `.media-row` / `.media-row-actions` /
    `.media-row-main`

- **Show which blog posts use each media item.** Reverse-lookup is
  expensive without an index. Bigger feature.

---

## New features

### "New posts available" alert

Micro.blog's own UI shows a banner when new posts have arrived since the
user's current view. Lillihub should have the same, ideally without forcing
JavaScript on the page. Several approaches:

- **Hidden iframe + meta-refresh inside it.** Zero JS on the parent page.
  Every refresh hits micro.blog's API (rate limits, Deno Deploy quota), and
  iframe-to-parent signaling without JS is awkward.
- **`<meta http-equiv="refresh">` on the timeline itself.** Brutally
  simple, zero JS, but disruptive — user gets bounced if mid-read.
- **Service worker push.** `sw.js` already exists. Worker polls in
  background, navigation/refresh shows new posts. Worker runs JS but the
  page doesn't. Worth checking what `sw.js` currently does.
- **Polling fetch from `common.js`.** ~15 lines of JS that calls a small
  "any new posts since X?" endpoint every minute and toggles a banner.
  Simplest reliable approach.
- **Server-Sent Events (SSE).** Elegant but harder on Deno Deploy
  (request timeouts).

**Decision needed:** Deno Deploy free tier quota, and how strict the "no JS"
stance really is. If we'd accept ~15 lines of JS for a high-value feature,
polling is probably right.

### Bookmarks with custom content

Micro.blog supports creating bookmarks with custom content (a quote, a
note) instead of just a URL → fetched-content. Add this to the bookmark
creation form: a textarea for custom content alongside the URL field.
Also surface this when bookmarking a post from the timeline so the user
can capture context with the link.

### Replace the micro.blog Reader

Lillihub already has the bookmark and highlight data flow. The Reader is
the next logical thing — display long-form bookmark content in a readable
view, support highlighting from within the app. Blocked by finishing the
Highlights feature first.

### Add book by lookup

Add a book to a bookshelf by looking it up via an external service (Open
Library, Google Books). Needs: a lookup endpoint that proxies the service,
a form on the discover books page, a result picker, and the existing
ADD_BOOK handler to accept picked metadata.

### Photo Collections

Micro.blog has a Photo Collections API — lists of photos embeddable in blog
posts via Hugo shortcode. Worth adding as a sub-area of the blog/media
section. Needs a new layout, route group entries, templates, upload-flow
integration, and a "get shortcode" action.

### Webmentions inbox

Micro.blog has an endpoint for webmentions received by your blog. Should
be its own page similar to Mentions but for blog-level (not
micro.blog-level) mentions. Belongs under the blog area. Needs a new
layout modeled on `layouts/mentions.js`, a route, a template, and a
sidebar/page-nav link.

### Cross-cutting: bookmarks ↔ notes ↔ drafts

**This is probably the post-2.0 marquee feature** for distinguishing
Lillihub from a generic micro.blog client. The user's workflow is
interconnected: bookmark things, highlight passages, jot private notes,
then merge them into a blog draft. Right now these features are siloed.

Ideas for connecting them:
- **From a bookmark:** "Save as note" or "Start a draft from this bookmark"
- **From a highlight:** "Add to a note" / "Add to a draft"
- **From a private note:** "Convert to draft" / "Insert into draft"
- **In the editor:** "Insert from notes" / "Insert from highlights" picker

Big ergonomic feature. Needs a dedicated brainstorm session before code —
the question of *how* these flow into each other (copy? link? merge?) is
the design challenge, not the implementation.

---

## Design questions (not decided)

- **Should link color match each area's primary color?** Each main area
  has its own accent (Timeline = green, Blog = blue, Bookmarks = purple,
  Bookshelves = red, Notebooks = orange). Currently links are greenblue
  everywhere. Should they shift per area? Pro: stronger visual identity.
  Con: same-kind links look different on different pages. The area is
  already in scope (`area-${area}` on `<body>`) so it's doable via
  `.area-blog a { color: var(--blue); }` etc. Worth a small experiment
  on one area before committing across all five. Tied to the editor
  color mismatch item under UI polish.

---

## Code cleanups

### Small

- **Dead `token` and `getFollowing` parameters on `PostTemplate`.** Both
  unused after Phase 6 batch 3. Removing them would shift all positional
  args and force edits to every call site (8+ files). Cosmetic, not
  pressing. Save for the next CSS/template pass.

- **Dead `token` parameter on `HTMLPage` / `HTMLPageStart`.** Neither
  function uses it but it's the first positional arg. Removing it would
  cascade through every layout. Saved for a future signature cleanup.

- **`lh_prefs` cookie now stores `{}` for everyone.** Favorites was the
  last consumer. The cookie machinery (`parsePrefsCookie`, `buildPrefsCookie`,
  `prefsCookieExpiry`) and calls in `routes/auth.js` still write/read an
  empty object. Decide when adding the next user pref: delete the
  machinery entirely, or leave as scaffolding.

### Bigger

- **CSS refactor — deeper rewrite.** Phase 6 dedupe and cleanup left the
  CSS in a workable state but not a beautiful one. Remaining candidates:

  - **Global `a:hover { color: var(--link); opacity: 0.85 }` is a
    specificity trap.** Caused two bugs in Phase 7. Fixed both with more
    specific overrides, but the rule will keep biting. Either remove the
    `color` half (keep `opacity` only) or remove the rule entirely and
    rely on per-component hover states.

  - **Reorganize by component.** CSS is still roughly "everything from
    lillihub.css then everything from the old style.css." Group by:
    theme vars → reset → layout shell → nav → post card → reply card
    → forms → toolbars → utilities.

  - **Consider splitting into multiple files.** `styles/base.css` (theme
    + reset + element defaults), `styles/components.css` (post/reply/form
    components), `styles/utilities.css` (helpers). Only if it helps —
    one big organized file is also fine.

  - **Lean into tag-direct styling.** Style `<button>`, `<input>`,
    `<textarea>`, `<select>` directly. Remove `.btn`, `.form-input`, etc.
    from templates where they're just polishing the element. Keep the
    brand classes (`.btn-glossy-*`, `.sidebar-nav-{color}`) because
    they're the visual identity.

- **Orphan CSS classes left over from Phase 4.** These are referenced in
  templates/layouts but have no CSS rule. The app renders fine without
  them, so most are decorative no-ops. Visit during a future CSS pass:

  - **Spectre-style utilities** (probably safe to remove from templates):
    `btn-block`, `btn-sm`, `c-hand`, `container`, `d-block`,
    `d-inline-block`, `dropdown-toggle`, `form-group`, `input-group-btn`,
    `p-centered`, `page-item`, `pagination`, `text-left`
  - **Lillihub-specific orphans** (might want minimal styles, might be
    removable): `blog-page`, `book-card`, `bookmarks`,
    `editor-checklist-item`, `favorites-tile`, `media-row`,
    `media-row-actions`, `media-row-main`, `note`, `note-card`,
    `note-title-text`, `post-summary`, `sidebar-action-orange`,
    `sidebar-action-purple`, `sidebar-action-red`

- **SESSION cache has no eviction.** In-memory session map in
  `scripts/server/session.js` grows per login with no TTL or size cap.
  Fine for 5 users + Deno Deploy restarts. Consider an LRU + TTL when
  the user count grows.

- **Blog post sandboxing — second sanitize pass is a band-aid.** The
  double `sanitizeHTML` call in `layouts/blog.js` works around a
  `linkedom`-produces-`<p />` bug. A cleaner fix is to rewrite
  `truncateHTML` to serialize each child node manually instead of using
  `root.innerHTML`. Would make the second sanitize pass unnecessary.

---

## Phase 8 — expanded tests (if ever)

- **Integration-ish tests for mutation handlers:** add note, move note
  (both success and partial-failure paths), create bookmark with tags,
  rename notebook.
- **Failure-mode stubs for fetch:** network throw, non-2xx, malformed
  JSON, empty items.
- **Goal:** "I can refactor a mutation handler without clicking through
  the UI to verify."

Probably not worth doing until an actual bug in a mutation handler forces
it — the current smoke tests cover the render paths, which is most of
the "did this change break something" risk surface.
