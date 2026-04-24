const _lillihub = await Deno.readTextFile("styles/lillihub.css");
const _commonjs = await Deno.readTextFile("scripts/client/common.js");

function getArea(title) {
    if(title == 'Bookmarks' || title == 'Highlights') return 'bookmarks';
    if(title == 'Posts' || title == 'Draft' || title == 'Media' || title == 'Post' || title == 'Editor' || title == 'Collections' || title == 'Collection') return 'blog';
    if(title == 'Feeds' || title == 'Feed' || title == 'Feed Entry' || title == 'Starred' || title == 'Recap') return 'feeds';
    if(title == 'Bookshelves' || title == 'Books' || title == 'Bookshelf' || title == 'Edit book' || title == 'Add Book' || title == 'Search Books') return 'bookshelves';
    if(title == 'Notebooks' || title == 'Notes' || title == 'Note') return 'notes';
    return 'social';
}

function PrimaryAction(area, title, context) {
    if(title == 'Editor' || title == 'Post') return '<div class="sidebar-action"></div>';
    // Reserve layout space without rendering an action when viewing a todo list.
    if(area == 'notes' && context?.isTodo) return '<div class="sidebar-action" aria-hidden="true"><a href="#" tabindex="-1" style="visibility:hidden;"><i class="bi bi-pencil-square"></i> &nbsp;</a></div>';
    if(area == 'notes' && context?.notebookId && context.tab === 'todos') return `<div class="sidebar-action sidebar-action"><a href="#new-todo-list" data-new-todo-list><i class="bi bi-plus-square"></i> New Todo List</a></div>`;
    if(area == 'notes' && context?.notebookId) return `<div class="sidebar-action sidebar-action"><a href="/notes/${context.notebookId}/new"><i class="bi bi-pencil-square"></i> New Note</a></div>`;
    if(area == 'notes') return `<div class="sidebar-action sidebar-action"><a href="/notebook/new"><i class="bi bi-journal-plus"></i> New Notebook</a></div>`;
    if(area == 'bookmarks') return `<div class="sidebar-action sidebar-action"><a href="/bookmark/new"><i class="bi bi-bookmark-plus"></i> New Bookmark</a></div>`;
    if(area == 'feeds') return `<div class="sidebar-action sidebar-action"><a href="/feed/new"><i class="bi bi-rss"></i> Add Feed</a></div>`;
    if(area == 'bookshelves') return `<div class="sidebar-action sidebar-action"><a href="/book/new"><i class="bi bi-journal-plus"></i> Add Book</a></div>`;
    return `<div class="sidebar-action"><a href="/post"><i class="bi bi-pencil-square"></i> New Post</a></div>`;
}

function FabAction(area, title, context) {
    if(title == 'Editor' || title == 'Post') return '';
    if(area == 'notes' && context?.isTodo) return '';
    if(area == 'notes' && context?.notebookId && context.tab === 'todos') return `<a href="#new-todo-list" data-new-todo-list class="fab"><i class="bi bi-plus-lg"></i></a>`;
    if(area == 'notes' && context?.notebookId) return `<a href="/notes/${context.notebookId}/new" class="fab"><i class="bi bi-pencil-square"></i></a>`;
    if(area == 'notes') return `<a href="/notebook/new" class="fab"><i class="bi bi-journal-plus"></i></a>`;
    if(area == 'bookmarks') return `<a href="/bookmark/new" class="fab"><i class="bi bi-bookmark-plus"></i></a>`;
    if(area == 'feeds') return `<a href="/feed/new" class="fab"><i class="bi bi-rss"></i></a>`;
    if(area == 'bookshelves') return `<a href="/book/new" class="fab"><i class="bi bi-journal-plus"></i></a>`;
    return `<a href="/post" class="fab"><i class="bi bi-pencil-square"></i></a>`;
}

