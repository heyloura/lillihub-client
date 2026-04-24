import { encryptWithKey } from '/scripts/crypto.js';

const TIME_ID_LEN = 23;
// Matches a valid todo.txt priority prefix like "(A) ". Plain parentheses in
// task text (e.g. "(note) follow up") must not be treated as a priority.
const PRIORITY_RE = /^\([A-Z]\)\s/;

function getDateTimeId() {
    const d = new Date();
    const pad2 = n => String(n).padStart(2, '0');
    const pad3 = n => String(n).padStart(3, '0');
    return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}.${pad3(d.getMilliseconds())}`;
}

function isDateTimeId(str) {
    return str && str.length >= TIME_ID_LEN
        && str.includes('-') && str.includes(':')
        && str.includes('.') && str.includes(' ');
}

// Pull a todo.txt line apart into its structural pieces. Canonical order is:
//   [x ][(P) ][COMPLETION_DATE ][DATETIMEID ]body
// Priority comes before the completion date on checked tasks (see checkTask).
function parseTaskLine(raw) {
    let rest = raw;
    let done = false;
    let priority = '';
    let completionDate = '';
    let dateTimeId = '';

    if (/^x\s/.test(rest)) {
        done = true;
        rest = rest.replace(/^x\s+/, '');
    }
    const prioMatch = rest.match(/^\(([A-Z])\)\s+/);
    if (prioMatch) {
        priority = `(${prioMatch[1]})`;
        rest = rest.substring(prioMatch[0].length);
    }
    if (done) {
        const m = rest.match(/^(\d{4}-\d{2}-\d{2})\s+/);
        if (m) {
            completionDate = m[1];
            rest = rest.substring(m[0].length);
        }
    }
    if (isDateTimeId(rest.substring(0, TIME_ID_LEN))) {
        dateTimeId = rest.substring(0, TIME_ID_LEN);
        rest = rest.substring(TIME_ID_LEN + 1);
    }
    return { done, priority, completionDate, dateTimeId, body: rest };
}

function buildTaskLine({ done, priority, completionDate, dateTimeId, body }) {
    let out = '';
    if (done) out += 'x ';
    if (priority) out += priority + ' ';
    if (done && completionDate) out += completionDate + ' ';
    if (dateTimeId) out += dateTimeId + ' ';
    out += body;
    return out;
}

export function initTodo(markdown, key, notebookId, noteId) {
    const showdown = window.showdown;
    const converter = new showdown.Converter({
        metadata: true, parseImgDimensions: true, strikethrough: true,
        tables: true, ghCodeBlocks: true, simpleLineBreaks: true, emoji: true,
    });

    // Parse initial markdown — strip frontmatter, capture title from metadata
    const html = converter.makeHtml(markdown);
    const meta = converter.getMetadata() || {};
    const todoTitle = (meta.title || '').trim();

    const taskList = document.getElementById('tasks');
    const searchBox = document.getElementById('todo-search');
    const showCompletedCheckbox = document.getElementById('showCompleted');

    // Per-list UI state: show-completed persists across sessions (it's a
    // preference), search persists only within the session (it's navigation).
    const SHOW_COMPLETED_KEY = `lh-todo-show-completed:${noteId}`;
    const SEARCH_KEY = `lh-todo-search:${noteId}`;
    try { showCompletedCheckbox.checked = localStorage.getItem(SHOW_COMPLETED_KEY) === '1'; } catch { /* ignore */ }
    try { searchBox.value = sessionStorage.getItem(SEARCH_KEY) || ''; } catch { /* ignore */ }
    const slideout = document.getElementById('todo-slideout');
    const slideoutScrim = document.getElementById('todo-slideout-scrim');
    const slideoutTitle = document.getElementById('todo-slideout-title');
    const contentInput = document.getElementById('todo-content');
    const lineIdInput = { value: '-1' }; // virtual hidden input
    const deleteBtn = document.getElementById('deleteTodoBtn');
    const moveBottomBtn = document.getElementById('moveBottomBtn');

    // Parse tasks from HTML paragraphs
    function parseTasksFromHtml(htmlStr) {
        const tmp = document.createElement('div');
        tmp.innerHTML = htmlStr;
        const paragraphs = tmp.querySelectorAll('p');
        const tasks = [];
        for (const p of paragraphs) {
            const text = p.textContent.trim();
            if (text) tasks.push(text);
        }
        return tasks;
    }

    let tasks = parseTasksFromHtml(html);

    // Populate the search datalist with unique +projects and @contexts parsed
    // from all tasks. Rebuilt on every task mutation so suggestions stay fresh.
    function refreshSuggestions() {
        const suggestions = document.getElementById('todo-suggestions');
        if (!suggestions) return;
        const tokens = new Set();
        for (const t of tasks) {
            const matches = t.match(/(?:^|\s)([+@]\S+)/g);
            if (!matches) continue;
            for (const m of matches) tokens.add(m.trim());
        }
        suggestions.innerHTML = [...tokens].sort().map(v => `<option value="${v}">`).join('');
    }

    // --- FV Mode State (ephemeral) ---
    let fvState = 'NORMAL';        // 'NORMAL' | 'DOT_SCAN' | 'FOCUS'
    let dottedIndices = new Set();
    let scanOrder = [];
    let scanPosition = 0;
    let benchmarkIdx = -1;
    let focusQueue = [];
    let focusPosition = 0;
    // Snapshot of the search filter at the moment Start Round was clicked,
    // lowercased for matching. Empty string means "no filter" (all open tasks).
    // Frozen for the session so changing the search box mid-round doesn't
    // change the scope.
    let scanScope = '';

    function extractDateTimeId(text) {
        if (PRIORITY_RE.test(text)) {
            const after = text.substring(4);
            if (isDateTimeId(after.substring(0, TIME_ID_LEN))) return after.substring(0, TIME_ID_LEN);
        }
        if (isDateTimeId(text.substring(0, TIME_ID_LEN))) return text.substring(0, TIME_ID_LEN);
        return '9999';
    }

    function buildScanOrder() {
        const q = scanScope;
        return tasks
            .map((text, idx) => ({ text, idx }))
            .filter(t => !/^x\s/.test(t.text))
            .filter(t => !q || t.text.toLowerCase().includes(q))
            .sort((a, b) => {
                const aId = extractDateTimeId(a.text);
                const bId = extractDateTimeId(b.text);
                return aId < bId ? -1 : aId > bId ? 1 : 0;
            })
            .map(t => t.idx);
    }

    function refreshDateTimeId(idx) {
        let text = tasks[idx];
        if (PRIORITY_RE.test(text)) {
            const afterPriority = text.substring(4);
            if (isDateTimeId(afterPriority.substring(0, TIME_ID_LEN))) {
                text = text.substring(0, 4) + getDateTimeId() + ' ' + afterPriority.substring(TIME_ID_LEN + 1);
            } else {
                text = text.substring(0, 4) + getDateTimeId() + ' ' + afterPriority;
            }
        } else {
            if (isDateTimeId(text.substring(0, TIME_ID_LEN))) {
                text = getDateTimeId() + ' ' + text.substring(TIME_ID_LEN + 1);
            } else {
                text = getDateTimeId() + ' ' + text;
            }
        }
        tasks[idx] = text;
    }

    function renderTasks() {
        taskList.innerHTML = '';
        const showDone = showCompletedCheckbox.checked;
        const query = (searchBox.value || '').toLowerCase();

        // Sort: open tasks first (sorted), then completed (sorted)
        const sorted = [...tasks.entries()].sort((a, b) => {
            const aText = a[1], bText = b[1];
            return aText < bText ? -1 : aText > bText ? 1 : 0;
        });

        for (const [idx, text] of sorted) {
            const isDone = /^x\s/.test(text);

            // Filter
            if (isDone && !showDone) continue;
            if (query && !text.toLowerCase().includes(query)) continue;

            const li = document.createElement('li');
            li.classList.add('todo-item');
            if (isDone) li.classList.add('done');
            li.dataset.taskIdx = idx;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = isDone;
            checkbox.addEventListener('change', () => {
                if (isDone) {
                    uncheckTask(idx);
                } else {
                    checkTask(idx);
                }
            });

            const label = document.createElement('span');
            label.classList.add('todo-text');
            label.innerHTML = formatTaskMarkup(text);
            label.addEventListener('click', (e) => {
                const searchable = e.target.closest('.todo-searchable');
                if (searchable) {
                    searchBox.value = searchable.getAttribute('data-search');
                    renderTasks();
                    return;
                }
                openEditDialog(idx);
            });

            li.appendChild(checkbox);
            li.appendChild(label);
            taskList.appendChild(li);
        }

        if (taskList.children.length === 0) {
            taskList.innerHTML = '<li style="text-align:center;padding:1rem;color:var(--overlay-1);">No tasks</li>';
        }
    }

    function formatTaskMarkup(text) {
        const parsed = parseTaskLine(text);
        let body = escapeHtml(parsed.body);

        // Contexts and projects (clickable to search)
        body = body.replace(/(^|\s)(@\S+)/g, '$1<span class="todo-context todo-searchable" data-search="$2">$2</span>');
        body = body.replace(/(^|\s)(\+\S+)/g, '$1<span class="todo-project todo-searchable" data-search="$2">$2</span>');

        let prefix = '';
        if (parsed.priority) {
            const letter = parsed.priority.charAt(1);
            const cls = letter === 'A' ? 'todo-priority-a'
                : letter === 'B' ? 'todo-priority-b'
                : letter === 'C' ? 'todo-priority-c'
                : 'todo-priority';
            prefix = `<span class="${cls} todo-searchable" data-search="${parsed.priority}">${parsed.priority}</span> `;
        }
        return prefix + body;
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Undo toast plumbing: when a task is checked while "Show completed" is
    // off, it disappears from the list — so we show a transient toast with
    // an Undo button to make that state change easy to reverse.
    const undoToast = document.getElementById('todo-undo-toast');
    const undoBtn = document.getElementById('todo-undo-btn');
    const undoDismissBtn = document.getElementById('todo-undo-dismiss');
    let undoTimer = null;
    let undoIdx = -1;

    function hideUndoToast() {
        if (undoToast) undoToast.style.display = 'none';
        if (undoTimer) { clearTimeout(undoTimer); undoTimer = null; }
        undoIdx = -1;
    }

    function showUndoToast(idx) {
        if (!undoToast) return;
        undoIdx = idx;
        // The floating toast uses `display:flex` from CSS; setting any
        // non-none value triggers it. Use empty string to defer to the class.
        undoToast.style.display = '';
        if (undoTimer) clearTimeout(undoTimer);
        undoTimer = setTimeout(hideUndoToast, 5000);
    }

    if (undoBtn) undoBtn.addEventListener('click', () => {
        if (undoIdx >= 0 && undoIdx < tasks.length) uncheckTask(undoIdx);
        hideUndoToast();
    });
    if (undoDismissBtn) undoDismissBtn.addEventListener('click', hideUndoToast);

    function checkTask(idx) {
        let text = tasks[idx];
        if (PRIORITY_RE.test(text)) {
            const priority = text.substring(0, 3);
            text = 'x ' + priority + ' ' + new Date().toISOString().split('T')[0] + ' ' + text.slice(4);
        } else {
            text = 'x ' + new Date().toISOString().split('T')[0] + ' ' + text;
        }
        tasks[idx] = text;
        saveTodos();
        renderTasks();
        // If Show completed is off, the task just disappeared. Give the user
        // a visible way to undo that change.
        if (!showCompletedCheckbox.checked) showUndoToast(idx);
    }

    function uncheckTask(idx) {
        let text = tasks[idx];
        // Remove "x " prefix
        text = text.replace(/^x\s+/, '');
        // Remove completion date if present
        if (text.match(/^\(\w\)\s+\d{4}-\d{2}-\d{2}\s+/)) {
            text = text.replace(/^(\(\w\))\s+\d{4}-\d{2}-\d{2}\s+/, '$1 ');
        } else {
            text = text.replace(/^\d{4}-\d{2}-\d{2}\s+/, '');
        }
        tasks[idx] = text;
        saveTodos();
        renderTasks();
        hideUndoToast();
    }

    function openSlideout() {
        slideout.classList.add('open');
        slideoutScrim.classList.add('open');
        slideout.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        contentInput.focus();
    }

    function closeSlideout() {
        slideout.classList.remove('open');
        slideoutScrim.classList.remove('open');
        slideout.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    function openEditDialog(idx) {
        const parsed = parseTaskLine(tasks[idx]);
        lineIdInput.value = idx;
        contentInput.value = (parsed.priority ? parsed.priority + ' ' : '') + parsed.body;
        deleteBtn.style.display = '';
        moveBottomBtn.style.display = '';
        slideoutTitle.textContent = 'Edit Task';
        const hint = document.getElementById('todo-hint-multiline');
        if (hint) hint.style.display = 'none';
        openSlideout();
    }

    function openAddDialog() {
        lineIdInput.value = -1;
        contentInput.value = '';
        deleteBtn.style.display = 'none';
        moveBottomBtn.style.display = 'none';
        slideoutTitle.textContent = 'Add Task';
        const hint = document.getElementById('todo-hint-multiline');
        if (hint) hint.style.display = '';
        openSlideout();
    }

    // Saves are serialized via this chain so concurrent edits never produce
    // out-of-order writes (each save sees the latest `tasks` array at fire time).
    let savePromise = Promise.resolve();
    const saveErrorEl = document.getElementById('todo-save-error');
    const saveRetryBtn = document.getElementById('todo-save-retry');

    async function doSaveTodos() {
        let note = '---\ntype: todo.txt\n' + (todoTitle ? `title: ${todoTitle}\n` : '') + '---\n';
        for (const task of tasks) {
            note += task + '\n\n';
        }

        const encrypted = await encryptWithKey(key, note);
        const form = new URLSearchParams();
        form.append('text', encrypted);
        form.append('notebook_id', notebookId);
        form.append('id', noteId);

        const res = await fetch('/note/update', {
            method: 'POST',
            body: form.toString(),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8' }
        });
        if (!res.ok) throw new Error('save failed: ' + res.status);
    }

    function saveTodos() {
        savePromise = savePromise
            .catch(() => {})  // a prior failure shouldn't block a retry
            .then(doSaveTodos)
            .then(() => { if (saveErrorEl) saveErrorEl.style.display = 'none'; })
            .catch((err) => {
                console.error('todo save failed', err);
                if (saveErrorEl) saveErrorEl.style.display = 'flex';
                throw err;
            });
        return savePromise;
    }

    if (saveRetryBtn) saveRetryBtn.addEventListener('click', () => saveTodos());

    function saveFromDialog() {
        const raw = contentInput.value;
        const idx = parseInt(lineIdInput.value);

        if (idx >= 0 && idx < tasks.length) {
            // Edit mode: single-line only. Collapse any stray newlines (paste, etc.).
            const editText = raw.replace(/\s*\n+\s*/g, ' ').trim();
            if (!editText) return;

            const original = parseTaskLine(tasks[idx]);
            // Re-parse edited text to pick up any priority change the user made.
            const edited = parseTaskLine(editText);
            tasks[idx] = buildTaskLine({
                done: original.done,
                priority: edited.priority,
                completionDate: original.completionDate,
                dateTimeId: original.dateTimeId,
                body: edited.body,
            });
        } else {
            // Add mode: multi-line allowed; each line becomes a new task.
            const lines = raw.split('\n').map(l => l.trim()).filter(l => l);
            if (lines.length === 0) return;
            for (const line of lines) {
                tasks.push(addDateTimeId(line));
            }
        }

        saveTodos();
        renderTasks();
        refreshSuggestions();
        closeSlideout();
    }

    function addDateTimeId(text) {
        if (PRIORITY_RE.test(text)) {
            const priority = text.substring(0, 3);
            return priority + ' ' + getDateTimeId() + ' ' + text.slice(4);
        }
        return getDateTimeId() + ' ' + text;
    }

    function deleteFromDialog() {
        if (!confirm('Are you sure you want to delete this task?')) return;
        const idx = parseInt(lineIdInput.value);
        if (idx >= 0 && idx < tasks.length) {
            tasks.splice(idx, 1);
            saveTodos();
            renderTasks();
            refreshSuggestions();
        }
        closeSlideout();
    }

    function moveToBottom() {
        const idx = parseInt(lineIdInput.value);
        if (idx < 0 || idx >= tasks.length) return;
        refreshDateTimeId(idx);
        saveTodos();
        renderTasks();
        closeSlideout();
    }

    function clearCompleted() {
        const count = tasks.filter(t => /^x\s/.test(t)).length;
        if (count === 0) return;
        if (!confirm(`Remove ${count} completed task${count > 1 ? 's' : ''}?`)) return;
        tasks = tasks.filter(t => !/^x\s/.test(t));
        hideUndoToast();
        saveTodos();
        renderTasks();
        refreshSuggestions();
    }

    function exportTodoTxt() {
        // Convert Lillihub's datetime id (YYYY-MM-DD HH:MM:SS.mmm) down to the
        // standard todo.txt creation-date (YYYY-MM-DD) so the file is portable
        // across todo.txt tools.
        let content = '';
        for (const task of tasks) {
            const p = parseTaskLine(task);
            content += buildTaskLine({
                done: p.done,
                priority: p.priority,
                completionDate: p.completionDate,
                dateTimeId: p.dateTimeId ? p.dateTimeId.substring(0, 10) : '',
                body: p.body,
            }) + '\n';
        }
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = (todoTitle || 'todo') + '.txt';
        a.click();
        URL.revokeObjectURL(url);
    }

    // --- FV Mode Functions ---

    function updateFvToolbar() {
        const inFv = fvState !== 'NORMAL';
        document.getElementById('startFvBtn').style.display = inFv ? 'none' : '';
        document.getElementById('addTodoBtn').style.display = inFv ? 'none' : '';
        document.getElementById('clearCompletedBtn').style.display = inFv ? 'none' : '';
        searchBox.closest('.blog-toolbar').style.display = inFv ? 'none' : '';
        showCompletedCheckbox.closest('div').style.display = inFv ? 'none' : '';
        const advanced = document.getElementById('advancedActions');
        if (advanced) advanced.style.display = inFv ? 'none' : '';
        // Remove the list's top border during an FV session for a cleaner view.
        taskList.style.borderTop = inFv ? 'none' : '';
    }

    function startFvRound() {
        dottedIndices.clear();
        // Freeze the search scope at click time — round operates on this
        // filtered slice even if the user later changes/clears the search.
        scanScope = (searchBox.value || '').toLowerCase().trim();
        scanOrder = buildScanOrder();

        if (scanOrder.length < 2) {
            alert(scanScope
                ? `Need at least 2 open tasks matching "${searchBox.value.trim()}" to start a round.`
                : 'Need at least 2 open tasks to start a round.');
            scanScope = '';
            return;
        }

        hideUndoToast();
        fvState = 'DOT_SCAN';
        benchmarkIdx = scanOrder[0];
        dottedIndices.add(benchmarkIdx);
        scanPosition = 1;
        updateFvToolbar();
        renderFvScan();
    }

    function renderFvScan() {
        taskList.innerHTML = '';
        const total = scanOrder.length;

        const wrap = document.createElement('div');
        wrap.className = 'fv-session-wrap';
        taskList.appendChild(wrap);

        // Progress
        const progress = document.createElement('div');
        progress.className = 'fv-progress';
        progress.innerHTML = `
            <div class="fv-progress-bar"><div class="fv-progress-fill" style="width:${Math.round((scanPosition / total) * 100)}%"></div></div>
            <span class="fv-progress-text">${scanPosition} of ${total} scanned &middot; ${dottedIndices.size} dotted</span>`;
        wrap.appendChild(progress);

        if (scanScope) {
            const scopeLine = document.createElement('p');
            scopeLine.className = 'fv-scope';
            scopeLine.innerHTML = `<i class="bi bi-funnel"></i> Round scoped to <code>${escapeHtml(scanScope)}</code> &middot; ${total} task${total !== 1 ? 's' : ''}`;
            wrap.appendChild(scopeLine);
        }

        if (scanPosition < scanOrder.length) {
            const currentIdx = scanOrder[scanPosition];

            wrap.insertAdjacentHTML('beforeend', `
                <p class="fv-prompt">Do you want to do</p>
                <div class="fv-task-line">${formatTaskMarkup(tasks[currentIdx])}</div>
                <p class="fv-prompt">before the benchmark</p>
                <div class="fv-task-line">${formatTaskMarkup(tasks[benchmarkIdx])}</div>`);

            const btnRow = document.createElement('div');
            btnRow.className = 'fv-actions';
            btnRow.innerHTML = `
                <button class="btn btn-glossy btn-sm fv-yes-btn"><i class="bi bi-check-lg"></i> Yes</button>
                <button class="btn btn-glossy btn-sm fv-no-btn"><i class="bi bi-x-lg"></i> No</button>`;
            wrap.appendChild(btnRow);
            btnRow.querySelector('.fv-yes-btn').addEventListener('click', () => {
                dottedIndices.add(currentIdx);
                benchmarkIdx = currentIdx;
                scanPosition++;
                renderFvScan();
            });
            btnRow.querySelector('.fv-no-btn').addEventListener('click', () => {
                scanPosition++;
                renderFvScan();
            });
        } else {
            const doneLi = document.createElement('div');
            doneLi.className = 'fv-scan-done';
            doneLi.innerHTML = `
                <p>Scan complete. ${dottedIndices.size} task${dottedIndices.size !== 1 ? 's' : ''} dotted.</p>
                <button class="btn btn-glossy btn-sm"><i class="bi bi-play-fill"></i> Start Focus</button>`;
            wrap.appendChild(doneLi);
            doneLi.querySelector('button').addEventListener('click', startFvFocus);
        }

        const endLi = document.createElement('div');
        endLi.className = 'fv-end-session';
        endLi.innerHTML = `<button class="btn btn-sm">End Session</button>`;
        wrap.appendChild(endLi);
        endLi.querySelector('button').addEventListener('click', endFvSession);
    }

    function startFvFocus() {
        if (dottedIndices.size === 0) { endFvSession(); return; }
        fvState = 'FOCUS';
        focusQueue = scanOrder.filter(idx => dottedIndices.has(idx)).reverse();
        focusPosition = 0;
        renderFvFocus();
    }

    function renderFvFocus() {
        if (focusPosition >= focusQueue.length) { endFvSession(); return; }
        taskList.innerHTML = '';
        const remaining = focusQueue.length - focusPosition;
        const currentIdx = focusQueue[focusPosition];

        const wrap = document.createElement('div');
        wrap.className = 'fv-session-wrap';
        taskList.appendChild(wrap);

        // Progress
        const progress = document.createElement('div');
        progress.className = 'fv-progress';
        progress.innerHTML = `
            <div class="fv-progress-bar"><div class="fv-progress-fill" style="width:${Math.round((focusPosition / focusQueue.length) * 100)}%"></div></div>
            <span class="fv-progress-text">Focus: ${remaining} task${remaining !== 1 ? 's' : ''} remaining</span>`;
        wrap.appendChild(progress);

        if (scanScope) {
            const scopeLine = document.createElement('p');
            scopeLine.className = 'fv-scope';
            scopeLine.innerHTML = `<i class="bi bi-funnel"></i> Round scoped to <code>${escapeHtml(scanScope)}</code>`;
            wrap.appendChild(scopeLine);
        }

        wrap.insertAdjacentHTML('beforeend', `
            <p class="fv-prompt">Work on</p>
            <div class="fv-task-line">${formatTaskMarkup(tasks[currentIdx])}</div>`);

        // Actions
        const btnRow = document.createElement('div');
        btnRow.className = 'fv-actions fv-focus-actions';
        btnRow.innerHTML = `
            <button class="btn btn-glossy btn-sm fv-complete-btn"><i class="bi bi-check-lg"></i> Complete</button>
            <button class="btn btn-sm fv-skip-btn">Skip</button>
            <button class="btn btn-sm fv-reenter-btn"><i class="bi bi-arrow-down-circle"></i> Skip and move to bottom of list</button>
            `;
        wrap.appendChild(btnRow);
        btnRow.querySelector('.fv-complete-btn').addEventListener('click', () => {
            checkTask(currentIdx);
            focusPosition++;
            renderFvFocus();
        });
        btnRow.querySelector('.fv-reenter-btn').addEventListener('click', () => {
            refreshDateTimeId(currentIdx);
            saveTodos();
            focusPosition++;
            renderFvFocus();
        });
        btnRow.querySelector('.fv-skip-btn').addEventListener('click', () => {
            focusPosition++;
            renderFvFocus();
        });

        // Up next preview
        if (focusPosition + 1 < focusQueue.length) {
            const upNext = document.createElement('div');
            upNext.className = 'fv-up-next';
            upNext.innerHTML = '<span class="fv-label">Up next</span>';
            for (let i = focusPosition + 1; i < focusQueue.length; i++) {
                const preview = document.createElement('div');
                preview.className = 'fv-up-next-item';
                preview.innerHTML = `<span style="font-size:0.85rem;">${formatTaskMarkup(tasks[focusQueue[i]])}</span>`;
                upNext.appendChild(preview);
            }
            wrap.appendChild(upNext);
        }

        const endLi = document.createElement('div');
        endLi.className = 'fv-end-session';
        endLi.innerHTML = `<button class="btn btn-sm">End Session</button>`;
        wrap.appendChild(endLi);
        endLi.querySelector('button').addEventListener('click', endFvSession);
    }

    function endFvSession() {
        fvState = 'NORMAL';
        dottedIndices.clear();
        scanOrder = [];
        focusQueue = [];
        scanScope = '';
        updateFvToolbar();
        renderTasks();
    }

    // Event listeners
    document.getElementById('addTodoBtn').addEventListener('click', openAddDialog);
    document.getElementById('closeTodoDialog').addEventListener('click', closeSlideout);
    document.getElementById('saveTodoBtn').addEventListener('click', saveFromDialog);
    deleteBtn.addEventListener('click', deleteFromDialog);
    moveBottomBtn.addEventListener('click', moveToBottom);
    document.getElementById('clearCompletedBtn').addEventListener('click', clearCompleted);
    document.getElementById('exportTodoBtn').addEventListener('click', exportTodoTxt);
    document.getElementById('startFvBtn').addEventListener('click', startFvRound);
    slideoutScrim.addEventListener('click', closeSlideout);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && slideout.classList.contains('open')) closeSlideout();
    });

    // When editing an existing task, Enter saves (no newline). Add mode keeps
    // multi-line behavior so bulk paste/add still works. Ctrl/Cmd+Enter always
    // saves (useful when adding a single task without leaving the keyboard).
    contentInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            saveFromDialog();
            return;
        }
        if (e.key !== 'Enter' || e.shiftKey) return;
        const idx = parseInt(lineIdInput.value);
        if (idx >= 0) {
            e.preventDefault();
            saveFromDialog();
        }
    });

    // --- Keyboard navigation (normal todo mode) ---
    // `.kb-focus` highlights the current task. Enter/Space toggle; e edits;
    // n/r/c/ are page-level shortcuts matching the help dialog entries.
    let _todoKbIdx = -1;
    function _visibleTodoItems() {
        return [...taskList.querySelectorAll('.todo-item')];
    }
    function _focusTodoItem(idx) {
        const items = _visibleTodoItems();
        if (!items.length) { _todoKbIdx = -1; return; }
        items.forEach(li => li.classList.remove('kb-focus'));
        if (idx < 0) idx = 0;
        if (idx >= items.length) idx = items.length - 1;
        _todoKbIdx = idx;
        items[idx].classList.add('kb-focus');
        items[idx].scrollIntoView({ block: 'center', behavior: 'smooth' });
    }

    document.addEventListener('keydown', (e) => {
        if (e.target.matches('input, textarea, select, [contenteditable]')) return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        // Don't compete with FV or slideout flows.
        if (fvState !== 'NORMAL') return;
        if (slideout.classList.contains('open')) return;

        const items = _visibleTodoItems();
        switch (e.key) {
            case 'j': if (items.length) { e.preventDefault(); _focusTodoItem(_todoKbIdx + 1); } break;
            case 'k': if (items.length) { e.preventDefault(); _focusTodoItem(_todoKbIdx - 1); } break;
            case 'Enter':
            case ' ': {
                if (_todoKbIdx >= 0 && items[_todoKbIdx]) {
                    e.preventDefault();
                    const cb = items[_todoKbIdx].querySelector('input[type="checkbox"]');
                    if (cb) cb.click();
                }
                break;
            }
            case 'e': {
                if (_todoKbIdx >= 0 && items[_todoKbIdx]) {
                    e.preventDefault();
                    const idx = parseInt(items[_todoKbIdx].dataset.taskIdx);
                    if (!isNaN(idx)) openEditDialog(idx);
                }
                break;
            }
            case '/': e.preventDefault(); searchBox.focus(); break;
            case 'n': e.preventDefault(); openAddDialog(); break;
            case 'c': {
                e.preventDefault();
                showCompletedCheckbox.checked = !showCompletedCheckbox.checked;
                showCompletedCheckbox.dispatchEvent(new Event('change'));
                break;
            }
            case 'r': e.preventDefault(); startFvRound(); break;
        }
    });

    searchBox.addEventListener('input', () => {
        try { sessionStorage.setItem(SEARCH_KEY, searchBox.value); } catch { /* ignore */ }
        renderTasks();
    });
    showCompletedCheckbox.addEventListener('change', () => {
        try { localStorage.setItem(SHOW_COMPLETED_KEY, showCompletedCheckbox.checked ? '1' : '0'); } catch { /* ignore */ }
        renderTasks();
    });

    // Initial render
    renderTasks();
    refreshSuggestions();
}
