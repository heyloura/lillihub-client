import { HTMLPage } from "./templates.js";
import { getConversation } from "../scripts/server/mb.js";
import { PostTemplate } from "./_post.js";

const _favoritesTemplate = new TextDecoder().decode(await Deno.readFile("templates/_favorites.html"));

export async function FavoritesTemplate(user, token, req) {
    const favorites = user && user.lillihub && user.lillihub.favorites ? (await Promise.all(user.lillihub.favorites.map(async (item) => {
        try {
            if(parseInt(item)) {
                return `<li><div class="chip"><a onclick="addLoading(this)" href="/timeline/${item}">Post ${item}</a></div></li>`;
            }
            else {
                const profileFetch = await fetch(`https://micro.blog/posts/${item}?count=1`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
                const profile = await profileFetch.json();
           
                // Could be interesting to put a notification dot if a favorite has a new post.
                return `<li><div class="chip">
                        <a onclick="addLoading(this)" href="/user/${item}">
                        <img height="48" width="48" loading="lazy" class="avatar avatar-sm" src="${profile.author.avatar}" alt="${item} Avatar">@${item}</a>
                    </div></li>`;
            }
        } catch(error) {
            console.log(`error loading favorites for ${user.username}: ${error}`);
            return '';
        }
    }))).join('') : '';

    const config = token ? { method: "GET", headers: { "Authorization": "Bearer " + token } } : { method: "GET", headers: { "Authorization": "Bearer " + token }  };
    const fetchingTimeline = await fetch('https://micro.blog/posts/discover', config);

    const tagmojis = (await fetchingTimeline.json())._microblog.tagmoji;
    const favoritePages = user && user.lillihub && user.lillihub.feeds ? (await Promise.all(user.lillihub.feeds.map(async (item) => {
        try {
            const tagmoji = tagmojis.filter(t => t.name == item)[0];
            return `<li><div class="chip">
                <a onclick="addLoading(this)" href="/discover/${item}">
                    ${tagmoji.emoji} ${tagmoji.name}
                </a>
                </div></li>`;
        } catch {
            return '';
        }
    }))).join('') : '';
    
    return HTMLPage(token, 'Favorites', _favoritesTemplate.replaceAll('{{favorites}}', favorites + favoritePages), user);
}