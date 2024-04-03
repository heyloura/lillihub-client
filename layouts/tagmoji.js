import { HTMLPage } from "./templates.js";
import { PostTemplate } from "./_post.js";
import { getConversation } from "../scripts/server/mb.js";

export async function TagmojiTemplate(user, token, id) {
    const fetching = await fetch(`https://micro.blog/posts/discover/${id}`, { method: "GET" });
    const results = await fetching.json();
    
    const feed = (await Promise.all(results.items.map(async (item) => {
        if(item._microblog.is_conversation && user && !user.error) {
            const conversation = await getConversation(item.id, token);
            if(conversation) {
                const convo = conversation.items[conversation.items.length - 1];
                return await PostTemplate(item.id, convo, conversation.items, user, token, 0, '', false)
            }
            return '';
        }
        else {
            return await PostTemplate(item.id, item, item._microblog.is_conversation, user, token, 0, '', false)
        }
    }))).join('');
    
    const content = `<div class="container"><p>Some recent ${id} posts from the community.</p></div>${feed}`;

    return HTMLPage(id, content, user);
}