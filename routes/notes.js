// Notes routes — notebooks list, notebook view, note view/edit/new, todos,
// plus all add/delete/rename/copy/move mutations.
import { NotebooksTemplate } from "../layouts/notebooks.js";
import { NotesTemplate } from "../layouts/notes.js";
import { NoteTemplate } from "../layouts/note.js";
import { NoteViewTemplate } from "../layouts/note-view.js";
import { NoteNewTemplate } from "../layouts/note-new.js";
import { HTMLPage } from "../layouts/templates.js";

const NOTEBOOKS_ROUTE = new URLPattern({ pathname: "/notes" });
const NOTEBOOK_NEW_ROUTE = new URLPattern({ pathname: "/notebook/new" });
const NOTES_ROUTE = new URLPattern({ pathname: "/notes/:id" });
const NEW_NOTE_ROUTE = new URLPattern({ pathname: "/notes/:id/new" });
const VIEW_NOTE_ROUTE = new URLPattern({ pathname: "/notes/:notebookId/:noteId" });
const UPDATE_NOTES_ROUTE = new URLPattern({ pathname: "/notes/:id/update" });

const ADD_NOTE = new URLPattern({ pathname: "/note/update" });
const DELETE_NOTE = new URLPattern({ pathname: "/note/delete" });
const ADD_NOTEBOOK = new URLPattern({ pathname: "/notebook/add" });
const RENAME_NOTEBOOK = new URLPattern({ pathname: "/notebook/rename" });
const DELETE_NOTEBOOK = new URLPattern({ pathname: "/notebook/delete" });
const MOVE_NOTE = new URLPattern({ pathname: "/notes/notebook/move" });
const COPY_NOTE = new URLPattern({ pathname: "/notes/notebook/copy" });

