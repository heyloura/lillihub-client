// Bookmark routes — list, highlights, new bookmark form, and create/update/delete actions.
import { BookmarksTemplate, HighlightsTemplate } from "../layouts/bookmarks.js";
import { HTMLPage } from "../layouts/templates.js";

const BOOKMARKS_ROUTE = new URLPattern({ pathname: "/bookmarks" });
const HIGHLIGHTS_ROUTE = new URLPattern({ pathname: "/highlights" });
const HIGHLIGHTS_DELETE = new URLPattern({ pathname: "/highlights/delete" });
const HIGHLIGHTS_POST = new URLPattern({ pathname: "/highlights/post" });
const BOOKMARK_NEW_ROUTE = new URLPattern({ pathname: "/bookmark/new" });
const BOOKMARKS_UPDATE_TAGS = new URLPattern({ pathname: "/bookmarks/update" });
const BOOKMARKS_ADD_TAG = new URLPattern({ pathname: "/bookmarks/add-tag" });
const BOOKMARKS_REMOVE_TAG = new URLPattern({ pathname: "/bookmarks/remove-tag" });
const BOOKMARKS_NEW = new URLPattern({ pathname: "/bookmarks/new" });
const BOOKMARKS_UNBOOKMARK = new URLPattern({ pathname: "/bookmarks/unbookmark" });
const BOOKMARKS_POST_SELECTED = new URLPattern({ pathname: "/bookmarks/post-selected" });
const BOOKMARKS_SET_TAGS = new URLPattern({ pathname: "/bookmarks/set-tags" });

export async function tryHandle(req, ctx) {
    const { user, accessTokenValue } = ctx;

    if (BOOKMARKS_ROUTE.exec(req.url) && user) {
        return new Response(await BookmarksTemplate(user, accessTokenValue, req), {
            status: 200,
            headers: { "content-type": "text/html" },
        });
    }

    if (HIGHLIGHTS_ROUTE.exec(req.url) && user) {
        return new Response(await HighlightsTemplate(user, accessTokenValue, req), {
            status: 200,
            headers: { "content-type": "text/html" },
        });
    }

    if (HIGHLIGHTS_DELETE.exec(req.url) && user) {
        const value = await req.formData();
        const id = value.get('id');

        try {
            await fetch(`https://micro.blog/posts/bookmarks/highlights/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer ' + accessTokenValue }
            });
        } catch (err) {
            console.log(`${user.username} tried to delete highlight ${id}: ${err?.message || err}`);
        }

        return Response.redirect(new URL('/highlights', req.url).href, 303);
    }

    if (HIGHLIGHTS_POST.exec(req.url) && user) {
        const value = await req.formData();
        const selected = value.getAll('selected[]');
        const combined = selected.join('\n\n');
        const escaped = combined.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        return new Response(
            `<!DOCTYPE html><html><body><form id="f" method="POST" action="/post"><textarea name="content" hidden>${escaped}</textarea></form><script>document.getElementById('f').submit()</script></body></html>`,
            { status: 200, headers: { 'content-type': 'text/html' } }
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
        const wantsJson = new URL(req.url).searchParams.get('json') === '1'
            || (req.headers.get('accept') || '').includes('application/json');

        let ok = true;
        try {
            const posting = await fetch(`https://micro.blog/posts/bookmarks/${id}`, {
                method: "DELETE",
                headers: { "Authorization": "Bearer " + accessTokenValue }
            });
            if (!posting.ok) {
                ok = false;
                console.log(`${user.username} tried to unbookmark ${id} and ${await posting.text()}`);
            }
        } catch (err) {
            ok = false;
            console.log(`${user.username} unbookmark ${id} fetch failed: ${err?.message || err}`);
        }

        if (wantsJson) {
            return new Response(JSON.stringify({ ok }), {
                status: ok ? 200 : 500,
                headers: { 'content-type': 'application/json' }
            });
        }

        return Response.redirect(new URL('/bookmarks', req.url).href, 303);
    }

    // Combine selected bookmark quotebacks into a post body, then auto-submit
    // to /post — mirrors /notes/post-selected. Client sends selected[] as the
    // already-quoteback-formatted HTML per bookmark.
    if (BOOKMARKS_POST_SELECTED.exec(req.url) && user) {
        const value = await req.formData();
        const selected = value.getAll('selected[]');
        const combined = selected.join('\n\n');
        const escaped = combined.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        return new Response(
            `<!DOCTYPE html><html><body><form id="f" method="POST" action="/post"><textarea name="content" hidden>${escaped}</textarea></form><script>document.getElementById('f').submit()</script></body></html>`,
            { status: 200, headers: { 'content-type': 'text/html' } }
        );
    }

    // Replace the full tag list on a single bookmark. Called in parallel from
    // the bulk "replace tags" modal; each invocation is one bookmark. Returns
    // JSON so the client can report partial failures.
    if (BOOKMARKS_SET_TAGS.exec(req.url) && user && user.plan == 'premium') {
        const value = await req.formData();
        const id = value.get('id');
        const tags = value.get('tags') || '';

        let ok = true;
        try {
            const formBody = new URLSearchParams();
            formBody.append('tags', tags);
            const posting = await fetch(`https://micro.blog/posts/bookmarks/${id}`, {
                method: 'POST',
                body: formBody.toString(),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8', 'Authorization': 'Bearer ' + accessTokenValue }
            });
            if (!posting.ok) {
                ok = false;
                console.log(`${user.username} set-tags on ${id} failed: ${await posting.text()}`);
            }
        } catch (err) {
            ok = false;
            console.log(`${user.username} set-tags on ${id} fetch failed: ${err?.message || err}`);
        }
        return new Response(JSON.stringify({ ok }), {
            status: ok ? 200 : 500,
            headers: { 'content-type': 'application/json' }
        });
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

    // Add a single tag to a bookmark (appends to existing tags)
    if (BOOKMARKS_ADD_TAG.exec(req.url) && user && user.plan == 'premium') {
        const value = await req.formData();
        const id = value.get('id');
        const tag = value.get('tag');
        const currentTags = value.get('currentTags') || '';

        const newTags = currentTags ? currentTags + ',' + tag : tag;

        try {
            const formBody = new URLSearchParams();
            formBody.append('tags', newTags);
            await fetch(`https://micro.blog/posts/bookmarks/${id}`, {
                method: 'POST',
                body: formBody.toString(),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8', 'Authorization': 'Bearer ' + accessTokenValue }
            });
        } catch (err) {
            console.log(`${user.username} add-tag failed: ${err?.message || err}`);
        }

        return Response.redirect(new URL('/bookmarks', req.url).href, 303);
    }

    // Remove a single tag from a bookmark (replaces with remaining tags)
    if (BOOKMARKS_REMOVE_TAG.exec(req.url) && user && user.plan == 'premium') {
        const value = await req.formData();
        const id = value.get('id');
        const removeTag = value.get('tag');
        const currentTags = value.get('currentTags') || '';

        const remaining = currentTags.split(',').filter(t => t !== removeTag).join(',');

        try {
            const formBody = new URLSearchParams();
            formBody.append('tags', remaining);
            await fetch(`https://micro.blog/posts/bookmarks/${id}`, {
                method: 'POST',
                body: formBody.toString(),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8', 'Authorization': 'Bearer ' + accessTokenValue }
            });
        } catch (err) {
            console.log(`${user.username} remove-tag failed: ${err?.message || err}`);
        }

        return Response.redirect(new URL('/bookmarks', req.url).href, 303);
    }

    return null;
}
