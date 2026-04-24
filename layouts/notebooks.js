import { HTMLPage } from "./templates.js";
import { errorBanner, escapeHtml } from "../scripts/server/utilities.js";

const _notebooksTemplate = new TextDecoder().decode(await Deno.readFile("templates/notes/notebooks.html"));

export async function NotebooksTemplate(user, token, req) {
    let results;
    try {
        const fetching = await fetch(`https://micro.blog/notes/notebooks`, { method: "GET", headers: { "Authorization": "Bearer " + token } });
        results = await fetching.json();
    } catch (err) {
        console.log(`notebooks fetch failed for ${user?.username}: ${err?.message || err}`);
        return HTMLPage(token, 'Notebooks', `<p class="container p-2">Could not load notebooks right now. Please try again.</p>`, user);
    }

    const items = Array.isArray(results?.items) ? results.items : [];
    const sortedItems = items.sort((a, b) => a.title.localeCompare(b.title));
    const notebooksList = sortedItems.map(item => ({ id: item.id, title: item.title }));
    const notebooks = sortedItems.map(item => {
        const titleText = escapeHtml(item.title);
        const titleAttr = escapeHtml(item.title);
        return `<div class="card mt-2 notebook-card" data-notebook-id="${item.id}">
            <div class="card-header">
                <div class="card-header-scroll">
                    <div class="card-header-main">
                        <div class="tile">
                            <div class="tile-content">
                                <a href="/notes/${item.id}" class="tile-title">${titleText}</a>
                            </div>
                        </div>
                    </div>
                    <div class="card-header-actions btn-group">
                        <div class="dropdown dropdown-right">
                            <a class="btn btn-glossy btn-sm dropdown-toggle" tabindex="0"><i class="bi bi-three-dots-vertical"></i></a>
                            <ul class="menu" style="min-width:200px; padding:0.5rem;">
                                <form action="/notebook/rename" method="POST" class="mb-2">
                                    <input type="hidden" name="notebook_id" value="${item.id}" />
                                    <div class="input-group">
                                        <input type="text" name="name" value="${titleAttr}" class="form-input" required />
                                        <button type="submit" class="btn btn-glossy btn-sm">Rename</button>
                                    </div>
                                </form>
                                <form action="/notebook/delete" method="POST" class="mt-2" onsubmit="return confirm('Delete this notebook and all its notes?')">
                                    <input type="hidden" name="notebook_id" value="${item.id}" />
                                    <button type="submit" class="btn btn-glossy btn-sm"><i class="bi bi-trash"></i> Delete notebook</button>
                                </form>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    }).join('');

    // Build error banner from `?error=...` redirect param set by add/rename/delete
    // notebook handlers in main.js on write failure.
    const searchParams = new URLSearchParams(req?.url?.split('?')[1] || '');
    const banner = errorBanner(searchParams.get('error'), '/notes');

    const content = _notebooksTemplate
        .replaceAll('{{notebooks}}', notebooks)
        .replaceAll('{{errorBanner}}', banner);

    return HTMLPage(token, 'Notebooks', content, user, '', undefined, { notebooks: notebooksList });
}
