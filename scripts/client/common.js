function growTextArea(el) {
    el.parentNode.dataset.replicatedValue = el.value;
}
function liveSearch(selector, searchboxId) {
    let cards = document.querySelectorAll(selector)
    let search_query = document.getElementById(searchboxId).value;
    for (var i = 0; i < cards.length; i++) {
        if(cards[i].textContent.toLowerCase().includes(search_query.toLowerCase())) {
            cards[i].classList.remove("d-hide");
        } else {
            cards[i].classList.add("d-hide");
        }
    }
}
let touchstartX = 0;
let touchendX = 0;
function checkDirection() {
    if (touchendX < touchstartX - 50) {
        history.back();
    }
    if (touchendX > touchstartX) return;
}
function gestures(elId) {
    // set up gesture navigation
    document.getElementById(elId).addEventListener('touchstart', e => {
        touchstartX = e.changedTouches[0].screenX
    })

    document.getElementById(elId).addEventListener('touchend', e => {
    touchendX = e.changedTouches[0].screenX
        checkDirection()
    })
}
// const findParentHasClassReturnId = (el, className) => {
//     if(!el || !el.parentNode || !el.parentNode.classList) 
//     {
//         return 0;
//     }
//     if(el.parentNode.classList.contains(className)) 
//     {
//         return el.parentNode.getAttribute('id');
//     }
//     return findParentHasClassReturnId(el.parentNode, className);
// }
// function redirectToAnchor(anchor, scrollToTop = true) {
//     var delayInMilliseconds = 400;
//     setTimeout(function() {
//         document.location.hash = anchor;
//         if(scrollToTop) {
//             window.scrollTo({ top: 0, behavior: 'smooth' });
//         }
//     }, delayInMilliseconds);
// }
// function removeHash() { 
//     var scrollV, scrollH, loc = window.location;
//     if ("pushState" in history)
//         history.pushState("", document.title, loc.pathname + loc.search);
//     else {
//         // Prevent scrolling by storing the page's current scroll offset
//         scrollV = document.body.scrollTop;
//         scrollH = document.body.scrollLeft;

//         loc.hash = "";

//         // Restore the scroll offset, should be flicker free
//         document.body.scrollTop = scrollV;
//         document.body.scrollLeft = scrollH;
//     }
// }
function removeHash() { 
    history.pushState("", document.title, window.location.pathname
                                                       + window.location.search);
}
function masonryLayout(id, imageArray) 
{
    let grid = '<div class="masonry-layout columns-2" id="masonry-'+id+'" data-id="'+id+'" >';
    let column1 = '<div class="masonry-column-1">';
    let column2 = '<div class="masonry-column-2">';
    for(var i = 0; i < imageArray.length; i++) {
        let column = i % 2;
        if(column == 0) {
            column1 += '<img data-id="'+id+'" src="'+imageArray[i]+'">';
        }
        if(column == 1) {
            column2 += '<img data-id="'+id+'" src="'+imageArray[i]+'">';
        } 
    }
    return grid + column1 + '</div>' + column2 + '</div>' + '</div>';
}
function buildMasonry() {
    let galleries = document.querySelectorAll('.gallery');

    for(let i = 0; i < galleries.length; i++) {
        let loaded = galleries[i].getAttribute('data-loaded');
        if(!loaded) {
            let id = galleries[i].getAttribute('data-id');
            let imgs = document.querySelectorAll('[data-gallery="'+id+'"]');
            let imageArray = [];
            for(let j = 0; j < imgs.length; j++) {
                imageArray.push(imgs[j].getAttribute('src'));
                imgs[j].remove();
            }
            galleries[i].innerHTML = masonryLayout(id, imageArray);
            galleries[i].setAttribute('data-loaded', 'true');
        }
    }
}
if ('storage' in navigator && 'estimate' in navigator.storage) {
    navigator.storage.estimate().then(({usage, quota}) => {
      console.log(`Using ${usage} out of ${quota} bytes.`);
    }).catch(error => {
      console.error('Loading storage estimate failed:');
      console.log(error.stack);
    });
  } else {
    console.error('navigator.storage.estimate API unavailable.');
}
function objectToTableRows(obj) {
    let html = '';

    for (const [key, value] of Object.entries(obj)) {
        html += `<tr><td>${key}</td><td>${value}</td></tr>`;
    }
  
    return html;
}
function closeEditorModal() {
    document.getElementById('modalTitle').innerHTML = '';
    document.getElementById('modalContent').innerHTML = '';
    document.getElementById('modalFooter').innerHTML = '';
    document.getElementById('modal').classList.remove("active");
}
/***********************
** HANDLE OFFLINE STUFF
************************/
function isReachable(url) {
    return fetch(url, { method: 'HEAD', mode: 'no-cors' })
      .then(function(resp) {
        return resp && (resp.ok || resp.type === 'opaque');
      })
      .catch(function(err) {
        console.warn('[conn test failure]:', err);
      });
}
function getServerUrl() {
    return window.location.origin;
}
function handleConnection(load, offline) {
  if(document.getElementById('offline-notice')) {
    document.getElementById('offline-notice').remove();
  }
  if (navigator.onLine) {
    isReachable(getServerUrl()).then(function(online) {
      if (online) {
        load();
      } else {
        offline();
        document.querySelector('header').insertAdjacentHTML( 'afterbegin', `<div id="offline-notice" class="toast toast-error">
            Looks like you are offline.
        </div>`);
      }
    });
  } else {
    offline();
    document.querySelector('header').insertAdjacentHTML( 'afterbegin', `<div id="offline-notice" class="toast toast-error">
        Looks like you are offline.
    </div>`);
  }
}
window.addEventListener('online', handleConnection(function(){},function(){}));
window.addEventListener('offline', handleConnection(function(){},function(){}));

