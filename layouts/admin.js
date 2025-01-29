
import { HTMLPage } from "./templates.js";

export function AdminTemplate(user) {
    //const kv = await Deno.openKv();

    return HTMLPage(token, `Admin`, 'Hello World');
}