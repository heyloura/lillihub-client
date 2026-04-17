// Static asset routes — favicon, manifest, service worker, icon, and dynamic
// /scripts/* and /styles/* file serving. All routes here are served before
// the authentication context is built (no `user` is available).
//
// Contract (used by every route file in routes/):
//   export async function tryHandle(req, ctx)
//   - returns a Response if a route in this file matched
//   - returns null if no route matched (dispatcher tries the next file)
//   - `ctx` is `{ user, accessToken, accessTokenValue }` for post-auth
//     route files; this file is pre-auth so `ctx` is unused.

const FAVICON_ROUTE = new URLPattern({ pathname: "/favicon.ico" });
const WEBMANIFEST_ROUTE = new URLPattern({ pathname: "/manifest.webmanifest" });
const SERVICEWORKER_ROUTE = new URLPattern({ pathname: "/sw.js" });
const LILLIHUB_ICON_ROUTE = new URLPattern({ pathname: "/lillihub-512.png" });
const LILLIHUB_ICON_192_ROUTE = new URLPattern({ pathname: "/lillihub-192.png" });
const LILLIHUB_MASKABLE_ROUTE = new URLPattern({ pathname: "/lillihub-maskable-512.png" });
const FAVICON_32_ROUTE = new URLPattern({ pathname: "/favicon-32.png" });
const CHECK_SCRIPT_ROUTE = new URLPattern({ pathname: "/scripts/:id" });
const CHECK_CSS_ROUTE = new URLPattern({ pathname: "/styles/:id" });

export async function tryHandle(req) {
    if (FAVICON_ROUTE.exec(req.url)) {
        return new Response(new Uint8Array(await Deno.readFile("static/favicon.ico")), {
            status: 200,
            headers: { "content-type": "image/x-icon" },
        });
    }

    if (LILLIHUB_ICON_ROUTE.exec(req.url)) {
        return new Response(new Uint8Array(await Deno.readFile("static/logo-lillihub.png")), {
            status: 200,
            headers: { "content-type": "image/png" },
        });
    }

    if (LILLIHUB_ICON_192_ROUTE.exec(req.url)) {
        try {
            return new Response(new Uint8Array(await Deno.readFile("static/lillihub-192.png")), {
                status: 200,
                headers: { "content-type": "image/png" },
            });
        } catch { /* file not yet created */ }
    }

    if (LILLIHUB_MASKABLE_ROUTE.exec(req.url)) {
        try {
            return new Response(new Uint8Array(await Deno.readFile("static/lillihub-maskable-512.png")), {
                status: 200,
                headers: { "content-type": "image/png" },
            });
        } catch { /* file not yet created */ }
    }

    if (FAVICON_32_ROUTE.exec(req.url)) {
        try {
            return new Response(new Uint8Array(await Deno.readFile("static/favicon-32.png")), {
                status: 200,
                headers: { "content-type": "image/png" },
            });
        } catch { /* file not yet created */ }
    }

    if (WEBMANIFEST_ROUTE.exec(req.url)) {
        return new Response(await Deno.readFile("static/manifest.webmanifest"), {
            status: 200,
            headers: { "content-type": "text/json" },
        });
    }

    if (SERVICEWORKER_ROUTE.exec(req.url)) {
        return new Response(await Deno.readFile("scripts/server/sw.js"), {
            status: 200,
            headers: { "content-type": "text/javascript" },
        });
    }

    const scriptMatch = CHECK_SCRIPT_ROUTE.exec(req.url);
    if (scriptMatch) {
        const id = scriptMatch.pathname.groups.id;
        return new Response(await Deno.readFile("scripts/client/" + id), {
            status: 200,
            headers: { "content-type": "text/javascript" },
        });
    }

    const cssMatch = CHECK_CSS_ROUTE.exec(req.url);
    if (cssMatch) {
        const id = cssMatch.pathname.groups.id;
        return new Response(await Deno.readFile("styles/" + id), {
            status: 200,
            headers: { "content-type": "text/css" },
        });
    }

    return null;
}
