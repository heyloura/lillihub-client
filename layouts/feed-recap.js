import { HTMLPage } from "./templates.js";
import { sanitizeHTML } from "../scripts/server/utilities.js";

const _recapTemplate = new TextDecoder().decode(await Deno.readFile("templates/feeds/recap.html"));

export async function FeedRecapTemplate(user, token, req) {
    const headers = { "Authorization": "Bearer " + token };
    const params = new URLSearchParams(req?.url?.split('?')[1] || '');
    const source = params.get('source') || '';
    const isAjax = params.get('ajax') === '1';

    // No source selected — show the picker without generating
    if (!source) {
        const content = _recapTemplate
            .replaceAll('{{recapContent}}', `<p style="color:var(--overlay-1);">Choose a source above to generate your recap.</p>`)
            .replaceAll('{{starredActive}}', '')
            .replaceAll('{{readActive}}', '')
            .replaceAll('{{unreadActive}}', '');
        return HTMLPage(token, 'Recap', content, user);
    }

    // Fetch entry IDs based on the chosen source
    let ids = [];
    try {
        if (source === 'starred') {
            const res = await fetch('https://micro.blog/feeds/v2/starred_entries.json', { method: "GET", headers });
            const data = await res.json();
            ids = Array.isArray(data) ? data : [];
        } else if (source === 'read') {
            const res = await fetch('https://micro.blog/feeds/v2/entries.json?per_page=50&read=true', { method: "GET", headers });
            const data = await res.json();
            ids = (Array.isArray(data) ? data : []).map(e => e.id);
        } else if (source === 'unread') {
            const res = await fetch('https://micro.blog/feeds/v2/unread_entries.json', { method: "GET", headers });
            const data = await res.json();
            ids = Array.isArray(data) ? data : [];
        }
    } catch (err) {
        console.log(`recap fetch (${source}) failed for ${user?.username}: ${err?.message || err}`);
        const errMsg = `<p style="color:var(--overlay-1);">Could not load recap right now. Please try again.</p>`;
        if (isAjax) return errMsg;
        return HTMLPage(token, 'Recap', `<p class="container p-2">${errMsg}</p>`, user);
    }

    // Active state for source buttons
    const activeStyle = 'style="opacity:1;font-weight:600;"';
    const starredActive = source === 'starred' ? activeStyle : '';
    const readActive = source === 'read' ? activeStyle : '';
    const unreadActive = source === 'unread' ? activeStyle : '';

    if (ids.length === 0) {
        const labels = { starred: 'starred', read: 'read', unread: 'unread' };
        const emptyMsg = `<p style="color:var(--overlay-1);">No ${labels[source]} entries to generate a recap from.</p>`;
        if (isAjax) return emptyMsg;
        const content = _recapTemplate
            .replaceAll('{{recapContent}}', emptyMsg)
            .replaceAll('{{starredActive}}', starredActive)
            .replaceAll('{{readActive}}', readActive)
            .replaceAll('{{unreadActive}}', unreadActive);
        return HTMLPage(token, 'Recap', content, user);
    }

    // Request recap generation — body is a plain array of entry IDs.
    // Ajax mode: single request, let the client poll.
    // Full page mode: poll server-side up to ~1 minute.
    let recapHTML = '';
    try {
        const maxAttempts = isAjax ? 1 : 12;
        let res;
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            res = await fetch('https://micro.blog/feeds/recap', {
                method: "POST",
                body: JSON.stringify(ids),
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                    ...headers
                }
            });
            if (res.status !== 202) break;
            if (!isAjax) await new Promise(r => setTimeout(r, 5000));
        }

        if (res.status === 202) {
            recapHTML = `<p style="color:var(--overlay-1);"><i class="bi bi-hourglass-split"></i> Your recap is still being generated. Try refreshing in a moment.</p>`;
        } else if (res.ok) {
            const text = await res.text();
            recapHTML = text
                ? `<div class="feed-entry-content">${sanitizeHTML(text)}</div>`
                : `<p style="color:var(--overlay-1);">Recap returned empty. Try selecting a different source.</p>`;
        } else {
            recapHTML = `<p style="color:var(--overlay-1);">Could not generate recap right now. Please try again.</p>`;
        }
    } catch (err) {
        console.log(`recap generation failed for ${user?.username}: ${err?.message || err}`);
        recapHTML = `<p style="color:var(--overlay-1);">Could not generate recap right now. Please try again.</p>`;
    }

    if (isAjax) return recapHTML;

    const content = _recapTemplate
        .replaceAll('{{recapContent}}', recapHTML)
        .replaceAll('{{starredActive}}', starredActive)
        .replaceAll('{{readActive}}', readActive)
        .replaceAll('{{unreadActive}}', unreadActive);

    return HTMLPage(token, 'Recap', content, user);
}
