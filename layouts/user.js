import { HTMLPage, CSSThemeColors } from "./templates.js";
import { getConversation } from "../scripts/server/mb.js";
import { PostTemplate } from "./_post.js";

const _userTemplate = new TextDecoder().decode(await Deno.readFile("templates/user.html"));
const _userActionsTemplate = new TextDecoder().decode(await Deno.readFile("templates/_user_actions.html"));
const _followTemplate = new TextDecoder().decode(await Deno.readFile("templates/_follow.html"));
const _followFormTemplate = new TextDecoder().decode(await Deno.readFile("templates/_follow_form.html"));
const _unFollowFormTemplate = new TextDecoder().decode(await Deno.readFile("templates/_follow_unfollow_form.html"));

export async function UserTemplate(user, token, id, photos = false) {

    let feed;
    let actions = '';
    let results = [];

    if(!token) {
        // Return public feed.    
        if(photos) {
            const fetching = await fetch(`https://micro.blog/posts/${id}/photos`, { method: "GET" });
            results = await fetching.json();

            feed = (await Promise.all(results.items.map(async (item) => {
                return `<a target="_blank" href="${item.url}"><img loading="lazy" src="${item._microblog.thumbnail_url}" alt="" /></a>`;
            }))).join('');
        }
        else {
            const fetching = await fetch(`https://micro.blog/posts/${id}`, { method: "GET" });
            results = await fetching.json();

            feed = (await Promise.all(results.items.map(async (item) => {
                return await PostTemplate(item.id, item, item.is_conversation, user, token, 0, '', false);
            }))).join('');
        }
    } else {
        if(photos) {
            const fetching = await fetch(`https://micro.blog/posts/${id}/photos`, { method: "GET", headers: { "Authorization": "Bearer " + token } });
            results = await fetching.json();
            
            feed = (await Promise.all(results.items.map(async (item) => {
                return `<a target="_blank" href="${item.url}"><img loading="lazy" src="${item._microblog.thumbnail_url}" alt="" /></a>`;
            }))).join('');
        }
        else
        {
            const fetching = await fetch(`https://micro.blog/posts/${id}`, { method: "GET", headers: { "Authorization": "Bearer " + token } });
            results = await fetching.json();
            
            const seen = new Set();
            feed = (await Promise.all(results.items.map(async (item) => {
    
                if(item == null){
                    return '';
                }
        
                const conversation = await getConversation(item.id, token);
        
                if(conversation) {
                    const convo = conversation.items[conversation.items.length - 1];
                    if(convo && !seen.has(convo.id)) {
                        seen.add(convo.id);
                        return await PostTemplate(item.id, convo, conversation.items, user, token, 0, '')
                    }
                }
                return '';
        
            }))).join('');
        }

        let mutedUser = false;
        let blockedUser = false;

        const mutedFetching = await fetch(`https://micro.blog/users/muting`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
        const muted = await mutedFetching.json();
    
        const blockedFetching = await fetch(`https://micro.blog/users/muting`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
        const blocked = await blockedFetching.json();
    
        mutedUser = muted ? muted.filter(mute => mute && mute.username == results._microblog.username).length > 0 : false;
        blockedUser = blocked ? blocked.filter(block => block && block.username == results._microblog.username).length > 0 : false;

        const followForm = _followTemplate.replaceAll('{{src}}', 
            _followFormTemplate.replaceAll('{{username}}', results._microblog.username)
                .replaceAll('{{CSSThemeColors}}', CSSThemeColors(user.lillihub.darktheme)));

        actions = mutedUser || blockedUser ? 
            `<p style="text-align:center;"><a href="https://micro.blog/account/muting">Manage blocked and muted users on micro.blog</a><p>` :
            _userActionsTemplate
                .replaceAll('{{followForm}}', !results._microblog.is_following && !results._microblog.is_you ? followForm : '')
                .replaceAll('{{username}}', results._microblog.username)
                .replaceAll('{{starIcon}}', user.lillihub.favorites.includes(results._microblog.username) ? 'bi-star-fill' : 'bi-star')
                .replaceAll('{{unFollowForm}}', results._microblog.is_following && !results._microblog.is_you ? _unFollowFormTemplate.replaceAll('{{username}}', results._microblog.username) : '')
                .replaceAll('{{muteUnmute}}', mutedUser ? 'unmute' : 'mute')
                .replaceAll('{{blockUnblock}}', blockedUser ? 'unblock' : 'block');
    }

    const content = _userTemplate
        .replaceAll('{{HMTLUserActionDropdown}}', actions)
        .replaceAll('{{avatar}}', results.author.avatar)
        .replaceAll('{{name}}', results.author.name)
        .replaceAll('{{pronouns}}', results._microblog.pronouns)
        .replaceAll('{{bio}}', results._microblog.bio)
        .replaceAll('{{postsActive}}', !photos ? 'active' : '')
        .replaceAll('{{photosActive}}', photos ? 'active' : '')
        .replaceAll('{{feed}}', photos ? `<div class="image-gallery">${feed}</div>` : feed)
        .replaceAll('{{username}}', results._microblog.username);

    return HTMLPage(id, content, user)
}