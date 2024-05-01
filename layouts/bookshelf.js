import { HTMLPage } from "./templates.js";

const _bookTemplate = new TextDecoder().decode(await Deno.readFile("templates/_book.html"));
const _bookshelfTemplate = new TextDecoder().decode(await Deno.readFile("templates/bookshelf.html"));

export async function BookshelfTemplate(user, token, id) {
    const fetching = await fetch(`https://micro.blog/books/bookshelves/${id}`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
    const results = await fetching.json();

    const feed = (await Promise.all(results.items.map(async (item) => {
        return _bookTemplate
            .replaceAll('{{image}}', item.image)
            .replaceAll('{{title}}', item.title)
            .replaceAll('{{titleEncoded}}', encodeURIComponent(item.title))
            .replaceAll('{{shelf}}', encodeURIComponent(results.title.replaceAll('Micro.blog - ','')))
            .replaceAll('{{link}}', encodeURIComponent(item.url))
            .replaceAll('{{authorsEncoded}}', encodeURIComponent(item.authors.map(i => i.name).join(', ')))
            .replaceAll('{{shelfId}}', id)
            .replaceAll('{{id}}', item.id)
            .replaceAll('{{authors}}', item.authors.map(i => i.name).join(', '));
    }))).join('');


    const content = _bookshelfTemplate
        .replaceAll('{{id}}', id)
        .replaceAll('{{feed}}', feed)

    return HTMLPage(results.title.replaceAll('Micro.blog - ',''), content, user);
}