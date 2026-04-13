import { HTMLPage } from "./templates.js";
import { PostTemplate } from "./_post.js";
import { getFollowingList } from "../scripts/server/mb.js";

export async function TagmojiTemplate(user, token, id) {
    const config = token ? { method: "GET", headers: { "Authorization": "Bearer " + token } } : { method: "GET", headers: { "Authorization": "Bearer " + token }  };

    // Prefetch following set for logged-in users so PostTemplate doesn't fire N+1 is_following calls
    const [fetching, discoverFetching, followingSet] = await Promise.all([
        fetch(`https://micro.blog/posts/discover/${id}`, config),
        fetch('https://micro.blog/posts/discover', config),
        user && !user.error ? getFollowingList(user.username, token) : Promise.resolve(null)
    ]);
    const results = await fetching.json();
    const discoverResults = await discoverFetching.json();

    const tagmojis = discoverResults._microblog && discoverResults._microblog.tagmoji
        ? discoverResults._microblog.tagmoji.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0)).map((item) =>
            `<span class="chip ${item.name === id ? 'active' : ''}"><a href="/discover/${item.name}">${item.emoji} ${item.title}</a></span>`
        ).join('') + ` <span class="chip"><a href="/discover"><i class="bi bi-x-lg"></i> Clear</a></span>`
        : '';

    const feed = (await Promise.all(results.items.map(async (item) => {
        if(user && !user.error) {
            return await PostTemplate(item.id, item, [], user, token, 0, '', false, true, true, followingSet, `/discover/${id}`)
        }
        else {
            return await PostTemplate(item.id, item, item._microblog.is_conversation, user, token, 0, '', false)
        }
    }))).join('');

    const title = results.title || id;
    const content = `<div class="container">
        <div class="pt-2 mb-2">${tagmojis}</div>
        <h3 class="discover-heading mt-2 p-2">${title}</h3>
        <p class="p-2">Some recent ${id} posts from the community.</p>
    </div>${feed}`;

    return HTMLPage(token, id, content, user);
}