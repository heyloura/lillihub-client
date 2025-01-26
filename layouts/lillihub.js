import { HTMLPage } from "./templates.js";
import { PostTemplate } from "./_post.js";
import { getConversation } from "../scripts/server/mb.js";

const _lillihubTemplate = new TextDecoder().decode(await Deno.readFile("templates/lillihub.html"));
const _lillihubToken = Deno.env.get("LILLIHUB_TOKEN");

export async function LillihubTemplate(user, token, replyTo = 0) {
    const seen = new Set();
    const fetching = await fetch(`https://micro.blog/posts/timeline`, { method: "GET", headers: { "Authorization": "Bearer " + _lillihubToken } } );
    const results = await fetching.json();

    const feed = (await Promise.all(results.items.map(async (item) => {

        if(item == null){
            return '';
        }
        let conversations = [];
        let convo = item;

        if(item._microblog && item._microblog.is_conversation) {
            const conversation = await getConversation(item.id, _lillihubToken);
            if(conversation && conversation.items && conversation.items.length > 0) {
                convo = conversation.items[conversation.items.length - 1];
                conversations = conversation.items;
            } else {
                convo = {};
                conversations = [];
            }   
        }

        if(!seen.has(convo.id)) {
            seen.add(convo.id);

            if(user.lillihub.display == 'posts') {
                if(!item._microblog.is_mention) {
                    return await PostTemplate(item.id, convo, conversations, user, _lillihubToken, 0, '')
                }
            } else {
                return await PostTemplate(item.id, convo, conversations, user, _lillihubToken, 0, '')
            }
            return '';    
        }

    }))).join('');

    const content = _lillihubTemplate
        .replaceAll('{{feed}}', feed)

    return HTMLPage('Lillihub Feed', content, user);
}
