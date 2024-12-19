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
        <div class="card mb-2">
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
        </div>
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
                <div class="column col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-9 col-9">
                    ${posts.items.map(n => postHTML(n)).join('')}
                </div>
                <div class="column col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-3 col-3">
                    <div class="form-group">
                        <label class="form-label">Search for featured posts.</label>
                        <div class="input-group">
                            <input id="searchPost" type="text" class="form-input" placeholder="...">
                            <button class="btn btn-primary input-group-btn searchPost"><i class="icon icon-search searchPost"></i></button>
                        </div>
                    </div>
                    <div class="show-lg">
                        <details class="accordion">
                            <summary class="accordion-header">
                                <i class="icon icon-arrow-right mr-1"></i>
                                Tagmoji
                            </summary>
                            <div class="accordion-body">
                                ${tagmoji.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0)).map((item) =>
                                    `<span class="chip ${item.name}Link"><a class="${item.name}LinkAnchor" rel="prefetch" swap-target="#main" swap-history="true" href="/discover/${item.name}">${item.emoji} ${item.title}</a></span>`
                                ).join('')}                            
                            </div>
                        </details>
                    </div>
                    <div class="hide-lg">
                        <ul class="menu bg-dark p-0">
                            <li class="divider" data-content="Discover Tagmoji"></li>
                            ${tagmoji.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0)).map((item) =>
                                    `<li class="menu-item">
                                        <a class="${item.name}LinkAnchor" rel="prefetch" swap-target="#main" swap-history="true" href="/discover/${item.name}" >
                                            ${item.emoji} ${item.title}
                                        </a>
                                    </li>`
                                ).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;
}

