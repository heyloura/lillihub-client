import { HTMLPage } from "./templates.js";
import { PostTemplate } from "./_post.js";
import { getConversation, getFollowingList } from "../scripts/server/mb.js";
import { createLimit } from "../scripts/server/utilities.js";

const _mentionsTemplate = new TextDecoder().decode(await Deno.readFile("templates/social/mentions.html"));

export async function MentionsTemplate(user, token, replyTo = 0) {
    const seen = new Set();
    // Prefetch following set in parallel with the mentions feed so PostTemplate doesn't fire N+1 is_following calls
    const [fetching, followingSet] = await Promise.all([
        fetch(`https://micro.blog/posts/mentions`, { method: "GET", headers: { "Authorization": "Bearer " + token } } ),
        user && !user.error ? getFollowingList(user.username, token) : Promise.resolve(null)
    ]);
    const results = await fetching.json();

    // Bounded concurrency so a cold-cache mentions page doesn't flood micro.blog
    const limit = createLimit(5);
    const feed = (await Promise.all(results.items.map((item) => limit(async () => {

        if(item == null){
            return '';
        }

        const conversation = await getConversation(item.id, token);

        if(conversation) {
            const convo = conversation.items[conversation.items.length - 1];
            if(!seen.has(convo.id)) {
                seen.add(convo.id);
                return await PostTemplate(item.id, convo, conversation.items, user, token, 0, '', conversation.items ? conversation.items.filter(item => item ? item.id == replyTo : false).length > 0 : false, 'mentions', false, followingSet)
            }
        }
        return '';

    })))).join('');

    const content = _mentionsTemplate
        .replaceAll('{{mentionsActive}}', 'active')
        .replaceAll('{{repliesActive}}', '')
        .replaceAll('{{feed}}', feed)

    return HTMLPage(token, 'Mentions', content, user);
}