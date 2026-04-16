import { formatDate } from "../scripts/server/utilities.js";
import { HTMLPage } from "./templates.js";

const _mediaItemTemplate = new TextDecoder().decode(await Deno.readFile("templates/blog/_media_item.html"));
const _mediaTemplate = new TextDecoder().decode(await Deno.readFile("templates/blog/media.html"));

export async function MediaTemplate(user, token, req) {

    const searchParams = new URLSearchParams(req.url.split('?')[1]);
    const destination = searchParams.get('destination');
    const q = searchParams.get('q');
    const offset = searchParams.get('offset');

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

    fetching = await fetch(`${config["media-endpoint"]}?q=source${offset ? `&offset=${offset}` : ''}&limit=50${q ? `&filter=${encodeURIComponent(q)}` : ''}&mp-destination=${encodeURIComponent(mpDestination)}`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
    const results = await fetching.json();

    const feed = (results.items.map((item) => {
        const ext = item.url.split('.').pop().toLowerCase();
        const isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext);
        return _mediaItemTemplate
            .replaceAll('{{url}}', item.url)
            .replaceAll('{{alt}}', item.alt ? item.alt : '')
            .replaceAll('{{altDisp}}', item.alt ? `<p class="media-alt"><i class="bi bi-robot"></i> ${item.alt}</p>` : '')
            .replaceAll('{{altEncoded}}', item.alt ? encodeURIComponent(item.alt) : '')
            .replaceAll('{{encodedUrl}}', encodeURIComponent(item.url))
            .replaceAll('{{destination}}', mpDestination)
            .replaceAll('{{formattedDate}}', formatDate(item.published, 'short'))
            .replaceAll('{{thumbnail}}', isImage ? `<img class="media-thumb" src="${item.url}" alt="${item.alt || ''}" loading="lazy">` : `<div class="media-thumb media-file"><i class="bi bi-file-earmark"></i></div>`)
    })).join('');

    const nextOffset = offset ? parseInt(offset) + 50 : 50;
    const nextHref = `/media?destination=${encodeURIComponent(mpDestination)}&offset=${nextOffset}${q ? `&q=${encodeURIComponent(q)}` : ''}`;

    const content = _mediaTemplate
        .replaceAll('{{destinationDropdown}}', destinationDropdown)
        .replaceAll('{{feed}}', feed)
        .replaceAll('{{destination}}', mpDestination)
        .replaceAll('{{q}}', q ? q : '')
        .replaceAll('{{nextHref}}', nextHref)

    return HTMLPage(token, 'Media', content, user);
}
