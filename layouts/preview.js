// Post preview layout — renders markdown content as HTML for review before publishing.
import { HTMLPage } from "./templates.js";
import { sanitizeHTML } from "../scripts/server/utilities.js";
import showdown from "npm:showdown";

const _previewTemplate = new TextDecoder().decode(await Deno.readFile("templates/blog/preview.html"));

const converter = new showdown.Converter({
    metadata: true,
    parseImgDimensions: true,
    strikethrough: true,
    tables: true,
    ghCodeBlocks: true,
    smoothLivePreview: true,
    simpleLineBreaks: true,
});

export async function PreviewTemplate(user, token, req) {
    const value = await req.formData();
    const destination = value.get('destination') || '';
    const content = value.get('content') || '';
    const name = value.get('name') || '';
    const summary = value.get('summary') || '';
    const editUrl = value.get('url') || '';
    const categories = value.getAll('category[]');
    const syndicates = value.getAll('syndicate[]');

    // Render markdown to HTML — same pipeline as the blog post list
    const renderedContent = sanitizeHTML(converter.makeHtml(content));

    // Build hidden inputs for categories and syndicates to preserve through round-trip
    const categoryInputs = categories.map(c =>
        `<input type="hidden" name="category[]" value="${c.replace(/"/g, '&quot;')}" />`
    ).join('');
    const syndicateInputs = syndicates.map(s =>
        `<input type="hidden" name="syndicate[]" value="${s.replace(/"/g, '&quot;')}" />`
    ).join('');

    const editInput = editUrl ? `<input type="hidden" name="url" value="${editUrl}" />` : '';
    const editOrAdd = editUrl ? 'edit' : 'add';

    const result = _previewTemplate
        .replaceAll('{{renderedContent}}', renderedContent)
        .replaceAll('{{contentRaw}}', content.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'))
        .replaceAll('{{title}}', name.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'))
        .replaceAll('{{summary}}', summary.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'))
        .replaceAll('{{destination}}', destination)
        .replaceAll('{{categoryInputs}}', categoryInputs)
        .replaceAll('{{syndicateInputs}}', syndicateInputs)
        .replaceAll('{{editInput}}', editInput)
        .replaceAll('{{editOrAdd}}', editOrAdd)
        .replaceAll('{{#hasTitle}}', name ? '' : '<!--')
        .replaceAll('{{/hasTitle}}', name ? '' : '-->')
        .replaceAll('{{#hasSummary}}', summary ? '' : '<!--')
        .replaceAll('{{/hasSummary}}', summary ? '' : '-->');

    return HTMLPage(token, 'Post', result, user);
}