export async function tryHandle(req, ctx) {
    const { user, accessTokenValue } = ctx;

    /********************************************************
     * Read routes
     ********************************************************/

    if (NOTEBOOKS_ROUTE.exec(req.url) && user) {
        return new Response(await NotebooksTemplate(user, accessTokenValue, req), {
            status: 200,
            headers: { "content-type": "text/html" },
        });
    }

    if (NOTEBOOK_NEW_ROUTE.exec(req.url) && user) {
        const content = new TextDecoder().decode(await Deno.readFile("templates/notes/notebook-new.html"));
        return new Response(await HTMLPage(accessTokenValue, 'Notebooks', content, user), {
            status: 200,
            headers: { "content-type": "text/html" },
        });
    }

    if (NOTES_ROUTE.exec(req.url) && user) {
        const id = NOTES_ROUTE.exec(req.url).pathname.groups.id;
        return new Response(await NotesTemplate(user, accessTokenValue, id, req), {
            status: 200,
            headers: { "content-type": "text/html" },
        });
    }

    if (UPDATE_NOTES_ROUTE.exec(req.url) && user) {
        const id = UPDATE_NOTES_ROUTE.exec(req.url).pathname.groups.id;
        const searchParams = new URLSearchParams(req.url.split('?')[1]);
        const editId = searchParams.get('id');

        // No editId means "new note" — redirect to the dedicated new note page
        if (!editId) {
            return new Response(null, {
                status: 303,
                headers: { "Location": `/notes/${id}/new` },
            });
        }

        return new Response(await NoteTemplate(user, accessTokenValue, id, req), {
            status: 200,
            headers: { "content-type": "text/html" },
        });
    }

    if (NEW_NOTE_ROUTE.exec(req.url) && user) {
        const id = NEW_NOTE_ROUTE.exec(req.url).pathname.groups.id;
        const searchParams = new URLSearchParams(req.url.split('?')[1]);
        const tab = searchParams.get('tab') || 'notes';

        return new Response(await NoteNewTemplate(user, accessTokenValue, id, tab), {
            status: 200,
            headers: { "content-type": "text/html" },
        });
    }

    if (VIEW_NOTE_ROUTE.exec(req.url) && user) {
        const { notebookId, noteId } = VIEW_NOTE_ROUTE.exec(req.url).pathname.groups;
        const viewParams = new URLSearchParams(req.url.split('?')[1]);
        const isTodo = viewParams.get('type') === 'todo';

        return new Response(await NoteViewTemplate(user, accessTokenValue, notebookId, noteId, isTodo), {
            status: 200,
            headers: { "content-type": "text/html" },
        });
    }

    /********************************************************
     * Mutation routes
     ********************************************************/

    if (ADD_NOTE.exec(req.url) && user) {
        const value = await req.formData();
        const text = value.get('text');
        const notebook_id = value.get('notebook_id');
        const id = value.get('id');

        const form = new URLSearchParams();
        form.append("text", text);
        form.append("notebook_id", notebook_id);

        if (id) {
            form.append("id", id);
        }

        let writeFailed = false;
        try {
            const posting = await fetch('https://micro.blog/notes', {
                method: "POST",
                body: form.toString(),
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
                    "Authorization": "Bearer " + accessTokenValue
                }
            });
            if (!posting.ok) {
                writeFailed = true;
                console.log(`${user.username} tried to ${id ? 'update' : 'add'} a note in notebook ${notebook_id} and ${await posting.text()}`);
            }
        } catch (err) {
            writeFailed = true;
            console.log(`${user.username} tried to ${id ? 'update' : 'add'} a note in notebook ${notebook_id} and fetch failed: ${err?.message || err}`);
        }

        const dest = `/notes/${notebook_id}${writeFailed ? '?error=failed' : ''}`;
        return Response.redirect(new URL(dest, req.url).href, 303);
    }

    if (DELETE_NOTE.exec(req.url) && user) {
        const value = await req.formData();
        const id = value.get('id');
        const notebookId = value.get('notebookId');

        let writeFailed = false;
        try {
            const posting = await fetch(`https://micro.blog/notes/${id}`, {
                method: "DELETE",
                headers: { "Authorization": "Bearer " + accessTokenValue }
            });
            if (!posting.ok) {
                writeFailed = true;
                console.log(`${user.username} tried to delete note ${id} and ${await posting.text()}`);
            }
        } catch (err) {
            writeFailed = true;
            console.log(`${user.username} tried to delete note ${id} and fetch failed: ${err?.message || err}`);
        }

        const dest = `/notes/${notebookId}${writeFailed ? '?error=failed' : ''}`;
        return Response.redirect(new URL(dest, req.url).href, 303);
    }

    if (ADD_NOTEBOOK.exec(req.url) && user) {
        const value = await req.formData();
        const name = value.get('name');

        const form = new URLSearchParams();
        form.append("name", name);

        let writeFailed = false;
        try {
            const posting = await fetch('https://micro.blog/notes/notebooks', {
                method: "POST",
                body: form.toString(),
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
                    "Authorization": "Bearer " + accessTokenValue
                }
            });
            if (!posting.ok) {
                writeFailed = true;
                console.log(`${user.username} tried to add notebook "${name}" and ${await posting.text()}`);
            }
        } catch (err) {
            writeFailed = true;
            console.log(`${user.username} tried to add notebook "${name}" and fetch failed: ${err?.message || err}`);
        }

        const dest = `/notes${writeFailed ? '?error=failed' : ''}`;
        return Response.redirect(new URL(dest, req.url).href, 303);
    }

    if (RENAME_NOTEBOOK.exec(req.url) && user) {
        const value = await req.formData();
        const name = value.get('name');
        const notebook_id = value.get('notebook_id');

        const form = new URLSearchParams();
        form.append("name", name);
        form.append("id", notebook_id);

        let writeFailed = false;
        try {
            const posting = await fetch('https://micro.blog/notes/notebooks', {
                method: "POST",
                body: form.toString(),
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
                    "Authorization": "Bearer " + accessTokenValue
                }
            });
            if (!posting.ok) {
                writeFailed = true;
                console.log(`${user.username} tried to rename notebook ${notebook_id} to "${name}" and ${await posting.text()}`);
            }
        } catch (err) {
            writeFailed = true;
            console.log(`${user.username} tried to rename notebook ${notebook_id} to "${name}" and fetch failed: ${err?.message || err}`);
        }

        const dest = `/notes${writeFailed ? '?error=failed' : ''}`;
        return Response.redirect(new URL(dest, req.url).href, 303);
    }

    if (DELETE_NOTEBOOK.exec(req.url) && user) {
        const value = await req.formData();
        const notebook_id = value.get('notebook_id');

        let writeFailed = false;
        try {
            const posting = await fetch('https://micro.blog/notes/notebooks/' + notebook_id, {
                method: "DELETE",
                headers: { "Authorization": "Bearer " + accessTokenValue }
            });
            if (!posting.ok) {
                writeFailed = true;
                console.log(`${user.username} tried to delete notebook ${notebook_id} and ${await posting.text()}`);
            }
        } catch (err) {
            writeFailed = true;
            console.log(`${user.username} tried to delete notebook ${notebook_id} and fetch failed: ${err?.message || err}`);
        }

        const dest = `/notes${writeFailed ? '?error=failed' : ''}`;
        return Response.redirect(new URL(dest, req.url).href, 303);
    }

    if (COPY_NOTE.exec(req.url) && user) {
        const value = await req.formData();
        const notebook = value.get('notebook');
        const id = value.get('id');

        let writeFailed = false;
        try {
            // Fetch the source note content
            const fetching = await fetch(`https://micro.blog/notes/${id}`, { method: "GET", headers: { "Authorization": "Bearer " + accessTokenValue } });
            const eNote = await fetching.json();

            if (!eNote || typeof eNote.content_text !== 'string') {
                writeFailed = true;
                console.log(`${user.username} tried to copy note ${id} but source note had no content_text`);
            } else {
                const formBody = new URLSearchParams();
                formBody.append("notebook_id", notebook);
                formBody.append("text", eNote.content_text);

                const posting = await fetch('https://micro.blog/notes', {
                    method: "POST",
                    body: formBody.toString(),
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
                        "Authorization": "Bearer " + accessTokenValue
                    }
                });
                if (!posting.ok) {
                    writeFailed = true;
                    console.log(`${user.username} tried to copy note ${id} to notebook ${notebook} and ${await posting.text()}`);
                }
            }
        } catch (err) {
            writeFailed = true;
            console.log(`${user.username} tried to copy note ${id} to notebook ${notebook} and fetch failed: ${err?.message || err}`);
        }

        const dest = `/notes/${notebook}${writeFailed ? '?error=failed' : ''}`;
        return Response.redirect(new URL(dest, req.url).href, 303);
    }

    if (MOVE_NOTE.exec(req.url) && user) {
        const value = await req.formData();
        const notebook = value.get('notebook[]');
        const id = value.get('id');

        // Move = GET source, POST copy in target, DELETE source.
        // Failure modes tracked distinctly so we can warn the user when a
        // partial failure leaves duplicates behind.
        let errorCode = null;
        try {
            // 1) Fetch the source note content
            const fetching = await fetch(`https://micro.blog/notes/${id}`, { method: "GET", headers: { "Authorization": "Bearer " + accessTokenValue } });
            const eNote = await fetching.json();

            if (!eNote || typeof eNote.content_text !== 'string') {
                errorCode = 'failed';
                console.log(`${user.username} tried to move note ${id} but source had no content_text`);
            } else {
                // 2) Create copy in target notebook
                const formBody = new URLSearchParams();
                formBody.append("notebook_id", notebook);
                formBody.append("text", eNote.content_text);

                const posting = await fetch('https://micro.blog/notes', {
                    method: "POST",
                    body: formBody.toString(),
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
                        "Authorization": "Bearer " + accessTokenValue
                    }
                });

                if (!posting.ok) {
                    errorCode = 'failed';
                    console.log(`${user.username} tried to move note ${id} to notebook ${notebook} — create copy failed: ${await posting.text()}`);
                } else {
                    // 3) Delete the original. Only runs if the copy succeeded.
                    // If this fails, the user has duplicates — flag specifically.
                    try {
                        const deleting = await fetch(`https://micro.blog/notes/${id}`, {
                            method: "DELETE",
                            headers: { "Authorization": "Bearer " + accessTokenValue }
                        });
                        if (!deleting.ok) {
                            errorCode = 'move_duplicate';
                            console.log(`${user.username} moved note ${id} to notebook ${notebook} but deleting original failed: ${await deleting.text()}`);
                        }
                    } catch (delErr) {
                        errorCode = 'move_duplicate';
                        console.log(`${user.username} moved note ${id} to notebook ${notebook} but delete fetch failed: ${delErr?.message || delErr}`);
                    }
                }
            }
        } catch (err) {
            errorCode = 'failed';
            console.log(`${user.username} tried to move note ${id} to notebook ${notebook} and fetch failed: ${err?.message || err}`);
        }

        const dest = `/notes/${notebook}${errorCode ? `?error=${errorCode}` : ''}`;
        return Response.redirect(new URL(dest, req.url).href, 303);
    }

    return null;
}
