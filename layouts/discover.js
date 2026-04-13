import { HTMLPage } from "./templates.js";
import { PostTemplate } from "./_post.js";
import { getFollowingList } from "../scripts/server/mb.js";

const _discoverTemplate = new TextDecoder().decode(await Deno.readFile("templates/social/discover.html"));
const _ctaTemplate = new TextDecoder().decode(await Deno.readFile("templates/social/_cta.html"));
const _loginTemplate = new TextDecoder().decode(await Deno.readFile("templates/social/_login.html"));

function tryParseJSONObject (jsonString){
    try {
        var o = JSON.parse(jsonString);
        if (o && typeof o === "object") {
            return o;
        }
    }
    catch (e) { }
    return false;
};

export async function DiscoverTemplate(user, token, uuid, url) {
    url = url.replaceAll('/discover','');
    if(url[url.length - 1] == '/') {
        url = url.substring(0, url.length - 1);
    }

    const config = token ? { method: "GET", headers: { "Authorization": "Bearer " + token } } : { method: "GET", headers: { "Authorization": "Bearer " + token }  };
    // Fetch discover feed and following list in parallel; following set lets us
    // skip N+1 per-post is_following calls inside PostTemplate.
    const [fetching, followingSet] = await Promise.all([
        fetch('https://micro.blog/posts/discover', config),
        user && !user.error ? getFollowingList(user.username, token) : Promise.resolve(null)
    ]);
    let results;
    let result = await fetching.text();
    if(tryParseJSONObject(result)){
        results = JSON.parse(result);
    } else {
        return HTMLPage(token, `Discover`, `<p>Micro.blog did not return results.</p>`, user);
    }

    const tagmojis = results._microblog.tagmoji.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0)).map((item) =>
        `<span class="chip"><a href="/discover/${item.name}">${item.emoji} ${item.title}</a></span>`
    ).join('');

    const feed = (await Promise.all(results.items.map(async (item) => {
        if(user && !user.error) {
            return await PostTemplate(item.id, item, [], user, token, 0, '', false, true, true, followingSet, '/discover')
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
                .replaceAll('{{uuid}}', uuid)
                .replaceAll('{{appURL}}', url)) : '')
        .replaceAll('{{tagmojis}}', !user ? '' : tagmojis)

    return HTMLPage(token, `Discover`, content, user);
}
