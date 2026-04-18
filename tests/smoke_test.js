// Smoke tests for Lillihub layouts.
//
// Philosophy: "did this route crash?" — not content assertions. We stub
// `globalThis.fetch` to return fixture JSON and then call each layout's
// template function, asserting we get back non-empty HTML without throwing.
//
// This is insurance during the main.js refactor (Phase 1 of TODO.md) — any
// missed import, wrong function name, or shuffled signature surfaces here
// in ~2 seconds instead of requiring a manual click-through of every page.

import { assert, assertStringIncludes } from "https://deno.land/std@0.214.0/assert/mod.ts";

Deno.env.set("APP_URL", "http://localhost:8080");

// ---------- Fixture + fetch stub ----------

const fixturesDir = new URL("./fixtures/", import.meta.url);

async function loadFixture(name) {
    return await Deno.readTextFile(new URL(name, fixturesDir));
}

// URL-to-fixture routing table. First match wins — keep more specific
// patterns above more general ones.
const DEFAULT_ROUTES = [
    [/\/posts\/check/, "check.json"],
    [/\/posts\/timeline/, "posts_feed.json"],
    [/\/posts\/discover\/books/, "posts_feed.json"],
    [/\/posts\/discover\/[^?/]+/, "discover_with_tagmoji.json"],
    [/\/posts\/discover/, "discover_with_tagmoji.json"],
    [/\/posts\/mentions/, "posts_feed.json"],
    [/\/posts\/replies/, "posts_feed.json"],
    [/\/posts\/conversation/, "conversation.json"],
    [/\/posts\/bookmarks\/highlights/, "posts_feed_empty.json"],
    [/\/posts\/bookmarks\/tags/, "bookmarks_tags.json"],
    [/\/posts\/bookmarks/, "posts_feed.json"],
    [/\/posts\/[^/]+\/photos/, "posts_feed.json"],
    [/\/posts\/[^?]+/, "posts_feed.json"],
    [/\/users\/following\/[^?]+/, "following.json"],
    [/\/users\/muting/, "empty_array.json"],
    [/\/users\/blocking/, "empty_array.json"],
    [/\/notes\/notebooks\/\d+/, "notebook.json"],
    [/\/notes\/notebooks/, "notebooks.json"],
    [/\/books\/bookshelves/, "bookshelves.json"],
    [/\/feeds\/v2\/entries\/\d+/, "entry.json"],
    [/\/feeds\/v2\/entries/, "entries.json"],
    [/\/feeds\/v2\/feeds\/\d+\/entries/, "entries.json"],
    [/\/feeds\/v2\/unread_entries/, "empty_array.json"],
    [/\/feeds\/v2\/starred_entries/, "empty_array.json"],
    [/\/feeds\/v2\/icons/, "icons.json"],
    [/\/feeds\/v2\/subscriptions/, "subscriptions.json"],
    [/\/micropub\?q=config/, "micropub_config.json"],
];

function buildStub(routes) {
    return async (input) => {
        const urlStr =
            typeof input === "string"
                ? input
                : input && input.url
                ? input.url
                : String(input);
        for (const [pattern, fixtureName] of routes) {
            if (pattern.test(urlStr)) {
                const body = await loadFixture(fixtureName);
                return new Response(body, {
                    status: 200,
                    headers: { "content-type": "application/json" },
                });
            }
        }
        // Unknown URL — return an empty-feed shape rather than erroring so a
        // missed route in the table shows up as a "rendered but empty" test
        // rather than a fetch failure.
        return new Response('{"items":[]}', {
            status: 200,
            headers: { "content-type": "application/json" },
        });
    };
}

const originalFetch = globalThis.fetch;
globalThis.fetch = buildStub(DEFAULT_ROUTES);

// Per-test override helper: temporarily swap the stub for one call.
async function withRoutes(overrides, fn) {
    const saved = globalThis.fetch;
    globalThis.fetch = buildStub([...overrides, ...DEFAULT_ROUTES]);
    try {
        await fn();
    } finally {
        globalThis.fetch = saved;
    }
}

// ---------- Shared test helpers ----------

const testUser = {
    username: "testuser",
    name: "Test User",
    avatar: "https://example.com/testuser.png",
    plan: "premium",
    lillihub: {},
};

function mockReq(path) {
    return { url: `http://localhost:8080${path}` };
}

function assertRenders(html, label) {
    assert(
        typeof html === "string",
        `[${label}] expected string, got ${typeof html}`
    );
    assert(
        html.length > 100,
        `[${label}] HTML unexpectedly short (${html.length} chars)`
    );
    assertStringIncludes(html, "<html", `[${label}] missing <html tag`);
}

async function streamToString(stream) {
    return await new Response(stream).text();
}

// ---------- Tests ----------

Deno.test("timeline: renders with fixture data", async () => {
    const { TimelineTemplate } = await import("../layouts/timeline.js");
    const stream = await TimelineTemplate(testUser, "fake-token", mockReq("/"));
    const html = await streamToString(stream);
    assertRenders(html, "timeline");
});

Deno.test("discover: renders with fixture data", async () => {
    const { DiscoverTemplate } = await import("../layouts/discover.js");
    const html = await DiscoverTemplate(
        testUser,
        "fake-token",
        "test-uuid",
        "http://localhost:8080/discover"
    );
    assertRenders(html, "discover");
});

