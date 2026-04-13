import { HTMLPage } from "./templates.js";
import { PostTemplate } from "./_post.js";
import { getConversation } from "../scripts/server/mb.js";

export async function SingleTemplate(user, token, id, replyTo = 0, referer = '') {
    const conversation = await getConversation(id, token, true);
    const convo = conversation.items[conversation.items.length - 1];

    const post = await PostTemplate(id, convo, conversation.items, user, token, 0, '', true, id);

    let backHref = `/#post-${convo.id}`;
    let backLabel = 'Back to timeline';
    if (referer) {
        try {
            const refUrl = new URL(referer);
            const path = refUrl.pathname;
            if (path.startsWith('/discover')) {
                backHref = path;
                backLabel = 'Back to discover';
            } else if (path.startsWith('/user/')) {
                backHref = path;
                backLabel = 'Back to profile';
            } else if (path.startsWith('/mentions')) {
                backHref = path;
                backLabel = 'Back to mentions';
            }
        } catch (_) {}
    }
    const backLink = `<p class="back-to-timeline"><a href="${backHref}">&larr; ${backLabel}</a></p>`;
    const content = backLink + post;

    return HTMLPage(token, id, content, user);
}