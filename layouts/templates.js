const _spectre = await Deno.readTextFile("styles/spectre.min.css");
const _style = await Deno.readTextFile("styles/style.css");
const _shoelacecss = await Deno.readTextFile("styles/shoelace.css");
const _commonjs = await Deno.readTextFile("scripts/client/common.js");
const _shoelacejs = await Deno.readTextFile("scripts/client/shoelace.js");

const _dropdownTemplate = new TextDecoder().decode(await Deno.readFile("templates/_dropdown.html"));


function NavBarContent(user, area, title, navContent) {
    if(area == "blog" || title == 'Post') {
        return `<section class="mt-1 mb-2 scroll-container">
            <ul class="pl-0 horizontal-list" style="list-style:none">
                ${title == 'Post' || title == 'Media' ? '' : `<li class="menuAction"><a href="/post" class="btn btn-primary dropdown-toggle" tabindex="0"><i class="bi bi-pencil-square"></i> New Post</a></li>`}
                <li><a onclick="addLoading(this)" href="/posts" class="btn ${title == "Posts" ? 'bg-light green-border' : 'btn-link'} green-text"><i class="bi bi-window-stack green-text"></i> Posts</a></li>
                <li><a onclick="addLoading(this)" href="/posts?status=draft" class="btn ${title == "Draft" ? 'bg-light greenblue-border' : 'btn-link'} greenblue-text"><i class="bi bi-pencil greenblue-text"></i> Drafts</a></li>
                <!--<li><a onclick="addLoading(this)" href="/pages" class="btn btn-link"><i class="bi bi-files blue-text"></i></a> Pages</li>-->
                <li><a onclick="addLoading(this)" href="/media" class="btn ${title == "Media" ? 'bg-light bluepurple-border' : 'btn-link'} bluepurple-text"><i class="bi bi-images bluepurple-text"></i> Uploads</a></li>
                <li><!--<a onclick="addLoading(this)" href="/collections" class="btn btn-link purple-text"><i class="bi bi-collection purple-text"></i></a> Collections</li>
                <li><a onclick="addLoading(this)" href="/webmentions" class="btn btn-link purplered-text"><i class="bi bi-chat-square-dots purplered-text"></i> Webmentions</a></li>-->
            </ul>
        </section>`;
    }
    if(area == "bookmarks") {
        // if(user.plan == 'premium') {
        //     return `<section class="navbar-section mt-1 mb-2">
        //         <div class="btn-group btn-group-block">
        //             <a onclick="addLoading(this)" href="/bookshelves" class="btn btn-link"><i class="bi bi-bookmark-star green-text"></i></a>
        //             <a onclick="addLoading(this)" href="/highlights" class="btn btn-link"><i class="bi bi-highlighter greenblue-text"></i></a>
        //         </div>
        //     </section>`;
        // }
        return `<section class="mt-1 mb-2 scroll-container">
            <ul class="pl-0 horizontal-list" style="list-style:none">
                ${navContent}
            </ul>
        </section>`;
    }
    if(area == "bookshelves") {
        return `<section class="mt-1 mb-2 scroll-container" >
            <ul class="pl-0 horizontal-list" style="list-style:none">
                <li><a onclick="addLoading(this)" href="/books" class="btn ${title == "Books" ? 'bg-light greenblue-border' : 'btn-link'} greenblue-text"><i class="bi bi-search-heart greenblue-text"></i> Books</a></li>
                ${navContent}            
            </ul>
        </section>`;
    }
    if(area == "notes") {
        return `<section class="mt-1 mb-2 scroll-container">
            <ul class="pl-0 horizontal-list" style="list-style:none">
                ${navContent}
            </ul>
        </section>`
    }
    let discoverTitle = title != "Timeline" && title != "Conversation" && title != "Mentions" && title != "Replies" && title != "following" && title != "Favorites" && title != "muted" && title != "blocked";
    if(parseInt(title) || title.includes('User')) {
        discoverTitle = false;
    }
    return `<section class="mt-1 mb-2 scroll-container">
        <ul class="pl-0 horizontal-list" style="list-style:none">
            ${title == 'Editor' ? '' : `<li class="menuAction"><a href="/post" class="btn btn-primary dropdown-toggle" tabindex="0"><i class="bi bi-pencil-square"></i> New Post</a></li>`}
            <li><a onclick="addLoading(this)" href="/" class="btn ${title == "Timeline" ? 'bg-light green-border' : 'btn-link'} green-text"><i class="bi bi-card-list green-text"></i> Timeline</a></li>
            ${ user && user.lillihub && user.lillihub.display != 'both' && user.lillihub.display != 'classic' ? `<li><a onclick="addLoading(this)" href="/conversations" class="green-text btn ${title == "Conversation" ? 'bg-light green-border' : 'btn-link'}"><i class="bi bi-chat green-text"></i> Conversation</a></li>` : '' }
            ${ user && !user.error ? `
            <li><a onclick="addLoading(this)" href="/discover" class="btn ${discoverTitle ? 'bg-light greenblue-border' : 'btn-link'} greenblue-text"><i class="bi bi-search greenblue-text"></i> Discover</a></li>
            <li><a onclick="addLoading(this)" href="/mentions" class="btn ${title == "Mentions" ? 'bg-light blue-border' : 'btn-link'} blue-text"><i class="bi bi-at blue-text"></i> Mentions</a></li>
            <li><a onclick="addLoading(this)" href="/replies" class="btn ${title == "Replies" ? 'bg-light bluepurple-border' : 'btn-link'} bluepurple-text"><i class="bi bi-reply bluepurple-text"></i> Replies</a></li>
            <li><a onclick="addLoading(this)" href="/users/following" class="btn ${title == "following" || title == "muted" || title == "blocked" ? 'bg-light purple-border' : 'btn-link'} purple-text"><i class="bi bi-people purple-text"></i> Following</a></li>
            <li><a onclick="addLoading(this)" href="/favorites" class="btn ${title == "Favorites" ? 'bg-light purplered-border' : 'btn-link'} purplered-text"><i class="bi bi-star purplered-text"></i> Favorites</a></li>
            ` : '' }
        </ul>
    </section>`;
}

