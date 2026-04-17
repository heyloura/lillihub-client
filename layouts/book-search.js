import { HTMLPage } from "./templates.js";

const _searchTemplate = new TextDecoder().decode(await Deno.readFile("templates/books/book-search.html"));

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export async function BookSearchTemplate(user, token, req) {
    const params = new URLSearchParams(req.url.split('?')[1] || '');
    const query = params.get('q') || '';

    let resultsHTML = '';

    if (query) {
        try {
            const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=12&fields=title,author_name,first_publish_year,cover_i,isbn,key`);
            const data = await res.json();
            const docs = data.docs || [];

            if (docs.length === 0) {
                resultsHTML = `<p class="mt-2" style="color:var(--overlay-1);">No results found for "${escapeHtml(query)}".</p>`;
            } else {
                resultsHTML = `<div class="mt-2">${docs.map(doc => {
                    const title = doc.title || 'Untitled';
                    const author = (doc.author_name || []).join(', ') || '';
                    const year = doc.first_publish_year || '';
                    const isbn = (doc.isbn && doc.isbn[0]) || '';
                    const coverUrl = doc.cover_i
                        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
                        : '';

                    const addParams = new URLSearchParams();
                    addParams.set('title', title);
                    if (author) addParams.set('author', author);
                    if (isbn) addParams.set('isbn', isbn);
                    if (coverUrl) addParams.set('cover_url', coverUrl);

                    const subtitle = [author, year].filter(Boolean).join(' \u00b7 ');

                    return `<div class="card mt-2">
                        <div class="card-header" style="display:flex;align-items:center;gap:1rem;">
                            ${coverUrl
                                ? `<img width="48" height="74" loading="lazy" src="${escapeHtml(coverUrl)}" alt="" style="border-radius:4px;object-fit:cover;">`
                                : `<div style="width:48px;height:74px;border-radius:4px;background:var(--mantle);display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="bi bi-book" style="color:var(--overlay-1);"></i></div>`}
                            <div style="flex:1;min-width:0;">
                                <div class="tile-title" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(title)}</div>
                                ${subtitle ? `<small class="tile-subtitle">${escapeHtml(subtitle)}</small>` : ''}
                            </div>
                            <a href="/book/new?${addParams.toString()}" class="btn btn-glossy btn-sm" style="flex-shrink:0;"><i class="bi bi-plus"></i> Add</a>
                        </div>
                    </div>`;
                }).join('')}</div>`;
            }
        } catch (err) {
            console.log(`Open Library search failed for "${query}": ${err?.message || err}`);
            resultsHTML = `<p class="mt-2" style="color:var(--overlay-1);">Search is unavailable right now. You can <a href="/book/new">add a book manually</a>.</p>`;
        }
    }

    const content = _searchTemplate
        .replaceAll('{{query}}', escapeHtml(query))
        .replaceAll('{{results}}', resultsHTML);

    return HTMLPage(token, 'Search Books', content, user);
}