function clearActiveMenuStyle() {
    document.querySelectorAll('.menu-item > a').forEach(element => {
        element.classList.remove('active');
    });
}
function strip(html){
    let doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
}
function getSelectionAndReplace(el,startTag,endTag) // javascript
{
    console.log("test");
    var start = el.selectionStart; //index of the first selected character
    var finish = el.selectionEnd; //index of the last selected character
    var allText = el.value;

    var sel = allText.substring(start, finish);
    var newText = allText.substring(0, start)+startTag+sel+endTag+allText.substring(finish, allText.length);

    console.log(newText);
    el.value=newText;
}

function loadEditor(type) {
    document.getElementById('modalContent').innerHTML = document.getElementById('editorTemplate').innerHTML;
    var fragment = document.createDocumentFragment();
    fragment.appendChild(document.getElementById('editor-footer'));
    document.getElementById('modalFooter').appendChild(fragment);

    if(type == "reply") {
        // document.getElementById('postingName').classList.add('hide');
        // document.getElementById('postingBtns').classList.add("hide");
        // document.getElementById('postName').classList.add("hide");
        // document.getElementById('postStatus').classList.add("hide");
        // document.getElementById('editor-replybox').classList.remove('hide');
        // document.getElementById('topBarBtns').classList.add("hide");
    } else if(type == "note") {

    } else {
        // generic post
        fragment = document.createDocumentFragment();
        fragment.appendChild(document.getElementById('topBarBtns'));
        document.getElementById('modalTitle').appendChild(fragment);
    }

    if(localStorage.getItem('post_setting'))
    {
        if(localStorage.getItem('post_setting') != 'none') {
            if(localStorage.getItem('post_setting') === 'statuslog' || localStorage.getItem('post_setting') === 'weblog')
            {
                document.getElementById('postingName').innerHTML = `${localStorage.getItem('omg_address')} (${localStorage.getItem('post_setting')})`;
                document.getElementById('postingType').value = localStorage.getItem('post_setting');
                document.getElementById('omgAddess').value = localStorage.getItem('omg_address');
                document.getElementById('omgApi').value = localStorage.getItem('omg_api');

                document.getElementById('markdownBtns').classList.add("hide");
                document.getElementById('postingBtns').classList.add("hide");
                document.getElementById('postName').classList.add("hide");
                document.getElementById('postStatus').classList.add("hide");

            } else if(localStorage.getItem('post_setting') === 'micropub') {
                document.getElementById('postingName').innerHTML = `${localStorage.getItem('indieweb_nickname')} (${localStorage.getItem('post_setting')})`;
                document.getElementById('postingType').value = 'micropub';
                document.getElementById('indieToken').value = localStorage.getItem('indieauth_endpoint');
                document.getElementById('microPub').value = localStorage.getItem('micropub_endpoint');
            } else {
                document.getElementById('postingType').value = 'mb';
            }
        }
    }

    document.getElementById('modal').classList.add("active");
}
/************************************************************
** Swap
** Facilitates AJAX-style navigation in web pages 
** MIT Licence - https://github.com/josephernest/Swap
** UPDATED - https://news.ycombinator.com/item?id=36008516
*************************************************************/
var Swap = (() => {
    "use strict";
    var loaders = {}, unloaders = {};
    register_links();
    new MutationObserver(dom_changes).observe(document.querySelector("html"), { childList: true, subtree: true });
    window.addEventListener("popstate", () => update(location.href, "[swap-history-restore]", false, "body"));
    window.addEventListener("DOMContentLoaded", dom_load);
    function update(href, target, pushstate, fallback = null) {
        if(!href.includes('#')) {
            clearActiveMenuStyle();
            document.body.insertAdjacentHTML('afterbegin', `<div id="loader" class="overlay"><span class="loading d-block p-centered"></span></div>`)
            fetch(href, { headers: new Headers({"swap-target": target}) }).then(r => r.text()).then(html => {
                var tmp = document.createElement('html');
                tmp.innerHTML = html;
                (document.querySelector(target) ?? document.querySelector(fallback)).outerHTML = (tmp.querySelector(target) ?? tmp.querySelector(fallback)).outerHTML;
                if (pushstate)
                    history.pushState({}, "", href);
                register_links();  
                document.getElementById('loader').remove();
                //document.querySelector('.off-canvas-overlay').dispatchEvent(new Event("click"));
            });
        }
    }
    function register_links() {
        for (const elt of document.querySelectorAll('*[swap-target]')) {
            elt.onclick = e => {
                update(elt.getAttribute('href'), elt.getAttribute('swap-target'), elt.getAttribute('swap-history'));
                e.preventDefault();
            }
        }
    }
    function dom_changes(mutations) {
        for (var selector in unloaders)
            for (var m of mutations)
                for (var n of m.removedNodes)
                    if (n.matches && n.querySelector && (n.matches(selector) || n.querySelector(selector))) {
                        unloaders[selector]();
                        delete unloaders[selector];
                    }
        for (var selector in loaders)
            for (var m of mutations)
                for (var n of m.addedNodes) 
                    if (n.matches && n.querySelector && (n.matches(selector) || n.querySelector(selector)))
                            unloaders[selector] = loaders[selector]();
    }
    function dom_load() {
        for (var selector in loaders)
            if (document.querySelector(selector))
                    unloaders[selector] = loaders[selector]();
    }
    return {loaders: loaders};
})();

