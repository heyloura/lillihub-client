import { HTMLPage } from "./templates.js";
import { PostTemplate } from "./_post.js";

const _mentionsTemplate = new TextDecoder().decode(await Deno.readFile("templates/mentions.html"));

export async function RepliesTemplate(user, token) {
    const fetching = await fetch(`https://micro.blog/posts/replies`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
    const results = await fetching.json();

    const feed = (await Promise.all(results.items.map(async (item) => {

        if(item == null) {
            return '';
        }
        
        return await PostTemplate(item.id, item, [], user, token, 0, '', false, 'replies')

    }))).join('');

    const content = _mentionsTemplate
        .replaceAll('{{mentionsActive}}', '')
        .replaceAll('{{repliesActive}}', 'active')
        .replaceAll('{{feed}}', feed)

    return HTMLPage('Replies', content, user);
}