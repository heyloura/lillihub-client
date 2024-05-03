import { HTMLPage } from "./templates.js";

const _dropdownTemplate = new TextDecoder().decode(await Deno.readFile("templates/_dropdown.html"));
const _mediaItemTemplate = new TextDecoder().decode(await Deno.readFile("templates/_media_item.html"));
const _mediaTemplate = new TextDecoder().decode(await Deno.readFile("templates/media.html"));

export async function MediaTemplate(user, token, req) {
    
    const searchParams = new URLSearchParams(req.url.split('?')[1]);
    const destination = searchParams.get('destination');
    const q = searchParams.get('q');
    const offset = searchParams.get('offset');

    let fetching = await fetch(`https://micro.blog/micropub?q=config`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
    const config = await fetching.json();
    
    if(!config.destination || config.destination.length == 0) {
        return HTMLPage('Posts', `<p><mark>No blog is configured.</mark></p>`, user);
    }

    const defaultDestination = config.destination.filter(d => d["microblog-default"]) ? config.destination.filter(d => d["microblog-default"])[0].uid : config.destination[0].uid;
    const mpDestination = destination ? destination : defaultDestination;
    const destinationSelect = config.destination ? config.destination.map(item => {
        if(item.uid != mpDestination) {
            return `<li class="menu-item"><a onclick="addLoading(this)" href="/media?destination=${encodeURIComponent(item.uid)}">${item.name}</a></li>`;
        }
    }).join('') : '';

    const destinationDropdown = _dropdownTemplate
        .replaceAll('{{title}}', config.destination.filter(d => d.uid == mpDestination)[0].name)
        .replaceAll('{{icon}}', '<i class="bi bi-caret-down-fill"></i>')
        .replaceAll('{{menuItems}}', destinationSelect);
    
    fetching = await fetch(`${config["media-endpoint"]}?q=source${offset ? `&offset=${offset}` : ''}&limit=50${q ? `&filter=${encodeURIComponent(q)}` : ''}&mp-destination=${encodeURIComponent(mpDestination)}`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
    const results = await fetching.json();

    const feed = (results.items.map((item) => {
        return _mediaItemTemplate
            .replaceAll('{{url}}', item.url)
            .replaceAll('{{alt}}', item.alt ? item.alt : '')
            .replaceAll('{{altDisp}}', item.alt ? `<p class="p-2"><i class="bi bi-robot"></i> ${item.alt}</p>` : '')
            .replaceAll('{{altEncoded}}', item.alt ? encodeURIComponent(item.alt) : '')
            .replaceAll('{{encodedUrl}}',encodeURIComponent(item.url))
            .replaceAll('{{destination}}', mpDestination)
            .replaceAll('{{published}}',item.published)
            .replaceAll('{{publishedDisplay}}', item.published.split('T')[0])
    })).join('');

    const content = _mediaTemplate
        .replaceAll('{{destinationDropdown}}', destinationDropdown)
        .replaceAll('{{feed}}', feed)
        .replaceAll('{{destination}}', mpDestination)
        .replaceAll('{{offset}}', offset ? offset + 50 : '50')

    return HTMLPage('Media', content, user);
}