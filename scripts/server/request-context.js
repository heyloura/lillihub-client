// Builds the request context that authenticated route handlers receive.
//
// Resolves the user from the encrypted access token cookie:
//   1) Decrypt the cookie value
//   2) Check the in-memory SESSION cache (avoids hitting /account/verify on
//      every request — verify is the slowest call in the auth path)
//   3) On cache miss, fetch the user from micro.blog and populate SESSION
//   4) Always re-read prefs from the cookie so changes take effect immediately
//
// Returns `{ user, accessToken, accessTokenValue }` where:
//   - `user` is `false` for anonymous requests, an object for authenticated ones
//   - `accessToken` is the encrypted cookie value (used as the SESSION key)
//   - `accessTokenValue` is the decrypted token (used in micro.blog API calls)

import { getCookieValue, decryptMe, parsePrefsCookie } from "./utilities.js";
import { getMicroBlogLoggedInUser } from "./mb.js";
import { SESSION } from "./session.js";

export async function buildRequestContext(req) {
    let user = false;
    const accessToken = getCookieValue(req, 'atoken');
    let accessTokenValue;
    try {
        accessTokenValue = accessToken ? await decryptMe(accessToken) : undefined;
    } catch {
        accessTokenValue = undefined;
    }

    if (accessTokenValue) {
        if (SESSION[accessToken]) {
            user = { ...SESSION[accessToken] };
        } else {
            const mbUser = await getMicroBlogLoggedInUser(accessTokenValue);
            if (mbUser?.username && !mbUser.error) {
                const identity = {
                    username: mbUser.username,
                    name: mbUser.name,
                    avatar: mbUser.avatar,
                    plan: mbUser.plan,
                };
                SESSION[accessToken] = identity;
                user = { ...identity };
            }
        }
        // Prefs always come from the cookie, not SESSION, so changes take effect immediately.
        if (user) {
            user.lillihub = parsePrefsCookie(req);
        }
    }

    return { user, accessToken, accessTokenValue };
}
