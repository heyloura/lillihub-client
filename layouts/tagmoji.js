import { HTMLPage } from "./templates.js";
import { PostTemplate } from "./_post.js";

export async function TagmojiTemplate(user, token, id) {
    const config = token ? { method: "GET", headers: { "Authorization": "Bearer " + token } } : { method: "GET", headers: { "Authorization": "Bearer " + token }  };
    const fetching = await fetch(`https://micro.blog/posts/discover/${id}`, config);
    const results = await fetching.json();

    const feed = (await Promise.all(results.items.map(async (item) => {
        if(user && !user.error) {
            return await PostTemplate(item.id, item, [], user, token, 0, '', false, true, true)
        }
        else {
            return await PostTemplate(item.id, item, item._microblog.is_conversation, user, token, 0, '', false)
        }
    }))).join('');

    const favorite = user && user.lillihub && user.lillihub.feeds && user.lillihub.feeds.indexOf(id) > -1;
    
    const favorites = user ? `<form method="POST" action="/feed/favorite/toggle">
        <input type="hidden" name="id" value="${id}" />
        <p style="text-align:right">Favorite page: <button onclick="addLoading(this)" type="submit" class="btn btn-link greenblue-text"><i class="bi ${favorite ? 'bi-star-fill' : 'bi-star'}"></i></button></p>
    </form>` : '';
    const content = `<div class="container">
        ${favorites}
        <p>Some recent ${id} posts from the community.</p>
    </div>${feed}`;

    return HTMLPage(token, id, content, user);
}