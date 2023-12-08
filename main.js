import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import { Language, minify } from "https://deno.land/x/minifier/mod.ts";
import { DOMParser } from "https://esm.sh/linkedom";
import { marky } from "https://deno.land/x/marky@v1.1.6/mod.ts";
import * as ammonia from "https://deno.land/x/ammonia@0.3.1/mod.ts";
await ammonia.init();


const router = new Router();
const _appURL = Deno.env.get("APP_URL");
const _colors = ['var(--yellowgreen)','var(--green)','var(--greenblue)','var(--blue)','var(--bluepurple)','var(--purple)','var(--purplered)','var(--red)','var(--redorange)','var(--orange)','var(--orangeyellow)','var(--yellow)'];
const _mbItemCount = 60;
const _favicon = new Uint8Array(await Deno.readFile("favicon.ico"));
const _style = await Deno.readTextFile("styles/style.css");
const _easyMDEJS = await Deno.readTextFile("scripts/easymde.min.js");
const _easyMDECSS = await Deno.readTextFile("styles/easymde.min.css");
const _compressor = await Deno.readTextFile("scripts/compressor.min.js");

// --------------------------------------------------------------------------------------
// Templates
// --------------------------------------------------------------------------------------
/**
 * Gets the initial template of the HTML page as a string
 * @param  {string} avatar - The url where the avatar image is stored
 * @param  {string} username - The Micro.blog name of the user
 * @param  {string} title - The title of the HTML page
 * @param  {bool} darkMode - Should the UI render as the dark theme?
 */
function beginHTMLTemplate(avatar, username, title, darkMode) {
    const loginHTML = `<div>
                    <a href="/app/login" alt="login">Log in</a>
                </div>`;

    const navBarHTML = `<a href="#top">${title}</a>
                <div class="header-nav">               
                    <a ${title && title == 'Timeline' ? 'class="selected"' : ''} href="/app/timeline">${timelineSVG()}<span class="show-lg">Timeline</span></a>
                    <a ${title && title == 'Discover' ? 'class="selected"' : ''} href="/app/discover">${discoverSVG()}<span class="show-lg">Discover</span></a>
                    <a href="/app/timeline?name=${username}">
                        <img src="${avatar}" width="38" height="38"/>&nbsp;
                    </a>
                </div>`;

    return `<!DOCTYPE html>
        <html lang="en" ${darkMode ? 'dark="true"' : ''}>
        <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="description" content="Lillihub - A delightful Micro.blog client">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <link rel="icon" type="image/x-icon" href="/favicon.ico">
        <title>Lillihub</title>
        <link rel="stylesheet" media="(prefers-color-scheme:light)" href="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.11.2/cdn/themes/light.css"/>
        <link rel="stylesheet" media="(prefers-color-scheme:dark)" href="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.11.2/cdn/themes/dark.css" onload="document.documentElement.classList.add('sl-theme-dark');"/>
        <style>${getCommonCSS()}"</style>
        <noscript><style>.jsonly { display: none }</style></noscript>
        <script type="text/javascript">${getCommonJS()}</script>
        <script async type="module" src="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.11.2/cdn/components/carousel-item/carousel-item.js"></script>
        <script async type="module" src="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.11.2/cdn/components/carousel/carousel.js"></script>
        <script async type="module" src="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.11.2/cdn/components/format-date/format-date.js"></script>
        </head>
        <body class="u-container">
        <header id="top">
            <nav>
                ${!username ? loginHTML : navBarHTML }
            </nav> 
        </header>
        <div style="height: var(--space-2xl)"></div>
        <main class="u-grid"><aside>`;
}

/**
 * Gets the end tags for the HTML page template
 */
function endHTMLTemplate() {
    return `</main></body></html>`;
}

/**
 * Gets a styled iframe
 * @param  {string} body - The body of the iframe
 * @param {bool} darkmode - Should the iframe use darkmode?
 */
function iFrameTemplate(body, darkmode) {
    const style = `
        :root {--mantle: #eff1f5; --crust: #dce0e8; --text: #4c4f69; --green: #40a02b;--space-3xs: clamp(0.31rem, calc(0.31rem + 0.00vw), 0.31rem); --step--1: clamp(0.99rem, calc(0.99rem + 0.02vw), 1.00rem); }
        @media (prefers-color-scheme: dark) {:root {color-scheme: dark;--mantle: #292c3c;--crust: #232634;--text: #c6d0f5; --green: #a6d189;}}
        html:not(.style-scope)[dark] {color-scheme: dark;--mantle: #292c3c;--crust: #232634;--text: #c6d0f5; --green: #a6d189;}
        body {padding:0; margin:0;color: var(--text);font-family: Seravek, Ubuntu, Calibri, source-sans-pro, sans-serif;font-size: var(--step--1);
            @media(prefers-color-scheme: dark) {background-color:var(--mantle);}}
            html:not(.style-scope)[dark] body {background-color:var(--mantle);}
        span {display:block; text-align:center; width:100%;}
        button {font-family: Seravek, Ubuntu, Calibri, source-sans-pro, sans-serif;font-size: var(--step--1);border:0; width: 100%; height: 40px; background-color:var(--mantle);color:var(--text);cursor:pointer;
            @media(prefers-color-scheme: dark) {background-color:var(--crust);}} 
            html:not(.style-scope)[dark] button {background-color:var(--crust);}
        a { text-decoration: none; color: var(--text); }
        a:visited { text-decoration: none; color: var(--text); }
        form { margin: 0; padding: 0; }
        .success {color: var(--green);border-radius:var(--space-3xs);display: inline-block;margin:var(--space-3xs) 0;}
    `; 
    return `<html lang="en" ${darkmode ? 'dark="true"' : ''}><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>${style}</style></head><body style="background-color: transparent !important;">${body}</body></html>`;
}

/**
 * Gets a styled iframe form
 * @param  {string} form  The form inside the iframe
 * @param {bool} darkmode - Should the iframe use darkmode?
 */
function iFrameForm(form, darkmode) {
    return `<iframe style="background-color:var(--mantle);" width="200" height="40" srcdoc='${iFrameTemplate(form, darkmode)}'></iframe>`;
}

/**
 * Gets the application main menu
 * @param  {bool} loggedIn - Is the user is logged in. Defaults to yes because of the redirect middleware
 * @param  {bool} endSidebar - closes the sidebar HTML with a </aside>
 */
function mainMenuTemplate(loggedIn = true, endSidebar = true) {
    return loggedIn ? `
        <ul class="discover">
            <li class="blue-purple"><a href="/app/blog/post">New Post</a></li>
            <li class="green-blue discover-li-wide"><small>My Blog:</small>
                <p style="margin-left:0;" class="margin-3xs"><a class="margin-bottom-3xs" href="/app/blog/posts">Posts</a></p>
                <p style="margin-left:0;" class="margin-3xs"><a href="/app/blog/media">Media</a></p>
            </li>
            <li class="yellow-green discover-li-wide"><small>My Stuff:</small>
                <p style="margin-left:0;" class="margin-3xs"><a class="margin-bottom-3xs" href="/app/bookmarks">Bookmarks</a></p>
                <p style="margin-left:0;" class="margin-3xs"><a href="/app/bookshelves">Bookshelves</a></p>
            </li>
            <li class="orange-yellow discover-li-wide"><small>Manage MB:</small>
                <p style="margin-left:0;" class="margin-3xs"><a class="margin-bottom-3xs" href="/app/users/following">Following</a></p>
                <p style="margin-left:0;" class="margin-3xs"><a href="/app/replies">Replies</a></p>
            </li>
            <li class="red-orange discover-li-wide"><small>Lillihub:</small>
                <p style="margin-left:0;" class="margin-3xs"><a class="margin-bottom-3xs" href="/app/settings">Settings</a></p>
            </li>
            <li class="purple-red noShift"><a href="/">${logoSVG()}</a></li>
        </ul>
        ${endSidebar ? '</aside>' : ''}
    ` : '</aside>';
}

/**
 * Gets the discover main menu
 * @param  {bool} loggedIn - Is the user is logged in. Defaults to yes because of the redirect middleware
 * @param  {bool} endSidebar - closes the sidebar HTML with a </aside>
 */
function discoverMenuTemplate(loggedIn = true, endSidebar = false) {
    return loggedIn ? `
        <ul class="discover">
            <li class="blue-purple"><a href="/app/timeline?name=monday">Monday</a></li>
            <li class="green-blue"><a href="/app/timeline?name=challenges">Community Challenges</a></li>
            <li class="yellow-green"><a href="/app/timeline?name=news">News</a></li>
            <li class="orange-yellow noShift" style="padding: 0;">${logoSVG()}</li>
        </ul>
        ${endSidebar ? '</aside>' : ''}
    ` : '</aside>';
}

/**
 * Sanitizes an HTML string. Also removes height/width from large images,
 * updates micro.blog username links to relative link, escape code block characters.
 * @param  {string} str - an HTML string
 * @param  {bool} showCarousel - Should multiple images be put in a carousel?
 */
function cleanFormatHTML (str, showCarousel = true) {
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
                image.classList.add('small-img');
            }
            if(image.getAttribute('src') != null && image.getAttribute('src').includes('cdn.micro.blog')){
                image.setAttribute('src', image.getAttribute('src').replace("1000x", "700x"));
            }
            if(images.length > 1 && showCarousel) 
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
            else
            {
                video.classList.add('small-img');
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
                const newLink = anchor.getAttribute('href').replace("https://micro.blog/", "/app/timeline?name=")
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
    escapeCharacters(doc)
	return doc.toString();
}

/**
 * Template for a posts main content
 * @param  {string} id - The id of the post
 * @param  {string} username - The username of the post author
 * @param  {string} name - The name of the post author   
 * @param  {string} avatar - The location of the avatar image  
 * @param  {string} url - The permalink of the post
 * @param  {string} date - The date of the post
 * @param  {string} content_html - The content of the post
 * @param  {string} postActions - An HTML string of the post actions
 * @param  {bool} isFollowing - Are you following this user?
 * @param  {string} dateDisp - The relative date display, if any
 * @param  {bool} showCarousel - Should multiple images be put in a carousel?
 */
function postContentTemplate(id, username, name, avatar, url, date, content_html, postActions, isFollowing, dateDisp = '', showCarousel = true) { 
    const avatarHTML = avatar ? `<img style="align-self: center;width: var(--space-l);height: var(--space-l);border-radius: 50%;" loading="lazy" src="${avatar}" />` : '';
    return `
        <article class="post" data-id="${id}" style="display:block;">
            <section style="display:flex; flex-direction: column;">
                <header style="display:flex; flex-direction: row;margin-bottom:var(--space-xs);">
                    ${avatarHTML}
                    <div style="padding-left: var(--space-xs);">
                        <b>${name ? name : username}</b>${!isFollowing ? '&nbsp;<span class="label">Not following</span>' : ''}
                        <br/><small><a href="/app/timeline?name=${username}">@${username}</a></small>
                    </div>
                    <div style="margin-left: auto;">
                    ${postActions}
                    </div>
                </header>
                <div class="content" style="flex-grow: 1;margin-bottom: var(--space-s);">${cleanFormatHTML(content_html, showCarousel)}</div>  
                ${url && date? `<div><small><a href="${url}"><sl-format-date month="long" day="numeric" year="numeric" hour="numeric" minute="numeric" hour-format="12" date="${date}">${dateDisp ? dateDisp : date}</sl-format-date></a></small></div>` : ''} 
    `;
}

/**
 * Template for a posts button action bar
 * @param {bool} darkmode - Is the UI overridden to darkmode?
 * @param  {string} id - The id of the post
 * @param  {string} username - The username of the post author
 * @param  {bool} isPinned - Is this post pinned?  
 * @param  {object} _microblog - The _microblog object, returned from the Micro.blog API 
 * @param  {string} content_html - The content of the post
 * @param  {array} bookshelves - The users bookshelves
 * @param  {bool} isFollowing - Is the logged in user following the post author?   
 * @param  {string} tags - A list of tag checkboxes for micro.blog premium users
 * @param  {bool} isPost - Is this a post?
 * @param  {string} bookPost - A string containing a book post contents for creating a new post
 * @param  {int} bookShelfId - The id of the current bookshelf (if on bookshelf page)
 */
function postActionTemplate(darkmode, id, username, isPinned, _microblog, content_html, bookshelves, isFollowing, tags, isPost = true, bookPost = '', bookShelfId = 0) { 
    let quote = content_html;
    const readerLink = content_html.split('post_archived_links');
    if(readerLink.length > 1) {
        quote = readerLink[0].substring(0, readerLink[0].length - 10);
    }
    const bookshelfOptions = bookshelves.map(function (shelf) { return `<label class="actionSelect"><input ${shelf.id == bookShelfId ? 'checked="checked"' : ''} name="bookshelfId" type="radio" value="${shelf.id}" />${shelf.title}</label>` }).join('');

    const addBookAction = _microblog.isbn ? `<details class="actionExpand">
                                <summary class="actionExpandToggle">Add book</summary>
                                <form style="height: 100%;max-height: 300px;" method="POST" action="/app/bookshelves/addBook">
                                    <input type="hidden" name="bookAuthor" value="${_microblog.book_author}" />
                                    <input type="hidden" name="bookTitle" value="${_microblog.book_title}" />
                                    <input type="hidden" name="bookISBN" value="${_microblog.isbn}" />
                                    ${bookshelfOptions}
                                    <button class="actionBtn" type="submit">Add book</button>
                                </form>
                            </details>` : '';

    const moveBookAction = !isPost ? `<details class="actionExpand"><summary class="actionExpandToggle">Move book</summary>
                                            <form style="height: 100%;max-height: 300px;" method="POST" action="/app/bookshelves/moveBook">
                                                <input type="hidden" name="bookId" value="${id}" />
                                                ${bookshelfOptions}
                                                <button  class="actionBtn"type="submit">Move book</button>
                                            </form>
                                        </details>` : '';

    const followAction = !isFollowing && !_microblog.is_you && isPost && !_microblog.is_bookmark ? 
                iFrameForm(`<form method="POST" action="/app/users/follow">
                        <input type="hidden" name="username" value="${username}" />
                        <button type="submit">Follow User</button>
                    </form>`, darkmode)
                : '';

    const pinningActions = isPost && !_microblog.is_bookmark ? iFrameForm(`<form method="POST" action="/app/${!isPinned ? 'unpin' : 'pin'}Post">
                                    <input type="hidden" name="id" value="${id}" />
                                    <button type="submit">${isPinned ? 'Pin' : 'Unpin'} post</button>
                                </form>`, darkmode) : '';
    
                                const boomarkingActions = isPost ? iFrameForm(`<form method="POST" action="/app/bookmarks/${!_microblog.is_bookmark ? 'bookmark' : 'unbookmark'}">
                        <input type="hidden" name="id" value="${id}" />
                        <button type="submit">${!_microblog.is_bookmark ? 'Bookmark' : 'Unbookmark'}</button>
                    </form>`, darkmode) : '';
    
    const taggingActions = _microblog.is_bookmark && tags && isPost ? `<form style="height: 100%;margin-bottom: var(--space-3xs);" method="POST" action="/app/bookmarks/manageTags"> 
                                    <details class="actionExpand">
                                        <summary class="actionExpandToggle">Update Tags</summary>
                                        <input type="hidden" name="id" value="${id}" />
                                        ${tags}
                                        <label for="newTag">New tag</label>
                                        <input style="width:140px;" type="text" id="newTag" name="newTag" />
                                        <button class="actionBtn" type="submit">Save Changes</button>
                                    </details>
                                </form>` : '';
    
    const quotePostAction = isPost ? `<a target="_top" href="/app/blog/post?content=${encodeURIComponent(`<blockquote>${quote}</blockquote>`)}">Quote</a>` : '';
    
    const viewPostAction = isPost && !_microblog.is_bookmark ? `<a target="_top" href="/app/post?id=${id}">View post</a>` : '';

    const bookPostAction = !isPost && bookPost ? `<a target="_top" href="/app/blog/post?content=${encodeURIComponent(bookPost)}">Create post</a>` : '';

    const removeBookAction = !isPost ? `<details class="actionExpand"><summary class="actionExpandToggle">Remove Book</summary>
                                        <form style="height: 100%;max-height: 300px;" method="POST" action="/app/bookshelves/removeBook">
                                            <input type="hidden" name="bookshelfId" value="${bookShelfId}" />
                                            <input type="hidden" name="bookId" value="${id}" />
                                            <button class="actionBtn"  type="submit">Remove</button>
                                        </form></details>` : '';
    return `
        <div class="actions">
            <details style="position:absolute;z-index:${id};border-radius: var(--space-3xs);color: var(--subtext-1);border: 1px solid var(--mantle);background-color: var(--mantle);margin-left: -92px;">
                <summary style="padding: var(--space-2xs); font-size: var(--step--1); margin: 0;">Actions</summary>
                <div style="padding: var(--space-2xs); width: 200px; margin-left: -129px; background-color: var(--mantle);">
                ${followAction}
                ${pinningActions}
                ${boomarkingActions}
                ${taggingActions}
                ${viewPostAction}
                ${quotePostAction}
                ${bookPostAction}
                ${addBookAction}
                ${removeBookAction}
                ${moveBookAction}
                </div>
            </details>
        </div>`;  
}

