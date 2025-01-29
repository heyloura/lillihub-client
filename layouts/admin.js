
import { HTMLPage } from "./templates.js";

export function AdminTemplate(user, token) {
    const kv = await Deno.openKv();
    const allEntries = await Array.fromAsync(kv.list({prefix:[]}));

    let results = '';
    for (const entry of allEntries) {
        results += `<li>${entry.key}: ${entry.value}</li>`;
    }

    return HTMLPage(token, `Admin`, `<ul>${results}</ul>`);
}