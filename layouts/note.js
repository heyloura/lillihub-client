import { HTMLPage } from "./templates.js";

const _noteTemplate = new TextDecoder().decode(await Deno.readFile("templates/note.html"));
const _easyMDEJS = await Deno.readTextFile("scripts/client/easymde.min.js");
const _easyMDECSS = await Deno.readTextFile("styles/easymde.min.css");
const _compressor = await Deno.readTextFile("scripts/client/compressor.min.js");

const colors = ["green-text","greenblue-text", "blue-text", "bluepurple-text", "purple-text", "purplered-text", "red-text", "redorange-text", "orange-text", "orangeyellow-text", "yellowgreen-text"];
const borderColors = ["green-border","greenblue-border", "blue-border", "bluepurple-border", "purple-border", "purplered-border", "red-border", "redorange-border", "orange-border", "orangeyellow-border", "yellowgreen-border"];

export async function NoteTemplate(user, token, id, req) {
    if(req.url.includes('%3Ca%20href=')){
        console.log('huh?')
        return;
    }

    let fetching = await fetch(`https://micro.blog/micropub?q=config`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
    const config = await fetching.json();

    const defaultDestination = config.destination.filter(d => d["microblog-default"])[0] ? config.destination.filter(d => d["microblog-default"])[0].uid : config.destination[0].uid;

    const searchParams = new URLSearchParams(req.url.split('?')[1]);
    const editId = searchParams.get('id');
    const vid = searchParams.get('vid');
    let originalValue = '';

    const fetchingContents = await fetch(`https://micro.blog/notes/notebooks/${id}`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
    const eNotes = await fetchingContents.json();
    let deleteNote = '';
    let versions = '';
    let viewVersion = '';
    let isShared = false;

    if(vid){
        let fetching = await fetch(`https://micro.blog/notes/${editId}/versions`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
        const results = await fetching.json();
        const eNote = results.items.filter(v => v.id == vid)[0];        
        originalValue = eNote.content_text;
        viewVersion = `<p class="ml-2"><mark>Version #${vid}.</mark> Saving this note will override the current version.</p>`
    } else if(editId) {
        let fetching = await fetch(`https://micro.blog/notes/${editId}`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
        const eNote = await fetching.json();
        originalValue = eNote.content_text;
        isShared = eNote._microblog.is_shared;
        deleteNote = `<details class="mt-2" style="display: inline;">
            <summary class="p-2">Delete?</summary>
            <form class="p-2" method='POST' action='/note/delete' onsubmit="return confirm('Are you sure you want to delete this note? This action cannot be undone.')">
                <input type="hidden" name="id" value="${editId}" />
                <input type="hidden" name="notebookId" value="${id}" />
                <button type="submit" onclick="addLoading(this)" class="btn btn-sm mt-2">Delete Note</button>
            </form>
        </details>`;

        fetching = await fetch(`https://micro.blog/notes/${editId}/versions`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
        const results = await fetching.json();

        versions = results && results.items && results.items.length > 0 ? `<details class="mt-2 ml-2" style="display: inline;">
            <summary class="p-2">Versions</summary>
            <table class="table table-striped p-2">
            ${results.items.reverse().map((v, i) => `<tr>
                <td>${(new Date(v.date_published).toLocaleString('en-US', { timeZoneName: 'short' })).replace(' UTC','')}</td>
                <td><a rel="prefetch" href="/notes/${id}/update?id=${editId}&vid=${v.id}">${v.id}</a>${i == 0 ? ' (current)' : ''}</td>
            </tr>`).join('')}
            </table>
        </details>` : '';
    }

    const fetchingNotebooks = await fetch(`https://micro.blog/notes/notebooks`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
    const resultsNotebooks = await fetchingNotebooks.json();
    const notebooks = resultsNotebooks.items.sort((a,b) => (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0)).map((item,i) => {
        return `<li><a onclick="addLoading(this)" href="/notes/${item.id}" class="btn btn-link ${colors[i%11]} ${item.id == id ? borderColors[i%11] : ''}">${item.title}</a></li>`;
    }).join('');

    const content = _noteTemplate
        .replaceAll('{{id}}', id)
        .replaceAll('{{is_shared}}', isShared ? 'true' : 'false')
        .replaceAll('{{easyMDECSS}}', _easyMDECSS)
        .replaceAll('{{easyMDEJS}}', _easyMDEJS)
        .replaceAll('{{compressor}}', _compressor)
        .replaceAll('{{name}}', eNotes._microblog.notebook.name)
        .replaceAll('{{originalValue}}', originalValue)
        .replaceAll('{{editAppend}}', editId ? `form.append("id", ${editId}); ` : '')
        .replaceAll('{{editDelete}}', editId ?  deleteNote : '')
        .replaceAll('{{versions}}', editId ?  versions : '')
        .replaceAll('{{vid}}', vid ?  vid : '')
        .replaceAll('{{viewVersion}}', viewVersion)
        .replaceAll('{{breadcrumb}}', editId ?  'Update' : 'New')
        .replaceAll('{{mpDestination}}', defaultDestination)
    //: ${eNotes._microblog.notebook.name}
    return HTMLPage(token, `Note`, content, user, '', notebooks);
}