/**
 * Template for a comment
 * @param {bool} darkmode - Is the UI overridden to darkmode?
 * @param  {object} comment - The comment object from micro.blog
 * @param  {array} repliers - An array of usernames that have commented on the post
 * @param  {array} contentFilters  An array of words to filter the reply content by  
 */
function commentTemplate(darkmode, comment, repliers, contentFilters) {
    if(comment == null || comment == undefined || comment.content_html == null || comment.content_html == undefined){
        return '';
    }
    if(filterOut(contentFilters, comment.content_html))
    {
        return `<div class="comment"><p style="color: var(--overlay-1);">Reply was filtered out.</p></div>`
    }

    return `
        <div class="comment">
            <header style="display:flex; flex-direction: row;margin-bottom:var(--space-xs)">
                <img loading="lazy" src="${comment.author.avatar}" />
                <div style="flex-grow: 1">
                    <b>${comment.author.name ? comment.author.name : comment.author._microblog.username}</b>
                    <br/><small><a href="/app/timeline?name=${comment.author._microblog.username}">@${comment.author._microblog.username}</a>: ${comment._microblog.date_relative}</small>
                </div>
            </header>
            <div>${cleanFormatHTML(comment.content_html)}</div>
            ${replyTemplate(darkmode, comment.id, comment.author._microblog.username, repliers)}
        </div>
    `;
}

/**
 * Template for a reply
 * @param  {bool} darkmode - Is the UI overridden to darkMode?
 * @param  {string} id - The id of the reply
 * @param  {string} author - The username of the reply author
 * @param  {array} repliers - An array of usernames that have commented on the post
 * @param  {bool} none - Indicates if there are replies on the post
 */
function replyTemplate(darkmode, id, author, repliers, none = false) {
    const repliersHTML = repliers.map(function (person) { 
            return `<label><input ${author == person ? 'checked="checked"' : '' } type="checkbox" name="replyingTo[]" value="${person}"/>@${person}</label>`
        }).join(' ');

    return `<div class="${none ? "comments" : "comment"}">
        <details>
            <summary>${none ? "No comments yet, be the first!" : "Reply"}</summary>
            <form method="POST" action="/app/replies/add" target="${id}" onsubmit="clearReply(this)">
                <input type="hidden" name="id" value="${id}" />
                <div class="repliers">${repliersHTML}</div>
                <div class="grow-wrap"><textarea name="content" onInput="growTextArea(this)"></textarea></div>
                <button type="submit">Send Reply</button>
            </form> 
            <iframe srcdoc='${iFrameTemplate('', darkmode)}' name="${id}" width="220" height="35"></iframe>
        </details></div>`;
}

/**
 * Template for the post/conversations/mentions menubar
 * @param  {string} selected - The name of the selected menu item
 * @param  {string} name - The name of the user being browsed
 */
function postMenuBarTemplate(selected, name, includeMentions = true) {
    let template = `<div><div class="switch-field">
        <a ${selected == 'posts' ? "class='selected'" : ''} href="${name ? '/app/timeline?name=' + name : '/app/timeline'}">Posts</a>
        <a ${selected == 'conversations' ? "class='selected'" : ''} href="${name ? '/app/conversations?name=' + name : '/app/conversations'}">Conversations</a>`;

        if(!name && includeMentions)
        {
            template += `<a ${selected == 'mentions' ? "class='selected'" : ''} href="/app/mentions">Mentions</a></div>`;
        } else {
            template += `<a ${selected == 'photos' ? "class='selected'" : ''} href="/app/photos?name=${name}">Photos</a></div>`;
        }
        
        return template;
}

/**
 * JavaScript template for client side image compression.
 * @param  {string} success - A string containing JavaScript when a success is encounterd
 */
function compressImageClientFunctionTemplate(success) {
    return `
    new Compressor(image, {
        quality: 0.95,
        maxHeight: 1920,
        maxWidth: 1920,
        success(result) {
            console.log('new size: ' + result.size /1024 /1024 + ' MB');
            if(result.size /1024 /1024 > 3) {
                new Compressor(result, {
                    quality: 0.85,
                    maxHeight: 1920,
                    maxWidth: 1920,
                    success(result) {
                        console.log('another compress size: ' + result.size /1024 /1024 + ' MB');
                        formData.append("media", result, result.name);
                        fetch('/app/blog/upload', { method: "POST", body: formData })
                            .then(response => console.log(response.status) || response)
                            .then(response => response.text())
                            .then(body => ${success});
                    },
                });
            } else {
                formData.append("media", result, result.name);
                fetch('/app/blog/upload', { method: "POST", body: formData })
                    .then(response => console.log(response.status) || response)
                    .then(response => response.text())
                    .then(body => ${success});
            }
        },
    });
    `;
}

// --------------------------------------------------------------------------------------
// Stream HTML Helpers
// --------------------------------------------------------------------------------------
/**
 * Streams the submenu item of the sidebar directly to the client
 * @param  {object} controller - The controller of the readable stream
 * @param  {string} image - The location of the image, if any 
 * @param  {string} text - The text of the anchor element 
 * @param  {string} route - The relative route the anchor item should point to 
 * @param  {bool} selected - Should this list item be highlighted?
 * @param  {int} i - The iteration number.     
 */
function streamSubMenuItem(controller, image, text, route, selected, i) {
    const imageHTML = image ? `<img style="border-radius: 50%; width: var(--space-m); vertical-align: middle;" src="${image}"/>` : '';
    controller.enqueue(`<li style="border: 1px solid ${_colors[i % 12]}; ${selected ? 'background-color:' + _colors[i % 12] + ';' : ''}">
            <a style="${selected ? 'color:var(--base);' : ''}" href="${route}">${imageHTML} ${text}</a>
        </li>`);  
}

/**
 * Streams the pinned post submenu to the client
 * @param  {object} ctx - The request context
 * @param  {object} controller - The controller of the readable stream     
 */
async function streamPinned(ctx, controller) {
    const id = await ctx.request.url.searchParams.get('id');
    const access_token = await ctx.cookies.get('access_token');
    const pinnedCookie = await ctx.cookies.get('pinnedPosts');
    const pinned = pinnedCookie == undefined ? [] : JSON.parse(pinnedCookie);

    if(pinned.length > 0) {
        controller.enqueue(`<ul class="categories"><li style="border:none;box-shadow: none;padding: var(--space-3xs);">Pinned Posts:</li>`);  
    }
    for(let i = 0; i < pinned.length; i++) {
        const convo = await getMicroBlogConversation(pinned[i], access_token);
        const post = convo.items[convo.items.length - 1];

        if(post) {
            streamSubMenuItem(controller, post.author.avatar, post._microblog.date_relative, `/app/post?id=${pinned[i]}`, post.id == id, i);
        }
    }
    if(pinned.length > 0) {
        controller.enqueue(`</ul>`);  
    }
    controller.enqueue(`</aside>`);
}

/**
 * Streams the emoji tags submenu to the client
 * @param  {object} ctx - The request context
 * @param  {object} controller - The controller of the readable stream     
 */
async function streamDiscoverTags(ctx, controller) {
    const name = await ctx.request.url.searchParams.get('name');
    const access_token = await ctx.cookies.get('access_token');

    controller.enqueue(`<ul class="categories">`); 
    const fetching = await microBlogGet('posts/discover', access_token);
    const discover = await fetching.json();
    
    for(let i = 0; i < discover._microblog.tagmoji.length; i++) {
        const tag = discover._microblog.tagmoji[i];
        streamSubMenuItem(controller, null, `${tag.emoji} ${tag.title}`, `/app/tag?name=${tag.name}`, tag.name == name, i);
    }

    controller.enqueue(`</ul></aside>`);
}

/**
 * Streams the boomark tags submenu to the client (premium users only)
 * @param  {object} ctx - The request context
 * @param  {object} controller - The controller of the readable stream     
 */
async function streamBookmarkTags(ctx, controller) {
    const access_token = await ctx.cookies.get('access_token');
    const id = await ctx.request.url.searchParams.get('id');

    controller.enqueue(`<ul class="categories">`); 

    const tags = await getMicroBlogBookmarkTags(access_token);
    
    for(let i = 0; i < tags.length; i++) {
        const tag = tags[i];
        streamSubMenuItem(controller, undefined, `${tag}`, `/app/bookmarks?id=${tag}`, tag == id, i);
    }

    controller.enqueue(`</ul></aside>`);
}

/**
 * Streams the bookshelf links submenu to the client
 * @param  {object} ctx - The request context
 * @param  {object} controller - The controller of the readable stream     
 */
async function streamBookshelfLinks(ctx, controller) {
    const access_token = await ctx.cookies.get('access_token');
    const id = await ctx.request.url.searchParams.get('id');

    controller.enqueue(`<ul class="categories">`); 

    const bookshelves = await getMicroBlogBookshelves(access_token);
    
    for(let i = 0; i < bookshelves.items.length; i++) {
        const bookshelf = bookshelves.items[i];
        streamSubMenuItem(controller, undefined, `${bookshelf.title} (${bookshelf._microblog.books_count})`, `/app/bookshelves?id=${bookshelf.id}`, bookshelf.id == id, i);
    }

    controller.enqueue(`</ul></aside>`);
}

/**
 * Streams a list of micro.blog posts to the client
 * @param  {object} ctx - The request context
 * @param  {object} controller - The controller of the readable stream     
 * @param  {array} posts - An array of posts to stream 
 * @param  {bool} isConvo - Are the posts part of the same conversation thread.  
 * @param  {bool} includeReplies - Include replies under the post
 * @param  {bool} includeActions - Include standard post actions
 * @param  {bool} openConvo - open the conversations
 */
async function streamPosts(ctx, controller, posts, isConvo, includeReplies = true, includeActions = true, openConvo = false) {
    const access_token = await ctx.cookies.get('access_token');
    const user = await getMicroBlogLoggedInUser(access_token);
    const darkmodeCookie = await ctx.cookies.get('darkMode');
    const contentFilterCookie = await ctx.cookies.get('contentFilter');
    const contentFilters = contentFilterCookie == undefined ? [] : JSON.parse(contentFilterCookie);

    const fetchingBookshelves = await microBlogGet('books/bookshelves', access_token);
    const bookshelves = await fetchingBookshelves.json();

    const pinnedCookie = await ctx.cookies.get('pinnedPosts');
    const pinned = pinnedCookie == undefined ? [] : JSON.parse(pinnedCookie);

    const convo = [...posts];

    if(isConvo) {
        posts = [];
        posts.push(convo[convo.length - 1]);
    }

    const tags = await getMicroBlogBookmarkTags(access_token);

    for(let i = 0; i < posts.length; i++) {  
        const post = posts[i];

        if(!filterOut(contentFilters, post.content_html))
        {
            let isFollowing = await isFollowingMicroBlogUser(post.author._microblog.username, access_token);
            if(post.author._microblog.username == await ctx.cookies.get('username')){
                isFollowing = true;
            }
            if(post._microblog.is_bookmark) {
                // don't show the following button on a bookmark. Since
                // people can bookmark websites and not just users posts.
                isFollowing = true;
            }
            
            let tagCheck = '';
            if(user.is_premium) {       
                const currentTags = post.tags != undefined ? post.tags.split(', ') : [];
                tagCheck = tags.map(function (tag) { 
                        return `<label style="display:block;text-align:left;"><input name="tags[]" type="checkbox" ${currentTags.includes(tag) ? 'checked="checked"' : ''} value="${tag}">${tag}</label>` 
                    }).join('');
            }
            const post_content = post.tags ? `${post.content_html}<div><p style="color:var(--subtext-1)"><small>Tags: ${post.tags}</small></p></div>` : post.content_html;
            
            const postActions = includeActions ? postActionTemplate(darkmodeCookie, post.id, post.author._microblog.username, !pinned.includes(post.id), post._microblog, post.content_html, bookshelves.items, isFollowing, tagCheck, true, '', 0) : '';
            controller.enqueue(postContentTemplate(post.id, post.author._microblog.username, post.author.name, post.author.avatar, post.url, post.date_published, post_content, postActions, isFollowing, post._microblog.date_relative));


            if(includeReplies) {
                await streamComments(ctx, controller, post.id, openConvo, isConvo ? convo : null);
            }
        }
        else
        {
            controller.enqueue(`<article class="post" style="padding-top: 0; display:block;"><section style="color: var(--overlay-1);"><p>Content was filtered out.</p>`);
        }
        controller.enqueue('</section></article>');
    }
}

/**
 * Streams a list of micro.blog comments to a post
 * @param  {object} ctx - The request context
 * @param  {object} controller - The controller of the readable stream     
 * @param  {string} postid - The id of the post  
 * @param  {bool} open - Should the details toggle default to open?
 * @param  {array} convo - An array of conversation posts if already fetched.
 */