function PageNavContent(user, area, title, navContent, context) {
    if(area == 'blog') {
        const destParam = context?.destination ? `destination=${encodeURIComponent(context.destination)}` : '';
        const amp = destParam ? '&' : '';
        return `
            <a href="/posts${destParam ? '?' + destParam : ''}" class="${title == 'Posts' ? 'active' : ''}"><i class="bi bi-window-stack"></i> Posts</a>
            <a href="/posts?status=draft${amp}${destParam}" class="${title == 'Draft' ? 'active' : ''}"><i class="bi bi-pencil"></i> Drafts</a>
            <a href="/media${destParam ? '?' + destParam : ''}" class="${title == 'Media' ? 'active' : ''}"><i class="bi bi-images"></i> Uploads</a>
            <a href="/collections${destParam ? '?' + destParam : ''}" class="${title == 'Collections' || title == 'Collection' ? 'active' : ''}"><i class="bi bi-grid"></i> Collections</a>`;
    }
    if(area == 'bookmarks') {
        return `
            <a href="/bookmarks" class="${title == 'Bookmarks' ? 'active' : ''}"><i class="bi bi-bookmark"></i> Bookmarks</a>
            <a href="/highlights" class="${title == 'Highlights' ? 'active' : ''}"><i class="bi bi-highlighter"></i> Highlights</a>`;
    }
    if(area == 'feeds') {
        return `<a href="/feeds" class="${title == 'Feeds' ? 'active' : ''}"><i class="bi bi-rss"></i> Feeds</a><a href="/feeds/entries" class="${title == 'Feed' || title == 'Feed Entry' ? 'active' : ''}"><i class="bi bi-card-list"></i> All</a><a href="/feeds/starred" class="${title == 'Starred' ? 'active' : ''}"><i class="bi bi-star"></i> Starred</a><a href="/feeds/recap" class="${title == 'Recap' ? 'active' : ''}"><i class="bi bi-journal-richtext"></i> Recap</a>${context?.feedName ? `<a href="/feeds/${context.feedId}" class="active"><i class="bi bi-rss"></i> ${context.feedName}</a>` : ''}`;
    }
    if(area == 'bookshelves') {
        return `<a href="/bookshelves" class="${title == 'Bookshelves' ? 'active' : ''}"><i class="bi bi-book"></i> Bookshelves</a><a href="/books" class="${title == 'Books' ? 'active' : ''}"><i class="bi bi-search-heart"></i> Discover</a>${context?.shelfName ? `<a href="/bookshelves/shelf/${context.shelfId}" class="active"><i class="bi bi-bookshelf"></i> ${context.shelfName}</a>` : ''}`;
    }
    if(area == 'notes') {
        if(title == 'Notebooks') return '';
        const notebooks = context?.notebooks || [];
        return notebooks.map(nb =>
            `<a href="/notes/${nb.id}" class="${context?.notebookId == nb.id ? 'active' : ''}"><i class="bi bi-journal-text"></i> ${nb.title}</a>`
        ).join('');
    }
    let discoverActive = title != "Timeline" && title != "Mentions" && title != "Replies" && title != "following" && title != "muted" && title != "blocked";
    if(parseInt(title) || title.includes('User')) discoverActive = false;
    return `
        <a href="/" class="${title == 'Timeline' ? 'active' : ''}"><i class="bi bi-card-list"></i> Timeline</a>
        ${ user && !user.error ? `
        <a href="/discover" class="${discoverActive ? 'active' : ''}"><i class="bi bi-search"></i> Discover</a>
        <a href="/mentions" class="${title == 'Mentions' ? 'active' : ''}"><i class="bi bi-at"></i> Mentions<span class="mentions-badge" style="display:none;"></span></a>
        <a href="/replies" class="${title == 'Replies' ? 'active' : ''}"><i class="bi bi-reply"></i> Replies</a>
        <a href="/users/following" class="${title == 'following' || title == 'muted' || title == 'blocked' ? 'active' : ''}"><i class="bi bi-people"></i> Following</a>` : '' }`;
}

