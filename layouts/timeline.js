import { HTMLPage } from "./templates.js";
import { getConversation } from "../scripts/server/mb.js";
import { PostTemplate } from "./_post.js";

const _timelineTemplate = new TextDecoder().decode(await Deno.readFile("templates/timeline.html"));
const _favoritesTemplate = new TextDecoder().decode(await Deno.readFile("templates/_favorites.html"));

export async function TimelineTemplate(user, token, req) {
    const searchParams = new URLSearchParams(req.url.split('?')[1]);
    const last = searchParams.get('last');
    const before = searchParams.get('before');

    const kv = await Deno.openKv();
    const userKV = await kv.get([user.username, 'timeline']);
    const timeline = {};

    if(!last && !before) {
        timeline.last = userKV && userKV.value && userKV.value.now ? userKV.value.now : 0;
        timeline.now = Math.trunc(new Date().getTime()/1000);
    }
    else {
        timeline.last = userKV && userKV.value && userKV.value.last ? userKV.value.last : 0;
        timeline.now = userKV && userKV.value && userKV.value.now ? userKV.value.now : 0;
    }

    timeline.seen = userKV && userKV.value && userKV.value.seen ? userKV.value.seen : [];

    const fetching = await fetch(`https://micro.blog/posts/timeline?count=15${last ? `&before_id=${last}` : ''}${before ? `&since_id=${before}` : ''}`, { method: "GET", headers: { "Authorization": "Bearer " + token } });
    const results = await fetching.json();

    if(!results || !results.items || results.items.length == 0) {
        return HTMLPage('Timeline', `<p>No items returned from Micro.blog</p>`, user);
    }

    const seen = new Set();
    if(last) {
        timeline.seen.forEach(seen.add, seen);
    }

    let feed = await getFeed(results.items, user, seen, token, timeline);

    // in the case of posts only, 15 may not be enough to find some. Try some more....
    let i = 0;
    while(!feed && i < 5) {
        feed = await getFeed(results.items, user, seen, token, timeline);
        i++;
    }

    if(last) {
        timeline.seen = timeline.seen.concat([...seen])
    } else {
        timeline.seen = [...seen];
    }
   
    const lastPostId = results.items[results.items.length - 1].id;
    const beforeId = last ? results.items[0].id : 0;

    const favorites = user && user.lillihub && user.lillihub.favorites && !last ? (await Promise.all(user.lillihub.favorites.map(async (item) => {
        try {
            if(parseInt(item)) {
                return `<div class="chip"><a onclick="addLoading(this)" href="/timeline/${item}">Post ${item}</a></div>`;
            }
            else {
                const profileFetch = await fetch(`https://micro.blog/posts/${item}?count=1`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
                const profile = await profileFetch.json();
           
                // Could be interesting to put a notification dot if a favorite has a new post.
                return `<div class="chip">
                        <a onclick="addLoading(this)" href="/user/${item}">
                        <img height="48" width="48" loading="lazy" class="avatar avatar-sm" src="${profile.author.avatar}" alt="${item} Avatar">@${item}</a>
                    </div>`;
            }
        } catch(error) {
            console.log(`error loading favorites for ${user.username}: ${error}`);
            return '';
        }
    }))).join('') : '';

    timeline.viewed = new Date().toLocaleDateString('en-us', { year:"numeric", month:"short", day:"numeric"});
    await kv.set([user.username, 'timeline'], timeline);

    const config = token ? { method: "GET", headers: { "Authorization": "Bearer " + token } } : { method: "GET", headers: { "Authorization": "Bearer " + token }  };
    const fetchingTimeline = await fetch('https://micro.blog/posts/discover', config);

    const tagmojis = (await fetchingTimeline.json())._microblog.tagmoji;
    const favoritePages = user && user.lillihub && user.lillihub.feeds && !last ? (await Promise.all(user.lillihub.feeds.map(async (item) => {
        try {
            const tagmoji = tagmojis.filter(t => t.name == item)[0];
            return `<div class="chip">
                <a onclick="addLoading(this)" href="/discover/${item}">
                    ${tagmoji.emoji} ${tagmoji.name}
                </a>
                </div>`;
        } catch {
            return '';
        }
    }))).join('') : '';

    const result = _timelineTemplate
        .replaceAll('{{favorites}}', !last && !before ? _favoritesTemplate.replaceAll('{{favorites}}', favorites + favoritePages) + '<hr/>' : '')
        .replaceAll('{{feed}}', feed)
        .replaceAll('{{before}}',  beforeId ? '' : 'disabled')
        .replaceAll('{{beforeId}}', beforeId)
        .replaceAll('{{lastId}}', lastPostId);
    
    return HTMLPage('Timeline', result, user);
}

async function getFeed(items, user, seen, token, timeline) {
    return (await Promise.all(items.map(async (item) => {

        if(item == null){
            return '';
        }
        let conversations = [];
        let convo = item;

        if(item._microblog && item._microblog.is_conversation) {
            const conversation = await getConversation(item.id, token);
            convo = conversation.items[conversation.items.length - 1];
            conversations = conversation.items;
        }

        if(!seen.has(convo.id)) {
            seen.add(convo.id);

            if(user.lillihub.display == 'posts') {
                if(!item._microblog.is_mention) {
                    return await PostTemplate(item.id, convo, conversations, user, token, timeline.last, '')
                }
            } else {
                return await PostTemplate(item.id, convo, conversations, user, token, timeline.last, '')
            }
            return '';    
        }

    }))).join('');
}