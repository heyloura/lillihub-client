import { formatDate } from "../scripts/server/utilities.js";
import { HTMLPage } from "./templates.js";

const _bookmarkTemplate = new TextDecoder().decode(await Deno.readFile("templates/bookmarks/_bookmark.html"));
const _summaryTemplate = new TextDecoder().decode(await Deno.readFile("templates/bookmarks/_summary.html"));
const _bookmarksTemplate = new TextDecoder().decode(await Deno.readFile("templates/bookmarks/bookmarks.html"));
const _highlightTemplate = new TextDecoder().decode(await Deno.readFile("templates/bookmarks/_highlight.html"));
const _highlightsTemplate = new TextDecoder().decode(await Deno.readFile("templates/bookmarks/highlights.html"));

export async function BookmarksTemplate(user, token, req) {
    const searchParams = new URLSearchParams(req.url.split('?')[1]);
    const tagParam = searchParams.get('tag');
    const q = searchParams.get('q');
    // Lazy by default — only fetch the first page. ?all=1 forces the full
    // walk. A search query implies the user is hunting for something
    // specific, so auto-promote to all.
    const fetchAll = searchParams.get('all') === '1' || !!q;

    const fetchResult = await fetchBookmarks(token, tagParam, fetchAll, user.username);
    let items = fetchResult.items;

    // Server-side search filter
    if(q) {
        const lower = q.toLowerCase();
        items = items.filter(item =>
            (item.author?.name || '').toLowerCase().includes(lower) ||
            (item.content_html || '').toLowerCase().includes(lower) ||
            (item.summary || '').toLowerCase().includes(lower) ||
            (item.tags || '').toLowerCase().includes(lower)
        );
    }

    // Premium: fetch tags and highlights in parallel. Degrade gracefully if
    // either endpoint fails — the bookmarks feed itself is already rendered.
    let allTags = [];
    let highlightItems = [];
    if(user.plan == 'premium') {
        try {
            const [tagRes, highlights] = await Promise.all([
                fetch(`https://micro.blog/posts/bookmarks/tags`, { method: "GET", headers: { "Authorization": "Bearer " + token } }),
                fetchAllHighlights(token)
            ]);
            const tagsJson = await tagRes.json();
            allTags = Array.isArray(tagsJson) ? tagsJson : [];
            allTags.sort();
            highlightItems = highlights;
        } catch (err) {
            console.log(`bookmarks tags/highlights fetch failed for ${user.username}: ${err?.message || err}`);
        }
    }

    // Build tag filter chips for the toolbar
    const tagChips = allTags.map(tag => {
        const isActive = tagParam == tag;
        return `<a class="chip ${isActive ? 'active' : ''}" href="/bookmarks${isActive ? '' : '?tag=' + encodeURIComponent(tag)}">${tag}${isActive ? ' <i class="bi bi-x-lg"></i>' : ''}</a>`;
    }).join('');

    // Build highlight lookup map for O(1) access
    const highlightMap = new Map();
    for (const h of highlightItems) {
        highlightMap.set(h.url, (highlightMap.get(h.url) || 0) + 1);
    }

    const feed = items.map(item => {
        const itemTags = item.tags ? item.tags.split(',').filter(t => t) : [];
        const currentTagsCSV = itemTags.join(',');

        // Removable tag pills
        const tagPills = user.plan == 'premium' && itemTags.length > 0
            ? itemTags.map(tag =>
                `<span class="chip bookmark-tag-chip">${tag}<form method="POST" action="/bookmarks/remove-tag" style="display:inline">` +
                `<input type="hidden" name="id" value="${item.id}" />` +
                `<input type="hidden" name="tag" value="${tag}" />` +
                `<input type="hidden" name="currentTags" value="${currentTagsCSV}" />` +
                `<button type="submit" class="bookmark-tag-remove" title="Remove tag" onclick="return confirm('Remove tag: ${tag}?')"><i class="bi bi-x"></i></button>` +
                `</form></span>`
            ).join('')
            : itemTags.map(tag => `<span class="chip bookmark-tag-chip">${tag}</span>`).join('');

        // Add-tag dropdown — shows tags not already on this bookmark
        let tagAddDropdown = '';
        if (user.plan == 'premium') {
            const availableTags = allTags.filter(t => !itemTags.includes(t));
            const datalistId = `tags-${item.id}`;
            const opts = availableTags.map(t => `<option value="${t}">`).join('');
            tagAddDropdown = `<form method="POST" action="/bookmarks/add-tag" class="bookmark-add-tag-form">` +
                `<input type="hidden" name="id" value="${item.id}" />` +
                `<input type="hidden" name="currentTags" value="${currentTagsCSV}" />` +
                `<input type="text" name="tag" list="${datalistId}" class="form-input bookmark-add-tag-input" placeholder="Add tag\u2026" required />` +
                `<datalist id="${datalistId}">${opts}</datalist>` +
                `<button type="submit" class="btn btn-glossy btn-sm"><i class="bi bi-plus"></i></button>` +
                `</form>`;
        }

        const highlightCount = highlightMap.get(item.url) || 0;
        const contentHtml = highlightCount > 0
            ? item.content_html.replace('Reader:', `<span class="chip bookmark-highlight-chip">${highlightCount} highlight${highlightCount > 1 ? 's' : ''}</span> Reader:`)
            : item.content_html;

        const quoteback = `<blockquote class="quoteback" data-author="${item.author.name}" data-avatar="${item.author.avatar}" cite="${item.url}">` +
            `<p>${item.author.name} <a href="${item.url}">${item.url.replace(/^https?:\/\//, '').split('/')[0]}</a></p>` +
            `<footer>${item.author.name} <cite><a href="${item.url}" class="u-in-reply-to">${item.url}</a></cite></footer>` +
            `</blockquote>`;

        return _bookmarkTemplate
            .replaceAll('{{avatar}}', item.author.avatar)
            .replaceAll('{{name}}', item.author.name)
            .replaceAll('{{formattedDate}}', formatDate(item.date_published))
            .replaceAll('{{tagPills}}', tagPills)
            .replaceAll('{{tagAddDropdown}}', tagAddDropdown)
            .replaceAll('{{id}}', item.id)
            .replaceAll('{{postHref}}', `/post?content=${encodeURIComponent(quoteback)}`)
            .replaceAll('{{summary}}', item.summary ? _summaryTemplate.replaceAll('{{summary}}', item.summary) : '')
            .replaceAll('{{highlightCount}}', contentHtml);
    }).join('');

    // Footer below the feed:
    //   - lazy mode with results: offer "Load all bookmarks" (preserving tag filter)
    //   - lazy mode with zero results: nothing (the empty state speaks for itself)
    //   - full mode (fetchAll / search): show "No more bookmarks found"
    //     as a terminal marker so the user knows they're at the end
    let loadAllLink = '';
    if (!fetchAll && items.length > 0) {
        loadAllLink = `<div class="paging mt-2"><a href="/bookmarks?all=1${tagParam ? '&tag=' + encodeURIComponent(tagParam) : ''}">Load all bookmarks</a></div>`;
    } else if (fetchAll) {
        loadAllLink = `<div class="paging mt-2"><small>No more bookmarks found.</small></div>`;
    }

    const content = _bookmarksTemplate
        .replaceAll('{{tagChips}}', tagChips ? `<div class="bookmark-tags mt-2">${tagChips}</div>` : '')
        .replaceAll('{{q}}', q || '')
        .replaceAll('{{feed}}', feed)
        .replaceAll('{{loadAllLink}}', loadAllLink);

    return HTMLPage(token, 'Bookmarks', content, user);
}

