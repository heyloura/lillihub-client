import { cleanFormatHTML, formatDate } from "../scripts/server/utilities.js";

const _conversationTemplate = new TextDecoder().decode(await Deno.readFile("templates/_shared/_conversation.html"));
const _replyTemplate = new TextDecoder().decode(await Deno.readFile("templates/_shared/_reply.html"));
const _postTemplate = new TextDecoder().decode(await Deno.readFile("templates/_shared/_post.html"));
const _actionsTemplate = new TextDecoder().decode(await Deno.readFile("templates/_shared/_actions.html"));
const _commentsTemplate = new TextDecoder().decode(await Deno.readFile("templates/_shared/_comments.html"));


export async function PostTemplate(id, post, conversation, user = false, token = '', lastTimestamp = 0, customTag = '', open = false, getFollowing = true, viewSingleConvoLoad = false, followingSet = null, redirectBase = '/') {
    const isConversation = conversation && conversation.length > 0;

    const notSeen = lastTimestamp != 0 ? post._microblog.date_timestamp > lastTimestamp: false;

    // Determine if we're following this post's author from the prefetched set.
    // All callers in layouts/*.js prefetch via getFollowingList and pass it in;
    // there is intentionally no per-post fallback here (that was an N+1 trap).
    let isFollowingUser = false;
    const postUsername = post && post.author && post.author._microblog ? post.author._microblog.username : '';
    if (followingSet && user && !user.error) {
        isFollowingUser = postUsername === user.username || followingSet.has(postUsername);
    }

    // Small visual hint next to usernames we don't follow. Only show it for
    // logged-in users who have a followingSet — otherwise we can't know
    // follow state without an extra API call.
    function followMarkerFor(username) {
        if (!followingSet || !user || user.error) return '';
        if (!username || username === user.username) return '';
        if (followingSet.has(username)) return '';
        return '<span class="follow-hint" title="Not following">+</span>';
    }

    // Build username → avatar map from conversation participants
    const avatarMap = new Map();
    if (isConversation) {
        for (const comment of conversation) {
            if (comment?.author?._microblog?.username && comment.author.avatar) {
                avatarMap.set(comment.author._microblog.username, comment.author.avatar);
            }
        }
    }
    if (post?.author?._microblog?.username && post.author.avatar) {
        avatarMap.set(post.author._microblog.username, post.author.avatar);
    }

    const uniqueRepliers = isConversation ? [...new Set(conversation.map(comment => comment?.author?._microblog?.username || ''))] : post?.author?._microblog?.username ? [post.author._microblog.username] : [''];
    const replyCheckboxes = uniqueRepliers.filter(p => p).map(function (person) {
            const av = avatarMap.get(person) || '';
            const avatarImg = av ? `<img class="reply-avatar" src="${av}" width="20" height="20" loading="lazy"/>` : '';
            return `<label><input {{${person}}} type='checkbox' name='replyingTo[]' value='${person}'/> ${avatarImg}@${person}</label>`
        }).join('\n');

    // Split replies into new (since last read) and older.
    // On the timeline (lastTimestamp > 0, not in single/open view), only render new replies inline.
    const allReplies = isConversation ? conversation.slice(0).reverse().slice(1) : [];
    const showNewOnly = lastTimestamp > 0 && !open;
    const newReplies = showNewOnly
        ? allReplies.filter(item => item && item._microblog && item._microblog.date_timestamp > lastTimestamp)
        : allReplies;
    const olderCount = allReplies.length - newReplies.length;

    const conversations = newReplies.map((item) => {
        if (!item) return '';
        const replyUsername = item && item.author && item.author._microblog ? item.author._microblog.username : '';
        return _conversationTemplate
            .replaceAll('{{id}}', item.id)
            .replaceAll('{{avatar}}', item.author.avatar)
            .replaceAll('{{username}}', replyUsername)
            .replaceAll('{{followMarker}}', followMarkerFor(replyUsername))
            .replaceAll('{{name}}', item.author.name)
            .replaceAll('{{formattedDate}}', formatDate(item.date_published))
            .replaceAll('{{newLabel}}', lastTimestamp != 0 && item?._microblog?.date_timestamp > lastTimestamp ? '<span class="label label-rounded label-success"><small>new</small></span>' : '')
            .replaceAll('{{content}}', cleanFormatHTML(item.content_html))
            .replaceAll('{{reply}}', '');
    }).join('');

    // Show avatars of new repliers on timeline, all repliers otherwise
    const avatarSource = showNewOnly ? newReplies : allReplies;
    const avatars = avatarSource.length > 0 ? avatarSource.slice(0, 5).map(function (person) {
        if(person && person.author && person.author.avatar) {
            return `<figure class="avatar avatar-sm ${lastTimestamp != 0 && person && person._microblog && person._microblog.date_timestamp > lastTimestamp ? 'badge' : ''}">
                    <img loading="lazy" src="${person.author.avatar}" height="48" width="48"/>
                </figure>`
        } else {
            return '';
        }
        }).join(' ') : '';


    const postAuthor = post && post.author && post.author._microblog ? post.author._microblog.username : '';
    const checkedCheckboxes = replyCheckboxes.replaceAll(`{{${postAuthor}}}`, `checked='checked'`);

    const reply = user ? _replyTemplate
        .replaceAll('{{open}}', open ? 'open' : '')
        .replaceAll('{{id}}', post.id)
        .replaceAll('{{redirect}}', `${redirectBase}${redirectBase.includes('?') ? '&' : '?'}replied=${post.id}#post-${post.id}`)
        .replaceAll('{{checkboxes}}', checkedCheckboxes) : '';

    const earlierLink = olderCount > 0
        ? `<p class="earlier-comments"><a href="/timeline/${post.id}#${post.id}">view ${olderCount} earlier comment${olderCount === 1 ? '' : 's'}</a></p>`
        : '';

    // If only older comments exist (no new replies), skip the details/summary
    // and render just a direct link to the single post page.
    const onlyOlder = showNewOnly && newReplies.length === 0 && olderCount > 0;

    let comments = onlyOlder
        ? earlierLink
        : _commentsTemplate
            .replaceAll('{{open}}', open ? 'open' : '')
            .replaceAll('{{avatars}}', avatars)
            .replaceAll('{{convoCount}}', isConversation
                ? (showNewOnly ? newReplies.length + ' new' : allReplies.length)
                : 0)
            .replaceAll('{{earlier}}', earlierLink)
            .replaceAll('{{conversations}}', conversations ? conversations : '')
            .replaceAll('{{reply}}', reply);

    if(viewSingleConvoLoad) {
        comments = '';
    }

    return _postTemplate.replaceAll('{{avatar}}',post && post.author ? post.author.avatar : '')
                    .replaceAll('{{name}}',post && post.author ? post.author.name : '')
                    .replaceAll('{{username}}',post && post.author && post.author._microblog ? post.author._microblog.username : '')
                    .replaceAll('{{followMarker}}', followMarkerFor(postUsername))
                    .replaceAll('{{new}}', notSeen ?  'badge' : '')
                    .replaceAll('{{tags}}', customTag ? customTag : '')
                    .replaceAll('{{actions}}', user ?
                        _actionsTemplate
                            .replaceAll('{{followForm}}', !isFollowingUser && getFollowing && postUsername ?
                                `<form method="POST" action="/users/follow" class="inline-action">
                                    <input type="hidden" name="username" value="${postUsername}" />
                                    <input type="hidden" name="redirect" value="${redirectBase}#post-${post.id}" />
                                    <button type="submit" class="btn btn-link" title="Follow @${postUsername}"><i class="bi bi-person-add"></i></button>
                                </form>` : '')
                            .replaceAll('{{id}}', id)
                            .replaceAll('{{url}}', post.url)
                            .replaceAll('{{bookmarkForm}}', !(post && post._microblog && post._microblog.is_bookmark) ?
                                `<form method="POST" action="/bookmarks/new" class="inline-action">
                                    <input type="hidden" name="url" value="${post.url}" />
                                    <input type="hidden" name="redirect" value="${redirectBase}#post-${post.id}" />
                                    <button type="submit" class="btn btn-link" title="Bookmark"><i class="bi bi-bookmark-plus"></i></button>
                                </form>` : '')
                         : '')
                    .replaceAll('{{content}}', post.content_html ? cleanFormatHTML(post.content_html) : '')
                    .replaceAll('{{formattedDate}}', formatDate(post.date_published))
                    .replaceAll('{{url}}', post.url)
                    .replaceAll('{{id}}', post.id)
                    .replaceAll('{{single}}', viewSingleConvoLoad && post && post._microblog && post._microblog.is_conversation ? `<p class="earlier-comments"><a href="/timeline/${post.id}#${post.id}">view comments</a></p>` : '')
                    .replaceAll('{{comments}}', user && (isConversation && conversation.length - 1 > 0) ? comments : '')
                    .replaceAll('{{reply}}', user && !(viewSingleConvoLoad && post && post._microblog && post._microblog.is_conversation) ? (conversation == undefined || conversation.length == 0) ? reply : '' : '')
                    .replaceAll('{{summary}}', post && post.summary ? `<div class="post-summary">${cleanFormatHTML(post.summary)}</div>` : '')
}