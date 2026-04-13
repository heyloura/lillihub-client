import { HTMLPage } from "./templates.js";

const _bookTemplate = new TextDecoder().decode(await Deno.readFile("templates/books/_book.html"));
const _bookshelfTemplate = new TextDecoder().decode(await Deno.readFile("templates/books/bookshelf.html"));

export async function BookshelfTemplate(user, token, id) {
    const fetching = await fetch(`https://micro.blog/books/bookshelves/${id}`, { method: "GET", headers: { "Authorization": "Bearer " + token } });
    const results = await fetching.json();

    const shelfName = results.title.replaceAll('Micro.blog - ', '');

    const feed = results.items.map(item =>
        _bookTemplate
            .replaceAll('{{image}}', item.image)
            .replaceAll('{{title}}', item.title)
            .replaceAll('{{shelfId}}', id)
            .replaceAll('{{id}}', item.id)
            .replaceAll('{{authors}}', item.authors.map(i => i.name).join(', '))
    ).join('');

    const content = _bookshelfTemplate
        .replaceAll('{{feed}}', feed);

    return HTMLPage(token, 'Bookshelf', content, user, '', undefined, { shelfId: id, shelfName });
}