/************************************************************
** Notebooks
*************************************************************/
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

async function decryptWithKey(encryptedText, imported_key) {
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

async function encryptWithKey(text, imported_key) {
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

const converter = new showdown.Converter({	
    metadata: true,
	parseImgDimensions: true,
	strikethrough: true,
	tables: true,
	ghCodeBlocks: true,
	smoothLivePreview: true,
	simpleLineBreaks: true,
	emoji: true, 
});
const imported_key = localStorage.getItem("mbKey") ? await crypto.subtle.importKey(
    'raw',
    hexStringToArrayBuffer(localStorage.getItem("mbKey").substr(4)),
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
) : '';

// Loaded the note list
Swap.loaders['#note-list'] = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const parts = window.location.pathname.split('/');
    const id = parts[parts.length - 1];
    loadNotebook();

    return () => {  // unloader function
        if(document.querySelector(`.notebook-${id}`)) {
            document.querySelector(`.notebook-${id}`).classList.remove("active");
        }
    };   
}

async function loadNotebook() {
    document.title = "Lillihub: Notes";
    const parts = window.location.pathname.split('/');
    const id = parts[parts.length - 1];
    document.getElementById("titleBar").innerHTML = document.querySelector(`.notebook-${id}`).innerHTML;
    //document.getElementById("pageName").innerHTML = document.querySelector(`.notebook-${id}`).innerHTML;

    // we have a key, decrypt the notes
    if(localStorage.getItem("mbKey")) {
        document.getElementById("privateKeyWarning").classList.add("hide");

        const decryptMeElements = Array.from(document.querySelectorAll('.decryptMe'));
        const promises = decryptMeElements.map(async (element) => {
            const noteId = element.getAttribute('data-id');
            const markdown = await decryptWithKey(element.innerHTML, imported_key);
            const html = converter.makeHtml(markdown);
            const metadata = converter.getMetadata();
            if(metadata && metadata.background) {
                document.querySelector(`article[data-id="${noteId}"]`).style.background = metadata.background;
            }
            if(metadata && metadata.color) {
                document.querySelector(`article[data-id="${noteId}"]`).style.color = metadata.color;
            }
            document.getElementById(`title-${noteId}`).innerHTML = metadata && metadata.title ? metadata.title : strip(html).substring(0,50) + '...'; 
            let tags = metadata && metadata.tags ? metadata.tags.replace('[','').replace(']','').split(',') : [];
            tags.forEach(function(item){
                if(!Array.from(document.getElementById('tags').options).map(option => option.value).includes(item)) {
                    var option = document.createElement('option');
                    option.value = item;
                    document.getElementById('tags').appendChild(option);
                }
             });
            document.getElementById(`tags-${noteId}`).innerHTML = metadata && metadata.tags ? tags.map(t => `<span class="chip">${t}</span>`).join('') : ''; 
            element.innerHTML = html;
        });
    
        Promise.all(promises)
            .then(() => {
                hljs.highlightAll();
            })
            .catch((error) => {
                document.querySelectorAll('.decryptMe').forEach(element => {
                    document.getElementById("privateKeyWarning").classList.remove("hide");
                    document.getElementById("privateKeyWarning").innerHTML = "We ran into an issue decrypting your notes."
                    element.parentNode.classList.remove("hide");
                });
            });

    } else {
        // we don't have a key
        document.querySelectorAll('.decryptMe').forEach(element => {
            element.parentNode.classList.remove("hide");
        });
    }

    if(document.querySelector(`.notebook-${id}`)) {
        document.querySelector(`.notebook-${id}`).classList.add("active");
    }
}

// Loaded the note
Swap.loaders['#note'] = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const parts = window.location.pathname.split('/');
    const id = parts[2];
    loadNote();

    return () => {  // unloader function
        if(document.querySelector(`.notebook-${id}`)) {
            document.querySelector(`.notebook-${id}`).classList.remove("active");
        }
    };  
}

