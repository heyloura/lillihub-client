import { HTMLPage } from "./templates.js";
import { errorBanner } from "../scripts/server/utilities.js";

const _feedsTemplate = new TextDecoder().decode(await Deno.readFile("templates/feeds/feeds.html"));

function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export async function FeedsTemplate(user, token, req) {
    let subscriptions;
    try {
        const res = await fetch('https://micro.blog/feeds/v2/subscriptions.json?mode=extended', {
            method: "GET",
            headers: { "Authorization": "Bearer " + token }
        });
        subscriptions = await res.json();
    } catch (err) {
        console.log(`feeds fetch failed for ${user?.username}: ${err?.message || err}`);
        return HTMLPage(token, 'Feeds', `<p class="container p-2">Could not load feeds right now. Please try again.</p>`, user);
    }

    const items = Array.isArray(subscriptions) ? subscriptions : [];

    const feedsHTML = items.sort((a, b) => (a.title || '').localeCompare(b.title || '')).map(item => {
        const title = escapeHtml(item.title || item.feed_url || 'Untitled');
        const siteUrl = item.site_url || item.feed_url || '';
        return `<div class="card mt-2 feed-card" data-feed-id="${item.id}">
            <div class="card-header">
                <div class="card-header-scroll">
                    <div class="card-header-main">
                        <a href="/feeds/${item.feed_id}" class="tile-title">${title}</a>
                        ${siteUrl ? `<small class="tile-subtitle">${escapeHtml(siteUrl)}</small>` : ''}
                    </div>
                    <div class="card-header-actions btn-group">
                        <div class="dropdown dropdown-right">
                            <a class="btn btn-glossy btn-sm dropdown-toggle" tabindex="0"><i class="bi bi-three-dots-vertical"></i></a>
                            <ul class="menu" style="min-width:200px; padding:0.5rem;">
                                <form action="/feed/rename" method="POST" class="mb-2">
                                    <input type="hidden" name="subscription_id" value="${item.id}" />
                                    <div class="input-group">
                                        <input type="text" name="title" value="${title}" class="form-input" required />
                                        <button type="submit" class="btn btn-glossy btn-sm">Rename</button>
                                    </div>
                                </form>
                                <details>
                                    <summary class="btn btn-glossy btn-sm" style="list-style:none;"><i class="bi bi-trash"></i> Unsubscribe</summary>
                                    <form action="/feed/unsubscribe" method="POST" class="mt-2" onsubmit="return confirm('Unsubscribe from this feed?')">
                                        <input type="hidden" name="subscription_id" value="${item.id}" />
                                        <p style="font-size:0.85rem;color:var(--overlay-1);">You will no longer receive entries from this feed.</p>
                                        <button type="submit" class="btn btn-glossy btn-sm">Confirm</button>
                                    </form>
                                </details>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    }).join('');

    const searchParams = new URLSearchParams(req?.url?.split('?')[1] || '');
    const banner = errorBanner(searchParams.get('error'), '/feeds');

    const emptyState = items.length === 0
        ? `<p class="mt-2" style="color:var(--overlay-1);">No feeds yet. <a href="/feed/new">Add your first feed</a> to get started.</p>`
        : '';

    const content = _feedsTemplate
        .replaceAll('{{errorBanner}}', banner)
        .replaceAll('{{feeds}}', feedsHTML)
        .replaceAll('{{emptyState}}', emptyState);

    return HTMLPage(token, 'Feeds', content, user);
}
