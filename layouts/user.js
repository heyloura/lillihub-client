import { HTMLPage } from "./templates.js";
import { getConversation, getFollowingList } from "../scripts/server/mb.js";
import { PostTemplate } from "./_post.js";
import { createLimit } from "../scripts/server/utilities.js";

const _userTemplate = new TextDecoder().decode(await Deno.readFile("templates/social/user.html"));
const _userActionsTemplate = new TextDecoder().decode(await Deno.readFile("templates/social/_user_actions.html"));
const _unFollowFormTemplate = new TextDecoder().decode(await Deno.readFile("templates/social/_follow_unfollow_form.html"));

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

export async function UserTemplate(user, token, id, photos = false) {

    let feed;
    let actions = '';
    let results = {};

    if(!token) {
        feed = 'Could not fetch results from Micro.blog';
    } else {
        if(photos) {
            const [photosFetching, profileFetching] = await Promise.all([
                fetch(`https://micro.blog/posts/${id}/photos`, { method: "GET", headers: { "Authorization": "Bearer " + token } }),
                fetch(`https://micro.blog/posts/${id}`, { method: "GET", headers: { "Authorization": "Bearer " + token } })
            ]);
            const photosResults = await photosFetching.json();
            const profileText = await profileFetching.text();
            if (tryParseJSONObject(profileText)) {
                results = JSON.parse(profileText);
            }

            feed = (await Promise.all(photosResults.items.map(async (item) => {
                return `<a target="_blank" href="${item.url}"><img loading="lazy" src="${item._microblog.thumbnail_url}" alt="" /></a>`;
            }))).join('');
        }
        else
        {
            // Prefetch following set in parallel with the user feed so PostTemplate doesn't fire N+1 is_following calls
            const [fetching, followingSet] = await Promise.all([
                fetch(`https://micro.blog/posts/${id}`, { method: "GET", headers: { "Authorization": "Bearer " + token } }),
                user && !user.error ? getFollowingList(user.username, token) : Promise.resolve(null)
            ]);
            let result = await fetching.text();
            if(tryParseJSONObject(result)){
                results = JSON.parse(result);
            } else {
                return HTMLPage(token, `User`, `<p>Micro.blog did not return results for that user.</p>`, user);
            }

            const seen = new Set();
            // Bounded concurrency so cold-cache loads don't flood micro.blog
            const limit = createLimit(5);
            feed = (await Promise.all(results.items.map((item) => limit(async () => {

                if(item == null) {
                    return '';
                }

                let conversations = [];
                let convo = item;

                if(item._microblog && item._microblog.is_conversation && item._microblog.is_mention) {
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

                    if(item && item._microblog && item._microblog.is_mention) {
                        return await PostTemplate(item.id, convo, conversations, user, token, 0, '', false, true, false, followingSet, `/user/${id}`);
                    }
                    return await PostTemplate(item.id, convo, conversations, user, token, 0, '', false, true, true, followingSet, `/user/${id}`);
                }
            })))).join('');
        }

        let mutedUser = false;
        let blockedUser = false;

        const [mutedResponse, blockedResponse] = await Promise.all([
            fetch(`https://micro.blog/users/muting`, { method: "GET", headers: { "Authorization": "Bearer " + token } }),
            fetch(`https://micro.blog/users/blocking`, { method: "GET", headers: { "Authorization": "Bearer " + token } })
        ]);
        const muted = await mutedResponse.json();
        const blocked = await blockedResponse.json();

        if(!results._microblog) {
            results._microblog = {};
        }
    
        mutedUser = muted ? muted.filter(mute => mute && results && results._microblog && mute.username == results._microblog.username).length > 0 : false;
        blockedUser = blocked ? blocked.filter(block => block && results && results._microblog && block.username == results._microblog.username).length > 0 : false;

        const followForm = `<form method="POST" action="/users/follow" class="inline-action">
            <input type="hidden" name="username" value="${results._microblog.username}" />
            <input type="hidden" name="redirect" value="/user/${results._microblog.username}" />
            <button type="submit" class="btn btn-glossy" title="Follow @${results._microblog.username}"><i class="bi bi-person-add"></i> Follow</button>
        </form>`;

        actions = mutedUser || blockedUser ?
            `<p style="text-align:center;"><a href="https://micro.blog/account/muting">Manage blocked and muted users on micro.blog</a><p>` :
            _userActionsTemplate
                .replaceAll('{{followForm}}', !results._microblog.is_following && !results._microblog.is_you ? followForm : '')
                .replaceAll('{{username}}', results._microblog.username)
                .replaceAll('{{unFollowForm}}', results._microblog.is_following && !results._microblog.is_you ? _unFollowFormTemplate.replaceAll('{{username}}', results._microblog.username) : '')
                .replaceAll('{{muteUnmute}}', mutedUser ? 'unmute' : 'mute')
                .replaceAll('{{blockUnblock}}', blockedUser ? 'unblock' : 'block');
    }

    const content = _userTemplate
        .replaceAll('{{HMTLUserActionDropdown}}', actions)
        .replaceAll('{{avatar}}', results.author == null ? '': results.author.avatar)
        .replaceAll('{{name}}', results.author == null ? '': results.author.name)
        .replaceAll('{{pronouns}}', results._microblog == null ? '': results._microblog.pronouns)
        .replaceAll('{{bio}}', results._microblog == null ? '': results._microblog.bio)
        .replaceAll('{{postsActive}}', !photos ? 'active' : '')
        .replaceAll('{{photosActive}}', photos ? 'active' : '')
        .replaceAll('{{feed}}', photos ? `<div class="image-gallery">${feed}</div>` : feed)
        .replaceAll('{{username}}', results._microblog == null ? '': results._microblog.username);

    return HTMLPage(token, 'User', content, user)
}
