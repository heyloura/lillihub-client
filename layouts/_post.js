import { filterOut, cleanFormatHTML } from "../scripts/server/utilities.js";
import { getIsFollowingUser } from "../scripts/server/mb.js";
import { CSSThemeColors } from "./templates.js";
import { SingleTemplate } from "./single.js";

const _conversationTemplate = new TextDecoder().decode(await Deno.readFile("templates/_conversation.html"));
const _replyTemplate = new TextDecoder().decode(await Deno.readFile("templates/_reply.html"));
const _replyFormTemplate = new TextDecoder().decode(await Deno.readFile("templates/_reply_form.html"));
const _postTemplate = new TextDecoder().decode(await Deno.readFile("templates/_post.html"));
const _actionsTemplate = new TextDecoder().decode(await Deno.readFile("templates/_actions.html"));
const _commentsTemplate = new TextDecoder().decode(await Deno.readFile("templates/_comments.html"));
const _followFormTemplate = new TextDecoder().decode(await Deno.readFile("templates/_follow_form.html"));
const _followTemplate = new TextDecoder().decode(await Deno.readFile("templates/_follow.html"));
const _bookmarkFormTemplate = new TextDecoder().decode(await Deno.readFile("templates/_bookmark_form.html"));
const _bookmarkIframeTemplate = new TextDecoder().decode(await Deno.readFile("templates/_bookmark_iframe.html"));


