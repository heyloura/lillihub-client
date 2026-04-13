import { HTMLPage } from "./templates.js";
import { PostTemplate } from "./_post.js";
import { getFollowingList } from "../scripts/server/mb.js";

const _mentionsTemplate = new TextDecoder().decode(await Deno.readFile("templates/social/mentions.html"));

export async function RepliesTemplate(user, token) {
    // Prefetch following set in parallel with the replies feed so PostTemplate doesn't fire N+1 is_following calls
    const [fetching, followingSet] = await Promise.all([
        fetch(`https://micro.blog/posts/replies`, { method: "GET", headers: { "Authorization": "Bearer " + token } } ),
        user && !user.error ? getFollowingList(user.username, token) : Promise.resolve(null)
    ]);
    const results = await fetching.json();

    const feed = (await Promise.all(results.items.map(async (item) => {

        if(item == null) {
            return '';
        }

        return await PostTemplate(item.id, item, [], user, token, 0, '', false, 'replies', false, followingSet)

    }))).join('');

    const content = _mentionsTemplate
        .replaceAll('{{mentionsActive}}', '')
        .replaceAll('{{repliesActive}}', 'active')
        .replaceAll('{{feed}}', feed)

    return HTMLPage(token, 'Replies', content, user);
}