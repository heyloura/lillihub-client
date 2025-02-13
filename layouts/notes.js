import { HTMLPage } from "./templates.js";

const _noteTemplate = new TextDecoder().decode(await Deno.readFile("templates/_note.html"));
const _notesTemplate = new TextDecoder().decode(await Deno.readFile("templates/notes.html"));
const colors = ["green-text","greenblue-text", "blue-text", "bluepurple-text", "purple-text", "purplered-text", "red-text", "redorange-text", "orange-text", "orangeyellow-text", "yellowgreen-text"];
const borderColors = ["green-border","greenblue-border", "blue-border", "bluepurple-border", "purple-border", "purplered-border", "red-border", "redorange-border", "orange-border", "orangeyellow-border", "yellowgreen-border"];

export async function NotesTemplate(user, token, id) {
    const fetchingContents = await fetch(`https://micro.blog/notes/notebooks/${id}`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
    const eNotes = await fetchingContents.json();

    const notes = eNotes.items.map(item => {
        return _noteTemplate
            .replaceAll('{{content}}', item._microblog.is_shared ? `<div data-title="${item.date_published}" id="${item.id}" class="note clearfix mt-2">${item.content_html}</div>` : `<div data-title="${item.date_published}" id="${item.id}" class="note clearfix decryptMe mt-2">${item.content_text}</div>`)
            .replaceAll('{{publishedDate}}', item.date_modified)
            .replaceAll('{{modified}}', item.date_modified)
            .replaceAll('{{notebookId}}', id)
            .replaceAll('{{id}}', item.id)
            .replaceAll('{{is_shared_bool}}', item._microblog.is_shared)
            .replaceAll('{{is_shared}}', item._microblog.is_shared ? `<a target="_blank" href="${item._microblog.shared_url}" class="chip" style="text-decoration:none;"><i class="bi bi-share"></i> &nbsp;shared</a>` : '');
    }).join('');

    let notebooks = '';
    let notebooksRadio = '';
    try {
        const fetching = await fetch(`https://micro.blog/notes/notebooks`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
        const results = await fetching.json();
    
        notebooks = results.items.sort((a,b) => (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0)).map((item,i) => {
            return `<li><a onclick="addLoading(this)" href="/notes/${item.id}" class="btn btn-link ${colors[i%11]} ${item.id == id ? borderColors[i%11] : ''}">${item.title}</a></li>`;
        }).join('');

        notebooksRadio = results.items.sort((a,b) => (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0)).map((item,i) => {
            return `<label><input type="radio" ${item.id == id ? 'checked="checked"' : ''} value="${item.id}" name="notebooks[]" /> ${item.title}</label><br/>`;
        }).join('');
    } catch (error) {
        notebooks = `<li>Micro.blog returned ${error}</li>`
    }
 



    const content = _notesTemplate
        .replaceAll('{{id}}', id)
        .replaceAll('{{color}}', user.lillihub && user.lillihub.darktheme ? eNotes._microblog.notebook.colors.dark : eNotes._microblog.notebook.colors.light)
        .replaceAll('{{light}}', eNotes._microblog.notebook.colors.light)
        .replaceAll('{{dark}}', eNotes._microblog.notebook.colors.dark)
        .replaceAll('{{notes}}', notes)
        .replaceAll('{{notebooks}}', `<ul class="pl-0" style="list-style: none; font-size:small;">${notebooks}</ul>`)
        .replaceAll('{{radioList}}', notebooksRadio)

    return HTMLPage(token, 'Notes', content, user, '', `<li class="menuAction"><a class="btn btn-primary" onclick="addLoading(this)" href="/notes/${id}/update"><i class="bi bi-pencil-square"></i> New Note</a></li>` + notebooks);
}