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
    const dialog = document.getElementById('todo-dialog');
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

        // Priorities
        markup = markup.replace(/\(A\)/g, '<span class="todo-priority-a">(A)</span>');
        markup = markup.replace(/\(B\)/g, '<span class="todo-priority-b">(B)</span>');
        markup = markup.replace(/\(C\)/g, '<span class="todo-priority-c">(C)</span>');

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

    function openEditDialog(idx) {
        lineIdInput.value = idx;
        const text = tasks[idx];
        contentInput.value = text;
        deleteBtn.style.display = '';
        moveBottomBtn.style.display = '';
        dialog.showModal();
    }

    function openAddDialog() {
        lineIdInput.value = -1;
        contentInput.value = '';
        deleteBtn.style.display = 'none';
        moveBottomBtn.style.display = 'none';
        dialog.showModal();
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
        dialog.close();
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
        dialog.close();
    }

    function moveToBottom() {
        const idx = parseInt(lineIdInput.value);
        if (idx < 0 || idx >= tasks.length) return;

        let text = tasks[idx];
        // Update datetime ID to now
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
        saveTodos();
        renderTasks();
        dialog.close();
    }

    // Event listeners
    document.getElementById('addTodoBtn').addEventListener('click', openAddDialog);
    document.getElementById('closeTodoDialog').addEventListener('click', () => dialog.close());
    document.getElementById('saveTodoBtn').addEventListener('click', saveFromDialog);
    deleteBtn.addEventListener('click', deleteFromDialog);
    moveBottomBtn.addEventListener('click', moveToBottom);

    searchBox.addEventListener('input', renderTasks);
    showCompletedCheckbox.addEventListener('change', renderTasks);

    // Close dialog on backdrop click
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) dialog.close();
    });

    // Initial render
    renderTasks();
}
