// Social routes — timeline, discover, mentions, replies, user profiles,
// follow/mute/block actions, and the discover fallback that serves as the
// unauthenticated landing page.

import { TimelineTemplate } from "../layouts/timeline.js";
import { SingleTemplate } from "../layouts/single.js";
import { UsersTemplate } from "../layouts/users.js";
import { MentionsTemplate } from "../layouts/mentions.js";
import { RepliesTemplate } from "../layouts/replies.js";
import { DiscoverTemplate } from "../layouts/discover.js";
import { TagmojiTemplate } from "../layouts/tagmoji.js";
import { UserTemplate } from "../layouts/user.js";
import { LandingTemplate } from "../layouts/landing.js";

const HOME_ROUTE = new URLPattern({ pathname: "/" });
const TIMELINE_POST_ROUTE = new URLPattern({ pathname: "/timeline/:id" });
const FOLLOWING_ROUTE = new URLPattern({ pathname: "/users/following" });
const MUTED_ROUTE = new URLPattern({ pathname: "/users/muted" });
const BLOCKED_ROUTE = new URLPattern({ pathname: "/users/blocked" });
const MENTIONS_ROUTE = new URLPattern({ pathname: "/mentions" });
const REPLIES_ROUTE = new URLPattern({ pathname: "/replies" });
const DISCOVER_ROUTE = new URLPattern({ pathname: "/discover" });
const DISCOVERTAG_ROUTE = new URLPattern({ pathname: "/discover/:id" });
const USER_ROUTE = new URLPattern({ pathname: "/user/:id" });
const USERPHOTOS_ROUTE = new URLPattern({ pathname: "/user/photos/:id" });

const ADD_REPLY = new URLPattern({ pathname: "/replies/add" });
const UNFOLLOW_USER = new URLPattern({ pathname: "/users/unfollow" });
const FOLLOW_USER = new URLPattern({ pathname: "/users/follow" });
const MUTE_USER = new URLPattern({ pathname: "/users/mute" });
const BLOCK_USER = new URLPattern({ pathname: "/users/block" });

