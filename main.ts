import { Application, Router, Status, Middleware } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import { Language, minify } from "https://deno.land/x/minifier/mod.ts";
import { serve } from "https://deno.land/std@0.140.0/http/server.ts";
import { DOMParser } from "https://esm.sh/linkedom";
import { marky } from "https://deno.land/x/marky@v1.1.6/mod.ts";
import * as ammonia from "https://deno.land/x/ammonia@0.3.1/mod.ts";
await ammonia.init();


const router = new Router();
const appURL = Deno.env.get("APP_URL");
const colors = ['var(--yellowgreen)','var(--green)','var(--greenblue)','var(--blue)','var(--bluepurple)','var(--purple)','var(--purplered)','var(--red)','var(--redorange)','var(--orange)','var(--orangeyellow)','var(--yellow)'];
const mbItemCount = 60;

// --------------------------------------------------------------------------------------
// Templates
// --------------------------------------------------------------------------------------
/**
 * Gets the initial template of the HTML page as a string
 * @param  {string} avatar - The url where the avatar image is stored
 * @param  {string} name - The display name of the user
 * @param  {string} username - The Micro.blog name of the user
 * @param  {string} title - The title of the HTML page
 */
function beginHTMLTemplate(avatar, name, username, title) {
    var loginHTML = `<div>
                    <a href="/app/login" alt="login">Log in</a>
                </div>`;

    var navBarHTML = `<a href="#top">${title}</a>
                <div class="header-nav">               
                    <a ${title && title == 'Timeline' ? 'class="selected"' : ''} href="/app/timeline">${timelineSVG()}<span class="show-lg">Timeline</span></a>
                    <a ${title && title == 'Discover' ? 'class="selected"' : ''} href="/app/discover">${discoverSVG()}<span class="show-lg">Discover</span></a>
                    <a href="/app/timeline?name=${username}">
                        <img src="${avatar}" width="38" height="38"/>&nbsp;
                    </a>
                </div>`;

    return `<!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="description" content="Lillihub - An unoffical Micro.blog client">
        <title>Lillihub</title>
        <style>${getCommonCSS()}"</style>
        <noscript><style>.jsonly { display: none }</style></noscript>
        <script type="text/javascript">${getCommonJS()}</script>
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
 * @param  {string} body - The body of the src doc
 */
function iFrameTemplate(body) {
    let style = `
        :root {--mantle: #eff1f5; --crust: #dce0e8; --text: #4c4f69; --green: #40a02b; --step--1: clamp(0.99rem, calc(0.99rem + 0.02vw), 1.00rem); }
        @media (prefers-color-scheme: dark) {:root {color-scheme: dark;--mantle: #292c3c;--crust: #232634;--text: #c6d0f5; --green: #a6d189;}
        body {padding:0; margin:0;color: var(--text);font-family: Seravek, Ubuntu, Calibri, source-sans-pro, sans-serif;font-size: var(--step--1);@media(prefers-color-scheme: dark) {background-color:var(--mantle);}}
        span {display:block; text-align:center; width:100%;}
        button {font-family: Seravek, Ubuntu, Calibri, source-sans-pro, sans-serif;font-size: var(--step--1);border:0; width: 100%; height: 40px; background-color:var(--mantle);color:var(--text);cursor:pointer;@media(prefers-color-scheme: dark) {background-color:var(--crust);}} 
        a { text-decoration: none; color: var(--text); }
        a:visited { text-decoration: none; color: var(--text); }
        form { margin: 0; padding: 0; }
        .success {color: var(--green);border:1px solid var(--green);border-radius:var(--space-3xs);padding:0 var(--space-3xs);}
    `; 
    return `<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>${style}</style></head><body style="background-color: transparent !important;">${body}</body></html>`;
}

/**
 * Gets a styled iframe form
 * @param  {string} form  The form inside the iframe
 */
function iFrameForm(form) {
    return `<iframe style="background-color:var(--mantle);" width="200" height="40" srcdoc='${iFrameTemplate(form)}'></iframe>`;
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
                <p class="margin-3xs"><a class="margin-bottom-3xs" href="/app/blog/posts">Posts</a></p>
                <p class="margin-3xs"><a href="/app/blog/media">Media</a></p>
            </li>
            <li class="yellow-green discover-li-wide"><small>My Stuff:</small>
                <p class="margin-3xs"><a class="margin-bottom-3xs" href="/app/bookmarks">Bookmarks</a></p>
                <p class="margin-3xs"><a href="/app/bookshelves">Bookshelves</a></p>
            </li>
            <li class="orange-yellow discover-li-wide"><small>Manage MB:</small>
                <p class="margin-3xs"><a class="margin-bottom-3xs" href="/app/following">Following</a></p>
                <p class="margin-3xs"><a href="/app/replies">Replies</a></p>
            </li>
            <li class="red-orange discover-li-wide"><small>Lillihub:</small>
                <p class="margin-3xs"><a class="margin-bottom-3xs" href="/app/settings">Settings</a></p>
            </li>
            <li class="purple-red noShift"><a href="/"><img src="https://lukzvfwtcukheapdgprx.supabase.co/storage/v1/object/public/Testing/frog-1-01.svg" /></a></li>
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
            <li class="orange-yellow noShift" style="padding: 0;"><img src="https://lukzvfwtcukheapdgprx.supabase.co/storage/v1/object/public/Testing/frog-1-01.svg" /></li>
        </ul>
        ${endSidebar ? '</aside>' : ''}
    ` : '</aside>';
}

/**
 * Sanitizes an HTML string. Also removes height/width from large images,
 * updates micro.blog username links to relative link, escape code block characters.
 * @param  {string} str - an HTML string
 */
function cleanFormatHTML (str) {
    function resize (html) {
        let images = html.querySelectorAll("img");
        for (let i = 0; i < images.length; i++) {
            let image = images[i];
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
        }
        let videos = html.querySelectorAll("video");
        for (let i = 0; i < videos.length; i++) {
            let video = videos[i];
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
        let anchors = html.querySelectorAll("a");
        for (let i = 0; i < anchors.length; i++) {
            let anchor = anchors[i];
            if(anchor.innerText.charAt(0) == '@' && anchor.getAttribute('href').includes('https://micro.blog/')) 
            {
                let newLink = anchor.getAttribute('href').replace("https://micro.blog/", "/app/timeline?name=")
                anchor.setAttribute('href', newLink);
            }
        }
	}

    function escapeCodeBlocks (html) {
        let codes = html.querySelectorAll("code");
        for (let i = 0; i < codes.length; i++) {
            let code = codes[i];
            code.innerHTML = code.innerHTML.replaceAll('<','&lt;').replaceAll('>','&gt;');
        }
	}
    
    let cleaned = ammonia.clean(str);
    let parser = new DOMParser();
    let doc = parser.parseFromString(cleaned);
    resize(doc);
    microBlogLinks(doc);
    escapeCodeBlocks(doc);
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
 */
function postContentTemplate(id, username, name, avatar, url, date, content_html, postActions, isFollowing) { 
    let avatarHTML = avatar ? `<img style="width: var(--space-l);height: var(--space-l);border-radius: 50%;" loading="lazy" src="${avatar}" />` : '';
    return `
        <article class="post" data-id="${id}" style="display:block;">
            <section style="display:flex; flex-direction: column;">
                <header style="display:flex; flex-direction: row;margin-bottom:var(--space-xs);">
                    ${avatarHTML}
                    <div style="padding-left: var(--space-xs);">
                        <b>${name ? name : username}</b>${!isFollowing ? '&nbsp;<span class="label">Not following</span>' : ''}
                        <br/><small><a href="/app/timeline?name=${username}">@${username}</a>: <a href="${url}">${date}</a></small>
                    </div>
                    <div style="margin-left: auto;">
                    ${postActions}
                    </div>
                </header>
                <div class="content" style="flex-grow: 1;margin-bottom: var(--space-s);">${cleanFormatHTML(content_html)}</div>         
    `;
}

/**
 * Template for a posts button action bar
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
 */
function postActionTemplate(id, username, isPinned, _microblog, content_html, bookshelves, isFollowing, tags, isPost = true, bookPost = '') { 
    let quote = content_html;
    let readerLink = content_html.split('post_archived_links');
    if(readerLink.length > 1) {
        quote = readerLink[0].substring(0, readerLink[0].length - 10);
    }
    let bookshelfOptions = bookshelves.map(function (shelf) { return `<option value="${shelf.id}">Move to "${shelf.title}"</option>` }).join('');

    let addBookAction = _microblog.isbn ? `<form method="POST" action="/app/bookshelves/addBook">
                            <input type="hidden" name="bookAuthor" value="${_microblog.book_author}" />
                            <input type="hidden" name="bookTitle" value="${_microblog.book_title}" />
                            <input type="hidden" name="bookISBN" value="${_microblog.isbn}" />
                            <details class="actionExpand"><summary class="actionExpandToggle">Add book</summary>
                            <select style="width:220px;" name="bookshelfId">${bookshelfOptions}</select>
                            <button type="submit">Add book</button>
                            </details>
                        </form>` : '';

    let moveBookAction = !isPost ? `<form method="POST" action="/app/bookshelves/moveBook">
                                            <input type="hidden" name="bookId" value="${id}" />
                                            <details class="actionExpand"><summary class="actionExpandToggle">Move book</summary>
                                            <select style="width:220px;" name="bookshelfId">${bookshelfOptions}</select>
                                            <button type="submit">Move book</button>
                                            </details>
                                        </form>` : '';

    let followAction = !isFollowing && !_microblog.is_you && isPost && !_microblog.is_bookmark ? 
                iFrameForm(`<form method="POST" action="/app/users/follow">
                        <input type="hidden" name="username" value="${username}" />
                        <button type="submit">Follow User</button>
                    </form>`)
                : '';

    let pinningActions = isPost && !_microblog.is_bookmark ? iFrameForm(`<form method="POST" action="/app/${!isPinned ? 'unpin' : 'pin'}Post">
                                    <input type="hidden" name="id" value="${id}" />
                                    <button type="submit">${isPinned ? 'Pin' : 'Unpin'} post</button>
                                </form>`) : '';
    
    let boomarkingActions = isPost ? iFrameForm(`<form method="POST" action="/app/bookmarks/${!_microblog.is_bookmark ? 'bookmark' : 'unbookmark'}">
                        <input type="hidden" name="id" value="${id}" />
                        <button type="submit">${!_microblog.is_bookmark ? 'Bookmark' : 'Unbookmark'}</button>
                    </form>`) : '';
    
    let taggingActions = _microblog.is_bookmark && tags && isPost ? `<form style="height: 100%;margin-bottom: var(--space-3xs);" method="POST" action="/app/bookmarks/manageTags">
                                    <input type="hidden" name="id" value="${id}" />
                                    <details class="actionExpand">
                                        <summary class="actionExpandToggle">Update Tags</summary>
                                        ${tags}
                                        <button class="actionBtn" type="submit">Save Changes</button>
                                    </details>
                                </form>` : '';
    
    let quotePostAction = isPost ? `<a target="_top" href="/app/blog/post?content=${encodeURIComponent(`<blockquote>${quote}</blockquote>`)}">Quote</a>` : '';
    
    let bookPostAction = !isPost && bookPost ? `<a target="_top" href="/app/blog/post?content=${encodeURIComponent(bookPost)}">Create post</a>` : '';

    let removeBookAction = !isPost ? iFrameForm(`<form method="POST" action="/app/bookshelves/removeBook">
                                            <input type="hidden" name="bookshelfId" value="${id}" />
                                            <input type="hidden" name="bookId" value="${id}" />
                                            <button type="submit">Remove</button>
                                        </form>`) : '';

    return `
        <div class="actions">
            <details style="border-radius: var(--space-3xs);color: var(--subtext-1);border: 1px solid var(--mantle);position: absolute;z-index: 5;background-color: var(--mantle);margin-left: -92px;">
                <summary style="padding: var(--space-2xs); font-size: var(--step--1); margin: 0;">Actions</summary>
                <div style="padding: var(--space-2xs); width: 200px; margin-left: -129px; background-color: var(--mantle);">
                ${followAction}
                ${pinningActions}
                ${boomarkingActions}
                ${taggingActions}
                ${quotePostAction}
                ${bookPostAction}
                ${addBookAction}
                ${moveBookAction}
                ${removeBookAction}
                </div>
            </details>
        </div>`;  
}

/**
 * Template for a comment
 * @param  {object} comment - The comment object from micro.blog
 * @param  {array} repliers - An array of usernames that have commented on the post
 * @param  {array} contentFilters  An array of words to filter the reply content by  
 */
function commentTemplate(comment, repliers, contentFilters) {
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
            ${replyTemplate(comment.id, comment.author._microblog.username, repliers)}
        </div>
    `;
}

/**
 * Template for a reply
 * @param  {string} id - The id of the reply
 * @param  {string} author - The username of the reply author
 * @param  {array} repliers - An array of usernames that have commented on the post
 * @param  {bool} none - Indicates if there are replies on the post
 */
function replyTemplate(id, author, repliers, none = false) {
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
            <iframe srcdoc='${iFrameTemplate()}' name="${id}" width="220" height="35"></iframe>
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
            template += `</div>`;
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
                        fetch('/blog/upload', { method: "POST", body: formData })
                            .then(response => console.log(response.status) || response)
                            .then(response => response.text())
                            .then(body => ${success});
                    },
                });
            } else {
                formData.append("media", result, result.name);
                fetch('/blog/upload', { method: "POST", body: formData })
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
async function streamSubMenuItem(controller, image, text, route, selected, i) {
    let imageHTML = image ? `<img style="border-radius: 50%; width: var(--space-m); vertical-align: middle;" src="${image}"/>` : '';
    controller.enqueue(`<li style="border: 1px solid ${colors[i % 12]}; ${selected ? 'background-color:' + colors[i % 12] + ';' : ''}">
            <a style="${selected ? 'color:var(--base);' : ''}" href="${route}">${imageHTML} ${text}</a>
        </li>`);  
}

/**
 * Streams the pinned post submenu to the client
 * @param  {object} ctx - The request context
 * @param  {object} controller - The controller of the readable stream     
 */
async function streamPinned(ctx, controller) {
    let id = await ctx.request.url.searchParams.get('id');
    let access_token = await ctx.cookies.get('access_token');
    let pinnedCookie = await ctx.cookies.get('pinnedPosts');
    let pinned = pinnedCookie == undefined ? [] : JSON.parse(pinnedCookie);

    if(pinned.length > 0) {
        controller.enqueue(`<ul class="categories"><li style="border:none;box-shadow: none;padding: var(--space-3xs);">Pinned Posts:</li>`);  
    }
    for(var i = 0; i < pinned.length; i++) {
        let convo = await getMicroBlogConversation(pinned[i], access_token);
        let post = convo.items[convo.items.length - 1];

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
    let name = await ctx.request.url.searchParams.get('name');
    let access_token = await ctx.cookies.get('access_token');

    controller.enqueue(`<ul class="categories">`); 
    let fetching = await microBlogGet('posts/discover', access_token);
    let discover = await fetching.json();
    
    for(var i = 0; i < discover._microblog.tagmoji.length; i++) {
        let tag = discover._microblog.tagmoji[i];
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
    let access_token = await ctx.cookies.get('access_token');
    let id = await ctx.request.url.searchParams.get('id');

    controller.enqueue(`<ul class="categories">`); 

    let tags = await getMicroBlogBookmarkTags(access_token);
    
    for(var i = 0; i < tags.length; i++) {
        let tag = tags[i];
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
    let access_token = await ctx.cookies.get('access_token');
    let id = await ctx.request.url.searchParams.get('id');

    controller.enqueue(`<ul class="categories">`); 

    let bookshelves = await getMicroBlogBookshelves(access_token);
    
    for(var i = 0; i < bookshelves.items.length; i++) {
        let bookshelf = bookshelves.items[i];
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
    let id = await ctx.request.url.searchParams.get('id');
    let access_token = await ctx.cookies.get('access_token');
    const user = await getMicroBlogLoggedInUser(access_token);
    
    let contentFilterCookie = await ctx.cookies.get('contentFilter');
    let contentFilters = contentFilterCookie == undefined ? [] : JSON.parse(contentFilterCookie);

    let fetchingBookshelves = await microBlogGet('books/bookshelves', access_token);
    let bookshelves = await fetchingBookshelves.json();

    let pinnedCookie = await ctx.cookies.get('pinnedPosts');
    let pinned = pinnedCookie == undefined ? [] : JSON.parse(pinnedCookie);

    let convo = [...posts];

    if(isConvo) {
        posts = [];
        posts.push(convo[convo.length - 1]);
    }

    let tags = await getMicroBlogBookmarkTags(access_token);

    for(var i = 0; i < posts.length; i++) {  
        let post = posts[i];

        if(!filterOut(contentFilters, post.content_html))
        {
            let isFollowing = await isFollowingMicroBlogUser(post.author._microblog.username, access_token);
            
            let tagCheck = '';
            if(user.is_premium) {       
                let currentTags = post.tags != undefined ? post.tags.split(', ') : [];
                console.log(currentTags);
                tagCheck = tags.map(function (tag) { 
                        return `<label style="display:block;text-align:left;"><input type="checkbox" ${currentTags.includes(tag) ? 'checked="checked"' : ''} value="${tag}">${tag}</label>` 
                    }).join('');
            }
            
            let postActions = includeActions ? postActionTemplate(post.id, post.author._microblog.username, !pinned.includes(post.id), post._microblog, post.content_html, bookshelves.items, isFollowing, tagCheck) : '';
            controller.enqueue(postContentTemplate(post.id, post.author._microblog.username, post.author.name, post.author.avatar, post.url, post._microblog.date_relative, post.content_html, postActions, isFollowing));

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
    let access_token = await ctx.cookies.get('access_token');
    let contentFilterCookie = await ctx.cookies.get('contentFilter');
    let contentFilters = contentFilterCookie == undefined ? [] : JSON.parse(contentFilterCookie);

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
                for(var i = 0; i < comments.length; i++) {
                    controller.enqueue(commentTemplate(comments[i], uniqueRepliers, contentFilters));
                }
        controller.enqueue(replyTemplate(postid, author, uniqueRepliers, false));
        controller.enqueue(`</details>`);
    } else {
        controller.enqueue(replyTemplate(postid, author, uniqueRepliers, true));
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
    
    controller.enqueue(`<p class="center"><a href="${referer}">Next Page</a></p></section></div>`);
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
    const username = await ctx.cookies.get('username');
    let name = await ctx.request.url.searchParams.get('name');

    let pins = '';
    if(_microblog.is_you) {
        const fetching = await microBlogGet('users/pins/' + username, access_token);
        const responsePins = await fetching.json();
        pins = responsePins.map(function (pin) { return pin.is_unlocked ? `<img loading="lazy" width="30" height="30" src="${pin.icon}" alt="${pin.title}" title="${pin.title}" />` : '' }).join('');
    }

    controller.enqueue(`<div style="padding-bottom: var(--space-3xl)">
        <div class="profile blue-purple" style="color:var(--base);">
            <div>
                <p class="center"><img class="avatar" src="${author.avatar}" /></p>
                ${_microblog.is_following && !_microblog.is_you ? 
                    `<details>
                        <summary>Advanced</summary>
                        <form method="POST" action="/app/users/unfollow"><input type="hidden" name="id" value="${name}"/><button type="submit">Unfollow User</button></form>
                        <form method="POST" action="/app/users/block"><input type="hidden" name="id" value="${name}"/><button type="submit">Block User</button></form>
                        <form method="POST" action="/app/users/mute"><input type="hidden" name="id" value="${name}"/><button type="submit">Mute User</button></form>
                    </details>` : ''}
                ${!_microblog.is_following && !_microblog.is_you ? 
                    `<form method="POST">
                        <input type="hidden" name="type" value="follow-redirect"/><input type="hidden" name="id" value="${name}"/>
                        <button type="submit">Follow @${_microblog.username}</button></form>` : ''}
            </div>
            <div style="padding-left: var(--space-xs);">
                <p class="name"><b>${author.name}</b></p>
                <p class="pronouns">${_microblog.pronouns}</p>
                <p class="blurb">${_microblog.bio}</p>
                ${ _microblog.is_you && pins != '' ? '<b>My Micro.blog pins:</b><br/>' + pins : '' }
            </div>
        </div>`);
}

/**
 * Streams a profile section for a user
 * @param  {object} ctx - The request context
 * @param  {object} controller - The controller of the readable stream     
 * @param  {bool} conversations - Shows timeline conversations
 */
async function streamTimelineOrConversations(ctx, controller, conversations = false) {
    let cookies = await getCookies(ctx);
    let name = await ctx.request.url.searchParams.get('name');
    let last = await ctx.request.url.searchParams.get('last');
    controller.enqueue(beginHTMLTemplate(cookies.avatar, cookies.profileName, cookies.username, conversations ? "Conversations" : name ? name : "Timeline"));  

    if(name && (name == "news" || name == "challenges" || name == "monday"))
    {
        controller.enqueue(discoverMenuTemplate());
        await streamDiscoverTags(ctx, controller); 
    } else {
        controller.enqueue(mainMenuTemplate(true, false));
        await streamPinned(ctx, controller); 
    }  

    controller.enqueue(`<div class="posts">`);
    let result = await getMicroBlogTimeline(name, last, cookies.access_token);
    let posts = result.items;

    if (name) {
        await streamUserProfile(ctx, controller, result.author, result._microblog);
        controller.enqueue(postMenuBarTemplate(conversations ? 'conversations' : 'posts', name, false)); 
    } else {
        controller.enqueue(postMenuBarTemplate(conversations ? 'conversations' : 'posts', name));
    }
    
    if(conversations) {
        let filtered = posts.filter(p => p._microblog != undefined && p._microblog.is_mention);
        let roots = [];
        for(var i = 0; i < filtered.length; i++ ){
            const convo = await getMicroBlogConversation(filtered[i].id, cookies.access_token);
            const rootId = convo.items[convo.items.length - 1].id;
            if(!roots.includes(rootId)){
                await streamPosts(ctx, controller, convo.items, true);
                roots.push(rootId);
            }    
        }
    }
    else {
        let filtered = posts.filter(p => p._microblog != undefined && !p._microblog.is_mention);
        await streamPosts(ctx, controller, filtered);
    }

    if(!name) {
        //paging not implemented via M.B. API for the user timeline
        await streamNextPageLink(ctx, controller, posts[posts.length - 1].id);
    }
    
    controller.enqueue(`</div>${endHTMLTemplate()}`); 
    controller.close();
}

/**
 * Streams a profile section for a user
 * @param  {object} ctx - The request context
 * @param  {object} controller - The controller of the readable stream     
 * @param  {string} type - The page type
 * @param  {string} title - The title of the page
 */
async function streamManageUsersPage(ctx, controller, type, title) {
    let cookies = await getCookies(ctx);

    controller.enqueue(beginHTMLTemplate(cookies.avatar, cookies.profileName, cookies.username, title));  
    controller.enqueue(mainMenuTemplate(true, true));
    controller.enqueue(`<div class="posts">`);
    controller.enqueue(`<div class="switch-field">
        <a ${type == 'following' ? 'class="selected"' : ''} href="/app/following">Following</a>
        <a ${type == 'muting' ? 'class="selected"' : ''} href="/app/muted">Muted</a>
        <a ${type == 'blocking' ? 'class="selected"' : ''} href="/app/blocked">Blocked</a></div>`);
    let fetching = await microBlogGet(type == 'following' ? `users/following/${cookies.username}` : `users/${type}`, cookies.access_token);
    let items = await fetching.json();

    for(var i=0; i<items.length; i++){
        let item = items[i];
        if(type == 'following') {
            let fetchingPosts = await microBlogGet('posts/' + item.username, cookies.access_token);
            let posts = await fetchingPosts.json();
            controller.enqueue(postContentTemplate(item.id, item.username, item.name, item.avatar, item.url, `last post was ${posts.items[0]._microblog.date_relative}`, posts._microblog.bio, '', false));
        } else {
            controller.enqueue(postContentTemplate(item.id, item.username, item.username, undefined, undefined, undefined, undefined, '', false));
        }
        controller.enqueue(`</section></article>`);
    }
    if(items.length == 0) {
        controller.enqueue(`<p>You are not ${type} any users.</p>`);
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
    let cookies = await getCookies(ctx);
    let fetching = await microBlogGet('micropub?q=config', cookies.access_token);
    let config = await fetching.json();
    let destinations = config.destination.filter(d => d.uid != destination);

    let destinationBtns = destinations.map(function(des) { return `<a class="button" target="_top" href="${url}?destination=${encodeURIComponent(des.uid)}">${des.name}</a>&nbsp;`}).join(' ');

    if(config.destination.length > 1) {
        controller.enqueue(`
            <details>
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
    let config = await fetching.json();

    let syndicate = await microBlogGet(`micropub?q=syndicate-to`, access_token);
    let syndicates = await syndicate.json();

    let syndicateTo = '';
    for(var i = 0; i < syndicates['syndicate-to'].length; i++) {
        syndicateTo += `<label style="display:inline;"><input checked="checked" type="checkbox" name="syndicate[]" value="${syndicates['syndicate-to'][i].uid}"/>${syndicates['syndicate-to'][i].name}</label>&nbsp;`;
    }

    fetching = await microBlogGet(`micropub?q=category${destination ? '&mp-destination=' + destination : ''}`, access_token);
    let categories = await fetching.json();

    let destinationSelect = `<select style="display:none;" name="destination">`;
    for(var i = 0; i < config.destination.length; i++) {
        destinationSelect += `<option ${config.destination[i].uid == destination ? 'selected="selected"' : ''} value="${config.destination[i].uid}">${config.destination[i].uid}</option>`;
    }
    destinationSelect += '</select>';

    let categoriesList = '';
    if(categories != null ) {
        for(var j=0; j<categories.categories.length;j++)
        {
            var category = categories.categories[j];
            var checked = postCategories.length > 0 && postCategories.includes(category);
            categoriesList += `<label style="display:inline;"><input ${checked ? 'checked="checked"' : ''} type="checkbox" name="category[${category}]" value="${category}"/>${category}</label>&nbsp;`;
        }
    }

    return `
        <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/compressorjs@1.2.1/dist/compressor.min.js"></script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/easymde/dist/easymde.min.css"/>
        <script src="https://cdn.jsdelivr.net/npm/easymde/dist/easymde.min.js"></script>
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
                    spellChecker: false,
                    imageUploadFunction: async (image, onSuccess, onError) => {
                        let formData = new FormData();
                        formData.append("destination", "${destination}");  
                        ${compressImageClientFunctionTemplate(`onSuccess(body)`)}
                    },
                });
                </script>
            </div>
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
  let cookies = await getCookies(ctx);
  if(cookies.access_token) {
    ctx.response.redirect('/app/timeline');
  }
  ctx.response.body = `
    ${beginHTMLTemplate()}
    </aside>
    <div class="posts" style="padding:var(--space-3xs);">
      <h1>Basic Marketing Page</h1>
      <a class="button" href="/app/login">Login using Micro.blog</a>  
    </div>
    ${endHTMLTemplate()}
  `;
  return await next();
});

/**
 * For more info about indieAuth see: https://indieauth.spec.indieweb.org/
 * @todo Allow for custom indieauth and not just Micro.blog
 */
await router.get("/app/login", async (ctx, next) => {
  let uuid = crypto.randomUUID();
  ctx.cookies.set("state", uuid);
  ctx.response.body = `
    ${beginHTMLTemplate()}
    </aside>
    <div class="posts" style="padding:var(--space-3xs);">
      <h1>Log in using Micro.blog</h1>
      <form action="https://micro.blog/indieauth/auth" method="get">
        <label>
          Your <b>username</b>.micro.blog website or your custom domain if you have one.
          <br/><input type="url" name="me" placeholder="https://username.micro.blog" required/>
        </label>
        <input type="hidden" name="client_id" value="${appURL}"/>
        <input type="hidden" name="redirect_uri" value="${appURL}/app/auth"/>
        <input type="hidden" name="state" value="${uuid}"/>
        <input type="hidden" name="scope" value="create"/>
        <input type="hidden" name="response_type" value="code"/>
        <button type="submit" class="signIn">Sign In</button>
      </form>   
    </div>
    ${endHTMLTemplate()}
  `;
  return await next();
});

/**
 * For more info about indieAuth see: https://indieauth.spec.indieweb.org/
 * @todo Pass along errors to the login page for display
 */
await router.get("/app/auth", async (ctx, next) => {
  let code = ctx.request.url.searchParams.get('code');
  let state = ctx.request.url.searchParams.get('state');
  let cookieState = await ctx.cookies.get('state');

  if(cookieState == state) {
    var formBody = new URLSearchParams();
        formBody.append("code", code);
        formBody.append("client_id", appURL);
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
});

await router.get("/app/settings", async (ctx, next) => {
  let cookies = await getCookies(ctx);
  let contentFilterCookie = await ctx.cookies.get('contentFilter');
  let contentFilters = contentFilterCookie == undefined ? [] : JSON.parse(contentFilterCookie);
  
  ctx.response.body = `
    ${beginHTMLTemplate(cookies.avatar, cookies.profileName, cookies.username, 'Settings')}
    ${mainMenuTemplate()} 
        <div class="posts">
            <div style="margin-bottom: var(--space-m);display:block;" class="profile">
                <h3>Content Filters</h3>
                <p>A comma seperated list of terms that lillihub will use to exclude posts and comments from showing.</p>
                <form method="POST" target="excludeStatus">
                    <input type="hidden" name="type" value="filter" />
                    <div class="grow-wrap"><textarea name="exclude" onInput="growTextArea(this)">${contentFilters.join(', ')}</textarea></div>
                    <button type="submit">Save content filter list</button>
                </form>
                <iframe srcdoc='${iFrameTemplate()}' name="excludeStatus" width="220" height="35"></iframe> 
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
    
    ctx.response.headers = {"content-type": "text/html", "x-content-type-options": "nosniff" };
    return await next();
});

await router.get("/app/conversations", async (ctx, next) => {
    let cookies = await getCookies(ctx);
    let name = await ctx.request.url.searchParams.get('name');
    let last = await ctx.request.url.searchParams.get('last');

    ctx.response.body = new ReadableStream({
        async start(controller) {
            await streamTimelineOrConversations(ctx, controller, true);
        }
    });
});

await router.get("/app/mentions", async (ctx, next) => {
    let cookies = await getCookies(ctx);
    let last = await ctx.request.url.searchParams.get('last');

    ctx.response.body = new ReadableStream({
        async start(controller) {
            controller.enqueue(beginHTMLTemplate(cookies.avatar, cookies.profileName, cookies.username, "Mentions"));  
            controller.enqueue(mainMenuTemplate(true, false));
            await streamPinned(ctx, controller); 
            controller.enqueue(`<div class="posts">`);
            
            let fetching = await microBlogGet(last ? `posts/mentions?before_id=${last}` : 'posts/mentions', cookies.access_token);
            let results = await fetching.json();
            let posts = results.items;
            controller.enqueue(postMenuBarTemplate('mentions', null));  

            let roots = [];
            for(var i = 0; i < posts.length; i++ ){
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
    let cookies = await getCookies(ctx);

    ctx.response.body = new ReadableStream({
        async start(controller) {
            controller.enqueue(beginHTMLTemplate(cookies.avatar, cookies.profileName, cookies.username, "Discover"));  
            controller.enqueue(discoverMenuTemplate());
            await streamDiscoverTags(ctx, controller);
            controller.enqueue(`<div class="posts">`);
            let posts = (await getMicroBlogDiscover(null, cookies.access_token)).items; 
            await streamPosts(ctx, controller, posts);
            
            controller.enqueue(`</div>${endHTMLTemplate()}`); 
            controller.close();
        }
    });
    
    ctx.response.headers = {"content-type": "text/html", "x-content-type-options": "nosniff" };
    return await next();
});

await router.get("/app/tag", async (ctx, next) => {
    let cookies = await getCookies(ctx);
    let tag = await ctx.request.url.searchParams.get('name');

    ctx.response.body = new ReadableStream({
        async start(controller) {
            controller.enqueue(beginHTMLTemplate(cookies.avatar, cookies.profileName, cookies.username, "Discover"));  
            controller.enqueue(discoverMenuTemplate());
            await streamDiscoverTags(ctx, controller);
            controller.enqueue(`<div class="posts">`);
            let posts = (await getMicroBlogDiscover(tag, cookies.access_token)).items; 
            await streamPosts(ctx, controller, posts);
            
            controller.enqueue(`</div>${endHTMLTemplate()}`); 
            controller.close();
        }
    });
    
    ctx.response.headers = {"content-type": "text/html", "x-content-type-options": "nosniff" };
    return await next();
});

await router.get("/app/post", async (ctx, next) => {
    let id = await ctx.request.url.searchParams.get('id');
    let cookies = await getCookies(ctx);

    ctx.response.body = new ReadableStream({
        async start(controller) {
            controller.enqueue(beginHTMLTemplate(cookies.avatar, cookies.profileName, cookies.username, `Post: ${id}`));  
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
    //ctx?.params?.id
    ctx.response.body = new ReadableStream({
        async start(controller) {
            await streamManageUsersPage(ctx, controller, "following", "Following"); 
        }
    });
    
    ctx.response.headers = {"content-type": "text/html", "x-content-type-options": "nosniff" };
    return await next();
});

await router.get("/app/muted", async (ctx, next) => {
    ctx.response.body = new ReadableStream({
        async start(controller) {
            await streamManageUsersPage(ctx, controller, "muting", "Muted"); 
        }
    });
    
    ctx.response.headers = {"content-type": "text/html", "x-content-type-options": "nosniff" };
    return await next();
});

await router.get("/app/blocked", async (ctx, next) => {
    ctx.response.body = new ReadableStream({
        async start(controller) {
            await streamManageUsersPage(ctx, controller, "blocking", "Blocked"); 
        }
    });
    
    ctx.response.headers = {"content-type": "text/html", "x-content-type-options": "nosniff" };
    return await next();
});

await router.get("/app/bookmarks", async (ctx, next) => {
    let cookies = await getCookies(ctx);
    let id = await ctx.request.url.searchParams.get('id');

    ctx.response.body = new ReadableStream({
        async start(controller) {
            controller.enqueue(beginHTMLTemplate(cookies.avatar, cookies.profileName, cookies.username, id ? id : 'Bookmarks'));  
            const user = await getMicroBlogLoggedInUser(cookies.access_token);
            
            controller.enqueue(mainMenuTemplate(true, !user.is_premium));
            if(user.is_premium) {      
                await streamBookmarkTags(ctx, controller); 
            }

            controller.enqueue(`<div class="posts">`);
            controller.enqueue(`<div style="margin-bottom: var(--space-m);display:block;" class="profile">
                                    <form method="POST" action="/app/bookmarks/new">
                                        <label>Add Bookmark:<br/><br/><input type="url" name="url" /></label>
                                        <button type="submit">Add Bookmark</button>
                                    <form></div>`);

            let fetching = await microBlogGet(id ? `posts/bookmarks?tag=${id}` : 'posts/bookmarks', cookies.access_token);
            let bookmarks = await fetching.json();

            await streamPosts(ctx, controller, bookmarks.items, false, false, true, false);

            controller.enqueue(`</div>${endHTMLTemplate()}`); 
            controller.close();
        }
    });

    ctx.response.headers = {"content-type": "text/html", "x-content-type-options": "nosniff" };
    return await next();
});

await router.get("/app/bookshelves", async (ctx, next) => {
    let cookies = await getCookies(ctx);
    let id = await ctx.request.url.searchParams.get('id');

    ctx.response.body = new ReadableStream({
        async start(controller) {
            controller.enqueue(beginHTMLTemplate(cookies.avatar, cookies.profileName, cookies.username, 'Bookshelves'));  
            const user = await getMicroBlogLoggedInUser(cookies.access_token);
            
            controller.enqueue(mainMenuTemplate(true, false));
            await streamBookshelfLinks(ctx, controller);

            if(!id) {
                // Show the goals and recent book posts when a bookshelf is not selected.
                controller.enqueue(`<div class="posts">`);
                controller.enqueue(`<div style="color:var(--base);margin-bottom: var(--space-m);display:block;" class="profile purple-red">
                                        <details><summary>Add new bookshelf</summary>
                                        <form method="POST" action="/app/bookshelves/addBookshelf">
                                            <label>Bookshelf Name:<br/><br/><input type="text" name="name"/></label>
                                            <button type="submit">Add Bookshelf</button>
                                        <form>
                                        </details>`);
                
                let fetchingGoals = await microBlogGet('books/goals', cookies.access_token);
                let goals = await fetchingGoals.json();

                console.log(fetchingGoals, goals);

                controller.enqueue(`<p><b>Yearly reading goals:</b></p>`);
                controller.enqueue(goals.items.map(function (goal) { return `<p style="font-weight: 300;">${goal.title.replace("Reading ","")}: ${goal.content_text}</p>`}).join(' '))
                controller.enqueue(`</div>`);

                controller.enqueue(`<p class="screen-width">What other <b>micro.bloggers</b> are reading:</p>`);
                let posts = (await getMicroBlogDiscover('books', cookies.access_token)).items; 
                await streamPosts(ctx, controller, posts);
            } else {
                // Show the view for a selected bookshelf
                controller.enqueue(`<div class="posts">`);
                let bookshelves = await getMicroBlogBookshelves(cookies.access_token);
                let bookshelfOptions = bookshelves.items.map(function (bookshelf) { return `<option value="${bookshelf.id}">Move to "${bookshelf.title}"</option>`}).join(' ');
            
                let fetchingBooks = await microBlogGet(`books/bookshelves/${id}`, cookies.access_token);
                let books = await fetchingBooks.json();
                controller.enqueue(`<div class="switch-field">
                    <a class="selected" href="${'/app/bookshelves?id=' + id}">${books.title.replace("Micro.blog - ", '')}</a>
                    <a target="_blank" href="https://micro.blog/account/bookshelves/${id}?edit=1">Micro.blog ${externalLinkSVG()}</a>
                </div>`);

                if(books.items.length == 0) {
                    controller.enqueue(`<p style="margin:var(--space-s-m);">No books here yet.</p>`);
                }
                for(var i=0; i<books.items.length; i++) {
                    var book = books.items[i];
                    let newPost = `${books.title.replace("Micro.blog - ", '')}: [${book.title}](${book.url}) by ${book.authors.map(u => u.name).join(', ')} 📚`;
                    let actions = postActionTemplate(book.id, null, false, {}, '', bookshelves.items, false, '', false, newPost);
                    controller.enqueue(`
                        <article class="post" data-id="${book.id}" style="display:block;">
                            <section style="display:flex; flex-direction: column;">
                                <header style="display:flex; flex-direction: row;">
                                    <div><img style="width: 128px" loading="lazy" src="${book.image}"></div>
                                    <div style="margin-left:var(--space-xs);">
                                        ${actions}
                                        <p><b><a href="${book.url}">${book.title}</a></b></p>
                                        <p>By: ${book.authors.map(u => u.name).join(', ')}</p>
                                    </div>                   
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
    let cookies = await getCookies(ctx);
    let destination = await ctx.request.url.searchParams.get('destination');
    let status = await ctx.request.url.searchParams.get('status');

    ctx.response.body = new ReadableStream({
        async start(controller) {
            controller.enqueue(beginHTMLTemplate(cookies.avatar, cookies.profileName, cookies.username, 'My Blog'));  
            const user = await getMicroBlogLoggedInUser(cookies.access_token);
            
            controller.enqueue(mainMenuTemplate(true));
            controller.enqueue(`<div class="posts">`);

            let account = await getMicroBlogDestination(destination, cookies.access_token);
            await streamAccountSwitch(ctx, controller, account ? account.uid : '', '/app/blog/posts');
            
            controller.enqueue(`<div class="switch-field">
                    <a ${status ? '' : 'class="selected"'} href="/app/blog/posts${destination ? '?destination=' + encodeURIComponent(account.uid) : ''}">Recent 25 Posts</a>
                    <a ${status ? 'class="selected"' : ''} href="/app/blog/posts?status=draft${destination ? '&destination=' + encodeURIComponent(account.uid) : ''}">Drafts</a>
                </div>`);

            let fetching = await microBlogGet(`micropub?q=source${account ? '&mp-destination=' + account.uid : ''}`, cookies.access_token);
            let posts = await fetching.json();
            
            let postStatus = status ? "draft" : "published";
            posts.items = posts.items.filter(p => p.properties["post-status"][0] == postStatus);
            
            for(var i= 0; i < posts.items.length && i < 25; i++) {
                let post = posts.items[i].properties;
                console.log(post);
                
                let postActions = `<div class="actions">
                    <details style="border-radius: var(--space-3xs);color: var(--subtext-1);border: 1px solid var(--mantle);position: absolute;z-index: 5;background-color: var(--mantle);margin-left: -92px;">
                        <summary style="padding: var(--space-2xs); font-size: var(--step--1); margin: 0;">Actions</summary>
                        <div style="padding: var(--space-2xs); width: 200px; margin-left: -129px; background-color: var(--mantle);">
                            <a target="_top" href="/app/blog/post?id=${encodeURIComponent(post.url[0])}&destination=${encodeURIComponent(account.uid)}">Edit post</a>
                            <form method="POST" action="/blog/post/delete">
                                <input type="hidden" name="destination" value="${account ? account.uid : ''}" />
                                <input type="hidden" name="url" value="${post.url[0]}" />
                                <details style="text-align: center;">
                                    <summary>Delete</summary>
                                    <button style="margin-left:var(--space-3xs);display:inline;width:inherit;" type="submit">Confirm Delete</button>
                                </details>
                            </form>
                        </div>
                    </details>
                </div>`;
                controller.enqueue(postContentTemplate(post.uid, cookies.username, cookies.name, cookies.avatar, post.url[0], post.published[0], marky(post.content[0]), postActions, false));
                controller.enqueue(`<p style="color:var(--subtext-1)"><small>${post.category.length > 0 ? post.category.join(', ') : 'No categories assigned.'}</small></p>`); 
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
    let cookies = await getCookies(ctx);
    let destination = await ctx.request.url.searchParams.get('destination');

    ctx.response.body = new ReadableStream({
        async start(controller) {
            let account = await getMicroBlogDestination(destination, cookies.access_token);

            controller.enqueue(beginHTMLTemplate(cookies.avatar, cookies.profileName, cookies.username, 'My Media'));  
            controller.enqueue(`<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/compressorjs@1.2.1/dist/compressor.min.js"></script>`);    
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
                <form id="uploadForm" action="/blog/upload" method="POST" enctype="multipart/form-data">
                    <p>Upload an image file. Files over 3 MB will be compressed.</p>
                    <input id="media" name="media" type="file" accept="image/*" onchange="handleImageUpload(event);" style="width:220px" />
                    <input type="hidden" name="destination" value="${account ? account.uid : ''}"/>
                    <button id="submitBtn" type="submit">Upload</button>
                    <span style="display:none;animation: spin 2s linear infinite;" id="progress">🐢</span>
                </form>
                <script>
                    document.getElementById('submitBtn').style.display = 'none';
                </script>
                </div>`);

            let media = await getMicroBlogMedia(account, cookies.access_token);
            controller.enqueue(`<section class="posts" id="photos">`);
            
            controller.enqueue(media.items.map(i => `<div>
                ${i.poster ? `<video controls="controls" playsinline="playsinline" src="${i.url}" preload="none"></video>` : `<img src="${i.url}"/>`}
                <div class="switch-field">
                    <a class="clear" href="/app/blog/post?content=${encodeURIComponent('![]('+i.url+')')}${account ? '&destination=' + account.uid : ''}">Create Post</a>
                    <form method="POST" action="/blog/media/delete">
                        <input type="hidden" name="destination" value="${account ? account.uid : ''}" />
                        <input type="hidden" name="url" value="${i.url}" />
                        <details style="text-align: center;">
                            <summary style="cursor:pointer;display:inline;">▶ Delete</summary>
                            <button style="margin-left:var(--space-3xs);display:inline;width:inherit;" type="submit">Confirm Delete</button>
                        </details>
                    </form>
                </div></div>`).join(''));

            controller.enqueue(`</div>${endHTMLTemplate()}`); 
            controller.close();
        }
    });

    ctx.response.headers = {"content-type": "text/html", "x-content-type-options": "nosniff" };
    return await next();
});

await router.get("/app/blog/post", async (ctx, next) => {
    let cookies = await getCookies(ctx);
    let id = await ctx.request.url.searchParams.get('id');
    let destination = await ctx.request.url.searchParams.get('destination');
    let content = await ctx.request.url.searchParams.get('content');

    ctx.response.body = new ReadableStream({
        async start(controller) {
            let account = await getMicroBlogDestination(destination, cookies.access_token);

            controller.enqueue(beginHTMLTemplate(cookies.avatar, cookies.profileName, cookies.username, id ? 'Edit Post' : 'Create Post'));              
            controller.enqueue(mainMenuTemplate(true));
            controller.enqueue(`<div class="posts">`);
            
            await streamAccountSwitch(ctx, controller, account ? account.uid : '', '/app/blog/post');
            
            controller.enqueue(`<div class="profile profile-dark"><div style="margin-top:var(--space-s-m)" class="form">`);
            
            // Check if we are editing a post or not.
            if(id) {
                let fetching = await microBlogGet(`micropub?q=source&properties=content&url=${id}${destination ? '&mp-destination=' + destination : ''}`, cookies.access_token);
                let post = await fetching.json();

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
    let cookies = await getCookies(ctx);
    let id = await ctx.request.url.searchParams.get('id');

    ctx.response.body = new ReadableStream({
        async start(controller) {
            controller.enqueue(beginHTMLTemplate(cookies.avatar, cookies.profileName, cookies.username, 'Replies'));  
            controller.enqueue(mainMenuTemplate(true));

            controller.enqueue(`<div class="posts">`);
            controller.enqueue(`<p class="center"><a class="button" href="https://micro.blog/account/replies">Manage replies on Micro.blog ${externalLinkSVG()}</a></p>`);

            let fetching = await microBlogGet('posts/replies?count=100', cookies.access_token);
            let replies = await fetching.json();

            await streamPosts(ctx, controller, replies.items, false, false, false, false);

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
    const body = ctx.request.body({ type: 'form' })
    const exclude = (await body.value).get('exclude');

    var result = exclude.split(',').map(function (value) {
        return value.toLowerCase().trim();
    });
        
    ctx.cookies.set("contentFilter", JSON.stringify(result), { expires: new Date(Date.now() + 315600000000)}); // 10 years
    ctx.response.body = iFrameTemplate('<small class="success">Saved filters.</small>'); 
    return await next();
});

await router.post("/app/users/follow", async (ctx) => {
    let access_token = await ctx.cookies.get('access_token');
    const body = ctx.request.body({ type: 'form' });
    const value = await body.value;
    const username = value.get('username');

    let fetching = await microBlogSimplePost(`users/follow?username=${username}`, access_token);
    let response = await fetching.json();

    ctx.response.body = iFrameTemplate(`<form action="/app/users/unfollow" method="POST">
        <input type="hidden" name="username" value="${username}" />
        <button type="submit">Unfollow</button>
    </form>`); 
});

await router.post("/app/users/unfollow", async (ctx) => {
    let access_token = await ctx.cookies.get('access_token');
    const body = ctx.request.body({ type: 'form' });
    const value = await body.value;
    const username = value.get('username');
    let fetching = await microBlogSimplePost(`users/unfollow?username=${username}`, access_token);
    let response = await fetching.json();

    ctx.response.body = iFrameTemplate(`<form action="/app/users/follow" method="POST">
        <input type="hidden" name="username" value="${username}" />
        <button type="submit">follow</button>
    </form>`); 
});

await router.post("/app/users/block", async (ctx) => {
    let access_token = await ctx.cookies.get('access_token');
    const body = ctx.request.body({ type: 'form' });
    const value = await body.value;
    const username = value.get('username');
    let fetching = await microBlogSimplePost(`users/block?username=${username}`, access_token);
    let response = await fetching.json();

    ctx.response.redirect("/app/timeline?name=" + username);
});

await router.post("/app/users/mute", async (ctx) => {
    let access_token = await ctx.cookies.get('access_token');
    const body = ctx.request.body({ type: 'form' });
    const value = await body.value;
    const username = value.get('username');
    let fetching = await microBlogSimplePost(`users/mute?username=${username}`, access_token);
    let response = await fetching.json();

    ctx.response.redirect("/app/timeline?name=" + username);
});

await router.post("/app/users/unblock", async (ctx) => {
    let access_token = await ctx.cookies.get('access_token');
    const body = ctx.request.body({ type: 'form' });
    const value = await body.value;
    const username = value.get('username');

    let fetching = await microBlogSimpleDelete(`users/block?username=${username}`, access_token);
    let response = await fetching.json();

    ctx.response.redirect("/app/timeline?name=" + username);
});

await router.post("/app/users/unmute", async (ctx) => {
    let access_token = await ctx.cookies.get('access_token');
    const body = ctx.request.body({ type: 'form' });
    const value = await body.value;
    const username = value.get('username');

    let fetching = await microBlogSimpleDelete(`users/mute?username=${username}`, access_token);
    let response = await fetching.json();

    ctx.response.redirect("/app/timeline?name=" + username);
});

await router.post("/app/pinPost", async (ctx) => {
    let access_token = await ctx.cookies.get('access_token');
    const body = ctx.request.body({ type: 'form' });
    const value = await body.value;
    const id = value.get('id');
    
    let currentPins = await ctx.cookies.get('pinnedPosts');
    currentPins = currentPins == undefined ? [] : JSON.parse(currentPins);
    currentPins.push(value.get('id'));
    ctx.cookies.set("pinnedPosts", JSON.stringify(currentPins), { expires: new Date(Date.now() + 315600000000)}); // 10 years

    ctx.response.body = iFrameTemplate(`<form action="/app/unpinPost" method="POST">
        <input type="hidden" name="id" value="${id}" />
        <button type="submit">Unpin Post</button>
    </form>`); 
});

await router.post("/app/unpinPost", async (ctx) => {
    let access_token = await ctx.cookies.get('access_token');
    const body = ctx.request.body({ type: 'form' });
    const value = await body.value;
    const id = value.get('id');

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
    </form>`); 
});

await router.post("/app/bookmarks/bookmark", async (ctx) => {
    let access_token = await ctx.cookies.get('access_token');
    const body = ctx.request.body({ type: 'form' });
    const value = await body.value;
    const id = value.get('id');

    let fetching = await microBlogSimplePost(`posts/bookmarks?id=${id}`, access_token);
    let response = await fetching.json();

    ctx.response.body = iFrameTemplate(`<form action="/app/bookmarks/unbookmark" method="POST">
        <input type="hidden" name="id" value="${id}" />
        <button type="submit">Unbookmark</button>
    </form>`); 
});

await router.post("/app/bookmarks/unbookmark", async (ctx) => {
    let access_token = await ctx.cookies.get('access_token');
    const body = ctx.request.body({ type: 'form' });
    const value = await body.value;
    const id = value.get('id');

    let fetching = await microBlogSimpleDelete(`posts/bookmarks/${id}`, access_token);
    let response = await fetching.json();

    console.log(response);

    ctx.response.body = iFrameTemplate(`<form action="/app/bookmarks/bookmark" method="POST">
        <input type="hidden" name="id" value="${id}" />
        <button type="submit">Bookmark</button>
    </form>`); 
});

await router.post("/app/bookmarks/new", async (ctx) => {
    let access_token = await ctx.cookies.get('access_token');
    const body = ctx.request.body({ type: 'form' });
    const value = await body.value;
    const url = value.get('url');

    var formBody = new URLSearchParams();
    formBody.append("h", "entry");
    formBody.append("bookmark-of", url);

    let postingContent = await microBlogPostForm('micropub', formBody, access_token);
    let results = await postingContent;
    ctx.response.redirect('/app/bookmarks');
});

await router.post("/app/bookmarks/manageTags", async (ctx) => {
    let access_token = await ctx.cookies.get('access_token');
    const body = ctx.request.body({ type: 'form' });
    const value = await body.value;
    const tags = value.getAll('tags[]') ? value.getAll('tags[]') : [];
    const newTag = value.get('newTag');
    const selectedTag = value.get('selectedTag');

    if(newTag) {
        tags.push(newTag);
    }

    var formBody = new URLSearchParams();
        formBody.append("tags", tags.join(','));
    
    const fetching = await microBlogPostForm(`posts/bookmarks/${id}`, formBody, access_token);
    const response = await fetching.json();

    let returnURL = selectedTag ? '/app/bookmarks?id=' + selectedTag : '/app/bookmarks';
    ctx.response.redirect(returnURL);
});

await router.post("/app/replies/add", async (ctx) => {
    let access_token = await ctx.cookies.get('access_token');
    const body = ctx.request.body({ type: 'form' });
    const value = await body.value;
    const id = value.get('id');
    const replyingTo = value.getAll('replyingTo[]');
    let content = value.get('content');

    if(content == null || content == undefined || content == '' || content == 'null' || content == 'undefined') {

    }
    else
    {
        let replies = replyingTo.map(function (reply, i) { return '@' + reply }).join(' ');
        content = replies + ' ' + content;

        const fetching = await microBlogSimplePost(`posts/reply?id=${id}&content=${encodeURIComponent(content)}`, access_token);
        const response = await fetching.json();

        ctx.response.body = iFrameTemplate('<small class="success">Reply sent.</small>');
    }
});

await router.post("/app/bookshelves/removeBook", async (ctx) => {
    let access_token = await ctx.cookies.get('access_token');
    const body = ctx.request.body({ type: 'form' });
    const value = await body.value;
    const bookId = value.get('bookId');
    const bookshelfId = value.get('bookshelfId');

    let fetching = await microBlogSimpleDelete(`books/bookshelves/${bookshelfId}/remove/${bookId}`, access_token);
    let response = await fetching.json();

    ctx.response.redirect("/app/bookshelves?id=" + bookshelfId);
});

await router.post("/app/bookshelves/moveBook", async (ctx) => {
    let access_token = await ctx.cookies.get('access_token');
    const body = ctx.request.body({ type: 'form' });
    const value = await body.value;
    const bookId = value.get('bookId');
    const bookshelfId = value.get('bookshelfId');

    let fetching = await microBlogSimplePost(`books/bookshelves/${bookshelfId}/assign?book_id=${bookId}`, access_token);
    let response = await fetching.json();

    ctx.response.redirect("/app/bookshelves?id=" + bookshelfId);
});

await router.post("/app/bookshelves/addBook", async (ctx) => {
    let access_token = await ctx.cookies.get('access_token');
    const body = ctx.request.body({ type: 'form' });
    const value = await body.value;
    const bookshelfId = value.get('bookshelfId');
    const bookISBN = value.get('bookISBN');
    const bookTitle = value.get('bookTitle');
    const bookAuthor = value.get('bookAuthor');

    let fetching = await microBlogSimplePost(`books?bookshelf_id=${bookshelfId}&isbn=${bookISBN}&title=${bookTitle}&author=${bookAuthor}`, access_token);
    let response = await fetching.json();

    ctx.response.redirect("/app/bookshelves?id=" + bookshelfId);
});
    
await router.post("/app/bookshelves/addBookshelf", async (ctx) => {
    let access_token = await ctx.cookies.get('access_token');
    const body = ctx.request.body({ type: 'form' });
    const value = await body.value;
    const name = value.get('name');

    let fetching = await microBlogSimplePost(`books/bookshelves?name=${name}`, access_token);
    let response = await fetching.json();

    ctx.response.redirect("/app/bookshelves");
});
    


// STILL NEEDS FIXING !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
await router.post("/blog/upload", async (ctx) => {
    let cookies = await getCookies(ctx);
    const body = ctx.request.body({ type: 'form-data' });
    const data = await body.value.read({ maxSize: Number.MAX_SAFE_INTEGER });

    const file = data.files != undefined? data.files[0] : undefined;
    let fileURL = '';

    if(file) {
        let fetchingMediaEndpoint = await microBlogGet('micropub?q=config', cookies.access_token);
        let endpointFetched = await fetchingMediaEndpoint.json();
        let mediaEndpoint = endpointFetched["media-endpoint"];

        let formData = new FormData();
        let fileBlob = new Blob([new Uint8Array(file.content).buffer], { 'type': file.contentType });  
        formData.append('file', fileBlob, file.originalName);
        if(data.fields.destination) {
            formData.append("mp-destination", data.fields.destination);
        }
        let uploadMethod = {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + cookies.access_token
            },
            body: formData
        };

        let fetchingFileUpload = await fetch(mediaEndpoint, uploadMethod);
        let fileFetched = await fetchingFileUpload.json();

        fileURL = fileFetched.url;
        ctx.response.body = fileURL;
    }
});

await router.post("/blog/delete", async (ctx) => {
    let cookies = await getCookies(ctx);
    const body = ctx.request.body({ type: 'form' })
    const value = await body.value
    const url = value.get('url');
    const destination = value.get('destination');

    let formData = new URLSearchParams();
    formData.append('action', 'delete');
    formData.append('url', url);
    if(destination) {
        formData.append("mp-destination", destination);
    }
    
    let fetchingDelete = await microBlogPostForm('micropub', formBody, cookies.access_token);
    let result = await fetchingDelete;
    ctx.response.redirect("/app/blog/posts?destination=" + destination);
});

await router.post("/blog/media/delete", async (ctx) => {
    let cookies = await getCookies(ctx);
    const body = ctx.request.body({ type: 'form' })
    const value = await body.value
    const url = value.get('url');
    const destination = value.get('destination');

    let formData = new URLSearchParams();
    formData.append('action', 'delete');
    formData.append('url', url);
    if(destination) {
        formData.append("mp-destination", destination);
    }
    
    let fetchingMediaEndpoint = await microBlogGet('micropub?q=config', cookies.access_token);
    let endpointFetched = await fetchingMediaEndpoint.json();
    let mediaEndpoint = endpointFetched["media-endpoint"];

    let fetchingDelete = await basicPostForm(mediaEndpoint, formBody, cookies.access_token);
    let result = await fetchingDelete;
    ctx.response.redirect("/app/blog/media?destination=" + destination);
});
await router.post("/app/blog/post", async (ctx) => {
    let cookies = await getCookies(ctx);
    const body = ctx.request.body({ type: 'form-data' });
    const data = await body.value.read({ maxSize: Number.MAX_SAFE_INTEGER }); 

    let categories = [];
    let syndicate = [];
    for (let [key, value] of Object.entries(data.fields)) {
        if(key.includes('category[')) {
            categories.push(value);
        } 
        if(key.includes('syndicate[')) {
            syndicate.push(value);
        }
    }
    var formBody = new URLSearchParams();
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
            for(var i=0; i<categories.length; i++){
                formBody.append("category[]", categories[i]);
            }
        }
        if(syndicate.length > 0) {
            for(var i=0; i<syndicate.length; i++){
                formBody.append("mp-syndicate-to[]", syndicate[i]);
            }
        }

        let postingContent = await microBlogPostForm('micropub', formBody, cookies.access_token);
        let results = await postingContent;
    } else {
        let content = {
                action: "update",
                url: data.fields.url,
                replace: {
                    content: [data.fields.content],
                    name: [data.fields.title],
                    category: categories
                }
            };
        if(data.fields.destination) {
            content["mp-destination"] = data.fields.destination
        }

        let postingContent = await fetch("https://micro.blog/micropub", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + cookies.access_token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(content)
        });

        let results = await postingContent;
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
    var formBody = new URLSearchParams();
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
    let fetching = await microBlogGet(`posts/conversation?id=${id}`, access_token);
    const results = await fetching.json();
    return results;
}

/**
 * Gets a micro.blog timeline
 * @param  {string} name  The name of the user, if undefined, get's the logged in users timeline.
 * @param  {string} before_id  The id of the post to start at for paging
 * @param  {string} access_token  An access token
 * @return {object}      The json object returned from the micro.blog api
 */
async function getMicroBlogTimeline(name, before_id, access_token) {
    let fetchURL = name ? `posts/${name}?count=${mbItemCount}` : `posts/timeline?count=${mbItemCount}`;
    let fetching = await microBlogGet(before_id ? `${fetchURL}&before_id=${before_id}` : fetchURL, access_token);
    return await fetching.json();
}

/**
 * Gets a micro.blog discover feed
 * @param  {string} tag  The tag to filter the discover feed by
 * @param  {string} access_token  An access token
 * @return {object}      The json object returned from the micro.blog api
 */
async function getMicroBlogDiscover(tag, access_token) {
    let fetchURL = tag ? `posts/discover/${tag}` : `posts/discover`;
    let fetching = await microBlogGet(fetchURL, access_token);
    return await fetching.json();
}

/**
 * Checks to see if the logged in user is following a micro.blog user.
 * @param  {string} username        The username of the user to see if the logged in user is following
 * @param  {string} access_token    An access token
 * @return {bool}                   If the user is followed or not
 */
async function isFollowingMicroBlogUser(username, access_token) {
    let fetching = await microBlogGet(`users/is_following?username=${username}`, access_token);
    let result = await fetching.json();
    return result.is_following && !result.is_you;
}

/**
 * Get the sorted list of bookmark tags from micro.blog
 * @param  {string} access_token    An access token
 * @return {object}      The json object returned from the micro.blog api, sorted.
 */
async function getMicroBlogBookmarkTags(access_token) {
    let fetching = await microBlogGet('posts/bookmarks/tags', access_token);
    let tags = await fetching.json();
    tags.sort();
    return tags;
}

/**
 * Get the sorted list of bookmark tags from micro.blog
 * @param  {string} access_token    An access token
 * @return {object}      The json object returned from the micro.blog api
 */
async function getMicroBlogBookshelves(access_token) {
    let fetching = await microBlogGet('books/bookshelves', access_token);
    let bookshelves = await fetching.json();
    return bookshelves;
}

/**
 * Get the media for a blog
 * @param  {object} account        The micro.blog account to request media from
 * @param  {string} access_token   An access token
 * @return {object}                An object containing the uid and the name of the account or null if none exists. 
 */
async function getMicroBlogMedia(account, access_token) {
    let fetching = await microBlogGet('micropub?q=config', access_token);
    let config = await fetching.json();

    let fetchingMedia = await basicGet(config["media-endpoint"] + `?q=source${account ? `&mp-destination=${account.uid}` : ''}`, access_token);
    return await fetchingMedia.json();
}

/**
 * Get the default (or selected) micro.blog destination of the user (for those with multiple blogs associated with an account)
 * @param  {string} destination    The requested destination by the user
 * @param  {string} access_token   An access token
 * @return {object}                The json object returned from the micro.blog api 
 */
async function getMicroBlogDestination(destination, access_token) {
    let fetching = await microBlogGet('micropub?q=config', access_token);
    let config = await fetching.json();
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
    let fetchMethod = {
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
    return await basicPostForm(`https://micro.blog/${endpoint}`, formBody, access_token);
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
        let words = content_html != undefined ? content_html.toLowerCase().split(' ') : [];
        return contentFilters.some(filter => filter.trim() != '' && words.includes(filter));
    }
    return false;
}

// --------------------------------------------------------------------------------------
// Resources
// --------------------------------------------------------------------------------------
function getCommonJS() {
    let script = `
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
    let style = `:root {
                --step--2: clamp(0.80rem, calc(0.83rem + -0.04vw), 0.82rem);
                --step--1: clamp(0.99rem, calc(0.99rem + 0.02vw), 1.00rem);
                --step-0: clamp(1.19rem, calc(1.17rem + 0.11vw), 1.25rem);
                --space-3xs: clamp(0.31rem, calc(0.31rem + 0.00vw), 0.31rem);
                --space-2xs: clamp(0.63rem, calc(0.63rem + 0.00vw), 0.63rem);
                --space-xs: clamp(0.88rem, calc(0.85rem + 0.11vw), 0.94rem);
                --space-s: clamp(1.19rem, calc(1.17rem + 0.11vw), 1.25rem);
                --space-m: clamp(1.81rem, calc(1.79rem + 0.11vw), 1.88rem);
                --space-l: clamp(2.38rem, calc(2.33rem + 0.22vw), 2.50rem);
                --space-xl: clamp(3.56rem, calc(3.50rem + 0.33vw), 3.75rem);
                --space-2xl: clamp(4.75rem, calc(4.66rem + 0.43vw), 5.00rem);
                --space-3xl: clamp(7.13rem, calc(6.99rem + 0.65vw), 7.50rem);
                --space-3xs-2xs: clamp(0.31rem, calc(0.20rem + 0.54vw), 0.63rem);
                --space-2xs-xs: clamp(0.63rem, calc(0.52rem + 0.54vw), 0.94rem);
                --space-xs-s: clamp(0.88rem, calc(0.74rem + 0.65vw), 1.25rem);
                --space-s-m: clamp(1.19rem, calc(0.95rem + 1.20vw), 1.88rem);
                --space-m-l: clamp(1.81rem, calc(1.57rem + 1.20vw), 2.50rem);
                --space-l-xl: clamp(2.38rem, calc(1.90rem + 2.39vw), 3.75rem);
                --grid-max-width: 1000px;
                --grid-gutter: var(--space-s-l, clamp(1.13rem, calc(0.65rem + 2.39vw), 2.50rem));
                --white: #ffffff;
                --text: #4c4f69;
                --subtext-1: #5c5f77;
                --overlay-2: #7c7f93;
                --overlay-1: #8c8fa1;
                --base: #eff1f5;
                --mantle: #e6e9ef;
                --crust: #dce0e8;            
                --red: #de324c;
                --redorange: #E95E56;
                --orange: #f4895f;
                --orangeyellow: #F6B567;
                --yellow: #f8e16f;
                --yellowgreen: #C7D881;
                --green: #95cf92;
                --greenblue: #66B5AF;
                --blue: #369acc;
                --bluepurple: #6678B7;
                --purple: #9656a2;
                --purplered: #BA4477;
            }
            @media (prefers-color-scheme: dark) {
                :root {
                    color-scheme: dark;
                    --text: #c6d0f5;
                    --subtext-1: #b5bfe2;
                    --overlay-2: #949cbb;
                    --overlay-1: #838ba7;
                    --base: #303446;
                    --mantle: #292c3c;
                    --crust: #232634;
                    --red: #e78284;
                    --redorange: #EB917D;
                    --orange: #ef9f76;
                    --orangeyellow: #EAB483;
                    --yellow: #e5c890;
                    --yellowgreen: #C6CD8D;
                    --green: #a6d189;
                    --greenblue: #99BEBC;
                    --blue: #8caaee;
                    --bluepurple: #A3B3F0;
                    --purple: #babbf1;
                    --purplered: #D19FBB;
                }
            }
            * 
            {
                box-sizing: inherit;
            }
            html 
            {
                min-height:100%;
                box-sizing: border-box;
                background: linear-gradient(to bottom,#FFFFFF, #eff1f5); 
                @media (prefers-color-scheme: dark) {
                    background: linear-gradient(to bottom, #303446, #292c3c); 
                } 
            }
            body {
                height:100%;
                font-family: Seravek, 'Gill Sans Nova', Ubuntu, Calibri, 'DejaVu Sans', source-sans-pro, sans-serif;
                font-size: var(--step-0);
                font-weight: 300;
                padding: 0;
                margin: 0;
                min-height: 100%;
                color: var(--text);
            }
            h1 {font-size: var(--step-2);}
            h2 {font-size: var(--step-1);}
            h3, h4, h5, h6 {font-size: var(--step-0);}
            main {
                margin: 0px auto;
            }
            a {
                color: var(--blue);
            }
            a:visited {
                color: var(--blue);
            }           
            .show-lg {
                display: none;
                @media screen and (min-width: 711px) {
                    display: inline-block;
                }
            }
            .u-container {
                max-width: var(--grid-max-width);  
                margin-inline: auto;
            }
            .u-grid {
                display: grid;
                gap: var(--grid-gutter);
                grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
                @media screen and (min-width: 711px) {
                    grid-template-columns: 240px 1fr;
                    padding-inline: var(--grid-gutter);
                }
                grid-gap: 1rem;     
            }
            .header-nav {
                display: grid;
                grid-auto-flow: column;
                grid-auto-columns: 1fr;
                text-align: center;
            }

            header nav {
                height: var(--space-xl);
                background-color: var(--base); 
                padding: 0 var(--grid-gutter);
                line-height: var(--space-xl);
                display: grid;
                grid-auto-flow: column;
                grid-auto-columns: 1fr;
                border-radius: 0  0 var(--space-3xs) var(--space-3xs);
                border: 0;
                border-bottom: 1px solid var(--crust); 
                position: fixed; 
                top: 0;    
                width: 100%;
                z-index: 10;
                @media (prefers-color-scheme: dark) {
                    background-color: var(--mantle);
                } 
                @media screen and (min-width: 711px)
                {
                    border-radius: var(--space-3xs);
                    padding: 0 var(--space-s);
                    max-width: var(--grid-max-width);
                    border: 1px solid var(--crust);
                }
            }
            header nav img {
                border-radius: 50%;
                width: var(--space-l);
                vertical-align: middle;
            }
            header nav svg {
                width: var(--space-s);
                padding-left: 0;
                vertical-align: middle;
            }
            header nav a {
                color: var(--text);
                text-decoration: none;
                @media screen and (min-width: 711px)
                {
                    border-right: 1px solid var(--crust);
                }
            }
            header nav a:last-of-type {
                border-right: none;
            }
            header nav a:visited {
                color: var(--text);
            }
            button, .button {
                background-color: var(--base);
                @media (prefers-color-scheme: dark) {
                    background-color: var(--mantle);
                }
                color: var(--text);
                border: 1px solid var(--text);
                box-shadow: var(--crust) 0 1px 1px 0;
                min-height: var(--space-m-l);
                font-size: var(--step--2);
                border-radius: var(--space-3xs);
            }
            button:active, .button:active {
                transform:translateY(2px);
                box-shadow: 0 0 0;
                outline: 0;
            }
            form label {
                display: block;
                padding-bottom: var(--space-2xs-xs);
            }
            summary {
                margin-bottom: var(--space-s);
            }
            summary span {
                color: var(--text)
            }
            summary .header {
                margin-bottom: var(--space-s);
            }
            details form label {
                display: inline-block;
                font-weight: 300;
                padding-bottom: 0;
            }
            input, select, input[type="color"] {
                width: 100%;
            }
            input, select, textarea, input[type="color"] {
                background: var(--crust);
                border: 1px solid black;
                border-radius: var(--space-3xs);
                @media (prefers-color-scheme: dark) {
                    background: var(--crust);
                    border: 1px solid black;
                }
                padding: 0.5em;
            }
            input[type="checkbox"]{
                width: initial;
            }
            input::placeholder {
                color: var(--subtext1);
            }
            fieldset {
                border: 1px solid var(--crust);
                margin-bottom: var(--space-s-m);
            }
            code {
                background: var(--crust);
                font-size: var(--step--2);
                padding: var(--space-3xs);
                border-radius: var(--space-3xs);
            }
            iframe {
                border: 0;
            }
            a.active
            { 
            font-weight: bold; 
                background-color: var(--crust);
            } 
            a.selected {
                color: var(--blue) !important;
            }
            .grow-wrap {
                display: grid;
                margin: var(--space-xs) 0;
            }
            .grow-wrap::after {
                content: attr(data-replicated-value) " ";
                white-space: pre-wrap;
                visibility: hidden;
            }
            .grow-wrap > textarea {
                resize: none;
                overflow: hidden;
            }
            .grow-wrap > textarea,
            .grow-wrap::after {
                border: 1px solid black;
                padding: 0.5rem;
                font: inherit;
                grid-area: 1 / 1 / 2 / 2;
            }
            .switch-field {
                display: grid;
                grid-auto-flow: column;
                grid-auto-columns: 1fr;
                overflow: hidden;
                margin-bottom: var(--space-xs-s);
                padding: 0 var(--space-xs-s);   
                @media screen and (min-width: 711px)
                {
                    padding: 0;   
                    margin: var(--space-s-m);
                }
            }
            .switch-field a {
                text-align: center;
                padding: var(--space-3xs) var(--space-2xs);
                transition: all 0.1s ease-in-out;
                text-decoration: none;
                color: var(--text);
                border-bottom: 1px solid var(--mantle);
            }
            .switch-field a.clear {
                background: white;
                font-size: var(--step--1);
                @media (prefers-color-scheme: dark) {
                    background: var(--crust);
                }
            }
            .switch-field a:visited {
                color: var(--text);
            }
            .switch-field a.selected {
                color: var(--blue);
                border-bottom: 2px solid var(--blue);
                box-shadow: none;
                font-weight: 400;
            }
            form > details > summary {
                border-radius: var(--space-3xs);
                @media (prefers-color-scheme: dark) {
                    background-color: var(--crust);
                }
            }
            .post img, .post video {
                width: 100%;
                max-width: 580px;
                border-radius: var(--space-3xs);
            }
            .form {
                @media screen and (min-width: 711px) {
                    margin: var(--space-s-m);
                }     
            }
            .posts article {
                display: grid;
                grid-template-columns: var(--space-l-xl) 1fr;
                border-bottom: 1px solid var(--crust);       
                margin-bottom: var(--space-xs);
                padding: var(--space-xs-s);
                padding-bottom: var(--space-s);
                @media screen and (min-width: 711px) {
                    margin: var(--space-s-m);
                    padding-bottom: var(--space-xs-s);
                }     
            }
            .comments header img {
                border-radius: 50%;
                width: var(--space-m);
                height: var(--space-m);
                vertical-align: middle;
            }
            .comments summary img {
                border-radius: 50%;
                width: var(--space-m);
                height: var(--space-m);
                vertical-align: middle;
            }
            .comment img {
                margin-right: var(--space-3xs-2xs);
            }
            .comment a {
                text-decoration: none;
            }
            .posts {
                margin-bottom: var(--space-3xl)
            }
            .content, .comment, .profile {
                overflow-wrap: anywhere;
            }
            .title {
                margin: var(--space-3xs) 0;
                text-align: center;
                font-weight: 600;
            }
            .comments {
                padding-top: var(--space-xs);
            }
            .comment-count {
                color: var(--subtext1);
                margin-left: var(--space-2xs-xs);
            }
            .comment {
                color: var(--subtext2);
                background: var(--base);
                @media (prefers-color-scheme: dark) {
                    background: var(--mantle);
                }
                padding: var(--space-2xs);
                margin: var(--space-2xs);
            }
            .comment p {
                margin-top: var(--space-3xs);
            }
            .categories {
                display: flex;
                flex-wrap: nowrap;
                overflow-x: auto;
                list-style: none;
                padding: 0 var(--space-xs-s) var(--space-xs) var(--space-xs-s); 
                -webkit-overflow-scrolling: touch;
                margin-bottom: 0;
                @media screen and (min-width: 711px) {
                    display: block;
                    padding: 0 0 var(--space-s) 0;
                }
            }
            .categories li {
                flex: 0 0 auto;
                border: 1px solid var(--crust);
                border-radius: var(--space-3xs);
                margin-right: var(--space-xs);
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
                font-weight: 400;
                min-height: var(--space-l);
                min-width: var(--space-l);
                @media screen and (min-width: 711px) {
                    margin-bottom: var(--space-2xs);
                    margin-right: 0;
                    border-radius: var(--space-3xs);
                }
            }
            .categories a {
                text-decoration: none;
                width: 100%;
                min-height: var(--space-l);
                display: block;
                padding: var(--space-3xs);
                color: var(--text);
            }
            @media screen and (max-width: 711px){
                ::-webkit-scrollbar {
                    -webkit-appearance: none;
                }
            }
            .discover {
                display: flex;
                flex-wrap: nowrap;
                overflow-x: auto;
                list-style: none;
                padding: 0 var(--space-xs-s) var(--space-xs) var(--space-xs-s);       
                -webkit-overflow-scrolling: touch;
                columns: 2;
                -webkit-columns: 2;
                -moz-columns: 2;

                @media screen and (min-width: 711px) {
                    display: block;
                    column-gap: 0;
                    padding: 0 0 var(--space-s) 0;
                }
            }
            .discover li {
                flex: 0 0 auto;
                height: var(--space-3xl);
                width: var(--space-3xl);
                border: 1px solid #ffffff;
                border-radius: var(--space-3xs);
                margin-right: var(--space-xs);
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
                padding-top: var(--space-l);
                padding-left: var(--space-xs);
                font-weight: 500;
                font-size: var(--step--1);
                @media (prefers-color-scheme: dark) {
                    border: 1px solid var(--base);
                }
                @media screen and (min-width: 711px) {
                    display: block;
                    width: 100%;
                    border-radius: var(--space-3xs);
                }
            }
            .discover a {
                color: #fff;
                text-shadow: 1px 1px var(--space-3xs) var(--subtext-1);
                @media (prefers-color-scheme: dark) {
                    color: var(--crust);
                    text-shadow: none;
                }
            }
            .noShift  {
                padding-top: 0 !important;
                padding-left: 0 !important;
            }
            .red-orange {
                background: linear-gradient(to bottom right, var(--orange), var(--red));
            }
            .orange-yellow {
                background: linear-gradient(to bottom right, var(--yellow), var(--orange));
            }
            .yellow-green {
                background: linear-gradient(to bottom right, var(--green), var(--yellow));
            }
            .green-blue {
                background: linear-gradient(to bottom right, var(--blue), var(--green));
            }
            .blue-purple {
                background: linear-gradient(to bottom right, var(--purple), var(--blue));
            }
            .purple-red {
                background: linear-gradient(to bottom right, var(--red), var(--purple));
            }
            .profile {
                display: grid;
                grid-template-columns: 1fr 2fr;
                border-radius: var(--space-3xs);
                background-color: var(--base);
                @media (prefers-color-scheme: dark) {
                    background-color: var(--mantle);
                }
                padding: var(--space-s);
                border: 1px solid var(--crust);
                margin: 0 var(--space-xs-s);
                @media screen and (min-width: 711px) {
                    margin: var(--space-s-m);
                }
            }
            .profile .avatar {
                width: var(--space-3xl);
                height: var(--space-3xl);
                border-radius: 50%;
                border: 1px solid var(--crust);
            }
            button, summary {
                cursor: pointer;
            }
            .small-img {
                width: auto !important;
                max-width: 190px !important;
            }
            a.button:visited {
                color: var(--text);
            }
            a.button {
                color: var(--text);
                text-decoration: none;
                font-size: var(--step-0);
                padding: var(--space-3xs);
            }
            .controls {
                display: grid;
                grid-auto-flow: column;
                grid-auto-columns: 1fr;
            }
            .controls button {
                border: 1px solid var(--subtext-1);
                background-color: var(--overlay-2);
                border-radius: 0;
                color: var(--base);
                box-shadow: 0;
            }
            .center {
                text-align:center;
            }
            #photos {
                display: grid;
                grid-template-columns: repeat(1, 1fr);
                margin-top: var(--space-s-m);
                grid-gap: var(--space-2xs-xs);
                @media screen and (min-width: 711px) {
                    margin-left: var(--space-s-m);
                    margin-right: var(--space-s-m);
                    grid-template-columns: repeat(2, 1fr);             
                }
            }
            #photos div  {
                 border: 1px solid var(--crust);
                 border-radius: var(--space-3xs);
                 padding: var(--space-3xs);
            }
            #photos img, #photos video {
                width: 100% !important;
                height: auto !important;
                margin-bottom: var(--space-3xs);
            }
            #photos .switch-field {
                margin: 0;
                border: 0;
                border-radius: 0;
                padding: 0;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            .profile-dark {
                color:var(--text);font-weight:300;display:block;background-color:var(--mantle);margin-bottom:var(--space-3xl);
            }
            .padding-ml {
                padding: var(--space-m-l)
            }
            .discover-li-wide {
                padding-top: var(--space-s) !important;
                color: #fff;
                text-shadow: 1px 1px var(--space-3xs) var(--subtext-1);
                @media (prefers-color-scheme: dark) {
                    color: var(--crust); 
                    text-shadow: none;
                }
            }
            .margin-3xs {
                margin: var(--space-3xs);
            }
            .margin-bottom-3xs {
                margin-bottom:var(--space-3xs)
            }
            .EasyMDEContainer {
                border: 1px solid black;
                border-radius: var(--space-3xs);
            }
            .editor-toolbar
            {
                background-color: var(--crust);
            }
            .editor-toolbar
            {
                background-color: var(--crust);
            }
            .editor-statusbar {
                background-color: var(--crust);
                color: var(--text) !important;
            }
            .CodeMirror {
                @media (prefers-color-scheme: dark) {
                    background-color: var(--crust);
                }
            }
            .editor-preview-full img, .editor-preview-full video {
                max-width: 100%;
            }
            dialog::backdrop {
                background: rgba(255, 0, 0, 0.25);
            }
            .actions details form, .actions details span, .actions details a, .actions details .actionBtn {
                display: block;
                height: 40px;
                line-height: 40px;
                text-align: center;
                font-size: var(--step--1);
                background-color: var(--crust);
                font-weight: 400;
                margin-bottom: var(--space-3xs);
            }
            .actions details details summary {
                height: 40px;
                line-height: 40px;
                text-align: center;
                font-size: var(--step--1);
                background-color: var(--crust);
                font-weight: 400;
            }
            .actions details a { text-decoration: none; color: var(--text); }
            .actions details a:visited { text-decoration: none; color: var(--text); }
            .actionBtn {margin: var(--space-xs) auto;}
            .actionExpand {margin-bottom:var(--space-3xs);padding-left:var(--space-xs);max-height:300px;overflow:auto;background-color:var(--crust);}
            .actionExpandToggle {margin:0;height: 40px;line-height: 40px;font-size: var(--step--1);}
            blockquote {
                border-left: 5px solid var(--crust);
                margin-left: var(--space-m);
                padding-left: var(--space-2xs);
            }
            .label {border:1px solid var(--subtext-1);border-radius:var(--space-3xs);padding:2px;color:var(--subtext-1);font-size:var(--step--2);}`;
    return minify(Language.CSS, style);
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

// --------------------------------------------------------------------------------------
// Configure and start the HTTP server
// --------------------------------------------------------------------------------------
const app = new Application({ logErrors: true });
app.use(oakCors());

/**
 * Middleware - redirect to login page if the cookie with the access_token is missing.
 */
app.use(async (ctx, next) => {
  let cookies = await getCookies(ctx);
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
        //console.log(`Caught error: ${e.message}`, e) 
      }
    },
);

app.listen({ port: 8080 });