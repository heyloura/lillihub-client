import { formatDate, errorBanner, fetchNotebooksList } from "../scripts/server/utilities.js";
import { HTMLPage } from "./templates.js";

const _noteTemplate = new TextDecoder().decode(await Deno.readFile("templates/notes/_note.html"));
const _notesTemplate = new TextDecoder().decode(await Deno.readFile("templates/notes/notes.html"));

export async function NotesTemplate(user, token, id, req) {
    const searchParams = new URLSearchParams(req.url.split('?')[1]);
    const tab = searchParams.get('tab') || 'notes';

    let eNotes;
    let notebooks = [];
    try {
        const [notebookRes, notebooksList] = await Promise.all([
            fetch(`https://micro.blog/notes/notebooks/${id}`, { method: "GET", headers: { "Authorization": "Bearer " + token } }),
            fetchNotebooksList(token)
        ]);
        eNotes = await notebookRes.json();
        notebooks = notebooksList;
    } catch (err) {
        console.log(`notes fetch failed for notebook ${id} (${user.username}): ${err?.message || err}`);
        return HTMLPage(token, 'Notes', `<p class="container p-2">Could not load notes right now. Please try again.</p>`, user);
    }

    const items = Array.isArray(eNotes?.items) ? eNotes.items : [];
    const notes = items.map(item => {
        return _noteTemplate
            .replaceAll('{{content}}', item._microblog.is_shared
                ? `<div data-title="${item.date_published}" id="${item.id}" class="note clearfix">${item.content_html}</div>`
                : `<div data-title="${item.date_published}" id="${item.id}" class="note clearfix decryptMe">${item.content_text}</div>`)
            .replaceAll('{{formattedDate}}', formatDate(item.date_modified))
            .replaceAll('{{notebookId}}', id)
            .replaceAll('{{id}}', item.id)
            .replaceAll('{{is_shared}}', item._microblog.is_shared
                ? `<a target="_blank" href="${item._microblog.shared_url}" class="chip" style="text-decoration:none;"><i class="bi bi-share"></i> shared</a>`
                : '');
    }).join('');

    // Build error banner from `?error=...` redirect param (set by note/notebook
    // mutation handlers in main.js on write failure). Close link preserves the
    // current tab so dismissing doesn't bounce the user off their view.
    const errorParam = searchParams.get('error');
    const closeHref = `/notes/${id}${tab === 'todos' ? '?tab=todos' : ''}`;
    const banner = errorBanner(errorParam, closeHref);

    const content = _notesTemplate
        .replaceAll('{{notes}}', notes)
        .replaceAll('{{notebookId}}', id)
        .replaceAll('{{notesActive}}', tab === 'notes' ? 'active' : '')
        .replaceAll('{{todosActive}}', tab === 'todos' ? 'active' : '')
        .replaceAll('{{tab}}', tab)
        .replaceAll('{{errorBanner}}', banner)
        .replaceAll('{{notebooksJson}}', JSON.stringify(notebooks).replace(/</g, '\\u003c'));

    const notebookName = eNotes?._microblog?.notebook?.name || 'Notebook';
    return HTMLPage(token, 'Notes', content, user, '', undefined, { notebookId: id, notebookName, tab, notebooks });
}