function BottomNavContent(user, title, area, context) {
    if(!user || user.error) return '';
    if(area == 'blog') {
        const destParam = context?.destination ? `destination=${encodeURIComponent(context.destination)}` : '';
        const amp = destParam ? '&' : '';
        return `
        <div class="bottom-nav-links">
            <label for="sidebar-toggle"><i class="bi bi-list"></i></label>
            <a href="/posts${destParam ? '?' + destParam : ''}" class="${title == 'Posts' ? 'active' : ''}"><i class="bi bi-window-stack"></i> Posts</a>
            <a href="/posts?status=draft${amp}${destParam}" class="${title == 'Draft' ? 'active' : ''}"><i class="bi bi-pencil"></i> Drafts</a>
            <a href="/media${destParam ? '?' + destParam : ''}" class="${title == 'Media' ? 'active' : ''}"><i class="bi bi-images"></i> Uploads</a>
            <a href="/collections${destParam ? '?' + destParam : ''}" class="${title == 'Collections' || title == 'Collection' ? 'active' : ''}"><i class="bi bi-grid"></i> Collections</a>
        </div>`;
    }
    if(area == 'bookmarks') {
        return `
        <div class="bottom-nav-links">
            <label for="sidebar-toggle"><i class="bi bi-list"></i></label>
            <a href="/bookmarks" class="${title == 'Bookmarks' ? 'active' : ''}"><i class="bi bi-bookmark"></i> Bookmarks</a>
            <a href="/highlights" class="${title == 'Highlights' ? 'active' : ''}"><i class="bi bi-highlighter"></i> Highlights</a>
        </div>`;
    }
    if(area == 'feeds') {
        return `
        <div class="bottom-nav-links">
            <label for="sidebar-toggle"><i class="bi bi-list"></i></label>
            <a href="/feeds" class="${title == 'Feeds' ? 'active' : ''}"><i class="bi bi-rss"></i> Feeds</a>
            <a href="/feeds/entries" class="${title == 'Feed' || title == 'Feed Entry' ? 'active' : ''}"><i class="bi bi-card-list"></i> All</a>
            <a href="/feeds/starred" class="${title == 'Starred' ? 'active' : ''}"><i class="bi bi-star"></i> Starred</a>
            <a href="/feeds/recap" class="${title == 'Recap' ? 'active' : ''}"><i class="bi bi-journal-richtext"></i> Recap</a>
            ${context?.feedName ? `<a href="/feeds/${context.feedId}" class="active"><i class="bi bi-rss"></i> ${context.feedName}</a>` : ''}
        </div>`;
    }
    if(area == 'notes') {
        const notebooks = title == 'Notebooks' ? [] : (context?.notebooks || []);
        return `
        <div class="bottom-nav-links">
            <label for="sidebar-toggle"><i class="bi bi-list"></i></label>
            ${notebooks.map(nb =>
                `<a href="/notes/${nb.id}" class="${context?.notebookId == nb.id ? 'active' : ''}"><i class="bi bi-journal-text"></i> ${nb.title}</a>`
            ).join('')}
        </div>`;
    }
    if(area == 'bookshelves') {
        return `
        <div class="bottom-nav-links">
            <label for="sidebar-toggle"><i class="bi bi-list"></i></label>
            <a href="/bookshelves" class="${title == 'Bookshelves' ? 'active' : ''}"><i class="bi bi-book"></i> Bookshelves</a>
            <a href="/books" class="${title == 'Books' ? 'active' : ''}"><i class="bi bi-search-heart"></i> Discover</a>
            ${context?.shelfName ? `<a href="/bookshelves/shelf/${context.shelfId}" class="active"><i class="bi bi-bookshelf"></i> ${context.shelfName}</a>` : ''}
        </div>`;
    }
    let discoverActive = title != "Timeline" && title != "Mentions" && title != "Replies" && title != "following" && title != "muted" && title != "blocked";
    if(parseInt(title) || title.includes('User')) discoverActive = false;
    return `
        <div class="bottom-nav-links">
            <label for="sidebar-toggle"><i class="bi bi-list"></i></label>
            <a href="/" class="${title == 'Timeline' ? 'active' : ''}"><i class="bi bi-card-list"></i> Timeline</a>
            <a href="/discover" class="${discoverActive ? 'active' : ''}"><i class="bi bi-search"></i> Discover</a>
            <a href="/mentions" class="${title == 'Mentions' ? 'active' : ''}"><i class="bi bi-at"></i> Mentions<span class="mentions-badge" style="display:none;"></span></a>
            <a href="/replies" class="${title == 'Replies' ? 'active' : ''}"><i class="bi bi-reply"></i> Replies</a>
            <a href="/users/following" class="${title == 'following' || title == 'muted' || title == 'blocked' ? 'active' : ''}"><i class="bi bi-people"></i> Following</a>
        </div>`;
}

