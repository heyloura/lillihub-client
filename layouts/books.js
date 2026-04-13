import { HTMLPage } from "./templates.js";
import { PostTemplate } from "./_post.js";
import { getFollowingList } from "../scripts/server/mb.js";

const _addShelfTemplate = new TextDecoder().decode(await Deno.readFile("templates/books/_shelf_add.html"));
const _booksTemplate = new TextDecoder().decode(await Deno.readFile("templates/books/books.html"));

export async function BooksTemplate(user, token) {
    // Prefetch following set for logged-in users so PostTemplate doesn't fire N+1 is_following calls
    const [discoverRes, shelvesRes, followingSet] = await Promise.all([
        fetch(`https://micro.blog/posts/discover/books`, { method: "GET" }),
        fetch(`https://micro.blog/books/bookshelves`, { method: "GET", headers: { "Authorization": "Bearer " + token } }),
        user && !user.error ? getFollowingList(user.username, token) : Promise.resolve(null)
    ]);

    const results = await discoverRes.json();
    const shelves = await shelvesRes.json();

    const shelvesChecklistHTML = shelves.items.sort((a, b) => a.title > b.title ? 1 : a.title < b.title ? -1 : 0).map(item =>
        `<label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;"><input type="checkbox" name="shelf[]" value="${item.id}" ${item.title.toLowerCase() === 'want to read' ? 'checked' : ''} /> ${item.title}</label>`
    ).join('');

    const feed = (await Promise.all(results.items.map(async (item) => {
        return await PostTemplate(item.id,
            item,
            [],
            user,
            token,
            0,
            _addShelfTemplate
                .replaceAll('{{title}}', item._microblog.book_title)
                .replaceAll('{{author}}', item._microblog.book_author)
                .replaceAll('{{isbn}}', item._microblog.isbn)
                .replaceAll('{{shelfChecklist}}', shelvesChecklistHTML),
            false,
            true,
            false,
            followingSet);
    }))).join('');

    const content = _booksTemplate
        .replaceAll('{{feed}}', feed);

    return HTMLPage(token, 'Books', content, user);
}
