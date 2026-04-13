// Landing page — shown to logged-out visitors on / and /discover.
// Replaces the old "stick a CTA on top of the discover feed" pattern.
// Static, no API calls, loads instantly.
import { HTMLPage } from "./templates.js";

const _landingTemplate = new TextDecoder().decode(await Deno.readFile("templates/social/landing.html"));

export async function LandingTemplate(user, token, uuid, appUrl) {
    const content = _landingTemplate
        .replaceAll('{{uuid}}', uuid)
        .replaceAll('{{appURL}}', appUrl);

    return await HTMLPage(token, 'Lillihub', content, user);
}