async function streamComments(ctx, controller, postid, open = false, convo = null) {
    const access_token = await ctx.cookies.get('access_token');
    const commentLimit = (await ctx.cookies.get('limitComments'));
    const limit = parseInt(commentLimit) ? parseInt(commentLimit) - 1 : 24;
    const contentFilterCookie = await ctx.cookies.get('contentFilter');
    const contentFilters = contentFilterCookie == undefined ? [] : JSON.parse(contentFilterCookie);
    const darkmodeCookie = await ctx.cookies.get('darkMode');

    if(convo == null) {
        convo = (await getMicroBlogConversation(postid, access_token)).items;
    }
    convo = convo.filter(function (comment) { return comment != null && comment != undefined });

    // get a unique list of conversation repliers
    const uniqueRepliers = [...new Set(convo.map(comment => comment.author._microblog.username))];

    // the last item is the original post.
    const original = convo[convo.length - 1];
    const author = original != undefined && original.author != undefined ? original.author._microblog.username : '';

    // remove the original and any null comments
    let comments = convo.slice(0,-1);

    if(comments.length > 0) {
        const avatars = comments.map(function (comment, i) { return i < 3 && comment != null && comment.author != null ? '<img loading="lazy" src="' + comment.author.avatar + '"/>' : '' }).join('');
        
        // reverse the comments so we can display oldest first.
        comments = comments.reverse();

        controller.enqueue(`<div class="comments">
            <details ${open ? 'open' : ''}>
                <summary>${avatars}<span class="comment-count">${comments.length} comments</span></summary>`);
                if(!open) {
                    for(let i = 0; i <= limit && i < comments.length; i++) {
                        controller.enqueue(commentTemplate(darkmodeCookie, comments[i], uniqueRepliers, contentFilters));
                    }
                    if(comments.length > limit + 1) {
                        controller.enqueue(`<p style="text-align:center;"><a target="_top" href="/app/post?id=${postid}">View post to see all comments</a></p>`);
                    }
                } else {
                    for(let i = 0; i < comments.length; i++) {
                        controller.enqueue(commentTemplate(darkmodeCookie, comments[i], uniqueRepliers, contentFilters));
                    }
                }
        controller.enqueue(replyTemplate(darkmodeCookie, postid, author, uniqueRepliers, false));
        controller.enqueue(`</details>`);
    } else {
        controller.enqueue(replyTemplate(darkmodeCookie, postid, author, uniqueRepliers, true));
    }
}

/**
 * Streams a link to the next page
 * @param  {object} ctx -The request context
 * @param  {object} controller - The controller of the readable stream     
 * @param  {string} lastId - The id of the last post on the page
 */
async function streamNextPageLink(ctx, controller, lastId) {
    let referer = await ctx.request.url.href;
    
    if(referer.indexOf('?') != -1) {
        referer = referer.split('?')[0] + '?last=' + lastId;
    } else {
        referer = referer + '?last=' + lastId;
    }
    
    controller.enqueue(`<a href="${referer}">Next</a>`);
}

/**
 * Streams a link to the previous page
 * @param  {object} ctx -The request context
 * @param  {object} controller - The controller of the readable stream     
 * @param  {string} beforeId - The id of the first post on the page
 */
async function streamPreviousPageLink(ctx, controller, beforeId) {
    let referer = await ctx.request.url.href;
    
    if(referer.indexOf('?') != -1) {
        referer = referer.split('?')[0] + '?before=' + beforeId;
    } else {
        referer = referer + '?before=' + beforeId;
    }
    
    controller.enqueue(`<a style="margin-right:var(--space-3xl)" href="${referer}">Previous</a>`);
}

/**
 * Streams a profile section for a user
 * @param  {object} ctx - The request context
 * @param  {object} controller - The controller of the readable stream     
 * @param  {object} author - The author object returned by the M.B. API
 * @param  {object} _microblog - The _microblog object returned by the M.B. API
 */
async function streamUserProfile(ctx, controller, author, _microblog) {
    const access_token = await ctx.cookies.get('access_token'); 
    const darkmodeCookie = await ctx.cookies.get('darkMode');
    const username = await ctx.cookies.get('username');
    const name = await ctx.request.url.searchParams.get('name');

    let pins = '';
    if(_microblog.is_you) {
        const fetching = await microBlogGet('users/pins/' + username, access_token);
        const responsePins = await fetching.json();
        pins = responsePins.map(function (pin) { return pin.is_unlocked ? `<img loading="lazy" width="30" height="30" src="${pin.icon}" alt="${pin.title}" title="${pin.title}" />` : '' }).join('');
    }

    // figure out if user is blocked or muted
    const fetchMuting = await microBlogGet('users/muting', access_token);
    const muting = await fetchMuting.json();
    const isMuted = muting.filter(m => m.username == name).length > 0;
    const fetchBlocked = await microBlogGet('users/blocking', access_token);
    const blocked = await fetchBlocked.json();
    const isBlocked = blocked.filter(m => m.username == name).length > 0;

    controller.enqueue(`<div style="padding-bottom: var(--space-3xl)">
        ${!_microblog.is_you ? 
            `<details class="column-fill">
                <summary style="margin-bottom:0;">Advanced</summary>
                <div style="margin-top:var(--space-xs)">
                <p>Learn about muting and blocking users here: <a target="_blank" href="https://help.micro.blog/t/muting-blocking-and-reporting-users/32">Micro.blog Help - Muting, blocking, and reporting users${externalLinkSVG()}</a></p>
                ${_microblog.is_following ? iFrameForm(`<form style="display:inline;" method="POST" action="/app/users/unfollow"><input type="hidden" name="username" value="${name}"/><button type="submit">Unfollow User</button></form>`, darkmodeCookie) : '' }
                ${!isBlocked ? iFrameForm(`<form style="display:inline;" method="POST" action="/app/users/block"><input type="hidden" name="username" value="${name}"/><button type="submit">Block User</button></form>`, darkmodeCookie) : iFrameForm(`<form style="display:inline;" method="POST" action="/app/users/unblock"><input type="hidden" name="username" value="${name}"/><button type="submit">Unblock User</button></form>`, darkmodeCookie)}
                ${!isMuted ? iFrameForm(`<form style="display:inline;" method="POST" action="/app/users/mute"><input type="hidden" name="username" value="${name}"/><button type="submit">Mute User</button></form>`, darkmodeCookie) : iFrameForm(`<form style="display:inline;" method="POST" action="/app/users/unmute"><input type="hidden" name="username" value="${name}"/><button type="submit">Unmute User</button></form>`, darkmodeCookie)}
                </div>
            </details>` : ''}
        <div class="profile blue-purple" style="color:var(--base);">
            <div>
                <p class="center"><img class="avatar" src="${author.avatar}" /></p>
                <div style="margin: 0 auto;display: block;width:300px;text-align: center;">
                ${!_microblog.is_following && !_microblog.is_you ? iFrameForm(`<form method="POST" action="/app/users/follow">
                        <input type="hidden" name="username" value="${name}" />
                        <button type="submit">Follow @${_microblog.username}</button>
                    </form>`, darkmodeCookie) : ''}
                ${isMuted ? '<br/><br/><b>User is muted.</b>' : ''}
                ${isBlocked ? '<br/><br/><b>User is blocked.</b>' : ''}
                </div>
            </div>
            <div style="padding-left: var(--space-xs);">
                <p class="name"><b>${author.name}</b> ${_microblog.pronouns}</p>
                <p class="name"><a style="color:var(--crust);" target="_blank" href="${author.url}">${author.url} ${externalLinkSVG()}</a></p>
                <p class="blurb">${_microblog.bio}</p>
                ${ _microblog.is_you && pins != '' ? '<b>My Micro.blog pins:</b><br/>' + pins : '' }
            </div>
        </div>`);
}

/**
 * Streams a timeline or conversations page for a user
 * @param  {object} ctx - The request context
 * @param  {object} controller - The controller of the readable stream     
 * @param  {bool} conversations - Shows timeline conversations
 */
async function streamTimelineOrConversations(ctx, controller, conversations = false) {
    const cookies = await getCookies(ctx);
    const name = await ctx.request.url.searchParams.get('name');
    const last = await ctx.request.url.searchParams.get('last');
    const before = await ctx.request.url.searchParams.get('before');
    const darkmodeCookie = await ctx.cookies.get('darkMode');
    controller.enqueue(beginHTMLTemplate(cookies.avatar, cookies.username, conversations ? "Conversations" : name ? name : "Timeline", darkmodeCookie));  

    if(name && (name == "news" || name == "challenges" || name == "monday"))
    {
        controller.enqueue(discoverMenuTemplate());
        await streamDiscoverTags(ctx, controller); 
    } else {
        controller.enqueue(mainMenuTemplate(true, false));
        await streamPinned(ctx, controller); 
    }  

    controller.enqueue(`<div class="posts">`);

    const result = await getMicroBlogTimeline(name, last, cookies.access_token);
    const posts = result ? result.items : [];

    if(!posts || posts.length == 0) {
        controller.enqueue(`<p>No data returned from Micro.Blog</p>`); 
        controller.close();
    } else {
        if (name) {
            await streamUserProfile(ctx, controller, result.author, result._microblog);
            controller.enqueue(postMenuBarTemplate(conversations ? 'conversations' : 'posts', name, false)); 
        } else {
            controller.enqueue(postMenuBarTemplate(conversations ? 'conversations' : 'posts', name));
        }
        
        if(conversations) {
            const filtered = posts.filter(p => p._microblog != undefined && p._microblog.is_mention);
            const roots = [];
            for(let i = 0; i < filtered.length; i++ ){
                const convo = await getMicroBlogConversation(filtered[i].id, cookies.access_token);
                const rootId = convo.items[convo.items.length - 1].id;
                if(!roots.includes(rootId)){
                    await streamPosts(ctx, controller, convo.items, true);
                    roots.push(rootId);
                }    
            }
        }
        else {
            const filtered = posts.filter(p => p._microblog != undefined && !p._microblog.is_mention);
            await streamPosts(ctx, controller, filtered);
        }
    
        //paging not implemented via M.B. API for the user timeline
        controller.enqueue(`<p class="center">`);
        if(!name && (last || before) && posts[0]) {
            await streamPreviousPageLink(ctx, controller, posts[0].id);
        }
        if(!name && posts[posts.length - 1]) {
            await streamNextPageLink(ctx, controller, posts[posts.length - 1].id);
        }
        controller.enqueue(`</p></section></div>`);

        
        controller.enqueue(`</div>${endHTMLTemplate()}`); 
        controller.close();
    }
}

/**
 * Streams a manage users page for a user
 * @param  {object} ctx - The request context
 * @param  {object} controller - The controller of the readable stream     
 * @param  {string} type - The page type
 * @param  {string} title - The title of the page
 */
async function streamManageUsersPage(ctx, controller, type, title) {
    const cookies = await getCookies(ctx);
    const darkmodeCookie = await ctx.cookies.get('darkMode');

    controller.enqueue(beginHTMLTemplate(cookies.avatar, cookies.username, title, darkmodeCookie));  
    controller.enqueue(mainMenuTemplate(true, true));
    controller.enqueue(`<div class="posts">`);
    controller.enqueue(`<div class="switch-field">
        <a ${type == 'following' ? 'class="selected"' : ''} href="/app/users/following">Following</a>
        <a ${type == 'muting' ? 'class="selected"' : ''} href="/app/users/muted">Muted</a>
        <a ${type == 'blocking' ? 'class="selected"' : ''} href="/app/users/blocked">Blocked</a></div>`);
    const fetching = await microBlogGet(type == 'following' ? `users/following/${cookies.username}` : `users/${type}`, cookies.access_token);
    const items = await fetching.json();

    if(type != 'following') {
        controller.enqueue(`<p style="text-align:center">To unmute or unblock a user go to their profile page.</p>`);
    } 

    for(let i=0; i<items.length; i++){
        const item = items[i];
        if(type == 'following') {
            const fetchingPosts = await microBlogGet('posts/' + item.username, cookies.access_token);
            const posts = await fetchingPosts.json();
            if(posts && posts.items[0]) {
                controller.enqueue(postContentTemplate(item.id, item.username, item.name, item.avatar, item.url, `last post was ${posts.items[0]._microblog ? posts.items[0]._microblog.date_relative : ''}`, posts._microblog ? posts._microblog.bio : '', '', true));
            }
        } else {
            controller.enqueue(postContentTemplate(item.id, item.username, item.username, undefined, undefined, undefined, '', '', true));
        }
        controller.enqueue(`</section></article>`);
    }
    if(items.length == 0) {
        controller.enqueue(`<p class="screen-width">You are not ${type} any users.</p>`);
    }
    controller.enqueue(`</div>${endHTMLTemplate()}`);  
    controller.close();
}

/**
 * Streams a toggle for switching between Micro.blog, blog accounts.
 * @param  {object} ctx - The request context
 * @param  {object} controller - The controller of the readable stream     
 * @param  {string} destination - The current destination name, if any.
 * @param  {string} url - The url of the action.
 */
async function streamAccountSwitch(ctx, controller, destination, url) {
    const cookies = await getCookies(ctx);
    const fetching = await microBlogGet('micropub?q=config', cookies.access_token);
    const config = await fetching.json();
    const destinations = config.destination.filter(d => d.uid != destination);

    const destinationBtns = destinations.map(function(des) { return `<a class="button" target="_top" href="${url}?destination=${encodeURIComponent(des.uid)}">${des.name}</a>&nbsp;`}).join(' ');

    if(config.destination.length > 1) {
        controller.enqueue(`
            <details class="screen-width">
                <summary>Viewing posts from: <b>${destination}</b></summary>
                <div style="margin-top:var(--space-3xs);">
                    <p>Switch to: ${destinationBtns}</p>
                </div>
            </details>`);
    }
    else
    {
        controller.enqueue(`<p class="center">${destination}</p>`);
    } 
}

/**
 * Streams a toggle for switching between Micro.blog, blog accounts.
 * @param  {string} access_token - The micro.blog access token
 * @param  {string} title - The title of the post    
 * @param  {string} content - The content of the post
 * @param  {string} destination - The destination of the post
 * @param  {string} status - The status of the post
 * @param  {array} postCategories - The categories of the post
 * @param  {string} id - The id of the post (if any)
 */
