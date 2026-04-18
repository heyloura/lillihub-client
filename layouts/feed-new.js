import { HTMLPage } from "./templates.js";

const _feedNewTemplate = new TextDecoder().decode(await Deno.readFile("templates/feeds/feed-new.html"));

export async function FeedNewTemplate(user, token) {
    return HTMLPage(token, 'Feeds', _feedNewTemplate, user);
}
