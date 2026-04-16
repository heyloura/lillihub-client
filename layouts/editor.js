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
    const prefill = searchParams.get('content');
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
        fetching = await fetch(`https://micro.blog/micropub?q=source&url=${edit}&mp-destination=${encodeURIComponent(mpDestination)}`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
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

    const destinationDropdown = config.destination && config.destination.length > 1
        ? `<div class="dropdown">
            <a class="btn btn-glossy dropdown-toggle" tabindex="0">${destinationName} <i class="bi bi-caret-down-fill"></i></a>
            <ul class="menu">${destinationItems}</ul>
           </div>`
        : `<span class="editor-dest-label">${destinationName}</span>`;

    const categoriesDropdown = categories.categories && categories.categories.length > 0
        ? `<div class="dropdown dropdown-right" id="categories-dropdown">
            <a class="btn btn-glossy dropdown-toggle" tabindex="0"><i class="bi bi-tags"></i><span class="editor-badge hide-if-user-has-no-javascript"></span></a>
            <ul class="menu editor-checklist">${categoryCheckboxes}</ul>
           </div>`
        : '';

    const syndicatesDropdown = syndicateList.length > 0
        ? `<div class="dropdown dropdown-right" id="syndicates-dropdown">
            <a class="btn btn-glossy dropdown-toggle" tabindex="0"><i class="bi bi-share"></i><span class="editor-badge hide-if-user-has-no-javascript"></span></a>
            <ul class="menu editor-checklist">${syndicateCheckboxes}</ul>
           </div>`
        : '';

    // Fetch collections for the shortcode picker and preview-card "add to collection"
    let collectionsDropdown = '';
    let collectionsJSON = '[]';
    try {
        const collRes = await fetch(`https://micro.blog/micropub?q=source&mp-channel=collections&mp-destination=${encodeURIComponent(mpDestination)}`, {
            method: 'GET', headers: { 'Authorization': 'Bearer ' + token }
        });
        const collData = await collRes.json();
        const collList = (collData.items || []).map(item => ({
            name: item.properties.name[0],
            url: item.properties.url[0]
        }));
        collectionsJSON = JSON.stringify(collList);
        const collItems = collList.map(c => {
            const shortcode = `{{< collection "${c.name}" >}}`;
            return `<li class="menu-item"><a href="#" class="collection-insert-shortcode" data-shortcode="${shortcode.replace(/"/g, '&quot;')}">${c.name}</a></li>`;
        }).join('');
        if (collItems) {
            collectionsDropdown = `<div class="dropdown dropdown-right">
                <a class="btn btn-glossy dropdown-toggle" tabindex="0"><i class="bi bi-grid"></i></a>
                <ul class="menu">${collItems}</ul>
            </div>`;
        }
    } catch (e) { /* collections not available — skip */ }

    const content = _editorTemplate
        .replaceAll('{{editOrAdd}}', edit ? 'edit' : 'add')
        .replaceAll('{{mpDestination}}', mpDestination)
        .replaceAll('{{destinationDropdown}}', destinationDropdown)
        .replaceAll('{{categoriesDropdown}}', categoriesDropdown)
        .replaceAll('{{syndicatesDropdown}}', syndicatesDropdown)
        .replaceAll('{{collectionsDropdown}}', collectionsDropdown)
        .replaceAll('{{collectionsJSON}}', collectionsJSON.replace(/&/g, '&amp;').replace(/'/g, '&#39;'))
        .replaceAll('{{editInput}}', edit ? `<input type="hidden" name="url" value="${edit}" />` : '')
        .replaceAll('{{title}}', post && post.properties.name[0] ? post.properties.name[0] : '' )
        .replaceAll('{{image}}', image ? `![${alt ? `Auto-generated description: ${alt}` : ''}](${image})` : '')
        .replaceAll('{{quoteback}}', quoteback)
        .replaceAll('{{bookPost}}', bookPost)
        .replaceAll('{{content}}', post && post.properties.content[0] ? post.properties.content[0] : (prefill || '') )
        .replaceAll('{{summary}}', post && post.properties.summary && post.properties.summary[0] ? post.properties.summary[0] : '')
        .replaceAll('{{summaryOpen}}', post && post.properties.summary && post.properties.summary[0] ? 'open' : '')
        .replaceAll('{{deleteButton}}', edit
            ? `<details class="editor-delete-details hide-if-user-has-javascript">
                    <summary class="btn btn-danger"><i class="bi bi-trash"></i> Delete</summary>
                    <button type="submit" formaction="/post/delete" class="btn btn-danger">Confirm Delete</button>
               </details>
               <button type="submit" formaction="/post/delete" class="btn btn-danger hide-if-user-has-no-javascript" onclick="return confirm('Permanently delete this post?')"><i class="bi bi-trash"></i> Delete</button>`
            : '')

    return HTMLPage(token, edit ? 'Editor' : 'Post', content, user);
}
