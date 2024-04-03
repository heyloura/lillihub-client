import { HTMLPage } from "./templates.js";
import { PostTemplate } from "./_post.js";
import { getConversation } from "../scripts/server/mb.js";

const _favoriteTemplate = new TextDecoder().decode(await Deno.readFile("templates/_favorite.html"));

export async function SingleTemplate(user, token, id, replyTo = 0) {
    const conversation = await getConversation(id, token);
    const convo = conversation.items[conversation.items.length - 1];
    const favorite = user.lillihub.favorites.filter(item => item == id).length > 0;

    const action = _favoriteTemplate
        .replaceAll('{{action}}', '/timeline/favorite/toggle')
        .replaceAll('{{id}}', id)
        .replaceAll('{{icon}}', favorite ? 'bi-star-fill' : 'bi-star')

    const content = await PostTemplate(id, convo, conversation.items, user, token, 0, action, true, id, replyTo);

    return HTMLPage(id, content, user);
}