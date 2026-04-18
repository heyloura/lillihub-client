// Feed routes — subscriptions, entries, starring, read/unread.
import { FeedsTemplate } from "../layouts/feeds.js";
import { FeedNewTemplate } from "../layouts/feed-new.js";
import { FeedEntriesTemplate } from "../layouts/feed-entries.js";
import { FeedEntryTemplate } from "../layouts/feed-entry.js";
import { FeedStarredTemplate } from "../layouts/feed-starred.js";
import { FeedRecapTemplate } from "../layouts/feed-recap.js";

const FEEDS_ROUTE = new URLPattern({ pathname: "/feeds" });
const FEED_ENTRIES = new URLPattern({ pathname: "/feeds/entries" });
const FEED_STARRED = new URLPattern({ pathname: "/feeds/starred" });
const FEED_RECAP = new URLPattern({ pathname: "/feeds/recap" });
const FEED_VIEW = new URLPattern({ pathname: "/feeds/:feedId" });
const FEED_ENTRY = new URLPattern({ pathname: "/feeds/entry/:entryId" });
const FEED_NEW = new URLPattern({ pathname: "/feed/new" });
const FEED_SUBSCRIBE = new URLPattern({ pathname: "/feed/subscribe" });
const FEED_RENAME = new URLPattern({ pathname: "/feed/rename" });
const FEED_UNSUBSCRIBE = new URLPattern({ pathname: "/feed/unsubscribe" });
const FEED_REFRESH = new URLPattern({ pathname: "/feed/refresh" });
const FEED_MARK_READ = new URLPattern({ pathname: "/feed/mark-read" });
const FEED_MARK_UNREAD = new URLPattern({ pathname: "/feed/mark-unread" });
const FEED_STAR = new URLPattern({ pathname: "/feed/star" });
const FEED_UNSTAR = new URLPattern({ pathname: "/feed/unstar" });

