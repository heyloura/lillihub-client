import { DOMParser } from "npm:linkedom";
export function settingsHTML() {
    return `
        <div class="card mb-2">
            <div class="card-body">
                <div id="posting">
                    <h2>Display Options</h2>
                    <div class="form-group">
                        <label class="form-checkbox">
                            <input type="checkbox" id="showBlog" checked>
                            <i class="form-icon"></i> Show the 'Blog' link
                        </label><br/>
                        <label class="form-checkbox">
                            <input type="checkbox" id="showBlog" checked>
                            <i class="form-icon"></i> Show the 'Bookmarks' link
                        </label><br/>
                        <label class="form-checkbox">
                            <input type="checkbox" id="showBlog" checked>
                            <i class="form-icon"></i> Show the 'Bookshelves' link
                        </label><br/>
                        <label class="form-checkbox">
                            <input type="checkbox" id="showBlog" checked>
                            <i class="form-icon"></i> Show the 'Notes' link
                        </label><br/>
                        </div>
                    <button class="btn btn-primary savePostingSettings">Save</button>
                    <div id="saveDisplaySettings" class="toast toast-dark hide">
                        <button class="btn btn-clear float-right saveDisplaySettings"></button>
                        Settings have been saved.
                    </div>  
                </div>

            </div>
        </div>
        <!--<div class="card mb-2">
            <div class="card-body">
                <div id="posting">
                    <h2>Discovery Options</h2>
                    <p>
                        Micro.blog has a person-curated discover feed of posts by Micro.blog users.
                        By defualt, Lillihub uses this feed in the discover section. You can change this
                        to use Lillihub's custom feed, which is a chronological display of Micro.blog posts.
                    </p>
                    <div class="form-group">
                        <label class="form-radio">
                            <input checked type="radio" id="defaultDiscoverFeed" value="standard" name="discoverOption">
                            <i class="form-icon"></i> Default Micro.blog discover feed
                        </label>
                        <label class="form-radio">
                            <input type="radio" id="customDiscoverFeed" value="custom" name="discoverOption">
                            <i class="form-icon"></i> Custom discover feed
                        </label>
                        </div>
                    <button class="btn btn-primary saveDiscoverSetting">Save</button>
                    <div id="saveDiscoverSettingToast" class="toast toast-dark hide">
                        <button class="btn btn-clear float-right dismissSaveDiscoverSettingToast"></button>
                        Settings have been saved.
                    </div>  
                </div>

            </div>
        </div>-->
        <div class="card mb-2">
            <div class="card-body">
                <div id="private-notes">
                    <h2>Micro.blog Private Notes</h2>
                    <p>
                        Micro.blog has private notes. If you haven't configured them yet you will need
                        to do so at <a target="_blank" href="https://micro.blog/account/notes/settings">https://micro.blog/account/notes/settings</a>.
                        Once you have your secret key you will need to share it with Lillihub to sync your notes.
                        Lillihub saves this key in your browser's storage and it is never passed to the server. You can verify this
                        by viewing the source code.
                    </p>
                    <p>Notes are encrypted in the browser before sending them to the server, so neither Lillihub nor Micro.blog sees the note text.</p>
                    <input type="password" id="mbKey">
                    <button class="btn btn-primary savePrivateNotesKey">Save</button><br/>
                    <button class="btn btn-danger deletePrivateNotesKey">Delete</button>
                    <div id="savePrivateNotesKeyToast" class="toast toast-dark hide">
                        <button class="btn btn-clear float-right dismissSavePrivateNotesKeyToast"></button>
                        Secret Key have been saved.
                    </div>  
                    <div id="deletePrivateNotesKeyToast" class="toast toast-dark hide">
                        <button class="btn btn-clear float-right dismissDeletePrivateNotesKeyToast"></button>
                        Secret Key have been removed.
                    </div>
                </div>

            </div>
        </div>
        <div class="card mt-2 mb-2">
            <div class="card-body">
                <div id="posting">
                    <h2>Posting Options</h2>
                    <p>
                        Lillihub supports multiple posting options. If choosing a posting option other than
                        Micro.blog please select the option below and configure it. For posts to appear on 
                        the timeline feed they must be configured as <a href="https://micro.blog/account/feeds">Micro.blog account feeds</a>.
                    </p>
                    <div class="form-group">
                            <label class="form-radio">
                                <input type="radio" name="postWith" value="none" checked>
                                <i class="form-icon"></i> None
                            </label>
                            <label class="form-radio">
                                <input type="radio" name="postWith" value="mb" checked>
                                <i class="form-icon"></i> Micro.blog
                            </label>
                            <label class="form-radio">
                                <input type="radio" name="postWith" value="statuslog">
                                <i class="form-icon"></i> omg.lol statuslog (configure below)
                            </label>
                            <label class="form-radio">
                                <input type="radio" name="postWith" value="weblog">
                                <i class="form-icon"></i> omg.lol weblog (configure below)
                            </label>
                            <label class="form-radio">
                                <input type="radio" name="postWith" value="micropub">
                                <i class="form-icon"></i> Micropub enabled blog (configure below)
                            </label>
                    </div>
                    <button class="btn btn-primary savePostingSettings mb-2">Save</button>
                    <div id="postingSettingsToast" class="toast toast-dark hide mt-2">
                        <button class="btn btn-clear float-right dismissPostingSettingsToast"></button>
                        Settings have been saved.
                    </div>  
                    <br/>
                    <hr/>

                    <h3 class="mt-2 mb-2">omg.lol services:</h3>
                    <p>Make sure you have <code>https://[your-address].status.lol/feed</code> wired up with Micro.blog</p>
                    <p>Note: your address does NOT include the '@omg.lol' portion</p>
                    <div class="form-horizontal mt-2">
                        <div class="form-group">
                            <div class="col-3 col-sm-12">
                            <label class="form-label" for="omg-address">omg.lol address</label>
                            </div>
                            <div class="col-9 col-sm-12">
                            <input class="form-input" type="text" id="omg-address" placeholder="">
                            </div>
                        </div>
                        <div class="form-group">
                            <div class="col-3 col-sm-12">
                                <label class="form-label" for="omg-api">omg.lol API key</label>
                            </div>
                            <div class="col-9 col-sm-12">
                                <input class="form-input" type="password" id="omg-api" placeholder="">
                            </div>
                        </div> 
                        <div class="form-group">
                            <div class="col-9 col-sm-12 col-ml-auto">
                                <button class="btn btn-link deleteOmgStorage">Delete</button>
                                <button class="btn btn-primary saveOmgStorage">Save</button>
                            </div>
                        </div>
                        <div id="saveOmgToast" class="toast toast-dark hide">
                            <button class="btn btn-clear float-right dismissOmgToast"></button>
                            Settings have been saved.
                        </div>        
                    </div>  
                    <br/>
                    <hr/>
                    <div class="form-horizontal">
                        <div class="form-group">
                            <div class="col-3 col-sm-12">
                                <label class="form-label" for="indieauth-nickname">Nickname</label>
                            </div>
                            <div class="col-9 col-sm-12">
                                <input class="form-input" type="text" id="indieauth-nickname" placeholder="For UI display purposes...">
                            </div>
                            </div>
                        <div class="form-group">
                            <div class="col-3 col-sm-12">
                            <label class="form-label" for="indieauth-endpoint">Indieauth endpoint</label>
                            </div>
                            <div class="col-9 col-sm-12">
                            <input class="form-input" type="url" id="indieauth-endpoint" placeholder="https://...">
                            </div>
                        </div>
                        <div class="form-group">
                            <input type="hidden" name="client_id" value="{{appURL}}"/>
                            <input type="hidden" name="redirect_uri" value="{{appURL}}/auth"/>
                            <input type="hidden" name="state" value="{{state}}"/>
                            <input type="hidden" name="scope" value="create"/>
                            <input type="hidden" name="response_type" value="code"/>                                
                            <div class="col-9 col-sm-12 col-ml-auto">
                                <button class="btn btn-primary">Check indieauth and get token</button>
                            </div>
                        </div>
                        <div class="form-group">
                            <div class="col-3 col-sm-12">
                                <label class="form-label" for="micropub-endpoint">Micropub endpoint</label>
                            </div>
                            <div class="col-9 col-sm-12">
                                <input class="form-input" type="url" id="micropub-endpoint" placeholder="https://...">
                            </div>
                        </div>
                        
                    </div>      
                </div>

            </div>
        </div>
    `;
}

