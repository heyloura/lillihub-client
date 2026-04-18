import { HTMLPage } from "./templates.js";
import { sanitizeHTML } from "../scripts/server/utilities.js";

const _starredTemplate = new TextDecoder().decode(await Deno.readFile("templates/feeds/starred.html"));
const _entryCard = new TextDecoder().decode(await Deno.readFile("templates/feeds/_entry.html"));

function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function hostFromUrl(url) {
    try { return new URL(url).hostname; } catch { return ''; }
}

function formatDate(dateStr) {
    try {
        const d = new Date(dateStr);
        if (isNaN(d)) return dateStr || '';
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return dateStr || ''; }
}

export async function FeedStarredTemplate(user, token) {
    const headers = { "Authorization": "Bearer " + token };

    let starredIds, subscriptions, icons;
    try {
        const [starredRes, subsRes, iconsRes] = await Promise.all([
            fetch('https://micro.blog/feeds/v2/starred_entries.json', { method: "GET", headers }),
            fetch('https://micro.blog/feeds/v2/subscriptions.json?mode=extended', { method: "GET", headers }),
            fetch('https://micro.blog/feeds/v2/icons.json', { method: "GET", headers })
        ]);
        starredIds = await starredRes.json();
        subscriptions = await subsRes.json();
        icons = await iconsRes.json();
    } catch (err) {
        console.log(`starred entries fetch failed for ${user?.username}: ${err?.message || err}`);
        return HTMLPage(token, 'Starred', `<p class="container p-2">Could not load starred entries right now. Please try again.</p>`, user);
    }

    const ids = Array.isArray(starredIds) ? starredIds : [];

    if (ids.length === 0) {
        const content = _starredTemplate
            .replaceAll('{{emptyState}}', `<p class="mt-2 pt-2" style="color:var(--overlay-1);">No starred entries yet. Star entries while reading to save them here.</p>`)
            .replaceAll('{{feed}}', '');
        return HTMLPage(token, 'Starred', content, user);
    }

    // Fetch entries by IDs (batch)
    let entries;
    try {
        const entriesRes = await fetch(`https://micro.blog/feeds/v2/entries.json?ids=${ids.join(',')}`, { method: "GET", headers });
        entries = await entriesRes.json();
    } catch (err) {
        console.log(`starred entries detail fetch failed for ${user?.username}: ${err?.message || err}`);
        return HTMLPage(token, 'Starred', `<p class="container p-2">Could not load starred entries right now. Please try again.</p>`, user);
    }

    // Build feed info + icon lookups
    const feedInfoMap = {};
    const subsList = Array.isArray(subscriptions) ? subscriptions : [];
    for (const sub of subsList) {
        if (sub.feed_id) {
            feedInfoMap[sub.feed_id] = {
                title: sub.title || sub.feed_url || '',
                host: hostFromUrl(sub.site_url || sub.feed_url || '')
            };
        }
    }
    const iconMap = {};
    const iconList = Array.isArray(icons) ? icons : [];
    for (const icon of iconList) {
        if (icon.host && icon.url) iconMap[icon.host] = icon.url;
    }

    const items = Array.isArray(entries) ? entries : [];

    const feedHTML = items.map(entry => {
        const title = entry.title || '';
        const info = feedInfoMap[entry.feed_id] || {};
        const name = info.title || '';
        const iconUrl = iconMap[info.host || ''] || '';
        const entryContent = sanitizeHTML(entry.content || entry.summary || '');

        const feedIcon = iconUrl
            ? `<div class="tile-icon"><figure class="avatar avatar-sm"><img src="${escapeHtml(iconUrl)}" alt="" loading="lazy" height="32" width="32"></figure></div>`
            : '';

        const entryTitle = title
            ? `<h6 class="entry-title" style="margin:0 0 0.5rem;"><a href="/feeds/entry/${entry.id}" style="text-decoration:none;color:var(--text);">${escapeHtml(title)}</a></h6>`
            : '';

        const entryUrl = entry.url || `/feeds/entry/${entry.id}`;

        const unstarAction = `<form action="/feed/unstar" method="POST"><input type="hidden" name="entry_id" value="${entry.id}"><button type="submit" class="btn btn-glossy btn-sm" title="Unstar"><i class="bi bi-star-fill"></i></button></form>`;

        return _entryCard
            .replaceAll('{{id}}', entry.id)
            .replaceAll('{{url}}', escapeHtml(entryUrl))
            .replaceAll('{{feedIcon}}', feedIcon)
            .replaceAll('{{entryTitle}}', entryTitle)
            .replaceAll('{{content}}', entryContent)
            .replaceAll('{{feedName}}', escapeHtml(name))
            .replaceAll('{{date}}', formatDate(entry.published || entry.created_at))
            .replaceAll('{{unreadClass}}', '')
            .replaceAll('{{actions}}', unstarAction);
    }).join('');

    const content = _starredTemplate
        .replaceAll('{{emptyState}}', '')
        .replaceAll('{{feed}}', feedHTML);

    return HTMLPage(token, 'Starred', content, user);
}
