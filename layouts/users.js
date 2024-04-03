import { HTMLPage } from "./templates.js";

const _usersTemplate = new TextDecoder().decode(await Deno.readFile("templates/users.html"));
const _userTemplate = new TextDecoder().decode(await Deno.readFile("templates/_user.html"));
const _favoriteTemplate = new TextDecoder().decode(await Deno.readFile("templates/_favorite.html"));
const _avatarTemplate = new TextDecoder().decode(await Deno.readFile("templates/_avatar.html"));

export async function UsersTemplate(user, token, type, url) {
    const fetching = await fetch(url, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
    const results = await fetching.json();

    const feed = (await Promise.all(results.map(async (item) => {
        try {
            const profileFetch = await fetch(`https://micro.blog/posts/${item.username}?count=1`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
            const profile = await profileFetch.json();
            const favorite = user.lillihub.favorites.includes(item.username);

            const actions = type == 'following' ? _favoriteTemplate
                .replaceAll('{{action}}', '/users/favorite/toggle')
                .replaceAll('{{id}}', item.username)
                .replaceAll('{{icon}}', favorite ? 'bi-star-fill' : 'bi-star') : '';

            return _userTemplate
                .replaceAll('{{avatar}}', type == 'following' ? 
                    _avatarTemplate.replaceAll('{{avatar}}', item.avatar )
                        .replaceAll('{{name}}',item.name)
                        .replaceAll('{{username}}',item.username) : '')
                .replaceAll('{{name}}',  type == 'following' ? item.name : '')
                .replaceAll('{{username}}',item.username)
                .replaceAll('{{pronouns}}', profile._microblog.pronouns ? `<small>(${profile._microblog.pronouns})</small>` : '')
                .replaceAll('{{bio}}', profile._microblog.bio)
                .replaceAll('{{userActionDropDown}}', actions);
        } catch {
            return '';
        }
    }))).join('');

    const content = _usersTemplate
        .replaceAll('{{followingActive}}', type == 'following' ? 'active' : '')
        .replaceAll('{{mutedActive}}', type == 'muted' ? 'active' : '')
        .replaceAll('{{blockedActive}}', type == 'blocked' ? 'active' : '')
        .replaceAll('{{feed}}', feed)
        .replaceAll('{{message}}', type != 'following' ? '<p style="text-align:center;"><a href="https://micro.blog/account/muting">Manage blocked and muted users on micro.blog</a><p>' : '');
    
    return HTMLPage(type, content, user)
}