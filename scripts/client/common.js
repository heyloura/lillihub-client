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
    var start = el.selectionStart; //index of the first selected character
    var finish = el.selectionEnd; //index of the last selected character
    var allText = el.value;

    var sel = allText.substring(start, finish);
    var newText = allText.substring(0, start)+startTag+sel+endTag+allText.substring(finish, allText.length);

    el.value=newText;
}

function loadEditor(type) {
    document.getElementById('modalContent').innerHTML = document.getElementById('editorTemplate').innerHTML;
    var fragment = document.createDocumentFragment();
    fragment.appendChild(document.getElementById('editor-footer'));
    document.getElementById('modalFooter').appendChild(fragment);

    if(type == "note") {
        document.getElementById('topBarBtns').classList.add('hide');
        document.getElementById('markdownBtns').classList.remove('hide');
        document.getElementById('modalTitle').innerHTML = 'New Note';
        document.getElementById('postName').classList.add('hide');
        document.getElementById('postStatus').classList.add('hide');
        document.getElementById('editor-preview-btn').classList.add('hide');
        document.getElementById('editor-action').classList.add('saveNote');
        document.getElementById('editor-action').innerHTML = 'Save';
    } else {
        // generic post
        fragment = document.createDocumentFragment();
        fragment.appendChild(document.getElementById('topBarBtns'));
        document.getElementById('modalTitle').appendChild(fragment);
        document.getElementById('editor-action').classList.add('savePost');
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

// Load the version
Swap.loaders['#version'] = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const parts = window.location.pathname.split('/');
    const id = parts[2];
    loadVersion();

    return () => {  // unloader function
        alert('version unload');
        if(document.querySelector(`.notebook-${id}`)) {
            document.querySelector(`.notebook-${id}`).classList.remove("active");
        }
    };  
}

function loadVersion() {
    // page set up
    document.title = "Lillihub: Note Vesion";
    document.getElementById('pageActionsBtn').classList.add('hide');
    document.getElementById('actionIcon').classList.remove('icon-plus');
    document.getElementById('actionIcon').classList.remove('icon-edit');
    document.getElementById('actionIcon').classList.add('icon-back');
    const parts = window.location.pathname.split('/');
    const id = parts[2];
    
    if(document.querySelector(`.notebook-${id}`)) {
        document.querySelector(`.notebook-${id}`).classList.add("active");
    }
    
    // decrypt and show
    if(document.querySelector('.decryptMe')) {
        document.querySelectorAll('.decryptMe').forEach(async (element) => {
            const noteId = element.getAttribute('data-id');
            const markdown = await decryptWithKey(element.value, imported_key);
            const html = converter.makeHtml(markdown);
            const metadata = converter.getMetadata();
            const metaDef = objectToTableRows(metadata);
            document.getElementById("titleBar").innerHTML = metadata && metadata.title ? metadata.title.length > 25 ? metadata.title.substring(0,25) + '...' : metadata.title : strip(html).substring(0,25) + '...';
            document.getElementById(`metadata-${noteId}`).insertAdjacentHTML('afterbegin', metaDef);
            document.getElementById('preview').innerHTML = html;
            if(metadata && metadata.background) {
                document.querySelector(`.card-body`).style.background = metadata.background;
            }
            if(metadata && metadata.color) {
                document.querySelector(`.card-body`).style.setProperty('color', metadata.color, 'important');;
            }
            let tags = metadata && metadata.tags ? metadata.tags.replace('[','').replace(']','').split(',') : [];
            document.getElementById(`tags-${noteId}`).innerHTML = metadata && metadata.tags ? tags.map(t => `<span class="chip">${t}</span>`).join('') : ''; 
            hljs.highlightAll();
        });
    } else {
        document.getElementById('preview').innerHTML = html;
        hljs.highlightAll();
    }
}

// Loaded the note list
Swap.loaders['#note-list'] = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const parts = window.location.pathname.split('/');
    const id = parts[parts.length - 1];
    loadNotebook();

    return () => {  // unloader function
        alert('note-list unload');
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
    //document.getElementById('pageActionsBtn').classList.remove('hide');
    document.getElementById('actionIcon').classList.add('icon-plus');
    document.getElementById('actionIcon').classList.remove('icon-edit');

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
                document.querySelector(`article[data-id="${noteId}"] a`).style.setProperty('color', metadata.color, 'important');
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
        alert('note unload');
        if(document.querySelector(`.notebook-${id}`)) {
            document.querySelector(`.notebook-${id}`).classList.remove("active");
        }
    };  
}

