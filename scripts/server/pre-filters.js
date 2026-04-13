// Pre-route filters that run before the dispatcher.
// Returns a Response if the request should be short-circuited (robots.txt
// served, bot blocked, WordPress probe denied) or null to continue.
//
// Order matters: ROBOT_ROUTE must run BEFORE the bot filter, otherwise
// search engine crawlers (whose user-agents match the bot filter) would
// get a 401 instead of robots.txt.

const ROBOT_ROUTE = new URLPattern({ pathname: "/robots.txt" });

const BOT_USER_AGENTS = [
    "robot", "spider", "facebook", "crawler", "google",
    "updown.io daemon 2.11", "bingbot", "bot", "duckduckgo",
];

export function tryPreFilter(req) {
    // 1) /robots.txt — must be served before the bot filter blocks crawlers
    if (ROBOT_ROUTE.exec(req.url)) {
        return new Response(`
            User-agent: *
            Disallow: /
        `, {
            status: 200,
            headers: { "content-type": "text/plain" },
        });
    }

    // 2) Bot filter — block crawlers from any other route to save API calls
    const ua = req.headers.get("user-agent");
    if (!ua) {
        return new Response('', { status: 401 });
    }
    const uaLower = ua.toLowerCase();
    for (const needle of BOT_USER_AGENTS) {
        if (uaLower.includes(needle)) {
            return new Response('', { status: 401 });
        }
    }

    // 3) WordPress probe filter — quietly 404 well-known scanner paths
    if (
        req.url == 'https://lillihub.com//wp-includes/wlwmanifest.xml' ||
        req.url == 'https://lillihub.com//xmlrpc.php?rsd' ||
        req.url.includes('wp-content')
    ) {
        return new Response('', { status: 404 });
    }

    return null;
}