function loadNote() {
    document.title = "Lillihub: Note";
    document.getElementById("titleBar").innerHTML = "Note";
    //document.getElementById("pageName").innerHTML = "Note";
    const parts = window.location.pathname.split('/');
    const id = parts[2];
    if(document.querySelector(`.notebook-${id}`)) {
        document.querySelector(`.notebook-${id}`).classList.add("active");
    }

    if(document.querySelector('.decryptMe')) {
        document.querySelectorAll('.decryptMe').forEach(async (element) => {
            const noteId = element.getAttribute('data-id');
            const markdown = await decryptWithKey(element.value, imported_key);
            const html = converter.makeHtml(markdown);
            const metadata = converter.getMetadata();
            const metaDef = objectToTableRows(metadata);
            document.getElementById(`metadata-${noteId}`).insertAdjacentHTML('afterbegin', metaDef);
            document.getElementById('content').innerHTML = markdown;
            document.getElementById('preview').innerHTML = html;
            growTextArea(document.getElementById('content'));
            document.getElementById('content').dispatchEvent(new Event("input"))
            hljs.highlightAll();

        });
    } else {
        document.getElementById('content').innerHTML = document.getElementById("noteContent").value;
        document.getElementById('preview').innerHTML = html;
        document.getElementById('content').dispatchEvent(new Event("input"))
        growTextArea(document.getElementById('content'));
        hljs.highlightAll();
    }
}

function loadTimeline() {
    document.title = "Lillihub: Timeline";
    document.getElementById("titleBar").innerHTML = "Timeline";
    //document.getElementById("pageName").innerHTML = "Timeline";
    document.querySelector(`#timelineLink`).classList.add("active");
    buildMasonry();
    hljs.highlightAll();

    if(localStorage.getItem('post_setting') === 'none') {
        document.getElementById('actionBtn').classList.add('hide');
    }

    const article = document.querySelector('article:first-child');
    const id = article.getAttribute('data-id');
    // let checks = 0;
    // let count = 0;
    // const timerID = setInterval(function() {
    //     fetch("/api/timeline/check/" + id, { method: "get" })
    //         .then(response => response.json())
    //         .then(data => {
    //             console.log(data);
    //             if(data.count > 0) {
    //                 document.getElementById('toast').classList.remove('hide');
    //                 document.getElementById('showPostCount').innerHTML = data.count;
    //                 count = data.count;
    //                 fetch("/api/timeline/mark/" + document.querySelector('article:first-child').getAttribute('data-id'), { method: "get" })
    //                     .then(response => response.text())
    //                     .then(_data => {});
    //             }     
    //         });
    //     checks++;
    //     if(checks > 40 || count > 40) {
    //         clearInterval(timerID);
    //     }
    // }, 60 * 1000); 
    fetch("/api/timeline/mark/" + id, { method: "get" })
        .then(response => response.text())
        .then(_data => {});
}

