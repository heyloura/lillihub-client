import { HTMLPage } from "./templates.js";

const _notebooksTemplate = new TextDecoder().decode(await Deno.readFile("templates/notebooks.html"));

export async function NotebooksTemplate(user, token) {
    const fetching = await fetch(`https://micro.blog/notes/notebooks`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
    const results = await fetching.json();

    const notebooks = results.items.sort((a,b) => (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0)).map((item) => {
        return `<li><a onclick="addLoading(this)" href="/notes/${item.id}">${item.title}</a></li>`;
    }).join('');

    const content = _notebooksTemplate
        .replaceAll('{{notebooks}}', notebooks)

    return HTMLPage('Notebooks', content, user);
}