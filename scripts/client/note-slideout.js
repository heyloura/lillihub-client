import { encryptWithKey, decryptWithKey } from '/scripts/crypto.js';

export function initNoteSlideout(notebookId, key, notebooks = []) {
    let currentCard = null;
    let currentNoteId = null;
    let isShared = false;
    const otherNotebooks = notebooks.filter(nb => String(nb.id) !== String(notebookId));

    const converter = new showdown.Converter({
        metadata: true, parseImgDimensions: true, strikethrough: true,
        tables: true, ghCodeBlocks: true, smoothLivePreview: true,
        simpleLineBreaks: true, emoji: true,
    });

    // --- Build DOM ---
    const scrim = document.createElement('div');
    scrim.className = 'note-slideout-scrim';

    const panel = document.createElement('div');
    panel.className = 'note-slideout';
    panel.setAttribute('aria-hidden', 'true');
    panel.innerHTML = `
        <div class="note-slideout-header">
            <h3 class="note-slideout-title" id="slideout-title"></h3>
            <div class="note-slideout-header-actions">
                <button class="btn btn-glossy btn-sm" id="slideout-edit-btn"><i class="bi bi-pencil"></i> Edit</button>
                <button class="btn btn-sm" id="slideout-close-btn" aria-label="Close"><i class="bi bi-x-lg"></i></button>
            </div>
        </div>
        <div id="slideout-view" class="note-slideout-body">
            <div class="note-slideout-meta">
                <small class="tile-subtitle" id="slideout-date"></small>
                <span id="slideout-tags"></span>
            </div>
            <div id="slideout-content" class="note-slideout-content"></div>
        </div>
        <div id="slideout-edit" class="note-slideout-body" style="display:none;">
            <input class="form-input mt-2" id="slideout-edit-title" type="text" placeholder="Title (optional)">
            <input class="form-input mt-2" id="slideout-edit-tags" type="text" placeholder="Tags (comma separated)">
            <textarea id="slideout-edit-content" class="form-input mt-2" placeholder="Write here..." style="min-height:200px;"></textarea>
        </div>
        <div id="slideout-footer-view" class="note-slideout-footer" style="flex-direction:column;">
            <details style="width:100%;">
                <summary style="cursor:pointer;font-size:0.85rem;color:var(--overlay-1);list-style:none;"><i class="bi bi-three-dots"></i> Advanced actions</summary>
                <div class="mt-2" style="display:flex;gap:0.5rem;flex-wrap:wrap;">
                    <button class="btn btn-glossy btn-sm" id="slideout-versions-btn"><i class="bi bi-clock-history"></i> Versions</button>
                    ${otherNotebooks.length ? `
                    <div class="input-group" style="flex:1;min-width:180px;">
                        <select class="form-select" id="slideout-move-select" style="font-size:0.85rem;">
                            <option value="">Move to...</option>
                            ${otherNotebooks.map(nb => `<option value="${nb.id}">${nb.title}</option>`).join('')}
                        </select>
                        <button class="btn btn-glossy btn-sm" id="slideout-move-btn"><i class="bi bi-arrow-right"></i></button>
                    </div>
                    <div class="input-group" style="flex:1;min-width:180px;">
                        <select class="form-select" id="slideout-copy-select" style="font-size:0.85rem;">
                            <option value="">Copy to...</option>
                            ${otherNotebooks.map(nb => `<option value="${nb.id}">${nb.title}</option>`).join('')}
                        </select>
                        <button class="btn btn-glossy btn-sm" id="slideout-copy-btn"><i class="bi bi-copy"></i></button>
                    </div>` : ''}
                </div>
                <div id="slideout-versions-list" style="display:none;width:100%;margin-top:0.5rem;"></div>
            </details>
        </div>
        <div id="slideout-footer-edit" class="note-slideout-footer" style="display:none;">
            <details id="slideout-delete-details">
                <summary class="btn btn-glossy btn-sm" style="list-style:none;"><i class="bi bi-trash"></i> Delete</summary>
                <div class="mt-2">
                    <p style="font-size:0.85rem;color:var(--overlay-1);">Permanently delete this note.</p>
                    <button class="btn btn-glossy btn-sm" id="slideout-confirm-delete">Confirm Delete</button>
                </div>
            </details>
            <div style="margin-left:auto;display:flex;gap:0.5rem;">
                <button class="btn btn-sm" id="slideout-cancel-btn">Cancel</button>
                <button class="btn btn-glossy btn-sm" id="slideout-save-btn"><i class="bi bi-check-lg"></i> Save</button>
            </div>
        </div>`;

    document.body.appendChild(scrim);
    document.body.appendChild(panel);

    // --- Element refs ---
    const titleEl = panel.querySelector('#slideout-title');
    const dateEl = panel.querySelector('#slideout-date');
    const tagsEl = panel.querySelector('#slideout-tags');
    const contentEl = panel.querySelector('#slideout-content');
    const viewBody = panel.querySelector('#slideout-view');
    const editBody = panel.querySelector('#slideout-edit');
    const footerView = panel.querySelector('#slideout-footer-view');
    const footerEdit = panel.querySelector('#slideout-footer-edit');
    const editTitleInput = panel.querySelector('#slideout-edit-title');
    const editTagsInput = panel.querySelector('#slideout-edit-tags');
    const editContentArea = panel.querySelector('#slideout-edit-content');
    const versionsBtn = panel.querySelector('#slideout-versions-btn');
    const versionsList = panel.querySelector('#slideout-versions-list');
    const deleteDetails = panel.querySelector('#slideout-delete-details');

    // --- Event listeners ---
    panel.querySelector('#slideout-close-btn').addEventListener('click', closeSlideout);
    panel.querySelector('#slideout-edit-btn').addEventListener('click', enterEditMode);
    panel.querySelector('#slideout-cancel-btn').addEventListener('click', exitEditMode);
    panel.querySelector('#slideout-save-btn').addEventListener('click', saveNote);
    panel.querySelector('#slideout-confirm-delete').addEventListener('click', deleteNote);
    versionsBtn.addEventListener('click', loadVersions);
    scrim.addEventListener('click', closeSlideout);

    if (otherNotebooks.length) {
        panel.querySelector('#slideout-move-btn').addEventListener('click', moveNote);
        panel.querySelector('#slideout-copy-btn').addEventListener('click', copyNote);
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && panel.classList.contains('open')) {
            closeSlideout();
        }
    });

    // Intercept note link clicks (not todos)
    document.addEventListener('click', (e) => {
        const link = e.target.closest('.noteLink');
        if (!link) return;
        const card = link.closest('.note-card');
        if (!card || card.getAttribute('data-type') === 'todo') return;
        e.preventDefault();
        openNote(card);
    });

    // Keyboard shortcuts in editor
    editContentArea.addEventListener('input', function () { growTextArea(editContentArea); });
    editContentArea.addEventListener('keydown', function (e) {
        if (!(e.ctrlKey || e.metaKey)) return;
        const start = editContentArea.selectionStart;
        const end = editContentArea.selectionEnd;
        function wrap(before, after) {
            editContentArea.value = editContentArea.value.slice(0, start) + before +
                editContentArea.value.slice(start, end) + after + editContentArea.value.slice(end);
            editContentArea.selectionStart = start + before.length;
            editContentArea.selectionEnd = end + before.length;
            editContentArea.focus();
        }
        if (e.key === 'b') { e.preventDefault(); wrap('**', '**'); }
        if (e.key === 'i') { e.preventDefault(); wrap('_', '_'); }
        if (e.key === 'k') { e.preventDefault(); wrap('[', '](url)'); }
    });

    // --- Core functions ---

    function openNote(card) {
        currentCard = card;
        const noteEl = card.querySelector('.note');
        currentNoteId = noteEl.id;
        isShared = !noteEl.classList.contains('decryptMe');

        // Populate view mode
        titleEl.textContent = card.querySelector('.note-title-text').textContent;
        dateEl.textContent = card.querySelector('.tile-subtitle').textContent;
        tagsEl.innerHTML = card.querySelector('.tags').innerHTML;
        contentEl.innerHTML = noteEl.innerHTML;

        // Reset state
        viewBody.style.display = '';
        editBody.style.display = 'none';
        footerView.style.display = '';
        footerEdit.style.display = 'none';
        versionsList.style.display = 'none';
        versionsList.innerHTML = '';
        deleteDetails.open = false;
        const moveSelect = panel.querySelector('#slideout-move-select');
        const copySelect = panel.querySelector('#slideout-copy-select');
        if (moveSelect) moveSelect.value = '';
        if (copySelect) copySelect.value = '';

        // Highlight code blocks
        if (typeof hljs !== 'undefined') {
            contentEl.querySelectorAll('pre code').forEach(block => hljs.highlightElement(block));
        }

        // Open
        panel.classList.add('open');
        scrim.classList.add('open');
        panel.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeSlideout() {
        panel.classList.remove('open');
        scrim.classList.remove('open');
        panel.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        currentCard = null;
        currentNoteId = null;
    }

    function enterEditMode() {
        const noteEl = currentCard.querySelector('.note');
        const markdown = noteEl.getAttribute('data-markdown') || '';

        // Parse YAML frontmatter
        const fmMatch = markdown.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
        if (fmMatch) {
            const fm = fmMatch[1];
            const body = fmMatch[2];
            const titleMatch = fm.match(/^title:\s*(.+)$/m);
            const tagsMatch = fm.match(/^tags:\s*\[?(.*?)\]?\s*$/m);
            editTitleInput.value = titleMatch ? titleMatch[1].trim() : '';
            editTagsInput.value = tagsMatch ? tagsMatch[1].trim() : '';
            editContentArea.value = body;
        } else {
            editTitleInput.value = '';
            editTagsInput.value = '';
            editContentArea.value = markdown;
        }

        viewBody.style.display = 'none';
        editBody.style.display = 'flex';
        editBody.style.flexDirection = 'column';
        footerView.style.display = 'none';
        footerEdit.style.display = 'flex';

        growTextArea(editContentArea);
        editContentArea.focus();
    }

    function exitEditMode() {
        editBody.style.display = 'none';
        viewBody.style.display = '';
        footerEdit.style.display = 'none';
        footerView.style.display = '';
        deleteDetails.open = false;
    }

    async function saveNote() {
        const content = editContentArea.value;
        const title = editTitleInput.value.trim();
        const tags = editTagsInput.value.trim();

        // Build YAML frontmatter
        let yaml = '';
        if (title || tags) {
            yaml = '---\n';
            if (title) yaml += `title: ${title}\n`;
            if (tags) yaml += `tags: [${tags}]\n`;
            yaml += '---\n';
        }

        const fullNote = yaml + content;

        let encrypted;
        if (isShared) {
            encrypted = fullNote;
        } else {
            encrypted = await encryptWithKey(key, fullNote);
        }

        const form = new URLSearchParams();
        form.append('text', encrypted);
        form.append('notebook_id', notebookId);
        form.append('id', currentNoteId);

        const res = await fetch('/note/update', {
            method: 'POST',
            body: form.toString(),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8' }
        });

        if (!res.ok) return;

        // Update the card in the list
        updateCardInList(fullNote);
        exitEditMode();
    }

    async function deleteNote() {
        const form = new URLSearchParams();
        form.append('id', currentNoteId);
        form.append('notebookId', notebookId);

        const res = await fetch('/note/delete', {
            method: 'POST',
            body: form.toString(),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8' }
        });

        if (!res.ok) return;

        currentCard.remove();
        closeSlideout();
    }

    async function moveNote() {
        const select = panel.querySelector('#slideout-move-select');
        const dest = select.value;
        if (!dest) return;
        const destName = select.options[select.selectedIndex].text;
        if (!confirm(`Move this note to "${destName}"?`)) return;

        const form = new URLSearchParams();
        form.append('id', currentNoteId);
        form.append('notebook[]', dest);

        const res = await fetch('/notes/notebook/move', {
            method: 'POST',
            body: form.toString(),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8' }
        });

        if (res.url?.includes('error=')) {
            alert(res.url.includes('move_duplicate')
                ? 'Note was copied but removing the original failed. You may have duplicates.'
                : 'Something went wrong moving the note. Please try again.');
            return;
        }
        currentCard.remove();
        closeSlideout();
    }

    async function copyNote() {
        const select = panel.querySelector('#slideout-copy-select');
        const dest = select.value;
        if (!dest) return;
        const destName = select.options[select.selectedIndex].text;
        if (!confirm(`Copy this note to "${destName}"?`)) return;

        const form = new URLSearchParams();
        form.append('id', currentNoteId);
        form.append('notebook', dest);

        const res = await fetch('/notes/notebook/copy', {
            method: 'POST',
            body: form.toString(),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8' }
        });

        if (res.url?.includes('error=')) {
            alert('Something went wrong copying the note. Please try again.');
            return;
        }
        select.value = '';
    }

    async function loadVersions() {
        if (versionsList.style.display !== 'none') {
            versionsList.style.display = 'none';
            return;
        }

        versionsList.innerHTML = '<p style="color:var(--overlay-1);">Loading...</p>';
        versionsList.style.display = '';

        try {
            const res = await fetch(`/api/note-versions?id=${currentNoteId}`);
            const data = await res.json();
            const items = data.items || [];

            if (items.length === 0) {
                versionsList.innerHTML = '<p style="color:var(--overlay-1);font-size:0.85rem;">No previous versions.</p>';
                return;
            }

            versionsList.innerHTML = items.reverse().map((v, i) => {
                const date = formatVersionDate(v.date_published);
                return `<p><a href="#" class="version-link" data-content="${escapeAttr(v.content_text)}">${date}</a>${i === 0 ? ' (current)' : ''}</p>`;
            }).join('');

            // Click a version to view it
            versionsList.querySelectorAll('.version-link').forEach(link => {
                link.addEventListener('click', async (e) => {
                    e.preventDefault();
                    const encrypted = link.getAttribute('data-content');
                    let markdown;
                    if (isShared) {
                        markdown = encrypted;
                    } else {
                        markdown = await decryptWithKey(key, encrypted);
                    }

                    // Render and show in content area
                    const html = converter.makeHtml(markdown);
                    const metadata = converter.getMetadata();
                    contentEl.innerHTML = html;
                    if (metadata?.title) titleEl.textContent = decodeEntities(metadata.title);
                    if (typeof hljs !== 'undefined') {
                        contentEl.querySelectorAll('pre code').forEach(block => hljs.highlightElement(block));
                    }
                });
            });
        } catch {
            versionsList.innerHTML = '<p style="color:var(--overlay-1);font-size:0.85rem;">Could not load versions.</p>';
        }
    }

    function updateCardInList(newMarkdown) {
        const noteEl = currentCard.querySelector('.note');
        noteEl.setAttribute('data-markdown', newMarkdown);

        const html = converter.makeHtml(newMarkdown);
        const metadata = converter.getMetadata();
        noteEl.innerHTML = html;

        // Update title
        const titleLink = currentCard.querySelector('.note-title-text');
        if (metadata?.title) {
            titleLink.textContent = decodeEntities(metadata.title);
        } else {
            const tmp = document.createElement('div');
            tmp.innerHTML = html;
            const plainText = (tmp.textContent || '').trim();
            titleLink.textContent = plainText.length > 60 ? plainText.substring(0, 60) + '...' : plainText;
        }

        // Update tags
        if (metadata?.tags) {
            const tags = metadata.tags.replace('[', '').replace(']', '').split(',');
            currentCard.querySelector('.tags').innerHTML = tags.map(t =>
                `<span class="chip">#${t.trim()}</span>`
            ).join('');
        } else {
            currentCard.querySelector('.tags').innerHTML = '';
        }

        // Update slideout view
        titleEl.textContent = titleLink.textContent;
        tagsEl.innerHTML = currentCard.querySelector('.tags').innerHTML;
        contentEl.innerHTML = noteEl.innerHTML;
        if (typeof hljs !== 'undefined') {
            contentEl.querySelectorAll('pre code').forEach(block => hljs.highlightElement(block));
        }
    }

    function formatVersionDate(dateStr) {
        try {
            const d = new Date(dateStr);
            if (isNaN(d)) return dateStr;
            return d.toLocaleDateString('en-US', {
                month: 'long', day: 'numeric', year: 'numeric',
                hour: 'numeric', minute: 'numeric', hour12: true
            });
        } catch {
            return dateStr;
        }
    }

    function escapeAttr(str) {
        return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function decodeEntities(str) {
        const el = document.createElement('span');
        el.innerHTML = str;
        return el.textContent;
    }
}
