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

export function noteHTML(note, notebookId, versions) {
    const n = flattenedNote(note);
    return `
        <div class="container">
            <div class="columns">
                <div class="column col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-3 col-3">
                    <div class="card bordered p-2">
                        <div class="divider" data-content="Note Details"></div>
                        <!--<a href="/notebooks/${notebookId}/notes/${n.id}/edit-form" swap-target="#main" swap-history="true" class="btn btn-primary">Edit Note</a>-->
                        <div id="metadata-${n.id}"></div>
                        <div>
                            <dl>
                                <dt>id</dt><dd>${n.id}</dd>
                                <dt>url</dt><dd>${n.url}</dd>
                                <dt>published</dt><dd>${n.published}</dd>
                                <dt>modified</dt><dd>${n.modified}</dd>
                                <dt>encrypted</dt><dd>${n.encrypted}</dd>
                                <dt>shared</dt><dd>${n.shared}</dd>
                                <dt>shared_url</dt><dd>${n.shared_url}</dd>
                            </dl>
                        </div>
                        <div class="divider" data-content="Versions"></div>
                        <textarea>${JSON.stringify(versions,null,2)}</textarea>
                        <div class="divider" data-content="Related Bookmarks"></div>
                    </div>
                </div>
                <div class="column col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-9 col-9">
                    <div class="card bordered pages">
                        ${getNoteEditor(notebookId,n)}
                        <a class="fakeAnchor" href="#edit"><div id="preview" class="card-body"></div></a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getNoteEditor(notebookId, n) {
    return `
        <input data-id="${ n ? n.id : 'newNote'}" id="noteContent" class="${n && n.shared ? '' : 'decryptMe'}" type="hidden" value="${n ? n.content_text : ''}" />
        <input id="noteId" type="hidden" value="${n ? n.id : 0}" />
        <form id="edit" class="card">
            <div id="editor-container" class="card-body">
                <div class="grow-wrap">
                    <textarea id="content" placeholder="Your note is loading...." id="post" class="form-input grow-me" rows="10"></textarea>
                </div>
            </div>
            <div class="card-footer mb-2">
                <button type="button" class="btn btn-link editor-bold"><b>b</b></button>
                <button type="button" class="btn btn-link editor-italic"><em>i</em></button>
                <button type="button" class="btn btn-link editor-code"><i class="icon icon-resize-horiz editor-code"></i></button>
                <button type="button" class="btn btn-link editor-upload"><i class="icon icon-upload editor-upload"></i></button>
                <div class="dropdown">
                    <a href="javascript:void(0)" class="btn btn-link dropdown-toggle" tabindex="0">
                        <i class="icon icon-link"></i></i>
                    </a>
                    <ul class="menu">
                        <li class="menu-item"><a href="javascript:void(0)">Markdown image</a></li>
                        <li class="menu-item"><a href="javascript:void(0)">Markdown link</a></li>
                        <li class="divider"></li>
                        <li class="menu-item"><a href="javascript:void(0)">Item 1</a></li>
                        <li class="menu-item"><a href="javascript:void(0)">Item 2</a></li>
                        <li class="menu-item"><a href="javascript:void(0)">Item 3</a></li>
                    </ul>
                </div>
                <div class="btn-group float-right">
                    <button type="button" class="btn btn-primary saveNote">Save changes</button>
                </div> 
                <br/>
                <p id="editor-status"></p>
                <p><b>Note:</b> file upload is limited to 3MB.</p>
            </div>
            <div id="note-toast" class="toast toast-dark hide mt-2">
                <button data-toast-id="note-toast" class="btn btn-clear float-right dismissToast"></button>
                <div id="note-toast-message"></div>
            </div>     
        </form>
    `;
}

export function notesHTML(note, notebookId) {
    const n = flattenedNote(note);
    return `
        <a rel="prefetch" href="/notebooks/${notebookId}/notes/${n.id}" swap-target="#main" swap-history="true" class="fakeAnchor">
            <article class="note bordered p-2" 
                data-id="${n.id}" 
                data-url="${n.url}" 
                data-published="${n.published}" 
                data-modified="${n.modified}"
                data-shared="${n.shared}" >
                <div class="divider" data-content="${(new Date(n.modified).toLocaleString('en-US', { timeZoneName: 'short' })).split(',')[0]}"></div>
                <div id="title-${n.id}" class="card-title h5"></div> 
                <div class="card-subtitle">
                    ${n.shared ? `<a target="_blank" class="text-gray" href="${n.shared_url}">${n.shared_url}</a>` : ''}
                    <div class="d-inline" id="tags-${n.id}"></div>
                </div> 
                <main class="ripple">
                    <div data-id="${n.id}" class="${n.shared ? '' : 'decryptMe'}">${n.shared ? n.content_html : n.content_text}</div>
                </main>
            </article>
        </a>
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

export function bookmarkHTML(bookmark) {
    const b = flattenedBookmark(bookmark);
    return `
        <article id="${b.id}" class="card parent ripple toggleBookmark" data-id="${b.id}" data-highlights="${b.highlights.join(',')}" data-title="${b.name}" data-reader="${b.reader}" data-url="${b.url}" data-timestamp="${b.timestamp}" data-published="${b.published}" data-deletable="${b.deletable}">
            <header class="card-header">
                <figure class="avatar avatar-lg" data-initial="${b.username.substring(0,1)}">
                    <img src="${b.avatar}" loading="lazy">
                </figure>
                <div class="card-top">
                    <div class="card-title h5">${b.name}</div>
                    <div class="card-subtitle">
                        <a target="_blank" class="text-gray" href="${b.url}">${(new Date(b.published).toLocaleString('en-US', { timeZoneName: 'short' })).split(',')[0]}</a>
                        ${b.tags ? `${b.tags.split(',').map(t => `<span class="chip">${t}</span>`).join(' ')}` : ''}
                        ${b.highlights && b.highlights.length > 0 ? `<mark>${b.highlights.length} highlight(s) <i class="icon icon-edit"></i></mark>` : ''}
                        ${b.reader ? `<span class="chip">reader <i class="icon icon-check ml-2"></i></span>` : ''}
                    </div>  
                </div>
            </header>
            <main>
                <p>${b.title}</p>            
                ${b.summary ? `<div class="bordered p-2 bg-dark">🤖 ${b.summary}</div>` : '' }
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

export function postHTML(post, stranger, isConvo) {
    post = flattenedMicroBlogPost(post);
    const multipleImgs = !post.linkpost && post.content.split('<img').length > 2;

    if(multipleImgs) {
        post.content = post.content.replaceAll('<img', `<img data-gallery='${post.id}'`);
    }

    post.content.replaceAll('<script', `<div`);
    post.content.replaceAll('</script', `</div`);
    
    return ` 
        ${isConvo ? `<div class="timeline-item">
                        <div class="timeline-left">
                            <span class="timeline-icon"></span>
                        </div>` : ''}
        <article id="${post.id}" class="card parent ${isConvo ? 'timeline-content' : ''}" data-reply="${post.username}" data-avatar="${post.avatar}" data-id="${post.id}" data-processed="false" data-url="${post.url}" data-mention="${post.mention}" data-conversation="${post.conversation}" data-timestamp="${post.timestamp}" data-published="${post.published}" data-deletable="${post.deletable}" data-linkpost="${post.linkpost}" data-bookmark="${post.bookmark}" data-favorite="${post.favorite}">
            <header class="card-header">
                ${getAvatar(post, 'avatar-lg')}
                <div class="card-top">
                    <div class="card-title h5">${post.name}</div>
                    <div class="card-subtitle">
                        <a href="/timeline/user/${post.username}" class="text-gray">
                            ${stranger ? '<i class="icon icon-people text-gray"></i> ' : ''}
                            @${post.username}
                        </a> · 
                        <a target="_blank" href="${post.url}" class="text-gray">${post.relative}</a>
                        ${!isConvo && (post.conversation || post.mention) ? `&nbsp;·&nbsp;<a rel="prefetch" href="/timeline/posts/${post.id}" swap-target="#${post.id}"><i class="icon icon-message text-gray mr-2"></i> View conversation</a>` : ''}
                    </div>           
                </div>
            </header>
            <main id="main-${post.id}" data-id="${post.id}">${post.content}</main>
            ${multipleImgs ? `<div data-id="${post.id}" class='gallery'></div>` : ''}
            <details class="accordion card-body">
                <summary class="accordion-header c-hand">
                    <i class="icon icon-arrow-right mr-1"></i>
                    Reply
                </summary>
                <div class="accordion-body">
                    <form class="card bordered">
                        <div class="card-body">
                            <div class="grow-wrap">
                                <textarea name="content" id="${post.id}-reply" class="form-input grow-me" rows="3">@${post.username} </textarea>
                            </div>
                        </div>
                        <div class="card-footer mb-2">
                            <div class="btn-group float-right">
                                <button type="button" class="btn btn-primary sendReply"><i class="icon icon-message sendReply"></i> Reply</button>
                            </div> 
                        </div>
                        <div id="${post.id}-toast" class="toast toast-dark hide mt-2">
                            <button data-toast-id="${post.id}-toast" class="btn btn-clear float-right dismissToast"></button>
                            <div id="${post.id}-toast-message"></div>
                        </div>  
                    </form>
                </div>
            </details>
        </article>
        ${isConvo ? `</div>` : '' }
    `;
}

// export function conversationHTML(post, stranger, parent) {
//     const p = post;

//     const multipleImgs = !p.linkpost && p.content.split('<img').length > 2;

//     if(multipleImgs) {
//         p.content = p.content.replaceAll('<img', `<img data-gallery='${p.id}-${parent}'`);
//     }
//     return `
//         <div class="tile mb-2 mt-2 pt-2 ${p.id == parent ? 'highlight' : ''}" id="convo-${p.id}-${parent}" data-id="${p.id}" data-parent="${parent}" data-stranger="${stranger}">
//             <div class="tile-icon ">
//                 <figure class="avatar avatar-lg" data-initial="${p.username.substring(0,1)}">
//                     <img src="${p.avatar}" loading="lazy">
//                 </figure>
//             </div>
//             <div class="tile-content">
//                 <p class="tile-title">
//                     ${p.name} <a class="text-gray" href="/timeline/user/${p.username}">@${p.username}</a>
//                     <br/><a class="text-gray" href="${p.url}">${p.relative}</a>${stranger ? ' <i class="icon icon-people text-gray"></i>' : ''}
//                     <button type="button" class="addToReply btn btn-sm btn-link btn-icon float-right" data-target="replybox-textarea-${parent}" data-id="${p.username}">
//                         <i data-target="replybox-textarea-${parent}" data-id="${p.username}" class="icon icon-share addToReply"></i>
//                     </button>
//                 </p>
//                 ${p.content}
//                 ${multipleImgs ? `<div data-id="${p.id}-${parent}" class='gallery'></div>` : ''}
//             </div>
//         </div>
//     `;
// }

export function getReplyBox(id, repliers, boxOnly = false) {  
    if(boxOnly) {
        return `<div id="replybox-${id}" class="form-group">
                    <div class="form-autocomplete">
                    <div id="replybox-input-container-${id}" class="form-autocomplete-input form-input">
                        <div id="replybox-chips-${id}">
                        </div>
                        <input id="replybox-input-${id}" data-id="${id}" class="form-input replierInput" type="text" placeholder="Begin typing to find users" value="">
                    </div>
                    <ul id="replybox-menu-${id}" class="menu hide">
                        ${repliers.map(r => {
                            const replier = JSON.parse(r);
                            return `<li class="menu-item" class="hide" data-name="${replier.username}" data-avatar="${replier.avatar}"></li>`}).join('')}
                    </ul>
                    </div>
                </div>
                ${repliers.map(function (ur) {
                    const person = JSON.parse(ur);
                    return `<input id="replybox-checkbox-${id}-${person.username}" class="hide" type='checkbox' name='replyingTo[]' value='${person.username}'/>`
                }).join(' ')}
                `;
    }
    const author = JSON.parse(repliers[0]);
    return `
        <form class="form" id='replybox-form-${id}' data-id="${id}">
            ${repliers.map(function (ur) {
                const person = JSON.parse(ur);
                return `<input id="replybox-checkbox-${id}-${person.username}" class="hide" ${person.username.trim() == author.username.trim() ? 'checked="checked"' : ''} type='checkbox' name='replyingTo[]' value='${person.username}'/>`
            }).join(' ')}
            <div id="replybox-${id}" class="form-group">
                <label class="form-label">Repling to:</label>
                <div class="form-autocomplete">
                <div id="replybox-input-container-${id}" class="form-autocomplete-input form-input">
                    <div id="replybox-chips-${id}">
                        <span id="chip-${id}-${author.username}" class="chip"><img class="avatar avatar-sm" src="${author.avatar}" />@${author.username}<a data-name="${author.username}" data-id="${id}" class="btn btn-clear replierRemoveChip" href="#" aria-label="Close" role="button"></a></span>
                    </div>

                    <input id="replybox-input-${id}" data-id="${id}" class="form-input replierInput" type="text" placeholder="" value="">
                </div>
                <ul id="replybox-menu-${id}" class="menu hide">
                    ${repliers.map(r => {
                        const replier = JSON.parse(r);
                        return `<li class="menu-item" class="hide" data-name="${replier.username}" data-avatar="${replier.avatar}"></li>`}).join('')}
                </ul>
                </div>
            </div>
            <div class="form-group">
                <label class="form-label" for="input-example-3">Message</label>
                <div class="grow-wrap"><textarea id="replybox-textarea-${id}" class="form-input grow-me" name="content" rows="3"></textarea></div>
                <input type="hidden" class="form-input" name="id" value="${id}" />
            </div>
            <div class="form-group">
                <button data-id="${id}" type="button" class="btn btn-primary replyBtn">Send Reply</button>
            </div>
        </form>
    `;
}