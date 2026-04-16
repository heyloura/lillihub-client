/******************************************************************************************************************
* Lillihub server entrypoint.
*
* Setup notes:
*   - Run locally with `deno task dev` (uses --allow-env --allow-net --allow-read --unstable-kv)
*   - APP_SECRET env var holds the AES key for encrypting session cookies. To generate one:
*       const key = await crypto.subtle.generateKey({ name: "AES-CBC", length: 128 }, true, ["encrypt", "decrypt"]);
*       const rawKey = JSON.stringify(await crypto.subtle.exportKey("jwk", key));
*
* Architecture:
*   - This file is a thin dispatcher. Per-request work happens in three layers:
*       1) tryPreFilter — short-circuits robots/bots/probes
*       2) tryStaticRoute — serves static assets without auth
*       3) buildRequestContext + route groups — authenticated request handling
*   - Route handlers live in routes/*.js, each exporting `tryHandle(req, ctx)`.
******************************************************************************************************************/

import { serve } from "https://deno.land/std@0.214.0/http/server.ts";

import { tryPreFilter } from "./scripts/server/pre-filters.js";
import { buildRequestContext } from "./scripts/server/request-context.js";

import { tryHandle as tryStaticRoute } from "./routes/static.js";
import { tryHandle as trySocialRoute } from "./routes/social.js";
import { tryHandle as tryBookmarksRoute } from "./routes/bookmarks.js";
import { tryHandle as tryBooksRoute } from "./routes/books.js";
import { tryHandle as tryBlogRoute } from "./routes/blog.js";
import { tryHandle as tryCollectionsRoute } from "./routes/collections.js";
import { tryHandle as tryNotesRoute } from "./routes/notes.js";
import { tryHandle as tryAuthRoute } from "./routes/auth.js";

// Order matters: admin runs before social so the heyloura-only check exits
// early; auth runs last so /login && user redirect is reachable after the
// other groups have had their shot at the request.
const ROUTE_GROUPS = [
    trySocialRoute,
    tryBookmarksRoute,
    tryBooksRoute,
    tryBlogRoute,
    tryCollectionsRoute,
    tryNotesRoute,
    tryAuthRoute,
];

async function handler(req) {
    // 1) Pre-filters: robots.txt, bot blocking, WordPress probe denial
    const filtered = tryPreFilter(req);
    if (filtered) return filtered;

    // 2) Static assets — served before the auth context build to keep them cheap
    const staticRes = await tryStaticRoute(req);
    if (staticRes) return staticRes;

    // 3) Build the authenticated request context (cookie -> session -> user)
    const ctx = await buildRequestContext(req);

    // 4) Try each route group in order; first non-null Response wins
    for (const tryRoute of ROUTE_GROUPS) {
        const res = await tryRoute(req, ctx);
        if (res) {
            // If the auth cookie was stale/invalid, expire it so the browser
            // drops it and the user sees the login page cleanly next request.
            if (ctx.clearCookie) {
                res.headers.append('set-cookie', 'atoken=; Max-Age=0; Path=/; SameSite=Lax; Secure; HttpOnly');
            }
            return res;
        }
    }

    // 5) Nothing matched
    return new Response('', { status: 404 });
}

serve(handler);