export async function tryHandle(req, ctx) {
    const { user, accessTokenValue } = ctx;

    if (FEEDS_ROUTE.exec(req.url) && user) {
        return new Response(await FeedsTemplate(user, accessTokenValue, req), {
            status: 200,
            headers: { "content-type": "text/html" },
        });
    }

    if (FEED_ENTRIES.exec(req.url) && user) {
        return new Response(await FeedEntriesTemplate(user, accessTokenValue, null, req), {
            status: 200,
            headers: { "content-type": "text/html" },
        });
    }

    if (FEED_STARRED.exec(req.url) && user) {
        return new Response(await FeedStarredTemplate(user, accessTokenValue), {
            status: 200,
            headers: { "content-type": "text/html" },
        });
    }

    if (FEED_RECAP.exec(req.url) && user) {
        return new Response(await FeedRecapTemplate(user, accessTokenValue, req), {
            status: 200,
            headers: { "content-type": "text/html" },
        });
    }

    if (FEED_ENTRY.exec(req.url) && user) {
        const entryId = FEED_ENTRY.exec(req.url).pathname.groups.entryId;
        return new Response(await FeedEntryTemplate(user, accessTokenValue, entryId), {
            status: 200,
            headers: { "content-type": "text/html" },
        });
    }

    if (FEED_VIEW.exec(req.url) && user) {
        const feedId = FEED_VIEW.exec(req.url).pathname.groups.feedId;
        return new Response(await FeedEntriesTemplate(user, accessTokenValue, feedId, req), {
            status: 200,
            headers: { "content-type": "text/html" },
        });
    }

    if (FEED_NEW.exec(req.url) && user) {
        return new Response(await FeedNewTemplate(user, accessTokenValue), {
            status: 200,
            headers: { "content-type": "text/html" },
        });
    }

    if (FEED_SUBSCRIBE.exec(req.url) && user) {
        const value = await req.formData();
        const feedUrl = value.get('feed_url');

        let writeFailed = false;
        try {
            const posting = await fetch('https://micro.blog/feeds/v2/subscriptions.json', {
                method: "POST",
                body: JSON.stringify({ feed_url: feedUrl }),
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                    "Authorization": "Bearer " + accessTokenValue
                }
            });
            if (!posting.ok) {
                writeFailed = true;
                console.log(`${user.username} tried to subscribe to "${feedUrl}" and ${await posting.text()}`);
            }
        } catch (err) {
            writeFailed = true;
            console.log(`${user.username} tried to subscribe to "${feedUrl}" and fetch failed: ${err?.message || err}`);
        }

        const dest = `/feeds${writeFailed ? '?error=failed' : ''}`;
        return Response.redirect(new URL(dest, req.url).href, 303);
    }

    if (FEED_RENAME.exec(req.url) && user) {
        const value = await req.formData();
        const title = value.get('title');
        const subscriptionId = value.get('subscription_id');

        let writeFailed = false;
        try {
            const posting = await fetch(`https://micro.blog/feeds/v2/subscriptions/${subscriptionId}.json`, {
                method: "PATCH",
                body: JSON.stringify({ title }),
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                    "Authorization": "Bearer " + accessTokenValue
                }
            });
            if (!posting.ok) {
                writeFailed = true;
                console.log(`${user.username} tried to rename subscription ${subscriptionId} to "${title}" and ${await posting.text()}`);
            }
        } catch (err) {
            writeFailed = true;
            console.log(`${user.username} tried to rename subscription ${subscriptionId} to "${title}" and fetch failed: ${err?.message || err}`);
        }

        const dest = `/feeds${writeFailed ? '?error=failed' : ''}`;
        return Response.redirect(new URL(dest, req.url).href, 303);
    }

    if (FEED_UNSUBSCRIBE.exec(req.url) && user) {
        const value = await req.formData();
        const subscriptionId = value.get('subscription_id');

        let writeFailed = false;
        try {
            const posting = await fetch(`https://micro.blog/feeds/v2/subscriptions/${subscriptionId}.json`, {
                method: "DELETE",
                headers: { "Authorization": "Bearer " + accessTokenValue }
            });
            if (!posting.ok && posting.status !== 204) {
                writeFailed = true;
                console.log(`${user.username} tried to unsubscribe ${subscriptionId} and ${await posting.text()}`);
            }
        } catch (err) {
            writeFailed = true;
            console.log(`${user.username} tried to unsubscribe ${subscriptionId} and fetch failed: ${err?.message || err}`);
        }

        const dest = `/feeds${writeFailed ? '?error=failed' : ''}`;
        return Response.redirect(new URL(dest, req.url).href, 303);
    }

    if (FEED_REFRESH.exec(req.url) && user) {
        const value = await req.formData();
        const subscriptionId = value.get('subscription_id');

        try {
            await fetch(`https://micro.blog/feeds/v2/subscriptions/${subscriptionId}/update.json`, {
                method: "POST",
                headers: { "Authorization": "Bearer " + accessTokenValue }
            });
        } catch (err) {
            console.log(`${user.username} tried to refresh subscription ${subscriptionId}: ${err?.message || err}`);
        }

        return Response.redirect(new URL('/feeds', req.url).href, 303);
    }

    if (FEED_MARK_READ.exec(req.url) && user) {
        const value = await req.formData();
        const entryId = parseInt(value.get('entry_id'));
        const redirect = value.get('redirect') || '/feeds/entries';

        try {
            await fetch('https://micro.blog/feeds/v2/unread_entries/delete.json', {
                method: "POST",
                body: JSON.stringify({ unread_entries: [entryId] }),
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                    "Authorization": "Bearer " + accessTokenValue
                }
            });
        } catch (err) {
            console.log(`${user.username} mark-read failed: ${err?.message || err}`);
        }

        return Response.redirect(new URL(redirect, req.url).href, 303);
    }

    if (FEED_MARK_UNREAD.exec(req.url) && user) {
        const value = await req.formData();
        const entryId = parseInt(value.get('entry_id'));
        const redirect = value.get('redirect') || '/feeds/entries';

        try {
            await fetch('https://micro.blog/feeds/v2/unread_entries.json', {
                method: "POST",
                body: JSON.stringify({ unread_entries: [entryId] }),
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                    "Authorization": "Bearer " + accessTokenValue
                }
            });
        } catch (err) {
            console.log(`${user.username} mark-unread failed: ${err?.message || err}`);
        }

        return Response.redirect(new URL(redirect, req.url).href, 303);
    }

    if (FEED_STAR.exec(req.url) && user) {
        const value = await req.formData();
        const entryId = parseInt(value.get('entry_id'));

        try {
            await fetch('https://micro.blog/feeds/v2/starred_entries.json', {
                method: "POST",
                body: JSON.stringify({ starred_entries: [entryId] }),
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                    "Authorization": "Bearer " + accessTokenValue
                }
            });
        } catch (err) {
            console.log(`${user.username} star failed: ${err?.message || err}`);
        }

        return Response.redirect(new URL(`/feeds/entry/${entryId}`, req.url).href, 303);
    }

    if (FEED_UNSTAR.exec(req.url) && user) {
        const value = await req.formData();
        const entryId = parseInt(value.get('entry_id'));

        try {
            await fetch('https://micro.blog/feeds/v2/starred_entries.json', {
                method: "DELETE",
                body: JSON.stringify({ starred_entries: [entryId] }),
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                    "Authorization": "Bearer " + accessTokenValue
                }
            });
        } catch (err) {
            console.log(`${user.username} unstar failed: ${err?.message || err}`);
        }

        return Response.redirect(new URL(`/feeds/entry/${entryId}`, req.url).href, 303);
    }

    return null;
}
