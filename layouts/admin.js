
import { HTMLPage } from "./templates.js";

export async function AdminTemplate(user, token) {
    const kv = await Deno.openKv();
    const allEntries = await Array.fromAsync(kv.list({prefix:[]}));

    let global = '';
    let timeline = '';
    let conversation = '';
    let old = '';
    for (const entry of allEntries) {
        if(entry.key[1] == "timeline") {
            timeline += `<tr>
                <td><input type="checkbox" name="entry[]" value="${JSON.stringify(entry.key)}" /></td>
                <td><a href="/user/${entry.key[0]}">${entry.key[0]}</a></td>
                <td>${JSON.stringify(entry.value.viewed)}</td>
            </tr>`;
        } else if(entry.key[1] == "conversation") {
            conversation += `<tr>
                <td><input type="checkbox" name="entry[]" value="${JSON.stringify(entry.key)}" /></td>
                <td><a href="/user/${entry.key[0]}">${entry.key[0]}</a></td>
                <td>${JSON.stringify(entry.value.viewed)}</td>
            </tr>`;
        } else if(entry.key[1] == "global") {
            global += `<tr>
                <td><input type="checkbox" name="entry[]" value="${JSON.stringify(entry.key)}" /></td>
                <td><a href="/user/${entry.key[0]}">${entry.key[0]}</a></td>
                <td>${JSON.stringify(entry.value.favorites)}</td>
                <td>${JSON.stringify(entry.value.feed)}</td>
                <td>${JSON.stringify(entry.value.display)}</td>
            </tr>`;
        } else {
            old += `<tr>
                <td><input type="checkbox" name="entry[]" value="${JSON.stringify(entry.key)}" /></td>
                <td><a href="/user/${entry.key[0]}">${entry.key[0]}</a></td>
            </tr>`;
        }

    }

    return HTMLPage(token, `Admin`, `<h1>Timeline</h1><table class="table">${timeline}</table>
        <h1>Global</h1><table class="table">${global}</table>
        <h1>Conversation</h1><table class="table">${conversation}</table>
        <h1>Old</h1><table class="table">${old}</table>`, user);
}