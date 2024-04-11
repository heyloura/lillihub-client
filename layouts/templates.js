const _spectre = await Deno.readTextFile("styles/spectre.min.css");
const _style = await Deno.readTextFile("styles/style.css");
const _shoelacecss = await Deno.readTextFile("styles/shoelace.css");
const _commonjs = await Deno.readTextFile("scripts/client/common.js");
const _shoelacejs = await Deno.readTextFile("scripts/client/shoelace.js");

function NavBarContent(user) {
    return `<section class="navbar-section mt-1 mb-2">
        <div class="btn-group btn-group-block">
            <a href="/" class="btn btn-link"><i class="bi bi-view-list green-text"></i></a>
            ${ user && user.lillihub && user.lillihub.display != 'both' ? '<a href="/conversations" class="btn btn-link"><i class="bi bi-chat green-text"></i></a>' : '' }
            ${ user && !user.error ? `
            <a href="/discover" class="btn btn-link"><i class="bi bi-search greenblue-text"></i></a>
            <a href="/mentions" class="btn btn-link"><i class="bi bi-at blue-text"></i></a>
            <a href="/users/following" class="btn btn-link"><i class="bi bi-people bluepurple-text"></i></a>
            <a href="/bookmarks" class="btn btn-link"><i class="bi bi-bookmark-star purple-text"></i></a>
            <a href="/bookshelves" class="btn btn-link"><i class="bi bi-book purplered-text"></i></a>
            ${user.plan == 'premium' ? '<a href="/notes" class="btn btn-link"><i class="bi bi-file-text red-text"></i></a>' : ''}
            ` : '' }
        </div>
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
    }`;
}

export function HTMLPage(title, contentHTML, user, redirect = '') {
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
                    <style>
                        ${CSSThemeColors(user && user.lillihub ? user.lillihub.darktheme : false)}
                    </style>
                    <style>${_spectre}</style>
                    <style>${_shoelacecss}</style>
                    <script type="module">${_shoelacejs}</script>
                    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
                    <title>${title}</title>
                    <noscript><style>.hide-if-user-has-no-javascript { display: none }</style></noscript>
                    <script>if('serviceWorker' in navigator){ navigator.serviceWorker.register('/sw.js') }</script>
                    <script>document.write('<style>.hide-if-user-has-javascript{display:none}</style>');</script>
                    <style>${_style}</style>
                </head>
                <body class="body-content">
                    ${ user && !user.error ? `
                        <header class="app-header">
                            <div class="navbar bg-light p-1">
                                <section class="navbar-section mt-1 mb-2">
                                    <div class="btn-group btn-group-block mt-2">
                                        <a href="#top" class="btn btn-link greenblue-text">${title}</a>
                                    </div>
                                </section>
                                <section class="navbar-section mt-1 mb-2">
                                    <div class="btn-group btn-group-block mt-2">
                                        <a href="/post" class="btn btn-link dropdown-toggle greenblue-text" tabindex="0"><i class="bi bi-pencil-square"></i></a>
                                        <div class="dropdown dropdown-right">
                                            <a class="btn btn-link dropdown-toggle greenblue-text" tabindex="0"><i class="bi bi-window-stack"></i></a>
                                            <ul class="menu text-left">
                                                <li class="menu-item"><a href="/posts">My Blog Posts</a></li>
                                                <li class="menu-item"><a href="/media">My Media</a></li>
                                            </ul>
                                        </div>
                                        <div class="dropdown dropdown-right">
                                            <a class="btn btn-link dropdown-toggle greenblue-text" tabindex="0"><i class="bi bi-gear"></i></a>
                                            <ul class="menu text-left">
                                                <li class="menu-item">
                                                    <div class="panel-header text-center pb-0">
                                                        <figure class="avatar avatar-xl"><img height="48" width="48" src="${user.avatar}" alt="${user.username} Avatar" loading="lazy"></figure>
                                                        <div class="panel-title h5 mt-10">${user.name}</div>
                                                        <div class="panel-subtitle"><a href="/user/${user.username}">@${user.username}</a></div>
                                                    </div>
                                                </li>
                                                <li class="menu-item"><hr/></li>
                                                <li class="menu-item"><a href="/settings">Settings</a></li>
                                                <li class="menu-item"><a href="/logout">Logout</a></li>
                                                <li class="menu-item"><hr/></li>
                                                <li class="menu-item"><small><a href="https://github.com/heyloura/lillihub-client">Github</a> · Buy Me a Coffee · Version 0.2.0<br/>
                                                    Designed and built with ♥ by <a href="https://heyloura.com">Loura</a>. Licensed under the MIT License.</small></li>
                                            </ul>
                                        </div>
                                    </div>
                                </section>
                            </div>
                            <!--<div id="toast" style="position:fixed;bottom:90%;" class="toast hide-if-user-has-javascript">
                                <button onclick="this.parentNode.style = 'display:none;'" class="btn btn-clear float-right hide-if-user-has-no-javascript"></button>
                                <iframe style="border:0;" srcdoc='<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="background-color: rgba(48,55,66,1);"></body></html>' name="InteractionResult" width="220" height="45"></iframe>
                            </div>-->
                        </header>`
                    : '' }
                    <!--<div class="content-page hide-if-user-has-javascript">&nbsp;</div>-->
                    <div class="content-page container grid-md">
                        <div class="columns">
                            <div class="column col-1 hide-sm">
                                <div class="navbar p-fixed sidenav">
                                    ${NavBarContent(user)}
                                </div>
                            </div>
                            <div class="column col-11-md col-11-lg col-11-xl col-12-sm">${contentHTML}</div>
                        </div>           
                    </div>
                    <footer class="p-1 bg-light show-sm app-footer">
                        <div class="navbar">
                            ${NavBarContent(user)}
                        </div>
                    </footer>
                </body>
                <script>${_commonjs}</script>
            </html>`;
}