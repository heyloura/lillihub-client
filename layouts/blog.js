import { HTMLPage } from "./templates.js";

//const _postTemplate = new TextDecoder().decode(await Deno.readFile("templates/_post.html"));
const _blogPostTemplate = new TextDecoder().decode(await Deno.readFile("templates/_blogpost.html"));
const _dropdownTemplate = new TextDecoder().decode(await Deno.readFile("templates/_dropdown.html"));
const _blogTemplate = new TextDecoder().decode(await Deno.readFile("templates/blog.html"));

export async function BlogTemplate(user, token, req) {
    const searchParams = new URLSearchParams(req.url.split('?')[1]);

    const destination = searchParams.get('destination');
    const q = searchParams.get('q');
    const offset = searchParams.get('offset');
    let status = searchParams.get('status');
    const category = searchParams.get('category');

    if(status != 'draft') {
        status = '';
    }

    const fetching = await fetch(`https://micro.blog/micropub?q=config`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
    const config = await fetching.json();

    if(!config.destination || config.destination.length == 0) {
        return HTMLPage('Posts', `<p><mark>No blog is configured.</mark></p>`, user);
    }

    const defaultDestination = config.destination.filter(d => d["microblog-default"]) ? config.destination.filter(d => d["microblog-default"])[0].uid : config.destination[0].uid;
    const mpDestination = destination ? destination : defaultDestination;
    const destinationSelect = config.destination ? config.destination.map(item => {
        if(item.uid != mpDestination) {
            return `<li class="menu-item"><a onclick="addLoading(this)" href="/posts?destination=${encodeURIComponent(item.uid)}${status ? '&status=draft' : ''}">${item.name}</a></li>`;
        }
    }).join('') : '';

    const fetchingCategories = await fetch(`https://micro.blog/micropub?q=category`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
    const categories = await fetchingCategories.json();

    const categoriesCheckboxList = categories.categories ? categories.categories.map(item => {
        return `<li class="menu-item"><a onclick="addLoading(this)" ${category == item ? 'style="color:var(--crust);"' : ''} href="/posts?destination=${encodeURIComponent(mpDestination)}&category=${encodeURIComponent(item)}${status ? '&status=draft' : ''}">${item}</a></li>`;
    }).join('') : '';

    const categoriesDropdown = _dropdownTemplate
        .replaceAll('{{title}}', '')
        .replaceAll('{{icon}}', `<span id="categoriesDropdown" class="${category ? 'badge' : ''}"><i class="bi bi-tags"></i></span>`)
        .replaceAll('{{menuItems}}', categoriesCheckboxList + `<a onclick="addLoading(this)" href="/posts?destination=${encodeURIComponent(mpDestination)}${status ? '&status=draft' : ''}"><em>Clear Selection</em></a>`);

    // let categoriesHTML = categories.categories.map((item) =>
    //     `<span class="chip" ${category == item ? 'style="background-color:var(--purplered);"' : ''} ><a onclick="addLoading(this)" ${category == item ? 'style="color:var(--crust);"' : ''} href="/posts?destination=${encodeURIComponent(mpDestination)}&category=${encodeURIComponent(item)}">${item}</a></span>`
    // ).join('');
    // categoriesHTML = category ? categoriesHTML + `<span class="chip"><a onclick="addLoading(this)" href="/posts?destination=${encodeURIComponent(mpDestination)}"><em>Clear Selection</em></a></span>` : categoriesHTML;

    const destinationDropdown = _dropdownTemplate
        .replaceAll('{{title}}', config.destination.filter(d => d.uid == mpDestination)[0].name)
        .replaceAll('{{icon}}', '<i class="bi bi-caret-down-fill"></i>')
        .replaceAll('{{menuItems}}', destinationSelect);

    //https://micro.blog/micropub?q=source&filter=daughter&limit=3&offset=2
    const fetchingPosts = await fetch(`https://micro.blog/micropub?q=source${offset ? `&offset=${offset}` : ''}&limit=${category || status ? '5000' : '25'}${q ? `&filter=${encodeURIComponent(q)}` : ''}&mp-destination=${encodeURIComponent(mpDestination)}`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
    const results = await fetchingPosts.json();

    const feed = results.items.filter(p => p.properties["post-status"][0] == (status ? 'draft' : 'published')).map(item => {
        const text = item.properties["content"][0].replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll("'", '&#39;').replaceAll('"', '&quot;').replace(/(?:\r\n|\r|\n)/g, '<br>');
        
        if(category && item.properties.category.indexOf(category) == -1) {
            return '';
        }
        return _blogPostTemplate
            .replaceAll('{{title}}', item.properties["name"][0] ? item.properties["name"][0] : '')
            .replaceAll('{{actions}}', `<a class="btn btn-link" onclick="addLoading(this)" href="/post?edit=${encodeURIComponent(item.properties["url"][0])}&destination=${encodeURIComponent(mpDestination)}&area=blog"><i class="bi bi-pencil"></i> ${item.properties["name"][0] ? item.properties["name"][0] : item.properties["published"][0]}</a>`)
            .replaceAll('{{content}}', text)
            .replaceAll('{{publishedDate}}', item.properties["published"][0])
            .replaceAll('{{relativeDate}}', item.properties["published"][0])
            .replaceAll('{{url}}', item.properties["url"][0])
            .replaceAll('{{tags}}', item.properties.category.map(item => `<span class="chip"><a href="/posts?destination=${encodeURIComponent(mpDestination)}&category=${encodeURIComponent(item)}">${item}</a></span>`).join(''));
        
    }).join('');

    const href = `/posts?destination=${encodeURIComponent(mpDestination)}&offset=${offset ? offset + 50 : 50}${q ? `&q=${q}` : ''}${category ? `&category=${category}` : ''}`;
    const content = _blogTemplate
        .replaceAll('{{destinationDropdown}}', destinationDropdown)
        .replaceAll('{{postsActive}}', status ? '' : 'class="active"')
        .replaceAll('{{draftActive}}', status ? 'class="active"' : '')
        .replaceAll('{{status}}', status ? 'draft' : 'posts')
        .replaceAll('{{q}}', q ? q : '')
        .replaceAll('{{feed}}', feed)
        .replaceAll('{{destination}}', encodeURIComponent(mpDestination))
        .replaceAll('{{categoriesHTML}}', categoriesDropdown)
        .replaceAll('{{nextHref}}', href)

    return HTMLPage(token, status ? 'Draft' : 'Posts', content, user);
}