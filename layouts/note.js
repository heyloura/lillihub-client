import { HTMLPage } from "./templates.js";

const _noteEditTemplate = new TextDecoder().decode(await Deno.readFile("templates/notes/note-edit.html"));

export async function NoteTemplate(user, token, id, req) {
    if(req.url.includes('%3Ca%20href=')) {
        return;
    }

    const searchParams = new URLSearchParams(req.url.split('?')[1]);
    const editId = searchParams.get('id');
    const vid = searchParams.get('vid');
    let originalValue = '';
    let viewVersion = '';
    let isShared = false;

    const headers = { "Authorization": "Bearer " + token };
    const notebookRes = await fetch(`https://micro.blog/notes/notebooks/${id}`, { method: "GET", headers });
    const eNotes = await notebookRes.json();

    if(vid) {
        const versionsRes = await fetch(`https://micro.blog/notes/${editId}/versions`, { method: "GET", headers });
        const results = await versionsRes.json();
        const eNote = results.items.filter(v => v.id == vid)[0];
        originalValue = eNote.content_text;
        viewVersion = `<p class="mt-2"><mark>Version #${vid}.</mark> Saving this note will override the current version.</p>`;
    } else if(editId) {
        const noteRes = await fetch(`https://micro.blog/notes/${editId}`, { method: "GET", headers });
        const eNote = await noteRes.json();
        originalValue = eNote.content_text;
        isShared = eNote._microblog.is_shared;
    }

    const content = _noteEditTemplate
        .replaceAll('{{notebookId}}', id)
        .replaceAll('{{is_shared}}', isShared ? 'true' : 'false')
        .replaceAll('{{originalValue}}', originalValue)
        .replaceAll('{{editAppend}}', editId ? `form.append("id", ${editId});` : '')
        .replaceAll('{{noteType}}', '')
        .replaceAll('{{vid}}', vid ? vid : '')
        .replaceAll('{{viewVersion}}', viewVersion);

    const notebookName = eNotes._microblog?.notebook?.name || 'Notebook';
    return HTMLPage(token, 'Note', content, user, '', undefined, { notebookId: id, notebookName });
}
