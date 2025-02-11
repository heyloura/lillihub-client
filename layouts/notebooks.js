import { HTMLPage } from "./templates.js";

const _notebooksTemplate = new TextDecoder().decode(await Deno.readFile("templates/notebooks.html"));
const colors = ["green-text","greenblue-text", "blue-text", "bluepurple-text", "purple-text", "purplered-text", "red-text", "redorange-text", "orange-text", "orangeyellow-text", "yellowgreen-text"];

export async function NotebooksTemplate(user, token) {
    const fetching = await fetch(`https://micro.blog/notes/notebooks`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
    const results = await fetching.json();

    const notebooks = results.items.sort((a,b) => (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0)).map((item,i) => {
        return `
        <li>
            <a class="btn text-left btn-link ${colors[i%11]}" onclick="addLoading(this)" href="/notes/${item.id}">${item.title}</a>
            <div class="dropdown dropdown-right"><button class="btn btn-link dropdown-toggle" tabindex="0"><i class="bi bi-three-dots-vertical"></i></button>
                <ul class="menu text-left">
                    <li class="menu-item"><a onclick="rename(${item.id},'${item.title}')" href="javascript:void(0)">Rename</a></li>
                    <li class="menu-item"><a onclick="if(confirm('Are you sure you want to delete this notebook? It will also delete <b>all</b> notes this notebook contains. This action cannot be undone.')){deleteConfirmed(${item.id})}" class="red-text" href="javascript:void(0)">Delete</a></li>
                </ul>
            </div>
        </li>`;
    }).join('');

    const content = _notebooksTemplate
        .replaceAll('{{notebooks}}', notebooks)

    return HTMLPage(token, 'Notebooks', content, user, '', notebooks);
}