async function createOrEditPostPage(access_token, title, content, destination, status, postCategories = [], id = '') {
    let fetching = await microBlogGet(`micropub?q=config`, access_token);
    const config = await fetching.json();

    const syndicate = await microBlogGet(`micropub?q=syndicate-to`, access_token);
    const syndicates = await syndicate.json();

    let syndicateTo = '';
    for(let i = 0; i < syndicates['syndicate-to'].length; i++) {
        syndicateTo += `<label style="display:inline;"><input checked="checked" type="checkbox" name="syndicate[]" value="${syndicates['syndicate-to'][i].uid}"/>${syndicates['syndicate-to'][i].name}</label>&nbsp;`;
    }

    fetching = await microBlogGet(`micropub?q=category${destination ? '&mp-destination=' + destination : ''}`, access_token);
    const categories = await fetching.json();

    let destinationSelect = `<select style="display:none;" name="destination">`;
    for(let i = 0; i < config.destination.length; i++) {
        destinationSelect += `<option ${config.destination[i].uid == destination ? 'selected="selected"' : ''} value="${config.destination[i].uid}">${config.destination[i].uid}</option>`;
    }
    destinationSelect += '</select>';

    let categoriesList = '';
    if(categories != null ) {
        for(let j=0; j<categories.categories.length;j++)
        {
            const category = categories.categories[j];
            const checked = postCategories.length > 0 && postCategories.includes(category);
            categoriesList += `<label style="display:inline;"><input ${checked ? 'checked="checked"' : ''} type="checkbox" name="category[${category}]" value="${category}"/>${category}</label>&nbsp;`;
        }
    }

    const emojiFetch = await microBlogGet('posts/discover', access_token);
    const discover = await emojiFetch.json();
    let emojiList = discover._microblog.tagmoji.map(function(tag){ return `<li>${tag.emoji} ${tag.title}</li>` }).join(' ');

    return `
        <script>${_compressor}</script>
        <style>${_easyMDECSS}</style>
        <style>
        .CodeMirror {
            color: var(--text) !important;
        }
        </style>
        <script>${_easyMDEJS}</script>
        <form action="/app/blog/post" method="POST" enctype="multipart/form-data">
            <input name="url" type="hidden" value="${id}" />
            <label>
                Post Title (optional)
                <input type="text" name="title" style="width:100%;" value="${title ? title : ''}" />
            </label>
            <div style="margin-bottom: 1em;">
                <textarea style="width:100%" id="content" rows="7" name="content">${content ? content : ''}</textarea>
                <script>
                const easymde = new EasyMDE({
                    element: document.getElementById('content'),
                    uploadImage: true,
                    spellChecker: true,
                    status: ["autosave", "lines", "words", "cursor", {
                        className: "keystrokes",
                        defaultValue: (el) => {
                            //el.setAttribute('data-keystrokes', 0);
                        },
                        onUpdate: (el) => {
                            const keystrokes = Number(el.getAttribute('data-keystrokes'));
                            const content = easymde.value() || '';
                            const images = content.split('![');
                            let text = images[0];
                            
                            if(images.length > 1) {
                                for(let i = 0; i<images.length; i = i + 2) {
                                    let subchunks = images[i + 1] ? images[i + 1].split(')') : [];
                                    subchunks[0] = '';
                                    text += subchunks.join('');
                                }
                            }

                            const chunks = text.split('](');
                            let count = chunks[0].replace('[','').length;
                            if(chunks.length > 1) {
                                for(let i = 1; i < chunks.length; i++) {
                                    let subchunks = chunks[i].replace('[','').split(')');
                                    if(subchunks.length > 1) {
                                        count += subchunks[1].length;
                                    }
                                }
                            } else {
                                count = text.length;
                            }
                            el.innerHTML = 'characters: ' + count + '/300';
                            if(count > 300) {
                                el.classList.add('overage');
                            }
                            else {
                                el.classList.remove('overage');
                            }
                        },
                    }],
                    imageUploadFunction: async (image, onSuccess, onError) => {
                        let formData = new FormData();
                        formData.append("destination", "${destination}");  
                        ${compressImageClientFunctionTemplate(`onSuccess(body)`)}
                    },
                });
                </script>
            </div>
            <details style="background-color:var(--mantle);font-size:var(--step--1)">
                <summary style="background-color:var(--mantle);margin-bottom:0">Micro.blog tag list</summary>
                <p>Use an emoji below in your text to tag your post for a Micro.blog tagmoji feed.</p>
                <ul style="list-style:none;columns: 2;-webkit-columns: 2;-moz-columns: 2;">${emojiList}</ul>
            </details>
            <p>Categories</p>
            <p>${categoriesList}</p>
            ${syndicateTo ? `<p>Crossposting</p><p>${syndicateTo}</p>` : ''}
            ${destinationSelect}
            <p><select name="status">
                    <option value="publish" ${status == "published" ? 'selected="selected"' : ''}>publish</option>
                    <option value="draft" ${status == "draft" ? 'selected="selected"' : ''}>draft</option>
                </select></p>
            <p><button>Save & Submit</button></p>
        </form>
        `;
}

// --------------------------------------------------------------------------------------
// Pages: Middleware redirects to login page if the cookie with the access_token is missing.
// --------------------------------------------------------------------------------------

await router.get("/", async (ctx, next) => {
    const cookies = await getCookies(ctx);
    const marketingPage = await fetch('https://heyloura.com/lillihub/');
    const html = await marketingPage.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html);
    const body = doc.querySelector('main').toString();
    const darkmodeCookie = await ctx.cookies.get('darkMode');

    ctx.response.body = `
        ${beginHTMLTemplate(cookies.avatar, cookies.username, 'Lillihub', darkmodeCookie)}
        </aside>
        <style>.u-grid{display:block;}svg{filter: invert(84%) sepia(11%) saturate(978%) hue-rotate(69deg) brightness(89%) contrast(92%);}
        img{box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;}
        li span {text-align:center;} 
        li span img, h3 {margin-bottom: var(--space-xl) !important;}
        h3 {border-top: 1px solid var(--crust);padding-top: var(--space-xl) !important;}
        b {display:block;}</style>
        <div class="posts" style="padding:var(--space-3xs);">
            ${body}
        </div>
        <script src="https://tinylytics.app/embed/5r2JkhATuM6jGxmbdcdV.js" defer></script>
        ${endHTMLTemplate()}
    `;

  return await next();
});

/**
 * For more info about indieAuth see: https://indieauth.spec.indieweb.org/
 * @todo Allow for custom indieauth and not just Micro.blog
 */
await router.get("/app/login", async (ctx, next) => {
    const uuid = crypto.randomUUID();
    ctx.cookies.set("state", uuid);
    ctx.response.body = `
        ${beginHTMLTemplate()}
        </aside>
        <div class="posts" style="padding:var(--space-3xs);">
        <h1>Log in using Micro.blog</h1>
        <form action="https://micro.blog/indieauth/auth" method="get">
            <label>
            Your https://username.micro.blog website or your custom domain if you have one.
            <br/><br/><input type="url" name="me" value="https://" required/>
            </label>
            <input type="hidden" name="client_id" value="${_appURL}"/>
            <input type="hidden" name="redirect_uri" value="${_appURL}/app/auth"/>
            <input type="hidden" name="state" value="${uuid}"/>
            <input type="hidden" name="scope" value="create"/>
            <input type="hidden" name="response_type" value="code"/>
            <button type="submit" class="signIn">Sign In</button>
        </form> 
        </div>
        <script src="https://tinylytics.app/embed/5r2JkhATuM6jGxmbdcdV.js" defer></script>
        ${endHTMLTemplate()}
    `;
    return await next();
});

/**
 * For more info about indieAuth see: https://indieauth.spec.indieweb.org/
 * @todo Pass along errors to the login page for display
 */
await router.get("/app/auth", async (ctx, next) => {
    const code = ctx.request.url.searchParams.get('code');
    const state = ctx.request.url.searchParams.get('state');
    const cookieState = await ctx.cookies.get('state');

    if(cookieState == state) {
        const formBody = new URLSearchParams();
            formBody.append("code", code);
            formBody.append("client_id", _appURL);
            formBody.append("grant_type", "authorization_code");

        const fetching = await microBlogPostForm('indieauth/token', formBody, null, 'application/json');
        const response = await fetching.json();
        const expiresOn = new Date(Date.now() + 12096e5); // two weeks
        
        ctx.cookies.set("access_token", response.access_token, { expires: expiresOn});
        ctx.cookies.set("name", encodeURIComponent(response.profile.name), { expires: expiresOn});
        ctx.cookies.set("avatar", response.profile.photo, { expires: expiresOn});

        const user = await getMicroBlogLoggedInUser(response.access_token);
        ctx.cookies.set("username", encodeURIComponent(user.username), { expires: expiresOn});
        ctx.cookies.set("default", encodeURIComponent(user.default_site), { expires: expiresOn});

        ctx.response.redirect('/app/timeline');
    } else {
        ctx.response.redirect('/app/login');
    }
    return await next();
});

await router.get("/app/settings", async (ctx, next) => {
    const cookies = await getCookies(ctx);
    const contentFilterCookie = await ctx.cookies.get('contentFilter');
    const limitCookie = await ctx.cookies.get('limitComments');
    const contentFilters = contentFilterCookie == undefined ? [] : JSON.parse(contentFilterCookie);
    const darkmodeCookie = await ctx.cookies.get('darkMode');
  
    ctx.response.body = `
        ${beginHTMLTemplate(cookies.avatar, cookies.username, 'Settings', darkmodeCookie)}
        ${mainMenuTemplate()} 
            <div class="posts">
                <div style="margin-bottom: var(--space-m);display:block;" class="profile">
                    <h3>Content filters</h3>
                    <p>A comma seperated list of terms that lillihub will use to exclude posts and comments from showing.</p>
                    <form method="POST" target="excludeStatus">
                        <input type="hidden" name="type" value="filter" />
                        <div class="grow-wrap"><textarea name="exclude" onInput="growTextArea(this)">${contentFilters.join(', ')}</textarea></div>
                        <button type="submit">Save content filter list</button>
                    </form>
                    <iframe srcdoc='${iFrameTemplate('', darkmodeCookie)}' name="excludeStatus" width="220" height="35"></iframe> 
                    
                    <h3>Display comment limit</h3>
                    <p>This is the number of comments that are allowed to show on the feeds. 
                        This is to prevent large comment threads from slowing down the application.
                        <br/><em><small>Note: An individual post view (Actions -> "View Post") still shows all comments.</small></em></p>
                    <form method="POST" target="limitStatus">
                        <input type="hidden" name="type" value="setLimit" />
                        <input type="number" step="1" min="0" max="5000" name="limit" value="${limitCookie ? limitCookie : 25}" />
                        <button type="submit">Save display comment limit</button>
                    </form>
                    <iframe srcdoc='${iFrameTemplate('', darkmodeCookie)}' name="limitStatus" width="220" height="35"></iframe> 

                    <h3>Always dark theme</h3>
                    <p>Have Lillihub use the dark theme. Overrides browser/system <em><small>prefers-color-scheme</small></em>.
                    You will need to refresh the page to see the changes take effect.</p>
                    <form method="POST" target="darkThemeStatus">
                        <input type="hidden" name="type" value="darkmode" />
                        <label><input type="checkbox" name="enableDarkMode" ${darkmodeCookie ? 'checked="checked"' : ''} /> Enable dark theme</label>
                        <button type="submit">Save dark theme setting</button>
                    </form>
                    <iframe srcdoc='${iFrameTemplate('', darkmodeCookie)}' name="darkThemeStatus" width="220" height="35"></iframe> 
                </div>
            <div>
        ${endHTMLTemplate()} 
    `;
    
    return await next();
});

await router.get("/app/timeline", async (ctx, next) => {   
    ctx.response.body = new ReadableStream({
        async start(controller) {
            await streamTimelineOrConversations(ctx, controller);
        }
    });
    return await next();
});

await router.get("/app/conversations", async (ctx, next) => {
    ctx.response.body = new ReadableStream({
        async start(controller) {
            await streamTimelineOrConversations(ctx, controller, true);
        }
    });
    return await next();
});


await router.get("/app/photos", async (ctx, next) => {
    const cookies = await getCookies(ctx);
    const name = await ctx.request.url.searchParams.get('name');
    const darkmodeCookie = await ctx.cookies.get('darkMode');

    ctx.response.body = new ReadableStream({
        async start(controller) {
            controller.enqueue(beginHTMLTemplate(cookies.avatar, cookies.username, "Photos", darkmodeCookie));  
        
            controller.enqueue(mainMenuTemplate(true, false));
            await streamPinned(ctx, controller); 
        
            controller.enqueue(`<div class="posts">`);
            const result = await getMicroBlogTimelinePhotos(name, cookies.access_token);
            const posts = result.items;
        
            await streamUserProfile(ctx, controller, result.author, result._microblog);
            controller.enqueue(postMenuBarTemplate('photos', name, false)); 
            if(posts.length > 0) {
                controller.enqueue(`<div class="screen-width" id="photos">${posts.map(function(post){ return `<a href="/app/post?id=${post.id}"><img src="https://micro.blog/photos/400/${post.image}" loading="lazy"/></a>`; }).join('')}</div>`);
            } else {
                controller.enqueue(`<div class="screen-width"><p style="text-align:center">No photos shared.</p></div>`); 
            }
            controller.enqueue(`</div>${endHTMLTemplate()}`); 
            controller.close();
        }
    });
    return await next();
});

await router.get("/app/mentions", async (ctx, next) => {
    const cookies = await getCookies(ctx);
    const last = await ctx.request.url.searchParams.get('last');
    const darkmodeCookie = await ctx.cookies.get('darkMode');

    ctx.response.body = new ReadableStream({
        async start(controller) {
            controller.enqueue(beginHTMLTemplate(cookies.avatar, cookies.username, "Mentions", darkmodeCookie));  
            controller.enqueue(mainMenuTemplate(true, false));
            await streamPinned(ctx, controller); 
            controller.enqueue(`<div class="posts">`);
            
            const fetching = await microBlogGet(last ? `posts/mentions?before_id=${last}` : 'posts/mentions', cookies.access_token);
            const results = await fetching.json();
            const posts = results.items;
            controller.enqueue(postMenuBarTemplate('mentions', null));  

            const roots = [];
            for(let i = 0; i < posts.length; i++ ){
                const convo = await getMicroBlogConversation(posts[i].id, cookies.access_token);
                const rootId = convo.items[convo.items.length - 1].id;
                if(!roots.includes(rootId)){
                    await streamPosts(ctx, controller, convo.items, true);
                    roots.push(rootId);
                }    
            }      
            controller.enqueue(`</div>${endHTMLTemplate()}`); 
            controller.close();
        }
    });
    
    ctx.response.headers = {"content-type": "text/html", "x-content-type-options": "nosniff" };
    return await next();
});

await router.get("/app/discover", async (ctx, next) => {
    const cookies = await getCookies(ctx);
    const darkmodeCookie = await ctx.cookies.get('darkMode');

    ctx.response.body = new ReadableStream({
        async start(controller) {
            controller.enqueue(beginHTMLTemplate(cookies.avatar, cookies.username, "Discover", darkmodeCookie));  
            controller.enqueue(discoverMenuTemplate());
            await streamDiscoverTags(ctx, controller);
            controller.enqueue(`<div class="posts">`);
            const posts = (await getMicroBlogDiscover(null, cookies.access_token)).items; 
            await streamPosts(ctx, controller, posts);
            
            controller.enqueue(`</div>${endHTMLTemplate()}`); 
            controller.close();
        }
    });
    
    ctx.response.headers = {"content-type": "text/html", "x-content-type-options": "nosniff" };
    return await next();
});

await router.get("/app/tag", async (ctx, next) => {
    const cookies = await getCookies(ctx);
    const tag = await ctx.request.url.searchParams.get('name');
    const darkmodeCookie = await ctx.cookies.get('darkMode');

    ctx.response.body = new ReadableStream({
        async start(controller) {
            controller.enqueue(beginHTMLTemplate(cookies.avatar, cookies.username, "Discover", darkmodeCookie));  
            controller.enqueue(discoverMenuTemplate());
            await streamDiscoverTags(ctx, controller);
            controller.enqueue(`<div class="posts">`);
            const posts = (await getMicroBlogDiscover(tag, cookies.access_token)).items; 
            await streamPosts(ctx, controller, posts);
            
            controller.enqueue(`</div>${endHTMLTemplate()}`); 
            controller.close();
        }
    });
    
    ctx.response.headers = {"content-type": "text/html", "x-content-type-options": "nosniff" };
    return await next();
});

