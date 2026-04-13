import { formatDate } from "../scripts/server/utilities.js";
import { HTMLPage } from "./templates.js";

const _noteViewTemplate = new TextDecoder().decode(await Deno.readFile("templates/notes/note-view.html"));
const _todoViewTemplate = new TextDecoder().decode(await Deno.readFile("templates/notes/note-view-todo.html"));

export async function NoteViewTemplate(user, token, notebookId, noteId, isTodo) {
    const headers = { "Authorization": "Bearer " + token };
    const [noteRes, notebookRes, versionsRes] = await Promise.all([
        fetch(`https://micro.blog/notes/${noteId}`, { method: "GET", headers }),
        fetch(`https://micro.blog/notes/notebooks/${notebookId}`, { method: "GET", headers }),
        fetch(`https://micro.blog/notes/${noteId}/versions`, { method: "GET", headers })
    ]);

    const note = await noteRes.json();
    const notebook = await notebookRes.json();
    const versions = await versionsRes.json();

    const isShared = note._microblog?.is_shared || false;

    const sharedChip = isShared
        ? `<a target="_blank" href="${note._microblog.shared_url}" class="chip" style="text-decoration:none;"><i class="bi bi-share"></i> shared</a>`
        : '';

    // Build versions button
    let versionsButton = '';
    if (versions?.items?.length > 0) {
        versionsButton = `<details style="display:inline;">
            <summary class="btn btn-glossy-orange btn-sm" style="list-style:none;"><i class="bi bi-clock-history"></i> Versions</summary>
            <div class="mt-2 mb-2">
                ${versions.items.reverse().map((v, i) => `<p>
                    <a href="/notes/${notebookId}/update?id=${noteId}&vid=${v.id}">${formatDate(v.date_published)}</a>${i === 0 ? ' (current)' : ''}
                </p>`).join('')}
            </div>
        </details>`;
    }

    const template = isTodo ? _todoViewTemplate : _noteViewTemplate;

    const content = template
        .replaceAll('{{notebookId}}', notebookId)
        .replaceAll('{{noteId}}', noteId)
        .replaceAll('{{notebookName}}', notebook._microblog?.notebook?.name || 'Notebook')
        .replaceAll('{{formattedDate}}', formatDate(note.date_modified))
        .replaceAll('{{content}}', isShared ? note.content_html : note.content_text)
        .replaceAll('{{decryptClass}}', isShared ? '' : 'decryptMe')
        .replaceAll('{{is_shared}}', isShared ? 'true' : 'false')
        .replaceAll('{{sharedChip}}', sharedChip)
        .replaceAll('{{versionsButton}}', versionsButton)
        .replaceAll('{{versionsPanel}}', '');

    const notebookName = notebook._microblog?.notebook?.name || 'Notebook';
    return HTMLPage(token, 'Note', content, user, '', undefined, { notebookId, notebookName });
}
