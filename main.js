import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import { DOMParser } from "https://esm.sh/linkedom";
import { marky } from "https://deno.land/x/marky@v1.1.6/mod.ts";
import * as ammonia from "https://deno.land/x/ammonia@0.3.1/mod.ts";
await ammonia.init();


const router = new Router();
const _appURL = Deno.env.get("APP_URL");
const _colors = ['var(--yellowgreen)','var(--green)','var(--greenblue)','var(--blue)','var(--bluepurple)','var(--purple)','var(--purplered)','var(--red)','var(--redorange)','var(--orange)','var(--orangeyellow)','var(--yellow)'];
const _mbItemCount = 30;
const _postCount = 10;
const _favicon = new Uint8Array(await Deno.readFile("favicon.ico"));
const _style = await Deno.readTextFile("styles/style.css");
const _easyMDEJS = await Deno.readTextFile("scripts/easymde.min.js");
const _easyMDECSS = await Deno.readTextFile("styles/easymde.min.css");
const _compressor = await Deno.readTextFile("scripts/compressor.min.js");
const _cookieKey = Deno.env.get("APP_COOKIE_KEY");
//const _cookieKey = "secret1";

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
        <link rel="apple-touch-icon" href="/lillihub-512.png">
        <meta name="apple-mobile-web-app-status-bar-style" content="black">
        <meta name="theme-color" content="#000000">
        <meta name="apple-mobile-web-app-title" content="Lillihub">
        <link rel="manifest" href="/manifest.webmanifest">
        <title>Lillihub</title>
        <link rel="stylesheet" media="(prefers-color-scheme:light)" href="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.11.2/cdn/themes/light.css"/>
        <link rel="stylesheet" media="(prefers-color-scheme:dark)" href="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.11.2/cdn/themes/dark.css" onload="document.documentElement.classList.add('sl-theme-dark');"/>
        <style>${getCommonCSS()}"</style>
        <noscript><style>.jsonly { display: none }</style></noscript>
        <script type="text/javascript">${getCommonJS()}</script>
        <script async type="module" src="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.11.2/cdn/components/carousel-item/carousel-item.js"></script>
        <script async type="module" src="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.11.2/cdn/components/carousel/carousel.js"></script>
        <script async type="module" src="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.11.2/cdn/components/format-date/format-date.js"></script>
        <script>if('serviceWorker' in navigator){ navigator.serviceWorker.register('/sw.js') }</script>
        </head>
        <body class="u-container">
        <a id="topJump" href="#top">Top ↑</a>
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
 * @param  {bool} is_premium - Is this a premium micro.blog user?
 */
