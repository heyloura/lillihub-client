import { HTMLPage } from "./templates.js";
import { getConversation } from "../scripts/server/mb.js";
import { PostTemplate } from "./_post.js";

const _timelineTemplate = new TextDecoder().decode(await Deno.readFile("templates/timeline.html"));

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

    timeline.viewed = new Date().toLocaleDateString('en-us', { year:"numeric", month:"short", day:"numeric"});
    await kv.set([user.username, 'timeline'], timeline);

    const result = _timelineTemplate
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
            if(conversation && conversation.items && conversation.items.length > 0) {
                convo = conversation.items[conversation.items.length - 1];
                conversations = conversation.items;
            } else {
                convo = {};
                conversations = [];
            }   
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