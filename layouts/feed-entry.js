import { HTMLPage } from "./templates.js";
import { sanitizeHTML } from "../scripts/server/utilities.js";

const _entryTemplate = new TextDecoder().decode(await Deno.readFile("templates/feeds/entry.html"));

function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatDate(dateStr) {
    try {
        const d = new Date(dateStr);
        if (isNaN(d)) return dateStr || '';
        return d.toLocaleDateString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric',
            hour: 'numeric', minute: 'numeric', hour12: true
        });
    } catch { return dateStr || ''; }
}

export async function FeedEntryTemplate(user, token, entryId) {
    const headers = { "Authorization": "Bearer " + token };

    let entry, starredIds, unreadIds, subscriptions;
    try {
        const [entryRes, starredRes, unreadRes, subsRes] = await Promise.all([
            fetch(`https://micro.blog/feeds/v2/entries/${entryId}.json?mode=extended&include_enclosure=true`, { method: "GET", headers }),
            fetch('https://micro.blog/feeds/v2/starred_entries.json', { method: "GET", headers }),
            fetch('https://micro.blog/feeds/v2/unread_entries.json', { method: "GET", headers }),
            fetch('https://micro.blog/feeds/v2/subscriptions.json?mode=extended', { method: "GET", headers })
        ]);
        entry = await entryRes.json();
        starredIds = await starredRes.json();
        unreadIds = await unreadRes.json();
        subscriptions = await subsRes.json();
    } catch (err) {
        console.log(`feed entry fetch failed for ${user?.username}: ${err?.message || err}`);
        return HTMLPage(token, 'Feed Entry', `<p class="container p-2">Could not load this entry right now. Please try again.</p>`, user);
    }

    if (!entry || !entry.id) {
        return HTMLPage(token, 'Feed Entry', `<p class="container p-2">Entry not found.</p>`, user);
    }

    const starredSet = new Set(Array.isArray(starredIds) ? starredIds : []);
    const unreadSet = new Set(Array.isArray(unreadIds) ? unreadIds : []);
    const isStarred = starredSet.has(entry.id);
    const isUnread = unreadSet.has(entry.id);

    // Build feed name lookup
    const subsList = Array.isArray(subscriptions) ? subscriptions : [];
    let feedName = '';
    for (const sub of subsList) {
        if (sub.feed_id === entry.feed_id) { feedName = sub.title || sub.feed_url || ''; break; }
    }

    const title = entry.title || '(untitled)';
    const entryUrl = entry.url || '';

    // Star/unstar button
    const starButton = isStarred
        ? `<form action="/feed/unstar" method="POST"><input type="hidden" name="entry_id" value="${entry.id}"><button type="submit" class="btn btn-glossy btn-sm"><i class="bi bi-star-fill"></i> Starred</button></form>`
        : `<form action="/feed/star" method="POST"><input type="hidden" name="entry_id" value="${entry.id}"><button type="submit" class="btn btn-glossy btn-sm"><i class="bi bi-star"></i> Star</button></form>`;

    // Read/unread button
    const readButton = isUnread
        ? `<form action="/feed/mark-read" method="POST"><input type="hidden" name="entry_id" value="${entry.id}"><input type="hidden" name="redirect" value="/feeds/entry/${entry.id}"><button type="submit" class="btn btn-glossy btn-sm"><i class="bi bi-check2"></i> Mark read</button></form>`
        : `<form action="/feed/mark-unread" method="POST"><input type="hidden" name="entry_id" value="${entry.id}"><input type="hidden" name="redirect" value="/feeds/entry/${entry.id}"><button type="submit" class="btn btn-glossy btn-sm"><i class="bi bi-circle"></i> Mark unread</button></form>`;

    // Original link
    const originalLink = entryUrl
        ? `<a href="${escapeHtml(entryUrl)}" class="btn btn-glossy btn-sm" target="_blank" rel="noopener"><i class="bi bi-box-arrow-up-right"></i> Original</a>`
        : '';

    const content = _entryTemplate
        .replaceAll('{{title}}', escapeHtml(title))
        .replaceAll('{{feedName}}', escapeHtml(feedName))
        .replaceAll('{{date}}', formatDate(entry.published || entry.created_at))
        .replaceAll('{{content}}', sanitizeHTML(entry.content || entry.summary || '') || '<p style="color:var(--overlay-1);">No content available.</p>')
        .replaceAll('{{starButton}}', starButton)
        .replaceAll('{{readButton}}', readButton)
        .replaceAll('{{originalLink}}', originalLink);

    // Auto-mark as read on view
    if (isUnread) {
        try {
            await fetch('https://micro.blog/feeds/v2/unread_entries/delete.json', {
                method: "POST",
                body: JSON.stringify({ unread_entries: [entry.id] }),
                headers: { "Content-Type": "application/json; charset=utf-8", ...headers }
            });
        } catch { /* non-critical */ }
    }

    return HTMLPage(token, 'Feed Entry', content, user);
}
