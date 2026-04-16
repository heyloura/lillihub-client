// Photo collections layouts — list all collections, view a single collection,
// and render the "new collection" form.
import { HTMLPage } from "./templates.js";

const _collectionsTemplate = new TextDecoder().decode(await Deno.readFile("templates/blog/collections.html"));
const _collectionCardTemplate = new TextDecoder().decode(await Deno.readFile("templates/blog/_collection_card.html"));
const _collectionTemplate = new TextDecoder().decode(await Deno.readFile("templates/blog/collection.html"));
const _collectionPhotoTemplate = new TextDecoder().decode(await Deno.readFile("templates/blog/_collection_photo.html"));
const _collectionNewTemplate = new TextDecoder().decode(await Deno.readFile("templates/blog/collection-new.html"));

// Shared helper: fetch micropub config, resolve destination, build dropdown.
async function resolveDestination(token, destinationParam) {
    const res = await fetch('https://micro.blog/micropub?q=config', { method: 'GET', headers: { 'Authorization': 'Bearer ' + token } });
    const config = await res.json();

    if (!config.destination || config.destination.length === 0) return null;

    const defaultDest = (config.destination.find(d => d['microblog-default']) || config.destination[0]).uid;
    const mpDestination = destinationParam || defaultDest;
    const destinationName = (config.destination.find(d => d.uid === mpDestination) || config.destination[0]).name;

    const destinationItems = config.destination
        .filter(d => d.uid !== mpDestination)
        .map(d => `<li class="menu-item"><a href="/collections?destination=${encodeURIComponent(d.uid)}">${d.name}</a></li>`)
        .join('');

    const destinationDropdown = config.destination.length > 1
        ? `<div class="dropdown">
            <a class="btn btn-glossy dropdown-toggle" tabindex="0">${destinationName} <i class="bi bi-caret-down-fill"></i></a>
            <ul class="menu">${destinationItems}</ul>
           </div>`
        : `<span class="editor-dest-label">${destinationName}</span>`;

    return { mpDestination, destinationDropdown };
}

function destQuery(destination) {
    return destination ? `?destination=${encodeURIComponent(destination)}` : '';
}

// --- List all collections ---
export async function CollectionsTemplate(user, token, req) {
    const searchParams = new URLSearchParams(req.url.split('?')[1]);
    const dest = await resolveDestination(token, searchParams.get('destination'));

    if (!dest) {
        return HTMLPage(token, 'Collections', '<p><mark>No blog is configured.</mark></p>', user);
    }

    const res = await fetch(`https://micro.blog/micropub?q=source&mp-channel=collections&mp-destination=${encodeURIComponent(dest.mpDestination)}`, {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token }
    });
    const data = await res.json();
    const items = data.items || [];

    const feed = items.map(item => {
        const id = item.properties.uid[0];
        const name = item.properties.name[0];
        const count = item.properties['microblog-uploads-count'] || 0;
        const thumb = item.properties.photo && item.properties.photo[0]
            ? `<img src="${item.properties.photo[0]}" alt="" loading="lazy" />`
            : '<div class="collection-card-empty"><i class="bi bi-images"></i></div>';

        return _collectionCardTemplate
            .replaceAll('{{id}}', id)
            .replaceAll('{{name}}', name)
            .replaceAll('{{count}}', count)
            .replaceAll('{{countPlural}}', count === 1 ? '' : 's')
            .replaceAll('{{thumbnail}}', thumb)
            .replaceAll('{{destQuery}}', destQuery(dest.mpDestination));
    }).join('');

    const content = _collectionsTemplate
        .replaceAll('{{destinationDropdown}}', dest.destinationDropdown)
        .replaceAll('{{feed}}', feed)
        .replaceAll('{{#empty}}', items.length === 0 ? '' : '<!--')
        .replaceAll('{{/empty}}', items.length === 0 ? '' : '-->')
        .replaceAll('{{destQuery}}', destQuery(dest.mpDestination));

    return HTMLPage(token, 'Collections', content, user, '', undefined, { destination: dest.mpDestination });
}

// --- Single collection detail ---
export async function CollectionDetailTemplate(user, token, req, collectionId) {
    const searchParams = new URLSearchParams(req.url.split('?')[1]);
    const dest = await resolveDestination(token, searchParams.get('destination'));

    if (!dest) {
        return HTMLPage(token, 'Collection', '<p><mark>No blog is configured.</mark></p>', user);
    }

    // Fetch collection list to get name and URL
    const listRes = await fetch(`https://micro.blog/micropub?q=source&mp-channel=collections&mp-destination=${encodeURIComponent(dest.mpDestination)}`, {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token }
    });
    const listData = await listRes.json();
    const collection = (listData.items || []).find(i => String(i.properties.uid[0]) === String(collectionId));

    if (!collection) {
        return HTMLPage(token, 'Collection', '<p><mark>Collection not found.</mark></p>', user);
    }

    const name = collection.properties.name[0];
    const collectionUrl = collection.properties.url[0];

    // Fetch photos
    const configRes = await fetch('https://micro.blog/micropub?q=config', { method: 'GET', headers: { 'Authorization': 'Bearer ' + token } });
    const config = await configRes.json();
    const mediaEndpoint = config['media-endpoint'];

    let photos = [];
    if (mediaEndpoint) {
        const photosRes = await fetch(`${mediaEndpoint}?q=source&microblog-collection=${encodeURIComponent(collectionUrl)}&mp-destination=${encodeURIComponent(dest.mpDestination)}`, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const photosData = await photosRes.json();
        photos = photosData.items || [];
    }

    const feed = photos.map(photo => {
        const photoUrl = photo.url || photo;
        return _collectionPhotoTemplate
            .replaceAll('{{photoUrl}}', photoUrl)
            .replaceAll('{{photoUrlEncoded}}', encodeURIComponent(photoUrl))
            .replaceAll('{{collectionUrl}}', collectionUrl)
            .replaceAll('{{destination}}', dest.mpDestination);
    }).join('');

    const shortcode = `{{< collection "${name}" >}}`;

    const content = _collectionTemplate
        .replaceAll('{{name}}', name)
        .replaceAll('{{collectionUrl}}', collectionUrl)
        .replaceAll('{{destination}}', dest.mpDestination)
        .replaceAll('{{destinationEncoded}}', encodeURIComponent(dest.mpDestination))
        .replaceAll('{{shortcode}}', shortcode)
        .replaceAll('{{shortcodeEncoded}}', encodeURIComponent(shortcode))
        .replaceAll('{{feed}}', feed)
        .replaceAll('{{#empty}}', photos.length === 0 ? '' : '<!--')
        .replaceAll('{{/empty}}', photos.length === 0 ? '' : '-->')
        .replaceAll('{{destQuery}}', destQuery(dest.mpDestination));

    return HTMLPage(token, 'Collection', content, user, '', undefined, { destination: dest.mpDestination });
}

// --- New collection form ---
export async function CollectionNewTemplate(user, token, req) {
    const searchParams = new URLSearchParams(req.url.split('?')[1]);
    const dest = await resolveDestination(token, searchParams.get('destination'));

    if (!dest) {
        return HTMLPage(token, 'Collections', '<p><mark>No blog is configured.</mark></p>', user);
    }

    const content = _collectionNewTemplate
        .replaceAll('{{destination}}', dest.mpDestination)
        .replaceAll('{{destQuery}}', destQuery(dest.mpDestination));

    return HTMLPage(token, 'Collections', content, user, '', undefined, { destination: dest.mpDestination });
}
