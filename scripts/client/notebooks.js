document.addEventListener("DOMContentLoaded", async (event) => {
    //grab the notebooks
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
    
    let loaded = false;
    if(localStorage.getItem('mbKey') && localStorage.getItem('starting_notebook')){
        fetch("/bookmarks/bookmarks", { method: "get" })
            .then(response => response.text())
            .then(data => {
                document.getElementById('add-0').innerHTML = data;
            });
    } else if(localStorage.getItem('mbKey')) {
        fetch("/notebooks/0", { method: "get" })
            .then(response => response.text())
            .then(data => {
                document.getElementById('add-0').innerHTML = data;
            });
    } else {
        document.getElementById('add-0').innerHTML = 'you need to configure your mb key....';
    }

    if(loaded) {
        const converter = new showdown.Converter({metadata: true, openLinksInNewWindow: true, strikethrough:true, tables:true, tasklists:true, emoji:true });
        const notes = document.querySelectorAll('.decryptMe');
        let tags = new Set();
        for (var i = 0; i < notes.length; i++) {
            var markdown = await decryptWithKey(notes[i].innerHTML);
            notes[i].innerHTML = converter.makeHtml(markdown);
            var metadata = converter.getMetadata();
            let id = notes[i].getAttribute('data-id');
            if(metadata) {
                if(metadata.title) {
                    document.getElementById('title-' + id).innerHTML = metadata.title;
                }
                if(metadata.tags) {
                    document.getElementById('tags-' + id).innerHTML = metadata.tags.substring(1,metadata.tags.length - 1).split(',').map(t => '<span data-id="'+t+'" class="chip noteTag">'+t+'</span>').join(' ');
                    metadata.tags.substring(1,metadata.tags.length - 1).split(',').forEach(t => tags.add(t));
                    }
                document.getElementById('metadata-' + id).innerHTML = JSON.stringify(metadata,null,2);
            }
        }
        hljs.highlightAll();
        const tables = document.querySelectorAll('table');
        for (var i = 0; i < tables.length; i++) {
            tables[i].classList.add('table');
            tables[i].classList.add('table-striped');
        }
        if(Array.from(tags).length > 0) {
            document.getElementById('noteTags').innerHTML = Array.from(tags).map(t => '<span data-id="'+t+'" class="chip noteTag">'+t+'</span> ').join('')
        }
    }
});

document.addEventListener("click", (item) => {

});

