import { HTMLPage } from "./templates.js";

const _usersTemplate = new TextDecoder().decode(await Deno.readFile("templates/social/users.html"));
const _userTemplate = new TextDecoder().decode(await Deno.readFile("templates/social/_user.html"));
const _avatarTemplate = new TextDecoder().decode(await Deno.readFile("templates/social/_avatar.html"));

export async function UsersTemplate(user, token, type, url, searchQuery = '') {
    console.time(`getUsers`);
    const fetching = await fetch(url, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
    let results = await fetching.json();
    console.timeEnd(`getUsers`);

    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        results = results.filter(item =>
            (item.username && item.username.toLowerCase().includes(q)) ||
            (item.name && item.name.toLowerCase().includes(q))
        );
    }

    const feed = (await Promise.all(results.map(async (item) => {
        try {
            return _userTemplate
                .replaceAll('{{avatar}}', type == 'following' ?
                    _avatarTemplate.replaceAll('{{avatar}}', item.avatar )
                        .replaceAll('{{name}}',item.name)
                        .replaceAll('{{username}}',item.username) : '')
                .replaceAll('{{name}}',  type == 'following' ? item.name : '')
                .replaceAll('{{username}}',item.username)
                .replaceAll('{{pronouns}}', '')
                .replaceAll('{{bio}}', '')
                .replaceAll('{{userActionDropDown}}', '')
                .replaceAll('{{microblog}}', item.username.split('@').length == 1 ? '<span class="chip">Micro.blog</span>' : '<span class="chip">Other</span>');
        } catch {
            return '';
        }
    }))).join('');

    const content = _usersTemplate
        .replaceAll('{{followingActive}}', type == 'following' ? 'active' : '')
        .replaceAll('{{mutedActive}}', type == 'muted' ? 'active' : '')
        .replaceAll('{{blockedActive}}', type == 'blocked' ? 'active' : '')
        .replaceAll('{{feed}}', feed)
        .replaceAll('{{searchQuery}}', searchQuery)
        .replaceAll('{{message}}', type != 'following' ? '<p style="text-align:center;"><a href="https://micro.blog/account/muting">Manage blocked and muted users on micro.blog</a><p>' : '');

    return HTMLPage(token, type, content, user)
}
