
import { HTMLPage } from "./templates.js";
const _settingsTemplate = new TextDecoder().decode(await Deno.readFile("templates/settings.html"));

export function SettingsTemplate(user) {
    const exculde = user.lillihub.exclude ? user.lillihub.exclude : '';
    const darktheme = user.lillihub.darktheme ? 'checked="checked"' : '';

    return HTMLPage(`Settings`, _settingsTemplate.replaceAll('{{exclude}}',exculde).replaceAll('{{darktheme}}',darktheme), user);
}