Swap.loaders['#post-list'] = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    loadTimeline(); 

    return () => {  // unloader function
        document.querySelector(`#timelineLink`).classList.remove("active");
        if(localStorage.getItem('post_setting') === 'none') {
            document.getElementById('actionBtn').classList.remove('hide');
        }
    };  
}

Swap.loaders['.post'] = () => {
    document.title = "Lillihub: Timeline";
    document.getElementById("titleBar").innerHTML = "Timeline";
    //document.getElementById("pageName").innerHTML = "Timeline";
    document.querySelector(`#timelineLink`).classList.add("active");
    buildMasonry();
    hljs.highlightAll();

    return () => {  // unloader function
        document.querySelector(`#timelineLink`).classList.remove("active");
    };  
}

Swap.loaders['#discover'] = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = "Lillihub: Discover";
    document.getElementById("titleBar").innerHTML = "Discover";
    //document.getElementById("pageName").innerHTML = "Discover";
    document.querySelector(`#discoverLink`).classList.add("active");
    buildMasonry();
    hljs.highlightAll();

    return () => {  // unloader function
        document.querySelector(`#discoverLink`).classList.remove("active");
    };  
}

/************************************************************
** Events
*************************************************************/
document.addEventListener("input", (event) => {  
    if(event.target.classList.contains('grow-me')) {
        growTextArea(event.target);
    }
    if(event.target.classList.contains('search')) {
        if(document.getElementById('search').value != '') {
            liveSearch('article', 'search');
            //document.querySelector('main').classList.remove('pages');
            //document.querySelector('table').classList.add('d-hide');
        } else {
            //document.querySelector('main').classList.add('pages');
            //document.querySelector('table').classList.remove('d-hide');
        }

    }
    if(event.target.classList.contains('replierInput')) {
        let menu = document.getElementById('replybox-menu'); 
        menu.classList.remove('hide');
        var menuItems = menu.children;
        if(!event.target.value)
        {
            menu.classList.add('hide');
        }
        for (var i = 0; i < menuItems.length; i++) {
            var item = menuItems[i];
            if(event.target.value && ('@' + item.getAttribute('data-name')).toLowerCase().includes(event.target.value.toLowerCase())) {
                item.classList.remove('hide');
                item.innerHTML = `
                    <a  data-avatar="${item.getAttribute('data-avatar')}" 
                        data-name="${item.getAttribute('data-name')}" 
                        class="addUserToReplyBox" href="#">
                            <div data-avatar="${item.getAttribute('data-avatar')}" 
                                data-name="${item.getAttribute('data-name')}" 
                                class="tile tile-centered addUserToReplyBox">
                                    <div data-avatar="${item.getAttribute('data-avatar')}" 
                                        data-name="${item.getAttribute('data-name')}" 
                                        class="tile-icon addUserToReplyBox">
                                            <img data-avatar="${item.getAttribute('data-avatar')}" 
                                                data-name="${item.getAttribute('data-name')}" 
                                                class="avatar avatar-sm addUserToReplyBox" 
                                                src="${item.getAttribute('data-avatar')}">
                                    </div>
                                    <div data-avatar="${item.getAttribute('data-avatar')}" 
                                        data-name="${item.getAttribute('data-name')}" 
                                        class="tile-content addUserToReplyBox">@${item.getAttribute('data-name').replaceAll(event.target.value, '<mark>' + event.target.value + '</mark>')}
                                    </div>
                            </div>
                    </a>
                `;
            } else {
                item.classList.add('hide');
            }
        }
    }
});

