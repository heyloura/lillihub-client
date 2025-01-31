import { HTMLPage } from "./templates.js";

const _bookTemplate = new TextDecoder().decode(await Deno.readFile("templates/_book.html"));
const _bookshelfTemplate = new TextDecoder().decode(await Deno.readFile("templates/bookshelf.html"));
const colors = ["green-text","greenblue-text", "blue-text", "bluepurple-text", "purple-text", "purplered-text", "red-text", "redorange-text", "orange-text", "orangeyellow-text", "yellowgreen-text"];
const borderColors = ["green-border","greenblue-border", "blue-border", "bluepurple-border", "purple-border", "purplered-border", "red-border", "redorange-border", "orange-border", "orangeyellow-border", "yellowgreen-border"];


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
        .replaceAll('{{title}}', results.title.replaceAll('Micro.blog - ',''))

    const fetchingBookshelves = await fetch(`https://micro.blog/books/bookshelves`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
    const resultsBookshelves = await fetchingBookshelves.json();
    const bookshelves = resultsBookshelves.items.sort((a,b) => (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0)).map((item,i) =>
        `<li><a onclick="addLoading(this)" class="btn btn-link ${colors[i%11]} ${id == item.id ? borderColors[i%11] : ''}" href="/bookshelves/shelf/${item.id}">${item.title}</a></li>`
    ).join('');

    return HTMLPage(token, 'Bookshelf', content, user, '', bookshelves);
}