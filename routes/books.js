// Book routes — books discover, bookshelves, individual shelves and books,
// plus add/move/cover/remove actions.
import { BooksTemplate } from "../layouts/books.js";
import { BookshelvesTemplate } from "../layouts/bookshelves.js";
import { BookshelfTemplate } from "../layouts/bookshelf.js";
import { BookTemplate } from "../layouts/book.js";

const BOOKS_ROUTE = new URLPattern({ pathname: "/books" });
const BOOKSHELVES_ROUTE = new URLPattern({ pathname: "/bookshelves" });
const BOOKSHELF_ROUTE = new URLPattern({ pathname: "/bookshelves/shelf/:id" });
const BOOK_ROUTE = new URLPattern({ pathname: "/bookshelves/shelf/:shelfid/book/:id" });
const ADD_BOOK = new URLPattern({ pathname: "/book/add" });
const BOOK_MOVE = new URLPattern({ pathname: "/book/move" });
const BOOK_CHANGE_COVER = new URLPattern({ pathname: "/book/change" });
const BOOK_REMOVE = new URLPattern({ pathname: "/book/remove" });

export async function tryHandle(req, ctx) {
    const { user, accessTokenValue } = ctx;

    if (BOOKS_ROUTE.exec(req.url) && user) {
        return new Response(await BooksTemplate(user, accessTokenValue), {
            status: 200,
            headers: { "content-type": "text/html" },
        });
    }

    if (BOOKSHELVES_ROUTE.exec(req.url) && user) {
        return new Response(await BookshelvesTemplate(user, accessTokenValue), {
            status: 200,
            headers: { "content-type": "text/html" },
        });
    }

    if (BOOKSHELF_ROUTE.exec(req.url) && user) {
        const id = BOOKSHELF_ROUTE.exec(req.url).pathname.groups.id;
        return new Response(await BookshelfTemplate(user, accessTokenValue, id), {
            status: 200,
            headers: { "content-type": "text/html" },
        });
    }

    if (BOOK_ROUTE.exec(req.url) && user) {
        const id = BOOK_ROUTE.exec(req.url).pathname.groups.id;
        const shelfid = BOOK_ROUTE.exec(req.url).pathname.groups.shelfid;
        return new Response(await BookTemplate(user, accessTokenValue, shelfid, id), {
            status: 200,
            headers: { "content-type": "text/html" },
        });
    }

    if (BOOK_CHANGE_COVER.exec(req.url) && user) {
        const value = await req.formData();
        const location = value.get('location');
        const shelfId = value.get('shelfId');
        const id = value.get('id');

        const formBody = new URLSearchParams();
        formBody.append("cover_url", location);

        await fetch(`https://micro.blog/books/bookshelves/${shelfId}/cover/${id}`, {
            method: "POST",
            body: formBody.toString(),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
                "Authorization": "Bearer " + accessTokenValue
            }
        });

        return new Response(null, { status: 303, headers: { "Location": `/bookshelves/shelf/${shelfId}/book/${id}` } });
    }

    if (BOOK_MOVE.exec(req.url) && user) {
        const value = await req.formData();
        const shelf = value.getAll('shelf[]');
        const id = value.get('id');

        const formBody = new URLSearchParams();
        formBody.append("book_id", id);

        await fetch(`https://micro.blog/books/bookshelves/${shelf[0]}/assign`, {
            method: "POST",
            body: formBody.toString(),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
                "Authorization": "Bearer " + accessTokenValue
            }
        });

        return new Response(null, { status: 303, headers: { "Location": `/bookshelves/shelf/${shelf[0]}` } });
    }

    if (BOOK_REMOVE.exec(req.url) && user) {
        const value = await req.formData();
        const shelfId = value.get('shelfId');
        const id = value.get('id');

        await fetch(`https://micro.blog/books/bookshelves/${shelfId}/remove/${id}`, {
            method: "DELETE",
            headers: { "Authorization": "Bearer " + accessTokenValue }
        });

        return new Response(null, { status: 303, headers: { "Location": `/bookshelves/shelf/${shelfId}` } });
    }

    if (ADD_BOOK.exec(req.url) && user) {
        const value = await req.formData();
        const shelf = value.getAll('shelf[]');
        const title = value.get('title');
        const author = value.get('author');
        const isbn = value.get('isbn');

        await fetch(`https://micro.blog/books?bookshelf_id=${shelf[0]}&isbn=${isbn}&title=${title}&author=${author}`, {
            method: "POST",
            headers: { "Authorization": "Bearer " + accessTokenValue }
        });

        return new Response(null, { status: 303, headers: { "Location": `/bookshelves/shelf/${shelf[0]}` } });
    }

    return null;
}
