import { HTMLPage } from "./templates.js";
import { PostTemplate } from "./_post.js";
import { getConversation } from "../scripts/server/mb.js";

const _discoverTemplate = new TextDecoder().decode(await Deno.readFile("templates/discover.html"));
const _ctaTemplate = new TextDecoder().decode(await Deno.readFile("templates/_cta.html"));
const _loginTemplate = new TextDecoder().decode(await Deno.readFile("templates/_login.html"));

//const _appURL = Deno.env.get("APP_URL");
const _appURL = "http://localhost:8000";

export async function DiscoverTemplate(user, token, uuid) {

    console.log('DiscoverTemplate',uuid);

    const fetching = await fetch('https://micro.blog/posts/discover', { method: "GET" });
    const results = await fetching.json();

    const tagmojis = results._microblog.tagmoji.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0)).map((item) =>
        `<span class="chip"><a href="/discover/${item.name}">${item.emoji} ${item.title}</a></span>`
    ).join('');


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

    const content = _discoverTemplate
        .replaceAll('{{feed}}', feed)
        .replaceAll('{{HTMLCallToAction}}', !user ?
            _ctaTemplate
                .replaceAll('{{HTMLLoginForm}}', 
            _loginTemplate
                .replaceAll('{{uuid}}',uuid)
                .replaceAll('{{appURL}}',_appURL)) : '')
        .replaceAll('{{tagmojis}}', tagmojis)

    return HTMLPage(`Discover`, content, user);
}