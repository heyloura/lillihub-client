// Book routes — books discover, bookshelves, individual shelves and books,
// plus add/move/cover/remove actions and shelf management.
import { BooksTemplate } from "../layouts/books.js";
import { BookshelvesTemplate } from "../layouts/bookshelves.js";
import { BookshelfTemplate } from "../layouts/bookshelf.js";
import { BookTemplate } from "../layouts/book.js";
import { BookNewTemplate } from "../layouts/book-new.js";
import { BookSearchTemplate } from "../layouts/book-search.js";

const BOOKS_ROUTE = new URLPattern({ pathname: "/books" });
const BOOK_SEARCH = new URLPattern({ pathname: "/books/search" });
const BOOKSHELVES_ROUTE = new URLPattern({ pathname: "/bookshelves" });
const BOOKSHELF_ROUTE = new URLPattern({ pathname: "/bookshelves/shelf/:id" });
const BOOK_ROUTE = new URLPattern({ pathname: "/bookshelves/shelf/:shelfid/book/:id" });
const BOOK_NEW = new URLPattern({ pathname: "/book/new" });
const ADD_BOOK = new URLPattern({ pathname: "/book/add" });
const BOOK_MOVE = new URLPattern({ pathname: "/book/move" });
const BOOK_CHANGE_COVER = new URLPattern({ pathname: "/book/change" });
const BOOK_REMOVE = new URLPattern({ pathname: "/book/remove" });
const BOOKSHELF_CREATE = new URLPattern({ pathname: "/bookshelf/create" });
const BOOKSHELF_RENAME = new URLPattern({ pathname: "/bookshelf/rename" });

export async function tryHandle(req, ctx) {
    const { user, accessTokenValue } = ctx;

    if (BOOK_SEARCH.exec(req.url) && user) {
        return new Response(await BookSearchTemplate(user, accessTokenValue, req), {
            status: 200,
            headers: { "content-type": "text/html" },
        });
    }

    if (BOOKS_ROUTE.exec(req.url) && user) {
        return new Response(await BooksTemplate(user, accessTokenValue), {
            status: 200,
            headers: { "content-type": "text/html" },
        });
    }

    if (BOOKSHELVES_ROUTE.exec(req.url) && user) {
        return new Response(await BookshelvesTemplate(user, accessTokenValue, req), {
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

    if (BOOK_NEW.exec(req.url) && user) {
        return new Response(await BookNewTemplate(user, accessTokenValue, req), {
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
        const cover_url = value.get('cover_url');

        const formBody = new URLSearchParams();
        formBody.append("bookshelf_id", shelf[0]);
        if (title) formBody.append("title", title);
        if (author) formBody.append("author", author);
        if (isbn) formBody.append("isbn", isbn);
        if (cover_url) formBody.append("cover_url", cover_url);

        await fetch(`https://micro.blog/books`, {
            method: "POST",
            body: formBody.toString(),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
                "Authorization": "Bearer " + accessTokenValue
            }
        });

        return new Response(null, { status: 303, headers: { "Location": `/bookshelves/shelf/${shelf[0]}` } });
    }

    if (BOOKSHELF_CREATE.exec(req.url) && user) {
        const value = await req.formData();
        const name = value.get('name');

        const formBody = new URLSearchParams();
        formBody.append("name", name);

        let writeFailed = false;
        try {
            const posting = await fetch('https://micro.blog/books/bookshelves', {
                method: "POST",
                body: formBody.toString(),
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
                    "Authorization": "Bearer " + accessTokenValue
                }
            });
            if (!posting.ok) {
                writeFailed = true;
                console.log(`${user.username} tried to create bookshelf "${name}" and ${await posting.text()}`);
            }
        } catch (err) {
            writeFailed = true;
            console.log(`${user.username} tried to create bookshelf "${name}" and fetch failed: ${err?.message || err}`);
        }

        const dest = `/bookshelves${writeFailed ? '?error=failed' : ''}`;
        return Response.redirect(new URL(dest, req.url).href, 303);
    }

    if (BOOKSHELF_RENAME.exec(req.url) && user) {
        const value = await req.formData();
        const name = value.get('name');
        const bookshelf_id = value.get('bookshelf_id');

        const formBody = new URLSearchParams();
        formBody.append("name", name);

        let writeFailed = false;
        try {
            const posting = await fetch(`https://micro.blog/books/bookshelves/${bookshelf_id}`, {
                method: "POST",
                body: formBody.toString(),
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
                    "Authorization": "Bearer " + accessTokenValue
                }
            });
            if (!posting.ok) {
                writeFailed = true;
                console.log(`${user.username} tried to rename bookshelf ${bookshelf_id} to "${name}" and ${await posting.text()}`);
            }
        } catch (err) {
            writeFailed = true;
            console.log(`${user.username} tried to rename bookshelf ${bookshelf_id} to "${name}" and fetch failed: ${err?.message || err}`);
        }

        const dest = `/bookshelves${writeFailed ? '?error=failed' : ''}`;
        return Response.redirect(new URL(dest, req.url).href, 303);
    }

    return null;
}