export function discoverHTML(posts, tagmoji, id) {
    return `
        <div class="container grid-xl">
            <div class="columns">
                <div class="column col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-3 col-3">
                    <!--<div class="form-group">
                        <label class="form-label">Search for featured posts.</label>
                        <div class="input-group">
                            <input id="searchPost" type="text" class="form-input" placeholder="...">
                            <button class="btn btn-primary input-group-btn searchPost"><i class="icon icon-search searchPost"></i></button>
                        </div>
                    </div>-->
                    <div>
                        ${tagmoji.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0)).map((item) =>
                            `<span class="chip ${item.name}Link"><a class="${item.name}LinkAnchor" rel="prefetch" swap-target="#main" swap-history="true" href="/discover/${item.name}">${item.emoji} ${item.title}</a></span>`
                        ).join('')}  
                    </div>
                </div>
                <div class="column col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-9 col-9">
                    ${posts.items.map(n => postHTML(n)).join('')}
                </div>
            </div>
        </div>
    `;
}

export function blogHeader(active) {
    return `
        <ul class="tab tab-block footerBar">
            <li class="tab-item ${active == 'blog' ? 'active' : ''} text-blue">
                <a rel="prefetch" swap-target="#main" swap-history="true" href="/blog"><i class="icon icon-emoji"></i> Blog</a>
            </li>
            <li class="tab-item ${active == 'draft' ? 'active' : ''} text-blue">
                <a rel="prefetch" swap-target="#main" swap-history="true" href="/drafts"><i class="icon icon-edit"></i> Drafts</a>
            </li>
            <li class="tab-item ${active == 'uploads' ? 'active' : ''} text-blue">
                <a rel="prefetch" swap-target="#main" swap-history="true" href="/uploads"><i class="icon icon-photo"></i> Uploads</a>
            </li>
            <li class="tab-item ${active == 'pages' ? 'active' : ''} text-blue">
                <a rel="prefetch" swap-target="#main" swap-history="true" href="/pages"><i class="icon icon-copy"></i> Pages</a>
            </li>
            <li class="tab-item ${active == 'webmentions' ? 'active' : ''} text-blue">
                <a rel="prefetch" swap-target="#main" swap-history="true" href="/webmentions"><i class="icon icon-share"></i> Mentions</a>
            </li>
        </ul>
    `;
}

export function timelineHeader(active) {
    return `
        <ul class="tab tab-block footerBar">
            <li class="tab-item ${active == 'timeline' ? 'active' : ''} text-yellow">
                <a rel="prefetch" swap-target="#main" swap-history="true" href="/timeline"><i class="icon icon-time"></i> Timeline</a>
            </li>
            <li class="tab-item ${active == 'discover' ? 'active' : ''} text-yellow">
                <a rel="prefetch" swap-target="#main" swap-history="true" href="/discover"><i class="icon icon-search"></i> Discover</a>
            </li>
            <li class="tab-item ${active == 'mentions' ? 'active' : ''} text-yellow">
                <a rel="prefetch" swap-target="#main" swap-history="true" href="/mentions"><i class="icon icon-mail"></i> Mentions</a>
            </li>
            <li class="tab-item ${active == 'replies' ? 'active' : ''} text-yellow">
                <a rel="prefetch" swap-target="#main" swap-history="true" href="/replies"><i class="icon icon-message"></i> Replies</a>
            </li>
            <li class="tab-item ${active == 'following' ? 'active' : ''} text-yellow">
                <a rel="prefetch" swap-target="#main" swap-history="true" href="/following"><i class="icon icon-people"></i> Following</a>
            </li>
        </ul>
    `;
}

export function timelineHTML(posts, lastId) {
    return `
    <div>
        ${posts}
        ${lastId ? `<p class="text-center m-2 p-2"><a rel="prefetch" swap-target="#main" swap-history="true" href="/timeline/${lastId}">Load More</a></p>` : ''}
    </div>
    `;
}

function flattenedNote(note) {
    return {
        id: note ? note.id: 0,
        title: note ? note.title: "",
        content_text: note ? note.content_text: "",
        content_html: note ? note.content_html: "",
        url: note ? note.url: "",
        published: note ? note.date_published: "",
        modified: note ? note.date_modified: "",
        encrypted: note && note._microblog ? note._microblog.is_encrypted : false,
        shared: note && note._microblog ? note._microblog.is_shared : false,
        shared_url: note && note._microblog ? note._microblog.shared_url : '',
    }
}

export async function noteHTML(note, notebookId, versions) {
    const n = flattenedNote(note);
    return `                
        ${n.shared ? `<p><mark>This note is shared.</mark><br/><a target="_blank" href="${n.shared_url}">${n.shared_url}</a></p>` : ''}
        <p id="tags-${n.id}"></p>
        <div class="card no-border pages">
            <div id="edit">
                ${await getNoteEditor(notebookId,n)}
            </div>
            <div class="card-body">
                <div id="preview"></div>
            </div>
        </div>
        <div id="note-details" class="hide">
            <div class="divider" data-content="Note Metadata + Details"></div>
            <div>
                <table id="metadata-${n.id}" class="table table-striped">
                    <tr><td>id</td><td>${n.id}</td></tr>
                    <tr><td>published</td><td>${(new Date(n.published).toLocaleString('en-US', { timeZoneName: 'short' })).split(',')[0]}</td></tr>
                    <tr><td>modified</td><td>${(new Date(n.published).toLocaleString('en-US', { timeZoneName: 'short' })).split(',')[0]}</td></tr>
                    <tr><td>encrypted</td><td>${n.encrypted}</td></tr>
                    <!--<tr><td>shared</td><td>${n.shared ? `<button data-id="${n.id}" class="btn btn-error unShareNote" type="button">Unshare note</button>` : `<button data-id="${n.id}" class="btn shareNote" type="button">Share note</button>`}</td></tr>-->
                    <tr><td>shared</td><td>${n.shared ? `Yes` : `No`}</td></tr>
                </table><br/>
            </div>
            <div class="divider mt-2 pt-2" data-content="Versions"></div>
            <table class="table table-striped">
            ${versions.reverse().map((v, i) => `<tr>
                <td>${(new Date(v.date_published).toLocaleString('en-US', { timeZoneName: 'short' })).replace(' UTC','')}</td>
                <td><a rel="prefetch" swap-target="#main" swap-history="true" href="/notebooks/${notebookId}/notes/${n.id}/versions/${v.id}">${v.id}</a>${i == 0 ? ' (current)' : ''}</td>
            </tr>`).join('')}
            </table><br/>
            <details class="accordion">
                <summary class="accordion-header">
                    <i class="icon icon-arrow-right mr-1"></i>
                    Advanced
                </summary>
                <div class="accordion-body">
                    <p class="text-center"><button data-id="${n.id}" class="btn btn-error btn-sm deleteNote" type="button">Delete Note</button></p>
                </div>
            </details>
        </div>
    `;
}

