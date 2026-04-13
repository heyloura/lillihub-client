import { HTMLPage } from "./templates.js";
import { getConversation } from "../scripts/server/mb.js";

const _quoteTemplate = new TextDecoder().decode(await Deno.readFile("templates/blog/_quote.html"));
const _editorTemplate = new TextDecoder().decode(await Deno.readFile("templates/blog/editor.html"));

export async function EditorTemplate(user, token, req) {
    const searchParams = new URLSearchParams(req.url.split('?')[1]);
    const destination = searchParams.get('destination');
    const edit = searchParams.get('edit');
    const quote = searchParams.get('quote');
    const image = searchParams.get('img');
    const book = searchParams.get('book');
    const authors = searchParams.get('authors');
    const shelf = searchParams.get('shelf');
    const link = searchParams.get('link');
    const alt = searchParams.get('alt');
    const area = searchParams.get('area');
    let post = undefined;
    let quoteback = '';
    let bookPost = '';

    let fetching = await fetch(`https://micro.blog/micropub?q=config`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
    const config = await fetching.json();

    const defaultDestination = config.destination.filter(d => d["microblog-default"])[0] ? config.destination.filter(d => d["microblog-default"])[0].uid : config.destination[0].uid;
    const mpDestination = destination ? destination : defaultDestination;
    const destinationName = config.destination.filter(d => d.uid == mpDestination)[0].name;

    const destinationItems = config.destination ? config.destination.filter(item => item.uid != mpDestination).map(item =>
        `<li class="menu-item"><a href="/post?destination=${encodeURIComponent(item.uid)}${edit ? `&edit=${encodeURIComponent(edit)}` : ''}${area ? `&area=${area}` : ''}">${item.name}</a></li>`
    ).join('') : '';

    fetching = await fetch(`https://micro.blog/micropub?q=syndicate-to&mp-destination=${encodeURIComponent(mpDestination)}`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
    const syndicate = await fetching.json();
    const syndicateList = syndicate["syndicate-to"] || [];

    const syndicateCheckboxes = syndicateList.map(item =>
        `<li class="menu-item"><label>
            <input type="checkbox" name="syndicate[]" value="${item.uid}" checked="checked"> ${item.name}
        </label></li>`
    ).join('');

    if(edit) {
        fetching = await fetch(`https://micro.blog/micropub?q=source&properties=content&url=${edit}&mp-destination=${encodeURIComponent(mpDestination)}`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
        post = await fetching.json();
    }

    if(quote) {
        const conversation = await getConversation(quote, token);
        const convo = conversation.items[conversation.items.length - 1];
        quoteback = _quoteTemplate
            .replaceAll('{{username}}', convo.author._microblog.username)
            .replaceAll('{{avatar}}',convo.author.avatar)
            .replaceAll('{{url}}',convo.url)
            .replaceAll('{{content_html}}',convo.content_html)
    }

    if(book) {
        bookPost = `${shelf}: [${book}](${link}) by ${authors} 📚`;
    }

    fetching = await fetch(`https://micro.blog/micropub?q=category&mp-destination=${encodeURIComponent(mpDestination)}`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
    const categories = await fetching.json();

    const categoryCheckboxes = categories.categories ? categories.categories.map(item =>
        `<li class="menu-item"><label>
            <input ${post && post.properties.category.includes(item) ? 'checked="checked"' : '' } type="checkbox" name="category[]" value="${item}"> ${item}
        </label></li>`
    ).join('') : '';

    const isBlueArea = area === 'blog';
    const btnClass = isBlueArea ? 'btn-glossy-blue' : 'btn-glossy';

    const destinationDropdown = config.destination && config.destination.length > 1
        ? `<div class="dropdown">
            <a class="btn ${btnClass} dropdown-toggle" tabindex="0">${destinationName} <i class="bi bi-caret-down-fill"></i></a>
            <ul class="menu">${destinationItems}</ul>
           </div>`
        : `<span class="editor-dest-label">${destinationName}</span>`;

    const categoriesDropdown = categories.categories && categories.categories.length > 0
        ? `<div class="dropdown dropdown-right">
            <a class="btn ${btnClass} dropdown-toggle" tabindex="0"><i class="bi bi-tags"></i></a>
            <ul class="menu editor-checklist">${categoryCheckboxes}</ul>
           </div>`
        : '';

    const syndicatesDropdown = syndicateList.length > 0
        ? `<div class="dropdown dropdown-right">
            <a class="btn ${btnClass} dropdown-toggle" tabindex="0"><i class="bi bi-share"></i></a>
            <ul class="menu editor-checklist">${syndicateCheckboxes}</ul>
           </div>`
        : '';

    const content = _editorTemplate
        .replaceAll('{{editOrAdd}}', edit ? 'edit' : 'add')
        .replaceAll('{{mpDestination}}', mpDestination)
        .replaceAll('{{destinationDropdown}}', destinationDropdown)
        .replaceAll('{{categoriesDropdown}}', categoriesDropdown)
        .replaceAll('{{syndicatesDropdown}}', syndicatesDropdown)
        .replaceAll('{{editInput}}', edit ? `<input type="hidden" name="url" value="${edit}" />` : '')
        .replaceAll('{{title}}', post && post.properties.name[0] ? post.properties.name[0] : '' )
        .replaceAll('{{image}}', image ? `![${alt ? `Auto-generated description: ${alt}` : ''}](${image})` : '')
        .replaceAll('{{quoteback}}', quoteback)
        .replaceAll('{{bookPost}}', bookPost)
        .replaceAll('{{content}}', post && post.properties.content[0] ? post.properties.content[0] : '' )
        .replaceAll('{{publishSelected}}', post && post.properties["post-status"][0] == 'published' ? `selected="selected"` : '' )
        .replaceAll('{{draftSelected}}', post && post.properties["post-status"][0] == 'draft' ? `selected="selected"` : '' )
        .replaceAll('{{btnClass}}', btnClass)

    return HTMLPage(token, edit ? 'Editor' : 'Post', content, user);
}