await router.get("/app/post", async (ctx, next) => {
    const id = await ctx.request.url.searchParams.get('id');
    const cookies = await getCookies(ctx);
    const darkmodeCookie = await ctx.cookies.get('darkMode');

    ctx.response.body = new ReadableStream({
        async start(controller) {
            controller.enqueue(beginHTMLTemplate(cookies.avatar, cookies.username, `Post: ${id}`, darkmodeCookie));  
            controller.enqueue(mainMenuTemplate(true, false));
            await streamPinned(ctx, controller); 

            controller.enqueue(`<div class="posts">`);
            
            const convo = await getMicroBlogConversation(id, cookies.access_token);
            await streamPosts(ctx, controller, convo.items, true, true, true, true);

            controller.enqueue(`</div>${endHTMLTemplate()}`);
            controller.close(); 
        }
    });

    ctx.response.headers = {"content-type": "text/html", "x-content-type-options": "nosniff" };
    return await next();
});

await router.get("/app/users/following", async (ctx, next) => {
    ctx.response.body = new ReadableStream({
        async start(controller) {
            await streamManageUsersPage(ctx, controller, "following", "Following"); 
        }
    });
    
    ctx.response.headers = {"content-type": "text/html", "x-content-type-options": "nosniff" };
    return await next();
});

await router.get("/app/users/muted", async (ctx, next) => {
    ctx.response.body = new ReadableStream({
        async start(controller) {
            await streamManageUsersPage(ctx, controller, "muting", "Muted"); 
        }
    });
    
    ctx.response.headers = {"content-type": "text/html", "x-content-type-options": "nosniff" };
    return await next();
});

await router.get("/app/users/blocked", async (ctx, next) => {
    ctx.response.body = new ReadableStream({
        async start(controller) {
            await streamManageUsersPage(ctx, controller, "blocking", "Blocked"); 
        }
    });
    
    ctx.response.headers = {"content-type": "text/html", "x-content-type-options": "nosniff" };
    return await next();
});

await router.get("/app/bookmarks", async (ctx, next) => {
    const cookies = await getCookies(ctx);
    const id = await ctx.request.url.searchParams.get('id');
    const darkmodeCookie = await ctx.cookies.get('darkMode');

    ctx.response.body = new ReadableStream({
        async start(controller) {
            controller.enqueue(beginHTMLTemplate(cookies.avatar, cookies.username, id ? id : 'Bookmarks', darkmodeCookie));  
            const user = await getMicroBlogLoggedInUser(cookies.access_token);
            
            controller.enqueue(mainMenuTemplate(true, !user.is_premium));
            if(user.is_premium) {      
                await streamBookmarkTags(ctx, controller); 
            }

            controller.enqueue(`<div class="posts">`);
            if(!id) {
                controller.enqueue(`<div style="margin-bottom: var(--space-m);display:block;" class="profile">
                    <form method="POST" action="/app/bookmarks/new">
                        <label>Add Bookmark:<br/><br/><input type="url" name="url" /></label>
                        <button type="submit">Add Bookmark</button>
                    </form></div>`);
            }

            const fetching = await microBlogGet(id ? `posts/bookmarks?tag=${id}` : 'posts/bookmarks', cookies.access_token);
            const bookmarks = await fetching.json();

            await streamPosts(ctx, controller, bookmarks.items, false, false, true, false);

            controller.enqueue(`</div>${endHTMLTemplate()}`); 
            controller.close();
        }
    });

    ctx.response.headers = {"content-type": "text/html", "x-content-type-options": "nosniff" };
    return await next();
});

await router.get("/app/bookshelves", async (ctx, next) => {
    const cookies = await getCookies(ctx);
    const id = await ctx.request.url.searchParams.get('id');
    const darkmodeCookie = await ctx.cookies.get('darkMode');

    ctx.response.body = new ReadableStream({
        async start(controller) {
            controller.enqueue(beginHTMLTemplate(cookies.avatar, cookies.username, 'Bookshelves', darkmodeCookie));             
            controller.enqueue(mainMenuTemplate(true, false));
            await streamBookshelfLinks(ctx, controller);

            if(!id) {
                // Show the goals and recent book posts when a bookshelf is not selected.
                controller.enqueue(`<div class="posts">`);
                controller.enqueue(`<details class="screen-width"><summary>Add new bookshelf</summary>
                    <form method="POST" action="/app/bookshelves/addBookshelf">
                        <label>Bookshelf Name:<br/><br/><input type="text" name="name"/></label>
                        <button type="submit">Add Bookshelf</button>
                    </form>
                    </details>
                    <div style="color:var(--base);margin-bottom: var(--space-m);display:block;" class="profile purple-red">`);
                
                const fetchingGoals = await microBlogGet('books/goals', cookies.access_token);
                const goals = await fetchingGoals.json();

                controller.enqueue(`<p><b>Yearly reading goals:</b></p>`);
                controller.enqueue(goals.items.map(function (goal) { return `<p style="font-weight: 300;">${goal.title.replace("Reading ","")}: ${goal.content_text}</p>`}).join(' '))
                controller.enqueue(`</div>`);

                controller.enqueue(`<p class="screen-width">What other <b>micro.bloggers</b> are reading:</p>`);
                const posts = (await getMicroBlogDiscover('books', cookies.access_token)).items; 
                await streamPosts(ctx, controller, posts);
            } else {
                // Show the view for a selected bookshelf
                controller.enqueue(`<div class="posts">`);
                const bookshelves = await getMicroBlogBookshelves(cookies.access_token);            
                const fetchingBooks = await microBlogGet(`books/bookshelves/${id}`, cookies.access_token);
                const books = await fetchingBooks.json();

                if(books.items.length == 0) {
                    controller.enqueue(`<p style="margin:var(--space-s-m);">No books here yet.</p>`);
                }
                for(let i=0; i<books.items.length; i++) {
                    const book = books.items[i];
                    const newPost = `${books.title.replace("Micro.blog - ", '')}: [${book.title}](${book.url}) by ${book.authors.map(u => u.name).join(', ')} 📚`;
                    const actions = postActionTemplate(darkmodeCookie, book.id, null, false, {}, '', bookshelves.items, false, '', false, newPost, id);
                    controller.enqueue(`
                        <article class="post" data-id="${book.id}" style="display:block;">
                            <section style="display:flex; flex-direction: column;">
                                <header style="display:flex; flex-direction: row;">
                                    <div><img style="width: 128px" loading="lazy" src="${book.image}"></div>
                                    <div style="margin-left:var(--space-xs);margin-right: 100px;">             
                                        <p><b><a href="${book.url}">${book.title}</a></b></p>
                                        <p>By: ${book.authors.map(u => u.name).join(', ')}</p>
                                    </div>
                                    <div style="margin-left: auto;">${actions}</div>                   
                                </header> `);
                    controller.enqueue(`</section></article>`); 
                }
            }

            controller.enqueue(`</div>${endHTMLTemplate()}`); 
            controller.close();
        }
    });

    ctx.response.headers = {"content-type": "text/html", "x-content-type-options": "nosniff" };
    return await next();
});

await router.get("/app/blog/posts", async (ctx, next) => {
    const cookies = await getCookies(ctx);
    const destination = await ctx.request.url.searchParams.get('destination');
    const status = await ctx.request.url.searchParams.get('status');
    const darkmodeCookie = await ctx.cookies.get('darkMode');

    ctx.response.body = new ReadableStream({
        async start(controller) {
            controller.enqueue(beginHTMLTemplate(cookies.avatar, cookies.username, 'My Blog', darkmodeCookie));  
            controller.enqueue(mainMenuTemplate(true));
            controller.enqueue(`<div class="posts">`);

            const account = await getMicroBlogDestination(destination, cookies.access_token);
            await streamAccountSwitch(ctx, controller, account ? account.uid : '', '/app/blog/posts');
            
            controller.enqueue(`<style>pre {overflow: auto;}</style><div class="switch-field">
                    <a ${status ? '' : 'class="selected"'} href="/app/blog/posts${destination ? '?destination=' + encodeURIComponent(account.uid) : ''}">Recent Posts</a>
                    <a ${status ? 'class="selected"' : ''} href="/app/blog/posts?status=draft${destination ? '&destination=' + encodeURIComponent(account.uid) : ''}">Recent Drafts</a>
                </div>`);

            const fetching = await microBlogGet(`micropub?q=source${account ? '&mp-destination=' + account.uid : ''}`, cookies.access_token);
            const posts = await fetching.json();
            const postStatus = status ? "draft" : "published";
            posts.items = posts.items.filter(p => p.properties["post-status"][0] == postStatus);
            
            for(let i= 0; i < posts.items.length && i < 25; i++) {
                const post = posts.items[i].properties;

                const postActions = `<div class="actions">
                    <details style="border-radius: var(--space-3xs);color: var(--subtext-1);border: 1px solid var(--mantle);position: absolute;z-index: 5;background-color: var(--mantle);margin-left: -92px;">
                        <summary style="padding: var(--space-2xs); font-size: var(--step--1); margin: 0;">Actions</summary>
                        <div style="padding: var(--space-2xs); width: 200px; margin-left: -129px; background-color: var(--mantle);">
                            <a target="_top" href="/app/blog/post?id=${encodeURIComponent(post.url[0])}&destination=${encodeURIComponent(account.uid)}">Edit post</a>
                            <details class="actionExpand">
                                <summary class="actionExpandToggle">Delete</summary>
                                <form style="height: 100%;max-height: 300px;" method="POST" action="/app/blog/delete">
                                    <input type="hidden" name="destination" value="${account ? account.uid : ''}" />
                                    <input type="hidden" name="url" value="${post.url[0]}" />
                                    <button class="actionBtn" type="submit">Confirm Delete</button>
                                </form>
                            </details>
                        </div>
                    </details>
                </div>`;
                controller.enqueue(postContentTemplate(post.uid, cookies.username, cookies.name, cookies.avatar, post.url[0], post.published[0], post.name[0] ? `<h1>${post.name[0]}</h1>${marky(post.content[0])}` : marky(post.content[0]), postActions, true, post.published[0], false));
                controller.enqueue(`<p style="color:var(--subtext-1)"><small>categories: ${post.category.length > 0 ? post.category.join(', ') : 'No categories assigned.'}</small></p>`); 
                controller.enqueue(`</section></article>`);
            }

            controller.enqueue(`<p style="text-align:center">Need to edit more blog posts? Login to Micro.blog.</p></div>${endHTMLTemplate()}`); 
            controller.close();
        }
    });

    ctx.response.headers = {"content-type": "text/html", "x-content-type-options": "nosniff" };
    return await next();
});

await router.get("/app/blog/media", async (ctx, next) => {
    const cookies = await getCookies(ctx);
    const destination = await ctx.request.url.searchParams.get('destination');
    const darkmodeCookie = await ctx.cookies.get('darkMode');

    ctx.response.body = new ReadableStream({
        async start(controller) {
            const account = await getMicroBlogDestination(destination, cookies.access_token);

            controller.enqueue(beginHTMLTemplate(cookies.avatar, cookies.username, 'My Media', darkmodeCookie));  
            controller.enqueue(`<script>${_compressor}</script>`);    
            controller.enqueue(`<script>
            async function handleImageUpload(event) {
                document.getElementById('progress').style.display = 'inline-block';
                const image = event.target.files[0];
                let formData = new FormData();
                formData.append("destination", "${account ? account.uid : ''}");
                ${compressImageClientFunctionTemplate('window.location.reload()')}
            }
            </script>`);
            
            controller.enqueue(mainMenuTemplate(true));
            controller.enqueue(`<div class="posts">`);
            
            await streamAccountSwitch(ctx, controller, account ? account.uid : '', '/app/blog/media');
            controller.enqueue(`
                <div class="profile" style="color:var(--text);font-weight:300;display:block;background-color:var(--mantle);">
                <form id="uploadForm" action="/app/blog/upload" method="POST" enctype="multipart/form-data">
                    <p>Upload an image file. Files over 3 MB will be compressed.</p>
                    <input id="media" name="media" type="file" accept="image/*" onchange="handleImageUpload(event);" style="width:220px" />
                    <input type="hidden" name="destination" value="${account ? account.uid : ''}"/>
                    <input type="hidden" id="redirect" name="redirect" value="true"/>
                    <button id="submitBtn" type="submit">Upload</button>
                    <span style="display:none;animation: spin 2s linear infinite;" id="progress">🐢</span>
                </form>
                <script>
                    document.getElementById('submitBtn').style.display = 'none';
                    let elem = document.getElementById('redirect');
                    elem.parentNode.removeChild(elem);
                </script>
                </div>`);

            const media = await getMicroBlogMedia(account, cookies.access_token);
            controller.enqueue(`<section class="posts" id="photos">`);
            controller.enqueue(media.items.map(i => postContentTemplate(i.url, 
                cookies.username, 
                i.published.split('T')[0], 
                '', 
                i.url, 
                i.url.split('/')[i.url.split('/').length - 1], 
                i.poster ? `<video controls="controls" playsinline="playsinline" src="${i.url}" preload="none"></video>` : `<img src="${i.url}"/>`, 
                `<div class="actions">
                    <details style="border-radius: var(--space-3xs);color: var(--subtext-1);border: 1px solid var(--mantle);position: absolute;z-index: 5;background-color: var(--mantle);margin-left: -92px;">
                        <summary style="padding: var(--space-2xs); font-size: var(--step--1); margin: 0;">Actions</summary>
                        <div style="padding: var(--space-2xs); width: 200px; margin-left: -129px; background-color: var(--mantle);">
                            <a class="clear" href="/app/blog/post?content=${encodeURIComponent('![]('+i.url+')')}${account ? '&destination=' + account.uid : ''}">Create Post</a>
                            <details class="actionExpand">
                                <summary class="actionExpandToggle">Delete</summary>
                                <form method="POST" action="/app/blog/media/delete">
                                <input type="hidden" name="destination" value="${account ? account.uid : ''}" />
                                <input type="hidden" name="url" value="${i.url}" />
                                <button type="submit">Confirm Delete</button>
                            </form>
                            </details>
                        </div>
                    </details>
                </div>`, 
                true) + '</section></article>').join(''));
            controller.enqueue(`</div>${endHTMLTemplate()}`); 
            controller.close();
        }
    });

    ctx.response.headers = {"content-type": "text/html", "x-content-type-options": "nosniff" };
    return await next();
});

await router.get("/app/blog/post", async (ctx, next) => {
    const cookies = await getCookies(ctx);
    const id = await ctx.request.url.searchParams.get('id');
    const destination = await ctx.request.url.searchParams.get('destination');
    const content = await ctx.request.url.searchParams.get('content');
    const darkmodeCookie = await ctx.cookies.get('darkMode');

    ctx.response.body = new ReadableStream({
        async start(controller) {
            const account = await getMicroBlogDestination(destination, cookies.access_token);

            controller.enqueue(beginHTMLTemplate(cookies.avatar, cookies.username, id ? 'Edit Post' : 'Create Post', darkmodeCookie));              
            controller.enqueue(mainMenuTemplate(true));
            controller.enqueue(`<div class="posts">`);
            
            await streamAccountSwitch(ctx, controller, account ? account.uid : '', '/app/blog/post');
            
            controller.enqueue(`<div class="profile profile-dark"><div style="margin-top:var(--space-s-m)" class="form">`);
            
            // Check if we are editing a post or not.
            if(id) {
                const fetching = await microBlogGet(`micropub?q=source&properties=content&url=${id}${destination ? '&mp-destination=' + destination : ''}`, cookies.access_token);
                const post = await fetching.json();

                controller.enqueue(await createOrEditPostPage(cookies.access_token, post.properties.name[0], post.properties.content[0], account ? account.uid : '', post.properties["post-status"][0], post.properties.category, post.properties.url));  
            } else {
                controller.enqueue(await createOrEditPostPage(cookies.access_token, '', content, account ? account.uid : '', 'published'));     
            }
            
            controller.enqueue(`</div></div>`);
            controller.enqueue(`</div>${endHTMLTemplate()}`); 
            controller.close();
        }
    });

    ctx.response.headers = {"content-type": "text/html", "x-content-type-options": "nosniff" };
    return await next();
});

