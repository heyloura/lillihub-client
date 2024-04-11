import { HTMLPage } from "./templates.js";

const _postTemplate = new TextDecoder().decode(await Deno.readFile("templates/_post.html"));
const _dropdownTemplate = new TextDecoder().decode(await Deno.readFile("templates/_dropdown.html"));
const _blogTemplate = new TextDecoder().decode(await Deno.readFile("templates/blog.html"));

export async function BlogTemplate(user, token, req) {
    const searchParams = new URLSearchParams(req.url.split('?')[1]);

    const destination = searchParams.get('destination');
    const q = searchParams.get('q');
    const offset = searchParams.get('offset');
    const status = searchParams.get('status');

    const fetching = await fetch(`https://micro.blog/micropub?q=config`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
    const config = await fetching.json();

    const mpDestination = destination ? destination : config.destination.filter(d => d["microblog-default"])[0].uid;
    const destinationSelect = config.destination ? config.destination.map(item => {
        if(item.uid != mpDestination) {
            return `<li class="menu-item"><a href="/posts?destination=${encodeURIComponent(item.uid)}${status ? '&status=draft' : ''}">${item.name}</a></li>`;
        }
    }).join('') : '';

    const destinationDropdown = _dropdownTemplate
        .replaceAll('{{title}}', config.destination.filter(d => d.uid == mpDestination)[0].name)
        .replaceAll('{{icon}}', '<i class="bi bi-caret-down-fill"></i>')
        .replaceAll('{{menuItems}}', destinationSelect);

    //https://micro.blog/micropub?q=source&filter=daughter&limit=3&offset=2
    const fetchingPosts = await fetch(`https://micro.blog/micropub?q=source${offset ? `&offset=${offset}` : ''}&limit=25${q ? `&filter=${encodeURIComponent(q)}` : ''}&mp-destination=${encodeURIComponent(mpDestination)}`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
    const results = await fetchingPosts.json();

    const feed = results.items.filter(p => p.properties["post-status"][0] == (status ? 'draft' : 'published')).map(item => {
        const text = item.properties["content"][0].replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll("'", '&#39;').replaceAll('"', '&quot;').replace(/(?:\r\n|\r|\n)/g, '<br>');
        
        return _postTemplate.replaceAll('{{avatar}}', user.avatar) 
            .replaceAll('{{name}}', user.name)
            .replaceAll('{{username}}', user.username)
            .replaceAll('{{new}}', '')
            .replaceAll('{{tags}}', '')
            .replaceAll('{{actions}}', `<a href="/post?edit=${encodeURIComponent(item.properties["url"][0])}&destination=${encodeURIComponent(mpDestination)}">Edit post</a>`)
            // .replaceAll('{{actions}}',  
            //     _dropdownTemplate.replaceAll('{{title}}', '')
            //         .replaceAll('{{icon}}', '<i class="bi bi-three-dots-vertical"></i>')
            //         .replaceAll('{{menuItems}}', `<li class="menu-item"><a href="/post?edit=${encodeURIComponent(item.properties["url"][0])}&destination=${encodeURIComponent(mpDestination)}">Edit post</a></li>`))
            .replaceAll('{{content}}', item.properties["name"][0] ? `<details><summary><b>${item.properties["name"][0]}</b></summary>${text}</details>` : text)
            .replaceAll('{{publishedDate}}', item.properties["published"][0])
            .replaceAll('{{relativeDate}}', item.properties["published"][0])
            .replaceAll('{{url}}', item.properties["url"][0])
            .replaceAll('{{id}}', '')
            .replaceAll('{{comments}}', item.properties.category.map(item => `<span class="chip">${item}</span>`).join(''))
            .replaceAll('{{reply}}', '');
        
    }).join('');

    const content = _blogTemplate
        .replaceAll('{{destinationDropdown}}', destinationDropdown)
        .replaceAll('{{postsActive}}', status ? '' : 'class="active"')
        .replaceAll('{{draftActive}}', status ? 'class="active"' : '')
        .replaceAll('{{q}}', q ? q : '')
        .replaceAll('{{feed}}', feed)
        .replaceAll('{{destination}}', encodeURIComponent(destination))
        .replaceAll('{{offset}}', offset ? offset + 50 : '50')

    return HTMLPage('Posts', content, user);
}