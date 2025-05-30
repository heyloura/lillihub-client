const _spectre = await Deno.readTextFile("styles/spectre.min.css");
const _style = await Deno.readTextFile("styles/style.css");
const _shoelacecss = await Deno.readTextFile("styles/shoelace.css");
const _commonjs = await Deno.readTextFile("scripts/client/common.js");
const _shoelacejs = await Deno.readTextFile("scripts/client/shoelace.js");

function NavBarContent(user, area, title, navContent, scroll) {
    if(area == "blog" || title == 'Post') {
        return `<section class="mt-1 mb-2 ${scroll? 'scroll-container': ''}">
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
        return `<section class="mt-1 mb-2 ${scroll? 'scroll-container': ''}">
            <ul class="pl-0 horizontal-list" style="list-style:none">
                ${navContent}
            </ul>
        </section>`;
    }
    if(area == "bookshelves") {
        return `<section class="mt-1 mb-2 ${scroll? 'scroll-container': ''}" >
            <ul class="pl-0 horizontal-list" style="list-style:none">
                <li><a onclick="addLoading(this)" href="/books" class="btn ${title == "Books" ? 'bg-light greenblue-border' : 'btn-link'} greenblue-text"><i class="bi bi-search-heart greenblue-text"></i> Books</a></li>
                ${navContent}            
            </ul>
        </section>`;
    }
    if(area == "notes") {
        return `<section class="mt-1 mb-2 ${scroll? 'scroll-container': ''}">
            <ul class="pl-0 horizontal-list" style="list-style:none">
                ${navContent}
                <li class="divider"></li>
                <li><a onclick="addLoading(this)" href="/notes" class="btn btn-link text-muted"><i class="bi bi-gear"></i> Note Settings</a></li>
            </ul>
        </section>`
    }
    let discoverTitle = title != "Timeline" && title != "Conversation" && title != "Mentions" && title != "Replies" && title != "following" && title != "Favorites" && title != "muted" && title != "blocked";
    if(parseInt(title) || title.includes('User')) {
        discoverTitle = false;
    }
    return `<section class="mt-1 mb-2 ${scroll? 'scroll-container': ''}">
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
            --base: #11131a;
            --on-base: #c6d0f5;
            --link: #99BEBC;
            --bg-dark: #08090d;
            --bg-on-dark: #d1d9f7;
            --bg-secondary: #0d0f14;
            --bg-on-secondary: #d1d9f7;
            --border: #000000;
            --bg-mantle: #232634;
            

            --text: #c6d0f5;
            --subtext-1: #b5bfe2;
            --overlay-2: #949cbb;
            --overlay-1: #838ba7;
            
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
        --base: #fcfcfc;
        --on-base: #4c4f69;
        --link: #3D7F7B;
        --bg-dark: #e6e9ef;
        --bg-on-dark: #3c3f54;
        --bg-secondary: #f2f4f7;
        --bg-on-secondary: #3c3f54;
        --border: #dce0e8
        --bg-mantle: #e6e9ef;

        --text: #4c4f69;
        --subtext-1: #5c5f77;
        --overlay-2: #7c7f93;
        --overlay-1: #8c8fa1;
        
        --mantle: #e6e9ef;
        --crust: #dce0e8;  
        
        
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
    }`;
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
        try {
            const fetchingNotebooks = await fetch(`https://micro.blog/notes/notebooks`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
            const resultsNotebooks = await fetchingNotebooks.json();
            notebooks = resultsNotebooks.items.sort((a,b) => (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0)).map((item,i) => {
                return `<li class="menu-item"><a onclick="addLoading(this)" href="/notes/${item.id}">${item.title}</a></li>`;
            }).join('');
        } catch(error) {
            console.log(error);
        }

        try {
            const fetchingBookshelves = await fetch(`https://micro.blog/books/bookshelves`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
            const resultsBookshelves = await fetchingBookshelves.json();
            bookshelves = resultsBookshelves.items.sort((a,b) => (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0)).map((item) =>
                `<li class="menu-item"><a onclick="addLoading(this)" href="/bookshelves/shelf/${item.id}">${item.title}</a></li>`
            ).join('');
        } catch(error) {
            console.log(error);
        }
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
                    <script src="https://cdn.jsdelivr.net/npm/@mariusbongarts/previewbox/dist/index.min.js"></script>
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
                                <li class="menu-item sidebarMenuAction">
                                    <a onclick="addLoading(this)" href="/bookmarks">Bookmarks</a>
                                </li>
                                <li class="divider" data-content="Private Notes"></li>
                                ${notebooks}
                                <li class="menu-item"><a onclick="addLoading(this)" href="/notes" class="text-muted">Note Settings <i class="bi bi-gear"></i></a></li>
                                <li class="menu-item sidebarMenuAction"></li>
                                <li class="divider" data-content="Bookshelves"></li>
                                ${bookshelves}
                                <!--<li class="menu-item">
                                    <a onclick="addLoading(this)" href="/bookshelves">Bookshelves</a>
                                </li>-->
                                <li class="menu-item sidebarMenuAction">
                                    <hr />
                                </li>
                                <li class="menu-item">
                                    <a onclick="addLoading(this)" href="/user/${user && user.username  ? user.username : ''}"><figure class="avatar avatar-sm"><img height="48" width="48" src="${user && user.avatar  ? user.avatar : ''}" alt="${user && user.username  ? user.username : ''} Avatar" loading="lazy"></figure> @${user && user.username  ? user.username : ''}</a>
                                </li>
                                <li class="menu-item"><a onclick="addLoading(this)" href="/settings">Settings</a></li>
                                <li class="menu-item"><a onclick="addLoading(this)" href="/logout">Logout</a></li>
                                <li class="menu-item"><small>
                                    <!--<a onclick="addLoading(this)" href="https://docs.lillihub.com">Documentation</a> · --><a onclick="addLoading(this)" href="https://github.com/heyloura/lillihub-client">Github</a> 
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
                                <div class="">
                                    ${NavBarContent(user, area, title, navContent)}
                                </div>
                            </div>
                            <div class="column col-9-md col-9-lg col-9-xl col-12-sm">${contentHTML}</div>
                        </div>           
                    </div>
                    <footer class="p-1 bg-light show-sm app-footer">
                        <div class="bottomNav">
                            ${NavBarContent(user, area, title, navContent, true)}
                        </div>
                    </footer>












                    </div>
                </div>


                </body>
                <style>.small-img{width:unset!important;margin-left:unset!important;}</style>
                <script>${_commonjs}</script>
            </html>`;
}

export async function HTML(token, title, contentHTML, user, redirect = '', navContent, nonce, id, subId) {
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
    if(title == 'Notebooks' || title == 'Notes' || title == 'Note' || title == 'Todo') {
        area = 'notes';
    }
    //let notebooks = '';
    let bookshelves = '';
    let notes = '';
    
    if(token) {
        // try {
        //     const fetchingNotebooks = await fetch(`https://micro.blog/notes/notebooks`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
        //     const resultsNotebooks = await fetchingNotebooks.json();
        //     notebooks = resultsNotebooks.items.sort((a,b) => (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0)).map((item,i) => {
        //         return `<li class="menu-item"><a onclick="addLoading(this)" href="/notes/${item.id}">${item.title}</a></li>`;
        //     }).join('');
        // } catch(error) {
        //     console.log(error);
        // }

        try {
            const fetchingBookshelves = await fetch(`https://micro.blog/books/bookshelves`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
            const resultsBookshelves = await fetchingBookshelves.json();
            bookshelves = resultsBookshelves.items.sort((a,b) => (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0)).map((item) =>
                `<li class="menu-item"><a onclick="addLoading(this)" href="/bookshelves/shelf/${item.id}">${item.title}</a></li>`
            ).join('');
        } catch(error) {
            console.log(error);
        }

        if( area == 'notes' ) {
            const fetchingNotes = await fetch(`https://micro.blog/notes/notebooks/${id}`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
            const notesResult = await fetchingNotes.json();
            notes = notesResult.items.sort((a,b) => (a.date_modified < b.date_modified) ? 1 : ((b.date_modified < a.date_modified) ? -1 : 0)).map((item) =>
                `<div class="notes tile tile-centered ${item.id == subId ? 'bg-dark border' : ''} border" data-encypted="true" data-id="${item.id}" data-content="${item.content_text}"></div>`
            ).join('');
        }
    }

    return `<!DOCTYPE html>
            <html lang="en">
                <head>
                    <title>${title}</title>
                    ${redirect ? `<meta http-equiv="refresh" content="0; url=${redirect}" />` : ''}
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <meta name="description" content="Lillihub - A delightful Micro.blog client">
                    <meta name="apple-mobile-web-app-capable" content="yes">
                    <link rel="icon" type="image/x-icon" href="https://lillihub.com/favicon.ico">
                    <link rel="apple-touch-icon" href="/lillihub-512.png">
                    <meta name="apple-mobile-web-app-status-bar-style" content="black">
                    <meta name="theme-color" content="${user && user.lillihub && user.lillihub.darktheme ? '#11131a' : '#fcfcfc'}">
                    <meta name="apple-mobile-web-app-title" content="Lillihub">
                    <link rel="manifest" href="/manifest.webmanifest">
                    <meta name="mobile-web-app-capable" content="yes">
                    <style nonce="${nonce}">
                        ${CSSThemeColors(user && user.lillihub ? user.lillihub.darktheme : false)}
                        .hide{display:none!important;}
                        .notes-dropdown{max-width:238px;}
                        .primary-text {
                            color: var(--greenblue) !important;
                        }
                        .red-text {
                            color: var(--red) !important;
                        }
                        .redorange-text {
                            color: var(--redorange) !important;
                        }
                        .orange-text {
                            color: var(--orange) !important;
                        }
                        .orangeyellow-text {
                            color: var(--orangeyellow) !important;
                        }
                        .yellow-text {
                            color: var(--yellow) !important;
                        }
                        .yellowgreen-text {
                            color: var(--yellowgreen) !important;
                        }
                        .green-text {
                            color: var(--green) !important;
                        }
                        .greenblue-text {
                            color: var(--greenblue) !important;
                        }
                        .blue-text {
                            color: var(--blue) !important;
                        }
                        .bluepurple-text {
                            color: var(--bluepurple) !important;
                        }
                        .purple-text {
                            color: var(--purple) !important;
                        }
                        .purplered-text {
                            color: var(--purplered) !important;
                        }
                        .red-border {
                            border-color: var(--red) !important;
                        }
                        .redorange-border {
                            border-color: var(--redorange) !important;
                        }
                        .orange-border {
                            border-color: var(--orange) !important;
                        }
                        .orangeyellow-border {
                            border-color: var(--orangeyellow) !important;
                        }
                        .yellow-border {
                            border-color: var(--yellow) !important;
                        }
                        .yellowgreen-border {
                            border-color: var(--yellowgreen) !important;
                        }
                        .green-border {
                            border-color: var(--green) !important;
                        }
                        .greenblue-border {
                            border-color: var(--greenblue) !important;
                        }
                        .blue-border {
                            border-color: var(--blue) !important;
                        }
                        .bluepurple-border {
                            border-color: var(--bluepurple) !important;
                        }
                        .purple-border {
                            border-color: var(--purple) !important;
                        }
                        .purplered-border {
                            border-color: var(--purplered) !important;
                        }
                        #sidebar-menu {height:100vh;min-height:100vh;}
                    </style>
                    <link rel="stylesheet" href="/styles/spectre.css" />
                    
                    <noscript><style nonce="${nonce}">.hide-if-user-has-no-javascript { display: none }</style></noscript>
                    <script nonce="${nonce}">if('serviceWorker' in navigator){ 
                        navigator.serviceWorker.register('/sw.js'); 
                        window.addEventListener("load", function() {
                            if (navigator.serviceWorker.controller != null) {
                                navigator.serviceWorker.controller.postMessage({"command":"trimCache"});
                            }
                        });}</script>
                    <script nonce="${nonce}">document.write('<style nonce="${nonce}">.hide-if-user-has-javascript{display:none}</style>');</script>
                    
                    <script defer nonce="${nonce}" src="https://cdn.jsdelivr.net/npm/@mariusbongarts/previewbox/dist/index.min.js"></script>
                    <script type="module" src="/scripts/shoelace.js"></script>
                    <script src="/scripts/highlight.min.js"></script>
                    <script src="/scripts/showdown.min.js"></script>
                </head>

                <body>
                <div class="show-xl">
                    <header class="navbar bg-dark">
                        <section class="p-2 navbar-section">
                            <figure class="avatar"><img loading="lazy" src="${user.avatar}" alt="${user.username}'s avatar"></figure>
                            <div class="dropdown">
                                <a href="#" class="btn btn-link dropdown-toggle" tabindex="0">
                                    Notebooks <i class="icon icon-caret"></i>
                                </a>
                                <div class="menu border bg-dark">
                                    ${navContent}
                                </div>
                            </div>
                            <div class="dropdown dropdown-right">
                                <a href="#" class="btn btn-link dropdown-toggle" tabindex="0">
                                    Apps <i class="icon icon-caret"></i>
                                </a>
                                <ul class="menu border bg-dark">
                                    <li class="nav-item"><a href="/posts" class="btn btn-link">Blog</a></li>
                                    <li class="nav-item"><a href="/bookmarks" class="btn btn-link">Bookmarks</a></li>
                                    <li class="nav-item"><a href="/bookshelves" class="btn btn-link">Bookshelves</a></li>
                                    <li class="nav-item"><a href="/notes" class="btn">Notes</a></li>
                                    <li class="nav-item"><a href="/" class="btn btn-link">Social</a></li>
                                </ul>
                            </div>
                        </section>
                        <section class="navbar-section">
                            <button id="show-menu-button" evt-click="show-menu" class="btn btn-link mr-2"><i evt-click="show-menu" class="icon icon-menu"></i></button>
                        </section>
                    </header>
                </div>
                <div class="container">
                    <div class="columns">
                        <div id="main-menu" class="hide-xl col-2 bg-dark border">
                            <div class="panel">
                                <div class="panel-header text-center">
                                    <figure class="avatar avatar-lg"><img loading="lazy" src="${user.avatar}" alt="${user.username}'s avatar"></figure>
                                    <div class="panel-title h5 mt-10">${user.name}</div>
                                    <div class="panel-subtitle"><a href="/user/${user.username}">@${user.username}</a></div>
                                </div>
                                <nav class="panel-nav">
                                    <ul class="tab tab-block">
                                        <li evt-click="tab" evt-target="tab-menu" class="tab-item active"><a href="/"><i class="icon icon-menu"></i> Notebooks</a></li>
                                        <li evt-click="tab" evt-target="tab-apps" class="tab-item"><a href="/"><i class="icon icon-apps"></i> Apps</a></li>
                                    </ul>
                                </nav>
                                <div id="tab-menu" class="panel-body m-2 p-2">
                                    <div class="tile tile-centered">
                                    <div class="tile-content">
                                        <div class="tile-title text-bold">Notebooks</div>
                                    </div>
                                    <div class="tile-action">
                                        <button class="btn btn-link btn-action btn-lg tooltip tooltip-left" data-tooltip="Manage Notebooks"><i class="icon icon-edit"></i></button>
                                    </div>
                                    </div>
                                    ${navContent}
                                </div>
                            </div>
                        </div>
                        <div id="sidebar-menu" class="hide-sm col-xs-12 col-sm-12 col-md-4 col-lg-4 col-xl-4 col-2 bg-secondary border">
                            <div class="m-2 p-2">
                                <div class="tile tile-centered">
                                    <div class="tile-content">
                                        <input id="notes-search" class="form-input" type="text" evt-input="search" evt-target=".notes" placeholder="Search Notes">
                                    </div>
                                    <div class="tile-action">
                                        <button class="btn btn-link btn-action btn-lg" data-tooltip="Tags"><i class="icon icon-bookmark"></i></button>
                                        <button class="btn btn-link btn-action btn-lg" data-tooltip="Add note"><i class="icon icon-plus"></i></button>
                                    </div>
                                </div>
                                <div class="mt-2 pt-2">
                                ${area == 'notes' ? notes : ''}    
                                </div>       
                            </div>  
                        </div>
                        <div class="col-xs-12 col-sm-12 col-md-8 col-lg-8 col-xl-8 col-8 border">
                            ${contentHTML}
                        </div>
                    </div>                    
                </div>

                </body>


                <script nonce="${nonce}">${_commonjs}</script>
            </html>`;
}

// export function HTML(content, title, redirect, footer, header, nonce, user) {
//     console.log(`dark theme? ${user && user.lillihub ? user.lillihub.darktheme : false}`);
//     return ` 
//     <!doctype html>
//     <html lang='en'>
//         <head>
//             <meta charset='UTF-8'>
//             <meta name='viewport' content='width=device-width, initial-scale=1'>
//             ${redirect ? `<meta http-equiv='refresh' content='0; url='${redirect}' />` : ``}
//             <title>${title}</title>
//             <link href="/styles/beer.min.css" rel="stylesheet">
//             <!--<link rel="stylesheet" href="/styles/main.css">-->  
//             <style nonce="${nonce}">${CSSThemeColors(user && user.lillihub ? user.lillihub.darktheme : false)}</style>
//             <style nonce="${nonce}">:root, body.light, body.dark  {
//                 --primary: var(--greenblue);
//                 --on-primary: var(--base);
//                 --primary-container: #94f990;
//                 --on-primary-container: #002204;
//                 --secondary: #52634f;
//                 --on-secondary: #ffffff;
//                 --secondary-container: #d5e8cf;
//                 --on-secondary-container: #111f0f;
//                 --tertiary: #38656a;
//                 --on-tertiary: #ffffff;
//                 --tertiary-container: #bcebf0;
//                 --on-tertiary-container: #002023;
//                 --error: var(--red);
//                 --on-error: var(--base);
//                 --error-container: #ffdad6;
//                 --on-error-container: #410002;
//                 --background: var(--base);
//                 --on-background: #1a1c19;
//                 --surface: var(--base);
//                 --on-surface: var(--color);
//                 --surface-variant: #dee5d8;
//                 --on-surface-variant: #424940;
//                 --outline: #72796f;
//                 --outline-variant: #c2c9bd;
//                 --shadow: #000000;
//                 --scrim: #000000;
//                 --inverse-surface: #2f312d;
//                 --inverse-on-surface: #f0f1eb;
//                 --inverse-primary: #78dc77;
//                 --surface-dim: #dadad4;
//                 --surface-bright: #f9faf4;
//                 --surface-container-lowest: #ffffff;
//                 --surface-container-low: #f3f4ee;
//                 --surface-container: #eeeee8;
//                 --surface-container-high: #e8e9e2;
//                 --surface-container-highest: #e2e3dd;
//             }</style>
//             <script type="module" src="/scripts/beer.min.js" type="text/javascript"></script>
//             <script src="/scripts/showdown.min.js" type="text/javascript"></script>
//             <script src="/scripts/highlight.min.js" type="text/javascript"></script>
//         </head>
//         <body>
//             ${header ? header : `
//             <header class="fixed surface-container-low">
//                 <nav>
//                     <button id="menu" data-ui="#apps-menu-drawer" class="s m circle transparent">
//                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-list" viewBox="0 0 16 16">
//                             <path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"/>
//                         </svg>
//                     </button>
//                     <a href="javascript:history.back()" id="goBack" class="s m circle transparent hide button">
//                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-left" viewBox="0 0 16 16">
//                             <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"/>
//                         </svg>
//                     </a>
//                     <a class="l button transparent" href="/"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-house" viewBox="0 0 16 16">
//                         <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5z"/>
//                         </svg></a>
//                     <a class="l button transparent" href="/blog">Blog</a>
//                     <a class="l button transparent" href="/bookmarks">Bookmarks</a>
//                     <a class="l button transparent" href="/bookshelves">Bookshelves</a>
//                     <a class="l button transparent" href="/notebooks">Notes</a>
//                     <a class="l ${title == 'Timeline' ? "active button" : "button transparent"}" href="/timeline">Social</a>
//                     <h5 id="titleBar" class="max center-align s m truncate">${title}</h5>
//                     <span class="max l"></span>
//                     ${title.includes('View Notes') ? `
//                         <button evt-click="addNote()" class="circle transparent">
//                             <i><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus" viewBox="0 0 16 16">
//                             <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
//                             </svg></i>
//                         </button>
//                     ` : ""}
//                     ${title.includes('todo.txt') ? `
//                         <button evt-click="addTodo()" class="circle transparent">
//                             <i><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus" viewBox="0 0 16 16">
//                             <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
//                             </svg></i>
//                         </button>
//                     ` : ""}                                         
//                 </nav>
//                 <dialog id="apps-menu-drawer" class="left">
//                     <header>
//                         <nav>
//                         <img width="60" src="/logo.png">
//                         <h6 class="max">Lillihub</h6>
//                         <div class="max"></div>
//                         <button data-ui="#apps-menu-drawer" class="circle transparent">
//                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
//                                 <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
//                                 </svg>
//                         </button>
//                         </nav>
//                     </header>
//                     <ul class="list">
//                         <li><a class="button" href="/"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-house" viewBox="0 0 16 16">
//                             <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5z"/>
//                             </svg> Dashboard</a></li>
//                         <li><a class="button" href="/blog">Blog</a></li>
//                         <li><a class="button" href="/bookmarks">Bookmarks</a></li>
//                         <li><a class="button" href="/bookshelves">Bookshelves</a></li>
//                         <li><a class="button" href="/notebooks">Notes</a></li>
//                         <li><a class="button ${title == 'Timeline' ? "primary" : ""}" href="/timeline">Social</a></li>
//                     </ul>
//                     <hr/>
//                     <button evt-click="removeKey()" class="circle transparent">
//                             <i>add</i>
//                     </button>
//                 </dialog>
//             </header>
//                 `}
//             <main>
//                 ${content}
//             </main>
//             ${footer ? footer : ''}
//         </body>
//     </html>    
//     `;
// }