// --- Highlights page ---
export async function HighlightsTemplate(user, token) {
    const highlights = await fetchAllHighlights(token);

    const feed = highlights.map(h => {
        const blockquote = `> ${h.content_text}\n>\n> — [${h.title}]`;
        return _highlightTemplate
            .replaceAll('{{id}}', h.id)
            .replaceAll('{{contentText}}', h.content_text)
            .replaceAll('{{title}}', h.title || 'Untitled')
            .replaceAll('{{formattedDate}}', formatDate(h.date_published, 'short'))
            .replaceAll('{{blockquoteEncoded}}', encodeURIComponent(blockquote))
            .replaceAll('{{blockquoteRaw}}', blockquote.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));
    }).join('');

    const hasItems = highlights.length > 0;
    const content = _highlightsTemplate
        .replaceAll('{{feed}}', feed)
        .replaceAll('{{count}}', String(highlights.length))
        .replaceAll('{{countPlural}}', highlights.length === 1 ? '' : 's')
        .replaceAll('{{#empty}}', hasItems ? '<!--' : '')
        .replaceAll('{{/empty}}', hasItems ? '-->' : '')
        .replaceAll('{{#hasItems}}', hasItems ? '' : '<!--')
        .replaceAll('{{/hasItems}}', hasItems ? '' : '-->');

    return HTMLPage(token, 'Highlights', content, user);
}