// Single source of truth for the HTML head — identical for logged-in and
// logged-out paths. Extracted so _pageShellStart's two branches don't
// duplicate the head block.
function _pageHead(title, redirect) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    ${redirect ? `<meta http-equiv="refresh" content="0; url=${redirect}" />` : ''}
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Lillihub - A delightful Micro.blog client">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <link rel="icon" href="/favicon.ico">
    <link rel="apple-touch-icon" sizes="180x180" href="/lillihub-512.png">
    <meta name="apple-mobile-web-app-status-bar-style" content="black">
    <meta name="theme-color" content="#11131a" media="(prefers-color-scheme: dark)">
    <meta name="theme-color" content="#eff1f5" media="(prefers-color-scheme: light)">
    <meta name="apple-mobile-web-app-title" content="Lillihub">
    <link rel="manifest" href="/manifest.webmanifest">
    <meta name="mobile-web-app-capable" content="yes">
    <script>(function(){try{var t=localStorage.getItem('lh-theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);var m=document.querySelector('meta[name=theme-color]:not([media])')||document.createElement('meta');m.setAttribute('name','theme-color');m.setAttribute('content',t==='light'?'#eff1f5':'#11131a');if(!m.parentNode)document.head.appendChild(m);}}catch(e){}})();</script>
    <style>${_lillihub}</style>
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
    <script>${_commonjs}</script>
</head>`;
}

// Single source of truth for the page shell. Returns everything from
// <!DOCTYPE> through the opening `<div class="content">` so that callers can
// either append more HTML and the closing tags (HTMLPage) or stream content
// chunks between start and end (HTMLPageStart / HTMLPageEnd).
//
// Two shapes:
//   - Logged-in: full app chrome (sidebar + page-nav + bottom-nav + FAB)
//   - Logged-out: minimal shell — just the body, for the landing page.
//     Streaming (HTMLPageStart) is only used by the timeline, which
//     requires a logged-in user, so the streaming path never sees the
//     logged-out shape.
function _pageShellStart(title, user, redirect, navContent, context) {
    const area = getArea(title);
    const head = _pageHead(title, redirect);

    if (!user || user.error) {
        // Minimal shell: no sidebar, no nav, no FAB. Just the content.
        return `${head}
<body id="top" class="area-${area} logged-out">
<div class="content">
`;
    }

    return `${head}
<body id="top" class="area-${area}">

<nav class="bottom-nav">
    ${BottomNavContent(user, title, area, context)}
</nav>
${FabAction(area, title, context)}

<div class="app">
    <input type="checkbox" id="sidebar-toggle" class="sidebar-toggle-checkbox">
    <aside class="sidebar">
        ${PrimaryAction(area, title, context)}

        <nav class="sidebar-nav">
            <a href="/" class="sidebar-nav-item sidebar-nav-social${area == 'social' ? ' active' : ''}">
                <i class="bi bi-card-list"></i> Timeline
            </a>
            <a href="/posts" class="sidebar-nav-item sidebar-nav-blog${area == 'blog' ? ' active' : ''}">
                <i class="bi bi-pencil-square"></i> Blog
            </a>
            <a href="/bookmarks" class="sidebar-nav-item sidebar-nav-bookmarks${area == 'bookmarks' ? ' active' : ''}">
                <i class="bi bi-bookmark"></i> Bookmarks
            </a>
            <a href="/feeds/entries" class="sidebar-nav-item sidebar-nav-feeds${area == 'feeds' ? ' active' : ''}">
                <i class="bi bi-rss"></i> Feeds
            </a>
            <a href="/bookshelves" class="sidebar-nav-item sidebar-nav-bookshelves${area == 'bookshelves' ? ' active' : ''}">
                <i class="bi bi-book"></i> Bookshelves
            </a>
            <a href="/notes" class="sidebar-nav-item sidebar-nav-notes${area == 'notes' ? ' active' : ''}">
                <i class="bi bi-journal"></i> Notebooks
            </a>
        </nav>

        <div class="sidebar-footer">
            <div class="sidebar-footer-row">
                <a href="/user/${user.username}" class="sidebar-user">
                    <span class="avatar avatar-sm"><img height="32" width="32" src="${user.avatar}" alt="${user.username}" loading="lazy"></span>
                    @${user.username}
                </a>
                <details class="sidebar-footer-menu">
                    <summary aria-label="More"><i class="bi bi-three-dots"></i></summary>
                    <ul>
                        <li><a href="/logout">Logout</a></li>
                        <li><a href="https://github.com/heyloura/lillihub-client">Github</a></li>
                        <li class="theme-picker-label hide-if-user-has-no-javascript"><small>Theme</small></li>
                        <li class="theme-picker hide-if-user-has-no-javascript">
                            <button type="button" class="theme-picker-btn" data-theme-choice="system"><i class="bi bi-circle-half"></i> System</button>
                            <button type="button" class="theme-picker-btn" data-theme-choice="light"><i class="bi bi-sun"></i> Light</button>
                            <button type="button" class="theme-picker-btn" data-theme-choice="dark"><i class="bi bi-moon-stars"></i> Dark</button>
                        </li>
                        <li class="hide-if-user-has-no-javascript"><a href="#" onclick="event.preventDefault();document.getElementById('kb-help').showModal()"><i class="bi bi-keyboard"></i> Keyboard shortcuts</a></li>
                        <li><small>v2.0</small></li>
                        <li><small>Built with ♥ by <a href="https://heyloura.com">Loura</a></small></li>
                    </ul>
                </details>
            </div>
        </div>
    </aside>

    <label for="sidebar-toggle" class="sidebar-overlay"></label>

    <div class="main">
        <nav class="page-nav">
            ${PageNavContent(user, area, title, navContent, context)}
        </nav>

        <div class="content">
`;
}

// Closing tags for the page shell. Must match the shape _pageShellStart
// opened — two variants for the logged-in and logged-out paths.
function _pageShellEnd(user) {
    if (!user || user.error) {
        return `
</div>
</body>
<style>.small-img{width:unset!important;margin-left:unset!important;}</style>
</html>`;
    }
    return `
        </div>
    </div>
</div>

<dialog id="kb-help" class="kb-help-dialog hide-if-user-has-no-javascript">
    <div class="kb-help-header">
        <strong>Keyboard shortcuts</strong>
        <button type="button" onclick="this.closest('dialog').close()" aria-label="Close"><i class="bi bi-x-lg"></i></button>
    </div>
    <div class="kb-help-body">
        <h3>Navigation</h3>
        <dl>
            <dt><kbd>j</kbd></dt><dd>Next post</dd>
            <dt><kbd>k</kbd></dt><dd>Previous post</dd>
            <dt><kbd>o</kbd></dt><dd>Open post</dd>
            <dt><kbd>r</kbd></dt><dd>Reply to post</dd>
        </dl>
        <h3>Feeds</h3>
        <dl>
            <dt><kbd>s</kbd></dt><dd>Open entry (to star)</dd>
            <dt><kbd>m</kbd></dt><dd>Toggle read/unread</dd>
        </dl>
        <h3>Paging</h3>
        <dl>
            <dt><kbd>n</kbd></dt><dd>Next page</dd>
            <dt><kbd>p</kbd></dt><dd>Previous page</dd>
        </dl>
        <h3>Other</h3>
        <dl>
            <dt><kbd>?</kbd></dt><dd>Toggle this help</dd>
        </dl>
    </div>
</dialog>

</body>
<style>.small-img{width:unset!important;margin-left:unset!important;}</style>
</html>`;
}

// Render a complete page in one go. `token` is currently unused but kept in
// the signature for caller compatibility (every layout passes it positionally).
export async function HTMLPage(token, title, contentHTML, user, redirect = '', navContent, context) {
    return _pageShellStart(title, user, redirect, navContent, context) +
        contentHTML +
        _pageShellEnd(user);
}

// Streaming helpers: emit the start, then content chunks, then the end.
// Used by the timeline route for progressive rendering. The timeline
// always has a logged-in user, so the streaming path uses the full-chrome
// shell.
export function HTMLPageStart(token, title, user, redirect = '', navContent, context) {
    return _pageShellStart(title, user, redirect, navContent, context);
}

export function HTMLPageEnd(user) {
    return _pageShellEnd(user);
}