export async function tryHandle(req, ctx) {
    const { user, accessTokenValue } = ctx;

    /********************************************************
     * Authenticated read routes
     ********************************************************/

    if (HOME_ROUTE.exec(req.url) && user) {
        const timeline = await TimelineTemplate(user, accessTokenValue, req);
        // TimelineTemplate returns a ReadableStream for progressive rendering,
        // or a plain string when the timeline is empty.
        return new Response(timeline, {
            status: 200,
            headers: { "content-type": "text/html; charset=utf-8" },
        });
    }

    if (TIMELINE_POST_ROUTE.exec(req.url) && user) {
        const id = TIMELINE_POST_ROUTE.exec(req.url).pathname.groups.id;
        return new Response(
            await SingleTemplate(user, accessTokenValue, id, 0, req.headers.get('referer') || ''),
            {
                status: 200,
                headers: { "content-type": "text/html" },
            }
        );
    }

    if (FOLLOWING_ROUTE.exec(req.url) && user) {
        const searchQuery = new URL(req.url).searchParams.get('q') || '';
        return new Response(
            await UsersTemplate(user, accessTokenValue, 'following', `https://micro.blog/users/following/${user.username}`, searchQuery),
            {
                status: 200,
                headers: { "content-type": "text/html" },
            }
        );
    }

    if (MUTED_ROUTE.exec(req.url) && user) {
        return new Response(
            await UsersTemplate(user, accessTokenValue, 'muted', `https://micro.blog/users/muting`),
            {
                status: 200,
                headers: { "content-type": "text/html" },
            }
        );
    }

    if (BLOCKED_ROUTE.exec(req.url)) {
        return new Response(
            await UsersTemplate(user, accessTokenValue, 'blocked', `https://micro.blog/users/blocking`),
            {
                status: 200,
                headers: { "content-type": "text/html" },
            }
        );
    }

    if (MENTIONS_ROUTE.exec(req.url) && user) {
        return new Response(await MentionsTemplate(user, accessTokenValue), {
            status: 200,
            headers: { "content-type": "text/html" },
        });
    }

    if (REPLIES_ROUTE.exec(req.url) && user) {
        return new Response(await RepliesTemplate(user, accessTokenValue), {
            status: 200,
            headers: { "content-type": "text/html" },
        });
    }

    /********************************************************
     * Authenticated mutation actions
     ********************************************************/

    if (ADD_REPLY.exec(req.url) && user) {
        const value = await req.formData();
        const id = value.get('id');
        const redirect = value.get('redirect');
        const replyingTo = value.getAll('replyingTo[]');
        let content = value.get('content');

        if (content != null && content != undefined && content != '' && content != 'null' && content != 'undefined') {
            const replies = replyingTo.map(function (reply) { return '@' + reply }).join(' ');
            content = replies + ' ' + content;

            const posting = await fetch(`https://micro.blog/posts/reply?id=${id}&content=${encodeURIComponent(content)}`, { method: "POST", headers: { "Authorization": "Bearer " + accessTokenValue } });
            if (!posting.ok) {
                console.log(`${user.username} tried to add a reply and ${await posting.text()}`);
            }

            const target = redirect || `/?replied=${id}#post-${id}`;
            return Response.redirect(new URL(target, req.url).href, 303);
        }
    }

    if (UNFOLLOW_USER.exec(req.url) && user) {
        const value = await req.formData();
        const username = value.get('username');

        const posting = await fetch(`https://micro.blog/users/unfollow?username=${username}`, { method: "POST", headers: { "Authorization": "Bearer " + accessTokenValue } });
        if (!posting.ok) {
            console.log(`${user.username} tried to unfollow ${username} and ${await posting.text()}`);
        }

        return new Response(await UserTemplate(user, accessTokenValue, username), {
            status: 200,
            headers: { "content-type": "text/html" },
        });
    }

    if (FOLLOW_USER.exec(req.url) && user) {
        const value = await req.formData();
        const username = value.get('username');
        const redirect = value.get('redirect');

        const posting = await fetch(`https://micro.blog/users/follow?username=${username}`, { method: "POST", headers: { "Authorization": "Bearer " + accessTokenValue } });
        if (!posting.ok) {
            console.log(`${user.username} tried to follow ${username} and ${await posting.text()}`);
        }

        if (redirect) {
            return Response.redirect(new URL(redirect, req.url).href, 303);
        }
        return new Response(`<p></p>`, {
            status: 200,
            headers: { "content-type": "text/html" },
        });
    }

    if (MUTE_USER.exec(req.url) && user) {
        const value = await req.formData();
        const username = value.get('username');

        const posting = await fetch(`https://micro.blog/users/mute?username=${username}`, { method: "POST", headers: { "Authorization": "Bearer " + accessTokenValue } });
        if (!posting.ok) {
            console.log(`${user.username} tried to mute ${username} and ${await posting.text()}`);
        }

        return new Response(await UserTemplate(user, accessTokenValue, username), {
            status: 200,
            headers: { "content-type": "text/html" },
        });
    }

    if (BLOCK_USER.exec(req.url) && user) {
        const value = await req.formData();
        const username = value.get('username');

        const posting = await fetch(`https://micro.blog/users/block?username=${username}`, { method: "POST", headers: { "Authorization": "Bearer " + accessTokenValue } });
        if (!posting.ok) {
            console.log(`${user.username} tried to block ${username} and ${await posting.text()}`);
        }

        return new Response(await UserTemplate(user, accessTokenValue, username), {
            status: 200,
            headers: { "content-type": "text/html" },
        });
    }

    /********************************************************
     * Landing / Discover
     *   - Logged-out users on / or /discover see the static landing page
     *     (no API call, just the blurb + login form).
     *   - Logged-in users on /discover see the discover feed.
     * Both paths set a `state` cookie used by the indieauth CSRF check in
     * routes/auth.js.
     ********************************************************/

    if (HOME_ROUTE.exec(req.url) && !user) {
        const uuid = crypto.randomUUID();
        const appUrl = req.url.split('?')[0].replace(/\/$/, '');
        return new Response(await LandingTemplate(user, accessTokenValue, uuid, appUrl), {
            status: 200,
            headers: {
                "content-type": "text/html",
                "set-cookie": `state=${uuid};SameSite=Lax;Secure;HttpOnly;Path=/`,
            },
        });
    }

    if (DISCOVER_ROUTE.exec(req.url)) {
        const uuid = crypto.randomUUID();
        // Logged-out users on /discover get the landing page too — no point
        // showing a public feed with a "please sign in" banner on top.
        if (!user) {
            const appUrl = req.url.split('?')[0].replace(/\/discover.*$/, '');
            return new Response(await LandingTemplate(user, accessTokenValue, uuid, appUrl), {
                status: 200,
                headers: {
                    "content-type": "text/html",
                    "set-cookie": `state=${uuid};SameSite=Lax;Secure;HttpOnly;Path=/`,
                },
            });
        }
        return new Response(await DiscoverTemplate(user, accessTokenValue, uuid, req.url), {
            status: 200,
            headers: {
                "content-type": "text/html",
                "set-cookie": `state=${uuid};SameSite=Lax;Secure;HttpOnly;Path=/`,
            },
        });
    }

    if (DISCOVERTAG_ROUTE.exec(req.url) && user) {
        const id = DISCOVERTAG_ROUTE.exec(req.url).pathname.groups.id;
        return new Response(await TagmojiTemplate(user, accessTokenValue, id), {
            status: 200,
            headers: { "content-type": "text/html" },
        });
    }

    if (USER_ROUTE.exec(req.url) && user) {
        const id = USER_ROUTE.exec(req.url).pathname.groups.id;
        return new Response(await UserTemplate(user, accessTokenValue, id), {
            status: 200,
            headers: { "content-type": "text/html" },
        });
    }

    if (USERPHOTOS_ROUTE.exec(req.url) && user) {
        const id = USERPHOTOS_ROUTE.exec(req.url).pathname.groups.id;
        return new Response(await UserTemplate(user, accessTokenValue, id, true), {
            status: 200,
            headers: { "content-type": "text/html" },
        });
    }

    return null;
}
