
import { HTMLPage } from "./templates.js";

export async function AdminTemplate(user, token) {
    const kv = await Deno.openKv();
    const allEntries = await Array.fromAsync(kv.list({prefix:[]}));

    let results = '';
    for (const entry of allEntries) {
        results += `<tr><td>${entry.key}</td><td>${JSON.stringify(entry.value)}</td></tr>`;
    }

    return HTMLPage(token, `Admin`, `<table class="table">${results}</table>`, user);
}