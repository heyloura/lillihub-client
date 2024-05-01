import { filterOut, cleanFormatHTML } from "../scripts/server/utilities.js";
import { CSSThemeColors } from "./templates.js";
import { getConversation } from "../scripts/server/mb.js";

const _conversationTemplate = new TextDecoder().decode(await Deno.readFile("templates/_conversation.html"));
const _replyTemplate = new TextDecoder().decode(await Deno.readFile("templates/_reply.html"));
const _replyFormTemplate = new TextDecoder().decode(await Deno.readFile("templates/_reply_form.html"));

export async function ConversationTemplate(id, user, token) {

    const conversation = (await getConversation(id, token)).items;

    const uniqueRepliers = [...new Set(conversation.map(comment => comment ? comment.author._microblog.username : ''))];
    const replyCheckboxes = uniqueRepliers.map(function (person) {
            return `<label><input {{${person}}} type='checkbox' name='replyingTo[]' value='${person}'/> @${person}</label> `
        }).join(' ');

    return conversation.slice(0).reverse().slice(1).map((item) => 
        item && !filterOut(user ?  user.lillihub.exclude : '', item.content_html) ?
            _conversationTemplate
                .replaceAll('{{id}}', item.id)
                .replaceAll('{{avatar}}', item.author.avatar)
                .replaceAll('{{username}}', item.author._microblog.username)
                .replaceAll('{{name}}', item.author.name)
                .replaceAll('{{publishedDate}}', item.date_published)
                .replaceAll('{{relativeDate}}', item._microblog.date_relative)
                .replaceAll('{{new}}', '')
                .replaceAll('{{content}}', cleanFormatHTML(item.content_html, user ?  user.lillihub.exclude : ''))
                .replaceAll(
                    '{{reply}}', 
                    user ? _replyTemplate
                        .replaceAll('{{src}}', 
                            _replyFormTemplate
                                .replaceAll('{{id}}', item.id)
                                .replaceAll('{{CSSThemeColors}}', CSSThemeColors(user.lillihub.darktheme))
                                .replaceAll('{{backgroundColor}}', 'var(--mantle)')
                                .replaceAll('{{checkboxes}}', replyCheckboxes.replaceAll(`{{${item.author._microblog.username}}}`,`checked='checked'`))
                                .replaceAll('{{checkboxes64}}', btoa(replyCheckboxes.replaceAll(`{{${item.author._microblog.username}}}`,`checked='checked'`)))
                                .replaceAll('{{buttonText}}','Send Reply')
                                .replaceAll('{{response}}','')
                            ) : ''
                ) : ''
        ).join('');
}