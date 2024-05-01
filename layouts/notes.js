import { HTMLPage } from "./templates.js";

const _noteTemplate = new TextDecoder().decode(await Deno.readFile("templates/_note.html"));
const _notesTemplate = new TextDecoder().decode(await Deno.readFile("templates/notes.html"));

export async function NotesTemplate(user, token, id) {
    const fetchingContents = await fetch(`https://micro.blog/notes/notebooks/${id}`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
    const eNotes = await fetchingContents.json();

    const notes = eNotes.items.map(item => {
        return _noteTemplate
            .replaceAll('{{content}}', `<div onclick="window.location.href = '/notes/${id}/update?id=${item.id}'" class="clearfix decryptMe">${item.content_text}</div>`)
            .replaceAll('{{publishedDate}}', item.date_modified)
            .replaceAll('{{modified}}', item.date_modified)
            .replaceAll('{{is_shared}}', item._microblog.is_shared ? '<i class="bi bi-share"></i> shared' : '');
    }).join('');

    const content = _notesTemplate
        .replaceAll('{{id}}', id)
        .replaceAll('{{color}}', user.lillihub && user.lillihub.darktheme ? eNotes._microblog.notebook.colors.dark : eNotes._microblog.notebook.colors.light)
        .replaceAll('{{light}}', eNotes._microblog.notebook.colors.light)
        .replaceAll('{{dark}}', eNotes._microblog.notebook.colors.dark)
        .replaceAll('{{notes}}', notes)

    return HTMLPage('Notes', content, user);
}