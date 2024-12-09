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
function buildCarousel(id, imageArray) 
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
function buildCarousels() {
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
            galleries[i].innerHTML = buildCarousel(id, imageArray);
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
function objectToDefinitionList(obj) {
    const definitionList = document.createElement('dl');
  
    for (const [key, value] of Object.entries(obj)) {
      const term = document.createElement('dt');
      term.textContent = key;
  
      const description = document.createElement('dd');
      description.textContent = value;
  
      definitionList.appendChild(term);
      definitionList.appendChild(description);
    }
  
    return definitionList;
}
function previewFile() {
    var preview = document.querySelector('img');
    var file    = document.querySelector('input[type=file]').files[0];
    var reader  = new FileReader();
  
    reader.onloadend = function () {
      preview.src = reader.result;
    }
  
    if (file) {
      reader.readAsDataURL(file);
    } else {
      preview.src = "";
    }
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
            fetch(href, { headers: new Headers({"swap-target": target}) }).then(r => r.text()).then(html => {
                var tmp = document.createElement('html');
                tmp.innerHTML = html;
                (document.querySelector(target) ?? document.querySelector(fallback)).outerHTML = (tmp.querySelector(target) ?? tmp.querySelector(fallback)).outerHTML;
                if (pushstate)
                    history.pushState({}, "", href);
                register_links();  
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
    const parts = window.location.pathname.split('/');
    const id = parts[parts.length - 1];
    if(document.querySelector(`.notebook-${id}`)) {
        document.querySelector(`.notebook-${id}`).classList.add("active");
    }

    const decryptMeElements = Array.from(document.querySelectorAll('.decryptMe'));
    const promises = decryptMeElements.map(async (element) => {
        const noteId = element.getAttribute('data-id');
        const markdown = await decryptWithKey(element.innerHTML, imported_key);
        const html = converter.makeHtml(markdown);
        const metadata = converter.getMetadata();
        if(metadata && metadata.color) {
            element.style.background = metadata.color;
        }
        document.getElementById(`title-${noteId}`).innerHTML = metadata && metadata.title ? metadata.title : markdown.substring(0,100); 
        document.getElementById(`tags-${noteId}`).innerHTML = metadata && metadata.tags ? metadata.tags : ''; 
        element.innerHTML = html;
    });

    Promise.all(promises)
    .then(() => {
        hljs.highlightAll();
        const macyInstance = Macy({
            container: '#note-list',
            trueOrder: false,
            waitForImages: false,
            margin: 8,
            columns: 3,
            breakAt: {
                1200: 2,
                940: 2,
                520: 1,
                400: 1
            }
        });
    })
    .catch((error) => {
        console.error('Error decrypting elements:', error);
    });
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
            const metaDef = objectToDefinitionList(metadata);
            document.getElementById(`metadata-${noteId}`).appendChild(metaDef);
            document.getElementById('content').innerHTML = markdown;
            document.getElementById('preview').innerHTML = html;
            growTextArea(document.getElementById('content'));
            hljs.highlightAll();

        });
    } else {
        document.getElementById('content').innerHTML = document.getElementById("noteContent").value;
        document.getElementById('preview').innerHTML = html;
        growTextArea(document.getElementById('content'));
        hljs.highlightAll();
    }
}

function loadTimeline() {
    document.querySelector(`#timelineLink`).classList.add("active");
    buildCarousels();
    hljs.highlightAll();

    // const article = document.querySelector('article:first-child');
    // const id = article.getAttribute('data-id');
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
    return timerID;
}

Swap.loaders['#post-list'] = () => {
    const timerID = loadTimeline(); 

    return () => {  // unloader function
        document.querySelector(`#timelineLink`).classList.remove("active");
        clearInterval(timerID);
    };  
}

Swap.loaders['.post'] = () => {
    //window.scrollTo({ top: 0, behavior: 'smooth' });
    //document.querySelector(`#timelineLink`).classList.add("active");
    buildCarousels();
    hljs.highlightAll();

    return () => {  // unloader function
        //document.querySelector(`#timelineLink`).classList.remove("active");
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
});


function loadPage() {
    gestures('main');
    if(window.location.pathname.includes('notes')) {
        loadNote();
    } else if(window.location.pathname.includes('notebooks')) {
        loadNotebook();
    } else if(window.location.pathname.includes('timeline')) {
        loadTimeline(); 
    }       
    //hljs.highlightAll(); 
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
