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

// Checks that a Micro.blog notes key looks structurally sound before we store
// it. The first 4 chars are a prefix; the remainder must be 64 hex characters
// (AES-256 = 32 bytes). Returns null when the key is valid, or a user-facing
// error string when it isn't.
export function validateNotesKey(raw) {
    const v = String(raw ?? '').trim();
    if (!v) return 'Enter your Micro.blog notes key.';
    if (v.length <= 4) return 'Key looks too short — paste the full value from Micro.blog.';
    const hex = v.slice(4);
    if (hex.length !== 64) return 'Key should contain 64 hex characters after the prefix.';
    if (!/^[0-9a-fA-F]+$/.test(hex)) return 'Key contains invalid characters — expected hex (0-9, a-f).';
    return null;
}

export async function importNotesKey() {
    const raw = localStorage.getItem('notes_key');
    if (!raw) return null;
    // A malformed key in localStorage (e.g. user pasted wrong value) would
    // otherwise throw from importKey and break the whole page. Fall back to
    // the "enter key" UX so the user can re-enter.
    try {
        return await crypto.subtle.importKey(
            'raw',
            hexStringToArrayBuffer(raw.substr(4)),
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt', 'decrypt']
        );
    } catch (err) {
        console.error('Failed to import notes key — it may be malformed:', err);
        return null;
    }
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
