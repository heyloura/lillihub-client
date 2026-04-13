import { HTMLPage } from "./templates.js";
import { formatDate, truncateHTML, sanitizeHTML } from "../scripts/server/utilities.js";
import showdown from "npm:showdown";

const _blogPostTemplate = new TextDecoder().decode(await Deno.readFile("templates/blog/_blogpost.html"));
const _blogTemplate = new TextDecoder().decode(await Deno.readFile("templates/blog/blog.html"));

const converter = new showdown.Converter({
    metadata: true,
    parseImgDimensions: true,
    strikethrough: true,
    tables: true,
    ghCodeBlocks: true,
    smoothLivePreview: true,
    simpleLineBreaks: true,
    emoji: true,
});

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

    const destinationItems = config.destination ? config.destination.filter(item => item.uid != mpDestination).map(item =>
        `<li class="menu-item"><a href="/posts?destination=${encodeURIComponent(item.uid)}${status ? '&status=draft' : ''}">${item.name}</a></li>`
    ).join('') : '';

    const destinationName = config.destination.filter(d => d.uid == mpDestination)[0].name;

    const fetchingCategories = await fetch(`https://micro.blog/micropub?q=category`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
    const categories = await fetchingCategories.json();

    const categoryItems = categories.categories ? categories.categories.map(item =>
        `<li class="menu-item"><a ${category == item ? 'class="active"' : ''} href="/posts?destination=${encodeURIComponent(mpDestination)}&category=${encodeURIComponent(item)}${status ? '&status=draft' : ''}">${item}</a></li>`
    ).join('') : '';

    const categoryDropdownItems = categoryItems + `<li class="menu-item"><a href="/posts?destination=${encodeURIComponent(mpDestination)}${status ? '&status=draft' : ''}"><em>Clear</em></a></li>`;

    const fetchingPosts = await fetch(`https://micro.blog/micropub?q=source${offset ? `&offset=${offset}` : ''}&limit=${category || status ? '5000' : '25'}${q ? `&filter=${encodeURIComponent(q)}` : ''}&mp-destination=${encodeURIComponent(mpDestination)}`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
    const results = await fetchingPosts.json();

    const feed = results.items.filter(p => p.properties["post-status"][0] == (status ? 'draft' : 'published')).map(item => {
        if(category && item.properties.category.indexOf(category) == -1) {
            return '';
        }

        const markdown = item.properties["content"][0];
        // Pipeline: showdown -> ammonia (strip <style>/<script>/etc.) ->
        // linkedom truncate -> ammonia again. The second ammonia pass cleans
        // up any structural weirdness linkedom's innerHTML serializer can
        // introduce (self-closing <p />, orphan </br>, etc.), ensuring the
        // output is well-formed and won't leak into the surrounding card.
        const html = sanitizeHTML(converter.makeHtml(markdown));
        const title = item.properties["name"][0] || '';
        const published = formatDate(item.properties["published"][0], 'short');
        const editUrl = `/post?edit=${encodeURIComponent(item.properties["url"][0])}&destination=${encodeURIComponent(mpDestination)}&area=blog`;
        const tags = item.properties.category.map(cat =>
            `<span class="chip"><a href="/posts?destination=${encodeURIComponent(mpDestination)}&category=${encodeURIComponent(cat)}">${cat}</a></span>`
        ).join('');

        const { html: truncated } = truncateHTML(html, 800);
        const truncatedContent = sanitizeHTML(truncated);

        return _blogPostTemplate
            .replaceAll('{{title}}', title)
            .replaceAll('{{formattedDate}}', published)
            .replaceAll('{{editUrl}}', editUrl)
            .replaceAll('{{content}}', truncatedContent)
            .replaceAll('{{url}}', item.properties["url"][0])
            .replaceAll('{{tags}}', tags);

    }).join('');

    const nextOffset = offset ? parseInt(offset) + 50 : 50;
    const nextHref = `/posts?destination=${encodeURIComponent(mpDestination)}&offset=${nextOffset}${q ? `&q=${q}` : ''}${category ? `&category=${category}` : ''}${status ? '&status=draft' : ''}`;

    const content = _blogTemplate
        .replaceAll('{{destinationName}}', destinationName)
        .replaceAll('{{destinationItems}}', destinationItems)
        .replaceAll('{{categoryItems}}', categoryDropdownItems)
        .replaceAll('{{categoryBadge}}', category ? ' badge' : '')
        .replaceAll('{{status}}', status ? 'draft' : '')
        .replaceAll('{{destination}}', mpDestination)
        .replaceAll('{{q}}', q ? q : '')
        .replaceAll('{{feed}}', feed)
        .replaceAll('{{nextHref}}', nextHref);

    return HTMLPage(token, status ? 'Draft' : 'Posts', content, user);
}
