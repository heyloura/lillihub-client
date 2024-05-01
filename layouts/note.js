import { HTMLPage } from "./templates.js";

const _noteTemplate = new TextDecoder().decode(await Deno.readFile("templates/note.html"));
const _easyMDEJS = await Deno.readTextFile("scripts/client/easymde.min.js");
const _easyMDECSS = await Deno.readTextFile("styles/easymde.min.css");

export async function NoteTemplate(user, token, id, req) {
    const searchParams = new URLSearchParams(req.url.split('?')[1]);
    const editId = searchParams.get('id');
    let originalValue = '';

    const fetchingContents = await fetch(`https://micro.blog/notes/notebooks/${id}`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
    const eNotes = await fetchingContents.json();
    let deleteNote = '';

    if(editId) {
        const fetching = await fetch(`https://micro.blog/notes/${editId}`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
        const eNote = await fetching.json();
        originalValue = eNote.content_text;

        deleteNote = `<details class="mt-2" style="display: inline;">
            <summary>Delete?</summary>
            <form method='POST' action='/note/delete'>
                <input type="hidden" name="id" value="${editId}" />
                <input type="hidden" name="notebookId" value="${id}" />
                <button type="submit" onclick="addLoading(this)" class="btn btn-sm mt-2">Delete Note</button>
            </form>
        </details>`;
    }

    const content = _noteTemplate
        .replaceAll('{{id}}', id)
        .replaceAll('{{easyMDECSS}}', _easyMDECSS)
        .replaceAll('{{easyMDEJS}}', _easyMDEJS)
        .replaceAll('{{name}}', eNotes._microblog.notebook.name)
        .replaceAll('{{originalValue}}', originalValue)
        .replaceAll('{{editAppend}}', editId ? `form.append("id", ${editId}); ` : '')
        .replaceAll('{{editDelete}}', editId ?  deleteNote : '')

    return HTMLPage(`Note: ${eNotes._microblog.notebook.name}`, content, user);
}