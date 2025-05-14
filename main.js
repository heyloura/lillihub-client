//import * as mb from "./scripts/server/mb.js";
//import * as utility from "./scripts/server/utilities.js";
import { DOMParser } from "npm:linkedom";

/******************************************************************************************************************
* README
*
* Creating an APP_SECRET environmental variable. Save the rawKey.
*      const key = await crypto.subtle.generateKey({ name: "AES-CBC", length: 128 },true,["encrypt", "decrypt"]);
*      const rawKey = JSON.stringify(await crypto.subtle.exportKey("jwk", key));
******************************************************************************************************************/
const _appSecret = JSON.parse(Deno.env.get("APP_SECRET") ?? "{}");
const _lillihubToken = Deno.env.get("LILLIHUB_TOKEN") ?? "";
const _development = true;

Deno.serve(async (req) => { 
    if(_development) {
        console.log(req.url);
    }

    //********************************************************
    // Let's catch bots first and toss them out if we can...
    //********************************************************
    if((new URLPattern({pathname: "/robots.txt"})).exec(req.url)){
        return new Response(`
            User-agent: *
            Disallow: /
        `, {
            status: 200,
            headers: {
                "content-type": "text/plain",
            },
        });
    }

    const nope = ["robot","spider","facebook","crawler","google","updown.io daemon 2.11","bingbot","bot","duckduckgo"]
    for(let i = 0; i < nope.length; i++) {
        if(!req.headers.get("user-agent") || req.headers.get("user-agent").toLowerCase().includes(nope[i])) {
            return new Response('', {
                status: 401,
            });
        }
    }
    if(req.url == 'https://lillihub.com//wp-includes/wlwmanifest.xml' ||
      req.url == 'https://lillihub.com//xmlrpc.php?rsd' ||
      req.url.includes('wp-content')) {
        return new Response('', {
                status: 404,
            });
    } 

    //********************************************************
    // Okay, let's give the favicon if requested. Otherwise
    // we can run into strange behaviors
    //********************************************************
    if((new URLPattern({ pathname: "/favicon.ico" })).exec(req.url)){
        return new Response(new Uint8Array(await Deno.readFile("static/favicon.ico")), {
            status: 200,
            headers: {
                "content-type": "image/x-icon",
            },
        });
    }

    //********************************************************
    // Now let's give them any common files that the mobile
    // or browser will need for our HTML page
    // - the icon
    // - the webmanifest
    // - the service worker
    // - JS libraries, CSS and font resources
    //********************************************************
    if((new URLPattern({ pathname: "/lillihub-512.png" })).exec(req.url)){
        return new Response(new Uint8Array(await Deno.readFile("static/lillihub-512.png")), {
            status: 200,
            headers: {
                "content-type": "image/png",
            },
        });
    }

    if((new URLPattern({ pathname: "/logo.png" })).exec(req.url)){
        return new Response(new Uint8Array(await Deno.readFile("static/logo-ai-lillihub-xs.png")), {
            status: 200,
            headers: {
                "content-type": "image/png",
            },
        });
    }

    if((new URLPattern({ pathname: "/manifest.webmanifest" })).exec(req.url))
    {
        return new Response(await Deno.readFile("static/manifest.webmanifest"), {
            status: 200,
            headers: {
                "content-type": "text/json",
            },
        });
    }

    if(new URLPattern({ pathname: "/sw.js" }).exec(req.url))
    {
        return new Response(await Deno.readFile("scripts/client/sw.js"), {
            status: 200,
            headers: {
                "content-type": "text/javascript",
            },
        });
    }

    const CHECK_SCRIPT_ROUTE = new URLPattern({ pathname: "/scripts/:id" });
    if(CHECK_SCRIPT_ROUTE.exec(req.url))
    {
        const id = CHECK_SCRIPT_ROUTE.exec(req.url).pathname.groups.id;
        return new Response(await Deno.readFile("scripts/client/" + id), {
            status: 200,
            headers: {
                "content-type": "text/javascript",
            },
        });
    }

    const CHECK_CSS_ROUTE = new URLPattern({ pathname: "/styles/:id" });
    if(CHECK_CSS_ROUTE.exec(req.url))
    {
        const id = CHECK_CSS_ROUTE.exec(req.url).pathname.groups.id;
        return new Response(await Deno.readFile("styles/" + id), {
            status: 200,
            headers: {
                "content-type": "text/css",
            },
        });
    }

    const nonce = crypto.randomUUID(); // this is to protect us from scripts and css
    //********************************************************
    // Now let's see if we have a user or if someone needs to 
    // login
    //********************************************************
    const mbTokenCookie = getCookieValue(req, 'atoken');
    const token = mbTokenCookie ? await decryptMe(getCookieValue(req, 'atoken')) : undefined;

    //---------------------------------
    // a csp makes everyone safer
    //---------------------------------
    let csp = `default-src 'nonce-${nonce}';frame-src 'self';img-src * data:;media-src *;`;

    if(token) {
        if(new URLPattern({ pathname: "/logout" }).exec(req.url)) {
            console.log("/logout");
            return new Response(HTML(`<p>Thanks for visiting. Redirecting now.</p>`, ' ', '/'), { status: 200,
                headers: {
                    "content-type": "text/html",
                    "set-cookie": `token=undefined;SameSite=Lax;Secure;HttpOnly;Expires=Thu, 01 Jan 1970 00:00:00 GMT`
                },
            });
        }

        if(new URLPattern({ pathname: "/timeline" }).exec(req.url)) {
            const searchParams = new URLSearchParams(req.url.split('?')[1]);
            const before = searchParams.get('before');
            const after = searchParams.get('after');

            let fetching = await fetch(`https://micro.blog/posts/check`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
            let results = await fetching.json(); 
            const marker = results.markers.timeline;
            
            if(before) {
                fetching = await fetch(`https://micro.blog/posts/timeline?count=40&before_id=${before}`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
            } else if (after) {
                fetching = await fetch(`https://micro.blog/posts/timeline?count=40&after_id=${before}`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
            } else {
                fetching = await fetch(`https://micro.blog/posts/timeline`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
            }

            results = await fetching.json(); 

            let items = results.items;
            let ids = results.items.map(i => i.id);
            let i = 0;

            while(marker && i < 100 && !ids.includes(marker.id) && !before && !after) {
                let last = ids[ids.length - 1];
                fetching = await fetch(`https://micro.blog/posts/timeline?before_id=${last}&count=40`, { method: "GET", headers: { "Authorization": "Bearer " + token  } } );
                results = await fetching.json(); 

                if(!results.items || results.items.length == 0) {
                    break;
                }

                items = [...items, ...results.items];
                ids = [...ids, ...results.items.map(i => i.id)];
                i++;

                if(results.items.length < 20) {
                    break;
                }
            }

            if(!before && !after) {
                let marking = await fetch(`https://micro.blog/posts/markers?id=${items[0].id}&channel=timeline&date_marked=${new Date()}`, { method: "POST", headers: { "Authorization": "Bearer " + token } });
            }

            const index = items.findIndex(obj => obj.id === marker.id);
            let page = `<div class="screen">
            ${before ? `<a class="button wave border" href="/timeline?after=${items[0].id}">Previous</a>` : ''}
            ${items.map((item,i) => {
                item = flattenPost(item);
                return `
                    <article class="no-elevate round ${i == index ? 'secondary-container' : ''}" data-id="${item.id}">
                        <div class="row top-align">
                            <div class="max">
                                <div>
                                    <div class="row">
                                        <img class="round" src="${item.avatar}">
                                        <div class="max">
                                            <h6 class="no-margin">${item.name}</h6>
                                            <label class="grey-text">${item.username ? ` <a href="${item.author_url}">@${item.username}</a>` : ''}</label>
                                        </div>
                                    </div>
                                        <div class="medium-space"></div>
                                        <div class="post">
                                            ${item.is_conversation ? `<!--<article data-parent-of="${item.id}" data-processed="false" class="border round surface-variant"><progress class="circle center"></progress></article>-->` : ''}
                                            ${item.content_html}${item.summary}
                                        </div>
                                        <div class="medium-space"></div>
                                        <div class="clear">
                                            <nav class="no-space grey-text">
                                                <div class="max"><a class="grey-text" href="${item.url}">${item.date_relative} <i class="tiny">open_in_new</i></a></div>
                                                <button class="transparent circle wave">
                                                    <i evt-click="show" data-id="reply-${item.id}">edit</i>
                                                    <menu class="top no-wrap left">
                                                        <li evt-click="show" data-id="reply-${item.id}">Comment <i evt-click="show" data-id="reply-${item.id}">add_comment</i></li>
                                                    </menu>  
                                                </button>
                                                ${item.is_conversation ? `<a href="/conversation/${item.id}" class="button transparent circle wave"><i>forum</i><div class="badge min"></div></a>` : 
                                                    `<button evt-click="show" data-id="reply-${item.id}" class="transparent circle wave hide"><i evt-click="show" data-id="reply-${item.id}">pencil</i></button>`}
                                                <dialog id="dialog-${item.id}" class="max">
                                                    <header class="fixed front">
                                                        <nav>
                                                            <div class="max truncate">
                                                                <h5>Conversation</h5>
                                                            </div>
                                                            <button evt-click="close" data-id="${item.id}" class="circle transparent"><i evt-click="close" data-id="${item.id}">close</i></button>
                                                        </nav>
                                                    </header>
                                                    <div class="convo"><div id="conversation-${item.id}">
                                                        <progress class="circle center"></progress>
                                                    </div></div>
                                                </dialog>
                                            </nav>
                                        </div>
                                    
                                </div>
                            </div>
                        </div>
                        ${!item.is_conversation ? `<dialog id="dialog-reply-${item.id}" class="bottom">
                            <header class="fixed front">
                                <nav>
                                    <div class="max truncate">
                                        <h5>Reply</h5>
                                    </div>
                                    <button evt-click="close" data-id="reply-${item.id}" class="circle transparent"><i evt-click="close" data-id="reply-${item.id}">close</i></button>
                                </nav>
                            </header>
                            ${replyForm(item.id,`<label class="checkbox large icon"><input type='checkbox' checked="checked" name='replyingTo[]' value='${item.username}'><span><i><img class="round tiny" src="${item.avatar}"></i><i>done</i></span> @${item.username}</label>`, true)}
                        </dialog>` : '' }
                    </article>
                    `;
            }).join('')}          
            <div class="medium-space"></div>  
            <nav class="no-space">
                <a class="button wave border" href="/timeline?before=${items[items.length - 1].id}">Next</a>
            </nav>    
            <div class="medium-space"></div>
            </div>`;

            return new Response(HTML(page, 'Timeline', undefined), {status: 200, headers: {"content-type": "text/html" } });
        }

        //---------------------------------
        // This'll get you a conversation
        //---------------------------------
        if(new URLPattern({ pathname: "/conversation/:id" }).exec(req.url)) {
            const id = new URLPattern({ pathname: "/conversation/:id" }).exec(req.url).pathname.groups.id;
            return await getConversationHTML(id, token, nonce, csp);
        }

        //---------------------------
        // This is a reply
        // TO DO: make sure it is a POST request...
        //---------------------------
        if(new URLPattern({ pathname: "/reply" }).exec(req.url)) {
            const value = await req.formData();
            const id = value.get('id');
            const replyingTo = value.getAll('replyingTo[]');
            let content = value.get('content');

            if(content != null && content != undefined && content != '' && content != 'null' && content != 'undefined') {
                const replies = replyingTo.map(function (reply, i) { return '@' + reply }).join(' ');
                content = replies + ' ' + content;

                const posting = await fetch(`https://micro.blog/posts/reply?id=${id}&content=${encodeURIComponent(content)}`, { method: "POST", headers: { "Authorization": "Bearer " + token } });
            }
                
                return new Response(HTML(`<p>Done...</p>`, '', undefined), {status: 200, headers: {"content-type": "text/html", "Content-Security-Policy": csp} }); 
        }

        //---------------------------
        // This is a delete note
        // TO DO: make sure it is a POST request...
        //---------------------------
        if(new URLPattern({ pathname: "/note/delete" }).exec(req.url)) {
            const value = await req.formData();
            const id = value.get('id');

            const posting = await fetch(`https://micro.blog/notes/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": "Bearer " + token
                }
            });
        }

        //---------------------------
        // This is an update note
        // TO DO: make sure it is a POST request...
        //---------------------------
        if(new URLPattern({ pathname: "/note/update" }).exec(req.url)) {
            const value = await req.formData();
            const text = value.get('text');
            const notebook_id = value.get('notebook_id');
            const id = value.get('id');

            const form = new URLSearchParams();
            form.append("text", text);
            form.append("notebook_id", notebook_id);

            if(id) {
                form.append("id", id);
            }
                        
            const posting = await fetch('https://micro.blog/notes', {
                method: "POST",
                body: form.toString(),
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
                    "Authorization": "Bearer " + token
                }
            });
        }

        if(new URLPattern({ pathname: "/note/move" }).exec(req.url)) {
            const value = await req.formData();
            const notebook = value.get('notebook[]');
            const id = value.get('id');

            console.log(notebook)
            console.log(id)

            // create new note in notebook
            let fetching = await fetch(`https://micro.blog/notes/${id}`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
            const eNote = await fetching.json();

            const formBody = new URLSearchParams();
            formBody.append("notebook_id", notebook);
            formBody.append("text", eNote.content_text);

            let posting = await fetch('https://micro.blog/notes', {
                method: "POST",
                body: formBody.toString(),
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
                    "Authorization": "Bearer " + token
                }
            });
            
            if(posting.ok) {
                posting = await fetch(`https://micro.blog/notes/${id}`, {
                    method: "DELETE",
                    headers: {
                        "Authorization": "Bearer " + token
                    }
                });
                return new Response(JSON.stringify(await posting.text()), {
                    status: 200,
                    headers: {
                        "content-type": "text/plain",
                    },
                }); 
            }
            
            return new Response(JSON.stringify(await posting.text()), {
                status: 200,
                headers: {
                    "content-type": "text/plain",
                },
            }); 
        }

        //---------------------------
        // This is a note editor
        //---------------------------
        if(new URLPattern({ pathname: "/zzuh/:parent/:id" }).exec(req.url) || new URLPattern({ pathname: "/zzuh/:parent" }).exec(req.url)) {
            let id = 0;
            let results = {};
            let versions = {};
            let parent = 0;
            const searchParams = new URLSearchParams(req.url.split('?')[1]);
            const vid = searchParams.get('vid');

            if(new URLPattern({ pathname: "/zzuh/:parent/:id" }).exec(req.url)) {
                parent = new URLPattern({ pathname: "/zzuh/:parent/:id" }).exec(req.url).pathname.groups.parent;
                id = new URLPattern({ pathname: "/zzuh/:parent/:id" }).exec(req.url).pathname.groups.id;
                let fetching = await fetch(`https://micro.blog/notes/${id}/versions`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
                versions = await fetching.json();
                
                if(!vid) {
                    fetching = await fetch(`https://micro.blog/notes/${id}`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
                    results = await fetching.json();
                } else {
                    results = versions.items.filter(v => v.id == vid)[0];        
                }
            } else {
                parent = new URLPattern({ pathname: "/zzuh/:parent" }).exec(req.url).pathname.groups.parent;
            }

            return new Response(HTML(`
                ${vid ? `<p><mark class="tertiary">Version #${vid}</mark>. Saving this note will override the current version.</p>` : ``}
                <div class="field textarea">
                    <input id="noteId" type="hidden" value="${id}" />
                    <textarea style="height:85vh;overscroll-behavior-y:contain;" id="content"
                        data-encypted="${id != 0 && results._microblog.is_encrypted}"
                        data-content="${id != 0 && results.content_text ? results.content_text : id != 0 ? results.content_html : ''}"></textarea>
                </div>
                ${id != 0 ? `
                <dialog id="dialog-settings" class="max">
                    <header class="fixed front">
                        <nav>
                            <div class="max truncate">
                                <h5>Settings</h5>
                            </div>
                            <button evt-click="close" data-id="settings" class="circle transparent"><i evt-click="close" data-id="settings">close</i></button>
                        </nav>
                    </header>
                    <p><b>Versions</b></p>
                    <table class="table table-striped p-2">
                        ${versions.items.reverse().map((v, i) => `<tr>
                            <td>${(new Date(v.date_published).toLocaleString('en-US', { timeZoneName: 'short' })).replace(' UTC','')}</td>
                            <td><a href="/zzuh/${parent}/${id}?vid=${v.id}">${v.id}</a>${i == 0 ? ' (current)' : ''}</td>
                        </tr>`).join('')}
                    </table>
                </dialog>` : '' }
                <dialog id="dialog-preview" class="max">
                    <header class="fixed front">
                        <nav>
                            <div class="max truncate">
                                <h5>Preview</h5>
                            </div>
                            <button evt-click="close" data-id="preview" class="circle transparent"><i evt-click="close" data-id="preview">close</i></button>
                        </nav>
                    </header>
                    <div id="preview-content"><progress class="circle small"></progress></div>
                </dialog>
                ${decryptNotes(`
                    if(document.getElementById('noteId').value != "0") {
                        let element = document.querySelector('#content');
                        var item = {};
                        item.content_text = element.getAttribute('data-content');
                        item.encrypted = element.getAttribute('data-encypted') == 'true' ? true : false;
                        item.content_html = element.getAttribute('data-content');
                        item.id = element.getAttribute('data-id');
                        
                        if(element.getAttribute('data-content')) {
                            var result = await note(item,converter);
                            element.innerHTML = item.content_text;
                        } else {
                            element.innerHTML = '';
                        }
                    }
                `)}
                <script>
                    document.getElementById('content').focus();
                    function openSettings() {
                        document.getElementById('dialog-settings').showModal();
                    }
                    function preview() {
                        document.getElementById('dialog-preview').showModal();
                        const converter = new showdown.Converter({	
                            metadata: true,
                            parseImgDimensions: true,
                            strikethrough: true,
                            tables: true,
                            ghCodeBlocks: true,
                            simpleLineBreaks: true,
                            emoji: true, 
                        });
                        document.getElementById('preview-content').innerHTML = converter.makeHtml(document.getElementById('content').value);
                    }
                    function saveNote() {
                        window.encryptWithKey(document.getElementById('content').value).then(async result => {
                            console.log("Result:", result); // Output: Result: Async result
                            const form = new URLSearchParams();
                            form.append("text", result);
                            form.append("notebook_id", ${parent});
                            ${id != 0 ? `form.append("id", ${id});` : ''}
                            const posting = await fetch('/note/update', {
                                method: "POST",
                                body: form.toString(),
                                headers: {
                                    "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
                                }
                            });
                            window.location = '/hoxtc/${parent}';
                        });
                    }
                </script>
            `, `Edit ${id}`, undefined, `
                <footer>
                    <nav>
                    ${ id != 0 ? `
                        <button onclick="openSettings()" class="circle transparent">
                            <i onclick="openSettings()">settings</i>
                        </button>` : '' }
                        <button onclick="preview()" class="circle transparent">
                            <i onclick="preview()">preview</i>
                        </button>
                        <div class="max"></div>
                    </nav>
                </footer>
            `, `
                <header class="l">
                    <nav>
                        <h5 class="max center-align">Edit Note</h5>
                        <button onclick="saveNote()" class="circle transparent">
                            <i>save</i>
                        </button>
                    </nav>
                </header>
            `), {status: 200, headers: {"content-type": "text/html"} });
        }

        //---------------------------
        // This is a note viewer
        //---------------------------
        if(new URLPattern({ pathname: "/wpii/:parent/:id" }).exec(req.url)) {
            const id = new URLPattern({ pathname: "/wpii/:parent/:id" }).exec(req.url).pathname.groups.id;
            const parent = new URLPattern({ pathname: "/wpii/:parent/:id" }).exec(req.url).pathname.groups.parent;
            const fetching = await fetch(`https://micro.blog/notes/${id}`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
            const results = await fetching.json();
            const fetchingNotebooks = await fetch(`https://micro.blog/notes/notebooks`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
            const resultsNotebooks = await fetchingNotebooks.json();
            const notebooks = resultsNotebooks.items.sort((a,b) => (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0)).map((item,i) => {
                return `<label class="radio">
                            <input name="notebook[]" type="radio" ${item.id == parent ? 'checked="checked"' : ''} value="${item.id}">
                            <span>${item.title}</span>
                        </label>`;
            }).join('');
            return new Response(HTML(`
                <a id="editLink" href="/zzuh/${parent}/${id}" style="display:none;"></a>
                <div class="note small-padding" 
                    data-parent="${id}"
                    data-id="${results.id}" 
                    data-encypted="${results._microblog.is_encrypted}" 
                    data-content="${results.content_text ?results.content_text : results.content_html}">
                    <progress class="circle small"></progress>
                </div>
                <dialog id="dialog-settings" class="max">
                    <header class="fixed front">
                        <nav>
                            <div class="max truncate">
                                <h5>Settings</h5>
                            </div>
                            <button evt-click="close" data-id="settings" class="circle transparent"><i evt-click="close" data-id="settings">close</i></button>
                        </nav>
                    </header>
                    <p>Moving a note creates a copy of the note in the selected notebook and then
                        deletes the original. This <b>will</b> lose versioning of the note. Before preceeding back up any
                        note versions you wish to retain.</p>
                    <form id="moveNotebookForms">
                        <input type="hidden" name="id" value="${id}" />
                        <fieldset>
                            <legend>Move note to another notebook</legend>
                            <nav class="vertical">
                                ${notebooks}
                            </nav>
                        </fieldset>
                        <div class="medium-space"></div>
                        <button onclick="moveNote()" type="button">Move notebook</button>
                    </form>
                    <div class="large-space"></div>
                    <p><b>Advanced</b></p>
                    <button class="error" onclick="deleteNote()">Delete Note?</button>
                </dialog>
                <script>
                    function moveNote() {
                        fetch('/note/move', {
                            method:'post', 
                            body: new FormData(document.getElementById('moveNotebookForms'))})
                                .then(r => {
                                    window.location = '/hoxtc/${parent}';
                                });
                    }
                    function editNote() {
                        document.getElementById('editLink').click();
                    }
                    function openSettings() {
                        document.getElementById('dialog-settings').showModal();
                    }
                    function deleteNote() {
                        if(confirm('You really want to delete this?')) {
                            const form = new URLSearchParams();
                            form.append("id", ${id});
                            form.append("notebook_id", ${parent});
                            fetch('/note/delete', {
                                method: "POST",
                                body: form.toString(),
                                headers: {
                                    "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
                                }
                            }).then(async result => {  window.location = '/hoxtc/${parent}'; });
                        }
                    }
                </script>
                ${decryptNotes(`
                    let element = document.querySelector('.note');
                    var item = {};
                    item.content_text = element.getAttribute('data-content');
                    item.encrypted = element.getAttribute('data-encypted') == 'true' ? true : false;
                    item.content_html = element.getAttribute('data-content');
                    item.id = element.getAttribute('data-id');
                    var result = await note(item,converter);
                    element.innerHTML = '<h6>'+item.title+'</h6><p>'+(item.tags ? item.tags.replaceAll('[','').replaceAll(']','').split(',').map(t => { return '<button onClick="searchTag(\\''+t+'\\')" class="chip fill tiny">#'+t+'</button>' }).join('') : '')+'</p><div>'+item.content_html+'</div>'
                `)}
            `, `Note ${id}`, undefined, `
                <footer>
                    <nav>
                    ${ id != 0 ? `
                        <button onclick="openSettings()" class="circle transparent">
                            <i onclick="openSettings()">settings</i>
                        </button>` : '' }
                        <div class="max"></div>
                    </nav>
                </footer>
            `, `
                <header class="l">
                    <nav>
                        <h5 class="max center-align">Note ${id}</h5>
                        <button onclick="editNote()" class="circle transparent">
                            <i>edit</i>
                        </button>
                    </nav>
                </header>
            `), {status: 200, headers: {"content-type": "text/html"} });
        }

        //---------------------------
        // This is a todo viewer
        //---------------------------
        if(new URLPattern({ pathname: "/todo/:parent/:id" }).exec(req.url)) {
            const id = new URLPattern({ pathname: "/todo/:parent/:id" }).exec(req.url).pathname.groups.id;
            const parent = new URLPattern({ pathname: "/todo/:parent/:id" }).exec(req.url).pathname.groups.parent;
            const fetching = await fetch(`https://micro.blog/notes/${id}`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
            const results = await fetching.json();
            return new Response(HTML(`
                <div class="note small-padding" 
                    data-parent="${id}"
                    data-id="${results.id}" 
                    data-encypted="${results._microblog.is_encrypted}" 
                    data-content="${results.content_text ?results.content_text : results.content_html}">
                    <div class="field large prefix round fill active">
                        <i class="front">search</i>
                        <input id="search" onInput="liveSearch('li','search')">
                    </div>
                    <ul class="list border" id="tasks">
                        <li class="list border"><progress class="circle small"></progress></li>
                    </ul>
                </div>
                <dialog id="dialog-edit" class="max">
                    <header class="fixed front">
                        <nav>
                            <div class="max truncate">
                                <h5>Manage Todo</h5>
                            </div>
                            <button evt-click="close" data-id="edit" class="circle transparent"><i evt-click="close" data-id="edit">close</i></button>
                        </nav>
                    </header>
                    <div class="field textarea">
                        <input id="lineId" type="hidden" />
                        <textarea style="height:70vh;" id="content"></textarea>
                        <div class="medium-space"></div>
                        <button id="deleteMe" evt-click='delete' class="error-text border"><i>delete</i> Delete</button>
                        <button evt-click='save'><i>save</i> Save</button>
                    </div>
                </dialog>
                <style>
                .list li {overflow:auto;}
                </style>
                <script>
                    function addTodo() {
                        document.getElementById('deleteMe').classList.add('hide');
                        document.getElementById('content').value = '';
                        document.getElementById('lineId').value = '-1';
                        document.getElementById('dialog-edit').showModal();
                    }
                    function saveTodos() {
                        let tasks = document.querySelectorAll('h6');
                        var note = '---\\ntype: todo.txt\\ntitle: todo.txt\\n---\\n';
                        for (var i = 0; i < tasks.length; i++) {
                            note += tasks[i].getAttribute('data-task') + '\\n\\n';
                        }

                        window.encryptWithKey(note).then(async result => {
                            console.log("Result:", result); // Output: Result: Async result
                            const form = new URLSearchParams();
                            form.append("text", result);
                            form.append("notebook_id", ${parent});
                            ${id != 0 ? `form.append("id", ${id});` : ''}
                            const posting = await fetch('/note/update', {
                                method: "POST",
                                body: form.toString(),
                                headers: {
                                    "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
                                }
                            });
                        });

                        document.getElementById('tasks').innerHTML = converter.makeHtml(note);
                        window.createTaskList();
                    }
                    const converter = new showdown.Converter({	
                                metadata: true,
                                parseImgDimensions: true,
                                strikethrough: true,
                                tables: true,
                                ghCodeBlocks: true,
                                simpleLineBreaks: true,
                                emoji: true, 
                            });
                    document.addEventListener("click", async (event) => {
                        if(!event.target.getAttribute('evt-click')) {
                            return;
                        } else {
                            if(event.target.getAttribute('evt-click') == 'edit') {
                                document.getElementById('deleteMe').classList.remove('hide');
                                id = event.target.getAttribute('data-line-id');
                                text = event.target.textContent;
                                document.getElementById('content').value = text;
                                document.getElementById('lineId').value = id;
                                document.getElementById('dialog-edit').showModal();
                            }
                            if(event.target.getAttribute('evt-click') == 'check') {
                                id = event.target.getAttribute('data-id');
                                var task = document.querySelector('[data-line-id="'+id+'"]');
                                task.setAttribute('data-task','x ' + new Date().toISOString().split('T')[0] + ' ' + task.getAttribute('data-task'));
                                saveTodos();
                            }
                            if(event.target.getAttribute('evt-click') == 'delete') {
                                if(confirm('Are you sure you want to delete this?')) {
                                    var line = document.getElementById('lineId').value;
                                    var task = document.querySelector('[data-line-id="'+line+'"]');
                                    task.remove();
                                    saveTodos();
                                    document.getElementById('dialog-edit').close();
                                }
                            }
                            if(event.target.getAttribute('evt-click') == 'save') {
                                var text = document.getElementById('content').value;
                                var line = document.getElementById('lineId').value;

                                var tasks = text.split('\\n');

                                console.log(tasks);

                                var task = document.querySelector('[data-line-id="'+line+'"]');
                                if(task) {
                                    task.setAttribute('data-task',tasks[0]);
                                } else {
                                    document.getElementById('tasks').insertAdjacentHTML('beforeend', '<li><h6 data-task="'+tasks[0]+'">new</h6></li>')
                                }

                                for(var i = 1; i < tasks.length; i++) {
                                    document.getElementById('tasks').insertAdjacentHTML('beforeend', '<li><h6 data-task="'+tasks[i]+'">new</h6></li>')
                                }
                                
                                saveTodos();
                                document.getElementById('dialog-edit').close();
                            }
                        }
                    });
                    window.createTaskList = function() {
                        const sortList = list => [...list].sort((a, b) => {
                            const A = a.textContent, B = b.textContent;
                            return (A < B) ? -1 : (A > B) ? 1 : 0;
                        });
                        let tasks = document.querySelectorAll('p');
                        for (var i = 0; i < tasks.length; i++) {
                            var task = tasks[i];
                            var li = document.createElement('li');
                            
                            var markup = task.innerHTML.replaceAll('(A)','<span onClick="searchTag(\\'(A)\\')" class="error-text">(A)</span>')
                                .replaceAll('(B)','<span onClick="searchTag(\\'(B)\\')" class="tertiary-text">(B)</span>')
                                .replaceAll('(C)','<span onClick="searchTag(\\'(C)\\')" class="secondary-text">(C)</span>');
                            var words = task.innerHTML.split(' ');
                            var contexts = [];
                            var projects = [];
                            for(var j=0; j < words.length; j++) {
                                if(words[j].charAt(0) == '@') {
                                    contexts.push(words[j]);
                                    markup = markup.replaceAll(words[j],'<span onClick="searchTag(\\''+words[j]+'\\')" class="primary-text">' + words[j] + '</span>')
                                }
                                if(words[j].charAt(0) == '+') {
                                    projects.push(words[j]);
                                    markup = markup.replaceAll(words[j],'<span onClick="searchTag(\\''+words[j]+'\\')" class="primary-text">' + words[j] + '</span>')
                                }
                            }
                            li.innerHTML = '<label class="checkbox"><input evt-click="check" data-id="'+i+'" type="checkbox" '+(task.innerHTML.charAt(0) == 'x' ? 'checked' : '')+'><span></span></label><div class="max"><h6 evt-click="edit" data-line-id="'+i+'" data-task="'+task.innerHTML+'" class="small">' + (task.innerHTML.charAt(0) == 'x' ? '<del>' : '') + markup + (task.innerHTML.charAt(0) == 'x' ? '</del>' : '') + '</h6>';
                            
                            task.parentNode.replaceChild(li, task);
                        }
                        const ul = document.getElementById("tasks");
                        const list = ul.querySelectorAll("li");
                        ul.append(...sortList(list));
                        document.getElementById('search').dispatchEvent(new Event("input"));
                    }
                </script>
                ${decryptNotes(`
                    let element = document.querySelector('.note');
                    var item = {};
                    item.content_text = element.getAttribute('data-content');
                    item.encrypted = element.getAttribute('data-encypted') == 'true' ? true : false;
                    item.content_html = element.getAttribute('data-content');
                    item.id = element.getAttribute('data-id');
                    var result = await note(item,converter);
                    document.getElementById('tasks').innerHTML = item.content_html;
                    window.createTaskList();
                `)}
            `, `todo.txt`, undefined, undefined, `
                <header class="l">
                    <nav>
                        <h5 class="max center-align">todo.txt</h5>
                        <button onclick="addTodo()" class="circle transparent">
                            <i>add</i>
                        </button>
                    </nav>
                </header>
            `), {status: 200, headers: {"content-type": "text/html"} });
        }

        //----------------------------------------------
        // This is the client javascript for decryption
        //----------------------------------------------
        function decryptNotes(custom) {
            return `
            <script type="module">
                const converter = new showdown.Converter({	
                            metadata: true,
                            parseImgDimensions: true,
                            strikethrough: true,
                            tables: true,
                            ghCodeBlocks: true,
                            simpleLineBreaks: true,
                            emoji: true, 
                        });
                if (document.readyState === "loading") {
                    document.addEventListener("DOMContentLoaded", async function(event) {
                        await decryptNotes();
                    });
                }
                else
                {
                    await decryptNotes();
                }
                async function decryptNotes() {
                    ${custom}
                }
                async function note(item, converter) {
                    if(item.encrypted) {
                        const markdown = await decryptWithKey(item.content_text);
                        item.content_text = markdown;
                        item.content_html = converter.makeHtml(markdown);
                        const metadata = converter.getMetadata();
                        if(metadata && metadata.title){
                            item.title = metadata.title;
                        } else {
                            item.title = strip(item.content_html).substring(0,25) + '...'
                        }
                        if(metadata && metadata.tags){
                            item.tags = metadata.tags;
                        } else {
                            item.tags = '';
                        }
                        if(metadata && metadata.type){
                            item.type = metadata.type;
                        } else {
                            item.type = '';
                        }
                    } else {
                        item.title = strip(item.content_html).substring(0,25) + '...'
                    }
                    return item;
                }
                function formatDate(dateString) {
                    const date = new Date(dateString);
                    const month = date.toLocaleString('default', { month: 'short' });
                    const day = date.getDate();
                    const year = date.getFullYear();
                    const hours = date.getHours();
                    const minutes = date.getMinutes();
                    const formattedDate = month+' '+day+' '+year+', '+hours+':'+minutes.toString().padStart(2, '0');
                    return formattedDate;
                }
                function strip(html){
                    let doc = new DOMParser().parseFromString(html, 'text/html');
                    return doc.body.textContent || "";
                }
                //--------------------------
                //--------------- ENCRYPTION
                //--------------------------
                function hexStringToArrayBuffer(hexString) {
                    const length = hexString.length / 2;
                    const array_buffer = new ArrayBuffer(length);
                    const uint8_array = new Uint8Array(array_buffer);
                    for (let i = 0; i < length; i++) {
                        const byte = parseInt(hexString.substr(i * 2, 2), 16);
                        uint8_array[i] = byte;
                    }
                    return array_buffer;
                }
                async function decryptWithKey(encryptedText) {
                    const imported_key = localStorage.getItem("key") ? await crypto.subtle.importKey(
                        'raw',
                        hexStringToArrayBuffer(localStorage.getItem("key").substr(4)),
                        { name: 'AES-GCM', length: 256 },
                        true,
                        ['encrypt', 'decrypt']
                    ) : '';
                    const encrypted_data = new Uint8Array(atob(encryptedText).split('').map(char => char.charCodeAt(0)));
                    const iv = encrypted_data.slice(0, 12);
                    const ciphertext = encrypted_data.slice(12);

                    const decrypted_buffer = await crypto.subtle.decrypt(
                        { name: 'AES-GCM', iv },
                        imported_key,
                        ciphertext
                    );

                    const decoder = new TextDecoder();
                    const decrypted_text = decoder.decode(decrypted_buffer);
                    return decrypted_text;
                }
                window.encryptWithKey = async function(text) {
                    const imported_key = localStorage.getItem("key") ? await crypto.subtle.importKey(
                        'raw',
                        hexStringToArrayBuffer(localStorage.getItem("key").substr(4)),
                        { name: 'AES-GCM', length: 256 },
                        true,
                        ['encrypt', 'decrypt']
                    ) : '';
                    const iv = crypto.getRandomValues(new Uint8Array(12));
                    const encoder = new TextEncoder();
                    const plaintext_buffer = encoder.encode(text);

                    const ciphertext_buffer = await crypto.subtle.encrypt(
                        { name: 'AES-GCM', iv },
                        imported_key,
                        plaintext_buffer
                    );

                    const encrypted_data = new Uint8Array([...iv, ...new Uint8Array(ciphertext_buffer)]);
                    const base64_encoded = btoa(String.fromCharCode(...encrypted_data));
                    return base64_encoded;
                }
            </script>
            `;
        }

        //--------------------------------------
        // This is the notes list in a notebook
        //--------------------------------------
        if(new URLPattern({ pathname: "/hoxtc/:id" }).exec(req.url)) {
            const id = new URLPattern({ pathname: "/hoxtc/:id" }).exec(req.url).pathname.groups.id;
            console.log(`/notebooks/${id}`);
            const fetching = await fetch(`https://micro.blog/notes/notebooks/${id}`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
            const results = await fetching.json();
            return new Response(HTML(`
                <style>a{width:100%;justify-content:left;}.chip{width: auto;overflow: hidden;text-decoration: none;margin: 0 0.5em 0 0;font-size: smaller;}</style>
                <a id="addLink" href="/zzuh/${id}" style="display:none;"></a>
                <div class="field large prefix round fill active">
                    <i class="front">search</i>
                    <input id="search" onInput="liveSearch('li','search')">
                </div>
                <ul style="columns:2;list-style:none;padding:0;margin:0;">
                    ${results.items.sort((a,b) => (b.date_modified > a.date_modified) ? 1 : ((a.date_modified > b.date_modified) ? -1 : 0)).map((n,i) => {
                        if(i % 2 == 0) {
                            return `
                                <li style="margin-bottom: 1em;break-inside: avoid-column;max-height:275px;height: 100%;overflow: hidden;">
                                    <article class="note"
                                        data-parent="${id}"
                                        data-id="${n.id}" 
                                        data-encypted="${n._microblog.is_encrypted}" 
                                        data-content="${n.content_text ? n.content_text : n.content_html}">
                                        <progress class="circle small"></progress>
                                    </article>
                                </li>
                            `;
                        }
                        return '';
                    }).join('')}
                    ${results.items.sort((a,b) => (b.date_modified > a.date_modified) ? 1 : ((a.date_modified > b.date_modified) ? -1 : 0)).map((n,i) => {
                        if(i % 2 == 0) {
                            return '';
                        }
                        return `
                            <li style="margin-bottom: 1em;break-inside: avoid-column;max-height:275px;height: 100%;overflow: hidden;">
                                <article class="note"
                                    data-parent="${id}"
                                    data-id="${n.id}" 
                                    data-encypted="${n._microblog.is_encrypted}" 
                                    data-content="${n.content_text ? n.content_text : n.content_html}">
                                    <progress class="circle small"></progress>
                                </article>
                            </li>
                        `;
                    }).join('')}
                </ul>
                <script>
                    function addNote() {
                        document.getElementById('addLink').click();
                    }
                </script>
                ${decryptNotes(`
                    let notes = document.querySelectorAll('article');
                    for (var i = 0; i < notes.length; i++) {
                        var element = notes[i];
                        var item = {};
                        item.content_text = element.getAttribute('data-content');
                        item.encrypted = element.getAttribute('data-encypted') == 'true' ? true : false;
                        item.content_html = element.getAttribute('data-content');
                        item.id = element.getAttribute('data-id');
                        var result = await note(item,converter);
                        if(item.type == 'todo.txt') {
                            element.innerHTML = '<h6><a style="text-decoration:none;" href="/todo/${id}/'+item.id+'">'+item.title+'</a></h6><hr/><div class="small-space"></div><div>'+(item.tags ? item.tags.replaceAll('[','').replaceAll(']','').split(',').map(t => { return '<button onClick="searchTag(\\'#'+t+'\\')" class="chip fill tiny">#'+t+'</button>' }).join('') : '')+'</div><div class="small-space"></div><div>'+item.content_html+'</div>';
                        } else {
                            element.innerHTML = '<h6><a style="text-decoration:none;" href="/wpii/${id}/'+item.id+'">'+item.title+'</a></h6><hr/><div class="small-space"></div><div>'+(item.tags ? item.tags.replaceAll('[','').replaceAll(']','').split(',').map(t => { return '<button onClick="searchTag(\\'#'+t+'\\')" class="chip fill tiny">#'+t+'</button>' }).join('') : '')+'</div><div class="small-space"></div><div>'+item.content_html+'</div>';
                        }
                    }
                `)}
                `, `Notebooks ${id}`, undefined, undefined, `
                    <header class="l">
                        <nav>
                            <h5 class="max center-align">Notes</h5>
                            <button onclick="addNote()" class="circle transparent">
                                <i>add</i>
                            </button>
                        </nav>
                    </header>
                `), {status: 200, headers: {"content-type": "text/html"} });
        }

        //---------------------------
        // This is the notebook list
        //---------------------------
        if(new URLPattern({ pathname: "/evko" }).exec(req.url)) {
            const fetching = await fetch(`https://micro.blog/notes/notebooks`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
            const results = await fetching.json();
            return new Response(HTML(`
                <style>a{width:100%;justify-content:left;}</style>
                <article id="keyPompt" class="hide">
                    <h5>Private Key</h5>
                    <p>To decypt your micro.blog notes you'll need to have your private key saved.</p>
                    <div class="field border">
                        <input id="key" type="password" placeholder="key">
                    </div>
                    <button evt-click="save" class="border">
                        <span evt-click="save">Save</span>
                    </button>
                </article>
                <script>
                    if(!localStorage.getItem("key")) {
                        document.getElementById('keyPompt').classList.remove('hide');
                    }
                    document.addEventListener("click", async (event) => {
                        if(!event.target.getAttribute('evt-click')) {
                            return;
                        } else {
                            document.getElementById('keyPompt').classList.add('hide');
                            localStorage.setItem("key", document.getElementById('key').value);
                        }
                    });
                </script>
                <ul class="list border">
                    ${results.items.sort((a,b) => (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0)).map(n => {
                        return `
                            <li>
                                <div class="max">
                                    <h6 class="small"><a href="/hoxtc/${n.id}">${n.title}</a></h6>
                                </div>
                            </li>
                        `;
                    }).join('')}
                </ul>`, 'Notebooks', undefined, undefined, `
                <header class="l">
                    <nav>
                        <h5 class="max center-align">Notebooks</h5>
                        <button class="circle transparent">
                            <i>settings</i>
                        </button>
                    </nav>
                </header>
                `), {status: 200, headers: {"content-type": "text/html"} });
        }

        console.log("dashboard...");
        return new Response(HTML(`
            <header class="l">
                <nav>
                    <button class="circle transparent">
                    <i>menu</i>
                    </button>
                    <h5 class="max center-align">Dashboard</h5>
                </nav>
            </header>
            <p>To do...</p>`, 'Dashboard'), {status: 200, headers: {"content-type": "text/html"} });
    } // end authenticated routes...

    if(new URLPattern({ pathname: "/login" }).exec(req.url)) {
        console.log('/login')
        const value = await req.formData();
        const token = value.get('token');
        const expiresOn = new Date();
        expiresOn.setDate(expiresOn.getDate() + 399); //chrome limits to 400 days
        return new Response(HTML(`Thanks for signing in. Redirecting now.`, ' ', '/'), {
            status: 200,
            headers: {
                "content-type": "text/html",
                "set-cookie": `token=${token};SameSite=Lax;Secure;HttpOnly;Expires=${expiresOn.toUTCString()}`
            },
        });
    }

    return new Response(HTML(`
        <article class="medium small-padding">
            <h3>Welcome!</h3>
            <p>Please login with your Micro.blog token</p>
            <div class="padding absolute center middle">
                <form method="post" action="/login">
                    <div class="field border">
                        <input name="token" type="password" placeholder="token">
                    </div>
                    <button class="border">
                        <i>login</i>
                        <span>Login</span>
                    </button>
                </form>
            </div>
        </article>`, 'Login'), {status: 200, headers: {"content-type": "text/html"} });

    // let user = false;
    // const following = [];

    // if(new URLPattern({ pathname: "/logout" }).exec(req.url)) {
    //     const layout = new TextDecoder().decode(await Deno.readFile("signin.html"));
    //     return new Response(layout.replaceAll('{{nonce}}', nonce)
    //           .replace('{{year}}', new Date().getFullYear()),
    //       HTMLHeaders(nonce,`atoken=undefined;SameSite=Lax;Secure;HttpOnly;Expires=Thu, 01 Jan 1970 00:00:00 GMT`));
    // }
    // if(mbToken) {
    //     const mbUser = await mb.getMicroBlogUser(mbToken);

    //     // grab only the info we need
    //     if(mbUser) {

    //         if(_development) {
    //             //console.log(mbUser);
    //         }

    //         user = {};
    //         user.username = mbUser.username;
    //         user.name = mbUser.name;
    //         user.avatar = mbUser.avatar;
    //         user.plan = mbUser.plan;
    //         user.ai = mbUser.is_using_ai && mbUser.is_premium;

    //         const kv = await Deno.openKv();
    //         const userKV = await kv.get([user.username, 'global']);

    //         if(new URLPattern({ pathname: "/offline" }).exec(req.url)) {
    //             return new Response(layout.replaceAll('{{nonce}}', nonce),
    //               HTMLHeaders(nonce));
    //         }

    //         // -----------------------------------------------------
    //         // POSTING endpoints
    //         // -----------------------------------------------------

    //         //------------------
    //         // Reply to timeline
    //         //------------------
    //         if(new URLPattern({ pathname: "/timeline/reply" }).exec(req.url)) {
    //             const value = await req.formData();

    //             const id = value.get('id');
    //             const replyingTo = value.getAll('replyingTo[]');
    //             let content = value.get('content');
        
    //             if(content != null && content != undefined && content != '' && content != 'null' && content != 'undefined') {
    //                 const replies = replyingTo.map(function (reply, i) { return '@' + reply }).join(' ');
    //                 content = replies + ' ' + content;
        
    //                 const posting = await fetch(`https://micro.blog/posts/reply?id=${id}&content=${encodeURIComponent(content)}`, { method: "POST", headers: { "Authorization": "Bearer " + mbToken } });
    //                 if (!posting.ok) {
    //                     console.log(`${user.username} tried to add a reply and ${await posting.text()}`);
    //                 }
        
    //                 return new Response('Reply was sent.', {
    //                     status: 200,
    //                     headers: {
    //                         "content-type": "text/html",
    //                     },
    //                 });
    //             }
        
    //             return new Response('Something went wrong sending the reply.', {
    //                 status: 200,
    //                 headers: {
    //                     "content-type": "text/html",
    //                 },
    //             });
    //         }
            
    //         //-------------
    //         // Post to blog
    //         //-------------
    //         if((new URLPattern({ pathname: "/post/add" })).exec(req.url) && user) {
    //             const value = await req.formData();
    //             const destination = value.get('destination');
    //             const syndicates = value.getAll('syndicate[]');
    //             const categories = value.getAll('category[]');
    //             let content = value.get('content');
    //             const status = value.get('status');
    //             const name = value.get('name');
    //             const replyingTo = value.getAll('replyingTo[]');
    //             const postingType = value.get('postingType');
    //             const omgApi = value.get('omgApi');
    //             const omgAddess = value.get('omgAddess');
    //             const indieToken = value.get('indieToken');
    //             const microPub = value.get('microPub');
    //             const url = value.get('url');

    //             if(url) {
    //                 // this is editing a blog post on M.b.
    //                 const updatePost = {
    //                     action: "update",
    //                     url: url,
    //                     replace: {
    //                         content: [content],
    //                         name: [name],
    //                         category: categories, 
    //                         "post-status": status == 'draft' ? ['draft'] : ['published']
    //                     }
    //                 };
            
    //                 if(destination) {
    //                     updatePost["mp-destination"] = destination;
    //                 }
            
    //                 if(syndicates) {
    //                     updatePost["mp-syndicate-to[]"] = syndicates;
    //                 }
            
    //                 const posting = await fetch(`https://micro.blog/micropub`, { method: "POST", body: JSON.stringify(updatePost), headers: { "Authorization": "Bearer " + accessTokenValue, "Content-Type": "application/json" } });
    //                 if (!posting.ok) {
    //                     console.log(`${user.username} tried to add a post and ${await posting.text()}`);
    //                 }

    //                 return new Response(JSON.stringify({"response":{"message":"Post was edited."}}), JSONHeaders());
    //             }

    //             if(replyingTo) {
    //                 const replies = replyingTo.map(function (reply) { return '@' + reply }).join(', ');
    //                 content = replies + ' ' + content;
    //             }

    //             if(!postingType || postingType === 'mb') {
    //                 const formBody = new URLSearchParams();
    //                 formBody.append("mp-destination", destination);
    //                 formBody.append("h", "entry");
    //                 formBody.append("content", content);
                   
    //                 if(name){
    //                     formBody.append("name", name);
    //                 }
    //                 if(categories.length > 0) {
    //                     categories.forEach((item) => formBody.append("category[]", item));
    //                 }
    //                 if(status == 'draft'){
    //                     formBody.append("post-status", "draft");
    //                 }
    //                 if(syndicates.length > 0) {
    //                     syndicates.forEach((item) => formBody.append("mp-syndicate-to[]", item));
    //                 } else {
    //                     formBody.append("mp-syndicate-to[]", "");
    //                 }
                    
    //                 const posting = await fetch(`https://micro.blog/micropub`, { method: "POST", body: formBody.toString(), headers: { "Authorization": "Bearer " + mbToken, "Content-Type": "application/x-www-form-urlencoded; charset=utf-8" } });
    //                 if (!posting.ok) {
    //                    console.log(`${user.username} tried to add a post and ${await posting.text()}`);
    //                 }
    //                 return new Response(JSON.stringify({"response":{"message":"Post was sent."}}), JSONHeaders());

    //             } else if(postingType === 'statuslog') {
    //                 const posting = await fetch(`https://api.omg.lol/address/${omgAddess}/statuses/`, { method: "POST", body: JSON.stringify({"status": content}), headers: { "Authorization": "Bearer " + omgApi } });
    //                 if (!posting.ok) {
    //                     console.log(`${user.username} tried to add a post and ${await posting.text()}`);
    //                 }
    //                 const data = await posting.json(); 
    //                 return new Response(JSON.stringify(data), JSONHeaders());

    //             }        
    //         }

    //         //-------------
    //         // Upload media
    //         //-------------
    //         if((new URLPattern({ pathname: "/media/upload" })).exec(req.url)) {
    //             const value = await req.formData();
    //             let destination = '';
        
    //             const formData = new FormData();
    //             let fileBlob;  
        
    //             for (const pair of value.entries()) {
    //                 const field = pair[0], val = pair[1];
    //                 if (val instanceof File) {
    //                   fileBlob = new Blob([await val.arrayBuffer()], { 'type': val.contentType });  
    //                   formData.append('file', fileBlob, val.name);
    //                 } else {
    //                   if(field == 'destination') {
    //                     console.log('destination')
    //                     console.log(val)
    //                     const decoded = decodeURI(val);
    //                     formData.append("mp-destination", decoded);
    //                     destination = val;
    //                   }
    //                   if(field == 'redirect') {
    //                     redirect = true;
    //                   }
    //                 }
    //             }
        
    //             let fetching = await fetch(`https://micro.blog/micropub?q=config`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
    //             const config = await fetching.json();
    //             const mediaEndpoint = config["media-endpoint"];
        
    //             fetching = await fetch(mediaEndpoint, { method: "POST", headers: { "Authorization": "Bearer " + mbToken }, body: formData } );
    //             const uploaded = await fetching.json();
    //             const result = {};
    //             result.url = uploaded.url,
    //             result.ai = user.ai;

    //             return new Response(JSON.stringify(result), JSONHeaders());
    //         }

    //         //-------------
    //         // Delete media
    //         //-------------
    //         if((new URLPattern({ pathname: "/media/delete" })).exec(req.url)) {
    //             const value = await req.formData();
    //             const destination = value.get('destination');
    //             const url = value.get('url');
        
    //             const formBody = new URLSearchParams();
    //             formBody.append("mp-destination", destination);
    //             formBody.append('action', 'delete');
    //             formBody.append('url', url);
        
    //             const fetching = await fetch(`https://micro.blog/micropub?q=config`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
    //             const config = await fetching.json();
    //             const mediaEndpoint = config["media-endpoint"];
        
    //             const posting = await fetch(mediaEndpoint, { method: "POST", body: formBody.toString(), headers: { "Authorization": "Bearer " + mbToken, "Content-Type": "application/x-www-form-urlencoded; charset=utf-8" } });
    //             if (!posting.ok) {
    //                 console.log(`${user.username} tried to delete a media item and ${await posting.text()}`);
    //             }
        
    //             return new Response(JSON.stringify({status: 'upload deleted'}), JSONHeaders());
    //         }

    //         //----------
    //         // save Note
    //         //----------
    //         const NOTEBOOKS_UPDATE_ROUTE = new URLPattern({ pathname: "/notebooks/note/update" });
    //         if(NOTEBOOKS_UPDATE_ROUTE.exec(req.url) && user) {
    //             const value = await req.formData();
    //             const text = value.get('text');
    //             const notebook_id = value.get('notebook_id');
    //             const id = value.get('id');
        
    //             const form = new URLSearchParams();
    //             form.append("text", text);
    //             form.append("notebook_id", notebook_id);
        
    //             if(id) {
    //                 form.append("id", id);
    //             }
                               
    //             const posting = await fetch('https://micro.blog/notes', {
    //                 method: "POST",
    //                 body: form.toString(),
    //                 headers: {
    //                     "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
    //                     "Authorization": "Bearer " + mbToken
    //                 }
    //             });

    //             if (!posting.ok) {
    //                 console.log(`${user.username} tried to update a note and ${await posting.text()}`);
    //             }
        
    //             return new Response('note updated', {
    //                 status: 200,
    //                 headers: {
    //                     "content-type": "text/html",
    //                 },
    //             });
    //         }

    //         //--------------
    //         // Delete a Note
    //         //--------------
    //         const NOTEBOOKS_DELETE_ROUTE = new URLPattern({ pathname: "/notebooks/note/delete" });
    //         if(NOTEBOOKS_DELETE_ROUTE.exec(req.url) && user) {
    //             const value = await req.formData();
    //             const id = value.get('id');
        
    //             const form = new URLSearchParams();
    //             form.append("id", id);
                               
    //             const posting = await fetch(`https://micro.blog/notes/${id}`, {
    //                 method: "DELETE",
    //                 headers: {
    //                     "Authorization": "Bearer " + mbToken
    //                 }
    //             });

    //             if (!posting.ok) {
    //                 console.log(`${user.username} tried to delete a note and ${await posting.text()}`);
    //             }
        
    //             return new Response('note deleted', {
    //                 status: 200,
    //                 headers: {
    //                     "content-type": "text/html",
    //                 },
    //             });
    //         }

    //         //--------------------------
    //         // Follow or Unfollow a user
    //         //--------------------------
    //         if((new URLPattern({ pathname: "/users/follow" })).exec(req.url) && user) {
    //             const value = await req.formData();
    //             const username = value.get('username');
    //             let unfollow = value.get('unfollow');
    //             unfollow = unfollow == 'true';
        
    //             const posting = await fetch(`https://micro.blog/users/${unfollow ? 'unfollow' : 'follow'}?username=${username}`, { method: "POST", headers: { "Authorization": "Bearer " + mbToken } });
    //             const result = `User was ${unfollow ? 'unfollowed' : 'followed'}.`;
    //             if (!posting.ok) {
    //                 let error = await posting.text();
    //                 console.log(`${user.username} tried to un/follow ${username} and ${error}`);
    //                 result = error;
    //             }
        
    //             return new Response(result, {
    //                 status: 200,
    //                 headers: {
    //                     "content-type": "text/html",
    //                 },
    //             });    
    //         }

    //         //--------------------------
    //         // Bookmark something
    //         //--------------------------
    //         if(new URLPattern({ pathname: "/bookmarks/new" }).exec(req.url)) {
    //             const value = await req.formData();
    //             const url = value.get('url');
        
    //             const formBody = new URLSearchParams();
    //             formBody.append("h", "entry");
    //             formBody.append("bookmark-of", url);
        
    //             const posting = await fetch(`https://micro.blog/micropub`, {
    //                 method: "POST",
    //                 body: formBody.toString(),
    //                 headers: {"Content-Type": "application/x-www-form-urlencoded; charset=utf-8","Authorization": "Bearer " + mbToken}
    //             });
    //             let message = 'bookmark added';
    //             if (!posting.ok) {
    //                 message = await posting.text();
    //                 console.log(`${user.username} tried to add a bookmark ${url} and ${message}`);
    //             }
    //             return new Response(message, {
    //                 status: 200,
    //                 headers: {
    //                     "content-type": "text/html",
    //                 },
    //             });
    //         }
   
    //         // -----------------------------------------------------
    //         // API endpoints
    //         // -----------------------------------------------------
    //         if((new URLPattern({ pathname: "/api/media/latest" })).exec(req.url)) {
    //             let fetching = await fetch(`https://micro.blog/micropub?q=config`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
    //             const config = await fetching.json();
    //             const mediaEndpoint = config["media-endpoint"];
                
    //             fetching = await fetch(`${mediaEndpoint}?q=source`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
    //             const media = await fetching.json();
    //             return new Response(JSON.stringify(media.items[0]), JSONHeaders());
    //         }

    //         if((new URLPattern({ pathname: "/api/mentions" })).exec(req.url)) {
    //             const fetching = await fetch(`https://micro.blog/posts/mentions`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
    //             const results = await fetching.json();
    //             return new Response(JSON.stringify(results), JSONHeaders());
    //         }

    //         if((new URLPattern({ pathname: "/api/replies" })).exec(req.url)) {
    //             const fetching = await fetch(`https://micro.blog/posts/replies`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
    //             const results = await fetching.json();
    //             return new Response(JSON.stringify(results), JSONHeaders());
    //         }

    //         if((new URLPattern({ pathname: "/api/discover/photos" })).exec(req.url)) {
    //             const fetching = await fetch(`https://micro.blog/posts/discover/photos`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
    //             const results = await fetching.json();
    //             let data = results.items.map(n => {
    //                 let src = n.content_html;
    //                 if(src) {
    //                     src = src.split('src="')[1];
    //                 }
    //                 if(src) {
    //                     src = src.split('"')[0];
    //                 }
    //                 if(src) {
    //                     return { content: `<article class="no-padding">
    //                                         <img class="responsive medium" src="${src}">
    //                                         </article>` };
    //                 }
    //                 return {};
    //             });
    //             return new Response(JSON.stringify(data), JSONHeaders());
    //         }

    //         if((new URLPattern({ pathname: "/api/discover/lillihub" })).exec(req.url)) {
    //             console.log(_lillihubToken);
    //             const results = await mb.getMicroBlogTimelinePostsChronological(_lillihubToken);
    //             console.log(results);
    //             let data = results.map(n => {return { content: utility.postHTML(n) }});
    //             return new Response(JSON.stringify(data), JSONHeaders());
    //         }
            
    //         if((new URLPattern({ pathname: "/api/discover" })).exec(req.url)) {
    //             const fetching = await fetch(`https://micro.blog/posts/discover`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
    //             const results = await fetching.json();
    //             let data = results.items.map(n => {return { content: utility.postHTML(n) }});
    //             return new Response(JSON.stringify(data), JSONHeaders());
    //         }

    //         if((new URLPattern({ pathname: "/api/notebooks" })).exec(req.url)) {
    //             const fetching = await fetch(`https://micro.blog/notes/notebooks`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
    //             const notebooks = await fetching.json();
    //             const data = notebooks.items.sort((a,b) => (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0))
    //             return new Response(JSON.stringify(data), JSONHeaders());
    //         }

    //         if((new URLPattern({ pathname: "/api/following/favorites" })).exec(req.url)) {
    //             console.log(userKV);
    //             return new Response(JSON.stringify(userKV.value && userKV.value.favorites? userKV.value.favorites : []), JSONHeaders());
    //         }

    //         const CHECK_ROUTE = new URLPattern({ pathname: "/api/timeline/check/:id" });
    //         if(CHECK_ROUTE.exec(req.url)) {
    //             const id = CHECK_ROUTE.exec(req.url).pathname.groups.id;
    //             const fetching = await fetch(`https://micro.blog/posts/check?since_id=${id}`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
    //             const results = await fetching.json(); 
    //             return new Response(JSON.stringify(results),JSONHeaders());
    //         }

    //         const MARK_TIMELINE_ROUTE = new URLPattern({ pathname: "/api/timeline/mark/:id" });
    //         if(MARK_TIMELINE_ROUTE.exec(req.url)) {
    //             const id = MARK_TIMELINE_ROUTE.exec(req.url).pathname.groups.id;
    //             const _posting = await fetch(`https://micro.blog/posts/markers?id=${id}&channel=timeline&date_marked=${new Date()}`, { method: "POST", headers: { "Authorization": "Bearer " + mbToken } });
    //             return new Response('Timeline marked', {
    //                 status: 200,
    //                 headers: {
    //                     "content-type": "text/html",
    //                 },
    //             });
    //         }

    //         const GET_PARENT_ROUTE = new URLPattern({ pathname: "/api/timeline/parent/:id" });
    //         if(GET_PARENT_ROUTE.exec(req.url)) {
    //             const id = GET_PARENT_ROUTE.exec(req.url).pathname.groups.id;
    //             const fetching = await fetch(`https://micro.blog/posts/conversation?id=${id}`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
    //             const post = await fetching.json();
    //             return new Response(post.items.slice(0).reverse().map(n => utility.postHTML(n, null, true, id)).join(''), HTMLHeaders());
    //         }

    //         // -----------------------------------------------------
    //         // All other pages
    //         // -----------------------------------------------------
    //         const pages = ["pages", "notebooks", "timeline", "users", "discover", "mentions", "following", "bookmarks", "settings", "replies", "blog", "draft", "uploads", "collections", "webmentions"]
    //         if (pages.some(v => req.url.includes(v)) && !req.url.includes('%3Ca%20href=')) {
    //             let disableCSP = false;
    //             const layout = new TextDecoder().decode(await Deno.readFile("layout.html"));
    //             const parts = req.url.split('/');
    //             let name = parts[parts.length - 1].split('?')[0];
    //             let id = null;
    //             let content = '';
    //             const searchParams = new URLSearchParams(req.url.split('?')[1]);
    //             const destination = searchParams.get('destination');

    //             // following
    //             let fetching = await fetch(`https://micro.blog/users/following/${mbUser.username}`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
    //             let following = await fetching.json();

    //             // check for notebooks route
    //             if(req.url.includes("details")) {
    //                 //------------------
    //                 //  Bookmarks Reader
    //                 //------------------
    //                 id = name;
    //                 name = "details";

    //                 const searchParams = new URLSearchParams(req.url.split('?')[1]);
    //                 const hids = searchParams.get('hids');
    //                 const bid = searchParams.get('bid');
    //                 const rid = searchParams.get('rid');

    //                 let reader = '';
    //                 if(rid) {
    //                     let fetching = await fetch(`https://micro.blog/hybrid/bookmarks/${rid}`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
    //                     const results = await fetching.text(); 
                
    //                     const page = results;                            
    //                     const baseURL = page.split('<base href="')[1].split('"')[0];
    //                     const root = baseURL.split('/');
    //                     root.pop();
    //                     const htmlBody = page.split('<body>')[1].split('</body>')[0];
    //                     reader = htmlBody.split('<div id="content">')[1].split('<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.3/jquery.min.js"></script>')[0];
    //                     reader = reader.replaceAll('src="',`src="${root.join('/')}/`);
    //                 }
            
    //                 if(hids) {
    //                     let ids = [...new Set(hids.split(','))];
    //                     let allHighlights = await mb.getAllFromMicroBlog(mbToken,'https://micro.blog/posts/bookmarks/highlights');
    //                     let matchingHighlights = allHighlights.filter((h) => {return ids.includes(h.id.toString());});
    //                     for(var i = 0; i < matchingHighlights.length; i++) {
    //                         var highlight = matchingHighlights[i];
    //                         reader = reader.replaceAll(highlight.content_text,`<mark>${highlight.content_text}</mark>`);
    //                     }
    //                 }
    //                 const bookmark = (await mb.getAllFromMicroBlog(mbToken, `https://micro.blog/posts/bookmarks`)).filter(b => b.id == bid)[0];

    //                 fetching = await fetch(`https://micro.blog/posts/bookmarks/tags`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
    //                 const tags = (await fetching.json())

    //                 content = `<div id="reader" class="mt-2">${utility.bookmarkReaderHTML(reader, bookmark, tags)}</div>`;
    //             } else if(req.url.includes("bookmarks")) {
    //                 //-----------
    //                 //  Bookmarks
    //                 //-----------
    //                 const searchParams = new URLSearchParams(req.url.split('?')[1]);
    //                 const tag = searchParams.get('tag');
    //                 id = name;
    //                 name = tag ? "bookmarks: " + tag : "bookmarks";

    //                 fetching = await fetch(`https://micro.blog/posts/bookmarks${tag ? `?tag=${tag}` : ''}`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
    //                 const items = (await fetching.json()).items;
    //                 const allHighlights = await mb.getAllFromMicroBlog(mbToken,'https://micro.blog/posts/bookmarks/highlights');
    //                 fetching = await fetch(`https://micro.blog/posts/bookmarks/tags`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
    //                 const tags = (await fetching.json())
    
    //                 for(let i=0; i< items.length; i++) {
    //                     const item = items[i];
    //                     const highlights = allHighlights.filter(h => h.url === item.url);
                        
    //                     item.title = item.content_html.split('</p>')[0].replace('<p>','');
    //                     item.reader = item._microblog.links && item._microblog.links.length > 0 ? item._microblog.links[0].id : null;
    //                     item.highlights = highlights && highlights.length > 0 ? highlights.map(h => h.id) : [];
    //                 }
    //                 content = `<div id="bookmarks" class="mt-2">${utility.bookmarksHTML(items, tags, mbUser.is_premium)}</div>`;
    //             } else if(req.url.includes("settings")) {
    //                 //----------
    //                 //  Settings
    //                 //----------
    //                 name = "settings";
    //                 content = `<div id="settings" class="mt-2">${utility.settingsHTML()}</div>`;
    //             } else if(req.url.includes("discover")) {
    //                 //----------
    //                 //  Discover
    //                 //----------
    //                 id = name;
    //                 name = "discover";
    //                 fetching = await fetch(`https://micro.blog/posts/discover`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
    //                 let tagmoji = await fetching.json();
    //                 // put JSON check here or something.....
    //                 if(id != 'discover') {
    //                     fetching = await fetch(`https://micro.blog/posts/discover${id != "original" ? `/${id}` : ''}`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
    //                     const posts = await fetching.json();
    //                     content = `${utility.timelineHeader('discover')}<div id="discover" class="mt-2">${utility.discoverHTML(posts, tagmoji._microblog.tagmoji)}</div>`;
    //                 } else {
    //                     fetching = await fetch(`https://micro.blog/posts/timeline?count=40`, { method: "GET", headers: { "Authorization": "Bearer " + _lillihubToken } } );
    //                     const posts = await fetching.json();
    //                     content = `${utility.timelineHeader('discover')}
    //                     <p class="text-center m-2 p-2"><a rel="prefetch" swap-target="#main" swap-history="true" href="/discover/original">View the original discover feed</a></p>
    //                     <div id="discover" class="mt-2">${utility.discoverHTML(posts, tagmoji._microblog.tagmoji)}</div>`;
    //                 }
    //             } else if(req.url.includes("users")) {
    //                 //-------
    //                 //  Users
    //                 //-------
    //                 id = name;
    //                 name = "users";
    //                 fetching = await fetch(`https://micro.blog/posts/${id}`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
    //                 const posts = await fetching.json();
    //                 const friend = following.filter(f => f.username == id)[0] ?? null;

    //                 // put JSON check here or something.....
    //                 content = `${utility.timelineHeader('timeline')}
                    
    //                 <div class="bg-dark p-2 m-2">
    //                     <figure class="avatar avatar-lg p-centered">
    //                         <img src="${posts.author.avatar}" loading="lazy">
    //                     </figure>
    //                     <h3 class="title mt-2 text-center">${posts.author.name}</h3>
    //                     <p class="text-center"><a target="_blank" href="${posts.author.url}">${posts.author.url}</a></p>
    //                     <p class="text-center">${posts._microblog.bio}</p>
    //                     ${!friend ? `<p class="text-center"><button data-username="${posts._microblog.username}" class="btn btn-primary followUser">Follow</button></p>
    //                                 <div id="toast-${posts._microblog.username}-follow" class="toast hide">
    //                                     <button data-id="${posts._microblog.username}-follow" class="btn btn-clear float-right clearToast"></button>
    //                                     <div id="toast-username-${posts._microblog.username}-follow">Waiting for server....</div>
    //                                 </div>` : ''}
    //                 </div>
    //                 <div id="user-posts" class="mt-2">${utility.timelineHTML(posts.items.map(n => utility.postHTML(n)).join(''))}</div>
    //                 ${!friend ? '' : `<details class="p-2 m-2">
    //                     <summary class="c-hand">Actions</summary>
    //                     <div class="mt-2"><p><button data-username="${posts._microblog.username}" class="btn btn-danger unfollow">Unfollow</button></p>
    //                     <p>Or <a href="https://micro.blog/${posts._microblog.username}">Mute, block or report user on Micro.blog</a></p>
    //                     <div id="toast-${posts._microblog.username}-unfollow" class="toast hide">
    //                                 <button data-id="${posts._microblog.username}-unfollow" class="btn btn-clear float-right clearToast"></button>
    //                                 <div id="toast-username-${posts._microblog.username}-unfollow">Waiting for server....</div>
    //                             </div>
    //                     </div>
    //                 </details>`}`;

    //             } else if(req.url.includes("versions")) {
    //                 //--------------
    //                 //  Note Version
    //                 //--------------
    //                 id = name;
    //                 name = "version";
    //                 fetching = await fetch(`https://micro.blog/notes/${parts[parts.length - 3]}/versions`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
    //                 const versions = await fetching.json();
    //                 const version = versions.items.filter(v => v.id == id)[0];
    //                 // put JSON check here or something.....
    //                 content = `<p class="text-center">Version ${version.id}</p>
    //                     <div id="version" class="mt-2">${await utility.noteHTML(version,parts[parts.length - 5],versions.items)}</div>
    //                     <details class="accordion">
    //                         <summary class="accordion-header">
    //                             <i class="icon icon-arrow-right mr-1"></i>
    //                             Advanced
    //                         </summary>
    //                         <div class="accordion-body">
    //                             <p class="text-center"><button class="overrideNote btn btn-error btn-sm" data-id="${parts[parts.length - 3]}" data-content="${version.content_text}">Revert to this version</button></p>                          
    //                         </div>
    //                     </details>
    //                 `;
    //             } else if(req.url.includes("notes")) {
    //                 //-------
    //                 //  Notes
    //                 //-------
    //                 id = name;
    //                 name = "note";
    //                 fetching = await fetch(`https://micro.blog/notes/${id}`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
    //                 const note = await fetching.json();
    //                 fetching = await fetch(`https://micro.blog/notes/${id}/versions`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
    //                 const versions = await fetching.json();
    //                 // put JSON check here or something.....
    //                 content = `<div id="note" class="mt-2">${await utility.noteHTML(note,parts[parts.length - 3],versions.items)}</div>`;
    //                 return new Response(new TextDecoder().decode(await Deno.readFile("notebooks.html")).replaceAll('{{nonce}}', nonce)
    //                     .replaceAll('{{pages}}', content)
    //                     .replaceAll('{{avatar}}', mbUser.avatar)
    //                     .replaceAll('{{username}}', mbUser.username)
    //                     .replaceAll('{{pageName}}', `Notebooks`)
    //                 , HTMLHeaders(nonce, null, false));
    //             } else if(req.url.includes("notebooks")) {
    //                 //-----------
    //                 //  Notebooks
    //                 //-----------
    //                 id = name;  
    //                 if(id != 'notebooks') {
    //                     fetching = await fetch(`https://micro.blog/notes/notebooks/${id}`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
    //                     const notes = await fetching.json();
    //                     // put JSON check here or something.....
    //                     content = `<div id="notes-list">${utility.getNotebookHTML(notes.items,id)}</div>`;
    //                 } else {
    //                     fetching = await fetch(`https://micro.blog/notes/notebooks`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
    //                     const notebooks = await fetching.json();
    //                     fetching = await fetch(`https://micro.blog/notes/notebooks/${notebooks.items[0].id}`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
    //                     const notes = await fetching.json();
    //                     content = `<div id="notebook-list">${utility.getNotebookHTML(notes.items,notebooks.items[0].id)}</div>`;

    //                     // content = notebooks.items.sort((a,b) => (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0)).map(element =>
    //                     //     `<li><a rel="prefetch" class="notebook-${element.id}" href="/notebooks/${element.id}" swap-target="#main" swap-history="true">${element.title}</a></li>`).join('');
    //                     // content = `<div id="notebook-list"><ul class="list border">${content}</ul></div>`;
    //                 }
    //                 name = "notebook";
    //                 return new Response(new TextDecoder().decode(await Deno.readFile("notebooks.html")).replaceAll('{{nonce}}', nonce)
    //                     .replaceAll('{{pages}}', content)
    //                     .replaceAll('{{avatar}}', mbUser.avatar)
    //                     .replaceAll('{{username}}', mbUser.username)
    //                     .replaceAll('{{pageName}}', `Notebooks`)
    //                 , HTMLHeaders(nonce, null, false));
    //             } else if(req.url.includes("posts")) {
    //                 //------------------------
    //                 //  Posts / Conversations
    //                 //------------------------
    //                 id = name;
    //                 name = "timeline";
    //                 fetching = await fetch(`https://micro.blog/posts/conversation?id=${id}`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
    //                 const post = await fetching.json();
    //                 const original = post.items.filter(i => i.id == id)[0];
    //                 // put JSON check here or something.....
    //                 content = `<div class="conversation" id="conversation-${id}"
    //                     data-name="${original &&  original.author && original.author._microblog && original.author._microblog.username ? original.author._microblog.username : ''}"
    //                     data-id="${id}"
    //                     data-avatar="${original &&  original.author && original.author.avatar ? original.author.avatar : ''}"
    //                     ><h6>Post</h6>${post.items.slice(0).reverse().map((n,i) => {
    //                         if(i == 1) {
    //                             return '<h6>Replies</h6>' + utility.postHTML(n, null, true, id);
    //                         }
    //                         return utility.postHTML(n, null, true, id)
    //                     }).join('')}</div>`;
    //                 return new Response(new TextDecoder().decode(await Deno.readFile("timeline.html")).replaceAll('{{nonce}}', nonce)
    //                     .replaceAll('{{pages}}', content)
    //                     .replaceAll('{{avatar}}', mbUser.avatar)
    //                     .replaceAll('{{username}}', mbUser.username)
    //                     .replaceAll('{{following}}', following.map(f => { return `<option data-avatar="${f.avatar}" value="${f.username}">${f.name} (@${f.username})</option>`}).join(''))
    //                     .replaceAll('{{pageName}}', `${original &&  original.author && original.author._microblog && original.author._microblog.username ? original.author._microblog.username : ''}'s Post`)
    //                     //.replaceAll('{{editor}}', !req.headers.get("swap-target") ? await utility.getEditor(following, mbUser.username, mbToken, destination) : '')
    //                 , HTMLHeaders(nonce, null, false));

    //             } else if(req.url.includes("timeline")) {
    //                 //----------
    //                 //  Timeline
    //                 //----------
    //                 id = name;
    //                 name = "timeline";
    //                 const posts = await mb.getMicroBlogTimelinePostsChronological(mbToken, id);
    //                 content = `<div id="post-list">${utility.timelineHTML(posts.map(n => utility.postHTML(n)).join(''),posts[posts.length -1].id)}</div>`;
    //                 return new Response(new TextDecoder().decode(await Deno.readFile("timeline.html")).replaceAll('{{nonce}}', nonce)
    //                     .replaceAll('{{pages}}', content)
    //                     .replaceAll('{{avatar}}', mbUser.avatar)
    //                     .replaceAll('{{username}}', mbUser.username)
    //                     .replaceAll('{{pageName}}', 'Timeline')
    //                     .replaceAll('{{following}}', following.map(f => { return `<option data-avatar="${f.avatar}" value="${f.username}">${f.name} (@${f.username})</option>`}).join(''))
    //                     //.replaceAll('{{editor}}', !req.headers.get("swap-target") ? await utility.getEditor(following, mbUser.username, mbToken, destination) : '')
    //                 , HTMLHeaders(nonce, null, false));



    //             } else if(req.url.includes("mentions")) {
    //                 //----------
    //                 //  Mentions
    //                 //----------
    //                 id = name;
    //                 name = "mentions";
    //                 fetching = await fetch(`https://micro.blog/posts/mentions${id != "mentions" ? `?before_id=${id}` : ''}`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );

    //                 const posts = await fetching.json();
    //                 content = `${utility.timelineHeader('mentions')}
    //                     <div id="mentions" class="mt-2">
    //                         <div>
    //                             ${posts.items.map(n => utility.postHTML(n)).join('')}
    //                             <p class="text-center m-2 p-2"><a rel="prefetch" swap-target="#main" swap-history="true" href="/mentions/${posts.items[posts.items.length -1].id}">Load More</a></p>
    //                         </div>
    //                     </div>`;
    //             } else if(req.url.includes("replies")) {
    //                 //----------
    //                 //  Replies
    //                 //----------
    //                 // Using ?before_id= does not work on the replies endpoint
    //                 id = name;
    //                 name = "replies";
    //                 fetching = await fetch(`https://micro.blog/posts/replies`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
    //                 const posts = await fetching.json();
    //                 content = `${utility.timelineHeader('replies')}
    //                     <div id="replies" class="mt-2">
    //                         <div>
    //                             ${posts.items.map(n => utility.postHTML(n)).join('')}
    //                             <p class="text-center m-2 p-2 underlined"><a rel="prefetch" target="_blank" href="https://micro.blog/account/replies">View earlier/manage replies on Micro.blog</a></p>
    //                         </div>
    //                     </div>`;
    //             } else if(req.url.includes("following")) {
    //                 //----------
    //                 //  Following
    //                 //----------
    //                 id = name;
    //                 name = "following";
    //                 fetching = await fetch(`https://micro.blog/users/following/${user.username}`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
    //                 const results = await fetching.json();
            
    //                 const users = results.sort((a,b) => (a.username > b.username) ? 1 : ((b.username > a.username) ? -1 : 0)).map((item) =>
    //                     `<tr>
    //                         <td><figure class="avatar avatar-lg" data-initial="${item.username.substring(0,1)}">
    //                                 <img src="${item.avatar}" loading="lazy">
    //                             </figure>
    //                         </td>
    //                         <td>
    //                             <div class="card-title">${item.name}</div>
    //                             <div class="card-subtitle"><a href="/user/${item.username}" class="text-gray">@${item.username}</a></div>  
    //                         </td>
    //                         <td>${item.username.split('@').length == 1 ? '<span class="chip">Micro.blog</span>' : '<span class="chip">Other</span>'}</td>
    //                     </tr>
    //                     `
    //                 ).join('');

    //                 content = `${utility.timelineHeader('following')}
    //                 <div id="following" class="mt-2">
    //                     <div class="form-group">
    //                         <label class="form-label">Search your followings</label>
    //                         <input data-element="tr" id="search" type="text" class="form-input search" placeholder="...">
    //                     </div>
    //                     <table class="table table-striped">${users}</table>
    //                 </div>`;
    //             } else if(req.url.includes("edit")) {
    //                 //----------
    //                 //  Following
    //                 //----------
    //                 id = name;
    //                 name = "blog";

    //                 fetching = await fetch(`https://micro.blog/micropub?q=config`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
    //                 const config = await fetching.json();
                
    //                 const defaultDestination = config.destination.filter(d => d["microblog-default"])[0] ? config.destination.filter(d => d["microblog-default"])[0].uid : config.destination[0].uid;
    //                 const mpDestination = destination ? destination : defaultDestination;

    //                 fetching = await fetch(`https://micro.blog/micropub?q=source&properties=content&url=${id}&mp-destination=${encodeURIComponent(mpDestination)}`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
    //                 const post = await fetching.json();

    //                 content = `${utility.blogHeader('blog')}
    //                     <div id="editPost" class="mt-2">
    //                         ${await utility.editHTML(post, following, mbUser.username, mbToken, mpDestination)}
    //                     </div>`;
    //             } else if(req.url.includes("uploads")) {
    //                 //-------
    //                 //  Blog
    //                 //-------
    //                 id = name;
    //                 name = "uploads";
    //                 disableCSP = true;

    //                 const searchParams = new URLSearchParams(req.url.split('?')[1]);
    //                 const type = searchParams.get('type');
    //                 const collection = searchParams.get('collection');
    //                 const q = searchParams.get('q');
    //                 const offset = searchParams.get('offset');

    //                 fetching = await fetch(`https://micro.blog/micropub?q=config`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
    //                 const config = await fetching.json();
                
    //                 const defaultDestination = config.destination.filter(d => d["microblog-default"])[0] ? config.destination.filter(d => d["microblog-default"])[0].uid : config.destination[0].uid;
    //                 const mpDestination = destination ? destination : defaultDestination;

    //                 fetching = await fetch(`${config["media-endpoint"]}?q=source${offset ? `&offset=${offset}` : ''}&limit=50000&mp-destination=${encodeURIComponent(mpDestination)}`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
    //                 const results = await fetching.json();

    //                 let nextPage = false;
    //                 let items = results.items
    //                     .filter(p => type ? p.url.includes('.' + type) : true)
    //                     .filter(p => q ? p.alt ? p.alt.includes(q) : false : true);

    //                 if(collection) {
    //                     fetching = await fetch(`${config["media-endpoint"]}?q=source&microblog-collection=https://example.org/collections/${collection}&mp-destination=${encodeURIComponent(mpDestination)}`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
    //                     const collectionUploads = await fetching.json();
    //                     items = collectionUploads.items;
    //                 }

    //                 if(items.length > 25) {
    //                     nextPage = true;
    //                 }

    //                 const fileExtensions = results.items.map(obj => {
    //                     const url = obj.url;
    //                     const extension = url.split('.').pop();
    //                     return extension.trim();
    //                 });
    //                 const uniqueExtensions = new Set(fileExtensions);

    //                 fetching = await fetch(`https://micro.blog/micropub?q=source&mp-destination=${encodeURIComponent(mpDestination)}&mp-channel=collections`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
    //                 const collections = await fetching.json();

    //                 content = `${utility.blogHeader('uploads')}
    //                     <div id="uploads" class="mt-2">
    //                         ${q || collection || type ? `
    //                             <p class="text-center">Filtering on 
    //                                 ${q ? ` term: ${q}` : 
    //                                     collection ? ` collection: ${collections.items.filter(c => c.properties.uid[0] == collection)[0].properties.name[0]}` : 
    //                                     type ? ` type: ${type}` : ''}
    //                                 <a class="btn btn-link btn-action" rel="prefetch" swap-target="#main" swap-history="true" href="/uploads?destination=${encodeURIComponent(mpDestination)}" ><i class="icon icon-cross"></i></a>
    //                             </p>
    //                             ` : ''}
    //                         <div>
    //                             ${utility.getUploadHTML(items.slice(0, 25), config, mpDestination, Array.from(uniqueExtensions), q || type, collections.items)}
    //                         </div>
    //                         <p class="text-center">
    //                             ${offset ? `<a class="btn btn-link" rel="prefetch" swap-target="#main" swap-history="true" href="/uploads?destination=${encodeURIComponent(mpDestination)}&limit=50000${offset ? `&offset=${offset - 25}` : ''}${q ? `&q=${q}` : ''}${type ? `&type=${type}` : ''}" />Previous</a>` :''}
    //                             ${nextPage ? `<a class="btn btn-link" rel="prefetch" swap-target="#main" swap-history="true" href="/uploads?destination=${encodeURIComponent(mpDestination)}&limit=50000&offset=${offset ? offset + 25 : 25}${q ? `&q=${q}` : ''}${type ? `&type=${type}` : ''}" />Next</a>` : '' }
    //                         </p>
    //                     </div>`;

    //                     // fetching = await fetch(`https://micro.blog/micropub?q=category&mp-destination=${encodeURIComponent(mpDestination)}`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
    //                     // const categories = await fetching.json();
    //                     // let nextPage = false;
    //                     // const items = results.items
    //                     //     .filter(p => req.url.includes("blog") ? p.properties["post-status"][0] == 'published' : p.properties["post-status"][0] == 'draft')
    //                     //     .filter(p => category ? p.properties.category ? p.properties.category.includes(category) : false : true )
                        
    //                     // if(items.length > 25) {
    //                     //     nextPage = true;
    //                     // }

    //                     // content = `${utility.blogHeader(req.url.includes("blog") ? 'blog' : 'draft')}
    //                     //     <div id="blog" class="mt-2">
    //                     //         <div>
    //                     //             ${utility.getBlogHTML(items.slice(0, 25),config, mpDestination, categories,q || category || offset)}
    //                     //         </div>
    //                     //         <p class="text-center">
    //                     //             ${offset ? `<a class="btn btn-link" rel="prefetch" swap-target="#main" swap-history="true" href="/blog?destination=${encodeURIComponent(mpDestination)}&limit=50000${offset ? `&offset=${offset - 25}` : ''}${q ? `&q=${q}` : ''}${category ? `&category=${category}` : ''}" />Previous</a>` :''}
    //                     //             ${nextPage ? `<a class="btn btn-link" rel="prefetch" swap-target="#main" swap-history="true" href="/blog?destination=${encodeURIComponent(mpDestination)}&limit=50000&offset=${offset ? offset + 25 : 25}${q ? `&q=${q}` : ''}${category ? `&category=${category}` : ''}" />Next</a>` : '' }
    //                     //         </p>
    //                     //     </div>`;
    //             } else if(req.url.includes("blog") || req.url.includes("drafts")) {
    //                 //-------
    //                 //  Blog
    //                 //-------
    //                 id = name;
    //                 name = "blog";

    //                 const searchParams = new URLSearchParams(req.url.split('?')[1]);
    //                 const category = searchParams.get('category');
    //                 const q = searchParams.get('q');
    //                 const offset = searchParams.get('offset');

    //                 fetching = await fetch(`https://micro.blog/micropub?q=config`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
    //                 const config = await fetching.json();
                
    //                 const defaultDestination = config.destination.filter(d => d["microblog-default"])[0] ? config.destination.filter(d => d["microblog-default"])[0].uid : config.destination[0].uid;
    //                 const mpDestination = destination ? destination : defaultDestination;

    //                     //https://micro.blog/micropub?q=source&filter=daughter&limit=3&offset=2
    //                     fetching = await fetch(`https://micro.blog/micropub?q=source${offset ? `&offset=${offset}` : ''}&limit=50000${q ? `&filter=${encodeURIComponent(q)}` : ''}&mp-destination=${encodeURIComponent(mpDestination)}`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );

    //                     const results = await fetching.json();

    //                     fetching = await fetch(`https://micro.blog/micropub?q=category&mp-destination=${encodeURIComponent(mpDestination)}`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
    //                     const categories = await fetching.json();
    //                     let nextPage = false;
    //                     const items = results.items
    //                         .filter(p => req.url.includes("blog") ? p.properties["post-status"][0] == 'published' : p.properties["post-status"][0] == 'draft')
    //                         .filter(p => category ? p.properties.category ? p.properties.category.includes(category) : false : true )
                        
    //                     if(items.length > 25) {
    //                         nextPage = true;
    //                     }

    //                     content = `${utility.blogHeader(req.url.includes("blog") ? 'blog' : 'draft')}
    //                         <div id="blog" class="mt-2">
    //                             <div>
    //                                 ${utility.getBlogHTML(items.slice(0, 25),config, mpDestination, categories,q || category || offset)}
    //                             </div>
    //                             <p class="text-center">
    //                                 ${offset ? `<a class="btn btn-link" rel="prefetch" swap-target="#main" swap-history="true" href="/blog?destination=${encodeURIComponent(mpDestination)}&limit=50000${offset ? `&offset=${offset - 25}` : ''}${q ? `&q=${q}` : ''}${category ? `&category=${category}` : ''}" />Previous</a>` :''}
    //                                 ${nextPage ? `<a class="btn btn-link" rel="prefetch" swap-target="#main" swap-history="true" href="/blog?destination=${encodeURIComponent(mpDestination)}&limit=50000&offset=${offset ? offset + 25 : 25}${q ? `&q=${q}` : ''}${category ? `&category=${category}` : ''}" />Next</a>` : '' }
    //                             </p>
    //                         </div>`;
    //             } else if(req.url.includes("pages")) {
    //                 //-------
    //                 //  Pages
    //                 //-------
    //                 id = name;
    //                 name = "pages";

    //                 fetching = await fetch(`https://${user.username}.micro.blog/rsd.xml`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
    //                 const result = await fetching.text();

    //                 console.log(result);

    //                 content = `${utility.blogHeader('pages')}
    //                     <div id="pages" class="mt-2">
    //                         <input id="pageXML" type="hidden" value="${result}" />
    //                     </div>`;
    //             } 

    //             return new Response(layout.replaceAll('{{nonce}}', nonce)
    //                 .replaceAll('{{pages}}', content)
    //                 .replaceAll('{{avatar}}', mbUser.avatar)
    //                 .replaceAll('{{pageName}}', name ? String(name).charAt(0).toUpperCase() + String(name).slice(1) : '')
    //                 .replaceAll('{{scriptLink}}', name == 'settings' ? `<script src="/scripts/settings.js" type="text/javascript"></script>` : '')
    //                 .replaceAll('{{editor}}', !req.headers.get("swap-target") ? await utility.getEditor(following, mbUser.username, mbToken, destination) : '')
    //                 .replaceAll('{{premium}}', mbUser.is_premium ? '' : 'hide')
    //             , HTMLHeaders(nonce, null, disableCSP));
    //         }

    //         return new Response(new TextDecoder().decode(await Deno.readFile("notfound.html")),
    //         {
    //             headers: {
    //                 "content-type": "text/html",
    //                 status: 404,
    //             },
    //         });

    //     } else {
    //         return returnBadGateway('Micro.blog did not return a user from the provided token.')
    //     }
    // } else {
    //     // -----------------------------------------------------
    //     // We don't have a user, they can only see the homepage,
    //     // and the authentication routes
    //     // -----------------------------------------------------
    //     if(new URLPattern({ pathname: "/tokenLogin" }).exec(req.url)) {
    //         const layout = new TextDecoder().decode(await Deno.readFile("login.html"));
    //         const state = crypto.randomUUID();
    //         return new Response(
    //             layout.replace('{{nonce}}', nonce)
    //                 .replace('{{state}}', state)
    //                 .replaceAll('{{appURL}}', req.url.endsWith('/') ? req.url.slice(0, -1) : req.url)
    //                 .replace('{{year}}', new Date().getFullYear()),
    //             HTMLHeaders(nonce)
    //         );
    //     } 

    //     if(new URLPattern({ pathname: "/login" }).exec(req.url)) {
    //         const value = await req.formData();
    //         const token = value.get('token');
    //         const expiresOn = new Date();
    //         const accessToken = await encryptMe(token);
    //         expiresOn.setDate( expiresOn.getDate() + 399); //chrome limits to 400 days
                              
    //         const layout = new TextDecoder().decode(await Deno.readFile("loggingIn.html"));
    //         return new Response(layout.replaceAll('{{nonce}}', nonce)
    //               .replace('{{year}}', new Date().getFullYear()),
    //           HTMLHeaders(nonce,`atoken=${accessToken};SameSite=Lax;Secure;HttpOnly;Expires=${expiresOn.toUTCString()}`));
    //     } 

    //     // Is it the redirect back from indieauth?
    //     if(new URLPattern({ pathname: "/auth" }).exec(req.url)) {
    //         const stateCookie = getCookieValue(req, 'state');
    //         const searchParams = new URLSearchParams(req.url.split('?')[1]);
    //         const code = searchParams.get('code');
    //         const state = searchParams.get('state');

    //         if(_development) {
    //             console.log(`code: ${code}, state: ${state} == ${stateCookie}`);
    //         }
    
    //         if(code && stateCookie == state) {
    //             const formBody = new URLSearchParams();
    //             formBody.append("code", code);
    //             formBody.append("client_id", req.url.split('?')[0].replaceAll('auth',''));
    //             formBody.append("grant_type", "authorization_code");
    
    //             const fetching = await fetch('https://micro.blog/indieauth/token', {
    //                 method: "POST",
    //                 body: formBody.toString(),
    //                 headers: {
    //                     "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
    //                     "Accept": "application/json"
    //                 }
    //             });

    //             const response = await fetching.json();
                
    //             if(!response.error && response.access_token) {
    //               const expiresOn = new Date();
    //               const accessToken = await encryptMe(response.access_token);
    //               expiresOn.setDate( expiresOn.getDate() + 399); //chrome limits to 400 days
                                    
    //               const layout = new TextDecoder().decode(await Deno.readFile("loggingIn.html"));
    //               return new Response(layout.replaceAll('{{nonce}}', nonce)
    //                     .replace('{{year}}', new Date().getFullYear()),
    //                 HTMLHeaders(nonce,`atoken=${accessToken};SameSite=Lax;Secure;HttpOnly;Expires=${expiresOn.toUTCString()}`));
    //             }

    //             return returnBadGateway(`Micro.blog indieauth did not return a token. ${response.error} ${response.access_token}`); 
    //         }
    //         return new Response(`Something went wrong. No code returned or state does not match cookie value.`,HTMLHeaders()); 
    //     } 
        
    //     // Is it the homepage?
    //     else if((new URLPattern({ pathname: "/" })).exec(req.url))
    //     {
    //         const layout = new TextDecoder().decode(await Deno.readFile("signin.html"));
    //         const state = crypto.randomUUID();
    //         return new Response(
    //             layout.replace('{{nonce}}', nonce)
    //                 .replace('{{state}}', state)
    //                 .replaceAll('{{appURL}}', req.url.endsWith('/') ? req.url.slice(0, -1) : req.url)
    //                 .replace('{{year}}', new Date().getFullYear()),
    //             HTMLHeaders(nonce, `state=${state};HttpOnly;`)
    //         );
    //     } else {
    //         return new Response('', {
    //             status: 404,
    //         });
    //     }
    // }
});


//********************************************************
// Helper functions... a developer's best friend
// - getCookieValue: get value from a cookie
// - encryptMe: encrypt a string
// - decryptMe: decrypt a string
// - HTMLHeaders: proper csp protected headers
// - returnBadGateway: response if we have a bad API call
//********************************************************

// Takes a request, gets the cookies, and looks for one 
// that has the passed in name. If found, it returns...
// otherwise it returns an empty string.
function getCookieValue(req, name) {
    const cookies = req.headers.get("cookie") ? req.headers.get("cookie").split('; ') : [];
    let cookieValue = cookies.filter(cookie => cookie.includes(`${name}=`));
    cookieValue = cookieValue.length > 0 ? cookieValue[0].split('=')[1] : '';
    return cookieValue;
}

// Takes a decrypted string and then encrypts it with our secret value
// Uses AES-CBC. Returns and array of comma seperated integers.
async function encryptMe(decrypted)
{
    const iv = await crypto.getRandomValues(new Uint8Array(16));
    const key = await crypto.subtle.importKey("jwk", _appSecret, "AES-CBC", true, ["encrypt", "decrypt"]);
    const encrypted = await crypto.subtle.encrypt({name: "AES-CBC", iv}, key, new TextEncoder().encode(decrypted));
    const encryptedBytes = new Uint8Array(encrypted);

    return `${iv.toString()}|${encryptedBytes.toString()}`;
}

// Takes an encrypted string, with our secret, and then descrypts it.
// Returns the decrypted string
async function decryptMe(encrypted)
{
    const key = await crypto.subtle.importKey("jwk", _appSecret, "AES-CBC", true, ["encrypt", "decrypt"]);
    const ivPart = encrypted.split('|')[0];
    const encryptedPart = encrypted.split('|')[1];

    const encryptedBytes = Uint8Array.from(encryptedPart.split(',').map(num => parseInt(num)));
    const iv = Uint8Array.from(ivPart.split(',').map(num => parseInt(num)));
   
    const decrypted = await crypto.subtle.decrypt({name: "AES-CBC", iv}, key, encryptedBytes);
    const decryptedBytes = new Uint8Array(decrypted);
    return new TextDecoder().decode(decryptedBytes);
}

function HTML(content, title, redirect, footer, header) {
    return ` 
    <!doctype html>
    <html lang='en'>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1'>
            ${redirect ? `<meta http-equiv='refresh' content='0; url='${redirect}' />` : ``}
            <title>${title}</title>
            <link href="https://cdn.jsdelivr.net/npm/beercss@3.10.7/dist/cdn/beer.min.css" rel="stylesheet">
            <script type="module" src="/scripts/beer.min.js" type="text/javascript"></script>
            <link rel="stylesheet" href="/styles/main.css">  
            <!--<script type="module" src="https://cdn.jsdelivr.net/npm/beercss@3.10.7/dist/cdn/beer.min.js"></script>-->
            <style>
                iframe {width: 100% !important;height: unset;}
                .hide {display: none !important;}
                .post, .post pre, .post code, .note, .note pre, .note code { overflow-wrap: anywhere; }
                .post a, .note a { text-decoration: underline; display: inline; }
                .post img, .post video, .note img, .note video { max-width: 100%; width: unset; height: unset; }
                .post > img.single  {
                    max-width: calc(100% + (1.2em * 2));
                    height: auto;
                    margin-left: -1rem;
                }
                h1, h2, h3 {
                    font-size: 1.5625rem;
                }
                .chip {padding: 0 .5rem;}
                .clear {clear: both;}
                #swap, .convo { max-width: 80ch; }
                .convo { margin: 0px auto; }
                .mini_cover { float: left; padding-right: 1em; }
                textarea { width: 100%; }
                .avatar { height: 48px !important; width: 48px !important;}
                [data-parent-of] button { display: none; }
                @media only screen and (max-width: 600px) {
                    body {
                        --_left: 0rem !important;
                    }
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
                    background-color: var(--mantle);
                    color: var(--text);
                }
                .grow-wrap > textarea,
                .grow-wrap::after {
                    padding: 0.5rem;
                    font: inherit;
                    grid-area: 1 / 1 / 2 / 2;
                }
                main {
                    width: min(100%, 80ch);
                    max-width: 80ch;
                    margin: 0 auto;
                }
            </style>
        </head>
        <body>
            <nav class="left l">
                <header>
                    <nav>
                        <img src="/lillihub-512.png" class="avatar">
                    </nav>
                </header>
                <a href="/">
                    <i>house</i>
                    <div>Dashboard</div>
                </a>
                <a href="/evko">
                    <i>description</i>
                    <div>Notebooks</div>
                </a>
                <a href="/timeline">
                    <i>view_timeline</i>
                    <div>Timeline</div>
                </a>
            </nav>
            ${header ? header : ''}
            <main>
                ${content}
            </main>
            ${footer ? footer : ''}
        </body>
        <script nonce="{{nonce}}" src="/scripts/showdown.js" type="text/javascript"></script>
        <script nonce="{{nonce}}" src="/scripts/highlight.js" type="text/javascript"></script>
        <script>
            function searchTag(tag) {
                document.getElementById('search').value = tag;
                document.getElementById('search').dispatchEvent(new Event("input"))
            }
            function liveSearch(selector, searchboxId) {
                let cards = document.querySelectorAll(selector)
                let search_query = document.getElementById(searchboxId).value;
                for (var i = 0; i < cards.length; i++) {
                    if(cards[i].textContent.toLowerCase().includes(search_query.toLowerCase())) {
                        cards[i].classList.remove("hide");
                    } else {
                        cards[i].classList.add("hide");
                    }
                }
            }
            document.addEventListener("submit", (event) => {
                event.preventDefault();
                fetch(event.target.action, {
                    method:'post', 
                    body: new FormData(event.target)})
                        .then(r => {
                            if(event.target.getAttribute('data-reload') != 'true') {
                                document.getElementById(event.target.getAttribute('data-id')).click()
                            } else {
                                document.getElementById('dialog-' + event.target.getAttribute('data-id')).close();
                            }
                        });
            });
            document.addEventListener("click", async (event) => {
                if(!event.target.getAttribute('evt-click')) {
                    return;
                } else {
                    if(event.target.getAttribute('evt-click') == 'show') {
                        document.getElementById('dialog-' + event.target.getAttribute('data-id')).showModal();
                    }
                    if(event.target.getAttribute('evt-click') == 'close') {
                        document.getElementById('dialog-' + event.target.getAttribute('data-id')).close();
                    }
                }
            });
        </script>
    </html>    
    `;
}
function flattenPost(post) {
    let regex = /(height|width)=".*?";/gi;
    return {
        id: post.id || 0,
        content_html: formatHTML(post.content_html.replace(regex,'')) || '',
        summary: post.summary || '',
        url: post.url || '',
        date_published: post.date_published || '',
        name: post.author.name || '',
        author_url: post.author.url || '',
        avatar: post.author.avatar || '',
        username: post.author._microblog.username || '',
        date_relative: post._microblog.date_relative || '',
        date_timestamp: post._microblog.date_timestamp || 0,
        is_favorite: post._microblog.is_favorite || false,
        is_bookmark: post._microblog.is_bookmark || false,
        is_deletable: post._microblog.is_deletable || false,
        is_conversation: post._microblog.is_conversation || false,
        is_linkpost: post._microblog.is_linkpost || false,
        is_mention: post._microblog.is_mention || false,
        note: post._microblog.note || false,
        syndication: post._microblog.syndication || [],
    }
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
async function getConversationHTML(id, token, nonce, csp) {
    let fetching = await fetch(`https://micro.blog/posts/conversation?id=${id}`, { method: "GET", headers: { "Authorization": "Bearer " + token } });
    let results = await fetching.json();
    let uniqueRepliers = [...new Set(results.items.map(comment => comment ? comment.author._microblog.username : ''))];
    let replyCheckboxes = uniqueRepliers.map(function (person, i) {
        return `<label class="checkbox large icon"><input ${i == 0 ? `checked="checked"` : ''} type='checkbox' name='replyingTo[]' value='${person}'><span><i><img class="round tiny" src="${results.items.filter(i => i.author._microblog.username == person)[0].author.avatar}"></i><i>done</i></span> @${person}</label>`
    }).join(' ');
    let page = `<div id="conversation-${id}">${results.items.reverse().map((item,i) => {
            item = flattenPost(item);
            return `
                <article class="no-elevate round" data-parent="${id}" data-id="${item.id}">
                    <div class="row top-align">
                        <div class="max">
                            <div>
                                <div class="row">
                                    <img width="48" height="48" class="round avatar" src="${item.avatar}">
                                    <div class="max">
                                        <h6 class="no-margin">${item.name}</h6>
                                        <label class="grey-text">${item.username ? ` <a href="${item.author_url}">@${item.username}</a>` : ''}</label>
                                    </div>
                                </div>
                                <div class="medium-space"></div>
                                <div class="post">${item.content_html}${item.summary}</div>
                                <div class="medium-space"></div>
                                <div>
                                    <nav class="no-space grey-text">
                                        <div class="max"><a class="grey-text" href="${item.url}">${item.date_relative} <i class="tiny">open_in_new</i></a></div>
                                        <button class="transparent circle wave">
                                            <i evt-click="show" data-id="reply-${id}-${item.id}">edit</i>
                                            <menu class="top no-wrap left">
                                                <li evt-click="show" data-id="reply-${id}-${item.id}">Comment <i evt-click="show" data-id="reply-${id}-${item.id}">add_comment</i></li>
                                            </menu>  
                                        </button>
                                    </nav>
                                </div>
                                <dialog id="dialog-reply-${id}-${item.id}" class="bottom">
                                    <header class="fixed front">
                                        <nav>
                                            <div class="max truncate">
                                                <h5>Reply</h5>
                                            </div>
                                            <button evt-click="close" data-id="reply-${id}-${item.id}" class="circle transparent"><i evt-click="close" data-id="reply-${id}-${item.id}">close</i></button>
                                        </nav>
                                    </header>
                                    ${replyForm(item.id,`<label class="checkbox large icon"><input type='checkbox' checked="checked" name='replyingTo[]' value='${item.username}'><span><i><img class="round tiny" src="${item.avatar}"></i><i>done</i></span> @${item.username}</label>`, true)}
                                </dialog>
                            </div>
                        </div>
                    </div>
                </article>
                `;
        }).join('')}
        ${replyForm(id, replyCheckboxes)}</div>`;

    return new Response(HTML(page, 'Conversation'), {
        status: 200,
        headers: {
            "content-type": "text/html",
        },
    });
}
// function getCookieValue(req, name) {
//     const cookies = req.headers.get("cookie") ? req.headers.get("cookie").split('; ') : [];
//     let cookieValue = cookies.filter(cookie => cookie.includes(`${name}=`));
//     cookieValue = cookieValue.length > 0 ? cookieValue[0].split('=')[1] : '';
//     return cookieValue;
// }

// Helper method for returning a proper response header
// can set a cookie if provided
// the uuid is set per request to set a nonce
// function HTMLHeaders(uuid, cookie, disable = false) {
//     const csp = `default-src 'self' micro.blog *.micro.blog *.gravatar.com 'nonce-${uuid}';media-src *;img-src *`;
//     if(disable) {
//         return {
//             headers: {
//                 "content-type": "text/html",
//                 status: 200,
//             },
//         };    
//     }
//     if(!cookie) {
//         return {
//             headers: {
//                 "content-type": "text/html",
//                 status: 200,
//                 "Content-Security-Policy": csp
//             },
//         };
//     }
//     return {
//         headers: {
//             "content-type": "text/html",
//             status: 200,
//             "set-cookie": cookie,
//             "Content-Security-Policy": csp
//         },
//     };
// }

// function JSONHeaders() {
//     return {
//         headers: {
//             "content-type": "text/json",
//             status: 200,
//         },
//     };
// }

// Helper method to return a bad gateway and the reason.
// function returnBadGateway(reason) {
//     return new Response(reason, {
//         status: 502,
//         "content-type": "text/html"
//     });
// }
