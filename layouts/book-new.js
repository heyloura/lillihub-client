import { HTMLPage } from "./templates.js";

const _bookNewTemplate = new TextDecoder().decode(await Deno.readFile("templates/books/book-new.html"));

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export async function BookNewTemplate(user, token, req) {
    const shelvesRes = await fetch(`https://micro.blog/books/bookshelves`, { method: "GET", headers: { "Authorization": "Bearer " + token } });
    const shelves = await shelvesRes.json();

    const sorted = shelves.items.sort((a, b) => a.title > b.title ? 1 : a.title < b.title ? -1 : 0);
    const hasWantToRead = sorted.some(s => s.title.toLowerCase() === 'want to read');

    const shelvesRadioHTML = sorted.map((item, i) => {
        const checked = hasWantToRead
            ? item.title.toLowerCase() === 'want to read'
            : i === 0;
        return `<li class="mt-2"><label style="cursor:pointer;display:flex;align-items:center;gap:0.5rem;"><input type="radio" name="shelf[]" value="${item.id}" ${checked ? 'checked' : ''} /> ${item.title}</label></li>`;
    }).join('');

    // Pre-fill from query params (set by search results)
    const params = new URLSearchParams(req?.url?.split('?')[1] || '');

    const content = _bookNewTemplate
        .replaceAll('{{shelfList}}', shelvesRadioHTML)
        .replaceAll('{{prefillTitle}}', escapeHtml(params.get('title') || ''))
        .replaceAll('{{prefillAuthor}}', escapeHtml(params.get('author') || ''))
        .replaceAll('{{prefillIsbn}}', escapeHtml(params.get('isbn') || ''))
        .replaceAll('{{prefillCoverUrl}}', escapeHtml(params.get('cover_url') || ''));

    return HTMLPage(token, 'Add Book', content, user);
}
