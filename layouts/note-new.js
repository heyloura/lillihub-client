import { fetchNotebooksList } from "../scripts/server/utilities.js";
import { HTMLPage } from "./templates.js";

const _noteEditTemplate = new TextDecoder().decode(await Deno.readFile("templates/notes/note-edit.html"));

export async function NoteNewTemplate(user, token, notebookId, tab) {
    const [notebookRes, notebooks] = await Promise.all([
        fetch(`https://micro.blog/notes/notebooks/${notebookId}`, { method: "GET", headers: { "Authorization": "Bearer " + token } }),
        fetchNotebooksList(token)
    ]);
    const notebook = await notebookRes.json();

    const notebookName = notebook._microblog?.notebook?.name || 'Notebook';
    const noteType = tab === 'todos' ? 'todo.txt' : '';

    const content = _noteEditTemplate
        .replaceAll('{{notebookId}}', notebookId)
        .replaceAll('{{is_shared}}', 'false')
        .replaceAll('{{originalValue}}', '')
        .replaceAll('{{editAppend}}', '')
        .replaceAll('{{noteType}}', noteType)
        .replaceAll('{{todoSelected}}', noteType === 'todo.txt' ? 'selected' : '')
        .replaceAll('{{vid}}', '')
        .replaceAll('{{viewVersion}}', '');

    return HTMLPage(token, 'Note', content, user, '', undefined, { notebookId, notebookName, notebooks });
}
