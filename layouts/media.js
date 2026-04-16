import { formatDate } from "../scripts/server/utilities.js";
import { HTMLPage } from "./templates.js";

const _mediaItemTemplate = new TextDecoder().decode(await Deno.readFile("templates/blog/_media_item.html"));
const _mediaTemplate = new TextDecoder().decode(await Deno.readFile("templates/blog/media.html"));

export async function MediaTemplate(user, token, req) {

    const searchParams = new URLSearchParams(req.url.split('?')[1]);
    const destination = searchParams.get('destination');
    const q = searchParams.get('q');
    const offset = searchParams.get('offset');
    const addedToCollection = searchParams.get('added'); // media URL that was just added to a collection

    let fetching = await fetch(`https://micro.blog/micropub?q=config`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
    const config = await fetching.json();

    if(!config.destination || config.destination.length == 0) {
        return HTMLPage(token, 'Media', `<p><mark>No blog is configured.</mark></p>`, user);
    }

    const defaultDestination = config.destination.filter(d => d["microblog-default"]) ? config.destination.filter(d => d["microblog-default"])[0].uid : config.destination[0].uid;
    const mpDestination = destination ? destination : defaultDestination;
    const destinationName = config.destination.filter(d => d.uid == mpDestination)[0].name;

    const destinationItems = config.destination ? config.destination.filter(item => item.uid != mpDestination).map(item =>
        `<li class="menu-item"><a href="/media?destination=${encodeURIComponent(item.uid)}">${item.name}</a></li>`
    ).join('') : '';

    const destinationDropdown = config.destination && config.destination.length > 1
        ? `<div class="dropdown">
            <a class="btn btn-glossy dropdown-toggle" tabindex="0">${destinationName} <i class="bi bi-caret-down-fill"></i></a>
            <ul class="menu">${destinationItems}</ul>
           </div>`
        : `<span class="editor-dest-label">${destinationName}</span>`;

    // Fetch collections for the "Add to collection" dropdown on each media item
    let collectionSelectHTML = '';
    try {
        const collRes = await fetch(`https://micro.blog/micropub?q=source&mp-channel=collections&mp-destination=${encodeURIComponent(mpDestination)}`, {
            method: 'GET', headers: { 'Authorization': 'Bearer ' + token }
        });
        const collData = await collRes.json();
        const collList = collData.items || [];
        if (collList.length > 0) {
            const opts = collList.map(c =>
                `<option value="${c.properties.url[0]}">${c.properties.name[0]}</option>`
            ).join('');
            // Each item gets its own form; {{url}} and {{mediaId}} are filled per-item
            collectionSelectHTML = `<form method="POST" action="/collections/add-photo" class="media-coll-form">
                <input type="hidden" name="destination" value="${mpDestination}" />
                <input type="hidden" name="photo" value="{{url}}" />
                <input type="hidden" name="redirect" value="{{mediaRedirect}}" />
                <select name="url" class="form-select media-coll-select" onchange="if(this.value)this.form.submit()">
                    <option value="">Collection\u2026</option>${opts}
                </select>
                <noscript><button type="submit" class="btn btn-glossy btn-sm">Add</button></noscript>
            </form>`;
        }
    } catch(e) { /* skip if collections unavailable */ }

    fetching = await fetch(`${config["media-endpoint"]}?q=source${offset ? `&offset=${offset}` : ''}&limit=50${q ? `&filter=${encodeURIComponent(q)}` : ''}&mp-destination=${encodeURIComponent(mpDestination)}`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
    const results = await fetching.json();

    const currentMediaPage = `/media?destination=${encodeURIComponent(mpDestination)}${offset ? `&offset=${offset}` : ''}${q ? `&q=${encodeURIComponent(q)}` : ''}`;

    const feed = (results.items.map((item, idx) => {
        const ext = item.url.split('.').pop().toLowerCase();
        const isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext);
        const shortUrl = item.url.replace(/^https?:\/\//, '').split('/').pop();
        const mediaId = 'u' + idx;
        const wasAdded = addedToCollection === item.url;
        const mediaRedirect = `${currentMediaPage}&added=${encodeURIComponent(item.url)}#media-${mediaId}`;
        return _mediaItemTemplate
            .replaceAll('{{url}}', item.url)
            .replaceAll('{{shortUrl}}', shortUrl)
            .replaceAll('{{mediaId}}', mediaId)
            .replaceAll('{{addedClass}}', wasAdded ? 'media-card-added' : '')
            .replaceAll('{{alt}}', item.alt ? item.alt : '')
            .replaceAll('{{altDisp}}', item.alt ? `<p class="media-card-alt"><i class="bi bi-robot"></i> ${item.alt}</p>` : '')
            .replaceAll('{{altEncoded}}', item.alt ? encodeURIComponent(item.alt) : '')
            .replaceAll('{{encodedUrl}}', encodeURIComponent(item.url))
            .replaceAll('{{destination}}', mpDestination)
            .replaceAll('{{formattedDate}}', formatDate(item.published, 'short'))
            .replaceAll('{{thumbnail}}', isImage ? `<img class="media-card-img" src="${item.url}" alt="${item.alt || ''}" loading="lazy">` : `<div class="media-card-file"><i class="bi bi-file-earmark"></i></div>`)
            .replaceAll('{{collectionSelect}}', isImage ? collectionSelectHTML.replaceAll('{{url}}', item.url).replaceAll('{{mediaRedirect}}', mediaRedirect) : '')
    })).join('');

    const nextOffset = offset ? parseInt(offset) + 50 : 50;
    const nextHref = `/media?destination=${encodeURIComponent(mpDestination)}&offset=${nextOffset}${q ? `&q=${encodeURIComponent(q)}` : ''}`;

    const content = _mediaTemplate
        .replaceAll('{{destinationDropdown}}', destinationDropdown)
        .replaceAll('{{feed}}', feed)
        .replaceAll('{{destination}}', mpDestination)
        .replaceAll('{{q}}', q ? q : '')
        .replaceAll('{{nextHref}}', nextHref)

    return HTMLPage(token, 'Media', content, user, '', undefined, { destination: mpDestination });
}
