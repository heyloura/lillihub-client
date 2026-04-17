import { DOMParser } from "npm:linkedom";
import * as ammonia from "https://deno.land/x/ammonia@0.3.1/mod.ts";
await ammonia.init();

const _appSecret = JSON.parse(Deno.env.get("APP_SECRET") ?? "{}");

export function getCookieValue(req, name) {
    const cookies = req.headers.get("cookie") ? req.headers.get("cookie").split('; ') : [];
    const match = cookies.find(cookie => cookie.startsWith(`${name}=`));
    return match ? match.slice(name.length + 1) : '';
}

export function parsePrefsCookie(req) {
    const raw = getCookieValue(req, 'lh_prefs');
    if (raw) {
        try {
            return JSON.parse(decodeURIComponent(raw));
        } catch { }
    }
    return {};
}

export function prefsCookieExpiry() {
    const expires = new Date();
    expires.setDate(expires.getDate() + 399); // Chrome limits to 400 days
    return expires;
}

export function buildPrefsCookie(prefs, expires) {
    return `lh_prefs=${encodeURIComponent(JSON.stringify(prefs))};SameSite=Lax;Secure;HttpOnly;Expires=${expires.toUTCString()};Path=/`;
}

export async function encryptMe(decrypted)
{
    const iv = await crypto.getRandomValues(new Uint8Array(16));
    const key = await crypto.subtle.importKey("jwk", _appSecret, "AES-CBC", true, ["encrypt", "decrypt"]);
    const encrypted = await crypto.subtle.encrypt({name: "AES-CBC", iv}, key, new TextEncoder().encode(decrypted));
    const encryptedBytes = new Uint8Array(encrypted);

    return `${iv.toString()}|${encryptedBytes.toString()}`;
}

export async function decryptMe(encrypted)
{
    const key = await crypto.subtle.importKey("jwk", _appSecret, "AES-CBC", true, ["encrypt", "decrypt"]);
    const ivPart = encrypted.split('|')[0];
    const encryptedPart = encrypted.split('|')[1];

    const encryptedBytes = Uint8Array.from(encryptedPart.split(',').map(num => parseInt(num)));
    const iv = Uint8Array.from(ivPart.split(',').map(num => parseInt(num)));
   
    const decrypted = await crypto.subtle.decrypt({name: "AES-CBC", iv}, key, encryptedBytes);
    const decryptedBytes = new Uint8Array(decrypted);
    return new TextDecoder().decode(decryptedBytes);
}

// Fetch the full list of notebooks (id + title), sorted alphabetically.
// Used by every notes-area layout so the page nav can list all notebooks.
export async function fetchNotebooksList(token) {
    try {
        const res = await fetch('https://micro.blog/notes/notebooks', {
            method: "GET",
            headers: { "Authorization": "Bearer " + token }
        });
        const data = await res.json();
        const items = Array.isArray(data?.items) ? data.items : [];
        return items.sort((a, b) => a.title.localeCompare(b.title)).map(item => ({ id: item.id, title: item.title }));
    } catch {
        return [];
    }
}

// Renders a dismiss-able error banner for a given error code.
// Used by note/notebook layouts to surface write failures passed via `?error=...`
// in redirect URLs from main.js mutation handlers.
export function errorBanner(errorCode, closeHref) {
    if (errorCode === 'move_duplicate') {
        return `<div class="toast toast-warning mt-2"><a href="${closeHref}" class="btn btn-clear float-right" aria-label="Close"></a>Note was copied to its new notebook, but removing the original failed. You may have duplicates in the source notebook.</div>`;
    }
    if (errorCode === 'failed') {
        return `<div class="toast toast-error mt-2"><a href="${closeHref}" class="btn btn-clear float-right" aria-label="Close"></a>Something went wrong saving your changes. Please try again.</div>`;
    }
    return '';
}

// Bounded-concurrency helper (p-limit style). Returns a `limit(fn)` wrapper that
// queues calls so no more than `concurrency` fn invocations run at once.
// Works for both streamed (promise-per-item) and Promise.all patterns.
export function createLimit(concurrency) {
    let active = 0;
    const queue = [];
    const pump = () => {
        if (active >= concurrency || queue.length === 0) return;
        active++;
        const { fn, resolve, reject } = queue.shift();
        Promise.resolve().then(fn).then(resolve, reject).finally(() => {
            active--;
            pump();
        });
    };
    return function limit(fn) {
        return new Promise((resolve, reject) => {
            queue.push({ fn, resolve, reject });
            pump();
        });
    };
}

export function formatDate(dateStr, style = 'long') {
    try {
        const d = new Date(dateStr);
        if (isNaN(d)) return dateStr;
        if (style === 'short') {
            return d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true });
        }
        return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true });
    } catch {
        return dateStr;
    }
}

