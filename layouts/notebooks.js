import { HTMLPage } from "./templates.js";

const _notebooksTemplate = new TextDecoder().decode(await Deno.readFile("templates/notebooks.html"));
const colors = ["green-text","greenblue-text", "blue-text", "bluepurple-text", "purple-text", "purplered-text", "red-text", "redorange-text", "orange-text", "orangeyellow-text", "yellow-text", "yellowgreen-text"];
const borderColors = ["green-border","greenblue-border", "blue-border", "bluepurple-border", "purple-border", "purplered-border", "red-border", "redorange-border", "orange-border", "orangeyellow-border", "yellow-border", "yellowgreen-border"];

export async function NotebooksTemplate(user, token) {
    const fetching = await fetch(`https://micro.blog/notes/notebooks`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
    const results = await fetching.json();

    const notebooks = results.items.sort((a,b) => (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0)).map((item,i) => {
        return `<li><a class="btn btn-link ${colors[i%12]}" onclick="addLoading(this)" href="/notes/${item.id}">${item.title}</a></li>`;
    }).join('');

    const content = _notebooksTemplate
        .replaceAll('{{notebooks}}', notebooks)

    return HTMLPage('Notebooks', content, user, '', content);
}