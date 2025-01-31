
import { HTMLPage } from "./templates.js";

const _bookmarkTemplate = new TextDecoder().decode(await Deno.readFile("templates/_bookmark.html"));
const _summaryTemplate = new TextDecoder().decode(await Deno.readFile("templates/_summary.html"));
const _bookmarksTemplate = new TextDecoder().decode(await Deno.readFile("templates/bookmarks.html"));
const _dropDownTemplate = new TextDecoder().decode(await Deno.readFile("templates/_dropdown.html"));
const colors = ["green-text","greenblue-text", "blue-text", "bluepurple-text", "purple-text", "purplered-text", "red-text", "redorange-text", "orange-text", "orangeyellow-text", "yellowgreen-text"];
const borderColors = ["green-border","greenblue-border", "blue-border", "bluepurple-border", "purple-border", "purplered-border", "red-border", "redorange-border", "orange-border", "orangeyellow-border", "yellowgreen-border"];

export async function BookmarksTemplate(user, token, req) {
    const searchParams = new URLSearchParams(req.url.split('?')[1]);
    const tagParam = searchParams.get('tag');

    let items = [];
    let bookmarkId = 0;
    let newBookmarkId = -1;
    let i = 0;

    // Hack solution to use client search because the count parameter for the M.B. API doesn't work
    // And there doesn't seem to be a search function...
    // So we are getting ALL the bookmarks
    while(bookmarkId != newBookmarkId && i < 1000)
    {
        let params = '';
        if(bookmarkId == 0) {
            if(tagParam) {
                params = params + `?tag=${tagParam}`;
            }
        }
        else
        {
            params = params + `?before_id=${items[items.length - 1].id}`;
            if(tagParam) {
                params = params + `&tag=${tagParam}`;
            }
        }
        const fetching = await fetch(`https://micro.blog/posts/bookmarks${params}`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
        const results = await fetching.json();
    
        if(!results.items || results.items.length == 0) {
            break;
        }
    
        bookmarkId = items.length > 0 ? items[items.length - 1].id : results.items[results.items.length - 1].id;
        newBookmarkId = i == 0 ? -1 : results.items[results.items.length - 1].id;
        items = [...items, ...results.items];
        i++;
    }

    // Premium users can have tags on bookmarks.
    let tagsHTML = '';
    let tagsCheckList = '';
    let tagsDataList = '';
    if(user.plan == 'premium') {
        const tagFetching = await fetch(`https://micro.blog/posts/bookmarks/tags`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
        const tags = await tagFetching.json();

        tags.sort();
        tagsHTML = tags.map((item, i) =>
            `<li><a onclick="addLoading(this)" class="btn btn-link ${colors[i%11]} ${tagParam == item ? borderColors[i%11] : ''}" href="/bookmarks?tag=${encodeURIComponent(item)}">${item}</a>${tagParam == item ? `<a onclick="addLoading(this)" href="/bookmarks" class="btn btn-link btn-icon"><i class="bi bi-cross"></i></a>` : ''}</li>`
        ).join('');
        //tagsHTML = tagParam ? tagsHTML + `<li><a onclick="addLoading(this)" href="/bookmarks"><em>Clear Selection</em></a></li>` : tagsHTML;
        
        tagsDataList = tags.map((item) => `<option value="${item}"></option>`).join('');
        
        tagsCheckList = tags.map(item => {
            return `<li class="menu-item"><label>
                    <input {{${item}}} type="checkbox" name="tags[]" value="${item}"> ${item}
                    </label></li>`;
        }).join('');

        tagsCheckList = `${tagsCheckList}<li class="menu-item"><input name="newTag" type="text" /><input type="hidden" value="{{id}}" name="id"/></li>`;
        tagsCheckList =`${tagsCheckList}<li class="menu-item"><button onclick="addLoading(this)" class="btn btn-primary">Save</button></li>`;
    }

    // Premium users can have highlights from bookmarks.
    let highlightItems = [];
    let highlightId = 0;
    let newHighlightId = -1;
    let j = 0;
    if(user.plan == 'premium') {
        // Hack solution to find highlights on bookmarks
        // And there doesn't seem to be a search function...
        while(highlightId != newHighlightId && j < 1000)
        {
            const fetching = await fetch(`https://micro.blog/posts/bookmarks/highlights${highlightId == 0 ? '' : '?before_id=' + highlightItems[highlightItems.length - 1].id}`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
            const results = await fetching.json();

            if(!results.items || results.items.length == 0) {
                break;
            }
        
            highlightId = highlightItems.length > 0 ? highlightItems[highlightItems.length - 1].id : results.items[results.items.length - 1].id;
            newHighlightId = i == 0 ? -1 : results.items[results.items.length - 1].id;
            highlightItems = [...highlightItems, ...results.items];
            j++;
        }
    }

    const feed = items.map(item => {
        const tags = item.tags && user.plan == 'premium' ? ' ·' + item.tags.split(',').map((tag) => {
            return `<span class="chip purple-chip">${tag}</span>`;
        }).join('') : '';
        
        let list = tagsCheckList;
        if(item.tags ) {
            item.tags.split(',').forEach((tag) => list = list.replaceAll(`{{${tag}}}`,'checked="checked"'))
        }

        return _bookmarkTemplate
            .replaceAll('{{avatar}}', item.author.avatar)
            .replaceAll('{{name}}', item.author.name)
            .replaceAll('{{published}}', item.date_published)
            .replaceAll('{{publishedDisplay}}', item.date_published.split('T')[0])
            .replaceAll('{{tags}}', tags)
            .replaceAll('{{addTag}}', user.plan == 'premium' ? 
                `<form action="/bookmarks/update" method="post">${_dropDownTemplate
                    .replaceAll('{{menuItems}}', list.replaceAll(`{{id}}`, item.id))
                    .replaceAll('{{title}}', '')
                    .replaceAll('{{icon}}', '<i class="bi bi-tags"></i>')}</form>` : '')
            .replaceAll('{{id}}', item.id)
            .replaceAll('{{summary}}', item.summary ? _summaryTemplate.replaceAll('{{summary}}', item.summary ) : '')
            .replaceAll('{{highlightCount}}', user.plan == 'premium' && highlightItems.filter(highlight => highlight.url == item.url).length > 0 ? item.content_html.replace('Reader:',`<span class="chip highlight">${highlightItems.filter(highlight => highlight.url == item.url).length} highlights</span> Reader:`) : item.content_html);
    }).join('');

    const content = _bookmarksTemplate
        .replaceAll('{{tagInput}}',user.plan == 'premium' ? `<input class="form-input" list="tags-list" type="text" name="tags" value="${tagParam ? tagParam : ''}" placeholder="add tags..." />` : '')
        .replaceAll('{{tagsDataList}}', user.plan == 'premium' ? `<datalist id="tags-list">${tagsDataList}</datalist>` : '')
        .replaceAll('{{tags}}', '')
        .replaceAll('{{feed}}', feed)

    return HTMLPage(token, 'Bookmarks', content, user, '', 
        `<li class="menuAction"><form class="m-2" autocomplete="off" method="POST" action="/bookmarks/new" >
            <input style="width:150px;" class="form-input" type="url" name="url" placeholder="url...">
            <input type="hidden" name="redirect" value="true" />
            ${user.plan == 'premium' ? `<input style="width:150px;" class="form-input" list="tags-list" type="text" name="tags" value="${tagParam ? tagParam : ''}" placeholder="add tags..." />` : ''}
            ${user.plan == 'premium' ? `<datalist id="tags-list">${tagsDataList}</datalist>` : ''}
            <button onclick="addLoading(this)" type="submit" class="btn btn-primary"><i class="bi bi-plus"></i> Add Bookmark</button>
        </form></li>
        ${user.plan == 'premium' ? `<!--<li class="menuAction"><a href="/highlights" class="btn btn-link green-text" tabindex="0"><i class="bi bi-highlighter"></i> Highlights</a></li>-->` : ''}
        ${user.plan == 'premium' ? `${tagsHTML}` : ''}`);
}