async function getNoteEditor(notebookId, n) {
    return `
        <input data-id="${ n ? n.id : 'newNote'}" id="noteContent" class="${n && n.shared ? '' : 'decryptMe'}" type="hidden" value="${n ? n.content_text : ''}" />
        <input id="noteId" type="hidden" value="${n ? n.id : 0}" />
        ${await getEditor()}
    `;
}

export function getBlogSelect(config, mpDestination, id) {
    const destinations = config.destination ? config.destination.map(item => {
        if(item.uid != mpDestination) {
            return `<li class="menu-item"><a class="changeDestination" href="?destination=${encodeURIComponent(item.uid)}">${item.name}</a></li>`;
        }
    }).join('') : '';

    return `<div id="${id}" class="dropdown" data-destination="${config.destination.filter(d => d.uid == mpDestination)[0].uid}">
                    <button type="button" class="btn btn-link dropdown-toggle" tabindex="0">
                        <span id="postingName">${config.destination.filter(d => d.uid == mpDestination)[0].name}</span> <i class="icon icon-caret"></i>
                    </button>
                    <ul id="${id}Menu" class="menu bg-dark">
                        ${destinations}
                    </ul>
                    <input name="destination" type="hidden" value="${mpDestination}"> 
                </div>`;
}

export async function getEditor(repliers, username, mbToken, destination, name, content, url, cats, status) {
    let destinations = '';
    let syndicates = '';
    let categoriesList = '';
    let mpDestination = '';

    if(mbToken) {
        let fetching = await fetch(`https://micro.blog/micropub?q=config`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
        const config = await fetching.json();
    
        const defaultDestination = config.destination.filter(d => d["microblog-default"])[0] ? config.destination.filter(d => d["microblog-default"])[0].uid : config.destination[0].uid;
        mpDestination = destination ? destination : defaultDestination;

        destinations = getBlogSelect(config, mpDestination, 'destinationDropdown');
    
        fetching = await fetch(`https://micro.blog/micropub?q=syndicate-to&mp-destination=${encodeURIComponent(mpDestination)}`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
        const syndicate = await fetching.json();
    
        syndicates = syndicate["syndicate-to"] ? syndicate["syndicate-to"].map(item => {
            return `<li class="menu-item"><label>
                    <input class="syndicateChange" type="checkbox" name="syndicate[]" value="${item.uid}" checked="checked"> ${item.name}
                    </label></li>`;
        }).join('') : '';

        
        syndicates = `<div class="dropdown">
                        <button type="button" class="btn btn-link dropdown-toggle">
                            <span id="syndicatesDropdown" class="badge" data-badge="${syndicate["syndicate-to"].length}"><i class="icon icon-copy"></i></span>
                        </button>
                        <ul id="syndicatesSelectMenu" class="menu bg-dark">
                            ${syndicates}
                        </ul>
                    </div>`;

        fetching = await fetch(`https://micro.blog/micropub?q=category&mp-destination=${encodeURIComponent(mpDestination)}`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
        const categories = await fetching.json();
    
        categoriesList = categories.categories ? categories.categories.map(item => {
            return `<li class="menu-item"><label>
                    <input class="categoriesChange" type="checkbox" name="category[]" value="${item}" ${cats && cats.includes(item) ? 'checked="checked"' : ''}> ${item}
                    </label></li>`;
        }).join('') : '';

        categoriesList = `<div class="dropdown">
                <button type="button" class="btn btn-link dropdown-toggle">
                    <span id="categoriesDropdown"><i class="icon icon-bookmark"></i></span>
                </button>
                <ul id="categoriesSelectMenu" class="menu bg-dark">
                    ${categoriesList}
                </ul>
            </div>`;
    }


    return `
        <dialog id="dialog-post">
            <nav class="wrap">
                <h6>Create a post on</h6><div class="field border label l m">
                    <input placeholder=" "><label>Community</label>
                    <i class="tiny">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-caret-down-fill" viewBox="0 0 16 16">
                            <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                        </svg>
                    </i>
                    <menu>
                        ${destinations}
                        <li><i class="tiny">people</i><span>r/svelte</span></li>
                        <li><i class="tiny">people</i><span>r/svelte</span></li>
                        <li><i class="tiny">people</i><span>r/svelte</span></li>
                    </menu>
                </div>
            </nav>
            <div class="medium-space l m"></div>
            <div class="medium-height large-width">
                <div class="tabs scroll left-align l m">
                    <a data-ui="#post" tabindex="0" class="active"><i>news</i><span>Post</span></a>
                    <a data-ui="#image-video" tabindex="0" class=""><i>image</i><span>Image &amp; Video</span></a>
                    <a data-ui="#link" tabindex="0" class=""><i>link</i><span>Link</span></a>
                    <a class="grey-text"><i>insert_chart</i><span>Pool</span></a>
                </div>
                <div class="medium-space"></div>
                <div class="page top active" id="post">
                    <div class="field border label s">
                        <input placeholder=" "><label>Community</label><i>arrow_drop_down</i><menu><li><i class="tiny">people</i><span>r/svelte</span></li><li><i class="tiny">people</i><span>r/svelte</span></li><li><i class="tiny">people</i><span>r/svelte</span></li></menu></div><div class="field border label"><input placeholder=" "><label>Title</label></div><div class="field border label extra textarea"><textarea placeholder=" "></textarea><label>Text (optional)</label></div></div><div class="page top" id="image-video"><div class="field border label s"><input placeholder=" "><label>Community</label><i>arrow_drop_down</i><menu><li><i class="tiny">people</i><span>r/svelte</span></li><li><i class="tiny">people</i><span>r/svelte</span></li><li><i class="tiny">people</i><span>r/svelte</span></li></menu></div><div class="row"><div class="max"><div class="field border label"><input placeholder=" "><label>Title</label></div></div><button><span>Select a file</span><input type="file"></button></div></div><div class="page top" id="link"><div class="field border label s"><input placeholder=" "><label>Community</label><i>arrow_drop_down</i><menu><li><i class="tiny">people</i><span>r/svelte</span></li><li><i class="tiny">people</i><span>r/svelte</span></li><li><i class="tiny">people</i><span>r/svelte</span></li></menu></div><div class="field border label"><input placeholder=" "><label>Title</label></div><div class="field border label"><textarea></textarea><label>Url</label></div></div><div class="page top" id="pool"></div></div><footer class="fixed"><nav class="right-align"><button class="border" data-ui="#dialog-post">Cancel</button><button data-ui="#dialog-post">Confirm</button></nav></footer>
        </dialog>
        <!--<form id="editor" class="card no-border">
            <input type="hidden" name="postingType" id="postingType" />
            <input type="hidden" name="omgApi" id="omgApi" />
            <input type="hidden" name="omgAddess" id="omgAddess" />
            <input type="hidden" name="indieToken" id="indieToken" />
            <input type="hidden" name="microPub" id="microPub" />
            <input type="hidden" name="id" id="postId" />
            <input type="hidden" name="destination" value="${mpDestination}" />
            <input type="hidden" name="url" value="${url}" />
            <div id="editor-container">
                <div id="editor-replybox" class="hide">${getReplyBox(repliers)}</div>
                <input type="text" placeholder="title (optional)" class="form-input mb-2" name="name" id="postName" value="${name ? name : ''}" />
                <div class="grow-wrap">
                    <textarea name="content" rows="10" id="content" id="post" class="form-input grow-me">${content ? content : ''}</textarea>
                </div>
            </div>
            <div id="editor-footer">
                <nav class="no-space small" id="markdownBtns">
                    <button id="editor-bold-btn" type="button" class="transparent editor-bold no-round small">
                        <i class="small editor-bold"">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-type-bold" viewBox="0 0 16 16">
                                <path d="M8.21 13c2.106 0 3.412-1.087 3.412-2.823 0-1.306-.984-2.283-2.324-2.386v-.055a2.176 2.176 0 0 0 1.852-2.14c0-1.51-1.162-2.46-3.014-2.46H3.843V13zM5.908 4.674h1.696c.963 0 1.517.451 1.517 1.244 0 .834-.629 1.32-1.73 1.32H5.908V4.673zm0 6.788V8.598h1.73c1.217 0 1.88.492 1.88 1.415 0 .943-.643 1.449-1.832 1.449H5.907z"/>
                            </svg>
                        </i>
                    </button>
                    <button id="editor-italic-btn" type="button" class="no-round transparent editor-italic small">
                        <i class="editor-italic small">
                            <svg class="editor-italic" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-type-italic" viewBox="0 0 16 16">
                                <path d="M7.991 11.674 9.53 4.455c.123-.595.246-.71 1.347-.807l.11-.52H7.211l-.11.52c1.06.096 1.128.212 1.005.807L6.57 11.674c-.123.595-.246.71-1.346.806l-.11.52h3.774l.11-.52c-1.06-.095-1.129-.211-1.006-.806z"/>
                            </svg>
                        </i>
                    </button>
                    <button id="editor-code-btn" type="button" class="no-round transparent editor-code small">
                        <i class="small editor-code">
                            <svg class="editor-code" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-code" viewBox="0 0 16 16">
                            <path d="M5.854 4.854a.5.5 0 1 0-.708-.708l-3.5 3.5a.5.5 0 0 0 0 .708l3.5 3.5a.5.5 0 0 0 .708-.708L2.707 8zm4.292 0a.5.5 0 0 1 .708-.708l3.5 3.5a.5.5 0 0 1 0 .708l-3.5 3.5a.5.5 0 0 1-.708-.708L13.293 8z"/>
                            </svg>
                        </i>
                    </button>
                    <button id="editor-upload-btn" type="button" class="no-round transparent editor-upload small">
                        <i class="tiny editor-upload">
                            <svg class="editor-upload" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-upload" viewBox="0 0 16 16">
                            <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5"/>
                            <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708z"/>
                            </svg>
                        </i>
                    </button>
                    <button type="button" class="no-round transparent small">
                        <i class="tiny">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-link" viewBox="0 0 16 16">
                            <path d="M6.354 5.5H4a3 3 0 0 0 0 6h3a3 3 0 0 0 2.83-4H9q-.13 0-.25.031A2 2 0 0 1 7 10.5H4a2 2 0 1 1 0-4h1.535c.218-.376.495-.714.82-1z"/>
                            <path d="M9 5.5a3 3 0 0 0-2.83 4h1.098A2 2 0 0 1 9 6.5h3a2 2 0 1 1 0 4h-1.535a4 4 0 0 1-.82 1H12a3 3 0 1 0 0-6z"/>
                            </svg>
                        </i>
                        <menu>
                            <li class="editor-image"><a id="editor-image-markdown-btn" class="editor-image" href="#">image</a></li>
                            <li><a id="editor-link-markdown-btn" class="editor-link" href="#">link</a></li>
                        </menu>
                    </button>
                    <button id="editor-preview-btn" type="button" class="no-round transparent editor-preview">preview</button>
                </nav>
                
                <div class="btn-group float-right">
                    <select id="postStatus" name="status" class="form-select">
                        <option value="publish" ${status && status != 'draft' ? 'selected="selected"' : ''}>Publish</option>
                        <option value="draft" ${status && status == 'draft' ? 'selected="selected"' : ''}>Draft</option>
                    </select>
                    <button id="editor-action" type="button" class="btn btn-primary">Post</button>
                </div>
                
                <div id="topBarBtns" class="btn-group">
                    ${destinations}
                    <button type="button" class="circle transparent toggleMainReplyBox"><i class="icon icon-people toggleMainReplyBox"></i></button> 
                    <div id="postingBtns" class="btn-group"> 
                        ${categoriesList}
                        ${syndicates}
                    </div>
                </div>
                <br/>
                <p id="editor-status"></p>
                <p><b>Note:</b> file upload is limited to 3MB.</p>
            </div>   
        </form>-->
    `;
}

export function flattenedBlogPost(post) {
    return {
        type: post && post.type ? post.type : '',
        uid: post && post.properties && post.properties.uid && post.properties.uid[0] ? post.properties.uid[0] : '',
        name: post && post.properties && post.properties.name && post.properties.name[0] ? post.properties.name[0] : '',
        content: post && post.properties && post.properties.content && post.properties.content[0] ? post.properties.content[0] : '',
        published: post && post.properties && post.properties.published && post.properties.published[0] ? post.properties.published[0] : '',
        status: post && post.properties && post.properties["post-status"] && post.properties["post-status"][0] ? post.properties["post-status"][0] : '',
        url: post && post.properties && post.properties.url && post.properties.url[0] ? post.properties.url[0] : '',
        category: post && post.properties && post.properties.category ? post.properties.category : [],
    };
}

function blogHTML(post, destination) {
    const b = flattenedBlogPost(post);
    return `<article class="bookmark card p-2 mb-2" 
            data-uid="${b.uid}"  
            data-url="${b.url}"
            data-published="${b.published}">    
            ${b.name ? `
                <span id="title-${b.uid}" class="fakeAnchor h5 d-block">
                    ${b.name}
                </span> ` : ``}                      
            <main data-id="${b.uid}" class="card-subtitle p-0 pt-2 pb-2 markdown ${b.name ? "hasTitle" : ""} ${b.content.includes('<img') || b.content.includes('![') ? "hasImages" : ""}">${b.content}</main>
            <div class="card-footer pl-0">
                <input type="hidden" id="${b.uid}-markdown" />
                <div class="card-subtitle">
                <a target="_blank" href="${b.url}">${(new Date(b.published).toLocaleString('en-US', { timeZoneName: 'short' }))}</a>
                ${b.category ? b.category.sort().map((item) =>
                    `#${item} `
                ).join('') : ''}
                </div>
                <div class="dropdown">
                    <button type="button" class="btn btn-link btn-action dropdown-toggle" tabindex="0">
                        <i class="icon icon-caret"></i>
                    </button>
                    <ul class="menu bg-dark">
                        <li class="menu-item"><a rel="prefetch" href="/blog/edit/${encodeURIComponent(b.url)}?destination=${encodeURIComponent(destination)}" swap-history="true" swap-target="#main" class="btn btn-link">Edit Post</a></li>
                        <li class="menu-item"><button data-id="${b.uid}" type="button" class="btn btn-link previewBlogPost">Preview Post</button></li>
                    </ul>
                </div>
            </div>      
        </article>
    `;
}

export function getBlogHTML(posts, config, mpDestination, categories, clear) {
    return `
    <div class="container grid-xl">
            <div class="columns">
                <div class="column col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-3 col-3">
                ${getBlogSelect(config, mpDestination, 'destinationsSwitch')}
                    <div class="form-group">
                        <label class="form-label">Search your blog</label>
                        <div class="input-group">
                            <input id="searchBlog" type="text" class="form-input">
                            <button class="btn btn-primary input-group-btn searchBlog"><i class="icon icon-search searchBlog"></i></button>
                        </div>
                    </div>
                    <div>
                        ${categories.categories ? categories.categories.sort().map((item) =>
                            `<span class="chip ${item}Link"><a class="${item}" rel="prefetch" swap-target="#main" swap-history="true" href="/blog?category=${item}">${item}</a></span>`
                        ).join('') : ''} 
                    </div>
                    ${ clear ? `<p class="text-center"><a class="btn btn-link" rel="prefetch" swap-target="#main" swap-history="true" href="/blog?destination=${encodeURIComponent(mpDestination)}" >clear filters</a></p>` : ''}
                </div>
                <div class="column col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-9 col-9">
                    ${posts.map((p) => `${blogHTML(p, mpDestination)}`).join('')}
                </div>
            </div>
        </div>
    <div>
    `;
}

export function flattenedCollection(post) {
    return {
        type: post && post.type ? post.type : '',
        uid: post && post.properties && post.properties.uid && post.properties.uid[0] ? post.properties.uid[0] : '',
        name: post && post.properties && post.properties.name && post.properties.name[0] ? post.properties.name[0] : '',
        url: post && post.properties && post.properties.url && post.properties.url[0] ? post.properties.url[0] : '',
        count: post && post.properties && post.properties['microblog-uploads-count'] ? post.properties['microblog-uploads-count'] : 0,
    };
}

export function flattenedUpload(post) {
    return {
        alt: post && post.alt ? post.alt : '',
        url: post && post && post.url ? post.url : '',
        published: post && post && post.published ? post.published : '',
        large: post && post && post.sizes && post.sizes.large ? post.sizes.large  : '',
        medium: post && post && post.sizes && post.sizes.medium ? post.sizes.medium  : '',
        small: post && post && post.sizes && post.sizes.small ? post.sizes.small  : '',
        cdnLarge: post && post && post.cdn && post.cdn.large ? post.cdn.large  : '',
        cdnMedium: post && post && post.cdn && post.cdn.medium ? post.cdn.medium  : '',
        cdnSmall: post && post && post.cdn && post.cdn.small ? post.cdn.small  : '',
    };
}

function uploadHTML(post, destination) {
    const b = flattenedUpload(post);
    return `<article class="upload card p-2 mb-2" 
            data-published="${b.published}"  
            data-url="${b.url}">                      
            <main class="p-0 pt-2 pb-2">
                ${b.url.includes('.png') || b.url.includes('.jpeg') || b.url.includes('.jpg') || b.url.includes('.gif') || b.url.includes('.webp') ?
                    `<img alt="${b.alt}" data-url="${b.url}" class="enlarge c-hand" src="${b.cdnSmall ? b.cdnSmall : 
                        b.small ? b.small : 
                        b.cdnMedium ? b.cdnMedium : 
                        b.medium ? b.medium : 
                        b.cdnLarge ? b.cdnLarge : 
                        b.large ? b.large : b.url
                    }" ${b.alt ? b.alt : ''} />` : '' }
                ${b.url.includes('.pdf') ? `<embed src="${b.url}" />` : ''}
                ${b.url.includes('.svg') ? `<object data="${b.url}" type="image/svg+xml"></object>` : ''}
                ${b.url.includes('.mp4') || b.url.includes('.webm') || b.url.includes('.ogg') ? `<video controls>
                    <source src="${b.url}" type="video/${b.url.split('.')[b.url.split('.').length - 1]}" />
                    </video>` : ''}
            </main>
            <div class="card-footer pl-0">
                <div class="card-subtitle">
                    <a target="_blank" href="${b.url}">${(new Date(b.published).toLocaleString('en-US', { timeZoneName: 'short' }))}</a>
                </div>
                <div class="dropdown">
                    <button type="button" class="btn btn-link btn-action dropdown-toggle" tabindex="0">
                        <i class="icon icon-caret"></i>
                    </button>
                    <ul class="menu bg-dark">
                        
                        <li class="menu-item"><button class="btn btn-link" type="button">Add to collection</button></li>
                        <li class="divider"></li>
                        <li class="menu-item"><button data-url="${b.url}" data-destination="${destination}" class="btn btn-link text-danger deleteUpload" type="button">Delete</button></li>
                    </ul> 
                </div>
            </div>      
        </article>
    `;
}

export function getUploadHTML(posts, config, mpDestination, fileExtensions, clear, collectionNames) {
    return `
    <div class="container grid-xl">
            <div class="columns">
                <div class="column col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-3 col-3">
                ${getBlogSelect(config, mpDestination, 'destinationsSwitch')}
                    <div class="form-group">
                        <label class="form-label">Search your uploads</label>
                        <div class="input-group">
                            <input id="searchUploads" type="text" class="form-input">
                            <button class="btn btn-primary input-group-btn searchUploads"><i class="icon icon-search searchUploads"></i></button>
                        </div>
                    </div>
                    <div>
                        ${fileExtensions ? fileExtensions.sort().map((item) =>
                            `<span class="chip ${item}Link"><a rel="prefetch" swap-target="#main" swap-history="true" href="/uploads?type=${item}">${item}</a></span>`
                        ).join('') : ''} 
                    </div>
                    ${collectionNames ? `<div class="divider"></div>` : ''}
                    ${collectionNames ? collectionNames.sort((a,b) => (a.properties.name[0] > b.properties.name[0]) ? 1 : ((b.properties.name[0] > a.properties.name[0]) ? -1 : 0)).map((item) =>
                        `<span class="chip"><a rel="prefetch" swap-target="#main" swap-history="true" href="/uploads?collection=${item.properties.uid[0]}">${item.properties.name[0]}</a></span>`
                    ).join('') : ''}
                    ${ clear ? `<p class="text-center"><a class="btn btn-link" rel="prefetch" swap-target="#main" swap-history="true" href="/uploads?destination=${encodeURIComponent(mpDestination)}" >clear filters</a></p>` : ''}
                </div>
                <div class="column col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-9 col-9">                 
                    ${posts.map((p) => `${uploadHTML(p, mpDestination)}`).join('')}
                </div>
            </div>
        </div>
    <div>
    `;
}

export async function editHTML(post, repliers, username, mbToken, destination) {
    const b = flattenedBlogPost(post);
    return `                
        <div class="card no-border pages">
            ${await getEditor(repliers, username, mbToken, destination, b.name, b.content, b.url, b.category, b.status)}
        </div>
    `;
}

export function getNotebookHTML(notes, notebookId) {
    return `
    <div>
        <p id="privateKeyWarning">
            Looks like you don't have your secret key set up in Lillihub.
            Please add it under <a rel="prefetch" swap-target="#main" swap-history="true" href="/settings">settings</a> and then return to this page.
        </p>
        <div class="form-group">
            <label class="form-label">Search your notebook</label>
            <input data-element="article" list="tags" id="search" type="text" class="form-input search" placeholder="...">
            <datalist id="tags"></datalist>
        </div>
        ${notes.map((n,i) => `${notesHTML(n,notebookId)}`).join('')}
    </div>
    `;
}

function notesHTML(note, notebookId) {
    const n = flattenedNote(note);
    return `
            <article class="note bordered p-2" 
                data-id="${n.id}" 
                data-url="${n.url}" 
                data-published="${n.published}" 
                data-modified="${n.modified}"
                data-shared="${n.shared}" >               
                <a id="title-${n.id}" class="fakeAnchor d-block" rel="prefetch" href="/notebooks/${notebookId}/notes/${n.id}" swap-target="#main" swap-history="true">
                    ${n.shared ? n.content_text.substring(0,50) : ''}
                </a> 
                <div class="card-subtitle">
                    ${n.shared ? `<a target="_blank" class="text-gray" href="${n.shared_url}">${n.shared_url}</a>` : ''}
                    <div class="d-inline" id="tags-${n.id}"></div>
                </div> 
                <main class="hide">
                    <div data-id="${n.id}" class="${n.shared ? '' : 'decryptMe'}">${n.shared ? n.content_html : n.content_text}</div>
                </main>
            </article>
    `;
}

function flattenedBookmark(post) {
    return {
        id: post.id ? post.id : 0,
        content: post.content_html ? post.content_html : '',
        summary: post.summary ? post.summary : '',
        url: post.url ? post.url : '',
        published: post.date_published ? post.date_published : '',
        tags: post.tags ? post.tags : '',
        name: post.author && post.author.name ? post.author.name : '',
        authorUrl: post.author && post.author.url ? post.author.url : '',
        avatar: post.author && post.author.avatar ? post.author.avatar : '',
        username: post.author && post.author._microblog && post.author._microblog.username ? post.author._microblog.username : '',
        relative: post._microblog && post._microblog.date_relative ? post._microblog.date_relative : '',
        dateFavorited: post._microblog && post._microblog.date_favorited ? post._microblog.date_favorited : '',
        timestamp: post._microblog && post._microblog.date_timestamp ? post._microblog.date_timestamp : '',
        links: post._microblog && post._microblog.links ? post._microblog.links : [],
        favorite: post._microblog && post._microblog.is_favorite ? post._microblog.is_favorite : false,
        bookmark: post._microblog && post._microblog.is_bookmark ? post._microblog.is_bookmark : false,
        deletable: post._microblog && post._microblog.is_deletable ? post._microblog.is_deletable : false,
        conversation: post._microblog && post._microblog.is_conversation ? post._microblog.is_conversation : false,
        highlights: post.highlights ? post.highlights : '',
        title: post.title ? post.title : '',
        reader: post.reader ? post.reader : ''
    };
}

export function bookmarkReaderHTML(reader, bookmark, tags) {
    return `
        <div class="container grid-xl">
            <div class="columns">
                <div class="column col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-9 col-9">
                    ${bookmarkHTML(bookmark, false)}
                    ${reader}
                <div class="column col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-3 col-3">
                    <ul class="menu p-0">
                        <li class="divider text-red" data-content="Bookmark Tags"></li>
                        ${bookmark.tags ? bookmark.tags.sort().map((item) =>
                            `<span class="chip">${item}<button class="btn btn-clear removeTag" aria-label="Close"></button></span>`
                        ).join('') : ''} 
                    </ul>
                    <div class="form-group">
                        <label class="form-label">Add tags.</label>
                        <div class="input-group">
                            <input list="tags"  id="addTag" type="text" class="form-input">
                            <button class="btn btn-primary input-group-btn addTag"><i class="icon icon-plus addTag"></i></button>
                            <datalist id="tags">
                            ${tags.sort().map((item) =>
                                `<option>${item}</option>`
                            ).join('')}</datalist>
                        </div>
                    </div>
                </div>
            </div>
        </div>`
}

export function bookmarksHTML(bookmarks, tags, is_premium) {
    return `<div class="container grid-xl">
            <div class="columns">
                <div class="column col-xs-12 col-sm-12 col-md-12 col-lg-12 ${is_premium ? 'col-xl-9 col-9' : 'col-xl-12 col-12'}">
                    <div class="form-group">
                        <label class="form-label">Search your bookmarks.</label>
                        <div class="input-group">
                            <input id="searchBookmark" type="text" class="form-input">
                            <button class="btn btn-primary input-group-btn searchBookmark"><i class="icon icon-search searchBookmark"></i></button>
                        </div>
                    </div>
                    ${is_premium ? `
                        <div class="show-lg">
                            <details class="accordion">
                                <summary class="accordion-header">
                                    <i class="icon icon-arrow-right mr-1"></i>
                                    Bookmark Tags
                                </summary>
                                <div class="accordion-body">
                                    ${tags.sort().map((item) =>
                                        `<span class="chip ${item}Link"><a rel="prefetch" swap-target="#main" swap-history="true" href="/bookmarks?tag=${item}">${item}</a></span>`
                                    ).join('')}                            
                                </div>
                            </details>
                        </div>
                    ` : ''}
                    ${bookmarks.map(n => bookmarkHTML(n, is_premium)).join('')}
                </div>
                ${is_premium ? `
                <div class="column col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-3 col-3">
                    <div class="hide-lg">
                        <ul class="menu p-0">
                            <li class="divider text-red" data-content="Bookmark Tags"></li>
                            ${tags.sort().map((item) =>
                                `<span class="chip ${item}Link"><a rel="prefetch" swap-target="#main" swap-history="true" href="/bookmarks?tag=${item}">${item}</a></span>`
                            ).join('')} 
                        </ul>
                    </div>
                </div><datalist id="tags">
                            ${tags.sort().map((item) =>
                                `<option>${item}</option>`
                            ).join('')}</datalist>
                    ` : ''}
            </div>
        </div>`
}

export function bookmarkHTML(bookmark, is_premium) {
    const b = flattenedBookmark(bookmark);
    return `
        <article class="bookmark card p-2 mb-2" 
            id="${b.id}"
            data-id="${b.id}" 
            data-title="${b.name}" 
            data-reader="${b.reader}" 
            data-url="${b.url}" 
            data-timestamp="${b.timestamp}" 
            data-published="${b.published}" 
            data-deletable="${b.deletable}" >    
            ${is_premium ? `
                <a id="title-${b.id}" class="fakeAnchor h5 d-block" rel="prefetch" href="/bookmarks/details?rid=${b.reader}&bid=${b.id}&hids=${b.highlights.join(',')}" swap-target="#main" swap-history="true">
                    <!--<figure class="avatar avatar" data-initial="${b.username.substring(0,1)}">
                        <img src="${b.avatar}" loading="lazy">
                    </figure>-->
                    ${b.title.split('<a')[0]}
                </a> ` : `
                <!--<figure class="avatar avatar-sm" data-initial="${b.username.substring(0,1)}">
                    <img src="${b.avatar}" loading="lazy">
                </figure>-->
                ${b.content.split('</p>')[0].replace('<p>','').split('<a')[0]}
            `}           
            
            <main class="card-subtitle">
                ${(new Date(b.published).toLocaleString('en-US', { timeZoneName: 'short' })).split(',')[0]} ·
                <a target="_blank" class="text-gray" href="${b.url}">${b.name}</a>
                ${is_premium && b.tags ? `· ${b.tags.split(',').map(t => `<span class="chip">${t}</span>`).join(' ')}` : ''}
                ${is_premium && b.highlights && b.highlights.length > 0 ? `· <span class="chip text-yellow">${b.highlights.length} highlight(s)</span>` : ''}
                ${is_premium && b.reader ? `· <span class="chip">reader</span>` : ''}
                
                ${b.summary ? `<div class="p-2 mt-2 d-block">🤖 ${b.summary}</div>` : '' }
            </main>      
        </article>
    `;
}

function getAvatar(p, size) {
    return `<figure class="avatar ${size}" data-initial="${p.username.substring(0,1)}">
            <img src="${p.avatar}" loading="lazy">
        </figure>`;
}

function flattenedMicroBlogPost(post) {
    let regex = /(height|width)=".*?";/gi;
    return {
        id: post && post.id ? post.id : 0,
        content_html: post &&  post.content_html ? formatHTML(post.content_html.replace(regex,'')) : '',
        summary: post && post.summary ? post.summary : '',
        url: post &&  post.url ? post.url : '',
        date_published: post &&  post.date_published ? post.date_published : '',
        name: post &&  post.author && post.author.name ? post.author.name : '',
        authorUrl: post &&  post.author && post.author.url ? post.author.url : '',
        avatar: post &&  post.author && post.author.avatar ? post.author.avatar : '',
        username: post &&  post.author && post.author._microblog && post.author._microblog.username ? post.author._microblog.username : '',
        date_relative: post &&  post._microblog && post._microblog.date_relative ? post._microblog.date_relative : '',
        timestamp: post &&  post._microblog && post._microblog.date_timestamp ? post._microblog.date_timestamp : '',
        favorite: post &&  post._microblog && post._microblog.is_favorite ? post._microblog.is_favorite : false,
        bookmark: post &&  post._microblog && post._microblog.is_bookmark ? post._microblog.is_bookmark : false,
        deletable: post &&  post._microblog && post._microblog.is_deletable ? post._microblog.is_deletable : false,
        conversation: post &&  post._microblog && post._microblog.is_conversation ? post._microblog.is_conversation : false,
        linkpost: post && post._microblog && post._microblog.is_linkpost ? post._microblog.is_linkpost : false,
        mention: post && post._microblog && post._microblog.is_mention ? post._microblog.is_mention : false,
        bio: post && post._microblog && post._microblog.bio ? post._microblog.bio : ''
    };
}

function formatHTML (str) {
    function resize (html) {
        const images = html.querySelectorAll("img");
        const parents = [];
        for (let i = 0; i < images.length; i++) {
            const image = images[i];
            if(images.length > 1)
            {
                let parent;
                image.classList.add('small-width');
                image.classList.add('small-height');
                if (image.parentNode.nodeName.toLowerCase() == "a"){
                    parent = image.parentNode;             
                } else {
                    parent = image;
                }
                parents.push(parent);
            } else {
                image.classList.add('single');
            }
        }
        //let's assemble the swipeable images
        if(parents.length > 0) {
            try {
                const container = html.createElement('div');
                container.classList.add('row');
                container.classList.add('scroll');
                for(let i = 0; i < parents.length; i++)
                {
                    parents[i].parentNode.removeChild(parents[i]);
                    container.appendChild(parents[i]);
                }
                html.appendChild(container);
            } catch {
                // continue on without messing with the images
            }
        }
        const videos = html.querySelectorAll("video");
        for (let i = 0; i < videos.length; i++) {
            const video = videos[i];
            video.setAttribute('loading', 'lazy');
        }

    }
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(str);
    resize(doc);

    return doc.toString().replaceAll('<div />', '').replaceAll('&amp;nbsp;',' ').replaceAll('&nbsp;', ' ');
}

export function postHTML(post, stranger, isConvo, convoId) {
    post = flattenedMicroBlogPost(post);

    // const multipleImgs = !post.linkpost && post.content_html.split('<img').length > 2;

    // if(multipleImgs) {
    //     post.content = post.content_html.replaceAll('<img', `<img data-gallery='${post.id}'`);
    // }

    post.content_html.replaceAll('<script', `<div`);
    post.content_html.replaceAll('</script', `</div`);

    return `
    <article class="no-elevate"
        id="post${isConvo ? '-convo' : ''}-${post.id}" 
        data-id="${post.id}" 
        class="card parent ${isConvo ? 'timeline-content pt-0' : ''} ${convoId && convoId === post.id ? 'highlight' : ''}" 
        data-reply="${post.username}" 
        data-avatar="${post.avatar}" 
        data-id="${post.id}" 
        data-processed="false" 
        data-url="${post.url}" 
        data-mention="${post.mention}" 
        data-conversation="${post.conversation}" 
        data-timestamp="${post.timestamp}" 
        data-published="${post.published}" 
        data-deletable="${post.deletable}" 
        data-linkpost="${post.linkpost}" 
        data-bookmark="${post.bookmark}" 
        data-favorite="${post.favorite}"
    >
        <div class="row top-align">
            <div class="max">
                <div>
                    <div class="row">
                        <img class="round" src="${post.avatar}">
                        <div class="max">
                            <h6 class="no-margin">${post.name}</h6>
                            <label class="grey-text">${post.username ? ` <a rel="prefetch" swap-target="#main" swap-history="true" href="/timeline/users/${post.username}">@${post.username}</a>` : ''}</label>
                        </div>
                    </div>
                        <div class="medium-space"></div>
                        <div class="post">
                            ${post.conversation ? `<!--<article data-parent-of="${post.id}" data-processed="false" class="border round surface-variant"><progress class="circle center"></progress></article>-->` : ''}
                            ${post.content_html}${post.summary}
                        </div>
                        <div class="medium-space"></div>
                        <div class="clear">
                            <nav class="no-space grey-text">
                                <div class="max">
                                    <a class="grey-text" href="${post.url}">
                                    ${post.date_relative} <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-link-45deg" viewBox="0 0 16 16">
                                        <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1 1 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4 4 0 0 1-.128-1.287z"/>
                                        <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243z"/>
                                        </svg>
                                    </a>
                                </div>
                                <button class="transparent circle wave">
                                    <i class="small">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-three-dots" viewBox="0 0 16 16">
                                            <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"/>
                                        </svg>
                                    </i>
                                    <menu class="top no-wrap left">
                                        <li data-ui="#dialog-reply-${post.id}">Comment</li>
                                    </menu>  
                                </button>
                                ${post.conversation && !isConvo ? `<!--<a rel="prefetch" swap-target="#conversation-${post.id}" swap-history="true"  href="/timeline/posts/${post.id}" class="button transparent circle wave m l">
                                    <i>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chat-text" viewBox="0 0 16 16">
                                            <path d="M2.678 11.894a1 1 0 0 1 .287.801 11 11 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8 8 0 0 0 8 14c3.996 0 7-2.807 7-6s-3.004-6-7-6-7 2.808-7 6c0 1.468.617 2.83 1.678 3.894m-.493 3.905a22 22 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a10 10 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9 9 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105"/>
                                            <path d="M4 5.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8m0 2.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5"/>
                                        </svg>
                                    </i>
                                    </a>-->
                                    <a swap-target="#main" swap-history="true" href="/timeline/posts/${post.id}" class="button transparent circle wave">
                                    <i>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chat-text" viewBox="0 0 16 16">
                                            <path d="M2.678 11.894a1 1 0 0 1 .287.801 11 11 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8 8 0 0 0 8 14c3.996 0 7-2.807 7-6s-3.004-6-7-6-7 2.808-7 6c0 1.468.617 2.83 1.678 3.894m-.493 3.905a22 22 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a10 10 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9 9 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105"/>
                                            <path d="M4 5.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8m0 2.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5"/>
                                        </svg>
                                    </i>
                                    </a>` : ``}
                                <!--<dialog id="dialog-${post.id}" class="right">
                                    <header class="fixed front">
                                        <nav>
                                            <div class="max truncate">
                                                <h5>Conversation</h5>
                                            </div>
                                            <button data-ui="#dialog-${post.id}" class="circle transparent">
                                                <i>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
                                                        <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
                                                    </svg>
                                                </i>
                                            </button>
                                        </nav>
                                    </header>
                                    <div class="convo">
                                        <div id="conversation-${post.id}">
                                            <progress class="circle center"></progress>
                                        </div>
                                    <div>
                                </dialog>-->
                                <dialog id="dialog-reply-${post.id}" class="bottom">
                                    <header class="fixed front">
                                        <nav>
                                            <div class="max truncate">
                                                <h5>Reply</h5>
                                            </div>
                                            <button evt-click="close" data-id="reply-${post.id}" class="circle transparent"><i evt-click="close" data-id="reply-${post.id}">close</i></button>
                                        </nav>
                                    </header>
                                    ${replyForm(post.id,`<label class="checkbox large icon"><input type='checkbox' checked="checked" name='replyingTo[]' value='${post.username}'><span><i><img class="round tiny" src="${post.avatar}"></i><i>done</i></span> @${post.username}</label>`, true)}
                                </dialog>
                            </nav>
                        </div>
                    
                </div>
            </div>
        </div>
        ${!post.is_conversation ? `<dialog id="dialog-reply-${post.id}" class="bottom">
            <header class="fixed front">
                <nav>
                    <div class="max truncate">
                        <h5>Reply</h5>
                    </div>
                    <button evt-click="close" data-id="reply-${post.id}" class="circle transparent"><i evt-click="close" data-id="reply-${post.id}">close</i></button>
                </nav>
            </header>
        </dialog>` : '' }
    </article>
    `;
    
    return ` 
        ${isConvo ? `<div class="timeline-item">
                        <div class="timeline-left ${convoId && convoId === post.id ? 'highlight' : ''}">
                            <span class="timeline-icon"></span>
                        </div>` : ''}
        <article id="post${isConvo ? '-convo' : ''}-${post.id}" 
            data-id="${post.id}" 
            class="card parent ${isConvo ? 'timeline-content pt-0' : ''} ${convoId && convoId === post.id ? 'highlight' : ''}" 
            data-reply="${post.username}" 
            data-avatar="${post.avatar}" 
            data-id="${post.id}" 
            data-processed="false" 
            data-url="${post.url}" 
            data-mention="${post.mention}" 
            data-conversation="${post.conversation}" 
            data-timestamp="${post.timestamp}" 
            data-published="${post.published}" 
            data-deletable="${post.deletable}" 
            data-linkpost="${post.linkpost}" 
            data-bookmark="${post.bookmark}" 
            data-favorite="${post.favorite}">
            <header id="header-${post.id}" class="card-header pt-1 mt-0 pb-1 mb-0 pl-1 pr-0">
                <div>   
                    <div class="card-top pl-1 d-flex">
                        ${getAvatar(post, isConvo ? 'avatar-lg' : 'avatar-lg')}
                        <div class="card-title px-2">
                            <div>
                                <span class="text-bold">${post.name.split(':')[0]}</span>
                                <br/>
                                <a rel="prefetch" swap-target="#main" swap-history="true" href="/timeline/users/${post.username}" class="text-gray text-small">
                                    ${stranger ? '<i class="icon icon-people text-gray"></i> ' : ''}
                                    @${post.username.split('@')[0].split('.')[0]}${post.username.includes('@') || post.username.includes('.') ? ' <i class="icon icon-location"></i>' : ''}
                                </a> 
                            </div>
                        </div>           
                    </div>
                </div>
            </header>
            <main id="main-${post.id}" data-id="${post.id}">
                ${post.content}
            </main>
            ${multipleImgs ? `<div data-id="${post.id}" class='gallery'></div>` : ''}
            <div class="card-footer d-flex">
                <div class="card-subtitle"> 
                    <a target="_blank" href="${post.url}" class="text-gray">${post.relative}</a>
                </div>
                <div class="card-buttons postBtns d-inline">
                    <div class="btn-group">
                        <div class="dropdown dropdown-right">
                            <button type="button" class="btn btn-link btn-action dropdown-toggle" tabindex="0">
                                <i class="icon icon-more-vert"></i>
                            </button>
                            <ul class="menu bg-dark">
                                <li class="menu-item"><a data-avatar="${post.avatar}" data-id="${post.id}" data-name="${post.username}" class="btn btn-link btn-action replyBtn"><i data-avatar="${post.avatar}" data-id="${post.id}" data-name="${post.username}" class="replyBtn icon icon-edit"></i> Add Comment</a></li>
                                <li class="menu-item"><a rel="prefetch" href="/timeline/posts/${post.id}" swap-target="#main" class="btn btn-link">View Post</a></li>
                                <li class="menu-item"><button data-url="${post.url}" type="button" class="btn btn-link bookmarkPost">Bookmark Post</button></li>
                                <li class="menu-item"><button data-id="${post.id}" data-url="${post.url}" data-name="${post.username}" type="button" class="btn btn-link quotePost">Quote Post</button></li>
                            </ul>
                        </div>
                        <!--<a data-avatar="${post.avatar}" data-id="${post.id}" data-name="${post.username}" class="btn btn-link btn-action replyBtn"><i data-avatar="${post.avatar}" data-id="${post.id}" data-name="${post.username}" class="replyBtn icon icon-edit"></i></a>-->
                        ${!isConvo && (post.conversation || post.mention) ? `<button type="button" data-id="${post.id}" class="btn btn-link btn-action convoBtn"><i data-id="${post.id}" class="icon icon-message convoBtn"></i></button>` : ''}
                    </div>
                </div>
            </div>
        </article>
        ${isConvo ? `</div>` : '' }
    `;
}

function replyForm(id, checkboxes, reload = false) {
    return `
    <a id="reply-${id}" href="/conversation/${id}" class="hide"></a>
    <form action='/reply' method='POST' data-id="reply-${id}" data-action="${reload}">
        <fieldset>
            <legend>Join the conversation</legend>
            <nav class="vertical">
                ${checkboxes}
                <input type='hidden' value='${id}' name='id' />
            </nav>
            <div class="field border textarea" style="height:100%">
                <div class="grow-wrap">
                    <textarea id="content"
                        name='content'
                        required
                        onInput="this.parentNode.dataset.replicatedValue = this.value"></textarea>
                </div>
            </div>
            <button class="border" type='submit'>Submit reply</button>
        </fieldset>
    </form>`;
}

function getReplyBox(repliers) {  
    return `<div id="replybox" class="form-group">
        <div class="form-autocomplete">
        <div id="replybox-input-container grid-xl" class="form-autocomplete-input form-input">
            <div id="replybox-chips">
            </div>
            <input id="replybox-input" class="form-input replierInput" type="text" placeholder="Begin typing to find users" value="">
        </div>
        <ul id="replybox-menu" class="menu hide bg-dark">
            ${!repliers ? '' : repliers.map(r => {
                return `<li class="menu-item" class="hide" data-name="${r.username}" data-avatar="${r.avatar}"></li>`}).join('')}
        </ul>
        </div>
    </div>
    ${!repliers ? '' : repliers.map(function (ur) {
        return `<input id="replybox-checkbox-${ur.username}" class="hide" type='checkbox' name='replyingTo[]' value='${ur.username}'/>`
    }).join(' ')}
    `;
}
