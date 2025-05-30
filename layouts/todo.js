import { HTML } from "./templates.js";

const colors = ["green-text","greenblue-text", "blue-text", "bluepurple-text", "purple-text", "purplered-text", "red-text", "redorange-text", "orange-text", "orangeyellow-text", "yellowgreen-text"];
const borderColors = ["green-border","greenblue-border", "blue-border", "bluepurple-border", "purple-border", "purplered-border", "red-border", "redorange-border", "orange-border", "orangeyellow-border", "yellowgreen-border"];

export async function TodoTemplate(user, token, id, req, nonce) {
    const searchParams = new URLSearchParams(req.url.split('?')[1]);
    const editId = searchParams.get('id');
    const vid = searchParams.get('vid');



    if(req.url.includes('%3Ca%20href=')){
        return;
    }

    // let fetching = await fetch(`https://micro.blog/micropub?q=config`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
    // const config = await fetching.json();

    // const defaultDestination = config.destination.filter(d => d["microblog-default"])[0] ? config.destination.filter(d => d["microblog-default"])[0].uid : config.destination[0].uid;

    

    let originalValue = '';

    // const fetchingContents = await fetch(`https://micro.blog/notes/notebooks/${id}`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
    // const eNotes = await fetchingContents.json();
    let deleteNote = '';
    let versions = '';
    let viewVersion = '';
    let isShared = false;

    if(vid){
        let fetching = await fetch(`https://micro.blog/notes/${editId}/versions`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
        const results = await fetching.json();
        const eNote = results.items.filter(v => v.id == vid)[0];        
        originalValue = eNote.content_text;
        viewVersion = `<p><mark>Version #${vid}.</mark> Saving this note will override the current version.</p>`
    } else if(editId) {
        let fetching = await fetch(`https://micro.blog/notes/${editId}`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
        const eNote = await fetching.json();
        originalValue = eNote.content_text;
        isShared = eNote._microblog.is_shared;
        deleteNote = `<details>
            <summar>Delete?</summary>
            <form method='POST' action='/note/delete' onsubmit="return confirm('Are you sure you want to delete this note? This action cannot be undone.')">
                <input type="hidden" name="id" value="${editId}" />
                <input type="hidden" name="notebookId" value="${id}" />
                <button type="submit">Delete Note</button>
            </form>
        </details>`;

        fetching = await fetch(`https://micro.blog/notes/${editId}/versions`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
        const results = await fetching.json();

        versions = results && results.items && results.items.length > 0 ? `<details>
            <summary>Versions</summary>
            <table>
            ${results.items.reverse().map((v, i) => `<tr>
                <td>${(new Date(v.date_published).toLocaleString('en-US', { timeZoneName: 'short' })).replace(' UTC','')}</td>
                <td><a rel="prefetch" href="/notes/${id}/update?id=${editId}&vid=${v.id}">${v.id}</a>${i == 0 ? ' (current)' : ''}</td>
            </tr>`).join('')}
            </table>
        </details>` : '';
    }

    const fetchingNotebooks = await fetch(`https://micro.blog/notes/notebooks`, { method: "GET", headers: { "Authorization": "Bearer " + token } } );
    const resultsNotebooks = await fetchingNotebooks.json();
    const notebooks = resultsNotebooks.items.sort((a,b) => (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0)).map((item,i) => {
        return `<div class="tile tile-centered mb-2">
                    <div class="tile-content">
                        <div class="tile-title ${item.id == id ? 'text-bold' : ''}">
                            <a href="/notes/${item.id}" class="${colors[i%11]} ${item.id == id ? borderColors[i%11] : ''}">${item.title}</a>
                        </div>
                    </div>
                </div>`;
    }).join('');

    const content = `
        <div class="tile tile-centered">
            <div class="tile-content">
                <input id="todo-search" class="form-input" type="text" evt-input="search" evt-target=".todo" placeholder="Search Todos">
            </div>
            <div class="tile-action">
                <button class="btn btn-link btn-action btn-lg tooltip tooltip-left" data-tooltip="Edit meta data"><i class="icon icon-edit"></i></button>
                <button class="btn btn-link btn-action btn-lg tooltip tooltip-left" data-tooltip="Download"><i class="icon icon-download"></i></button>
                <button evt-click="add" class="btn btn-link btn-action btn-lg tooltip tooltip-left" data-tooltip="Add todo"><i evt-click="add" class="icon icon-plus"></i></button>
            </div>
        </div>
        <div id="noteContents" class="note small-padding" 
            data-parent="${id}"
            data-id="${editId}" 
            data-encypted="${!isShared}" 
            data-content="${originalValue}">

            <ul class="nav" id="tasks">
                <li class="list border"><progress class="circle small"></progress></li>
            </ul>
        </div>
        <div class="modal modal-lg" id="dialog-edit">
            <span evt-click="close" class="modal-overlay" aria-label="Close"></span>
            <div class="modal-container">
                <div class="modal-header">
                    <button evt-click="close"  class="btn btn-clear float-right" aria-label="Close"></button>
                    <div class="modal-title h5">To do</div>
                </div>
                <div class="modal-body">
                    <div class="content">
                        <input id="lineId" type="hidden" />
                        <textarea class="form-input" id="content"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button id="deleteMe" evt-click='delete' class="btn btn-link btn-action red-text"><i evt-click='delete' class="icon icon-delete"></i></button>
                    <button id="moveBottom" evt-click='moveDown' class="btn btn-link btn-action tooltip tooltip-left" data-tooltip="Move to bottom of the list"><i evt-click='moveDown' class="icon icon-downward"></i></button>
                    <button class="btn btn-primary" evt-click='save'><i evt-click='save' class="icon icon-check"></i> Save</button>  
                </div>
            </div>
        </div>
        <style nonce="${nonce}">
        .list li {overflow:auto;}
        #content {height:50vh;width:100%}
        .horizontal-list {
            overflow-x: auto; /* Enable horizontal scrolling */
            overflow-y: hidden; /* Hide vertical scrolling */
            white-space: nowrap; /* Prevent line wrapping */
            scrollbar-width: none;
        }
        </style>
        <script src="/scripts/todo.js" type="text/javascript"></script>
        ${decryptNotes(`
            // decrypt the main note...
            let element = document.querySelector('.note');
            var item = {};
            item.content_text = element.getAttribute('data-content');
            item.encrypted = element.getAttribute('data-encypted') == 'true' ? true : false;
            item.content_html = element.getAttribute('data-content');
            item.id = element.getAttribute('data-id');
            var result = await note(item,converter);
            document.getElementById('tasks').innerHTML = item.content_html;
            window.createTaskList();
            
            // decrypt the side notes
            let notes = document.querySelectorAll('.notes');
            for (var i = 0; i < notes.length; i++) {
                element = notes[i];
                var item = {};
                item.content_text = element.getAttribute('data-content');
                item.encrypted = element.getAttribute('data-encypted') == 'true' ? true : false;
                item.content_html = element.getAttribute('data-content');
                item.id = element.getAttribute('data-id');
                var result = await note(item,converter);
                if(item.type == 'todo.txt') {
                    element.innerHTML = '<div class="tile-content"><div class="tile-title"><a class="btn btn-link" swap-target="#main-content" swap-history="true" href="/notes/${id}/todo?id='+item.id+'">'+item.title+'</a></div><div class="tile-subtitle">'+(item.tags ? item.tags.replaceAll('[','').replaceAll(']','').split(',').map(t => { return '<span evt-click="search-notes" evt-target="\\'#'+t+'\\'" class="chip c-hand">#'+t+'</span>' }).join('') : '')+'</div></div><div class="tile-action"></div><div class="html hide">'+item.content_html+'</div>';                        
                } else {
                    element.innerHTML = '<div class="tile-content"><div class="tile-title"><a class="btn btn-link" swap-target="#main-content" swap-history="true" href="/notes/${id}/update?id='+item.id+'">'+item.title+'</a></div><div class="tile-subtitle">'+(item.tags ? item.tags.replaceAll('[','').replaceAll(']','').split(',').map(t => { return '<span evt-click="search-notes" evt-target="\\'#'+t+'\\'" class="chip c-hand">#'+t+'</span>' }).join('') : '')+'</div></div><div class="tile-action"></div><div class="html hide">'+item.content_html+'</div>';             
                }
            }
            window.register_links();
        `,nonce)}`;
    
    return HTML(token, `Todo`, `<div id="main-content" data-type="todo" data-parent="${id}" data-id="${editId}" class="m-2 p-2">${content}</div>`, user, '', notebooks, nonce, id, editId);
}

//----------------------------------------------
// This is the client javascript for decryption
//----------------------------------------------
function decryptNotes(custom,nonce) {
    return `
    <script nonce="${nonce}" type="module">
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
            const imported_key = localStorage.getItem("mbKey") ? await crypto.subtle.importKey(
                'raw',
                hexStringToArrayBuffer(localStorage.getItem("mbKey").substr(4)),
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
            const imported_key = localStorage.getItem("mbKey") ? await crypto.subtle.importKey(
                'raw',
                hexStringToArrayBuffer(localStorage.getItem("mbKey").substr(4)),
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