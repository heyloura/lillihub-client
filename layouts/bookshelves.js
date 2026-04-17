import { HTMLPage } from "./templates.js";
import { errorBanner } from "../scripts/server/utilities.js";

const _bookshelvesTemplate = new TextDecoder().decode(await Deno.readFile("templates/books/bookshelves.html"));

export async function BookshelvesTemplate(user, token, req) {
    const bookshelfFetching = await fetch(`https://micro.blog/books/bookshelves`, { method: "GET", headers: { "Authorization": "Bearer " + token } });
    const shelves = await bookshelfFetching.json();

    const shelvesHTML = shelves.items.sort((a, b) => a.title > b.title ? 1 : a.title < b.title ? -1 : 0).map(item => {
        const count = item._microblog?.books_count ?? 0;
        return `<div class="card mt-2 bookshelf-card" data-bookshelf-id="${item.id}">
            <div class="card-header">
                <div class="card-header-scroll">
                    <div class="card-header-main">
                        <a href="/bookshelves/shelf/${item.id}" class="tile-title">${item.title}</a>
                        <small class="tile-subtitle">${count} book${count !== 1 ? 's' : ''}</small>
                    </div>
                    <div class="card-header-actions btn-group">
                        <div class="dropdown dropdown-right">
                            <a class="btn btn-glossy btn-sm dropdown-toggle" tabindex="0"><i class="bi bi-three-dots-vertical"></i></a>
                            <ul class="menu" style="min-width:200px; padding:0.5rem;">
                                <form action="/bookshelf/rename" method="POST">
                                    <input type="hidden" name="bookshelf_id" value="${item.id}" />
                                    <div class="input-group">
                                        <input type="text" name="name" value="${item.title}" class="form-input" required />
                                        <button type="submit" class="btn btn-glossy btn-sm">Rename</button>
                                    </div>
                                </form>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    }).join('');

    const searchParams = new URLSearchParams(req?.url?.split('?')[1] || '');
    const banner = errorBanner(searchParams.get('error'), '/bookshelves');

    const content = _bookshelvesTemplate
        .replaceAll('{{feed}}', shelvesHTML)
        .replaceAll('{{errorBanner}}', banner);

    return HTMLPage(token, 'Bookshelves', content, user);
}
