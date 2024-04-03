import { HTMLPage } from "./templates.js";
import { PostTemplate } from "./_post.js";
import { getConversation } from "../scripts/server/mb.js";

const _addShelfTemplate = new TextDecoder().decode(await Deno.readFile("templates/_shelf_add.html"));
const _bookshelvesTemplate = new TextDecoder().decode(await Deno.readFile("templates/bookshelves.html"));

export async function BookshelvesTemplate(user, token, replyTo = 0) {
    const fetching = await fetch(`https://micro.blog/posts/discover/books`, { method: "GET" });
    const results = await fetching.json();

    const bookshelfFetching = await fetch(`https://micro.blog/books/bookshelves`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
    const shelves = await bookshelfFetching.json();
    const shelvesHTML = shelves.items.sort((a,b) => (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0)).map((item) =>
        `<span class="chip"><a href="/bookshelves/shelf/${item.id}">${item.title} - ${item._microblog.books_count}</a></span>`
    ).join('');
    const shelvesChecklistHTML = shelves.items.sort((a,b) => (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0)).map((item) =>
        `<label><input type="checkbox" name="shelf[]" value="${item.id}" /> ${item.title}</label><br/>`
    ).join('');
   
  
    const feed = (await Promise.all(results.items.map(async (item) => {
        const conversation = await getConversation(item.id, token);
        const convo = conversation.items[conversation.items.length - 1];

        return await PostTemplate(item.id, 
            convo, 
            conversation.items, 
            user, 
            token, 
            0, 
            _addShelfTemplate.replaceAll('{{title}}',item._microblog.book_title).replaceAll('{{author}}',item._microblog.book_author).replaceAll('{{isbn}}',item._microblog.isbn).replaceAll('{{shelfChecklist}}', shelvesChecklistHTML), 
            conversation.items ? conversation.items.filter(item => item ? item.id == replyTo : false).length > 0 : false,
            'bookshelves',
            replyTo);

    }))).join('');
   
    const content = _bookshelvesTemplate
        .replaceAll('{{shelves}}', shelvesHTML)
        .replaceAll('{{feed}}', feed);


    return HTMLPage(`Bookshelves`, content, user);
}