// Fetch bookmarks from micro.blog. When fetchAll is false, returns only the
// first page; the caller shows a "Load all" link that re-requests with ?all=1.
// When fetchAll is true, walks the full pagination. Tag filtering is applied
// at the API level when tagParam is set.
async function fetchBookmarks(token, tagParam, fetchAll, username) {
    let items = [];
    let bookmarkId = 0;
    let newBookmarkId = -1;
    let i = 0;

    while(bookmarkId != newBookmarkId && i < 1000) {
        let params = '';
        if(bookmarkId == 0) {
            if(tagParam) params = `?tag=${tagParam}`;
        } else {
            params = `?before_id=${items[items.length - 1].id}`;
            if(tagParam) params += `&tag=${tagParam}`;
        }
        let results;
        try {
            const fetching = await fetch(`https://micro.blog/posts/bookmarks${params}`, { method: "GET", headers: { "Authorization": "Bearer " + token } });
            results = await fetching.json();
        } catch (err) {
            // Stop paginating on network error — render whatever we've collected so far.
            console.log(`bookmarks pagination failed mid-loop for ${username}: ${err?.message || err}`);
            break;
        }

        if(!results.items || results.items.length == 0) break;

        bookmarkId = items.length > 0 ? items[items.length - 1].id : results.items[results.items.length - 1].id;
        newBookmarkId = i == 0 ? -1 : results.items[results.items.length - 1].id;
        items = [...items, ...results.items];
        i++;

        // Lazy mode: stop after the first page.
        if (!fetchAll) break;
    }

    return { items };
}

async function fetchAllHighlights(token) {
    let items = [];
    let highlightId = 0;
    let newHighlightId = -1;
    let j = 0;
    while(highlightId != newHighlightId && j < 1000) {
        let results;
        try {
            const fetching = await fetch(`https://micro.blog/posts/bookmarks/highlights${highlightId == 0 ? '' : '?before_id=' + items[items.length - 1].id}`, { method: "GET", headers: { "Authorization": "Bearer " + token } });
            results = await fetching.json();
        } catch (err) {
            // Stop paginating on network error — return whatever we've collected so far.
            console.log(`fetchAllHighlights failed mid-pagination: ${err?.message || err}`);
            break;
        }
        if(!results.items || results.items.length == 0) break;
        highlightId = items.length > 0 ? items[items.length - 1].id : results.items[results.items.length - 1].id;
        newHighlightId = j == 0 ? -1 : results.items[results.items.length - 1].id;
        items = [...items, ...results.items];
        j++;
    }
    return items;
}