function loadNote() {
    // page set up
    document.title = "Lillihub: Note";
    document.getElementById('pageActionsBtn').classList.remove('hide');
    document.getElementById('actionIcon').classList.remove('icon-plus');
    document.getElementById('actionIcon').classList.add('icon-edit');
    const parts = window.location.pathname.split('/');
    const id = parts[2];
    if(document.querySelector(`.notebook-${id}`)) {
        document.querySelector(`.notebook-${id}`).classList.add("active");
    }

    //set up editor
    document.getElementById('topBarBtns').classList.add('hide');
    document.getElementById('postName').classList.add('hide');
    document.getElementById('postStatus').classList.add('hide');
    document.getElementById('editor-action').classList.add('saveNote');
    document.getElementById('editor-action').innerHTML = 'Save';
    
    // decrypt and show
    if(document.querySelector('.decryptMe')) {
        document.querySelectorAll('.decryptMe').forEach(async (element) => {
            const noteId = element.getAttribute('data-id');
            const markdown = await decryptWithKey(element.value, imported_key);
            const html = converter.makeHtml(markdown);
            const metadata = converter.getMetadata();
            const metaDef = objectToTableRows(metadata);
            if(metadata && metadata.background) {
                document.querySelector(`.card-body`).style.background = metadata.background;
            }
            if(metadata && metadata.color) {
                document.querySelector(`.card-body`).style.setProperty('color', metadata.color, 'important');
            }
            let tags = metadata && metadata.tags ? metadata.tags.replace('[','').replace(']','').split(',') : [];
            document.getElementById(`tags-${noteId}`).innerHTML = metadata && metadata.tags ? tags.map(t => `<span class="chip">${t}</span>`).join('') : ''; 
            document.getElementById("titleBar").innerHTML = metadata && metadata.title ? metadata.title.length > 25 ? metadata.title.substring(0,25) + '...' : metadata.title : strip(html).substring(0,25) + '...';
            document.getElementById(`pageAction`).insertAdjacentHTML('afterbegin', `<a rel="prefetch" swap-target="#main" swap-history="true" href="/notebooks/${id}" class="btn btn-link btn-action"><i class="icon icon-back"></i></a>`);
            document.getElementById(`metadata-${noteId}`).insertAdjacentHTML('afterbegin', metaDef);
            document.getElementById('content').innerHTML = markdown;
            document.getElementById('preview').innerHTML = html;
            growTextArea(document.getElementById('content'));
            document.getElementById('content').dispatchEvent(new Event("input"))
            hljs.highlightAll();
        });
    } else {
        document.getElementById('content').innerHTML = document.getElementById("noteContent").value;
        const html = converter.makeHtml(document.getElementById("noteContent").value);
        document.getElementById('preview').innerHTML = html;
        document.getElementById('content').dispatchEvent(new Event("input"))
        growTextArea(document.getElementById('content'));
        hljs.highlightAll();
    }
}

function loadTimeline() {
    document.title = "Lillihub: Timeline";
    document.getElementById("titleBar").innerHTML = "Timeline";
    document.getElementById('pageActionsBtn').classList.add('hide');
    document.querySelector(`#timelineLink`).classList.add("active");
    document.getElementById('actionIcon').classList.add('icon-plus');
    document.getElementById('actionIcon').classList.remove('icon-edit');

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
        alert('post list unload');
        document.querySelector(`#timelineLink`).classList.remove("active");
        if(localStorage.getItem('post_setting') === 'none') {
            document.getElementById('actionBtn').classList.remove('hide');
        }
    };  
}

