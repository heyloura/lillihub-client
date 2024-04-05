
import { HTMLPage } from "./templates.js";

const _settingsTemplate = new TextDecoder().decode(await Deno.readFile("templates/settings.html"));
const _settingsTimelineTemplate = new TextDecoder().decode(await Deno.readFile("templates/_timeline_settings.html"));


export function SettingsTemplate(user) {
    const exculde = user.lillihub.exclude ? user.lillihub.exclude : '';
    const darktheme = user.lillihub.darktheme ? 'checked="checked"' : '';

    return HTMLPage(`Settings`, _settingsTemplate
        .replaceAll('{{exclude}}',exculde)
        .replaceAll('{{darktheme}}',darktheme)
        .replaceAll('{{timelineSettings}}', 
            _settingsTimelineTemplate.replaceAll('{{both}}', user.lillihub.display == 'both' ? 'selected="selected"' : '')
                .replaceAll('{{posts}}', user.lillihub.display == 'posts' ? 'selected="selected"' : '')
                .replaceAll('{{conversations}}', user.lillihub.display == 'conversations' ? 'selected="selected"' : ''))
        , user);
}