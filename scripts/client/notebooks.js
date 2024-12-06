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
                console.log(data)
                // if(data && data.items.length > 0) {
                //     document.querySelector('.notebook-' + data.items[0].notebook_id).classList.add('active');
                // }
                // document.getElementById('add-0').innerHTML = data;
                // await displayNotes(data);
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
        let noteSection = `<article id=${note.id} class="card">`;
        result += `<tr data-id="${note.id}" class="ripple">`
        if(!note._microblog.is_shared) {
            var html = converter.makeHtml(await decryptWithKey(note.content_text));
            var metadata = converter.getMetadata();
            if(metadata && metadata.title && metadata.tags) {
                noteSection += `<h1>${metadata.title}</h1><p>${metadata.tags.substring(1,metadata.tags.length - 1).split(',').map(t => '<span data-id="'+t+'" class="chip noteTag">'+t+'</span>').join(' ')}</p>${html}`;
                result += `<td data-id="${note.id}">${metadata.title}<br/>${metadata.tags.substring(1,metadata.tags.length - 1).split(',').map(t => '<span data-id="'+t+'" class="chip noteTag">'+t+'</span>').join(' ')}</td>`;
            } else if(metadata && metadata.title) {
                result += `<td data-id="${note.id}">${metadata.title}</td>`;
                noteSection += `<h1>${metadata.title}</h1>${html}`;
            } else if(metadata && metadata.tags) {
                noteSection += `<p>${metadata.tags.substring(1,metadata.tags.length - 1).split(',').map(t => '<span data-id="'+t+'" class="chip noteTag">'+t+'</span>').join(' ')}</p>${html}`;
                result += `<td data-id="${note.id}">${note.id}<br/>${metadata.tags.substring(1,metadata.tags.length - 1).split(',').map(t => '<span data-id="'+t+'" class="chip noteTag">'+t+'</span>').join(' ')}</td>`;
            } else {
                noteSection += html;
                result += `<td data-id="${note.id}">${note.id}</td>`;
            }
            
        } else {
            result += '<td>shared note found....</td>';
        }

        result += '</tr>';
        noteSection += `</article>`;
        document.getElementById('notes').insertAdjacentHTML( 'afterbegin', noteSection);

        //notes
        
        // notes[i].innerHTML = converter.makeHtml(markdown);
        // var metadata = converter.getMetadata();
        // let id = notes[i].getAttribute('data-id');
        // if(metadata) {
        //     if(metadata.title) {
        //         document.getElementById('title-' + id).innerHTML = metadata.title;
        //     }
        //     if(metadata.tags) {
        //         document.getElementById('tags-' + id).innerHTML = metadata.tags.substring(1,metadata.tags.length - 1).split(',').map(t => '<span data-id="'+t+'" class="chip noteTag">'+t+'</span>').join(' ');
        //         metadata.tags.substring(1,metadata.tags.length - 1).split(',').forEach(t => tags.add(t));
        //         }
        //     document.getElementById('metadata-' + id).innerHTML = JSON.stringify(metadata,null,2);
        // }
    }
    document.getElementById('add-0').innerHTML = result + '</table>';
    hljs.highlightAll();
    // const tables = document.querySelectorAll('table');
    // for (var i = 0; i < tables.length; i++) {
    //     tables[i].classList.add('table');
    //     tables[i].classList.add('table-striped');
    // }
    // if(Array.from(tags).length > 0) {
    //     document.getElementById('noteTags').innerHTML = Array.from(tags).map(t => '<span data-id="'+t+'" class="chip noteTag">'+t+'</span> ').join('')
    // }
}

