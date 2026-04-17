import { encryptWithKey } from '/scripts/crypto.js';

const TIME_ID_LEN = 23;

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

function stripHtml(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
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

    // --- FV Mode State (ephemeral) ---
    let fvState = 'NORMAL';        // 'NORMAL' | 'DOT_SCAN' | 'FOCUS'
    let dottedIndices = new Set();
    let scanOrder = [];
    let scanPosition = 0;
    let benchmarkIdx = -1;
    let focusQueue = [];
    let focusPosition = 0;

    function extractDateTimeId(text) {
        if (text.startsWith('(') && text.length > 4) {
            const after = text.substring(4);
            if (isDateTimeId(after.substring(0, TIME_ID_LEN))) return after.substring(0, TIME_ID_LEN);
        }
        if (isDateTimeId(text.substring(0, TIME_ID_LEN))) return text.substring(0, TIME_ID_LEN);
        return '9999';
    }

    function buildScanOrder() {
        return tasks
            .map((text, idx) => ({ text, idx }))
            .filter(t => !/^x\s/.test(t.text))
            .sort((a, b) => {
                const aId = extractDateTimeId(a.text);
                const bId = extractDateTimeId(b.text);
                return aId < bId ? -1 : aId > bId ? 1 : 0;
            })
            .map(t => t.idx);
    }

    function refreshDateTimeId(idx) {
        let text = tasks[idx];
        if (text.startsWith('(') && text.length > 4) {
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
        let markup = escapeHtml(text);

        // Strip datetime ID from display
        if (markup.startsWith('(') && markup.length > 4) {
            const afterPriority = markup.substring(4);
            if (isDateTimeId(afterPriority.substring(0, TIME_ID_LEN))) {
                markup = markup.substring(0, 4) + afterPriority.substring(TIME_ID_LEN + 1);
            }
        } else if (isDateTimeId(markup.substring(0, TIME_ID_LEN))) {
            markup = markup.substring(TIME_ID_LEN + 1);
        }

        // Strip "x " prefix and completion date for display
        if (/^x\s/.test(text)) {
            // Remove "x " and optional priority + date
            markup = markup.replace(/^x\s+/, '');
            // Remove completion date (YYYY-MM-DD) if present at start
            markup = markup.replace(/^\(\w\)\s*/, (m) => `<span class="todo-priority">${m.trim()}</span> `);
            markup = markup.replace(/^\d{4}-\d{2}-\d{2}\s*/, '');
        }

        // Priorities (clickable to filter)
        markup = markup.replace(/\(A\)/g, '<span class="todo-priority-a todo-searchable" data-search="(A)">(A)</span>');
        markup = markup.replace(/\(B\)/g, '<span class="todo-priority-b todo-searchable" data-search="(B)">(B)</span>');
        markup = markup.replace(/\(C\)/g, '<span class="todo-priority-c todo-searchable" data-search="(C)">(C)</span>');

        // Contexts and projects (clickable to search)
        markup = markup.replace(/(^|\s)(@\S+)/g, '$1<span class="todo-context todo-searchable" data-search="$2">$2</span>');
        markup = markup.replace(/(^|\s)(\+\S+)/g, '$1<span class="todo-project todo-searchable" data-search="$2">$2</span>');

        return markup;
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function checkTask(idx) {
        let text = tasks[idx];
        if (text.startsWith('(')) {
            const priority = text.substring(0, 3);
            text = 'x ' + priority + ' ' + new Date().toISOString().split('T')[0] + ' ' + text.slice(4);
        } else {
            text = 'x ' + new Date().toISOString().split('T')[0] + ' ' + text;
        }
        tasks[idx] = text;
        saveTodos();
        renderTasks();
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
        lineIdInput.value = idx;
        contentInput.value = tasks[idx];
        deleteBtn.style.display = '';
        moveBottomBtn.style.display = '';
        slideoutTitle.textContent = 'Edit Task';
        openSlideout();
    }

    function openAddDialog() {
        lineIdInput.value = -1;
        contentInput.value = '';
        deleteBtn.style.display = 'none';
        moveBottomBtn.style.display = 'none';
        slideoutTitle.textContent = 'Add Task';
        openSlideout();
    }

    async function saveTodos() {
        let note = '---\ntype: todo.txt\n' + (todoTitle ? `title: ${todoTitle}\n` : '') + '---\n';
        for (const task of tasks) {
            note += task + '\n\n';
        }

        const encrypted = await encryptWithKey(key, note);
        const form = new URLSearchParams();
        form.append('text', encrypted);
        form.append('notebook_id', notebookId);
        form.append('id', noteId);

        fetch('/note/update', {
            method: 'POST',
            body: form.toString(),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8' }
        });
    }

    function saveFromDialog() {
        const text = contentInput.value.trim();
        if (!text) return;

        const lines = text.split('\n').filter(l => l.trim());
        const idx = parseInt(lineIdInput.value);

        if (idx >= 0 && idx < tasks.length) {
            // Editing existing task — update first line
            tasks[idx] = lines[0];
            // Additional lines become new tasks
            for (let i = 1; i < lines.length; i++) {
                tasks.push(addDateTimeId(lines[i]));
            }
        } else {
            // Adding new tasks
            for (const line of lines) {
                tasks.push(addDateTimeId(line));
            }
        }

        saveTodos();
        renderTasks();
        closeSlideout();
    }

    function addDateTimeId(text) {
        if (text.startsWith('(') && text.length > 3) {
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
        saveTodos();
        renderTasks();
    }

    function exportTodoTxt() {
        let content = '';
        for (const task of tasks) {
            content += task + '\n';
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
    }

    function startFvRound() {
        dottedIndices.clear();
        scanOrder = buildScanOrder();

        if (scanOrder.length < 2) {
            alert('Need at least 2 open tasks to start a round.');
            return;
        }

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

        // Progress
        const progress = document.createElement('div');
        progress.className = 'fv-progress';
        progress.innerHTML = `
            <div class="fv-progress-bar"><div class="fv-progress-fill" style="width:${Math.round((scanPosition / total) * 100)}%"></div></div>
            <span class="fv-progress-text">${scanPosition} of ${total} scanned &middot; ${dottedIndices.size} dotted</span>`;
        taskList.appendChild(progress);

        // Benchmark
        const benchmarkLi = document.createElement('li');
        benchmarkLi.className = 'todo-item fv-benchmark';
        benchmarkLi.innerHTML = `
            <span class="fv-dot">&#x25CF;</span>
            <span class="todo-text">${formatTaskMarkup(tasks[benchmarkIdx])}</span>
            <span class="fv-label">benchmark</span>`;
        taskList.appendChild(benchmarkLi);

        if (scanPosition < scanOrder.length) {
            const currentIdx = scanOrder[scanPosition];

            const vsLi = document.createElement('li');
            vsLi.className = 'fv-vs';
            vsLi.textContent = 'Do you want to do this before the benchmark?';
            taskList.appendChild(vsLi);

            const assessLi = document.createElement('li');
            assessLi.className = 'todo-item fv-assess';
            assessLi.innerHTML = `
                <span class="fv-dot fv-dot-empty">&#x25CB;</span>
                <span class="todo-text">${formatTaskMarkup(tasks[currentIdx])}</span>`;
            taskList.appendChild(assessLi);

            const btnRow = document.createElement('li');
            btnRow.className = 'fv-actions';
            btnRow.innerHTML = `
                <button class="btn btn-glossy btn-sm fv-yes-btn"><i class="bi bi-check-lg"></i> Yes</button>
                <button class="btn btn-glossy btn-sm fv-no-btn"><i class="bi bi-x-lg"></i> No</button>`;
            taskList.appendChild(btnRow);
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
            const doneLi = document.createElement('li');
            doneLi.className = 'fv-scan-done';
            doneLi.innerHTML = `
                <p>Scan complete. ${dottedIndices.size} task${dottedIndices.size !== 1 ? 's' : ''} dotted.</p>
                <button class="btn btn-glossy btn-sm"><i class="bi bi-play-fill"></i> Start Focus</button>`;
            taskList.appendChild(doneLi);
            doneLi.querySelector('button').addEventListener('click', startFvFocus);
        }

        const endLi = document.createElement('li');
        endLi.className = 'fv-end-session';
        endLi.innerHTML = `<button class="btn btn-sm">End Session</button>`;
        taskList.appendChild(endLi);
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

        // Progress
        const progress = document.createElement('div');
        progress.className = 'fv-progress';
        progress.innerHTML = `
            <div class="fv-progress-bar"><div class="fv-progress-fill" style="width:${Math.round((focusPosition / focusQueue.length) * 100)}%"></div></div>
            <span class="fv-progress-text">Focus: ${remaining} task${remaining !== 1 ? 's' : ''} remaining</span>`;
        taskList.appendChild(progress);

        // Current task
        const li = document.createElement('li');
        li.className = 'todo-item fv-focus-task';
        li.innerHTML = `
            <span class="fv-dot">&#x25CF;</span>
            <span class="todo-text">${formatTaskMarkup(tasks[currentIdx])}</span>`;
        taskList.appendChild(li);

        // Actions
        const btnRow = document.createElement('li');
        btnRow.className = 'fv-actions fv-focus-actions';
        btnRow.innerHTML = `
            <button class="btn btn-glossy btn-sm fv-complete-btn"><i class="bi bi-check-lg"></i> Complete</button>
            <button class="btn btn-glossy btn-sm fv-reenter-btn"><i class="bi bi-arrow-down-circle"></i> Re-enter</button>
            <button class="btn btn-sm fv-skip-btn">Skip</button>`;
        taskList.appendChild(btnRow);
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
            const upNext = document.createElement('li');
            upNext.className = 'fv-up-next';
            upNext.innerHTML = '<span class="fv-label">Up next</span>';
            for (let i = focusPosition + 1; i < focusQueue.length; i++) {
                const preview = document.createElement('div');
                preview.className = 'fv-up-next-item';
                preview.innerHTML = `<span class="fv-dot" style="font-size:0.8rem;">&#x25CF;</span> <span style="font-size:0.85rem;">${formatTaskMarkup(tasks[focusQueue[i]])}</span>`;
                upNext.appendChild(preview);
            }
            taskList.appendChild(upNext);
        }

        const endLi = document.createElement('li');
        endLi.className = 'fv-end-session';
        endLi.innerHTML = `<button class="btn btn-sm">End Session</button>`;
        taskList.appendChild(endLi);
        endLi.querySelector('button').addEventListener('click', endFvSession);
    }

    function endFvSession() {
        fvState = 'NORMAL';
        dottedIndices.clear();
        scanOrder = [];
        focusQueue = [];
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

    searchBox.addEventListener('input', renderTasks);
    showCompletedCheckbox.addEventListener('change', renderTasks);

    // Initial render
    renderTasks();
}
