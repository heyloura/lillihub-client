// Bookmark routes — list, highlights, new bookmark form, and create/update/delete actions.
import { BookmarksTemplate } from "../layouts/bookmarks.js";
import { HTMLPage } from "../layouts/templates.js";

const BOOKMARKS_ROUTE = new URLPattern({ pathname: "/bookmarks" });
const HIGHLIGHTS_ROUTE = new URLPattern({ pathname: "/highlights" });
const BOOKMARK_NEW_ROUTE = new URLPattern({ pathname: "/bookmark/new" });
const BOOKMARKS_UPDATE_TAGS = new URLPattern({ pathname: "/bookmarks/update" });
const BOOKMARKS_NEW = new URLPattern({ pathname: "/bookmarks/new" });
const BOOKMARKS_UNBOOKMARK = new URLPattern({ pathname: "/bookmarks/unbookmark" });

export async function tryHandle(req, ctx) {
    const { user, accessTokenValue } = ctx;

    if (BOOKMARKS_ROUTE.exec(req.url) && user) {
        return new Response(await BookmarksTemplate(user, accessTokenValue, req), {
            status: 200,
            headers: { "content-type": "text/html" },
        });
    }

    if (HIGHLIGHTS_ROUTE.exec(req.url) && user) {
        return new Response(
            await HTMLPage(accessTokenValue, 'Highlights', `<div class="container mt-2"><p>Highlights coming soon.</p></div>`, user),
            {
                status: 200,
                headers: { "content-type": "text/html" },
            }
        );
    }

    if (BOOKMARK_NEW_ROUTE.exec(req.url) && user) {
        let tagField = '';
        if (user.plan == 'premium') {
            const tagRes = await fetch(`https://micro.blog/posts/bookmarks/tags`, { method: "GET", headers: { "Authorization": "Bearer " + accessTokenValue } });
            const allTags = await tagRes.json();
            allTags.sort();
            const datalist = allTags.map(tag => `<option value="${tag}"></option>`).join('');
            tagField = `<label class="mt-2">Tags</label><input class="form-input mt-2" list="tags-list" type="text" name="tags" placeholder="Tags..." /><datalist id="tags-list">${datalist}</datalist>`;
        }
        const content = new TextDecoder().decode(await Deno.readFile("templates/bookmarks/bookmark-new.html"));
        return new Response(
            await HTMLPage(accessTokenValue, 'Bookmarks', content.replaceAll('{{tagField}}', tagField), user),
            {
                status: 200,
                headers: { "content-type": "text/html" },
            }
        );
    }

    if (BOOKMARKS_NEW.exec(req.url) && user) {
        const value = await req.formData();
        const url = value.get('url');
        const redirect = value.get('redirect');
        const tags = value.get('tags');

        const formBody = new URLSearchParams();
        formBody.append("h", "entry");
        formBody.append("bookmark-of", url);

        const posting = await fetch(`https://micro.blog/micropub`, {
            method: "POST",
            body: formBody.toString(),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
                "Authorization": "Bearer " + accessTokenValue
            }
        });
        // if (!posting.ok) {
        //     console.log(`${user.username} tried to add a bookmark ${url} and ${await posting.text()}`);
        //     return new Response(`<p>Error :-(</p>`, {
        //         status: 200,
        //         headers: {
        //             "content-type": "text/html",
        //         },
        //     });
        // }

        if (user.plan == 'premium' && tags) {
            // The bookmark POST above already succeeded — don't fail the whole request
            // if the follow-up tag attach hits a network error; just log and move on.
            try {
                const fetchingBookmarks = await fetch(`https://micro.blog/posts/bookmarks`, { method: "GET", headers: { "Authorization": "Bearer " + accessTokenValue } });
                const bookmarksData = await fetchingBookmarks.json();
                const bookmark = bookmarksData?.items?.length > 0 ? bookmarksData.items[0] : null;

                if (bookmark) {
                    const formBodyTags = new URLSearchParams();
                    formBodyTags.append("tags", tags);

                    const postingTags = await fetch(`https://micro.blog/posts/bookmarks/${bookmark.id}`, {
                        method: "POST",
                        body: formBodyTags.toString(),
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
                            "Authorization": "Bearer " + accessTokenValue
                        }
                    });
                    if (!postingTags.ok) {
                        console.log(`${user.username} tried to add tags to a new bookmark and ${await postingTags.text()}`);
                        return new Response(`<p>Error :-(</p>`, {
                            status: 200,
                            headers: {
                                "content-type": "text/html",
                            },
                        });
                    }
                }
            } catch (err) {
                console.log(`${user.username} tried to add tags to a new bookmark and fetch failed: ${err?.message || err}`);
            }
        }

        if (redirect && redirect == 'true') {
            return Response.redirect(new URL('/bookmarks', req.url).href, 303);
        }

        if (redirect && redirect != 'false') {
            return Response.redirect(new URL(redirect, req.url).href, 303);
        }

        return new Response(`<p></p>`, {
            status: 200,
            headers: { "content-type": "text/html" },
        });
    }

    if (BOOKMARKS_UNBOOKMARK.exec(req.url) && user) {
        const value = await req.formData();
        const id = value.get('id');

        const posting = await fetch(`https://micro.blog/posts/bookmarks/${id}`, {
            method: "DELETE",
            headers: { "Authorization": "Bearer " + accessTokenValue }
        });
        if (!posting.ok) {
            console.log(`${user.username} tried to unbookmark and ${await posting.text()}`);
        }

        return Response.redirect(new URL('/bookmarks', req.url).href, 303);
    }

    if (BOOKMARKS_UPDATE_TAGS.exec(req.url) && user) {
        const value = await req.formData();
        const tags = value.getAll('tags[]') ? value.getAll('tags[]') : [];
        const newTag = value.get('newTag');
        const id = value.get('id');

        if (newTag) {
            tags.push(newTag);
        }

        if (user.plan == 'premium') {
            try {
                const fetching = await fetch(`https://micro.blog/posts/bookmarks/${id}`, { method: "GET", headers: { "Authorization": "Bearer " + accessTokenValue } });
                const bookmark = await fetching.json();

                if (bookmark.items && bookmark.items.length > 0) {
                    const formBody = new URLSearchParams();
                    formBody.append("tags", tags ? tags.join('') : '');

                    const posting = await fetch(`https://micro.blog/posts/bookmarks/${id}`, {
                        method: "POST",
                        body: formBody.toString(),
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
                            "Authorization": "Bearer " + accessTokenValue
                        }
                    });
                    if (!posting.ok) {
                        console.log(`${user.username} tried to change tags and ${await posting.text()}`);
                    }
                }
            } catch (err) {
                console.log(`${user.username} tried to change tags and fetch failed: ${err?.message || err}`);
            }
        }

        return Response.redirect(new URL('/bookmarks', req.url).href, 303);
    }

    return null;
}
