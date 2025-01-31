import { HTMLPage } from "./templates.js";

const _bookTemplate = new TextDecoder().decode(await Deno.readFile("templates/book.html"));
const colors = ["green-text","greenblue-text", "blue-text", "bluepurple-text", "purple-text", "purplered-text", "red-text", "redorange-text", "orange-text", "orangeyellow-text", "yellowgreen-text"];
const borderColors = ["green-border","greenblue-border", "blue-border", "bluepurple-border", "purple-border", "purplered-border", "red-border", "redorange-border", "orange-border", "orangeyellow-border", "yellowgreen-border"];

export async function BookTemplate(user, token, shelfid, id) {
    const fetching = await fetch(`https://micro.blog/books/bookshelves/${shelfid}`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
    const results = await fetching.json();

    const bookshelfFetching = await fetch(`https://micro.blog/books/bookshelves`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
    const shelves = await bookshelfFetching.json();
    const shelvesButtonListHTML = shelves.items.sort((a,b) => (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0)).map((item) =>
        `<li><label><input type="radio" name="shelf[]" value="${item.id}" ${item.id == shelfid ? 'checked="checked"' : ''} /> ${item.title}</label></li>`
    ).join('');
    
    const content = (await Promise.all(results.items.map(async (item) => {
        if(item.id == id) {
            return _bookTemplate
            .replaceAll('{{image}}', item.image)
            .replaceAll('{{title}}', item.title)
            .replaceAll('{{shelfId}}', shelfid)
            .replaceAll('{{shelfName}}', results.title.replaceAll('Micro.blog - ',''))
            .replaceAll('{{id}}', item.id)
            .replaceAll('{{shelfList}}', shelvesButtonListHTML)
            .replaceAll('{{authors}}', item.authors.map(i => i.name).join(', '));
        }
        return '';
    }))).join('');

    const bookshelves = shelves.items.sort((a,b) => (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0)).map((item,i) =>
        `<li><a onclick="addLoading(this)" class="btn btn-link ${colors[i%11]} ${shelfid == item.id ? borderColors[i%11] : ''}" href="/bookshelves/shelf/${item.id}">${item.title}</a></li>`
    ).join('');

    return HTMLPage(token, 'Edit book', content, user, '', bookshelves );
}