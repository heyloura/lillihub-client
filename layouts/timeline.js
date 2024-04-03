import { HTMLPage } from "./templates.js";
import { getConversation } from "../scripts/server/mb.js";
import { PostTemplate } from "./_post.js";

const _timelineTemplate = new TextDecoder().decode(await Deno.readFile("templates/timeline.html"));
const _favoritesTemplate = new TextDecoder().decode(await Deno.readFile("templates/_favorites.html"));
const _settingsTemplate = new TextDecoder().decode(await Deno.readFile("templates/_timeline_settings.html"));

export async function TimelineTemplate(SESSION, user, token, req, replyTo = 0) {
    const searchParams = new URLSearchParams(req.url.split('?')[1]);
    const last = searchParams.get('last');
    const before = searchParams.get('before');

    // keeps track of now, last, and seen ids.
    const session = SESSION[user.username];
    const timeline = session.timeline ? session.timeline : {};

    if(!last && !before) {
        const kv = await Deno.openKv();
        await kv.set([user.username, 'timeline'], new Date().toLocaleDateString('en-us', { year:"numeric", month:"short", day:"numeric"}));

        if(replyTo == 0) {
            timeline.last = timeline.now ? timeline.now : 0;
            timeline.now = Math.trunc(new Date().getTime()/1000);
        }
    }

    const fetching = await fetch(`https://micro.blog/posts/timeline?count=30${last ? `&before_id=${last}` : ''}${before ? `&since_id=${before}` : ''}`, { method: "GET", headers: { "Authorization": "Bearer " + token } });
    const results = await fetching.json();

    if(!results || !results.items || results.items.length == 0) {
        return HTMLPage('Timeline', `<p>No items returned from Micro.blog</p>`, user);
    }

    const seen = new Set();
    if(last) {
        timeline.seen.forEach(seen.add, seen);
    }

    const feed = (await Promise.all(results.items.map(async (item) => {

        if(item == null){
            return '';
        }

        const conversation = await getConversation(item.id, token);

        if(conversation) {
            const convo = conversation.items[conversation.items.length - 1];
            if(!seen.has(convo.id)) {
                seen.add(convo.id);

                if(user.lillihub.display == 'posts') {
                    if(!item._microblog.is_mention) {
                        return await PostTemplate(item.id, convo, conversation.items, user, token, timeline.last, '', conversation.items ? conversation.items.filter(item => item ? item.id == replyTo : false).length > 0 : false, '', replyTo)
                    }
                } else {
                    return await PostTemplate(item.id, convo, conversation.items, user, token, timeline.last, '', conversation.items ? conversation.items.filter(item => item ? item.id == replyTo : false).length > 0 : false, '', replyTo)
                }
                return '';    
            }
        }
        return '';

    }))).join('');

    

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
                return `<div class="chip"><a href="/timeline/${item}">Post ${item}</a></div>`;
            }
            else {
                const profileFetch = await fetch(`https://micro.blog/posts/${item}?count=1`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
                const profile = await profileFetch.json();
           
                // Could be interesting to put a notification dot if a favorite has a new post.
                return `<div class="chip">
                        <a href="/user/${item}">
                        <img height="48" width="48" loading="lazy" class="avatar avatar-sm" src="${profile.author.avatar}" alt="${item} Avatar">@${item}</a>
                    </div>`;
            }
        } catch(error) {
            console.log(`error loading favorites for ${user.username}: ${error}`);
            return '';
        }
    }))).join('') : '';

    SESSION[user.username].timeline = timeline;

    const result = _timelineTemplate
        .replaceAll('{{settings}}', !last && !before ?
            _settingsTemplate.replaceAll('{{both}}', user.lillihub.display == 'both' ? 'selected="selected"' : '')
            .replaceAll('{{posts}}', user.lillihub.display == 'posts' ? 'selected="selected"' : '')
            .replaceAll('{{conversations}}', user.lillihub.display == 'conversations' ? 'selected="selected"' : '') : '')
        .replaceAll('{{favorites}}', !last && !before ? _favoritesTemplate.replaceAll('{{favorites}}', favorites) : '')
        .replaceAll('{{feed}}', feed)
        .replaceAll('{{before}}',  beforeId ? '' : 'disabled')
        .replaceAll('{{beforeId}}', beforeId)
        .replaceAll('{{lastId}}', lastPostId);
    
    return HTMLPage('Timeline', result, user);
}