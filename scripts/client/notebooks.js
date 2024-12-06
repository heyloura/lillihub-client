// set up gesture navigation
let touchstartX = 0
let touchendX = 0
    
function checkDirection() {
  if (touchendX < touchstartX - 50) {
    history.back();
  }
  if (touchendX > touchstartX) return;
}

document.getElementById('Notebooks').addEventListener('touchstart', e => {
  touchstartX = e.changedTouches[0].screenX
})

document.getElementById('Notebooks').addEventListener('touchend', e => {
  touchendX = e.changedTouches[0].screenX
  checkDirection()
})


if(window.location.hash) {
    removeHash();
}

document.addEventListener("DOMContentLoaded", async (event) => {
    if (localStorage.getItem('mbKey')) {
        let parts = window.location.pathname.split('/');
        let id = parts[parts.length - 1];

        fetch(`/api/notebooks/${id}`, { method: "get" })
            .then(async response => response.json())
            .then(async data => {
                console.log(data);
                if(data && data.length > 0) {
                    document.querySelector('.notebook-' + data[0].notebook_id).classList.add('active');
                }
                await displayNotes(data);
            });
    } else {
        document.getElementById('add-0').innerHTML = 'you need to configure your mb key....';
    }
});

document.addEventListener("input", (event) => {  
    if(event.target.classList.contains('search')) {
        // hide the default section...
        // show the rest?
        if(document.getElementById('search').value != '') {
            liveSearch('article', 'search');
            document.querySelector('main').classList.remove('pages');
            document.querySelector('table').classList.add('d-hide');
        } else {
            document.querySelector('main').classList.add('pages');
            document.querySelector('table').classList.remove('d-hide');
        }

    }
});

document.addEventListener("click", (item) => {
    var parentHasClassRipple = findParentHasClassReturnId(item.target, 'ripple')
    if(parentHasClassRipple != 0 || item.target.classList.contains('ripple'), item.target.getAttribute('data-id')) {
        //check if item is an anchor... if yes, bail...
        console.log(item.target.tagName, parentHasClassRipple, item.target.getAttribute('data-id'));
        if(item.target.tagName.toLowerCase() == "a"){
            return;
        }
        const id = parentHasClassRipple && parentHasClassRipple != 0 ?  parentHasClassRipple : item.target.getAttribute('data-id');
        redirectToAnchor(`#${id}`);
    }
});

async function displayNotes(notes) {
    const imported_key = localStorage.getItem("mbKey") ? await crypto.subtle.importKey(
        'raw',
        hexStringToArrayBuffer(localStorage.getItem("mbKey").substr(4)),
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    ) : '';
    
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
    
    async function encryptWithKey(text) {
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

    const converter = new showdown.Converter({metadata: true, openLinksInNewWindow: true, strikethrough:true, tables:true, tasklists:true, emoji:true });
    let tags = new Set();
    let result = '<table class="table">';
    
    for (var i = 0; i < notes.length; i++) {
        let note = notes[i];
        let title = '';
        let tags = '';

        result += `<tr data-id="${note.id}" class="ripple">`
        if(!note._microblog.is_shared) {
            var markdown = await decryptWithKey(note.content_text);
            var html = converter.makeHtml(markdown);
            var metadata = converter.getMetadata();
            if(metadata && metadata.title && metadata.tags) {
                title = metadata.title;
                tags = metadata.tags;
                result += `<td data-id="${note.id}">${metadata.title}<br/>${metadata.tags.substring(1,metadata.tags.length - 1).split(',').map(t => '<span data-id="'+t+'" class="chip noteTag">'+t+'</span>').join(' ')}</td>`;
            } else if(metadata && metadata.title) {
                title = metadata.title;
                result += `<td data-id="${note.id}">${metadata.title}</td>`;
            } else if(metadata && metadata.tags) {
                tags = metadata.tags;
                result += `<td data-id="${note.id}">${note.id}<br/>${metadata.tags.substring(1,metadata.tags.length - 1).split(',').map(t => '<span data-id="'+t+'" class="chip noteTag">'+t+'</span>').join(' ')}</td>`;
            } else {
                result += `<td data-id="${note.id}">${truncate(html, 100)}</td>`;
            }
            
        } else {
            result += '<td>shared note found....</td>';
        }

        result += '</tr>';
        let noteSection = `<div id="${note.id}" class="container">
                        <div class="columns">
                            <div class="column col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-3 col-3">
                                <ul class="menu mb-2">
                                    <li class="divider" data-content="Note Details"></li>
                                    <li class="menu-item">
                                        <a href="#${note.id}-edit" class="btn btn-primary">Edit Note</a>
                                    </li>
                                    <li class="menu-item">
                                        ${title}
                                    </li>
                                    <li class="menu-item">
                                        ${tags}
                                    </li>
                                </ul>
                                <ul class="menu mb-2">
                                    <li class="divider" data-content="Related Bookmarks"></li>
                                    <li class="menu-item">
                                        <a href="/timeline">Bookmark title here....</a>
                                    </li>
                                </ul>
                            </div>
                            <div class="column col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-9 col-9">
                                ${!note._microblog.is_shared ? html : note.content_html}
                            </div>
                        </div>
                    </div><div id="${note.id}-edit"><div class="grow-wrap">
                                    <textarea id="${note.id}-textarea" class="form-input grow-me" rows="3">${markdown}</textarea>
                                </div></div>`;
        document.getElementById('Notebooks').insertAdjacentHTML( 'afterbegin', noteSection);
    }
    document.getElementById('add-0').innerHTML = result + '</table>';
    hljs.highlightAll();
}

function truncate(str, len) {
    // Convert the string to a HTMLString
    var htmlStr = new HTMLString.String(str);

    // Check the string needs truncating
    if (htmlStr.length() <= len) {
        return str;
    }

    // Find the closing tag for the character we are truncating to
    var tags = htmlStr.characters[len - 1].tags();
    var closingTag = tags[tags.length - 1];

    // Find the last character to contain this tag
    for (var index = len; index < htmlStr.length(); index++) {
        if (!htmlStr.characters[index].hasTags(closingTag)) {
            break;
        }
    }

    return htmlStr.slice(0, index);
}