// Bookmark routes — list, highlights, new bookmark form, and create/update/delete actions.
import { BookmarksTemplate, HighlightsTemplate } from "../layouts/bookmarks.js";
import { HTMLPage } from "../layouts/templates.js";
import { escapeHtml } from "../scripts/server/utilities.js";

const BOOKMARKS_ROUTE = new URLPattern({ pathname: "/bookmarks" });
const HIGHLIGHTS_ROUTE = new URLPattern({ pathname: "/highlights" });
const HIGHLIGHTS_DELETE = new URLPattern({ pathname: "/highlights/delete" });
const HIGHLIGHTS_POST = new URLPattern({ pathname: "/highlights/post" });
const BOOKMARK_NEW_ROUTE = new URLPattern({ pathname: "/bookmark/new" });
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
        const wantsJson = new URL(req.url).searchParams.get('json') === '1'
            || (req.headers.get('accept') || '').includes('application/json');

        let ok = true;
        try {
            const posting = await fetch(`https://micro.blog/posts/bookmarks/highlights/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer ' + accessTokenValue }
            });
            if (!posting.ok) {
                ok = false;
                console.log(`${user.username} tried to delete highlight ${id} and ${await posting.text()}`);
            }
        } catch (err) {
            ok = false;
            console.log(`${user.username} delete highlight ${id} fetch failed: ${err?.message || err}`);
        }

        if (wantsJson) {
            return new Response(JSON.stringify({ ok }), {
                status: ok ? 200 : 500,
                headers: { 'content-type': 'application/json' }
            });
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
            const datalist = allTags.map(tag => `<option value="${escapeHtml(tag)}"></option>`).join('');
            tagField = `<label class="mt-2">Tags</label><input class="form-input mt-2" list="tags-list" type="text" name="tags" placeholder="Comma separated tags…" /><datalist id="tags-list">${datalist}</datalist><small style="color:var(--overlay-1);font-size:0.8rem;">Separate multiple tags with commas.</small>`;
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

        let posting;
        try {
            posting = await fetch(`https://micro.blog/micropub`, {
                method: "POST",
                body: formBody.toString(),
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
                    "Authorization": "Bearer " + accessTokenValue
                }
            });
        } catch (err) {
            console.log(`${user.username} add bookmark ${url} fetch failed: ${err?.message || err}`);
            return Response.redirect(new URL('/bookmarks?error=failed', req.url).href, 303);
        }
        if (!posting.ok) {
            console.log(`${user.username} add bookmark ${url} failed: ${await posting.text()}`);
            return Response.redirect(new URL('/bookmarks?error=failed', req.url).href, 303);
        }

        // Resolve the new bookmark id so we can attach tags. Micropub MUST
        // return a Location header pointing at the created entry — use that
        // first. Fall back to the recent-bookmarks list matched by url (not
        // by position, which races with other clients adding bookmarks).
        async function resolveNewBookmarkId() {
            const loc = posting.headers.get('Location') || '';
            const idMatch = loc.match(/\/(?:bookmarks|posts)\/(\d+)/);
            if (idMatch) return idMatch[1];
            try {
                const r = await fetch(`https://micro.blog/posts/bookmarks`, { method: "GET", headers: { "Authorization": "Bearer " + accessTokenValue } });
                const d = await r.json();
                const match = d?.items?.find(b => b.url === url);
                return match ? match.id : null;
            } catch {
                return null;
            }
        }

        if (user.plan == 'premium' && tags) {
            // Bookmark creation already succeeded — log and continue on
            // tag-attach failure rather than failing the whole request.
            try {
                const bookmarkId = await resolveNewBookmarkId();
                if (bookmarkId) {
                    const formBodyTags = new URLSearchParams();
                    formBodyTags.append("tags", tags);

                    const postingTags = await fetch(`https://micro.blog/posts/bookmarks/${bookmarkId}`, {
                        method: "POST",
                        body: formBodyTags.toString(),
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
                            "Authorization": "Bearer " + accessTokenValue
                        }
                    });
                    if (!postingTags.ok) {
                        console.log(`${user.username} add tags to new bookmark ${bookmarkId} failed: ${await postingTags.text()}`);
                    }
                } else {
                    console.log(`${user.username} add tags to new bookmark (url=${url}) failed: could not resolve new bookmark id`);
                }
            } catch (err) {
                console.log(`${user.username} add tags to new bookmark fetch failed: ${err?.message || err}`);
            }
        }

        // Form-response routing. Three shapes are supported:
        //   - redirect=true  → normal form submission from bookmark-new.html;
        //     land back on /bookmarks.
        //   - redirect=<url> → caller-specified destination. Used by external
        //     callers (bookmarklets / extensions) that want to return the
        //     user to the page they were on when they bookmarked it.
        //   - redirect=false or missing → return an empty page with no
        //     navigation. For iframe/XHR bookmarklets that consume the form
        //     response programmatically and don't want a page change.
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