Deno.test("tagmoji: renders with fixture data", async () => {
    const { TagmojiTemplate } = await import("../layouts/tagmoji.js");
    const html = await TagmojiTemplate(testUser, "fake-token", "coffee");
    assertRenders(html, "tagmoji");
});

Deno.test("mentions: renders with fixture data", async () => {
    const { MentionsTemplate } = await import("../layouts/mentions.js");
    const html = await MentionsTemplate(testUser, "fake-token");
    assertRenders(html, "mentions");
});

Deno.test("replies: renders with fixture data", async () => {
    const { RepliesTemplate } = await import("../layouts/replies.js");
    const html = await RepliesTemplate(testUser, "fake-token");
    assertRenders(html, "replies");
});

Deno.test("user: renders a user's posts", async () => {
    const { UserTemplate } = await import("../layouts/user.js");
    const html = await UserTemplate(testUser, "fake-token", "alice");
    assertRenders(html, "user-posts");
});

Deno.test("bookmarks: renders with fixture data", async () => {
    const { BookmarksTemplate } = await import("../layouts/bookmarks.js");
    const html = await BookmarksTemplate(
        testUser,
        "fake-token",
        mockReq("/bookmarks")
    );
    assertRenders(html, "bookmarks");
});

Deno.test("bookmarks: renders with an empty feed", async () => {
    await withRoutes(
        [[/\/posts\/bookmarks(?!\/)/, "posts_feed_empty.json"]],
        async () => {
            const { BookmarksTemplate } = await import(
                "../layouts/bookmarks.js"
            );
            const html = await BookmarksTemplate(
                testUser,
                "fake-token",
                mockReq("/bookmarks")
            );
            assertRenders(html, "bookmarks-empty");
        }
    );
});

Deno.test("books: renders the books discover feed", async () => {
    const { BooksTemplate } = await import("../layouts/books.js");
    const html = await BooksTemplate(testUser, "fake-token");
    assertRenders(html, "books");
});

Deno.test("feeds: renders the subscriptions list", async () => {
    const { FeedsTemplate } = await import("../layouts/feeds.js");
    const html = await FeedsTemplate(
        testUser,
        "fake-token",
        mockReq("/feeds")
    );
    assertRenders(html, "feeds");
});

Deno.test("feeds: renders the entries timeline", async () => {
    const { FeedEntriesTemplate } = await import("../layouts/feed-entries.js");
    const html = await FeedEntriesTemplate(
        testUser,
        "fake-token",
        null,
        mockReq("/feeds/entries")
    );
    assertRenders(html, "feed-entries");
});

Deno.test("feeds: renders a single entry", async () => {
    const { FeedEntryTemplate } = await import("../layouts/feed-entry.js");
    const html = await FeedEntryTemplate(testUser, "fake-token", "1001");
    assertRenders(html, "feed-entry");
});

Deno.test("feeds: renders starred entries", async () => {
    const { FeedStarredTemplate } = await import("../layouts/feed-starred.js");
    const html = await FeedStarredTemplate(testUser, "fake-token");
    assertRenders(html, "feed-starred");
});

Deno.test("notebooks: renders the notebooks list", async () => {
    const { NotebooksTemplate } = await import("../layouts/notebooks.js");
    const html = await NotebooksTemplate(
        testUser,
        "fake-token",
        mockReq("/notes")
    );
    assertRenders(html, "notebooks");
});

Deno.test("notebooks: renders the ?error=failed banner", async () => {
    const { NotebooksTemplate } = await import("../layouts/notebooks.js");
    const html = await NotebooksTemplate(
        testUser,
        "fake-token",
        mockReq("/notes?error=failed")
    );
    assertStringIncludes(
        html,
        "Something went wrong",
        "notebooks should render error banner when ?error=failed"
    );
});

Deno.test("notes: renders a notebook's notes", async () => {
    const { NotesTemplate } = await import("../layouts/notes.js");
    const html = await NotesTemplate(
        testUser,
        "fake-token",
        "1",
        mockReq("/notes/1")
    );
    assertRenders(html, "notes");
});

Deno.test("notes: renders the ?error=move_duplicate banner", async () => {
    const { NotesTemplate } = await import("../layouts/notes.js");
    const html = await NotesTemplate(
        testUser,
        "fake-token",
        "1",
        mockReq("/notes/1?error=move_duplicate")
    );
    assertStringIncludes(
        html,
        "Note was copied",
        "notes should render move_duplicate banner"
    );
});

Deno.test("single: renders a single conversation view", async () => {
    const { SingleTemplate } = await import("../layouts/single.js");
    const html = await SingleTemplate(testUser, "fake-token", "222");
    assertRenders(html, "single");
});

Deno.test("landing: renders for logged-out users with no chrome", async () => {
    const { LandingTemplate } = await import("../layouts/landing.js");
    const html = await LandingTemplate(false, "", "test-uuid", "http://localhost:8080");
    assertRenders(html, "landing");
    // Logged-out pages should NOT have the sidebar nav
    assert(
        !html.includes('class="sidebar"'),
        "landing should not render the sidebar for logged-out users"
    );
    // But SHOULD have the blurb and login form
    assertStringIncludes(html, "A delightful", "landing missing blurb");
    assertStringIncludes(html, 'name="me"', "landing missing IndieAuth login input");
});

// Restore original fetch after all tests run (harmless in the test process
// but cleaner as a signal of intent).
globalThis.addEventListener("unload", () => {
    globalThis.fetch = originalFetch;
});