export function timelineHTML(posts, lastId) {
    return `
    <div>
        ${posts}
        <p class="text-center m-2 p-2"><a rel="prefetch" swap-target="#main" swap-history="true" href="/timeline/${lastId}">Load More</a></p>
    </div>
    `;
    // return `
    //     <div class="container grid-xl">
    //         <div class="columns">
    //             <div class="column col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-3 col-3">
    //                 <div class="card bordered">Profile peek here...</div>
    //             </div>
    //             <div class="column col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-9 col-9">
    //                 ${posts}
    //                 <p class="text-center m-2 p-2"><a rel="prefetch" swap-target="#main" swap-history="true" href="/timeline/${lastId}">Load More</a></p>
    //             </div>
    //         </div>
    //     </div>
    // `;
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
        ${n.shared ? `<p class="text-center"><mark>This note is shared.</mark><br/><a target="_blank" href="${n.shared_url}">${n.shared_url}</a></p>` : ''}
        <p class="text-center" id="tags-${n.id}"></p>
        <div class="card bordered pages">
            <div id="edit">
                ${await getNoteEditor(notebookId,n)}
            </div>
            <div class="card-body">
                <div id="preview"></div>
            </div>
        </div>
        <div id="note-details" class="hide">
            <p class="text-center"></p>
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

export async function getEditor(repliers, username, mbToken, destination) {
    let destinations = '';
    let syndicates = '';
    let categoriesList = '';
    

    if(mbToken) {
        let fetching = await fetch(`https://micro.blog/micropub?q=config`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
        const config = await fetching.json();
    
        const defaultDestination = config.destination.filter(d => d["microblog-default"])[0] ? config.destination.filter(d => d["microblog-default"])[0].uid : config.destination[0].uid;
        const mpDestination = destination ? destination : defaultDestination;
        destinations = config.destination ? config.destination.map(item => {
            if(item.uid != mpDestination) {
                return `<li class="menu-item"><a class="changeDestination" href="?destination=${encodeURIComponent(item.uid)}">${item.name}</a></li>`;
            }
        }).join('') : '';

        destinations = `<div id="destinationDropdown" class="dropdown">
                        <button type="button" class="btn btn-link dropdown-toggle" tabindex="0">
                            <span id="postingName">${config.destination.filter(d => d.uid == mpDestination)[0].name}</span> <i class="icon icon-caret"></i>
                        </button>
                        <ul id="destinationSelectMenu" class="menu bg-dark">
                            ${destinations}
                        </ul>
                    </div>`;
    
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
                    <input class="categoriesChange" type="checkbox" name="category[]" value="${item}"> ${item}
                    </label></li>`;
        }).join('') : '';

        categoriesList = `<div class="dropdown">
                <button type="button" class="btn btn-link dropdown-toggle">
                    <span id="categoriesDropdown" class="badge"><i class="icon icon-bookmark"></i></span>
                </button>
                <ul id="categoriesSelectMenu" class="menu bg-dark">
                    ${categoriesList}
                </ul>
            </div>`;
    }


    return `
        <form id="editor" class="card">
            <input type="hidden" name="postingType" id="postingType" />
            <input type="hidden" name="omgApi" id="omgApi" />
            <input type="hidden" name="omgAddess" id="omgAddess" />
            <input type="hidden" name="indieToken" id="indieToken" />
            <input type="hidden" name="microPub" id="microPub" />
            <input type="hidden" name="id" id="postId" />
            <div id="editor-container">
                <div id="editor-replybox" class="hide">${getReplyBox(repliers)}</div>
                <input type="text" placeholder="title (optional)" class="form-input mb-2" name="name" id="postName" />
                <div class="grow-wrap">
                    <textarea name="content" rows="10" id="content" id="post" class="form-input grow-me"></textarea>
                </div>
            </div>
            <div id="editor-footer" class="card-footer mb-2">
                <div id="markdownBtns" class="btn-group"> 
                    <button id="editor-bold-btn" type="button" class="btn btn-link editor-bold"><b class="editor-bold">b</b></button>
                    <button id="editor-italic-btn" type="button" class="btn btn-link editor-italic"><em class="editor-italic">i</em></button>
                    <button id="editor-code-btn" type="button" class="btn btn-link editor-code"><i class="icon icon-resize-horiz editor-code"></i></button>
                    <button id="editor-upload-btn" type="button" class="btn btn-link editor-upload"><i class="icon icon-upload editor-upload"></i></button>
                    <div class="dropdown">
                        <button type="button" class="btn btn-link dropdown-toggle" tabindex="0">
                            <i class="icon icon-link"></i></i>
                        </button>
                        <ul class="menu bg-dark">
                            <li class="menu-item editor-image"><a id="editor-image-markdown-btn" class="editor-image" href="#">Markdown image</a></li>
                            <li class="menu-item"><a id="editor-link-markdown-btn" class="editor-link" href="#">Markdown link</a></li>
                        </ul>
                    </div>
                    <button id="editor-preview-btn" type="button" class="btn btn-link editor-preview">preview</button>
                </div>
                <div class="btn-group float-right">
                    <select id="postStatus" name="status" class="form-select">
                        <option value="publish">Publish</option>
                        <option value="draft">Draft</option>
                    </select>
                    <button id="editor-action" type="button" class="btn btn-primary">Post</button>
                </div>
                <div id="topBarBtns" class="btn-group">
                    ${destinations}
                    <button type="button" class="btn btn-link toggleMainReplyBox"><i class="icon icon-people toggleMainReplyBox"></i></button> 
                    <div id="postingBtns" class="btn-group"> 
                        ${categoriesList}
                        ${syndicates}
                    </div>
                </div>
                <br/>
                <p id="editor-status"></p>
                <!--<p><b>Note:</b> file upload is limited to 3MB.</p>-->
            </div>   
        </form>
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
            <input list="tags" id="search" type="text" class="form-input search" placeholder="...">
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
                <!--</div>-->
                <div class="column col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-3 col-3">
                    <ul class="menu bg-dark p-0">
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
                        <ul class="menu bg-dark p-0">
                            <li class="divider text-red" data-content="Bookmark Tags"></li>
                            ${tags.sort().map((item) =>
                                `<span class="chip ${item}Link"><a rel="prefetch" swap-target="#main" swap-history="true" href="/bookmarks?tag=${item}">${item}</a></span>`
                            ).join('')} 
                        </ul>
                    </div>
                </div>
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
    return {
        id: post && post.id ? post.id : 0,
        content: post &&  post.content_html ? post.content_html : '',
        url: post &&  post.url ? post.url : '',
        published: post &&  post.date_published ? post.date_published : '',
        name: post &&  post.author && post.author.name ? post.author.name : '',
        authorUrl: post &&  post.author && post.author.url ? post.author.url : '',
        avatar: post &&  post.author && post.author.avatar ? post.author.avatar : '',
        username: post &&  post.author && post.author._microblog && post.author._microblog.username ? post.author._microblog.username : '',
        relative: post &&  post._microblog && post._microblog.date_relative ? post._microblog.date_relative : '',
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

export function postHTML(post, stranger, isConvo, convoId) {
    post = flattenedMicroBlogPost(post);
    const multipleImgs = !post.linkpost && post.content.split('<img').length > 2;

    if(multipleImgs) {
        post.content = post.content.replaceAll('<img', `<img data-gallery='${post.id}'`);
    }

    post.content.replaceAll('<script', `<div`);
    post.content.replaceAll('</script', `</div`);
    
    return ` 
        ${isConvo ? `<div class="timeline-item">
                        <div class="timeline-left ${convoId && convoId === post.id ? 'highlight' : ''}">
                            <span class="timeline-icon"></span>
                        </div>` : ''}
        <article id="post${isConvo ? '-convo' : ''}-${post.id}" data-id="${post.id}" class="card parent ${isConvo ? 'timeline-content pt-0 mt-0' : ''} ${convoId && convoId === post.id ? 'highlight' : ''}" data-reply="${post.username}" data-avatar="${post.avatar}" data-id="${post.id}" data-processed="false" data-url="${post.url}" data-mention="${post.mention}" data-conversation="${post.conversation}" data-timestamp="${post.timestamp}" data-published="${post.published}" data-deletable="${post.deletable}" data-linkpost="${post.linkpost}" data-bookmark="${post.bookmark}" data-favorite="${post.favorite}">
            <header id="header-${post.id}" class="card-header pt-1 mt-0 pb-1 mb-0 pl-1 pr-0">
                <div>   
                    <div class="card-top pl-1">
                        ${getAvatar(post, isConvo ? 'avatar' : 'avatar')}
                        <div class="card-title h5 d-inline">${post.name.split(':')[0]}</div>           
                    </div>
                </div>
            </header>
            <main id="main-${post.id}" data-id="${post.id}">
                ${post.content}
            </main>
            ${multipleImgs ? `<div data-id="${post.id}" class='gallery'></div>` : ''}
            <div class="card-footer">
                <div class="card-subtitle postFooter">
                    <a rel="prefetch" swap-target="#main" swap-history="true" href="/timeline/users/${post.username}" class="text-gray">
                        ${stranger ? '<i class="icon icon-people text-gray"></i> ' : ''}
                        @${post.username.split('@')[0].split('.')[0]}${post.username.includes('@') || post.username.includes('.') ? ' <i class="icon icon-location"></i>' : ''}
                    </a> · 
                    <a target="_blank" href="${post.url}" class="text-gray">${post.relative}</a>
                </div>
                <div class="card-buttons postBtns d-inline">
                    <div class="btn-group">
                        <div class="dropdown">
                            <button type="button" class="btn btn-link btn-action dropdown-toggle" tabindex="0">
                                <i class="icon icon-caret"></i>
                            </button>
                            <ul class="menu bg-dark">
                                <li class="menu-item">View</li>
                                <li class="menu-item">Bookmark</li>
                                <li class="menu-item">Quote</li>
                                <li class="menu-item">Open in micro.blog</li>
                            </ul>
                        </div>
                        <a data-avatar="${post.avatar}" data-id="${post.id}" data-name="${post.username}" class="btn btn-link btn-action replyBtn"><i data-avatar="${post.avatar}" data-id="${post.id}" data-name="${post.username}" class="replyBtn icon icon-edit"></i></a>
                        ${!isConvo && (post.conversation || post.mention) ? `<a rel="prefetch" href="/timeline/posts/${post.id}" swap-target="#post${isConvo ? '-convo' : ''}-${post.id}" class="btn btn-link btn-action"><i class="icon icon-message"></i></a>` : ''}
                    </div>
                </div>
            </div>
        </article>
        ${isConvo ? `</div>` : '' }
    `;
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
