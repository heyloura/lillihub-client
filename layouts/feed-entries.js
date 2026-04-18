import { HTMLPage } from "./templates.js";
import { sanitizeHTML } from "../scripts/server/utilities.js";

const _entriesTemplate = new TextDecoder().decode(await Deno.readFile("templates/feeds/entries.html"));
const _entryCard = new TextDecoder().decode(await Deno.readFile("templates/feeds/_entry.html"));

function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatDate(dateStr) {
    try {
        const d = new Date(dateStr);
        if (isNaN(d)) return dateStr || '';
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return dateStr || ''; }
}

function hostFromUrl(url) {
    try { return new URL(url).hostname; } catch { return ''; }
}

export async function FeedEntriesTemplate(user, token, feedId, req) {
    const headers = { "Authorization": "Bearer " + token };
    const params = new URLSearchParams(req?.url?.split('?')[1] || '');
    const page = parseInt(params.get('page')) || 1;
    const perPage = 25;
    const showRead = params.get('read') === 'true';

    // Default to unread only; ?read=true shows read entries
    const readParam = showRead ? '&read=true' : '&read=false';
    const entriesUrl = feedId
        ? `https://micro.blog/feeds/v2/feeds/${feedId}/entries.json?per_page=${perPage}&page=${page}${readParam}`
        : `https://micro.blog/feeds/v2/entries.json?per_page=${perPage}&page=${page}${readParam}`;

    let entries, unreadIds, starredIds, subscriptions, icons;
    try {
        const [entriesRes, unreadRes, starredRes, subsRes, iconsRes] = await Promise.all([
            fetch(entriesUrl, { method: "GET", headers }),
            fetch('https://micro.blog/feeds/v2/unread_entries.json', { method: "GET", headers }),
            fetch('https://micro.blog/feeds/v2/starred_entries.json', { method: "GET", headers }),
            fetch('https://micro.blog/feeds/v2/subscriptions.json?mode=extended', { method: "GET", headers }),
            fetch('https://micro.blog/feeds/v2/icons.json', { method: "GET", headers })
        ]);
        entries = await entriesRes.json();
        unreadIds = await unreadRes.json();
        starredIds = await starredRes.json();
        subscriptions = await subsRes.json();
        icons = await iconsRes.json();
    } catch (err) {
        console.log(`feed entries fetch failed for ${user?.username}: ${err?.message || err}`);
        return HTMLPage(token, 'Feed', `<p class="container p-2">Could not load entries right now. Please try again.</p>`, user);
    }

    const unreadSet = new Set(Array.isArray(unreadIds) ? unreadIds : []);
    const starredSet = new Set(Array.isArray(starredIds) ? starredIds : []);

    // Build feed_id → { title, host } lookup from subscriptions
    const feedInfo = {};
    const subsList = Array.isArray(subscriptions) ? subscriptions : [];
    for (const sub of subsList) {
        if (sub.feed_id) {
            feedInfo[sub.feed_id] = {
                title: sub.title || sub.feed_url || '',
                host: hostFromUrl(sub.site_url || sub.feed_url || '')
            };
        }
    }

    // Build host → icon URL lookup
    const iconMap = {};
    const iconList = Array.isArray(icons) ? icons : [];
    for (const icon of iconList) {
        if (icon.host && icon.url) iconMap[icon.host] = icon.url;
    }

    // Find the feed name for breadcrumb context
    let feedName = '';
    if (feedId) {
        feedName = feedInfo[feedId]?.title || '';
    }

    const items = Array.isArray(entries) ? entries : [];

    const feedHTML = items.map(entry => {
        const isUnread = unreadSet.has(entry.id);
        const title = entry.title || '';
        const info = feedInfo[entry.feed_id] || {};
        const name = info.title || '';
        const iconUrl = iconMap[info.host || ''] || '';
        const entryContent = sanitizeHTML(entry.content || entry.summary || '');

        // Feed icon (like avatar on timeline posts)
        const feedIcon = iconUrl
            ? `<div class="tile-icon"><figure class="avatar avatar-sm"><img src="${escapeHtml(iconUrl)}" alt="" loading="lazy" height="32" width="32"></figure></div>`
            : '';

        // Show title as a linked heading if present
        const entryTitle = title
            ? `<h6 class="entry-title" style="margin:0 0 0.5rem;"><a href="/feeds/entry/${entry.id}" style="text-decoration:none;color:var(--text);">${escapeHtml(title)}</a></h6>`
            : '';

        const isStarred = starredSet.has(entry.id);
        const entryUrl = entry.url || `/feeds/entry/${entry.id}`;

        const starAction = isStarred
            ? `<form action="/feed/unstar" method="POST"><input type="hidden" name="entry_id" value="${entry.id}"><button type="submit" class="btn btn-glossy btn-sm" title="Unstar"><i class="bi bi-star-fill"></i></button></form>`
            : `<form action="/feed/star" method="POST"><input type="hidden" name="entry_id" value="${entry.id}"><button type="submit" class="btn btn-glossy btn-sm" title="Star"><i class="bi bi-star"></i></button></form>`;

        const markAction = isUnread
            ? `<form action="/feed/mark-read" method="POST"><input type="hidden" name="entry_id" value="${entry.id}"><input type="hidden" name="redirect" value="${escapeHtml(req?.url || '/feeds/entries')}"><button type="submit" class="btn btn-glossy btn-sm" title="Mark read"><i class="bi bi-check2"></i></button></form>`
            : `<form action="/feed/mark-unread" method="POST"><input type="hidden" name="entry_id" value="${entry.id}"><input type="hidden" name="redirect" value="${escapeHtml(req?.url || '/feeds/entries')}"><button type="submit" class="btn btn-glossy btn-sm" title="Mark unread"><i class="bi bi-circle"></i></button></form>`;

        return _entryCard
            .replaceAll('{{id}}', entry.id)
            .replaceAll('{{url}}', escapeHtml(entryUrl))
            .replaceAll('{{feedIcon}}', feedIcon)
            .replaceAll('{{entryTitle}}', entryTitle)
            .replaceAll('{{content}}', entryContent)
            .replaceAll('{{feedName}}', escapeHtml(name))
            .replaceAll('{{date}}', formatDate(entry.published || entry.created_at))
            .replaceAll('{{unreadClass}}', isUnread ? 'entry-unread' : '')
            .replaceAll('{{actions}}', starAction + markAction);
    }).join('');

    // Paging
    const basePath = feedId ? `/feeds/${feedId}` : '/feeds/entries';
    const readQuery = showRead ? '&read=true' : '';
    const prevPage = page > 1 ? `<a href="${basePath}?page=${page - 1}${readQuery}">Previous</a>` : '';
    const nextPage = items.length >= perPage ? `<a href="${basePath}?page=${page + 1}${readQuery}">Next</a>` : '';
    const pagingHTML = (prevPage || nextPage)
        ? `<div class="paging mt-2">${prevPage}<span>${nextPage}</span></div>`
        : '';

    // Read/unread filter toggle
    const filterToggle = showRead
        ? `<a href="${basePath}" class="btn btn-glossy btn-sm"><i class="bi bi-envelope"></i> View unread</a>`
        : `<a href="${basePath}?read=true" class="btn btn-glossy btn-sm"><i class="bi bi-envelope-open"></i> View read</a>`;

    const emptyMsg = showRead
        ? 'No read entries.'
        : 'All caught up!';

    const content = _entriesTemplate
        .replaceAll('{{filterToggle}}', filterToggle)
        .replaceAll('{{feed}}', feedHTML || `<p class="mt-2" style="color:var(--overlay-1);">${emptyMsg}</p>`)
        .replaceAll('{{paging}}', pagingHTML);

    const context = feedId && feedName ? { feedId, feedName } : undefined;
    return HTMLPage(token, 'Feed', content, user, '', undefined, context);
}
