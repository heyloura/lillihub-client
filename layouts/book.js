import { HTMLPage } from "./templates.js";

const _bookTemplate = new TextDecoder().decode(await Deno.readFile("templates/book.html"));

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

    return HTMLPage('Edit book', content, user);
}