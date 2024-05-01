import { HTMLPage } from "./templates.js";
import { PostTemplate } from "./_post.js";

const _addShelfTemplate = new TextDecoder().decode(await Deno.readFile("templates/_shelf_add.html"));
const _bookshelvesTemplate = new TextDecoder().decode(await Deno.readFile("templates/bookshelves.html"));

export async function BookshelvesTemplate(user, token, replyTo = 0) {
    console.time('https://micro.blog/posts/discover/books');
    const fetching = await fetch(`https://micro.blog/posts/discover/books`, { method: "GET" });
    const results = await fetching.json();
    console.timeEnd('https://micro.blog/posts/discover/books');

    console.time('https://micro.blog/books/bookshelves');
    const bookshelfFetching = await fetch(`https://micro.blog/books/bookshelves`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
    const shelves = await bookshelfFetching.json();
    console.timeEnd('https://micro.blog/books/bookshelves');
    
    const shelvesHTML = shelves.items.sort((a,b) => (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0)).map((item) =>
        `<span class="chip"><a onclick="addLoading(this)" href="/bookshelves/shelf/${item.id}">${item.title} - ${item._microblog.books_count}</a></span>`
    ).join('');
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
   
    const content = _bookshelvesTemplate
        .replaceAll('{{shelves}}', shelvesHTML)
        .replaceAll('{{feed}}', feed);


    return HTMLPage(`Bookshelves`, content, user);
}