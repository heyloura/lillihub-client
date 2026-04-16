import { HTMLPage } from "./templates.js";
import { errorBanner } from "../scripts/server/utilities.js";

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
    const notebooks = items.sort((a, b) => a.title.localeCompare(b.title)).map(item => {
        return `<div class="card mt-2">
            <div class="card-header">
                <div class="card-header-scroll">
                    <div class="card-header-main">
                        <div class="tile">
                            <div class="tile-content">
                                <a href="/notes/${item.id}" class="tile-title">${item.title}</a>
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
                                        <input type="text" name="name" value="${item.title}" class="form-input" required />
                                        <button type="submit" class="btn btn-glossy btn-sm">Rename</button>
                                    </div>
                                </form>
                                <details>
                                    <summary class="btn btn-glossy btn-sm" style="list-style:none;"><i class="bi bi-trash"></i> Delete notebook</summary>
                                    <form action="/notebook/delete" method="POST" class="mt-2">
                                        <input type="hidden" name="notebook_id" value="${item.id}" />
                                        <p style="font-size:0.85rem;color:var(--overlay-1);">This will delete all notes in this notebook.</p>
                                        <button type="submit" class="btn btn-glossy btn-sm">Confirm Delete</button>
                                    </form>
                                </details>
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

    return HTMLPage(token, 'Notebooks', content, user);
}