export function CSSThemeColors(dark = false) {
    if(dark) {
        return `:root {
            color-scheme: dark;
            --text: #c6d0f5;
            --subtext-1: #b5bfe2;
            --overlay-2: #949cbb;
            --overlay-1: #838ba7;
            --base: #11131a; /*#303466*/
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
        }`;
    }
    return `:root {
        --text: #4c4f69;
        --subtext-1: #5c5f77;
        --overlay-2: #7c7f93;
        --overlay-1: #8c8fa1;
        --base: #fcfcfc;
        --mantle: #e6e9ef;
        --crust: #dce0e8;           
        /*--red: #de324c;
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
        --purplered: #BA4477;*/
        --red: #DD314B;
        --redorange: #E22B22;
        --orange: #D2460F;
        --orangeyellow: #AE640A;
        --yellow: #897306;
        --yellowgreen: #6D7D26;
        --green: #3C833A;
        --greenblue: #3D7F7B;
        --blue: #2A7DA7;
        --bluepurple: #5F72B4;
        --purple: #9D5BA9;
        --purplered: #BE5080;
    }
    /*@media (prefers-color-scheme: dark) {
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
    }*/`;
}

// <style>${_shoelacecss}</style>
// <script type="module">${_shoelacejs}</script>
export async function HTMLPage(token, title, contentHTML, user, redirect = '', navContent) {
    let area = '';
    
    if(title == 'Bookmarks') {
        area = 'bookmarks';
    }
    if(title == 'Posts' || title == 'Draft' || title == 'Media') {
        area = 'blog';
    }
    if(title == 'Bookshelves' || title == 'Books' || title == 'Bookshelf' || title == 'Edit book') {
        area = 'bookshelves';
    }
    if(title == 'Notebooks' || title == 'Notes' || title == 'Note') {
        area = 'notes';
    }
    let notebooks = '';
    let bookshelves = '';
    if(token) {
        const fetchingNotebooks = await fetch(`https://micro.blog/notes/notebooks`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
        const resultsNotebooks = await fetchingNotebooks.json();
        notebooks = resultsNotebooks.items.sort((a,b) => (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0)).map((item,i) => {
            return `<li class="menu-item"><a onclick="addLoading(this)" href="/notes/${item.id}">${item.title}</a></li>`;
        }).join('');

        const fetchingBookshelves = await fetch(`https://micro.blog/books/bookshelves`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
        const resultsBookshelves = await fetchingBookshelves.json();
        bookshelves = resultsBookshelves.items.sort((a,b) => (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0)).map((item) =>
            `<li class="menu-item"><a onclick="addLoading(this)" href="/bookshelves/shelf/${item.id}">${item.title}</a></li>`
        ).join('');
    }

    return `<!DOCTYPE html>
            <html lang="en">
                <head>
                    ${redirect ? `<meta http-equiv="refresh" content="0; url=${redirect}" />` : ''}
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <meta name="description" content="Lillihub - A delightful Micro.blog client">
                    <meta name="apple-mobile-web-app-capable" content="yes">
                    <link rel="icon" type="image/x-icon" href="https://lillihub.com/favicon.ico">
                    <link rel="apple-touch-icon" href="/lillihub-512.png">
                    <meta name="apple-mobile-web-app-status-bar-style" content="black">
                    <meta name="theme-color" content="#000000">
                    <meta name="apple-mobile-web-app-title" content="Lillihub">
                    <link rel="manifest" href="/manifest.webmanifest">
                    <meta name="mobile-web-app-capable" content="yes">
                    <style>
                        ${CSSThemeColors(user && user.lillihub ? user.lillihub.darktheme : false)}
                    </style>
                    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.15.0/cdn/themes/light.css" />
                    <script type="module" src="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.15.0/cdn/shoelace-autoloader.js"></script>
                    <style>${_spectre}</style>
                    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
                    <title>${title}</title>
                    <noscript><style>.hide-if-user-has-no-javascript { display: none }</style></noscript>
                    <script>if('serviceWorker' in navigator){ 
                        navigator.serviceWorker.register('/sw.js'); 
                        window.addEventListener("load", function() {
                            if (navigator.serviceWorker.controller != null) {
                                navigator.serviceWorker.controller.postMessage({"command":"trimCache"});
                            }
                        });}</script>
                    <script>document.write('<style>.hide-if-user-has-javascript{display:none}</style>');</script>
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/default.min.css">
                    <style>${_style}</style>
                </head>
                <body id="top" class="body-content">



                <div class="off-canvas">
                    <div id="sidebar" class="off-canvas-sidebar">
                        <p style="text-align:center;"><img loading="lazy" src="/lillihub-512.png" width="130"/></p>
                        <ul class="menu bg-light" style="max-width:260px;box-shadow:none;">
                                <li class="menu-item">
                                    <a onclick="addLoading(this)" href="/">Timeline</a>
                                </li>
                                <li class="menu-item">
                                    <a onclick="addLoading(this)" href="/posts">Blog Management</a>
                                </li>
                                <li class="menu-item menuAction">
                                    <a onclick="addLoading(this)" href="/bookmarks">Bookmarks</a>
                                </li>
                                <li class="divider" data-content="Private Notes"></li>
                                ${notebooks}
                                <!--<li class="menu-item">
                                    <a onclick="addLoading(this)" href="/notes">Private Notes</a>
                                </li>-->
                                <li class="menu-item menuAction"></li>
                                <li class="divider" data-content="Bookshelves"></li>
                                ${bookshelves}
                                <!--<li class="menu-item">
                                    <a onclick="addLoading(this)" href="/bookshelves">Bookshelves</a>
                                </li>-->
                                <li class="menu-item menuAction">
                                    <hr />
                                </li>
                                <li class="menu-item">
                                    <a onclick="addLoading(this)" href="/user/${user.username}"><figure class="avatar avatar-sm"><img height="48" width="48" src="${user.avatar}" alt="${user.username} Avatar" loading="lazy"></figure> @${user.username}</a>
                                </li>
                                <li class="menu-item"><a onclick="addLoading(this)" href="/settings">Settings</a></li>
                                <li class="menu-item"><a onclick="addLoading(this)" href="/logout">Logout</a></li>
                                <li class="menu-item"><small>
                                    <a onclick="addLoading(this)" href="https://docs.lillihub.com">Documentation</a> · <a onclick="addLoading(this)" href="https://github.com/heyloura/lillihub-client">Github</a> 
                                    <!--· Buy Me a Coffee--> · Version 0.2.5<br/>
                                    Designed and built with ♥ by <a onclick="addLoading(this)" href="https://heyloura.com">Loura</a>. 
                                    Licensed under the MIT License.</small></li>
                        </ul>
                    </div>

                    <a class="off-canvas-overlay" href="#close"></a>

                    <div class="off-canvas-content">
                        







                    <div class="content-page container grid-md">
                        ${ user && !user.error ? `
                        <a class="off-canvas-toggle btn btn-primary btn-action" style="left: unset;right: .4rem;position:fixed;" href="#sidebar">
                                        <i class="bi bi-list"></i>
                                    </a>`
                    : '' }
                        <div class="columns">
                            <div id="app-sidebar" class="column col-3 hide-sm">
                                <div class="p-fixed sidenav">
                                    ${NavBarContent(user, area, title, navContent)}
                                </div>
                            </div>
                            <div class="column col-9-md col-9-lg col-9-xl col-12-sm">${contentHTML}</div>
                        </div>           
                    </div>
                    <footer class="p-1 bg-light show-sm app-footer">
                        <div class="bottomNav">
                            ${NavBarContent(user, area, title, navContent)}
                        </div>
                    </footer>












                    </div>
                </div>


                </body>
                <style>.small-img{width:unset!important;margin-left:unset!important;}</style>
                <script>${_commonjs}</script>
            </html>`;
}