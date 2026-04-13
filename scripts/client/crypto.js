// Shared client-side AES-GCM encryption for Micro.blog notes.
// The key is the user's Micro.blog notes key stored in localStorage.

export function hexStringToArrayBuffer(hexString) {
    const length = hexString.length / 2;
    const uint8Array = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
        uint8Array[i] = parseInt(hexString.substr(i * 2, 2), 16);
    }
    return uint8Array.buffer;
}

export async function importNotesKey() {
    const raw = localStorage.getItem('notes_key');
    if (!raw) return null;
    return crypto.subtle.importKey(
        'raw',
        hexStringToArrayBuffer(raw.substr(4)),
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );
}

export async function decryptWithKey(key, encryptedText) {
    const encrypted_data = new Uint8Array(atob(encryptedText).split('').map(c => c.charCodeAt(0)));
    const iv = encrypted_data.slice(0, 12);
    const ciphertext = encrypted_data.slice(12);
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
    return new TextDecoder().decode(decrypted);
}

export async function encryptWithKey(key, text) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        new TextEncoder().encode(text)
    );
    const encrypted_data = new Uint8Array([...iv, ...new Uint8Array(ciphertext)]);
    return btoa(String.fromCharCode(...encrypted_data));
}
