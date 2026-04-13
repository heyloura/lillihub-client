import { HTMLPage } from "./templates.js";

const _bookTemplate = new TextDecoder().decode(await Deno.readFile("templates/books/book.html"));

export async function BookTemplate(user, token, shelfid, id) {
    const headers = { "Authorization": "Bearer " + token };
    const [shelfRes, shelvesRes] = await Promise.all([
        fetch(`https://micro.blog/books/bookshelves/${shelfid}`, { method: "GET", headers }),
        fetch(`https://micro.blog/books/bookshelves`, { method: "GET", headers })
    ]);

    const results = await shelfRes.json();
    const shelves = await shelvesRes.json();

    const shelfName = results.title.replaceAll('Micro.blog - ', '');

    const shelvesRadioHTML = shelves.items.sort((a, b) => a.title > b.title ? 1 : a.title < b.title ? -1 : 0).map(item =>
        `<li class="mt-2"><label style="cursor:pointer;display:flex;align-items:center;gap:0.5rem;"><input type="radio" name="shelf[]" value="${item.id}" ${item.id == shelfid ? 'checked' : ''} /> ${item.title}</label></li>`
    ).join('');

    const book = results.items.find(item => item.id == id);
    if (!book) return HTMLPage(token, 'Edit book', '<div class="container mt-2"><p>Book not found.</p></div>', user);

    const content = _bookTemplate
        .replaceAll('{{image}}', book.image)
        .replaceAll('{{title}}', book.title)
        .replaceAll('{{titleEncoded}}', encodeURIComponent(book.title))
        .replaceAll('{{authorsEncoded}}', encodeURIComponent(book.authors.map(i => i.name).join(', ')))
        .replaceAll('{{shelfEncoded}}', encodeURIComponent(shelfName))
        .replaceAll('{{linkEncoded}}', encodeURIComponent(book.url))
        .replaceAll('{{shelfId}}', shelfid)
        .replaceAll('{{shelfName}}', shelfName)
        .replaceAll('{{id}}', book.id)
        .replaceAll('{{shelfList}}', shelvesRadioHTML)
        .replaceAll('{{authors}}', book.authors.map(i => i.name).join(', '));

    return HTMLPage(token, 'Edit book', content, user, '', undefined, { shelfId: shelfid, shelfName });
}
