import { HTMLPage } from "./templates.js";
import { getConversation } from "../scripts/server/mb.js";

const _easyMDEJS = await Deno.readTextFile("scripts/client/easymde.min.js");
const _easyMDECSS = await Deno.readTextFile("styles/easymde.min.css");
const _compressor = await Deno.readTextFile("scripts/client/compressor.min.js");
const _quoteTemplate = new TextDecoder().decode(await Deno.readFile("templates/_quote.html"));
const _dropdownTemplate = new TextDecoder().decode(await Deno.readFile("templates/_dropdown.html"));
const _editorTemplate = new TextDecoder().decode(await Deno.readFile("templates/editor.html"));

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
    const destinationSelect = config.destination ? config.destination.map(item => {
        if(item.uid != mpDestination) {
            return `<li class="menu-item"><a onclick="if(confirm('You are navigating away from the page and will lose any changes. Continue?')){addLoading(this);return true;}return false;" href="/post?destination=${encodeURIComponent(item.uid)}">${item.name}</a></li>`;
        }
    }).join('') : '';

    fetching = await fetch(`https://micro.blog/micropub?q=syndicate-to&mp-destination=${encodeURIComponent(mpDestination)}`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
    const syndicate = await fetching.json();

    const syndicates = syndicate["syndicate-to"] ? syndicate["syndicate-to"].map(item => {
        return `<li class="menu-item"><label>
                <input type="checkbox" name="syndicate[]" value="${item.uid}" onchange="countChecked('syndicate[]', 'syndicatesDropdown')" checked="checked"> ${item.name}
                </label></li>`;
    }).join('') : '';

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

    const categoriesCheckboxList = categories.categories ? categories.categories.map(item => {
        return `<li class="menu-item"><label>
                <input ${post && post.properties.category.includes(item) ? 'checked="checked"' : '' } type="checkbox" name="category[]" onchange="countChecked('category[]', 'categoriesDropdown')" value="${item}"> ${item}
                </label></li>`;
    }).join('') : '';

    const destinationDropdown = _dropdownTemplate
        .replaceAll('{{title}}', config.destination.filter(d => d.uid == mpDestination)[0].name)
        .replaceAll('{{icon}}', '<i class="bi bi-caret-down-fill"></i>')
        .replaceAll('{{menuItems}}', destinationSelect);

    const categoriesDropdown = _dropdownTemplate
        .replaceAll('{{title}}', '')
        .replaceAll('{{icon}}', `<span id="categoriesDropdown" class="badge"><i class="bi bi-tags"></i></span>`)
        .replaceAll('{{menuItems}}', categoriesCheckboxList);

    const syndicatesDropdown = _dropdownTemplate
        .replaceAll('{{title}}', '')
        .replaceAll('{{icon}}', `<span id="syndicatesDropdown" class="badge" data-badge="${syndicate["syndicate-to"].length}"><i class="bi bi-share"></i></span>`)
        .replaceAll('{{menuItems}}', syndicates)

    const content = _editorTemplate
        .replaceAll('{{easyMDEJS}}',_easyMDEJS)
        .replaceAll('{{easyMDECSS}}',_easyMDECSS)
        .replaceAll('{{compressor}}',_compressor)
        .replaceAll('{{url}}', edit ? edit : '')
        .replaceAll('{{editOrAdd}}', edit ? 'edit' : 'add')
        .replaceAll('{{destinationDropdown}}', config.destination && config.destination.length > 1 ? destinationDropdown : `<span class="mt-2">${config.destination.filter(d => d.uid == mpDestination)[0].name}</span>`)
        .replaceAll('{{categoriesDropdown}}', categories.categories && categories.categories.length > 0 ? categoriesDropdown : '' )
        .replaceAll('{{syndicatesDropdown}}', syndicate["syndicate-to"] && syndicate["syndicate-to"].length > 0 ? syndicatesDropdown : '')
        .replaceAll('{{mpDestination}}', mpDestination)
        .replaceAll('{{editInput}}', edit ? `<input type="hidden" name="url" value="${edit}" />` : '')
        .replaceAll('{{title}}', post && post.properties.name[0] ? `value="${post.properties.name[0]}"` : '' )
        //.replaceAll('{{image}}', image ? `<img alt="" width="" height="" src="${image}" />` : '')
        .replaceAll('{{image}}', image ? `![${alt ? `Auto-generated description: ${alt}` : ''}](${image})` : '')
        .replaceAll('{{quoteback}}', quoteback)
        .replaceAll('{{bookPost}}',bookPost)
        .replaceAll('{{content}}', post && post.properties.content[0] ? post.properties.content[0] : '' )
        .replaceAll('{{publishSelected}}', post && post.properties["post-status"][0] == 'published' ? `selected="selected"` : '' )
        .replaceAll('{{draftSelected}}', post && post.properties["post-status"][0] == 'draft' ? `selected="selected"` : '' )

    return HTMLPage(token, edit ? 'Editor' : 'Post', content, user);
}
