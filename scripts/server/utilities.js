import { DOMParser } from "https://esm.sh/linkedom@0.16.8";
import * as ammonia from "https://deno.land/x/ammonia@0.3.1/mod.ts";
await ammonia.init();

const _appSecret = JSON.parse('{"kty":"oct","k":"c2V4g-FQSxzpeCE8E0JcMg","alg":"A128CBC","key_ops":["encrypt","decrypt"],"ext":true}');

export function getCookieValue(req, name) {
    const cookies = req.headers.get("cookie") ? req.headers.get("cookie").split('; ') : [];
    let cookieValue = cookies.filter(cookie => cookie.includes(`${name}=`));
    cookieValue = cookieValue.length > 0 ? cookieValue[0].split('=')[1] : '';
    return cookieValue;
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

export function cleanFormatHTML (str, exclude) {
    function resize (html) {
        const images = html.querySelectorAll("img");
        const parents = [];
        for (let i = 0; i < images.length; i++) {
            const image = images[i];
            if(image.getAttribute('width') == undefined || image.getAttribute('width') == '' || image.getAttribute('width') == '1' || parseInt(image.getAttribute('width')) > 190 )
            {
                image.setAttribute('width', '');
                image.setAttribute('height', '');    
            }
            else
            {
                image.setAttribute('class','small-img');
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
        if(parents.length > 0) {
            try {
                const container = html.createElement('sl-carousel');
                container.setAttribute('pagination','');
                container.setAttribute('mouse-dragging','');
                container.setAttribute('loop','');
                container.setAttribute('style','--aspect-ratio: auto;');
                container.setAttribute('class','aspect-ratio');
                for(let i = 0; i < parents.length; i++)
                {
                    parents[i].parentNode.removeChild(parents[i]);
                    const item = html.createElement('sl-carousel-item');
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
    const cleaner = builder.build();
    const cleaned = cleaner.clean(str);
    const parser = new DOMParser();
   
    const doc = parser.parseFromString(cleaned);
    resize(doc);
    microBlogLinks(doc);
    escapeCodeBlocks(doc);
    escapeCharacters(doc);

    if(!exclude || !filterOut(exclude, doc.toString())) {
    return doc.toString().replaceAll('<div />', '').replaceAll('&amp;nbsp;',' ').replaceAll('&nbsp;', ' ');
    }
    return '';
}

export function filterOut(contentFilters, content_html) {
    if(contentFilters) {
        const words = content_html != undefined ? content_html.toLowerCase()
            .replace(/[^a-z0-9]/gmi, " ").replace(/\s+/g, " ")
            .split(' ') : [];
        return contentFilters.split(',').some(filter => filter.trim() != '' && words.includes(filter.toLowerCase().trim()));
    }
    return false;
}