await router.get("/app/replies", async (ctx, next) => {
    const cookies = await getCookies(ctx);
    const darkmodeCookie = await ctx.cookies.get('darkMode');

    ctx.response.body = new ReadableStream({
        async start(controller) {
            controller.enqueue(beginHTMLTemplate(cookies.avatar, cookies.username, 'Replies', darkmodeCookie));  
            controller.enqueue(mainMenuTemplate(true));

            controller.enqueue(`<div class="posts">`);
            controller.enqueue(`<p class="center"><a target="_blank" class="button" href="https://micro.blog/account/replies">Manage replies on Micro.blog ${externalLinkSVG()}</a></p>`);

            const fetching = await microBlogGet('posts/replies?count=100', cookies.access_token);
            const replies = await fetching.json();

            await streamPosts(ctx, controller, replies.items, false, false, true, false);

            controller.enqueue(`</div>${endHTMLTemplate()}`); 
            controller.close();
        }
    });

    ctx.response.headers = {"content-type": "text/html", "x-content-type-options": "nosniff" };
    return await next();
});


// --------------------------------------------------------------------------------------
// POST Requests
// --------------------------------------------------------------------------------------
await router.post("/app/settings", async (ctx, next) => {
    const body = ctx.request.body({ type: 'form' });
    const darkmodeCookie = await ctx.cookies.get('darkMode');
    const type = (await body.value).get('type');

    if(type == "filter") {
        const exclude = (await body.value).get('exclude');

        const result = exclude.split(',').map(function (value) {
            return value.toLowerCase().trim();
        });
            
        ctx.cookies.set("contentFilter", JSON.stringify(result), { expires: new Date(Date.now() + 315600000000)}); // 10 years
        ctx.response.body = iFrameTemplate('<small class="success">Saved filters.</small>', darkmodeCookie); 
    } else if(type == "setLimit") {
        const limit = (await body.value).get('limit');
        const newLimit = parseInt(limit);
        if(newLimit) {
            ctx.cookies.set("limitComments", limit, { expires: new Date(Date.now() + 315600000000)}); // 10 years
            ctx.response.body = iFrameTemplate('<small class="success">Saved limit.</small>', darkmodeCookie); 
        } else {
            ctx.response.body = iFrameTemplate('<small class="error">Failed.</small>', darkmodeCookie); 
        }
    } else if(type == "darkmode") {
        const darkMode = (await body.value).get('enableDarkMode');
        if(darkMode == "on"){
            ctx.cookies.set("darkMode", true, { expires: new Date(Date.now() + 315600000000)}); // 10 years
            ctx.response.body = iFrameTemplate('<small class="success">Saved preference.</small>', darkmodeCookie); 
        } else {
            ctx.cookies.set("darkMode", false, { expires: new Date(Date.now() + 315600000000)}); // 10 years
            ctx.response.body = iFrameTemplate('<small class="success">Saved preference.</small>', darkmodeCookie); 
        }
    }

    return await next();
});

await router.post("/app/users/follow", async (ctx) => {
    const access_token = await ctx.cookies.get('access_token');
    const darkmodeCookie = await ctx.cookies.get('darkMode');
    const body = ctx.request.body({ type: 'form' });
    const value = await body.value;
    const username = value.get('username');

    const fetching = await microBlogSimplePost(`users/follow?username=${username}`, access_token);
    const response = await fetching.text();
    try {
        JSON.parse(response);
        ctx.response.body = iFrameTemplate(`<form action="/app/users/unfollow" method="POST">
            <input type="hidden" name="username" value="${username}" />
            <button type="submit">Unfollow</button>
        </form>`, darkmodeCookie); 
    }
    catch {
        ctx.response.body = iFrameTemplate(`<small class="fail">Unsuccessful.</small>'`, darkmodeCookie); 
    }
});

await router.post("/app/users/unfollow", async (ctx) => {
    const access_token = await ctx.cookies.get('access_token');
    const body = ctx.request.body({ type: 'form' });
    const value = await body.value;
    const username = value.get('username');
    const fetching = await microBlogSimplePost(`users/unfollow?username=${username}`, access_token);
    const response = await fetching.text();
    const darkmodeCookie = await ctx.cookies.get('darkMode');

    try {
        JSON.parse(response);
        ctx.response.body = iFrameTemplate(`<form action="/app/users/follow" method="POST">
            <input type="hidden" name="username" value="${username}" />
            <button type="submit">follow</button>
        </form>`, darkmodeCookie); 
    }
    catch {
        ctx.response.body = iFrameTemplate(`<small class="fail">Unsuccessful.</small>'`, darkmodeCookie); 
    }
});

await router.post("/app/users/block", async (ctx) => {
    const access_token = await ctx.cookies.get('access_token');
    const body = ctx.request.body({ type: 'form' });
    const value = await body.value;
    const username = value.get('username');
    const fetching = await microBlogSimplePost(`users/block?username=${username}`, access_token);
    const response = await fetching.text();
    const darkmodeCookie = await ctx.cookies.get('darkMode');

    try {
        JSON.parse(response);
        ctx.response.body = iFrameTemplate(`<form action="/app/users/unblock" method="POST">
            <input type="hidden" name="username" value="${username}" />
            <button type="submit">Unblock</button>
        </form>`, darkmodeCookie); 
    }
    catch {
        ctx.response.body = iFrameTemplate(`<small class="fail">Unsuccessful.</small>'`, darkmodeCookie); 
    }  
});

await router.post("/app/users/mute", async (ctx) => {
    const access_token = await ctx.cookies.get('access_token');
    const body = ctx.request.body({ type: 'form' });
    const value = await body.value;
    const username = value.get('username');
    const fetching = await microBlogSimplePost(`users/mute?username=${username}`, access_token);
    const response = await fetching.text();
    const darkmodeCookie = await ctx.cookies.get('darkMode');

    try {
        JSON.parse(response);
        ctx.response.body = iFrameTemplate(`<form action="/app/users/unmute" method="POST">
            <input type="hidden" name="username" value="${username}" />
            <button type="submit">Unmute</button>
        </form>`, darkmodeCookie); 
    }
    catch {
        ctx.response.body = iFrameTemplate(`<small class="fail">Unsuccessful.</small>'`, darkmodeCookie); 
    } 
});

await router.post("/app/users/unblock", async (ctx) => {
    const access_token = await ctx.cookies.get('access_token');
    const body = ctx.request.body({ type: 'form' });
    const value = await body.value;
    const username = value.get('username');

    const fetching = await microBlogSimpleDelete(`users/block?username=${username}`, access_token);
    const response = await fetching.text();

    try {
        JSON.parse(response);
        ctx.response.body = iFrameTemplate(`<form action="/app/users/block" method="POST">
            <input type="hidden" name="username" value="${username}" />
            <button type="submit">Block</button>
        </form>`); 
    }
    catch {
        ctx.response.body = iFrameTemplate(`<small class="fail">Unsuccessful.</small>'`); 
    } 
});

await router.post("/app/users/unmute", async (ctx) => {
    const access_token = await ctx.cookies.get('access_token');
    const body = ctx.request.body({ type: 'form' });
    const value = await body.value;
    const username = value.get('username');
    const darkmodeCookie = await ctx.cookies.get('darkMode');
    const fetching = await microBlogSimpleDelete(`users/mute?username=${username}`, access_token);
    const response = await fetching.text();

    try {
        JSON.parse(response);
        ctx.response.body = iFrameTemplate(`<form action="/app/users/mute" method="POST">
            <input type="hidden" name="username" value="${username}" />
            <button type="submit">Mute</button>
        </form>`, darkmodeCookie); 
    }
    catch {
        ctx.response.body = iFrameTemplate(`<small class="fail">Unsuccessful.</small>'`, darkmodeCookie); 
    } 
});

await router.post("/app/pinPost", async (ctx) => {
    const body = ctx.request.body({ type: 'form' });
    const darkmodeCookie = await ctx.cookies.get('darkMode');
    const value = await body.value;
    const id = value.get('id');
    
    let currentPins = await ctx.cookies.get('pinnedPosts');
    currentPins = currentPins == undefined ? [] : JSON.parse(currentPins);
    currentPins.push(value.get('id'));
    ctx.cookies.set("pinnedPosts", JSON.stringify(currentPins), { expires: new Date(Date.now() + 315600000000)}); // 10 years

    ctx.response.body = iFrameTemplate(`<form action="/app/unpinPost" method="POST">
        <input type="hidden" name="id" value="${id}" />
        <button type="submit">Unpin Post</button>
    </form>`, darkmodeCookie); 
});

await router.post("/app/unpinPost", async (ctx) => {
    const body = ctx.request.body({ type: 'form' });
    const value = await body.value;
    const id = value.get('id');
    const darkmodeCookie = await ctx.cookies.get('darkMode');

    let currentPins = await ctx.cookies.get('pinnedPosts');
    currentPins = currentPins == undefined ? [] : JSON.parse(currentPins);
    const index = currentPins.indexOf(value.get('id'));
    if (index > -1) { 
        currentPins.splice(index, 1);
    }
    ctx.cookies.set("pinnedPosts", JSON.stringify(currentPins), { expires: new Date(Date.now() + 315600000000)}); // 10 years
    
    ctx.response.body = iFrameTemplate(`<form action="/app/pinPost" method="POST">
        <input type="hidden" name="id" value="${id}" />
        <button type="submit">Pin Post</button>
    </form>`, darkmodeCookie); 
});

await router.post("/app/bookmarks/bookmark", async (ctx) => {
    const access_token = await ctx.cookies.get('access_token');
    const body = ctx.request.body({ type: 'form' });
    const value = await body.value;
    const id = value.get('id');
    const darkmodeCookie = await ctx.cookies.get('darkMode');
    const fetching = await microBlogSimplePost(`posts/bookmarks?id=${id}`, access_token);
    const response = await fetching.text();

    try {
        JSON.parse(response);
        ctx.response.body = iFrameTemplate(`<form action="/app/bookmarks/unbookmark" method="POST">
            <input type="hidden" name="id" value="${id}" />
            <button type="submit">Unbookmark</button>
        </form>`, darkmodeCookie); 
    }
    catch {
        ctx.response.body = iFrameTemplate(`<small class="fail">Unsuccessful.</small>'`, darkmodeCookie); 
    } 
});

await router.post("/app/bookmarks/unbookmark", async (ctx) => {
    const access_token = await ctx.cookies.get('access_token');
    const body = ctx.request.body({ type: 'form' });
    const value = await body.value;
    const id = value.get('id');
    const darkmodeCookie = await ctx.cookies.get('darkMode');
    const fetching = await microBlogSimpleDelete(`posts/bookmarks/${id}`, access_token);
    const response = await fetching.text();

    try {
        JSON.parse(response);
        ctx.response.body = iFrameTemplate(`<form action="/app/bookmarks/bookmark" method="POST">
            <input type="hidden" name="id" value="${id}" />
            <button type="submit">Bookmark</button>
        </form>`,darkmodeCookie); 
    }
    catch {
        ctx.response.body = iFrameTemplate(`<small class="fail">Unsuccessful.</small>'`,darkmodeCookie); 
    } 
});

await router.post("/app/bookmarks/new", async (ctx) => {
    const access_token = await ctx.cookies.get('access_token');
    const body = ctx.request.body({ type: 'form' });
    const value = await body.value;
    const url = value.get('url');

    const formBody = new URLSearchParams();
    formBody.append("h", "entry");
    formBody.append("bookmark-of", url);

    const postingContent = await microBlogPostForm('micropub', formBody, access_token);
    const response = await postingContent.text();
    ctx.response.redirect('/app/bookmarks');
});

await router.post("/app/bookmarks/manageTags", async (ctx) => {
    const access_token = await ctx.cookies.get('access_token');
    const body = ctx.request.body({ type: 'form' });
    const value = await body.value;
    const tags = value.getAll('tags[]') ? value.getAll('tags[]') : [];
    const newTag = value.get('newTag');
    const id = value.get('id');

    if(newTag) {
        tags.push(newTag);
    }

    const formBody = new URLSearchParams();
        formBody.append("tags", tags.join(','));
    
    const fetching = await microBlogPostForm(`posts/bookmarks/${id}`, formBody, access_token);
    const response = await fetching.text();

    try {
        JSON.parse(response);
        ctx.response.redirect('/app/bookmarks');
    }
    catch {
        //TO-DO....
        //ctx.response.body = iFrameTemplate(`<small class="fail">Unsuccessful.</small>'`); 
    } 
});

await router.post("/app/replies/add", async (ctx) => {
    const access_token = await ctx.cookies.get('access_token');
    const body = ctx.request.body({ type: 'form' });
    const value = await body.value;
    const id = value.get('id');
    const replyingTo = value.getAll('replyingTo[]');
    let content = value.get('content');
    const darkmodeCookie = await ctx.cookies.get('darkMode');

    if(content != null && content != undefined && content != '' && content != 'null' && content != 'undefined') {
        const replies = replyingTo.map(function (reply, i) { return '@' + reply }).join(' ');
        content = replies + ' ' + content;

        const fetching = await microBlogSimplePost(`posts/reply?id=${id}&content=${encodeURIComponent(content)}`, access_token);
        const response = await fetching.text();

        try {
            JSON.parse(response);
            ctx.response.body = iFrameTemplate('<small class="success">Reply sent.</small>', darkmodeCookie); 
        }
        catch {
            ctx.response.body = iFrameTemplate(`<small class="fail">Unsuccessful.</small>'`, darkmodeCookie); 
        }    
    }
});

await router.post("/app/bookshelves/removeBook", async (ctx) => {
    const access_token = await ctx.cookies.get('access_token');
    const body = ctx.request.body({ type: 'form' });
    const value = await body.value;
    const bookId = value.get('bookId');
    const bookshelfId = value.get('bookshelfId');

    const fetching = await microBlogSimpleDelete(`books/bookshelves/${bookshelfId}/remove/${bookId}`, access_token);
    const response = await fetching.text();

    try {
        JSON.parse(response);
        ctx.response.redirect("/app/bookshelves?id=" + bookshelfId);
    }
    catch {
        //TO-DO....
        //ctx.response.body = iFrameTemplate(`<small class="fail">Unsuccessful.</small>'`); 
    } 
});

await router.post("/app/bookshelves/moveBook", async (ctx) => {
    const access_token = await ctx.cookies.get('access_token');
    const body = ctx.request.body({ type: 'form' });
    const value = await body.value;
    const bookId = value.get('bookId');
    const bookshelfId = value.get('bookshelfId');

    const fetching = await microBlogSimplePost(`books/bookshelves/${bookshelfId}/assign?book_id=${bookId}`, access_token);
    const response = await fetching.text();

    try {
        JSON.parse(response);
        ctx.response.redirect("/app/bookshelves?id=" + bookshelfId);
    }
    catch {
        //TO-DO....
        //ctx.response.body = iFrameTemplate(`<small class="fail">Unsuccessful.</small>'`); 
    } 
});

