import { HTMLPage } from "./templates.js";

const _bookshelvesTemplate = new TextDecoder().decode(await Deno.readFile("templates/books/bookshelves.html"));

export async function BookshelvesTemplate(user, token) {
    const bookshelfFetching = await fetch(`https://micro.blog/books/bookshelves`, { method: "GET", headers: { "Authorization": "Bearer " + token } });
    const shelves = await bookshelfFetching.json();

    const shelvesHTML = shelves.items.sort((a, b) => a.title > b.title ? 1 : a.title < b.title ? -1 : 0).map(item =>
        `<div class="card mt-2">
            <div class="card-header">
                <a href="/bookshelves/shelf/${item.id}" class="tile-title">${item.title}</a>
                <small class="tile-subtitle">${item._microblog.books_count} book${item._microblog.books_count !== 1 ? 's' : ''}</small>
            </div>
        </div>`
    ).join('');

    const content = _bookshelvesTemplate
        .replaceAll('{{feed}}', shelvesHTML);

    return HTMLPage(token, 'Bookshelves', content, user);
}
