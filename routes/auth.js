// Auth flow routes — indieauth callback, password login, logout, and the
// "already logged in" redirect for /login when there's already a session.
import { HTMLPage } from "../layouts/templates.js";
import { encryptMe, getCookieValue, parsePrefsCookie, buildPrefsCookie, prefsCookieExpiry } from "../scripts/server/utilities.js";
import { getMicroBlogLoggedInUser } from "../scripts/server/mb.js";
import { SESSION } from "../scripts/server/session.js";

const AUTH_ROUTE = new URLPattern({ pathname: "/auth" });
const LOGIN_ROUTE = new URLPattern({ pathname: "/login" });
const LOGOUT_ROUTE = new URLPattern({ pathname: "/logout" });

export async function tryHandle(req, ctx) {
    const { user, accessToken, accessTokenValue } = ctx;

    // Already-logged-in users hitting /login go straight to home.
    if (LOGIN_ROUTE.exec(req.url) && user) {
        return Response.redirect(req.url.replaceAll('/login', '/'));
    }

    // For more info about indieAuth see: https://indieauth.spec.indieweb.org/
    if (AUTH_ROUTE.exec(req.url)) {
        // get state from cookie
        const stateCookie = getCookieValue(req, 'state');

        // get code + state from M.b.
        const searchParams = new URLSearchParams(req.url.split('?')[1]);
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        if (code && stateCookie == state) {
            const formBody = new URLSearchParams();
            formBody.append("code", code);
            formBody.append("client_id", req.url.split('?')[0].replaceAll('/auth', ''));
            formBody.append("redirect_uri", req.url.split('?')[0]);
            formBody.append("grant_type", "authorization_code");

            // request access_token
            let response;
            try {
                const fetching = await fetch('https://micro.blog/indieauth/token', {
                    method: "POST",
                    body: formBody.toString(),
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
                        "Accept": "application/json"
                    }
                });
                response = await fetching.json();
            } catch (err) {
                console.log(`indieauth token exchange failed: ${err?.message || err}`);
                response = { error: 'token_exchange_failed' };
            }

            if (!response.error) {
                const encryptedToken = await encryptMe(response.access_token);
                const mbUser = await getMicroBlogLoggedInUser(response.access_token);

                if (mbUser?.username && !mbUser.error) {
                    const identity = { username: mbUser.username, name: mbUser.name, avatar: mbUser.avatar, plan: mbUser.plan };
                    SESSION[encryptedToken] = identity;
                    const authUser = { ...identity, lillihub: parsePrefsCookie(req) };

                    const expiresOn = prefsCookieExpiry();
                    const headers = new Headers({ "content-type": "text/html" });
                    headers.append("set-cookie", `atoken=${encryptedToken};SameSite=Lax;Secure;HttpOnly;Expires=${expiresOn.toUTCString()};Path=/`);
                    if (!getCookieValue(req, 'lh_prefs')) {
                        headers.append("set-cookie", buildPrefsCookie({}, expiresOn));
                    }
                    return new Response(
                        await HTMLPage(response.access_token, `Redirect`, `<h3 style="text-align:center;" class="container mt-2">You have been logged in. Redirecting to your timeline</h3>`, authUser, req.url.split('?')[0].replaceAll('/auth', '')),
                        { status: 200, headers }
                    );
                }
            }
        }

        // change this to an error response
        return new Response(await HTMLPage(null, `auth`, `<h1>Authentication Error</h1>`), {
            status: 200,
            headers: { "content-type": "text/html" },
        });
    }

    if (LOGIN_ROUTE.exec(req.url)) {
        const value = await req.formData();
        const token = value.get('token');

        const encryptedToken = await encryptMe(token);
        const mbUser = await getMicroBlogLoggedInUser(token);

        if (mbUser?.username && !mbUser.error) {
            const identity = { username: mbUser.username, name: mbUser.name, avatar: mbUser.avatar, plan: mbUser.plan };
            SESSION[encryptedToken] = identity;
            const loginUser = { ...identity, lillihub: parsePrefsCookie(req) };

            const expiresOn = prefsCookieExpiry();
            const headers = new Headers({ "content-type": "text/html" });
            headers.append("set-cookie", `atoken=${encryptedToken};SameSite=Lax;Secure;HttpOnly;Expires=${expiresOn.toUTCString()};Path=/`);
            if (!getCookieValue(req, 'lh_prefs')) {
                headers.append("set-cookie", buildPrefsCookie({}, expiresOn));
            }
            return new Response(
                await HTMLPage(token, `Redirect`, `<h3 style="text-align:center;" class="container mt-2">You have been logged in. Redirecting to your timeline</h3>`, loginUser, req.url.split('?')[0].replaceAll('/login', '')),
                { status: 200, headers }
            );
        }

        return new Response(await HTMLPage(null, `login`, `<h1>Login Error. Please try again.</h1>`), {
            status: 200,
            headers: { "content-type": "text/html" },
        });
    }

    if (LOGOUT_ROUTE.exec(req.url)) {
        // Clear the in-memory SESSION entry so a stale cookie from another
        // browser can't re-authenticate against the same encrypted token.
        // The cookie itself is also cleared below via Set-Cookie.
        if (accessToken && SESSION[accessToken]) {
            delete SESSION[accessToken];
        }
        return new Response(
            await HTMLPage(null, `Logout`, `<h2>You have been logged out. Redirecting to homepage</h2>`, user, req.url.split('?')[0].replaceAll('/logout', '')),
            {
                status: 200,
                headers: {
                    "content-type": "text/html",
                    "set-cookie": `atoken=undefined;SameSite=Lax;Secure;HttpOnly;Expires=Thu, 01 Jan 1970 00:00:00 GMT`
                },
            }
        );
    }

    return null;
}
