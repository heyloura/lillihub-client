// Photo collection routes — list, detail, create, delete, add/remove/upload photos.
import { CollectionsTemplate, CollectionDetailTemplate, CollectionNewTemplate } from "../layouts/collections.js";

const COLLECTIONS_ROUTE = new URLPattern({ pathname: "/collections" });
const COLLECTION_NEW_ROUTE = new URLPattern({ pathname: "/collections/new" });
const COLLECTION_DETAIL_ROUTE = new URLPattern({ pathname: "/collections/:id" });
const COLLECTION_CREATE = new URLPattern({ pathname: "/collections/create" });
const COLLECTION_DELETE = new URLPattern({ pathname: "/collections/delete" });
const COLLECTION_ADD_PHOTO = new URLPattern({ pathname: "/collections/add-photo" });
const COLLECTION_REMOVE_PHOTO = new URLPattern({ pathname: "/collections/remove-photo" });
const COLLECTION_UPLOAD_PHOTO = new URLPattern({ pathname: "/collections/upload-photo" });

export async function tryHandle(req, ctx) {
    const { user, accessTokenValue } = ctx;

    // --- Pages ---

    if (COLLECTION_NEW_ROUTE.exec(req.url) && user) {
        return new Response(await CollectionNewTemplate(user, accessTokenValue, req), {
            status: 200,
            headers: { "content-type": "text/html" },
        });
    }

    if (COLLECTION_DETAIL_ROUTE.exec(req.url) && user && req.method === 'GET') {
        const id = COLLECTION_DETAIL_ROUTE.exec(req.url).pathname.groups.id;
        return new Response(await CollectionDetailTemplate(user, accessTokenValue, req, id), {
            status: 200,
            headers: { "content-type": "text/html" },
        });
    }

    if (COLLECTIONS_ROUTE.exec(req.url) && user && req.method === 'GET') {
        return new Response(await CollectionsTemplate(user, accessTokenValue, req), {
            status: 200,
            headers: { "content-type": "text/html" },
        });
    }

    // --- Actions ---

    if (COLLECTION_CREATE.exec(req.url) && user) {
        const value = await req.formData();
        const destination = value.get('destination');
        const name = value.get('name');

        await fetch('https://micro.blog/micropub', {
            method: 'POST',
            body: JSON.stringify({
                'mp-channel': 'collections',
                'mp-destination': destination,
                properties: { name: [name] }
            }),
            headers: { 'Authorization': 'Bearer ' + accessTokenValue, 'Content-Type': 'application/json' }
        });

        return Response.redirect(new URL(`/collections?destination=${encodeURIComponent(destination)}`, req.url).href);
    }

    if (COLLECTION_DELETE.exec(req.url) && user) {
        const value = await req.formData();
        const destination = value.get('destination');
        const collectionUrl = value.get('url');

        await fetch('https://micro.blog/micropub', {
            method: 'POST',
            body: JSON.stringify({
                'mp-channel': 'collections',
                'mp-destination': destination,
                action: 'delete',
                url: collectionUrl
            }),
            headers: { 'Authorization': 'Bearer ' + accessTokenValue, 'Content-Type': 'application/json' }
        });

        return Response.redirect(new URL(`/collections?destination=${encodeURIComponent(destination)}`, req.url).href);
    }

    if (COLLECTION_ADD_PHOTO.exec(req.url) && user) {
        const value = await req.formData();
        const destination = value.get('destination');
        const collectionUrl = value.get('url');
        const photo = value.get('photo');
        const redirect = value.get('redirect');

        await fetch('https://micro.blog/micropub', {
            method: 'POST',
            body: JSON.stringify({
                action: 'update',
                'mp-channel': 'collections',
                'mp-destination': destination,
                url: collectionUrl,
                add: { photo: [photo] }
            }),
            headers: { 'Authorization': 'Bearer ' + accessTokenValue, 'Content-Type': 'application/json' }
        });

        // If a redirect was provided (e.g. from the media page), go there instead
        if (redirect) {
            return Response.redirect(new URL(redirect, req.url).href);
        }

        // Otherwise, go to the collection detail page
        const listRes = await fetch(`https://micro.blog/micropub?q=source&mp-channel=collections&mp-destination=${encodeURIComponent(destination)}`, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + accessTokenValue }
        });
        const listData = await listRes.json();
        const collection = (listData.items || []).find(i => i.properties.url[0] === collectionUrl);
        const collectionId = collection ? collection.properties.uid[0] : '';

        return Response.redirect(new URL(`/collections/${collectionId}?destination=${encodeURIComponent(destination)}`, req.url).href);
    }

    if (COLLECTION_REMOVE_PHOTO.exec(req.url) && user) {
        const value = await req.formData();
        const destination = value.get('destination');
        const collectionUrl = value.get('url');
        const photo = value.get('photo');

        const listRes = await fetch(`https://micro.blog/micropub?q=source&mp-channel=collections&mp-destination=${encodeURIComponent(destination)}`, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + accessTokenValue }
        });
        const listData = await listRes.json();
        const collection = (listData.items || []).find(i => i.properties.url[0] === collectionUrl);
        const collectionId = collection ? collection.properties.uid[0] : '';

        await fetch('https://micro.blog/micropub', {
            method: 'POST',
            body: JSON.stringify({
                action: 'update',
                'mp-channel': 'collections',
                'mp-destination': destination,
                url: collectionUrl,
                delete: { photo: [photo] }
            }),
            headers: { 'Authorization': 'Bearer ' + accessTokenValue, 'Content-Type': 'application/json' }
        });

        return Response.redirect(new URL(`/collections/${collectionId}?destination=${encodeURIComponent(destination)}`, req.url).href);
    }

    if (COLLECTION_UPLOAD_PHOTO.exec(req.url) && user) {
        const value = await req.formData();
        const destination = value.get('destination');
        const collectionUrl = value.get('url');

        // 1. Upload the file to the media endpoint
        const configRes = await fetch('https://micro.blog/micropub?q=config', { method: 'GET', headers: { 'Authorization': 'Bearer ' + accessTokenValue } });
        const config = await configRes.json();
        const mediaEndpoint = config['media-endpoint'];

        let photoUrl = '';
        if (mediaEndpoint) {
            const uploadForm = new FormData();
            for (const pair of value.entries()) {
                const field = pair[0], val = pair[1];
                if (val instanceof File) {
                    uploadForm.append('file', val, val.name);
                }
            }
            uploadForm.append('mp-destination', destination);

            const uploadRes = await fetch(mediaEndpoint, { method: 'POST', headers: { 'Authorization': 'Bearer ' + accessTokenValue }, body: uploadForm });
            const uploaded = await uploadRes.json();
            photoUrl = uploaded.url || '';
        }

        if (photoUrl) {
            // 2. Add the uploaded photo to the collection
            await fetch('https://micro.blog/micropub', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'update',
                    'mp-channel': 'collections',
                    'mp-destination': destination,
                    url: collectionUrl,
                    add: { photo: [photoUrl] }
                }),
                headers: { 'Authorization': 'Bearer ' + accessTokenValue, 'Content-Type': 'application/json' }
            });
        }

        // Resolve collection ID for redirect
        const listRes = await fetch(`https://micro.blog/micropub?q=source&mp-channel=collections&mp-destination=${encodeURIComponent(destination)}`, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + accessTokenValue }
        });
        const listData = await listRes.json();
        const collection = (listData.items || []).find(i => i.properties.url[0] === collectionUrl);
        const collectionId = collection ? collection.properties.uid[0] : '';

        return Response.redirect(new URL(`/collections/${collectionId}?destination=${encodeURIComponent(destination)}`, req.url).href);
    }

    return null;
}
