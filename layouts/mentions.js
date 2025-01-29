import { HTMLPage } from "./templates.js";
import { PostTemplate } from "./_post.js";
import { getConversation } from "../scripts/server/mb.js";

const _mentionsTemplate = new TextDecoder().decode(await Deno.readFile("templates/mentions.html"));

export async function MentionsTemplate(user, token, replyTo = 0) {
    const seen = new Set();
    const fetching = await fetch(`https://micro.blog/posts/mentions`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
    const results = await fetching.json();

    const feed = (await Promise.all(results.items.map(async (item) => {

        if(item == null){
            return '';
        }

        if(user.lillihub.display == 'classic') { 
            return await PostTemplate(item.id, item, [], user, token, 0, '', false, true, false, true)
        }

        const conversation = await getConversation(item.id, token);

        if(conversation) {
            const convo = conversation.items[conversation.items.length - 1];
            if(!seen.has(convo.id)) {
                seen.add(convo.id);
                return await PostTemplate(item.id, convo, conversation.items, user, token, 0, '', conversation.items ? conversation.items.filter(item => item ? item.id == replyTo : false).length > 0 : false, 'mentions', replyTo)
            }
        }
        return '';

    }))).join('');

    const content = _mentionsTemplate
        .replaceAll('{{mentionsActive}}', 'active')
        .replaceAll('{{repliesActive}}', '')
        .replaceAll('{{feed}}', feed)

    return HTMLPage(token, 'Mentions', content, user);
}