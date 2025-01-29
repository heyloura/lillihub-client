
import { HTMLPage } from "./templates.js";

export async function AdminTemplate(user, token) {
    const kv = await Deno.openKv();
    const allEntries = await Array.fromAsync(kv.list({prefix:[]}));

    let results = '';
    for (const entry of allEntries) {
        results += `<tr>
            <td><input type="checkbox" name="entry[]" value="${entry.key}" /></td>
            <td>${entry.key.split(',')[0]}</td>
            <td>${entry.key.split(',')[1]}</td>
            <td>${JSON.stringify(entry.value.viewed)}</td>
        </tr>`;
    }

    return HTMLPage(token, `Admin`, `<table class="table">${results}</table>`, user);
}