Swap.loaders['.post'] = () => {
    // document.title = "Lillihub: Timeline";
    // document.getElementById("titleBar").innerHTML = "Timeline";
    // document.querySelector(`#timelineLink`).classList.add("active");
    buildMasonry();
    hljs.highlightAll();

    return () => {  // unloader function
        alert('post unload');
        document.querySelector(`#timelineLink`).classList.remove("active");
    };  
}

Swap.loaders['#discover'] = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = "Lillihub: Discover";
    document.getElementById("titleBar").innerHTML = "Discover";
    document.querySelector(`#discoverLink`).classList.add("active");
    document.getElementById('pageActionsBtn').classList.add('hide');
    document.getElementById('actionIcon').classList.add('icon-plus');
    document.getElementById('actionIcon').classList.remove('icon-edit');
    buildMasonry();
    hljs.highlightAll();

    return () => {  // unloader function
        alert('discover unload');
        document.querySelector(`#discoverLink`).classList.remove("active");
    };  
}

/************************************************************
** Events
*************************************************************/
document.addEventListener("change", (event) => {  
    if(event.target.classList.contains('syndicateChange')) {
        var checkedBoxes = document.querySelectorAll(`input[name="syndicate[]"]:checked`).length;
        var element = document.getElementById('syndicatesDropdown');

        if(checkedBoxes == 0) {
            element.removeAttribute('data-badge');
            element.classList.remove('badge');
        } else {
            element.setAttribute('data-badge', checkedBoxes);
            element.classList.add('badge');
        }
    }
    if(event.target.classList.contains('categoriesChange')) {
        var checkedBoxes = document.querySelectorAll(`input[name="category[]"]:checked`).length;
        var element = document.getElementById('categoriesDropdown');

        if(checkedBoxes == 0) {
            element.removeAttribute('data-badge');
            element.classList.remove('badge');
        } else {
            element.setAttribute('data-badge', checkedBoxes);
            element.classList.add('badge');
        }
    }
});

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
        let id = event.target.getAttribute('id') === 'replybox-input' ? null : event.target.getAttribute('id').split('-')[0];
        let menu;
        if(id) {
            menu = document.getElementById(id + '-replybox-menu'); 
        } else {
            menu = document.getElementById('replybox-menu'); 
        }
        
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
                            <div ${id ? `data-id="${id}"` : ''}
                                data-avatar="${item.getAttribute('data-avatar')}" 
                                data-name="${item.getAttribute('data-name')}" 
                                class="tile tile-centered addUserToReplyBox">
                                    <div ${id ? `data-id="${id}"` : ''} 
                                        data-avatar="${item.getAttribute('data-avatar')}" 
                                        data-name="${item.getAttribute('data-name')}" 
                                        class="tile-icon addUserToReplyBox">
                                            <img ${id ? `data-id="${id}"` : ''} 
                                                data-avatar="${item.getAttribute('data-avatar')}" 
                                                data-name="${item.getAttribute('data-name')}" 
                                                class="avatar avatar-sm addUserToReplyBox" 
                                                src="${item.getAttribute('data-avatar')}">
                                    </div>
                                    <div ${id ? `data-id="${id}"` : ''} 
                                        data-avatar="${item.getAttribute('data-avatar')}" 
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
    if(item.target.classList.contains('editor-upload')) {
        let id = null;
        if(event.target.getAttribute('id') == null) {
            id = event.target.parentNode.getAttribute('id') === 'editor-upload-btn' ? null : event.target.parentNode.getAttribute('id').split('-')[0];
        } else {
            id = event.target.getAttribute('id') === 'editor-upload-btn' ? null : event.target.getAttribute('id').split('-')[0];
        }
        
        const el = window._protected_reference = document.createElement("INPUT");
        el.type = "file";
        document.getElementById(id ? id + '-editor-status' : 'editor-status').innerHTML = `<span class="loading"></span>`;

        el.addEventListener('change', function(ev2) {

            console.log(el.files);
            console.log('size: ' + el.files[0].size /1024 /1024 + ' MB');
            if(el.files[0].size /1024 /1024 > 3) {
                alert('file must be smaller than 3MB');
                document.getElementById(id ? id + '-editor-status' : 'editor-status').innerHTML = '';
                return;
            }

            const formData = new FormData();
            for (let i = 0; i < el.files.length; i++) {
                formData.append('file[]', el.files[i], el.files[i].name);
            }

            document.getElementById(id ? id + '-editor-status' : 'editor-status').innerHTML = `<span class="loading pr-2 mr-2"></span> uploading file...`;
            fetch('/media/upload', { method: "POST", body: formData })
                .then(response => console.log(response.status) || response)
                .then(response => response.json())
                .then(data => {
                    document.getElementById(id ? id + '-editor-status' : 'editor-status').innerHTML = `inserting markdown...`;
                    if(el.files[0].type.includes('image'))
                    {
                        if(data.ai) {
                            document.getElementById(id ? id + '-editor-status' : 'editor-status').innerHTML = `<span class="loading pr-2 mr-2"></span> getting alt text...`;
                        } else {
                            document.getElementById(id ? id + '-content' : 'content').value += `![image alt text](${data.url})`;
                        }
                    } 
                    else 
                    {
                        document.getElementById(id ? id + '-content' : 'content').value += `[link text](${data.url})`;
                    }

                    if(!el.files[0].type.includes('image') || !data.ai) {
                        document.getElementById(id ? id + '-editor-status' : 'editor-status').innerHTML = `done.`;
                    }

                    if(data.ai && el.files[0].type.includes('image'))
                    {
                        setTimeout(async () => {
                            await fetch('/api/media/latest', { method: "GET" })
                                .then(response => console.log(response.status) || response)
                                .then(response => response.json())
                                .then(data => {
                                    document.getElementById(id ? id + '-editor-status' : 'editor-status').innerHTML = `done.`;
                                    document.getElementById(id ? id + '-content' : 'content').value += `![${data.alt}](${data.url})`;
                                    console.log(data);
                                });
                        }, 15 * 1000);
                    }
                    el = window._protected_reference = undefined;
                });
        });
      
        el.click(); // open
    }

    // save a private note.
    if(item.target.classList.contains('saveNote')) {
        document.getElementById('editor-action').classList.remove('saveNote');
        document.body.insertAdjacentHTML('afterbegin', `<div id="loader" class="overlay"><span class="loading d-block p-centered"></span></div>`)
        const parts = window.location.pathname.split('/');

        let note = document.getElementById("content").value;
        let id = document.getElementById('noteId') ? document.getElementById('noteId').value : null;
        let notebookId = parts[2];
        
        const eNote = await encryptWithKey(note, imported_key);
        const form = new URLSearchParams();
        form.append("text", eNote);
        form.append("notebook_id", notebookId);
        if(id != null) {
            form.append("id", id);
        }    

        const posting = await fetch('/notebooks/note/update', {
            method: "POST",
            body: form.toString(),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
            }
        });

        if(id) {
            window.location.href = `/notebooks/${notebookId}/notes/${id}`;
        } else {
            window.location.href = `/notebooks/${notebookId}`;
        }
    }

    // delete a private note.
    if(item.target.classList.contains('deleteNote')) {
        if(confirm('Are you sure you want to delete this note? This cannot be undone.')) {
            document.body.insertAdjacentHTML('afterbegin', `<div id="loader" class="overlay"><span class="loading d-block p-centered"></span></div>`)
            const parts = window.location.pathname.split('/');

            let id = item.target.getAttribute('data-id');
            console.log(id);
            let notebookId = parts[2];
            
            const form = new URLSearchParams();
            form.append("id", id);    
    
            const posting = await fetch('/notebooks/note/delete', {
                method: "POST",
                body: form.toString(),
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
                }
            });
    
            window.location.href = `/notebooks/${notebookId}`;
        }
    }

    // revert to prior version
    if(item.target.classList.contains('overrideNote')) {
        if(confirm('Are you sure you want to revert to this version? This cannot be undone.')) {
            document.body.insertAdjacentHTML('afterbegin', `<div id="loader" class="overlay"><span class="loading d-block p-centered"></span></div>`)
            const parts = window.location.pathname.split('/');

            let id = item.target.getAttribute('data-id');
            let content = item.target.getAttribute('data-content');
            let notebookId = parts[2];
            
            const form = new URLSearchParams();
            form.append("text", content);
            form.append("notebook_id", notebookId);
            form.append("id", id);   
    
            const posting = await fetch('/notebooks/note/update', {
                method: "POST",
                body: form.toString(),
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
                }
            });
    
            window.location.href = `/notebooks/${notebookId}/notes/${id}`;
        }
    }

    // toggle a note
    if(item.target.classList.contains('editor-bold')) {
        let id = null;
        if(item.target.getAttribute('id') == null) {
            id = item.target.parentNode.getAttribute('id') === 'editor-bold-btn' ? null : item.target.parentNode.getAttribute('id').split('-')[0];
        } else {
            id = item.target.getAttribute('id') === 'editor-bold-btn' ? null : item.target.getAttribute('id').split('-')[0];
        }
        getSelectionAndReplace(document.getElementById(id ? id + '-content' : 'content'),'**','**');
    }
    if(item.target.classList.contains('editor-italic')) {
        let id = null;
        if(item.target.getAttribute('id') == null) {
            id = item.target.parentNode.getAttribute('id') === 'editor-italic-btn' ? null : item.target.parentNode.getAttribute('id').split('-')[0];
        } else {
            id = item.target.getAttribute('id') === 'editor-italic-btn' ? null : item.target.getAttribute('id').split('-')[0];
        }
        getSelectionAndReplace(document.getElementById(id ? id + '-content' : 'content'),'*','*');
    }
    if(item.target.classList.contains('editor-code')) {
        let id = null;
        if(item.target.getAttribute('id') == null) {
            id = item.target.parentNode.getAttribute('id') === 'editor-code-btn' ? null : item.target.parentNode.getAttribute('id').split('-')[0];
        } else {
            id = item.target.getAttribute('id') === 'editor-code-btn' ? null : item.target.getAttribute('id').split('-')[0];
        }
        getSelectionAndReplace(document.getElementById(id ? id + '-content' : 'content'),'`','`');
    }
    if(item.target.classList.contains('editor-image')) {
        let id = null;
        if(item.target.getAttribute('id') == null) {
            id = item.target.parentNode.getAttribute('id') === 'editor-image-markdown-btn' ? null : item.target.parentNode.getAttribute('id').split('-')[0];
        } else {
            id = item.target.getAttribute('id') === 'editor-image-markdown-btn' ? null : item.target.getAttribute('id').split('-')[0];
        }
        getSelectionAndReplace(document.getElementById(id ? id + '-content' : 'content'),'![alt text](',')');
    }
    if(item.target.classList.contains('editor-link')) {
        let id = null;
        if(item.target.getAttribute('id') == null) {
            id = item.target.parentNode.getAttribute('id') === 'editor-link-markdown-btn' ? null : item.target.parentNode.getAttribute('id').split('-')[0];
        } else {
            id = item.target.getAttribute('id') === 'editor-link-markdown-btn' ? null : item.target.getAttribute('id').split('-')[0];
        }
        getSelectionAndReplace(document.getElementById(id ? id + '-content' : 'content'),'[link text](',')');
    }
    if(item.target.classList.contains('editor-preview')) {
        // no parent element to worry about
        let id = item.target.getAttribute('id') === 'editor-preview-btn' ? null : item.target.getAttribute('id').split('-')[0];

        document.getElementById('modalContent').innerHTML = converter.makeHtml(document.getElementById(id ? id + '-content' : 'content').value);
        document.getElementById('modalTitle').innerHTML = 'Preview';
        document.getElementById('modal').classList.add("active");
    }
    if(item.target.classList.contains('replyBtn')){
        let name = item.target.getAttribute('data-name');
        let id = item.target.getAttribute('data-id');
        let avatar = item.target.getAttribute('data-avatar');
    
        // Set up the reply area
        document.getElementById('main-' + id).insertAdjacentHTML('beforeend', document.getElementById('editorTemplate').innerHTML.replaceAll('id="',`id="${id}-`));
        let chips = document.getElementById(id + '-replybox-chips'); 

        document.getElementById(id + '-postingName').classList.add('hide');
        document.getElementById(id + '-postingBtns').classList.add("hide");
        document.getElementById(id + '-postName').classList.add("hide");
        document.getElementById(id + '-postStatus').classList.add("hide");
        document.getElementById(id + '-editor-replybox').classList.remove('hide');
        document.getElementById(id + '-topBarBtns').classList.add("hide");

        chips.innerHTML = chips.innerHTML + `<span id="${id}-chip-${name}" class="chip">
                <img class="avatar avatar-sm" src="${avatar}" />@${name}
                <a data-id="${id}" data-name="${name}" class="btn btn-clear replierRemoveChip" href="#" aria-label="Close" role="button"></a>
            </span>`;                    
        document.getElementById(id + '-postId').value = item.target.getAttribute('data-id');
        document.getElementById(id + '-replybox-input').value = '';
        document.getElementById(id + '-replybox-input').focus();
        document.getElementById(id + '-replybox-menu').classList.add('hide');
        document.getElementById(id + '-replybox-checkbox-' + name).checked = true; 
        document.getElementById(id + '-editor-action').classList.add('sendReply');
        document.getElementById(id + '-editor-action').setAttribute('data-id', id);
        document.getElementById(id + '-editor-action').innerHTML = 'Send';
    }
    if(item.target.classList.contains('sendReply')){
        document.body.insertAdjacentHTML('afterbegin', `<div id="loader" class="overlay"><span class="loading d-block p-centered"></span></div>`)
        let id = item.target.getAttribute('data-id');
        let form = document.getElementById(id + '-editor'); 
        fetch("/timeline/reply", { body: new FormData(form), method: "post" })
            .then(response => response.text())
            .then(data => {
                document.getElementById(id + '-editor').remove();
                document.getElementById('loader').remove();
            });
    }
    if(item.target.classList.contains('actionBtn')) {
        // here we vary by page...
        if(window.location.pathname.includes('versions')) {
            history.back();
        } else if(window.location.pathname.includes('notes')) {
            if(window.location.hash == "edit") {
                document.getElementById('actionIcon').classList.remove('icon-back');
                document.getElementById('actionIcon').classList.add('icon-edit');
                window.location.hash = "note";
            } else {
                document.getElementById('actionIcon').classList.remove('icon-edit');
                document.getElementById('actionIcon').classList.add('icon-back');
                window.location.hash = "edit";
            }
        } else if(window.location.pathname.includes('notebooks')) {
            // the action is to add a note
            loadEditor('note');
        } else if(window.location.pathname.includes('timeline')) {
            // the action is to add a post 
            loadEditor();
        }  else if(window.location.pathname.includes('discover')) {
            // the action is to add a post 
            loadEditor();
        } else if(window.location.pathname.includes('users')) {
            // the action is to follow (if not already)?
            loadEditor();
        }
    }
    if(item.target.classList.contains('pageActions')) {
        if(window.location.pathname.includes('notes')) {
            document.getElementById('modalContent').innerHTML = document.getElementById('note-details').innerHTML
            document.getElementById('modalTitle').innerHTML = 'Manage Note';
            document.getElementById('modal').classList.add("active");
        } else if(window.location.pathname.includes('notebooks')) {
            //document.getElementById('modalContent').innerHTML = document.getElementById('note-details').innerHTML
            document.getElementById('modalTitle').innerHTML = 'Manage Notebook';
            document.getElementById('modal').classList.add("active");
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
        let id = item.target.getAttribute('data-id');
        let name = item.target.getAttribute('data-name');
        let avatar = item.target.getAttribute('data-avatar');
        
        if(id) {
            let chips = document.getElementById(id + '-replybox-chips');
            chips.innerHTML = chips.innerHTML + `<span id="${id}-chip-${name}" class="chip">
                <img class="avatar avatar-sm" src="${avatar}" />@${name}
                <a data-id="${id}" data-name="${name}" class="btn btn-clear replierRemoveChip" href="#" aria-label="Close" role="button"></a>
            </span>`; 
            document.getElementById(id + '-replybox-input').value = '';
            document.getElementById(id + '-replybox-input').focus();
            document.getElementById(id + '-replybox-menu').classList.add('hide');
            document.getElementById(id + '-replybox-checkbox-' + name).checked = true; 
        } else {
            let chips = document.getElementById('replybox-chips');
            chips.innerHTML = chips.innerHTML + '<span id="chip-'+name+'" class="chip"><img class="avatar avatar-sm" src="'+avatar+'" />@'+name+'<a data-name="'+name+'" class="btn btn-clear replierRemoveChip" href="#" aria-label="Close" role="button"></a></span>';                    
            document.getElementById('replybox-input').value = '';
            document.getElementById('replybox-input').focus();
            document.getElementById('replybox-menu').classList.add('hide');
            document.getElementById('replybox-checkbox-' + name).checked = true; 
        }
    }
    if(item.target.classList.contains('replierRemoveChip')) {
        item.preventDefault();
        let name = item.target.getAttribute('data-name');
        let id = item.target.getAttribute('data-id');

        if(id) {
            document.getElementById(id + '-chip-' + name).remove(); 
            document.getElementById(id + '-replybox-input').focus();
            document.getElementById(id + '-replybox-menu').classList.add('hide');
            document.getElementById(id + '-replybox-checkbox-' + name).checked = false; 
        } else {
            document.getElementById('chip-' + name).remove(); 
            document.getElementById('replybox-input').focus();
            document.getElementById('replybox-menu').classList.add('hide');
            document.getElementById('replybox-checkbox-' + name).checked = false; 
        }
    }
    if(item.target.classList.contains('closeModal')) {
        closeEditorModal();
    }
    if(item.target.classList.contains('savePost')) {
        item.preventDefault();
        document.body.insertAdjacentHTML('afterbegin', `<div id="loader" class="overlay"><span class="loading d-block p-centered"></span></div>`);
        const form = document.getElementById('editor'); 
        fetch("/post/add", { body: new FormData(form), method: "post" })
            .then(response => response.json())
            .then(data => {
                closeEditorModal();
            }).finally(() => {
                document.getElementById('loader').remove();
            });
        // document.getElementById('post').value = '';
        // document.getElementById('replybox-input-main').value = ''; 
    }
    if(item.target.classList.contains('changeDestination')) {
        document.body.insertAdjacentHTML('afterbegin', `<div id="loader" class="overlay"><span class="loading d-block p-centered"></span></div>`);
        if(confirm('You are navigating away from the page and will lose any changes. Continue?'))
        {
            return true;
        }
        document.getElementById('loader').remove();
        return false;
    }
});


//--------------------------------------------
// For when a user does a manual page refresh
//--------------------------------------------
function loadPage() {
    gestures('main');
    if(window.location.pathname.includes('versions')) { 
        loadVersion();
    } else if(window.location.pathname.includes('notes')) {
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