await router.post("/app/bookshelves/addBook", async (ctx) => {
    const access_token = await ctx.cookies.get('access_token');
    const body = ctx.request.body({ type: 'form' });
    const value = await body.value;
    const bookshelfId = value.get('bookshelfId');
    const bookISBN = value.get('bookISBN');
    const bookTitle = value.get('bookTitle');
    const bookAuthor = value.get('bookAuthor');

    const fetching = await microBlogSimplePost(`books?bookshelf_id=${bookshelfId}&isbn=${bookISBN}&title=${bookTitle}&author=${bookAuthor}`, access_token);
    const response = await fetching.text();

    try {
        JSON.parse(response);
        ctx.response.redirect("/app/bookshelves?id=" + bookshelfId);
    }
    catch {
        //TO-DO....
        //ctx.response.body = iFrameTemplate(`<small class="fail">Unsuccessful.</small>'`); 
    } 
});
    
await router.post("/app/bookshelves/addBookshelf", async (ctx) => {
    const access_token = await ctx.cookies.get('access_token');
    const body = ctx.request.body({ type: 'form' });
    const value = await body.value;
    const name = value.get('name');

    const fetching = await microBlogSimplePost(`books/bookshelves?name=${name}`, access_token);
    const response = await fetching.text();

    try {
        JSON.parse(response);
        ctx.response.redirect("/app/bookshelves");
    }
    catch {
        //TO-DO....
        //ctx.response.body = iFrameTemplate(`<small class="fail">Unsuccessful.</small>'`); 
    }
});

await router.post("/app/blog/upload", async (ctx) => {
    const cookies = await getCookies(ctx);
    const body = ctx.request.body({ type: 'form-data' });
    const data = await body.value.read({ maxSize: Number.MAX_SAFE_INTEGER });

    const file = data.files != undefined? data.files[0] : undefined;
    let fileURL = '';

    if(file) {
        const fetchingMediaEndpoint = await microBlogGet('micropub?q=config', cookies.access_token);
        const endpointFetched = await fetchingMediaEndpoint.json();
        const mediaEndpoint = endpointFetched["media-endpoint"];

        const formData = new FormData();
        const fileBlob = new Blob([new Uint8Array(file.content).buffer], { 'type': file.contentType });  
        formData.append('file', fileBlob, file.originalName);
        if(data.fields.destination) {
            formData.append("mp-destination", data.fields.destination);
        }
        const uploadMethod = {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + cookies.access_token
            },
            body: formData
        };

        const fetchingFileUpload = await fetch(mediaEndpoint, uploadMethod);
        const fileFetched = await fetchingFileUpload.json();

        fileURL = fileFetched.url;
        if(data.fields.redirect) {
            ctx.response.redirect("/app/blog/media?destination=" + data.fields.destination);
        } else {
            ctx.response.body = fileURL;
        }
    }
});

await router.post("/app/blog/delete", async (ctx) => {
    const cookies = await getCookies(ctx);
    const body = ctx.request.body({ type: 'form' })
    const value = await body.value
    const url = value.get('url');
    const destination = value.get('destination');

    const formData = new URLSearchParams();
    formData.append('action', 'delete');
    formData.append('url', url);
    if(destination) {
        formData.append("mp-destination", destination);
    }
    
    const fetchingDelete = await microBlogPostForm('micropub', formData, cookies.access_token);
    ctx.response.redirect("/app/blog/posts?destination=" + destination);
});

await router.post("/app/blog/media/delete", async (ctx) => {
    const cookies = await getCookies(ctx);
    const body = ctx.request.body({ type: 'form' })
    const value = await body.value
    const url = value.get('url');
    const destination = value.get('destination');

    const formData = new URLSearchParams();
    formData.append('action', 'delete');
    formData.append('url', url);
    if(destination) {
        formData.append("mp-destination", destination);
    }
    
    const fetchingMediaEndpoint = await microBlogGet('micropub?q=config', cookies.access_token);
    const endpointFetched = await fetchingMediaEndpoint.json();
    const mediaEndpoint = endpointFetched["media-endpoint"];

    const fetchingDelete = await basicPostForm(mediaEndpoint, formData, cookies.access_token);
    const response = await fetchingDelete.text();
    ctx.response.redirect("/app/blog/media?destination=" + destination);
});
await router.post("/app/blog/post", async (ctx) => {
    const cookies = await getCookies(ctx);
    const body = ctx.request.body({ type: 'form-data' });
    const data = await body.value.read({ maxSize: Number.MAX_SAFE_INTEGER }); 

    const categories = [];
    const syndicate = [];
    for (const [key, value] of Object.entries(data.fields)) {
        if(key.includes('category[')) {
            categories.push(value);
        } 
        if(key.includes('syndicate[')) {
            syndicate.push(value);
        }
    }
    const formBody = new URLSearchParams();
    if(data.fields.destination) {
        formBody.append("mp-destination", data.fields.destination);
    } 
    if(!data.fields.url)
    {
        formBody.append("h", "entry");
        formBody.append("content", data.fields.content);
        
        if(data.fields.title){
            formBody.append("name", data.fields.title);
        }
        if(data.fields.tags){
            formBody.append("category[]", data.fields.category);
        }
        if(data.fields.status == 'draft'){
            formBody.append("post-status", "draft");
        }
        if(categories.length > 0){
            for(let i=0; i<categories.length; i++){
                formBody.append("category[]", categories[i]);
            }
        }
        if(syndicate.length > 0) {
            for(let i=0; i<syndicate.length; i++){
                formBody.append("mp-syndicate-to[]", syndicate[i]);
            }
        }

        const postingContent = await microBlogPostForm('micropub', formBody, cookies.access_token);
        await postingContent;
    } else {
        const content = {
                action: "update",
                url: data.fields.url,
                replace: {
                    content: [data.fields.content],
                    name: [data.fields.title],
                    category: categories, 
                    "post-status": data.fields.status == 'draft' ? ['draft'] : ['published']
                }
            };
        if(data.fields.destination) {
            content["mp-destination"] = data.fields.destination
        }

        const postingContent = await fetch("https://micro.blog/micropub", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + cookies.access_token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(content)
        });

        await postingContent;
    }
    ctx.response.redirect("/app/blog/posts?destination=" + data.fields.destination);
});

// --------------------------------------------------------------------------------------
// Micro.blog API Access Helpers
// --------------------------------------------------------------------------------------
/**
 * Gets the general Micro.Blog info from the logged in user.
 * @param  {string} access_token  An access token
 * @return {object}      An JSON object containing the user fields for the logged in user
 */
async function getMicroBlogLoggedInUser(access_token) {
    const formBody = new URLSearchParams();
    formBody.append("token", access_token);
    const fetching = await microBlogPostForm('account/verify', formBody, null, 'application/json');
    const results = await fetching.json();
    return results;
}

/**
 * Gets a micro.blog conversation
 * @param  {int} id  The id of the conversation
 * @param  {string} access_token  An access token
 * @return {object}      The json object returned from the micro.blog api
 */
async function  getMicroBlogConversation(id, access_token) {
    const fetching = await microBlogGet(`posts/conversation?id=${id}`, access_token);
    const results = await fetching.json();
    return results;
}

/**
 * Gets a micro.blog timeline
 * @param  {string} name  The name of the user, if undefined, get's the logged in users timeline.
 * @param  {string} id  The id of the post for paging
 * @param  {string} access_token  An access token
 * @param  {bool} since  Should this fetch posts since the id?
 * @return {object}      The json object returned from the micro.blog api
 */
async function getMicroBlogTimeline(name, id, access_token, since = false) {
    const fetchURL = name ? `posts/${name}?count=${_mbItemCount}` : `posts/timeline?count=${_mbItemCount}`;
    try {
        const fetching = await microBlogGet(id ? `${fetchURL}&${since ? 'since_id' : 'before_id'}=${id}` : fetchURL, access_token);
        return await fetching.json();
    } 
    catch 
    {
        return undefined;
    }   
}

/**
 * Gets a micro.blog photo timeline for a user
 * @param  {string} name  The name of the user
 * @param  {string} access_token  An access token
 * @return {object}      The json object returned from the micro.blog api
 */
async function getMicroBlogTimelinePhotos(name, access_token) {
    const fetching = await microBlogGet(`posts/${name}/photos`, access_token);
    return await fetching.json();
}

/**
 * Gets a micro.blog discover feed
 * @param  {string} tag  The tag to filter the discover feed by
 * @param  {string} access_token  An access token
 * @return {object}      The json object returned from the micro.blog api
 */
async function getMicroBlogDiscover(tag, access_token) {
    const fetchURL = tag ? `posts/discover/${tag}` : `posts/discover`;
    const fetching = await microBlogGet(fetchURL, access_token);
    return await fetching.json();
}

/**
 * Checks to see if the logged in user is following a micro.blog user.
 * @param  {string} username        The username of the user to see if the logged in user is following
 * @param  {string} access_token    An access token
 * @return {bool}                   If the user is followed or not
 */
async function isFollowingMicroBlogUser(username, access_token) {
    const fetching = await microBlogGet(`users/is_following?username=${username}`, access_token);
    const result = await fetching.json();
    return result.is_following && !result.is_you;
}

/**
 * Get the sorted list of bookmark tags from micro.blog
 * @param  {string} access_token    An access token
 * @return {object}      The json object returned from the micro.blog api, sorted.
 */
async function getMicroBlogBookmarkTags(access_token) {
    const fetching = await microBlogGet('posts/bookmarks/tags', access_token);
    const tags = await fetching.json();
    tags.sort();
    return tags;
}

/**
 * Get the sorted list of bookmark tags from micro.blog
 * @param  {string} access_token    An access token
 * @return {object}      The json object returned from the micro.blog api
 */
async function getMicroBlogBookshelves(access_token) {
    const fetching = await microBlogGet('books/bookshelves', access_token);
    const bookshelves = await fetching.json();
    return bookshelves;
}

/**
 * Get the media for a blog
 * @param  {object} account        The micro.blog account to request media from
 * @param  {string} access_token   An access token
 * @return {object}                An object containing the uid and the name of the account or null if none exists. 
 */
async function getMicroBlogMedia(account, access_token) {
    const fetching = await microBlogGet('micropub?q=config', access_token);
    const config = await fetching.json();

    const fetchingMedia = await basicGet(config["media-endpoint"] + `?q=source${account ? `&mp-destination=${account.uid}` : ''}`, access_token);
    return await fetchingMedia.json();
}

/**
 * Get the default (or selected) micro.blog destination of the user (for those with multiple blogs associated with an account)
 * @param  {string} destination    The requested destination by the user
 * @param  {string} access_token   An access token
 * @return {object}                The json object returned from the micro.blog api 
 */
async function getMicroBlogDestination(destination, access_token) {
    const fetching = await microBlogGet('micropub?q=config', access_token);
    const config = await fetching.json();
    let account = destination ? config.destination.filter(d => d.uid == destination)[0] : config.destination.filter(d => d["microblog-default"])[0];
    
    if(account == undefined) {
        if(config.destination[0] != undefined) {
            account = config.destination[0];
        } else {
            return null;
        }
    } 
    
    return {
        uid: account.uid,
        name: account.name
    };
}

// --------------------------------------------------------------------------------------
// Helper functions
// --------------------------------------------------------------------------------------
/**
 * Gets common cookies that should be associated with any request.
 * @param  {object} ctx  The request object
 * @return {object}      An object containing values of common cookies if available. 
 */
async function getCookies(ctx) {
    return {
        access_token: await ctx.cookies.get('access_token'),
        username: await ctx.cookies.get('username'),
        avatar: await ctx.cookies.get('avatar'),
        profileName: await ctx.cookies.get('name')
    };
}
/**
 * Extend the Error class and capture information from the response
 */
class ResponseError extends Error {
  constructor(message, res) {
    super(message);
    this.response = res;
  }
}
/**
 * Configures a basic GET request using an auth token
 * @param  {string} endpoint The endpoint to use
 * @param  {string} access_token The authorization token
 * @return {object}      The response object
 */
async function basicGet(endpoint, access_token) {
    const res = await fetch(endpoint, { method: "GET", headers: { "Authorization": "Bearer " + access_token } });
    if (!res.ok) {
        console.log(res.status, res.statusText);
        throw new ResponseError('Bad fetch response', res);
    }
    return res;
}

/**
 * Configures a POST request using an auth token if supplied
 * @param  {string} endpoint        The endpoint to use
 * @param  {string} access_token    The authorization token (optional, defaults to null)
 * @param  {string} accept          The POST header Accept setting. If null is not set.
 * @return {object}                 The response object
 */
async function basicPostForm(endpoint, formBody, access_token = null, accept = null) {
    const fetchMethod = {
        method: "POST",
        body: formBody.toString(),
        headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
        }
    };

    if(accept != null) {
        fetchMethod.headers['Accept'] = accept;
    }

    if(access_token != null) {
        fetchMethod.headers['Authorization'] = 'Bearer ' + access_token;
    }

    const res = await fetch(endpoint, fetchMethod);
    if (!res.ok) {
        console.log(res.status, res.statusText);
        throw new ResponseError('Bad post response', res);
    }
    return res;
}

/**
 * Configures a micro.blog GET request using the Micro.blog auth token
 * @param  {string} endpoint        The Micro.blog endpoint to use
 * @param  {string} access_token    The authorization token given by Micro.blog
 * @return {object}                 The response object
 */
async function microBlogGet(endpoint, access_token) {
    return await basicGet(`https://micro.blog/${endpoint}`, access_token);
}

/**
 * Configures a micro.blog POST request using the Micro.blog auth token if supplied
 * @param  {string} endpoint        The Micro.blog endpoint to use
 * @param  {string} access_token    The authorization token given by Micro.blog (optional, defaults to null)
 * @return {object}                 The response object
 */
async function microBlogPostForm(endpoint, formBody, access_token = null, accept = null){
    return await basicPostForm(`https://micro.blog/${endpoint}`, formBody, access_token, accept);
}

/**
 * Configures a micro.blog POST request using the Micro.blog auth token if supplied, no body
 * @param  {string} endpoint        The Micro.blog endpoint to use
 * @param  {string} access_token    The authorization token given by Micro.blog (optional, defaults to null)
 * @return {object}                 The response object
 */
async function microBlogSimplePost(endpoint, access_token = null){
    const res = await fetch(`https://micro.blog/${endpoint}`, { method: "POST", headers: { "Authorization": "Bearer " + access_token } });
    if (!res.ok) {
        console.log(res.status, res.statusText);
        throw new ResponseError('Bad post response', res);
    }
    return res;
}

/**
 * Configures a micro.blog DELETE request using the Micro.blog auth token if supplied, no body
 * @param  {string} endpoint        The Micro.blog endpoint to use
 * @param  {string} access_token    The authorization token given by Micro.blog (optional, defaults to null)
 * @return {object}                 The response object
 */
