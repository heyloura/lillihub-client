import { HTMLPage } from "./templates.js";

const _noteTemplate = new TextDecoder().decode(await Deno.readFile("templates/note.html"));
const _easyMDEJS = await Deno.readTextFile("scripts/client/easymde.min.js");
const _easyMDECSS = await Deno.readTextFile("styles/easymde.min.css");

export async function NoteTemplate(user, token, id, req) {
    if(req.url.includes('%3Ca%20href=')){
        console.log('huh?')
        return;
    }

    const searchParams = new URLSearchParams(req.url.split('?')[1]);
    const editId = searchParams.get('id');
    const vid = searchParams.get('vid');
    let originalValue = '';

    const fetchingContents = await fetch(`https://micro.blog/notes/notebooks/${id}`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
    const eNotes = await fetchingContents.json();
    let deleteNote = '';
    let versions = '';
    let viewVersion = '';

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

        deleteNote = `<details class="mt-2" style="display: inline;">
            <summary class="p-2">Delete?</summary>
            <form class="p-2" method='POST' action='/note/delete'>
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

    const content = _noteTemplate
        .replaceAll('{{id}}', id)
        .replaceAll('{{easyMDECSS}}', _easyMDECSS)
        .replaceAll('{{easyMDEJS}}', _easyMDEJS)
        .replaceAll('{{name}}', eNotes._microblog.notebook.name)
        .replaceAll('{{originalValue}}', originalValue)
        .replaceAll('{{editAppend}}', editId ? `form.append("id", ${editId}); ` : '')
        .replaceAll('{{editDelete}}', editId ?  deleteNote : '')
        .replaceAll('{{versions}}', editId ?  versions : '')
        .replaceAll('{{viewVersion}}', viewVersion)
        .replaceAll('{{breadcrumb}}', editId ?  'Update' : 'New')

    return HTMLPage(`Note: ${eNotes._microblog.notebook.name}`, content, user);
}