// Strip dangerous tags (<style>, <script>, etc.) from arbitrary HTML using
// the same ammonia config as cleanFormatHTML. Use this when you need a quick
// sanitize without the full set of DOM rewrites cleanFormatHTML applies.
// Used by blog.js to sandbox user-authored blog post content before injecting
// into the post list — without this, a blog post containing <style> can
// re-style the entire Lillihub UI.
export function sanitizeHTML(str) {
    const builder = new ammonia.AmmoniaBuilder();
    builder.tags.add("video");
    builder.tagAttributes.set("video", new Set(["src","width","height","controls","poster"]));
    builder.tags.add("img");
    builder.tagAttributes.set("img", new Set(["src","width","height","class"]));
    const cleaner = builder.build();
    return cleaner.clean(str);
}

export function cleanFormatHTML (str) {
    function resize (html) {
        const images = html.querySelectorAll("img");
        const parents = [];
        let swipe = true;
        for (let i = 0; i < images.length; i++) {
            const image = images[i];
            if(image.getAttribute('width') == undefined || image.getAttribute('width') == '' || image.getAttribute('width') == '1' || parseInt(image.getAttribute('width')) > 190 )
            {
                image.setAttribute('width', '');
                image.setAttribute('height', '');  
                if(images.length == 1) {
                    image.classList.add('post-img');
                }   
            }
            else
            {
                //image.setAttribute('class','small-img');
                image.classList.add('small-img');
                swipe = false;
            }
            if(images.length > 1)
            {
                let parent;
                if (image.parentNode.nodeName.toLowerCase() == "a"){
                    parent = image.parentNode;             
                } else {
                    parent = image;
                }
                parents.push(parent);
            }
        }
        //let's assemble the swipeable images
        if(parents.length > 0 && swipe) {
            try {
                const container = html.createElement('div');
                container.setAttribute('class','image-carousel');
                for(let i = 0; i < parents.length; i++)
                {
                    parents[i].parentNode.removeChild(parents[i]);
                    const item = html.createElement('div');
                    item.setAttribute('class','image-carousel-item');
                    item.appendChild(parents[i]);
                    container.appendChild(item);
                }
                html.appendChild(container);
            } catch {
                // continue on without messing with the images
            }
        }
        const videos = html.querySelectorAll("video");
        for (let i = 0; i < videos.length; i++) {
            const video = videos[i];
            if(video.getAttribute('width') == undefined || video.getAttribute('width') == '' || parseInt(video.getAttribute('width')) > 190 )
            {
                video.setAttribute('width', '');
                video.setAttribute('height', '');
            }
            video.setAttribute('loading', 'lazy');
        }

    }
    
    function microBlogLinks (html) {
        const anchors = html.querySelectorAll("a");
        for (let i = 0; i < anchors.length; i++) {
            const anchor = anchors[i];
            if(anchor.innerText.charAt(0) == '@' && anchor.getAttribute('href').includes('https://micro.blog/'))
            {
                const newLink = anchor.getAttribute('href').replace("https://micro.blog/", "/user/")
                anchor.setAttribute('href', newLink);
            }
        }
    }   

    function escapeCodeBlocks (html) {
        const codes = html.querySelectorAll("code");
        for (let i = 0; i < codes.length; i++) {
            const code = codes[i];
            code.innerHTML = code.innerHTML.replaceAll('<','&lt;').replaceAll('>','&gt;');
        }
    }

    function escapeCharacters(html) {
        const paras = html.querySelectorAll("p");
        for (let i = 0; i < paras.length; i++) {
            const para = paras[i];
            para.innerHTML = para.innerHTML.replaceAll('&amp;nbsp;',' ');
            para.innerHTML = para.innerHTML.replaceAll('&nbsp;', ' ');
        }
    }
   
    const builder = new ammonia.AmmoniaBuilder();
    builder.tags.add("video");
    builder.tagAttributes.set("video", new Set(["src","width","height","controls","poster"]));
    builder.tags.add("img");
    builder.tagAttributes.set("img", new Set(["src","width","height","class"]));
    const cleaner = builder.build();
    const cleaned = cleaner.clean(str);
    const parser = new DOMParser();
   
    const doc = parser.parseFromString(cleaned);
    resize(doc);
    microBlogLinks(doc);
    escapeCodeBlocks(doc);
    escapeCharacters(doc);

    return doc.toString().replaceAll('<div />', '').replaceAll('&amp;nbsp;',' ').replaceAll('&nbsp;', ' ');
}

export function truncateHTML(html, maxChars = 800) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${html}</div>`);
    const root = doc.querySelector('div');
    let count = 0;
    let truncated = false;

    function walk(node) {
        if (truncated) { node.parentNode?.removeChild(node); return; }
        if (node.nodeType === 3) { // text node
            const text = node.textContent;
            if (count + text.length > maxChars) {
                node.textContent = text.slice(0, maxChars - count) + '…';
                truncated = true;
            }
            count += text.length;
        } else if (node.childNodes) {
            // Copy to array since we mutate during iteration
            const children = Array.from(node.childNodes);
            for (const child of children) {
                walk(child);
            }
        }
    }

    walk(root);
    const result = root.innerHTML;
    return { html: result, wasTruncated: truncated };
}