export async function PostTemplate(id, post, conversation, user = false, token = '', lastTimestamp = 0, customTag = '', open = false, getFollowing = true, clientConvoLoad = false, viewSingleConvoLoad = false) {
    const isConversation = conversation && conversation.length > 0;

    let isFollowingUser = false;
    const notSeen = lastTimestamp != 0 ? post._microblog.date_timestamp > lastTimestamp: false;

    if(getFollowing && user && !user.error && post && post.author && post.author._microblog) {
        const following = await getIsFollowingUser(post.author._microblog.username, token);
        isFollowingUser = following.is_you || following.is_following;
    }

    const uniqueRepliers = isConversation ? [...new Set(conversation.map(comment => comment && comment.author && comment.author._microblog ? comment.author._microblog.username : ''))] : post && post.author && post.author._microblog ? [post.author._microblog.username] : [''];
    const replyCheckboxes = uniqueRepliers.map(function (person) {
            return `<label><input {{${person}}} type='checkbox' name='replyingTo[]' value='${person}'/> @${person}</label> `
        }).join(' ');

    const conversations = isConversation ? conversation.slice(0).reverse().slice(1).map((item) => 
        item && !filterOut(user ?  user.lillihub.exclude : '', item.content_html) ?
            _conversationTemplate
                .replaceAll('{{id}}', item.id)
                .replaceAll('{{avatar}}', item.author.avatar)
                .replaceAll('{{username}}', item && item.author && item.author._microblog ? item.author._microblog.username : '')
                .replaceAll('{{name}}', item.author.name)
                .replaceAll('{{publishedDate}}', item.date_published)
                .replaceAll('{{relativeDate}}', item && item._microblog ? item._microblog.date_relative : '')
                .replaceAll('{{new}}', lastTimestamp != 0 && item && item._microblog ? item._microblog.date_timestamp > lastTimestamp ? 'new' : '' : '')
                .replaceAll('{{content}}', cleanFormatHTML(item.content_html, user ?  user.lillihub.exclude : ''))
                .replaceAll(
                    '{{reply}}', 
                    user ? _replyTemplate
                        .replaceAll('{{src}}', 
                            _replyFormTemplate
                                .replaceAll('{{id}}', item.id)
                                .replaceAll('{{CSSThemeColors}}', CSSThemeColors(user.lillihub.darktheme))
                                .replaceAll('{{backgroundColor}}', 'var(--mantle)')
                                .replaceAll('{{checkboxes}}', replyCheckboxes.replaceAll(`{{${item && item.author && item.author._microblog ? item.author._microblog.username : ''}}}`,`checked='checked'`))
                                .replaceAll('{{checkboxes64}}', btoa(replyCheckboxes.replaceAll(`{{${item && item.author && item.author._microblog ? item.author._microblog.username : ''}}}`,`checked='checked'`)))
                                .replaceAll('{{buttonText}}','Send Reply')
                                .replaceAll('{{response}}','')
                            ) : ''
                ) : ''
        ).join('') : '';

    const avatars = isConversation && conversation && Array.isArray(conversation) ? conversation.slice(0, Math.min(5, conversation.length - 1)).map(function (person) {
        if(person && person.author && person.author.avatar) {
            return `<figure class="avatar avatar-sm ${lastTimestamp != 0 && person && person._microblog && person._microblog.date_timestamp > lastTimestamp ? 'badge' : ''}">
                    <img loading="lazy" src="${person.author.avatar}" height="48" width="48"/>
                </figure>`
        } else {
            return '';
        }

        }).join(' ') : '';


    const reply = user ? _replyTemplate
        .replaceAll('{{open}}', open ? 'open' : '')
        .replaceAll('{{src}}', 
            _replyFormTemplate
                .replaceAll('{{id}}', post.id)
                .replaceAll('{{CSSThemeColors}}', CSSThemeColors(user.lillihub.darktheme))
                .replaceAll('{{backgroundColor}}', 'var(--base)')
                .replaceAll('{{checkboxes}}', replyCheckboxes.replaceAll(`{{${post && post.author && post.author._microblog ? post.author._microblog.username : ''}}}`,`checked='checked'`))
                .replaceAll('{{checkboxes64}}', btoa(replyCheckboxes.replaceAll(`{{${post && post.author && post.author._microblog ? post.author._microblog.username : ''}}}`,`checked='checked'`)))
                .replaceAll('{{buttonText}}','Send Reply')
                .replaceAll('{{response}}','')
            ) : '';

    let comments = _commentsTemplate
        .replaceAll('{{open}}', open ? 'open' : '')
        .replaceAll('{{avatars}}', avatars)
        .replaceAll('{{convoCount}}', clientConvoLoad ? 'View ' : isConversation ? conversation.length - 1 : 0)
        .replaceAll('{{conversations}}', conversations ? conversations : '')
        .replaceAll('{{reply}}', reply)
        .replaceAll('{{clientConvoLoad}}', clientConvoLoad ? `loadConversation(this,${id});` : '');

    if(viewSingleConvoLoad) {
        comments = reply;
    }

    return !filterOut(user ?  user.lillihub.exclude : '', post.content_html) ? 
        _postTemplate.replaceAll('{{avatar}}',post && post.author ? post.author.avatar : '') 
                    .replaceAll('{{name}}',post && post.author ? post.author.name : '')
                    .replaceAll('{{username}}',post && post.author && post.author._microblog ? post.author._microblog.username : '')
                    .replaceAll('{{new}}', notSeen ?  'badge' : '')
                    .replaceAll('{{tags}}', customTag ? customTag : '')
                    .replaceAll('{{actions}}', user ? 
                        _actionsTemplate
                            .replaceAll('{{followIframe}}', !isFollowingUser && getFollowing ? 
                                _followTemplate.replaceAll('{{src}}', 
                                    _followFormTemplate.replaceAll('{{username}}',post && post.author && post.author._microblog ? post.author._microblog.username : '')
                                        .replaceAll('{{CSSThemeColors}}', CSSThemeColors(user.lillihub.darktheme))) : '')
                            .replaceAll('{{id}}', id)
                            .replaceAll('{{url}}', post.url)
                            .replaceAll('{{bookmarkIFrame}}', !(post && post._microblog && post._microblog.is_bookmark) ?
                                _bookmarkIframeTemplate
                                    .replaceAll('{{url}}', post.url)
                                    .replaceAll('{{src}}',
                                        _bookmarkFormTemplate
                                            .replaceAll('{{CSSThemeColors}}', CSSThemeColors(user.lillihub.darktheme))
                                            .replaceAll('{{url}}', post.url)) : '')
                         : '')
                    .replaceAll('{{content}}', post.content_html ? cleanFormatHTML(post.content_html, user && user.lillihub ? user.lillihub.exclude : '') : '')
                    .replaceAll('{{publishedDate}}', post.date_published)
                    .replaceAll('{{relativeDate}}', post && post._microblog ? post._microblog.date_relative : '')
                    .replaceAll('{{url}}', post.url)
                    .replaceAll('{{id}}', post.id)
                    .replaceAll('{{single}}', viewSingleConvoLoad && post && post._microblog && post._microblog.is_conversation ? `<a class="btn btn-link btn-sm" onclick="addLoading(this)" href="/timeline/${post.id}#${post.id}"><i class="bi bi-chat"></i> view comments</a>` : '')
                    .replaceAll('{{comments}}', user && ((isConversation && conversation.length - 1 > 0) || (clientConvoLoad && post && post._microblog && post._microblog.is_conversation) ) ? comments : '')
                    .replaceAll('{{reply}}', user ? (conversation == undefined || conversation.length == 0) && !(clientConvoLoad && post && post._microblog && post._microblog.is_conversation) ? reply : '' : '')
                    .replaceAll('{{summary}}', post && post.summary ? `<div class="post-summary">${cleanFormatHTML(post.summary, user && user.lillihub ? user.lillihub.exclude : '')}</div>` : '')
                    .replaceAll('{{preview}}', post && post._microblog && post._microblog.is_linkpost ? `<previewbox-link href="${post.url}"></previewbox-link>` : '')
        : ''
}