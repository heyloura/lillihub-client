import { HTMLPage } from "./templates.js";

const _bookshelvesTemplate = new TextDecoder().decode(await Deno.readFile("templates/bookshelves.html"));

export async function BookshelvesTemplate(user, token, replyTo = 0) {
    const bookshelfFetching = await fetch(`https://micro.blog/books/bookshelves`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
    const shelves = await bookshelfFetching.json();
    
    const shelvesHTML = shelves.items.sort((a,b) => (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0)).map((item) =>
        `<li><span class="chip"><a onclick="addLoading(this)" href="/bookshelves/shelf/${item.id}">${item.title} - ${item._microblog.books_count}</a></span></li>`
    ).join('');
   
    const content = _bookshelvesTemplate
        .replaceAll('{{feed}}', shelvesHTML);

    return HTMLPage(token, `Bookshelves`, content, user);
}