function mainMenuTemplate(loggedIn = true, endSidebar = true, is_premium = false) {
    return loggedIn ? `
        <ul class="discover">
            <li class="blue-purple"><a href="/app/blog/post">New Post</a></li>
            <li class="green-blue discover-li-wide"><small>Micro.blog:</small>
                <p style="margin-left:0;" class="margin-3xs"><a class="margin-bottom-3xs" href="/app/timeline">Posts</a></p>
                <p style="margin-left:0;" class="margin-3xs"><a class="margin-bottom-3xs" href="/app/conversations">Conversations</a></p>
                <p style="margin-left:0;" class="margin-3xs"><a href="/app/mentions">Mentions</a></p>
            </li>
            <li class="yellow-green discover-li-wide"><small>My Blog:</small>
                <!--<p style="margin-left:0;" class="margin-3xs"><a class="margin-bottom-3xs" href="/app/blog/post">New Post</a></p>-->
                <p style="margin-left:0;" class="margin-3xs"><a class="margin-bottom-3xs" href="/app/blog/posts">Posts</a></p>
                <p style="margin-left:0;" class="margin-3xs"><a href="/app/blog/media">Media</a></p>
            </li>
            <li class="orange-yellow discover-li-wide"><small>My Stuff:</small>
                <p style="margin-left:0;" class="margin-3xs"><a class="margin-bottom-3xs" href="/app/bookmarks">Bookmarks</a></p>
                ${is_premium ? `<p style="margin-left:0;" class="margin-3xs"><a class="margin-bottom-3xs" href="/app/highlights">Highlights</a></p>` : ``}
                <p style="margin-left:0;" class="margin-3xs"><a href="/app/bookshelves">Bookshelves</a></p>
            </li>
            <li class="red-orange discover-li-wide"><small>Manage MB:</small>
                <p style="margin-left:0;" class="margin-3xs"><a class="margin-bottom-3xs" href="/app/users/following">Following</a></p>
                <p style="margin-left:0;" class="margin-3xs"><a href="/app/replies">Replies</a></p>
            </li>
            <li class="purple-red discover-li-wide"><small>Lillihub:</small>
                <p style="margin-left:0;" class="margin-3xs"><a class="margin-bottom-3xs" href="/app/settings">Settings</a></p>
                <p style="margin-left:0;" class="margin-3xs"><a href="/">About</a></p>
                <p style="margin-left:0;" class="margin-3xs"><a href="/app/logout">Logout</a></p>
            </li>
            <li class="purple-red noShift logo"><a href="/">${logoSVG()}</a></li>
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
 * @param  {object} previous - The previous post (if any)
 * @param  {string} previousLocation - the previous location
 */
function postActionTemplate(darkmode, id, username, isPinned, _microblog, content_html, bookshelves, isFollowing, tags, isPost = true, bookPost = '', bookShelfId = 0, previous = null, previousLocation = '') { 
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
    
    const viewPostAction = isPost && !_microblog.is_bookmark ? `<a target="_top" href="/app/post?id=${id}${ previous ? `&back=${previous.id}` : ``}&location=${previousLocation}">View post</a>` : '';

    const bookPostAction = !isPost && bookPost ? `<a target="_top" href="/app/blog/post?content=${encodeURIComponent(bookPost)}">Create post</a>` : '';

    const removeBookAction = !isPost ? `<details class="actionExpand"><summary class="actionExpandToggle">Remove Book</summary>
                                        <form style="height: 100%;max-height: 300px;" method="POST" action="/app/bookshelves/removeBook">
                                            <input type="hidden" name="bookshelfId" value="${bookShelfId}" />
                                            <input type="hidden" name="bookId" value="${id}" />
                                            <button class="actionBtn"  type="submit">Remove</button>
                                        </form></details>` : '';
    return `
        <div class="actions">
            <details style="position:absolute;z-index:${id};border-radius: var(--space-3xs);color: var(--subtext-1);background-color: var(--mantle);margin-left: -92px;">
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
 * @param {bool} isFollowing - Is this commentor someone you follow?
 */
function commentTemplate(darkmode, comment, repliers, contentFilters, isFollowing) {
    if(comment == null || comment == undefined || comment.content_html == null || comment.content_html == undefined){
        return '';
    }
    if(filterOut(contentFilters, comment.content_html))
    {
        return `<div class="comment"><p style="color: var(--overlay-1);">Reply was filtered out.</p></div>`
    }
    
    return `
        <div id="${comment.id}" class="comment" ${isFollowing ? 'style="border: 1px solid var(--overlay-1)"':''}>
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
 * @param  {array} tags - the Micro.blog tags 
 */
async function streamBookmarkTags(ctx, controller, tags) {
    const id = await ctx.request.url.searchParams.get('id');
    controller.enqueue(`<ul class="categories">`); 

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
 * @param  {object} previous - the previous post (if any)
 * @param  {int} lastSeen - the timestamp of the last seen post
 */
async function streamPosts(ctx, controller, posts, isConvo, includeReplies = true, includeActions = true, openConvo = false, previous = null, lastSeen = 0) {
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

        if(!isConvo) {
            previous = i == 0 ? post : posts[i-1];
        }

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

            const post_content = post.content_html;
            const returnLocation = getReturnLocation(await ctx.request.url.href);
            const postActions = includeActions ? postActionTemplate(darkmodeCookie, post.id, post.author._microblog.username, !pinned.includes(post.id), post._microblog, post.content_html, bookshelves.items, isFollowing, tagCheck, true, '', 0, previous, returnLocation) : '';
            controller.enqueue(postContentTemplate(post.id, post.author._microblog.username, post.author.name, post.author.avatar, post.url, post.date_published, post_content, postActions, isFollowing, post._microblog.date_relative));
            if(post.tags) {
                controller.enqueue(`<div><p style="color:var(--subtext-1)"><small>Tags: ${post.tags.split(',').map(function(tag){ return `<span class="tag"><a href="/app/bookmarks?id=${tag.trim()}">${tag.trim()}</a></span>` }).join(' ')}</small></p></div>`);
            }

            if(includeReplies) {
                await streamComments(ctx, controller, post.id, openConvo, isConvo ? convo : null, previous);
            }
        }
        else
        {
            controller.enqueue(`<article class="post" style="padding-top: 0; display:block;"><section style="color: var(--overlay-1);"><p>Content was filtered out.</p>`);
        }
        controller.enqueue('</section></article>');

        if(lastSeen == -1) {
            // This comes from the conversations page.
            controller.enqueue('<p class="center"><span class="all-caught-up">All caught up on mentions 🎉</span></p>');
        }
        else if(lastSeen != 0 && post.id == lastSeen) 
        {
            controller.enqueue('<p class="center"><span class="all-caught-up">All caught up 🎉</span></p>');
            lastSeen = 0;
        }
    }
}

function getReturnLocation(href) {
    if(href.includes('timeline')) {
        return 'timeline';
    }
    if(href.includes('conversations')) {
        return 'conversations';
    }
    if(href.includes('mentions')) {
        return 'mentions';
    }
    if(href.includes('discover')) {
        return 'discover';
    }
    return '';
}

/**
 * Streams a list of micro.blog comments to a post
 * @param  {object} ctx - The request context
 * @param  {object} controller - The controller of the readable stream     
 * @param  {string} postid - The id of the post  
 * @param  {bool} open - Should the details toggle default to open?
 * @param  {array} convo - An array of conversation posts if already fetched.
 * @param  {object} previous - The previous post
 */
async function streamComments(ctx, controller, postid, open = false, convo, previous) {
    const access_token = await ctx.cookies.get('access_token');
    const commentLimit = (await ctx.cookies.get('limitComments'));
    const limit = parseInt(commentLimit) ? parseInt(commentLimit) - 1 : 24;
    const contentFilterCookie = await ctx.cookies.get('contentFilter');
    const contentFilters = contentFilterCookie == undefined ? [] : JSON.parse(contentFilterCookie);
    const darkmodeCookie = await ctx.cookies.get('darkMode');
    const back = await ctx.request.url.searchParams.get('back');
    const location = await ctx.request.url.searchParams.get('location');

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
    //let returnId = 0;

    if(comments.length > 0) {
        const avatars = comments.map(function (comment, i) { return i < 3 && comment != null && comment.author != null ? '<img loading="lazy" src="' + comment.author.avatar + '"/>' : '' }).join('');
        
        // reverse the comments so we can display oldest first.
        comments = comments.reverse();

        controller.enqueue(`<div class="comments">
            <details aria-expanded=${open ? 'true' : 'false'} ${open ? 'open' : ''}>
                <summary onclick="toggleSummary(this, event);">${avatars}<span class="comment-count">${comments.length} comments</span></summary>`);
                if(!open) {
                    for(let i = 0; i <= limit && i < comments.length; i++) {
                        const isFollowing = await isFollowingMicroBlogUser(comments[i].author._microblog.username, access_token);
                        controller.enqueue(await commentTemplate(darkmodeCookie, comments[i], uniqueRepliers, contentFilters, isFollowing));
                    }
                } else {
                    for(let i = 0; i < comments.length; i++) {
                        const isFollowing = await isFollowingMicroBlogUser(comments[i].author._microblog.username, access_token);
                        controller.enqueue(await commentTemplate(darkmodeCookie, comments[i], uniqueRepliers, contentFilters, isFollowing));
                    }
                }
        controller.enqueue(replyTemplate(darkmodeCookie, postid, author, uniqueRepliers, false));
        if(!open && comments.length > limit + 1) {
            const returnLocation = getReturnLocation(await ctx.request.url.href);
            if(returnLocation) {
                controller.enqueue(`<p style="text-align:center;"><a target="_top" href="/app/post?id=${postid}${ previous ? `&back=${previous.id}` : ``}&location=${returnLocation}">View post to see all comments</a></p>`);
            }
        }
        if(open && back) {
            controller.enqueue(`<p style="text-align:center;"><a target="_top" href="/app/${location}?last=${back}&clear=true">Return to ${location}</a></p>`);
        }
        controller.enqueue(`</details>`);
    } else {
        controller.enqueue(replyTemplate(darkmodeCookie, postid, author, uniqueRepliers, true));
        if(open && back) {
            controller.enqueue(`<p style="text-align:center;"><a target="_top" href="/app/${location}?last=${back}&clear=true">Return to ${location}</a></p>`);
        }
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
 * @param  {object} controller - The controller of the readable stream 
 * @param  {int}    i - The current loop on this fetch    
 * @param  {object} lastSeen - The tracking object for what has been seen by the user
 * @param  {array}  filtered - The current set of filtered posts
 * @param  {bool}  showMessage - Show the message
 */
function findLastNewPost(controller, i, lastSeen, filtered, showMessage) {
    let lastNewPost = null;
    let unseenPosts = null;

    //check the first post. If it was before the last seen...
    if(i == 0 && !lastSeen.marked && lastSeen.last && lastSeen.last > 0 && filtered[0] && filtered[0]._microblog && 
        filtered[0]._microblog.date_timestamp < lastSeen.last && showMessage)
    {
        //then all posts have been seen.
        lastSeen.marked = true;
        controller.enqueue('<p class="center"><span class="all-caught-up">All caught up</span></p>');
        lastNewPost = {};
    } 
    if(!lastSeen.marked) {
        unseenPosts = filtered.filter(p => p._microblog != undefined && lastSeen.last && lastSeen.last > 0 && 
            p._microblog.date_timestamp >= lastSeen.last);
        lastNewPost = unseenPosts && unseenPosts.length > 0 ? unseenPosts[unseenPosts.length - 1] : null;
    }

    
    if(lastNewPost && unseenPosts && filtered && unseenPosts.length == filtered.length){
        // all the post on the page a new. We need to check the next page to find the last one.
        lastNewPost = null;
    }

    return lastNewPost;
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
    const clear = await ctx.request.url.searchParams.get('clear');
    const location = getReturnLocation(await ctx.request.url.href);
    const user = await getMicroBlogLoggedInUser(cookies.access_token);

    controller.enqueue(beginHTMLTemplate(cookies.avatar, cookies.username, conversations ? "Conversations" : name ? name : "Timeline", darkmodeCookie));  

    if(name && (name == "news" || name == "challenges" || name == "monday"))
    {
        controller.enqueue(discoverMenuTemplate());
        await streamDiscoverTags(ctx, controller); 
    } else {
        controller.enqueue(mainMenuTemplate(true, false, user.is_premium));
        await streamPinned(ctx, controller); 
    }  

    controller.enqueue(`<div class="posts">`);

    const kv = await Deno.openKv();

    const result = await getMicroBlogTimeline(name, last ? last : before ? before : null, cookies.access_token, before ? true : false);
    let posts = result ? result.items : [];
    const lastSeen = { };

    if(!name) {
        const peek = await kv.get(["peek", user.username, location]);
        if(peek && peek.value) {
            if(!last && !before) {
                lastSeen.now = Math.trunc(new Date().getTime()/1000);
                lastSeen.last = peek.value.now ? peek.value.now : 0;
                lastSeen.marked = false;
            } else {
                // we have paged
                lastSeen.now = peek.value.now;
                lastSeen.last = peek.value.last;
                lastSeen.marked = peek.value.marked;
            }
        }
    }

    if(!posts || posts.length == 0) {
        controller.enqueue(`<p style="text-align:center">No data returned from Micro.Blog</p>`); 
        controller.close();
    } else {
        if (name) {
            await streamUserProfile(ctx, controller, result.author, result._microblog);
            controller.enqueue(postMenuBarTemplate(conversations ? 'conversations' : 'posts', name, false)); 
        } else {
            controller.enqueue(postMenuBarTemplate(conversations ? 'conversations' : 'posts', name));
        }
        
        if(conversations) {
            const roots = [];
            let seen = [];
            let i = 0;
            let marked = false;
            if(last && !clear) {
                const result = await kv.get(["conversations", user.username]);
                if(result && result.value) {
                    seen = result.value;
                }
            }
            while(roots.length < _postCount && i < 5) {
                let filtered = [];
                if(i == 0) {
                    filtered = posts.filter(p => p._microblog != undefined && p._microblog.is_mention);
                }
                else
                {
                    const secondFetch = await getMicroBlogTimeline(name, posts[posts.length - 1].id, cookies.access_token);
                    const additionalPosts = secondFetch ? secondFetch.items : [];
                    filtered = additionalPosts.filter(p => p._microblog != undefined && p._microblog.is_mention);
                    posts = posts.concat(filtered);
                }
                const lastNewPost = findLastNewPost(controller, i, lastSeen, filtered, !name);
                i++;
                for(let i = 0; i < filtered.length; i++ ){
                    const convo = await getMicroBlogConversation(filtered[i].id, cookies.access_token);
                    const rootId = convo.items[convo.items.length - 1].id;
                    if(!roots.includes(rootId) && !seen.includes(rootId)){
                        await streamPosts(ctx, controller, convo.items, true, true, true, false, i == 0 ? filtered[0] : filtered[i-1], lastNewPost && !lastSeen.marked ? (lastNewPost.id == filtered[i].id ? -1 : 0) : 0);
                        roots.push(rootId);
                    }    
                }
                if(lastNewPost && !marked && !name) {
                    lastSeen.marked = true;
                    marked = true;
                    await kv.set(["peek", user.username, location], lastSeen);
                }
            }

            //Now save the list of root + seen ids
            if(last && !clear) {
                await kv.set(["conversations", user.username], seen.concat(roots));
            } else {
                await kv.set(["conversations", user.username], roots);
            }
        }
        else {
            let count = 0;
            let i = 0;
            let marked = false;
            while(count < _postCount && i < 5) {           
                let filtered = [];
                if(i == 0) {
                    filtered = posts.filter(p => p._microblog != undefined && !p._microblog.is_mention);
                }
                else
                {
                    const fetchPosts = await getMicroBlogTimeline(name, posts[posts.length - 1].id, cookies.access_token);
                    const additionalPosts = fetchPosts ? fetchPosts.items : [];
                    filtered = additionalPosts.filter(p => p._microblog != undefined && !p._microblog.is_mention);
                    posts = posts.concat(filtered);
                }
                const lastNewPost = findLastNewPost(controller, i, lastSeen, filtered, !name);
                i++;
                await streamPosts(ctx, controller, filtered, false, true, true, false, null, lastNewPost && !lastSeen.marked ? lastNewPost.id : 0);
                if(lastNewPost && !marked && !name) {
                    lastSeen.marked = true;
                    marked = true;
                    await kv.set(["peek", user.username, location], lastSeen);
                }
                count += filtered.length;
            }
        }
        
        if(!lastSeen.marked && !name) {
            await kv.set(["peek", user.username, location], lastSeen);
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
    const user = await getMicroBlogLoggedInUser(cookies.access_token);

    controller.enqueue(beginHTMLTemplate(cookies.avatar, cookies.username, title, darkmodeCookie));  
    controller.enqueue(mainMenuTemplate(true, true, user.is_premium));
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
        syndicateTo += `<label style="display:inline-block;"><input checked="checked" type="checkbox" name="syndicate[]" value="${syndicates['syndicate-to'][i].uid}"/>${syndicates['syndicate-to'][i].name}</label>&nbsp;`;
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
            categoriesList += `<label style="display:inline-block;"><input ${checked ? 'checked="checked"' : ''} type="checkbox" name="category[${category}]" value="${category}"/>${category}</label>&nbsp;`;
        }
    }

    const emojiFetch = await microBlogGet('posts/discover', access_token);
    const discover = await emojiFetch.json();
    let emojiList = discover._microblog.tagmoji.map(function(tag){ return `<li>${tag.emoji} ${tag.title}</li>` }).join(' ');

    return `
        <script>${_compressor}</script>
        <style>${_easyMDECSS}</style>
        <script>${_easyMDEJS}</script>
        <style>
            .editor-toolbar.fullscreen {
                height: 60px;
                z-index: 9999999999;
                border-bottom: 1px solid var(--text);
            }
            @media (prefers-color-scheme: dark) {
                .editor-toolbar.fullscreen {
                    border-bottom: 1px solid var(--mantle);
                    background-color: var(--mantle);
                }
                .editor-preview {
                    background-color: var(--mantle);
                }
                .cm-s-easymde .cm-formatting-link, .cm-s-easymde .cm-url, .cm-s-easymde .cm-link {
                    color: var(--base) !important;
                }
            } 
            html:not(.style-scope)[dark] .editor-toolbar.fullscreen {
                border-bottom: 1px solid var(--mantle); 
                background-color: var(--mantle);  
            }
            html:not(.style-scope)[dark] .editor-preview  {
                background-color: var(--mantle);  
            }
            html:not(.style-scope)[dark] .cm-s-easymde .cm-formatting-link, .cm-s-easymde .cm-url, .cm-s-easymde .cm-link   {
                color: var(--base) !important;
            }

            .editor-toolbar {
                border:none;
            }

            .editor-toolbar button {
                border: 1px solid var(--crust);
                background-color: var(--base);
            }
            @media (prefers-color-scheme: dark) {
                .editor-toolbar button {
                    border: 1px solid var(--crust);
                    background-color: var(--base);
                }
            } 
            html:not(.style-scope)[dark] .editor-toolbar button {
                border: 1px solid var(--crust);
                background-color: var(--base);  
            }
            .cm-spell-error {
                background: rgba(255,0,0,0) !important;
            }
            span[data-img-src]::after {
                max-width: 385px;
                max-height: 600px;
            }
        </style>
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
                    inputStyle: 'contenteditable',
                    nativeSpellCheck: true,
                    showIcons: ["code"],
                    previewImagesInEditor: true,
                    status: ["upload-image", "autosave", "lines", "words", "cursor", {
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
            <details style="font-size:var(--step--1)">
                <summary style="margin-bottom:0">Micro.blog tag list</summary>
                <p>Use an emoji below in your text to tag your post for a Micro.blog tagmoji feed.</p>
                <ul style="list-style:none;columns: 2;-webkit-columns: 2;-moz-columns: 2;">${emojiList}</ul>
            </details>
            <p style="text-decoration:underline;">Categories</p>
            <p>${categoriesList}</p>
            ${syndicateTo ? `<p style="text-decoration:underline;">Crossposting</p><p>${syndicateTo}</p>` : ''}
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
    const uuid = crypto.randomUUID();
    await ctx.cookies.set("state", uuid);
    ctx.response.body = `
    <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <meta name="description" content="Lillihub - A delightful Micro.blog client">
                <meta name="apple-mobile-web-app-capable" content="yes">
                <link rel="icon" type="image/x-icon" href="/favicon.ico">
                <link rel="apple-touch-icon" href="/lillihub-512.png">
                <meta name="apple-mobile-web-app-status-bar-style" content="black">
                <meta name="theme-color" content="#000000">
                <meta name="apple-mobile-web-app-title" content="Lillihub">
                <link rel="manifest" href="/manifest.webmanifest">
                <link rel="stylesheet" href="https://unpkg.com/mvp.css"> 
                <title>Lillihub</title>
            </head>
            <body style="background-color:#fefefe">
            <header>
                <nav>
                    <a href="/app/timeline">My Lillihub Timeline</a>
                    <ul>
                        <li><a href="https://github.com/heyloura/lillihub-client">Code</a></li>
                        <li><a href="https://heyloura.com/categories/lillihub/">Blog</a> (<a href="https://heyloura.com/categories/lillihub/feed.xml">RSS</a>)</li>
                    </ul>
                </nav>
                <p><img alt="Logo" src="/lillihub-512.png" height="128" style="border: 2px solid black;"></p>
                <h1>Lillihub</h1>
                <p>A delightful Micro.blog web client built by <a href="https://heyloura.com">Loura</a></p>
                <br>
                <section> 
                <form action="https://micro.blog/indieauth/auth" method="get">
                    <h3>Log in using Micro.blog</h3>
                    <label style="font-weight:400;">
                    Enter in your https://<em>username</em>.micro.blog website or your custom domain if you have one.
                    <br/><br/><input style="width:90%;" type="url" name="me" value="https://" required/>
                    </label>
                    <input type="hidden" name="client_id" value="${_appURL}"/>
                    <input type="hidden" name="redirect_uri" value="${_appURL}/app/auth"/>
                    <input type="hidden" name="state" value="${uuid}"/>
                    <input type="hidden" name="scope" value="create"/>
                    <input type="hidden" name="response_type" value="code"/>
                    <button style="display: block; margin: 0px auto;" type="submit" class="signIn">Sign In</button>
                </form>
                <p>Welcome to the pond! 🐸</p>
                </section>
            </header>
            <main>
                <section>
                    <header>
                        <h2>Key Features:</h2>
                        <p>Lillihub is a reimagined Micro.blog web client based on simplicity and ease of use. 
                            Follow and interact with other micro.bloggers and fediverse users with inline replies 
                            and a fully loaded comment thread. It fits to your device, respects your light/dark mode 
                            preferences, and offers content moderation.
                        </p>
                    </header>
                    <aside>
                        <figure>
                            <img alt="Screenshot showing comments under a post" src="https://heyloura.com/uploads/2023/screenshot-from-2023-11-05-07-23-02.png">
                        </figure>
                    </aside>
                    <aside style="width:var(--width-card-medium)">
                        <h3>Posts, conversations and mentions:</h3>
                        <p>Lillihub splits the Micro.blog timeline into three sections. 
                            Posts have all the posts from the people you follow in chronological order. 
                            The conversations page finds all the @mentions happening among your following 
                            and shows the post that started it. It's a great way to find new people to follow. 
                            The mentions page is an easy way to find who @mentioned you specifically.</p>

                        <p>Comments are now preloaded under each post. Lillihub also makes it easy to reply 
                            inline and select who you want to reply to. The reply area auto expands as you write.</p>
                    </aside>
                    <aside>
                        <figure>
                            <img src="https://heyloura.com/uploads/2023/screenshot-from-2023-11-05-08-59-58.png">
                        </figure>
                    </aside>
                    <aside style="width:var(--width-card-medium)">
                        <h3>Create new posts:</h3>
                        <p>Create new posts easily with a simple markdown editor that supports common formats, 
                        drag+drop/copy images, and preview. You can even toggle full screen mode (desktop only) 
                        and preview your post. Not ready to publish? Save it as a draft. Lillihub supports 
                        syndication and assigning categories all in one place.</p>
                    </aside>
                    <aside>
                        <figure>
                            <img src="https://heyloura.com/uploads/2023/screenshot-from-2023-11-05-07-13-15.png">
                        </figure>
                    </aside>
                    <aside style="width:var(--width-card-medium)">
                        <h3>Pin interesting posts:</h3>
                        <p>Find an interesting post that you want to follow up on, but don't want to bookmark? 
                        Pin it! Then come back to it when you're ready to engage. 
                        Pinned posts are on the sidebar (desktop/tablet) or navbar (mobile) for easy access.</p>
                    </aside>
                    <aside>
                        <figure>
                            <img src="https://heyloura.com/uploads/2023/screenshot-from-2023-11-05-09-03-38.png">
                        </figure>
                    </aside>
                    <aside style="width:var(--width-card-medium)">
                        <h3>Discover feed, emojitags and official Micro.Blog accounts:</h3>
                        <p>The discover page lets you view the discover feed from Micro.blog. Along the side (desktop/tablet) 
                        or navbar (mobile) you can access all the tagmoji feeds Micro.blog offers. 
                        The navigation also calls attention to the official Micro.blog accounts for roll calls 
                        (Monday), community challenges, and news.</p>
                    </aside>
                </section>
                <hr/>
                <section>
                    <header>
                        <h2>Other Features:</h2>
                    </header>
                    <ul>
                        <li>View user profiles. Both micro.bloggers and fediverse</li>
                        <li>Upload images and manage your blog media</li>
                        <li>Unfollow/Block/Mute users</li>
                        <li>Spot users you aren't following and start following with a button click.</li>
                        <li>Set content filters to exclude words from posts and comments</li>
                        <li>Manage your Micro.Blog bookshelves</li>
                        <li>Add books directly from the bookmoji feed</li>
                        <li>Manage your Micro.Blog bookmarks</li>
                    </ul>
                </section>
                <hr/>
                <section>
                    <header><h2>FAQ's + Tips and Tricks</h2></header>
                    <details open>
                        <summary >Not seeing conversations?</summary>
                        <div>Check to see if you have an adblocker, like 1blocker, installed. Some adblockers remove comments 
                        from webpages and will remove them from Lillihub.</div>
                    </details>
                </section>
            </main>
            <script src="https://tinylytics.app/embed/5r2JkhATuM6jGxmbdcdV.js" defer></script>
        </body>
        </html>
    `;

  return await next();
});

/**
 * For more info about indieAuth see: https://indieauth.spec.indieweb.org/
 * @todo Allow for custom indieauth and not just Micro.blog
 */
await router.get("/app/login", async (ctx, next) => {
    const uuid = crypto.randomUUID();
    await ctx.cookies.set("state", uuid);
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
 * @todo Allow for custom indieauth and not just Micro.blog
 */
await router.get("/app/logout", async (ctx, next) => {
    await ctx.cookies.delete("state");
    await ctx.cookies.delete("access_token");
    await ctx.cookies.delete("name");
    await ctx.cookies.delete("avatar");
    await ctx.cookies.delete("username");
    await ctx.cookies.delete("default");

    ctx.response.body = `
    <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <meta name="description" content="Lillihub - A delightful Micro.blog client">
                <meta name="apple-mobile-web-app-capable" content="yes">
                <link rel="icon" type="image/x-icon" href="/favicon.ico">
                <link rel="apple-touch-icon" href="/lillihub-512.png">
                <meta name="apple-mobile-web-app-status-bar-style" content="black">
                <meta name="theme-color" content="#000000">
                <meta name="apple-mobile-web-app-title" content="Lillihub">
                <link rel="manifest" href="/manifest.webmanifest">
                <link rel="stylesheet" href="https://unpkg.com/mvp.css"> 
                <title>Lillihub</title>
            </head>
            <body style="background-color:#fefefe">
            <header>
                <nav>
                    <a href="/">Lillihub Login</a>
                    <ul>
                        <li><a href="https://github.com/heyloura/lillihub-client">Code</a></li>
                        <li><a href="https://heyloura.com/categories/lillihub/">Blog</a> (<a href="https://heyloura.com/categories/lillihub/feed.xml">RSS</a>)</li>
                    </ul>
                </nav>
                <p><img alt="Logo" src="/lillihub-512.png" height="128" style="border: 2px solid black;"></p>
                <h1>Lillihub</h1>
                <p>A delightful Micro.blog web client built by <a href="https://heyloura.com">Loura</a></p>
                <br>
                <section> 
                <p>You have been logged out. Thank you for visiting the pond! 🐸</p>
                </section>
            </header>
            <main>

            </main>
            <script src="https://tinylytics.app/embed/5r2JkhATuM6jGxmbdcdV.js" defer></script>
        </body>
        </html>
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

        await ctx.cookies.set("access_token", response.access_token, { expires: expiresOn });
        await ctx.cookies.set("name", encodeURIComponent(response.profile.name), { expires: expiresOn });
        await ctx.cookies.set("avatar", response.profile.photo, { expires: expiresOn });

        const user = await getMicroBlogLoggedInUser(response.access_token);
        await ctx.cookies.set("username", encodeURIComponent(user.username), { expires: expiresOn });
        await ctx.cookies.set("default", encodeURIComponent(user.default_site), { expires: expiresOn });

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
    const user = await getMicroBlogLoggedInUser(cookies.access_token);
    
    ctx.response.body = `
        ${beginHTMLTemplate(cookies.avatar, cookies.username, 'Settings', darkmodeCookie)}
        ${mainMenuTemplate(true, true, user.is_premium)} 
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
    const user = await getMicroBlogLoggedInUser(cookies.access_token);

    ctx.response.body = new ReadableStream({
        async start(controller) {
            controller.enqueue(beginHTMLTemplate(cookies.avatar, cookies.username, "Photos", darkmodeCookie));  
        
            controller.enqueue(mainMenuTemplate(true, false, user.is_premium));
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
    const before = await ctx.request.url.searchParams.get('before');
    const clear = await ctx.request.url.searchParams.get('clear');
    const darkmodeCookie = await ctx.cookies.get('darkMode');

    ctx.response.body = new ReadableStream({
        async start(controller) {
            const user = await getMicroBlogLoggedInUser(cookies.access_token);
            controller.enqueue(beginHTMLTemplate(cookies.avatar, cookies.username, "Mentions", darkmodeCookie));  
            controller.enqueue(mainMenuTemplate(true, false, user.is_premium));
            await streamPinned(ctx, controller); 
            controller.enqueue(`<div class="posts">`);
            
            //
            // Right now the M.b. API doesn't seem to support
            // the count parameter on the mentions endpoint
            // so I'm hardcoding the display to 15
            //
            let fetchURL = `posts/mentions`;
            if(last) {
                fetchURL = `${fetchURL}?before_id=${last}`;
            }
            if(before && !last) {
                fetchURL = `${fetchURL}?since_id=${last}`;
            }
            const fetching = await microBlogGet(fetchURL, cookies.access_token);
            const results = await fetching.json();
            const posts = results.items;

            controller.enqueue(postMenuBarTemplate('mentions', null));  

            const kv = await Deno.openKv();
            let seen = [];
            if(last && !clear) {
                const result = await kv.get(['mentions', user.username]);
                if(result && result.value) {
                    seen = result.value;
                }
            }

            const roots = [];
            for(let i = 0; i < posts.length && i < 15; i++ ){
                const convo = await getMicroBlogConversation(posts[i].id, cookies.access_token);
                const rootId = convo.items[convo.items.length - 1].id;
                if(!roots.includes(rootId) && !seen.includes(rootId)){
                    await streamPosts(ctx, controller, convo.items, true, true, true, false, i == 0 ? posts[0] : posts[i-1]);
                    roots.push(rootId);
                }    
            }      

                //Now save the list of root + seen ids
            if(last && !clear) {
                await kv.set(['mentions', user.username], seen.concat(roots));
            } else {
                await kv.set(['mentions', user.username], roots);
            }

            controller.enqueue(`<p class="center">`);
            if((last || before) && posts[0]) {
                await streamPreviousPageLink(ctx, controller, posts[0].id);
            }
            if((posts.length > 15 && posts[14]) || posts[posts.length - 1] ) {
                if(posts.length > 15) {
                    await streamNextPageLink(ctx, controller, posts[14].id);
                } else {
                    await streamNextPageLink(ctx, controller, posts[posts.length - 1].id);
                }
            }
            controller.enqueue(`</p>`);

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
    const user = await getMicroBlogLoggedInUser(cookies.access_token);

    ctx.response.body = new ReadableStream({
        async start(controller) {
            controller.enqueue(beginHTMLTemplate(cookies.avatar, cookies.username, `Post: ${id}`, darkmodeCookie));  
            controller.enqueue(mainMenuTemplate(true, false, user.is_premium));
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
    const last = await ctx.request.url.searchParams.get('last');

    ctx.response.body = new ReadableStream({
        async start(controller) {
            controller.enqueue(beginHTMLTemplate(cookies.avatar, cookies.username, id ? id : 'Bookmarks', darkmodeCookie));  
            const user = await getMicroBlogLoggedInUser(cookies.access_token);
            
            controller.enqueue(mainMenuTemplate(true, !user.is_premium, user.is_premium));
            let tagCheck = '';
            if(user.is_premium) {     
                const tags = await getMicroBlogBookmarkTags(cookies.access_token); 
                await streamBookmarkTags(ctx, controller, tags); 
                tagCheck = tags.map(function (tag) { 
                    return `<label style="display:block;text-align:left;"><input name="tags[]" type="checkbox" value="${tag}" ${tag == id? `checked="checked"`:``}>${tag}</label>` 
                }).join('');
            }

            controller.enqueue(`<div class="bookmarks posts">`);
            controller.enqueue(`<div style="margin-bottom: var(--space-m);display:block;" class="profile">
            <form method="POST" action="/app/bookmarks/new">
                <label>Add Bookmark${id ? ` to ${id}` : ``}:<br/><br/><input type="url" name="url" /></label>
                ${!user.is_premium ? `` : 
                    `<details class="actionExpand" style="margin-bottom:var(--space-xs); background-color:initial;" >
                        <summary style="background-color:initial;" class="actionExpandToggle">Assign Tags</summary>
                        ${tagCheck}
                        <label style="margin-top:var(--space-xs)" for="newTag">New tag</label>
                        <input style="width:140px;" type="text" id="newTag" name="newTag" />
                    </details>`
                }
                <button type="submit">Add Bookmark</button>
            </form></div>`);

            const fetching = await microBlogGet(id ? `posts/bookmarks?tag=${id}${last ? `&before_id=${last}` : ``}` : `posts/bookmarks${last ? `?before_id=${last}` : ``}`, cookies.access_token);
            const bookmarks = await fetching.json();
            let highlightItems = [];

            if(user.is_premium) {
                const highlightFetching = await microBlogGet(`posts/bookmarks/highlights`, cookies.access_token);
                let highlights = await highlightFetching.json();
                highlightItems = highlights.items;
                
                // let i = 0;
                // while(highlights.items.length > 0 && i < 5) { 
                //     i++;
                //     highlights = await (await microBlogGet(`posts/bookmarks/highlights?before_id=${highlightItems[highlightItems.length - 1].id}`, cookies.access_token)).json();
                //     highlightItems.concat(highlights.items);
                // }
            }

            for(let i = 0; i < bookmarks.items.length; i++) {
                const bookmark = bookmarks.items[i];
                const bookmarkHighlights = highlightItems.filter(h => h.url == bookmark.url);
                if(bookmarkHighlights && bookmarkHighlights.length > 0) {
                    bookmark.content_html = bookmark.content_html.replaceAll("https://micro.blog/bookmarks/", `/app/bookmarks/reader?title=${encodeURIComponent(bookmark.content_html)}&highlights=${encodeURIComponent(bookmarkHighlights.map(bh => bh.id).join(','))}&id=`);
                    bookmark.content_html += `<small><mark>${bookmarkHighlights.length} highlight(s)</mark></small>`;
                } else {
                    bookmark.content_html = bookmark.content_html.replaceAll("https://micro.blog/bookmarks/", `/app/bookmarks/reader?title=${encodeURIComponent(bookmark.content_html)}&id=`);
                }
            }

            await streamPosts(ctx, controller, bookmarks.items, false, false, true, false);

            controller.enqueue(`<p class="center"><a style="margin-right:var(--space-3xl)" href="${id ? `/app/bookmarks?id=${id}&last=${bookmarks.items[bookmarks.items.length - 1].id}` : `/app/bookmarks?last=${bookmarks.items[bookmarks.items.length - 1].id}`}">Next</a></p>`); 
            controller.enqueue(`</div>${endHTMLTemplate()}`); 
            controller.close();
        }
    });

    ctx.response.headers = {"content-type": "text/html", "x-content-type-options": "nosniff" };
    return await next();
});

await router.get("/app/highlights", async (ctx, next) => {
    const cookies = await getCookies(ctx);
    const darkmodeCookie = await ctx.cookies.get('darkMode');
    const user = await getMicroBlogLoggedInUser(cookies.access_token);
    
    ctx.response.body = new ReadableStream({
        async start(controller) {
            controller.enqueue(beginHTMLTemplate(cookies.avatar, cookies.username, 'Highlights', darkmodeCookie));  
            
            controller.enqueue(mainMenuTemplate(true, true, user.is_premium));

            if(user.is_premium) {
                controller.enqueue(`<div class="highlights posts">`);

                const fetching = await microBlogGet(`posts/bookmarks/highlights`, cookies.access_token);
                const highlights = await fetching.json();

                for(let i =0; i < highlights.items.length; i++) {
                    const highlight = highlights.items[i];
                    controller.enqueue(`<article class="post" style="display:block;">
                    <section style="display:flex; flex-direction: column;">
                        <header style="display:flex; flex-direction: row;margin-bottom:var(--space-xs);">
                            <div>
                                <p>${highlight.title}</p>
                            </div>
                            <div style="margin-left: auto;">                        
                                <div class="actions">
                                    <details style="position:absolute;z-index:30421533;border-radius: var(--space-3xs);color: var(--subtext-1);background-color: var(--mantle);margin-left: -92px;">
                                        <summary style="padding: var(--space-2xs); font-size: var(--step--1); margin: 0;">Actions</summary>
                                        <div style="padding: var(--space-2xs); width: 200px; margin-left: -129px; background-color: var(--mantle);">         
                                            <a target="_top" href="/app/blog/post?content=${encodeURIComponent(`<blockquote cite="${highlight.url}">${highlight.content_text}<footer>—<cite><a href="${highlight.url}" target="_blank">${highlight.title}</a></cite></footer></blockquote>`)}">Quote</a>
                                        
                                            <details class="actionExpand">
                                                <summary class="actionExpandToggle">Delete</summary>
                                                <form method="POST" action="/app/highlight/delete">
                                                    <input type="hidden" name="id" value="${highlight.id}">
                                                    <button type="submit">Confirm Delete</button>
                                                </form>
                                            </details>
                                        </div>
                                    </details>
                                </div>
                            </div>
                        </header>
                        <mark>${highlight.content_text}</mark>
                        <div style="padding-top:var(--space-3xs);"><small>
                            <a href="${highlight.url}"><sl-format-date month="long" day="numeric" year="numeric" hour="numeric" minute="numeric" hour-format="12" date="${highlight.date_published}">${highlight.date_published}</sl-format-date></a></small></div>
                    </section></article>`);
                }
                controller.enqueue(`<p class="center"><a style="margin-right:var(--space-3xl)" href="${`/app/highlights?last=${highlights.items[highlights.items.length - 1].id}`}">Next</a></p>`); 
            }

            controller.enqueue(`</div>${endHTMLTemplate()}`); 
            controller.close();
        }
    });

    return await next();
});

await router.get("/app/bookmarks/reader", async (ctx, next) => {
    const cookies = await getCookies(ctx);
    const id = await ctx.request.url.searchParams.get('id');
    const title = await ctx.request.url.searchParams.get('title');
    const highlightIds = await ctx.request.url.searchParams.get('highlights');
    const darkmodeCookie = await ctx.cookies.get('darkMode');
    const user = await getMicroBlogLoggedInUser(cookies.access_token);
    let result = ``;
    const fetching = await microBlogGet(`hybrid/bookmarks/${id}`, cookies.access_token);
    const webreader = await fetching.text();
    
    const parser = new DOMParser();
    result += beginHTMLTemplate(cookies.avatar, cookies.username, 'Highlight Reader', darkmodeCookie); 
    result += mainMenuTemplate(true, true, user.is_premium);
    result += `<div class="reader posts screen-width">`;

    const titleDoc = parser.parseFromString(title);
    const readerLink = titleDoc.querySelector(".post_archived_links");
    const parent = readerLink.parentNode;
    parent.removeChild(readerLink);
    result += `<div style="border-bottom: 1px solid var(--crust)">
        ${titleDoc.toString().replaceAll("<p>",`<h2><a style="margin-right:var(--space-xs);" class="button" href="/app/bookmarks">Back</a>`).replaceAll("</p>","</h2>")} 
        </div>`;
    
    const doc = parser.parseFromString(webreader);
    const content = doc.querySelector("#content");
    const base = doc.querySelector("base");
    const baseURL = base.getAttribute("href");
    const root = baseURL.split('/');
    root.pop();

    const r = new RegExp('^(?:[a-z]+:)?//', 'i');
    const images = doc.querySelectorAll("img");
    for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const source = image.getAttribute('src')
        if(!r.test(source)) {
            image.setAttribute('src', `${root.join("/")}/${source}`)
        }
    }

    let contentWithHighlights = content.toString();
    if(highlightIds) {
        let highlightItems = [];
        const highlightFetching = await microBlogGet(`posts/bookmarks/highlights`, cookies.access_token);
        let highlights = await highlightFetching.json();
        highlightItems = highlights.items;
        
        // let i = 0;
        // while(highlights.items.length > 0 && i < 5) { 
        //     i++;
        //     highlights = await (await microBlogGet(`posts/bookmarks/highlights?before_id=${highlightItems[highlightItems.length - 1].id}`, cookies.access_token)).json();
        //     highlightItems.concat(highlights.items);
        // }

        highlightItems = highlightItems.filter(hi => highlightIds.includes(hi.id));

        for(let j=0; j < highlightItems.length; j++) {
            contentWithHighlights = contentWithHighlights.replaceAll(highlightItems[j].content_text,`<span class="highlight">${highlightItems[j].content_text}</span>`);
        }
    }
    result += contentWithHighlights;  

    result += `<form method="POST" action="/app/highlight/add" >
            <input type="hidden" name="highlightIds" value="${highlightIds}"/>
            <input type="hidden" name="title" value="${encodeURIComponent(title)}"/>
            <input type="hidden" name="selection" id="selectionInput"/>
            <button style="display:none;" id="highlightMe">Highlight selection</button>
        </form>
        <script>
        function getSelectionHtml() {
            var html = "";
            if (typeof window.getSelection != "undefined") {
                var sel = window.getSelection();
                if (sel.rangeCount) {
                    var container = document.createElement("div");
                    for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                        container.appendChild(sel.getRangeAt(i).cloneContents());
                    }
                    html = container.innerHTML;
                }
            } else if (typeof document.selection != "undefined") {
                if (document.selection.type == "Text") {
                    html = document.selection.createRange().htmlText;
                }
            }
            return html;
        }
        document.addEventListener("selectionchange", function(event) {
            const selection = window.getSelection();
            
            if (selection.rangeCount === 0) {
                return;
            }
        
            document.getElementById('selectionInput').value = getSelectionHtml();
        });
    </script>`;

    result += `</div>${endHTMLTemplate()}`; 
    ctx.response.body = result;

    return await next();
});

await router.get("/app/bookshelves", async (ctx, next) => {
    const cookies = await getCookies(ctx);
    const id = await ctx.request.url.searchParams.get('id');
    const darkmodeCookie = await ctx.cookies.get('darkMode');
    const user = await getMicroBlogLoggedInUser(cookies.access_token);

    ctx.response.body = new ReadableStream({
        async start(controller) {
            controller.enqueue(beginHTMLTemplate(cookies.avatar, cookies.username, 'Bookshelves', darkmodeCookie));             
            controller.enqueue(mainMenuTemplate(true, false, user.is_premium));
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
    const user = await getMicroBlogLoggedInUser(cookies.access_token);

    ctx.response.body = new ReadableStream({
        async start(controller) {
            controller.enqueue(beginHTMLTemplate(cookies.avatar, cookies.username, 'My Blog', darkmodeCookie));  
            controller.enqueue(mainMenuTemplate(true, true, user.is_premium));
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
    const user = await getMicroBlogLoggedInUser(cookies.access_token);

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
            
            controller.enqueue(mainMenuTemplate(true, true, user.is_premium));
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
            controller.enqueue(`<section class="media posts">`);
            controller.enqueue(media.items.map(i => postContentTemplate(i.url, 
                cookies.username, 
                i.published.split('T')[0], 
                '', 
                i.url, 
                i.url.split('/')[i.url.split('/').length - 1], 
                i.poster ? `<video controls="controls" playsinline="playsinline" src="${i.url}" preload="none"></video><br/><small>${i.url}</small>` : `<img src="${i.url}"/><br/><small>${i.url}</small>`, 
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
    const user = await getMicroBlogLoggedInUser(cookies.access_token);

    ctx.response.body = new ReadableStream({
        async start(controller) {
            const account = await getMicroBlogDestination(destination, cookies.access_token);

            controller.enqueue(beginHTMLTemplate(cookies.avatar, cookies.username, id ? 'Edit Post' : 'Create Post', darkmodeCookie));              
            controller.enqueue(mainMenuTemplate(true, true, user.is_premium));
            controller.enqueue(`<div class="posts">`);
            
            await streamAccountSwitch(ctx, controller, account ? account.uid : '', '/app/blog/post');
            
            controller.enqueue(`<div class="screen-width"><div style="margin-top:var(--space-s-m)" class="form">`);
            
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
    const user = await getMicroBlogLoggedInUser(cookies.access_token);

    ctx.response.body = new ReadableStream({
        async start(controller) {
            controller.enqueue(beginHTMLTemplate(cookies.avatar, cookies.username, 'Replies', darkmodeCookie));  
            controller.enqueue(mainMenuTemplate(true, true, user.is_premium));

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
            
        await ctx.cookies.set("contentFilter", JSON.stringify(result), { expires: new Date(Date.now() + 315600000000)}); // 10 years
        ctx.response.body = iFrameTemplate('<small class="success">Saved filters.</small>', darkmodeCookie); 
    } else if(type == "setLimit") {
        const limit = (await body.value).get('limit');
        const newLimit = parseInt(limit);
        if(newLimit) {
            await ctx.cookies.set("limitComments", limit, { expires: new Date(Date.now() + 315600000000)}); // 10 years
            ctx.response.body = iFrameTemplate('<small class="success">Saved limit.</small>', darkmodeCookie); 
        } else {
            ctx.response.body = iFrameTemplate('<small class="error">Failed.</small>', darkmodeCookie); 
        }
    } else if(type == "darkmode") {
        const darkMode = (await body.value).get('enableDarkMode');
        if(darkMode == "on"){
            await ctx.cookies.set("darkMode", true, { expires: new Date(Date.now() + 315600000000)}); // 10 years
            ctx.response.body = iFrameTemplate('<small class="success">Saved preference.</small>', darkmodeCookie); 
        } else {
            await ctx.cookies.set("darkMode", false, { expires: new Date(Date.now() + 315600000000)}); // 10 years
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
    await ctx.cookies.set("pinnedPosts", JSON.stringify(currentPins), { expires: new Date(Date.now() + 315600000000)}); // 10 years

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
    await ctx.cookies.set("pinnedPosts", JSON.stringify(currentPins), { expires: new Date(Date.now() + 315600000000)}); // 10 years
    
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

    const fetchingBookmarks = await microBlogGet('posts/bookmarks', access_token);
    const bookmark = (await fetchingBookmarks.json()).items[0];

    const tags = value.getAll('tags[]') ? value.getAll('tags[]') : [];
    const newTag = value.get('newTag');
    const id = bookmark.id;

    if(newTag) {
        tags.push(newTag);
    }

    // only add tags if there were any
    if(tags.length > 0) {
        const formBodyTags = new URLSearchParams();
        formBodyTags.append("tags", tags.join(','));
        
        const fetchingTags = await microBlogPostForm(`posts/bookmarks/${id}`, formBodyTags, access_token);
        const responseTags = await fetchingTags.text();
    }

    ctx.response.redirect('/app/bookmarks');
});

// await router.post("/app/highlight/add", async (ctx) => {
//     const access_token = await ctx.cookies.get('access_token');
//     const body = ctx.request.body({ type: 'form' });
//     const value = await body.value;
//     const selection = value.get('selection');
//     const title = value.get('title');
//     const highlightIds = value.get('highlightIds');

//     console.log(selection);
//     console.log(title);
//     console.log(highlightIds);

//     const fetching = await microBlogSimplePost(`/bookmarks/${id}/highlights`, access_token);
//     const response = await fetching.text();

//     ctx.response.redirect('/app/bookmarks');
// });

await router.post("/app/highlight/delete", async (ctx) => {
    const access_token = await ctx.cookies.get('access_token');
    const body = ctx.request.body({ type: 'form' });
    const value = await body.value;
    const id = value.get('id');

    const fetching = await microBlogSimpleDelete(`posts/bookmarks/highlights/${id}`, access_token);
    const response = await fetching.text();

    try {
        JSON.parse(response);
        ctx.response.redirect("/app/highlights");
    }
    catch {
        //TO-DO....
        //ctx.response.body = iFrameTemplate(`<small class="fail">Unsuccessful.</small>'`); 
    } 
});

await router.post("/app/share", async (ctx, next) => {
    const darkmodeCookie = await ctx.cookies.get('darkMode');
    const cookies = await getCookies(ctx);
    const body = ctx.request.body({ type: 'form-data' });
    const data = await body.value.read({ maxSize: Number.MAX_SAFE_INTEGER });

    ctx.response.body = `
        ${beginHTMLTemplate()}
        </aside>
        <div class="posts" style="padding:var(--space-3xs);">
        <h1>You Shared Stuff</h1>

        ${JSON.stringify(data)}

        </div>
        ${endHTMLTemplate()}
    `;
    return await next();
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
        } else {
            formBody.append("mp-syndicate-to[]", "");
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
 * Gets if there are new posts to see.
 * @param  {int} id  The id of the first post seen this session
 * @param  {string} access_token  An access token
 * @return {object}      The json object returned from the micro.blog api
 */
async function  getMicroBlogCheckNewPosts(id, access_token) {
    const fetching = await microBlogGet(`posts/check?since_id=${id}`, access_token);
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
        const posts = await fetching.json();
        posts.items.sort(function(a, b) { 
            return b._microblog.date_timestamp - a._microblog.date_timestamp;
        });
        return posts;
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
    return result.is_following || result.is_you;
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
    const cookies = {
        access_token: await ctx.cookies.get('access_token'),
        username: await ctx.cookies.get('username'),
        avatar: await ctx.cookies.get('avatar'),
        profileName: await ctx.cookies.get('name')
    };
    return cookies;
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
            .replace(/[^a-z0-9]/gmi, " ").replace(/\s+/g, " ")
            .split(' ') : [];
        return contentFilters.some(filter => filter.trim() != '' && words.includes(filter.trim()));
    }
    return false;
}

// --------------------------------------------------------------------------------------
// Resources
// --------------------------------------------------------------------------------------
function getCommonJS() {
    return `
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
        function collapse(el) {
            el.removeAttribute("open");
            el.classList.remove("closing");
        }
        function waitForScroll(el) {
            el.classList.add("closing");
            window.setTimeout(collapse, 500, el);
        }
        function toggleSummary(el, e) {
            e.preventDefault();
            var expanded = el.parentElement.getAttribute('aria-expanded');
            var open = el.parentElement.hasAttribute("open");
            if(!open) {
                el.parentElement.setAttribute('aria-expanded', true);
                el.parentElement.setAttribute('open','true'); 
            } else { 
                el.parentElement.setAttribute('aria-expanded', false); 
                el.parentElement.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
                window.setTimeout(waitForScroll, 0, el.parentElement);
            }
        }
    `;
}
function getCommonCSS() {
    return _style
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
const app = new Application({ logErrors: true, keys: [_cookieKey] });
app.use(oakCors());

/**
 * Middleware - redirect to login page if the cookie with the access_token is missing.
 */
app.use(async (ctx, next) => {
    if (ctx.request.url.pathname !== "/favicon.ico") {
        if(ctx.request.url.pathname == "/manifest.webmanifest") {
            ctx.response.body = `{
                "name": "Lillihub",
                "short_name": "Lillihub",
                "start_url": "/app/timeline",
                "display": "standalone",
                "theme_color": "#000000",
                "background_color":"#000000",
                "icons": [
                  {
                    "src": "lillihub-512.png",
                    "sizes": "512x512",
                    "type": "image/png",
                    "purpose": "any maskable"
                  }],
                  "share_target": {
                    "action": "/app/share",
                    "method": "POST",
                    "enctype": "multipart/form-data",
                    "params": {
                      "title": "name",
                      "text": "description",
                      "url": "link",
                      "files": [
                        {
                          "name": "photos",
                          "accept": ["image/jpeg", ".jpg"]
                        },
                        {
                            "name": "screenshot",
                            "accept": ["image/png", ".png"]
                        }
                      ]
                    }
                  }
              }`;
            ctx.response.type = "text/json";
        } else if(ctx.request.url.pathname == "/sw.js") {
            ctx.response.body = `
            self.addEventListener('install', function(event) {
                event.waitUntil(self.skipWaiting());
            });
               
            self.addEventListener('fetch', function(event) {

            });`;
            ctx.response.type = "text/javascript";
        } else if(ctx.request.url.pathname == "/lillihub-512.png") {
            ctx.response.body = new Uint8Array(await Deno.readFile("lillihub-512.png"));
            ctx.response.type = "image/png";
        } else  {
            await next();
        }
    } 
    else
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