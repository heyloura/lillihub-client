import { HTMLPage } from "./templates.js";
import { PostTemplate } from "./_post.js";

const _addShelfTemplate = new TextDecoder().decode(await Deno.readFile("templates/_shelf_add.html"));
const _booksTemplate = new TextDecoder().decode(await Deno.readFile("templates/books.html"));
const colors = ["green-text","greenblue-text", "blue-text", "bluepurple-text", "purple-text", "purplered-text", "red-text", "redorange-text", "orange-text", "orangeyellow-text", "yellowgreen-text"];
const borderColors = ["green-border","greenblue-border", "blue-border", "bluepurple-border", "purple-border", "purplered-border", "red-border", "redorange-border", "orange-border", "orangeyellow-border", "yellowgreen-border"];


export async function BooksTemplate(user, token, replyTo = 0) {
    const fetching = await fetch(`https://micro.blog/posts/discover/books`, { method: "GET" });
    const results = await fetching.json();

    const bookshelfFetching = await fetch(`https://micro.blog/books/bookshelves`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
    const shelves = await bookshelfFetching.json();
    
    const shelvesChecklistHTML = shelves.items.sort((a,b) => (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0)).map((item) =>
        `<label><input type="checkbox" name="shelf[]" value="${item.id}" ${item.title.toLowerCase() == "Want to read".toLowerCase() ? 'checked="checked"' : ''} /> ${item.title}</label><br/>`
    ).join('');
   
    const feed = (await Promise.all(results.items.map(async (item) => {
        return await PostTemplate(item.id, 
            item, 
            [], 
            user, 
            token, 
            0, 
            _addShelfTemplate.replaceAll('{{title}}',item._microblog.book_title).replaceAll('{{author}}',item._microblog.book_author).replaceAll('{{isbn}}',item._microblog.isbn).replaceAll('{{shelfChecklist}}', shelvesChecklistHTML), 
            false,
            false, 
            true);

    }))).join('');
   
    const content = _booksTemplate
        .replaceAll('{{feed}}', feed);

    const fetchingBookshelves = await fetch(`https://micro.blog/books/bookshelves`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
    const resultsBookshelves = await fetchingBookshelves.json();
    const bookshelves = resultsBookshelves.items.sort((a,b) => (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0)).map((item,i) =>
        `<li><a onclick="addLoading(this)" class="btn btn-link ${colors[i%11]} ${id == item.id ? borderColors[i%11] : ''}" href="/bookshelves/shelf/${item.id}">${item.title}</a></li>`
    ).join('');


    return HTMLPage(token, `Books`, content, user, '', bookshelves);
}