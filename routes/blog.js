// Blog routes — post editor, posts list, media list, plus add/edit post and upload/delete media actions.
import { EditorTemplate } from "../layouts/editor.js";
import { PreviewTemplate } from "../layouts/preview.js";
import { BlogTemplate } from "../layouts/blog.js";
import { MediaTemplate } from "../layouts/media.js";
import { HTMLPage } from "../layouts/templates.js";

const POST_ROUTE = new URLPattern({ pathname: "/post" });
const PREVIEW_POST = new URLPattern({ pathname: "/post/preview" });
const POSTS_ROUTE = new URLPattern({ pathname: "/posts" });
const MEDIA_ROUTE = new URLPattern({ pathname: "/media" });
const ADD_POST = new URLPattern({ pathname: "/post/add" });
const EDIT_POST = new URLPattern({ pathname: "/post/edit" });
const UPLOAD_MEDIA_ROUTE = new URLPattern({ pathname: "/media/upload" });
const DELETE_POST_ROUTE = new URLPattern({ pathname: "/post/delete" });
const DELETE_MEDIA_ROUTE = new URLPattern({ pathname: "/media/delete" });
const CHECK_ALT_ROUTE = new URLPattern({ pathname: "/media/check-alt" });

export async function tryHandle(req, ctx) {
    const { user, accessTokenValue } = ctx;

    if (POST_ROUTE.exec(req.url) && user) {
        // POST = returning from preview with form data; GET = normal editor load
        let postData = null;
        if (req.method === 'POST') {
            const value = await req.formData();
            postData = {
                destination: value.get('destination'),
                content: value.get('content'),
                name: value.get('name'),
                summary: value.get('summary'),
            };
        }
        return new Response(await EditorTemplate(user, accessTokenValue, req, postData), {
            status: 200,
            headers: { "content-type": "text/html" },
        });
    }

    if (PREVIEW_POST.exec(req.url) && user) {
        return new Response(await PreviewTemplate(user, accessTokenValue, req), {
            status: 200,
            headers: { "content-type": "text/html" },
        });
    }

    if (POSTS_ROUTE.exec(req.url) && user) {
        return new Response(await BlogTemplate(user, accessTokenValue, req), {
            status: 200,
            headers: { "content-type": "text/html" },
        });
    }

    if (MEDIA_ROUTE.exec(req.url) && user) {
        return new Response(await MediaTemplate(user, accessTokenValue, req), {
            status: 200,
            headers: { "content-type": "text/html" },
        });
    }

    if (ADD_POST.exec(req.url) && user) {
        const value = await req.formData();
        const destination = value.get('destination');
        const syndicates = value.getAll('syndicate[]');
        const categories = value.getAll('category[]');
        const content = value.get('content');
        const status = value.get('status');
        const name = value.get('name');
        const summary = value.get('summary');

        const formBody = new URLSearchParams();
        formBody.append("mp-destination", destination);
        formBody.append("h", "entry");
        formBody.append("content", content);

        if (summary) {
            formBody.append("summary", summary);
        }
        if (name) {
            formBody.append("name", name);
        }
        if (categories.length > 0) {
            categories.forEach((item) => formBody.append("category[]", item));
        }
        if (status == 'draft') {
            formBody.append("post-status", "draft");
        }
        if (syndicates.length > 0) {
            syndicates.forEach((item) => formBody.append("mp-syndicate-to[]", item));
        } else {
            formBody.append("mp-syndicate-to[]", "");
        }

        const posting = await fetch(`https://micro.blog/micropub`, { method: "POST", body: formBody.toString(), headers: { "Authorization": "Bearer " + accessTokenValue, "Content-Type": "application/x-www-form-urlencoded; charset=utf-8" } });
        if (!posting.ok) {
            console.log(`${user.username} tried to add a post and ${await posting.text()}`);
            return new Response(
                await HTMLPage(accessTokenValue, `Redirect`, `<h3 class="container">An error was encountered while posting. Redirecting back...</h3>`, user, req.url.replaceAll('/unbookmark', '')),
                {
                    status: 200,
                    headers: { "content-type": "text/html" },
                }
            );
        }

        return Response.redirect(req.url.replaceAll('/post/add', `/posts?destination=${destination}`));
    }

    if (EDIT_POST.exec(req.url) && user) {
        const value = await req.formData();
        const destination = value.get('destination');
        const categories = value.getAll('category[]');
        const syndicates = value.getAll('syndicate[]');
        const content = value.get('content');
        const status = value.get('status');
        const name = value.get('name');
        const url = value.get('url');

        const summary = value.get('summary');

        const updatePost = {
            action: "update",
            url: url,
            replace: {
                content: [content],
                name: [name],
                summary: [summary || ''],
                category: categories,
                "post-status": status == 'draft' ? ['draft'] : ['published']
            }
        };

        if (destination) {
            updatePost["mp-destination"] = destination;
        }

        if (syndicates) {
            updatePost["mp-syndicate-to[]"] = syndicates;
        }

        const posting = await fetch(`https://micro.blog/micropub`, { method: "POST", body: JSON.stringify(updatePost), headers: { "Authorization": "Bearer " + accessTokenValue, "Content-Type": "application/json" } });
        if (!posting.ok) {
            console.log(`${user.username} tried to update a post and ${await posting.text()}`);
            return new Response(
                await HTMLPage(accessTokenValue, `Redirect`, `<h3 class="container">An error was encountered while updating a post. Redirecting back...</h3>`, user, req.url.replaceAll('/edit', '')),
                {
                    status: 200,
                    headers: { "content-type": "text/html" },
                }
            );
        }

        return Response.redirect(req.url.replaceAll('/post/edit', `/posts?destination=${destination}`));
    }

    if (DELETE_POST_ROUTE.exec(req.url) && user) {
        const value = await req.formData();
        const destination = value.get('destination');
        const url = value.get('url');

        const deleteBody = JSON.stringify({
            action: "delete",
            url: url,
            ...(destination ? { "mp-destination": destination } : {})
        });

        const posting = await fetch('https://micro.blog/micropub', {
            method: 'POST',
            body: deleteBody,
            headers: { 'Authorization': 'Bearer ' + accessTokenValue, 'Content-Type': 'application/json' }
        });
        if (!posting.ok) {
            console.log(`${user.username} tried to delete a post and ${await posting.text()}`);
        }

        return Response.redirect(req.url.replaceAll('/post/delete', `/posts?destination=${destination}`));
    }

    if (UPLOAD_MEDIA_ROUTE.exec(req.url) && user) {
        const value = await req.formData();
        let redirect = false;
        let destination = '';

        const formData = new FormData();

        for (const pair of value.entries()) {
            const field = pair[0], val = pair[1];
            if (val instanceof File) {
                // Pass the File directly — no extra ArrayBuffer copy
                formData.append('file', val, val.name);
            } else {
                if (field == 'destination') {
                    const decoded = decodeURI(val);
                    formData.append("mp-destination", decoded);
                    destination = val;
                }
                if (field == 'redirect') {
                    redirect = true;
                }
            }
        }

        let uploaded;
        try {
            let fetching = await fetch(`https://micro.blog/micropub?q=config`, { method: "GET", headers: { "Authorization": "Bearer " + accessTokenValue } });
            const config = await fetching.json();
            const mediaEndpoint = config["media-endpoint"];

            if (!mediaEndpoint) {
                throw new Error('Micropub config missing media-endpoint');
            }

            fetching = await fetch(mediaEndpoint, { method: "POST", headers: { "Authorization": "Bearer " + accessTokenValue }, body: formData });
            uploaded = await fetching.json();
        } catch (err) {
            console.log(`${user.username} tried to upload media and it failed: ${err?.message || err}`);
            return new Response(`<p>Media upload failed. Please try again.</p>`, {
                status: 502,
                headers: { "content-type": "text/html" },
            });
        }

        if (redirect) {
            return Response.redirect(req.url.replaceAll('/media/upload', `/media?destination=${destination}`));
        } else {
            return new Response(uploaded.url, {
                status: 200,
                headers: { "content-type": "text/plain" },
            });
        }
    }

    if (DELETE_MEDIA_ROUTE.exec(req.url) && user) {
        const value = await req.formData();
        const destination = value.get('destination');
        const url = value.get('url');

        const formBody = new URLSearchParams();
        formBody.append("mp-destination", destination);
        formBody.append('action', 'delete');
        formBody.append('url', url);

        try {
            const fetching = await fetch(`https://micro.blog/micropub?q=config`, { method: "GET", headers: { "Authorization": "Bearer " + accessTokenValue } });
            const config = await fetching.json();
            const mediaEndpoint = config["media-endpoint"];

            if (!mediaEndpoint) {
                throw new Error('Micropub config missing media-endpoint');
            }

            const posting = await fetch(mediaEndpoint, { method: "POST", body: formBody.toString(), headers: { "Authorization": "Bearer " + accessTokenValue, "Content-Type": "application/x-www-form-urlencoded; charset=utf-8" } });
            if (!posting.ok) {
                console.log(`${user.username} tried to delete a media item and ${await posting.text()}`);
            }
        } catch (err) {
            console.log(`${user.username} tried to delete a media item and fetch failed: ${err?.message || err}`);
        }

        return Response.redirect(req.url.replaceAll('/media/delete', `/media?destination=${destination}`));
    }

    // Proxy for checking AI-generated alt text on uploaded media.
    // Client polls this after upload; returns JSON { alt: "..." } or { alt: "" }.
    if (CHECK_ALT_ROUTE.exec(req.url) && user) {
        const params = new URL(req.url).searchParams;
        const mediaUrl = params.get('url');
        if (!mediaUrl) return new Response('{"alt":""}', { headers: { "content-type": "application/json" } });

        try {
            const configRes = await fetch('https://micro.blog/micropub?q=config', { method: 'GET', headers: { 'Authorization': 'Bearer ' + accessTokenValue } });
            const config = await configRes.json();
            const mediaEndpoint = config['media-endpoint'];
            if (!mediaEndpoint) throw new Error('No media-endpoint');

            const sourceRes = await fetch(`${mediaEndpoint}?q=source&url=${encodeURIComponent(mediaUrl)}`, { method: 'GET', headers: { 'Authorization': 'Bearer ' + accessTokenValue } });
            const source = await sourceRes.json();
            // Response may be { alt: "..." } or { items: [{ alt: "..." }] }
            const alt = source.alt || (source.items && source.items[0] && source.items[0].alt) || '';
            return new Response(JSON.stringify({ alt }), { headers: { 'content-type': 'application/json' } });
        } catch (err) {
            return new Response('{"alt":""}', { headers: { 'content-type': 'application/json' } });
        }
    }

    return null;
}