document.addEventListener("click", async (item) => {
    if(item.target.classList.contains('editor-upload') && document.getElementById("editor-container")) {
        var el = window._protected_reference = document.createElement("INPUT");
        el.type = "file";
        document.getElementById('editor-status').innerHTML = `<span class="loading"></span>`;

        el.addEventListener('change', function(ev2) {

            console.log(el.files);
            console.log('size: ' + el.files[0].size /1024 /1024 + ' MB');
            if(el.files[0].size /1024 /1024 > 3) {
                alert('file must be smaller than 3MB');
                document.getElementById('editor-status').innerHTML = '';
                return;
            }

            const formData = new FormData();
            for (let i = 0; i < el.files.length; i++) {
                formData.append('file[]', el.files[i], el.files[i].name);
            }

            document.getElementById('editor-status').innerHTML = `<span class="loading pr-2 mr-2"></span> uploading file...`;
            fetch('/media/upload', { method: "POST", body: formData })
                .then(response => console.log(response.status) || response)
                .then(response => response.json())
                .then(data => {
                    document.getElementById('editor-status').innerHTML = `inserting markdown...`;
                    if(el.files[0].type.includes('image'))
                    {
                        if(data.ai) {
                            document.getElementById('editor-status').innerHTML = `<span class="loading pr-2 mr-2"></span> getting alt text...`;
                        } else {
                            document.getElementById("content").value += `![image alt text](${data.url})`;
                        }
                    } 
                    else 
                    {
                        document.getElementById("content").value += `[link text](${data.url})`;
                    }

                    if(!el.files[0].type.includes('image') || !data.ai) {
                        document.getElementById('editor-status').innerHTML = `done.`;
                    }

                    if(data.ai && el.files[0].type.includes('image'))
                    {
                        setTimeout(async () => {
                            await fetch('/api/media/latest', { method: "GET" })
                                .then(response => console.log(response.status) || response)
                                .then(response => response.json())
                                .then(data => {
                                    document.getElementById('editor-status').innerHTML = `done.`;
                                    document.getElementById("content").value += `![${data.alt}](${data.url})`;
                                    console.log(data);
                                });
                        }, 30 * 1000);
                    }
                    el = window._protected_reference = undefined;
                });
        });
      
        el.click(); // open
    }

    // save a private note.
    if(item.target.classList.contains('saveNote')) {
        console.log('saveNote');
        const parts = window.location.pathname.split('/');
        let note = document.getElementById("content").value;

        console.log(note);

        let id = document.getElementById('noteId').value;
        let notebookId = parts[2];
        const eNote = await encryptWithKey(note, imported_key);
        const form = new URLSearchParams();
        form.append("text", eNote);
        form.append("notebook_id", notebookId);
        if(id != 0) {
            form.append("id", id);
        }    

        console.log(form.toString());
        const posting = await fetch('/notebooks/note/update', {
            method: "POST",
            body: form.toString(),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
            }
        });
        //should exit edit mode....
        //window.location.href = '/notebooks/${notebook}';
    }

    // toggle a note
    if(item.target.classList.contains('editor-bold')) {
        getSelectionAndReplace(document.getElementById('content'),'**','**');
    }
    if(item.target.classList.contains('editor-italic')) {
        getSelectionAndReplace(document.getElementById('content'),'**','**');
    }
    if(item.target.classList.contains('editor-code')) {
        getSelectionAndReplace(document.getElementById('content'),'`','`');
    }
    if(item.target.classList.contains('editor-image')) {
        getSelectionAndReplace(document.getElementById('content'),'![alt text](',')');
    }
    if(item.target.classList.contains('replyBtn')){
        let name = item.target.getAttribute('data-name');
        let id = item.target.getAttribute('data-id');
        let avatar = item.target.getAttribute('data-avatar');
        let chips = document.getElementById('replybox-chips'); 

        console.log(name, id, avatar);
    
        // Set up the reply area
        document.getElementById('main-' + id).insertAdjacentHTML('beforeend', document.getElementById('editorTemplate').innerHTML.replaceAll('id="editor','id="editor-' + id));
        document.getElementById('postingName').classList.add('hide');
        document.getElementById('postingBtns').classList.add("hide");
        document.getElementById('postName').classList.add("hide");
        document.getElementById('postStatus').classList.add("hide");
        document.getElementById('editor-replybox').classList.remove('hide');
        document.getElementById('topBarBtns').classList.add("hide");

        chips.innerHTML = chips.innerHTML + '<span id="chip-'+name+'" class="chip"><img class="avatar avatar-sm" src="'+avatar+'" />@'+name+'<a data-name="'+name+'" class="btn btn-clear replierRemoveChip" href="#" aria-label="Close" role="button"></a></span>';                    
        document.getElementById('postId').value = item.target.getAttribute('data-id');
        document.getElementById('replybox-input').value = '';
        document.getElementById('replybox-input').focus();
        document.getElementById('replybox-menu').classList.add('hide');
        document.getElementById('replybox-checkbox-' + name).checked = true; 
        document.getElementById('editor-'+id+'-action').classList.add('sendReply');
        document.getElementById('editor-'+id+'-action').classList.add('sendReply');
        document.getElementById('editor-'+id+'-action').innerHTML = 'Send';
        // document.getElementById('modalContent').insertAdjacentHTML('afterbegin',`
        //     ${document.getElementById('header-' + id).innerHTML}<br/>
        //     ${document.getElementById('main-' + id).innerHTML}`);
    }
    if(item.target.classList.contains('sendReply')){
        let form = document.getElementById('editor'); 
        fetch("/timeline/reply", { body: new FormData(form), method: "post" })
            .then(response => response.text())
            .then(data => {
                closeEditorModal();
            });
    }
    if(item.target.classList.contains('actionBtn')) {
        //alert('action btn click:' + window.location.pathname);
        // here we vary by page...
        if(window.location.pathname.includes('notes')) {
            // the action is to edit a note
        } else if(window.location.pathname.includes('notebooks')) {
            // the action is to add a note
        } else if(window.location.pathname.includes('timeline')) {
            // the action is to add a post 
            loadEditor();
        }  else if(window.location.pathname.includes('discover')) {
            // the action is to add a post 
        } else if(window.location.pathname.includes('users')) {
            // the action is to follow (if not already)?
        }
    }
    if(item.target.classList.contains('toggleMainReplyBox')) {
        // need to clear values if toggled
        document.getElementById('editor-replybox').classList.toggle('hide');
        document.getElementById('editor-replybox').classList.add('mb-2');
    }
    if(item.target.classList.contains('addUserToReplyBox')){
        item.preventDefault();
        let name = item.target.getAttribute('data-name');
        let avatar = item.target.getAttribute('data-avatar');
        let chips = document.getElementById('replybox-chips'); 
        chips.innerHTML = chips.innerHTML + '<span id="chip-'+name+'" class="chip"><img class="avatar avatar-sm" src="'+avatar+'" />@'+name+'<a data-name="'+name+'" class="btn btn-clear replierRemoveChip" href="#" aria-label="Close" role="button"></a></span>';                    
        document.getElementById('replybox-input').value = '';
        document.getElementById('replybox-input').focus();
        document.getElementById('replybox-menu').classList.add('hide');
        document.getElementById('replybox-checkbox-' + name).checked = true; 
    }
    if(item.target.classList.contains('replierRemoveChip')){
        let name = item.target.getAttribute('data-name');
        document.getElementById('chip-' + name).remove(); 
        document.getElementById('replybox-input').focus();
        document.getElementById('replybox-menu').classList.add('hide');
        document.getElementById('replybox-checkbox-' + name).checked = false; 
    }
    if(item.target.classList.contains('closeModal')) {
        closeEditorModal();
    }
    if(item.target.classList.contains('savePost')) {
        item.preventDefault();
        // const form = document.getElementById('mainPost'); 
        // submitPost(new FormData(form));
        // document.getElementById('post').value = '';
        // document.getElementById('replybox-input-main').value = ''; 
    }
});


//--------------------------------------------
// For when a user does a manual page refresh
//--------------------------------------------
function loadPage() {
    gestures('main');
    if(window.location.pathname.includes('notes')) {
        loadNote();
    } else if(window.location.pathname.includes('notebooks')) {
        loadNotebook();
    } else if(window.location.pathname.includes('timeline')) {
        loadTimeline(); 
    }  
    else if(window.location.pathname.includes('discover')) {
        document.title = "Lillihub: Discover";
        document.getElementById("titleBar").innerHTML = "Discover";
        document.querySelector(`#discoverLink`).classList.add("active");
        buildMasonry();
    } else if(window.location.pathname.includes('users')) {
        document.title = "Lillihub: Timeline";
        document.getElementById("titleBar").innerHTML = "Timeline";
        document.querySelector(`#timelineLink`).classList.add("active");
        buildMasonry();
    }

    if(localStorage.getItem('discover_setting') === 'custom') {
        let href = document.getElementById('discoverLink').getAttribute('href');
        document.getElementById('discoverLink').setAttribute('href', href += '/custom');
    }
}
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", async (event) => {
        loadPage();
    });
}
else
{
    loadPage();
}