async function microBlogSimpleDelete(endpoint, access_token = null){
    const res = await fetch(`https://micro.blog/${endpoint}`, { method: "DELETE", headers: { "Authorization": "Bearer " + access_token } });
    if (!res.ok) {
        console.log(res.status, res.statusText);
        throw new ResponseError('Bad delete response', res);
    }
    return res;
}

/**
 * Configures a micro.blog POST request using the Micro.blog auth token if supplied
 * @param  {string} endpoint        The Micro.blog endpoint to use
 * @param  {string} access_token    The authorization token given by Micro.blog (optional, defaults to null)
 * @return {object}                 The response object
 */
function filterOut(contentFilters, content_html) {
    if(contentFilters.length > 0) {
        const words = content_html != undefined ? content_html.toLowerCase()
            .replace('.', ' ')
            .replace(',', ' ')
            .replace(':', ' ')
            .replace(';', ' ')
            .replace('>', ' ')
            .replace('<', ' ')
            .replace('!', ' ')
            .replace('@', ' ')
            .replace('#', ' ')
            .replace('$', ' ')
            .replace('%', ' ')
            .replace('&', ' ')
            .replace('*', ' ')
            .replace('"', ' ')
            .split(' ') : [];
        return contentFilters.some(filter => filter.trim() != '' && words.includes(filter.trim()));
    }
    return false;
}

// --------------------------------------------------------------------------------------
// Resources
// --------------------------------------------------------------------------------------
function getCommonJS() {
    const script = `
        function growTextArea(el) {
            el.parentNode.dataset.replicatedValue = el.value;
        }
        function clearReply(el) {
            let form=el;
            setTimeout(
                function(){ 
                    form.children[2].dataset.replicatedValue = ''; form.children[2].children[0].value = ''; 
                }, 250);
        }
    `;
    return minify(Language.JS, script);
}
function getCommonCSS() {
    return minify(Language.CSS, _style);
}
function discoverSVG() {
    return `
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-broadcast-pin" viewbox="0 0 16 16">
            <path d="M3.05 3.05a7 7 0 0 0 0 9.9.5.5 0 0 1-.707.707 8 8 0 0 1 0-11.314.5.5 0 0 1 .707.707zm2.122 2.122a4 4 0 0 0 0 5.656.5.5 0 1 1-.708.708 5 5 0 0 1 0-7.072.5.5 0 0 1 .708.708zm5.656-.708a.5.5 0 0 1 .708 0 5 5 0 0 1 0 7.072.5.5 0 1 1-.708-.708 4 4 0 0 0 0-5.656.5.5 0 0 1 0-.708zm2.122-2.12a.5.5 0 0 1 .707 0 8 8 0 0 1 0 11.313.5.5 0 0 1-.707-.707 7 7 0 0 0 0-9.9.5.5 0 0 1 0-.707zM6 8a2 2 0 1 1 2.5 1.937V15.5a.5.5 0 0 1-1 0V9.937A2 2 0 0 1 6 8z"/>
        </svg>
    `;
}
function timelineSVG() {
    return `
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-newspaper" viewbox="0 0 16 16">
            <path d="M0 2.5A1.5 1.5 0 0 1 1.5 1h11A1.5 1.5 0 0 1 14 2.5v10.528c0 .3-.05.654-.238.972h.738a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 1 1 0v9a1.5 1.5 0 0 1-1.5 1.5H1.497A1.497 1.497 0 0 1 0 13.5v-11zM12 14c.37 0 .654-.211.853-.441.092-.106.147-.279.147-.531V2.5a.5.5 0 0 0-.5-.5h-11a.5.5 0 0 0-.5.5v11c0 .278.223.5.497.5H12z"/>
            <path d="M2 3h10v2H2V3zm0 3h4v3H2V6zm0 4h4v1H2v-1zm0 2h4v1H2v-1zm5-6h2v1H7V6zm3 0h2v1h-2V6zM7 8h2v1H7V8zm3 0h2v1h-2V8zm-3 2h2v1H7v-1zm3 0h2v1h-2v-1zm-3 2h2v1H7v-1zm3 0h2v1h-2v-1z"/>
        </svg>
    `;
}
function externalLinkSVG() {
    return `
    <svg style="height: var(--step--1);" xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-box-arrow-up-right" viewbox="0 0 16 16">
        <path fill-rule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/>
        <path fill-rule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/>
    </svg>
    `;
}
function logoSVG() {
    return `
        <svg version="1.0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300.000000 297.000000" preserveAspectRatio="xMidYMid meet"> <metadata> Created by potrace 1.10, written by Peter Selinger 2001-2011 </metadata> <g transform="translate(0.000000,297.000000) scale(0.050000,-0.050000)" fill="var(--base)" stroke="none"> <path d="M3300 5350 c-14 -16 -37 -30 -51 -30 -47 0 -134 -209 -122 -294 28 -198 54 -352 63 -365 21 -34 42 -376 24 -394 -15 -15 -114 38 -115 61 0 30 -179 136 -208 125 -14 -5 -33 -106 -48 -246 -17 -167 -33 -241 -54 -253 -16 -9 -42 -47 -58 -84 -21 -50 -37 -65 -65 -57 -36 9 -170 -10 -376 -54 -55 -12 -140 -29 -190 -38 -313 -60 -623 -165 -770 -262 -44 -29 -93 -57 -108 -62 -44 -14 -306 -258 -387 -359 -204 -256 -158 -434 89 -343 252 94 401 111 796 95 204 -8 402 -14 440 -14 66 1 67 1 17 -15 -30 -9 -65 -24 -79 -32 -15 -10 -19 -7 -10 8 19 30 -6 28 -67 -6 -27 -14 -60 -23 -73 -18 -13 5 -86 -31 -163 -80 -76 -49 -168 -104 -203 -122 -78 -40 -249 -168 -259 -193 -3 -10 -19 -18 -35 -18 -16 0 -34 -13 -41 -30 -6 -17 -23 -30 -38 -30 -14 0 -71 -43 -126 -95 -55 -52 -129 -123 -166 -157 -37 -35 -89 -92 -115 -127 -26 -35 -68 -72 -94 -82 -61 -23 -98 -91 -61 -113 14 -9 48 -59 73 -111 45 -90 225 -255 279 -255 12 0 82 -29 156 -64 179 -85 598 -231 785 -273 341 -78 1589 -26 1842 77 166 67 241 95 323 120 41 13 121 55 177 93 186 128 305 -27 256 -336 -49 -311 175 -127 260 213 13 55 37 145 52 200 38 136 80 390 74 444 -5 40 145 264 197 297 75 46 181 426 172 612 -7 136 -92 321 -180 392 -38 30 -49 76 -81 335 -20 165 -45 321 -55 348 -25 65 -36 145 -45 317 -10 202 -72 265 -146 150 -20 -30 -56 -71 -81 -91 -25 -20 -45 -50 -45 -65 0 -16 -8 -29 -17 -29 -22 0 0 118 67 350 29 99 55 189 58 200 48 167 56 457 15 578 -113 333 -548 248 -674 -131 -61 -183 -253 -154 -352 53 -106 223 -366 370 -457 260z m177 -68 c79 -41 203 -156 203 -189 0 -145 163 -260 340 -239 107 12 141 52 190 221 32 112 185 225 303 225 228 0 278 -299 140 -835 -124 -481 -107 -578 71 -396 137 138 128 141 142 -44 6 -85 25 -213 41 -285 108 -466 112 -858 11 -891 -63 -20 -84 14 -61 98 27 99 -17 139 -84 76 -82 -77 -103 -22 -35 90 51 83 19 121 -56 67 -77 -55 -133 -60 -126 -10 11 73 75 140 144 150 175 26 198 580 25 580 -156 0 -215 -138 -152 -358 19 -70 -51 -47 -314 101 -181 101 -439 196 -439 162 0 -5 -13 1 -29 14 -62 52 -386 62 -571 18 -23 -5 -29 9 -24 65 6 63 -1 75 -56 102 -127 61 -213 -3 -188 -139 8 -41 14 -79 13 -85 -2 -25 75 -154 113 -188 56 -51 58 -152 3 -152 -46 0 -81 56 -81 129 0 39 -10 51 -42 51 -36 0 -41 -10 -34 -69 4 -37 3 -67 -3 -66 -20 3 -91 -31 -125 -60 -32 -28 -33 -26 -11 21 14 28 31 47 38 42 8 -5 14 7 12 27 -1 19 4 62 12 95 7 33 5 73 -5 88 -21 33 -85 15 -81 -23 7 -54 -2 -115 -17 -115 -9 0 -18 32 -21 71 -5 82 69 249 111 249 37 0 60 70 76 222 7 71 19 159 27 197 l14 69 81 -73 c94 -85 176 -121 233 -103 45 14 39 113 -47 720 -30 217 -12 284 100 359 85 58 67 57 159 11z m-361 -1407 c5 -63 0 -75 -33 -75 -50 0 -81 71 -65 151 10 54 93 -10 98 -76z m1651 -123 c34 -145 -46 -383 -107 -320 -43 44 -42 326 1 369 55 55 85 42 106 -49z m-947 -15 c136 -37 747 -320 770 -357 5 -8 -4 -27 -22 -41 -125 -104 -110 -295 21 -271 45 8 51 4 41 -28 -21 -67 26 -125 92 -115 51 7 58 2 58 -44 0 -70 34 -101 112 -101 86 0 175 101 163 184 -12 84 27 67 93 -40 97 -160 92 -441 -14 -684 -42 -95 -208 -320 -237 -320 -9 0 -23 1 -30 2 -32 4 -47 -63 -23 -100 19 -32 19 -65 -2 -166 -14 -69 -30 -148 -34 -176 -11 -73 -66 -272 -112 -410 -22 -66 -44 -140 -50 -164 -15 -64 -66 -76 -66 -15 0 27 9 49 20 49 32 0 23 181 -14 279 -40 106 -51 118 -154 170 l-77 40 -42 -52 c-44 -54 -190 -137 -240 -137 -16 0 -86 -27 -157 -60 -161 -76 -305 -112 -496 -128 -82 -6 -273 -22 -424 -34 -295 -25 -1044 3 -1116 42 -20 11 -85 33 -143 48 -139 38 -319 101 -457 160 -60 26 -146 62 -190 81 -208 89 -388 283 -308 333 14 8 27 29 30 46 9 65 210 274 418 435 33 25 69 56 80 69 68 77 442 302 465 280 5 -6 -9 -58 -31 -116 -54 -137 -62 -217 -27 -272 19 -29 163 -14 163 17 0 54 392 300 425 267 6 -6 -17 -67 -51 -135 -120 -239 -105 -483 51 -838 57 -129 108 -71 122 140 13 205 187 431 406 528 l87 39 46 -53 c25 -29 104 -169 175 -311 152 -304 175 -315 253 -128 60 140 92 625 47 708 -50 93 123 85 305 -13 85 -46 99 -49 125 -22 34 33 -88 337 -158 394 -18 15 -28 35 -23 44 24 37 -182 89 -355 88 l-175 0 0 68 c0 146 -217 495 -294 472 -20 -6 -7 5 29 24 60 32 67 32 101 0 57 -51 176 -44 191 12 23 85 13 135 -37 179 -28 24 -65 66 -84 94 l-33 51 55 -36 c54 -36 57 -35 94 5 84 90 346 98 638 19z m-1154 -26 c-36 -64 -6 -166 56 -192 32 -13 58 -31 58 -40 0 -17 -305 -6 -365 13 -54 17 -44 -60 16 -125 102 -110 119 -175 91 -345 -33 -195 32 -179 -633 -156 -610 22 -884 -5 -1018 -99 -103 -71 -103 45 0 186 207 284 540 510 897 608 537 147 933 213 898 150z m71 -332 c186 -57 348 -296 351 -517 2 -123 18 -136 121 -102 217 71 414 -14 524 -227 55 -107 52 -128 -13 -93 -203 109 -439 74 -374 -54 41 -80 54 -262 34 -458 -31 -303 -76 -368 -141 -202 -111 284 -269 505 -346 483 -284 -81 -543 -380 -530 -611 4 -65 0 -118 -8 -118 -8 0 -15 17 -15 39 0 21 -19 70 -41 109 -84 142 -39 547 78 710 153 212 -140 181 -471 -49 -134 -93 -150 -93 -123 1 81 280 354 483 607 452 61 -8 86 -42 31 -42 -75 0 -29 -26 61 -35 52 -5 77 0 69 13 -7 11 -27 14 -46 7 -26 -10 -23 2 13 53 120 168 117 561 -5 636 -14 9 -4 20 27 28 28 8 53 15 57 16 4 1 67 -16 140 -39z"></path> <path d="M4395 5006 c-30 -40 -55 -85 -55 -100 0 -30 55 -146 69 -146 105 0 201 181 143 270 -45 69 -92 62 -157 -24z m125 -43 c0 -8 -11 -26 -24 -39 -19 -19 -18 -24 1 -24 14 0 20 -9 13 -20 -8 -13 -26 -13 -53 2 -22 11 -35 26 -29 33 6 6 3 22 -8 35 -15 18 -4 24 40 26 33 1 60 -5 60 -13z"></path> <path d="M3405 5027 c-17 -7 -25 -57 -25 -148 0 -173 79 -245 172 -157 74 69 49 278 -33 278 -20 0 -42 9 -49 20 -13 21 -26 23 -65 7z m135 -207 c0 -11 -10 -20 -21 -20 -12 0 -15 -10 -7 -23 8 -13 3 -19 -14 -13 -47 16 -46 76 1 76 22 0 41 -9 41 -20z"></path> <path d="M3740 4529 c-25 -64 13 -133 70 -125 27 4 42 24 46 62 13 106 -81 157 -116 63z"></path> <path d="M3932 4509 c-20 -79 8 -113 68 -83 57 29 77 91 37 116 -50 32 -92 19 -105 -33z"></path> <path d="M3427 4368 c-22 -55 60 -136 175 -175 263 -88 856 -11 906 118 24 64 -49 99 -82 40 -82 -146 -856 -147 -922 -1 -26 57 -60 65 -77 18z"></path> <path d="M3720 2761 c0 -11 38 -29 85 -41 121 -31 189 -60 266 -112 78 -53 110 -33 43 26 -70 63 -394 168 -394 127z"></path></g></svg>
    `;
}

// --------------------------------------------------------------------------------------
// Configure and start the HTTP server
// --------------------------------------------------------------------------------------
const app = new Application({ logErrors: true });
app.use(oakCors());

/**
 * Middleware - redirect to login page if the cookie with the access_token is missing.
 */
app.use(async (ctx, next) => {
    if (ctx.request.url.pathname !== "/favicon.ico") {
        await next();
    } else
    {
        ctx.response.body = _favicon;
        ctx.response.type = "image/x-icon";
    }
});

app.use(async (ctx, next) => {
    const cookies = await getCookies(ctx);
  if(ctx.request.url.pathname === '/' || ctx.request.url.pathname === '/app/login' || ctx.request.url.pathname.includes('/app/auth')) {
    await next();
  } else if(!cookies.access_token) {
    ctx.response.redirect('/');
  } else {
    await next();
  }
});

app.use(router.routes());
app.use(router.allowedMethods());

app.addEventListener(
  "error",
  (e) => {
      if(e.message != '' && e.message != 'response already completed' && e.message != 'broken pipe: broken pipe') {
        console.log(`Caught error: ${e.message}`) 
      }
    },
);

app.listen({ port: 8080 });