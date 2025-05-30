function saveTodos() {
    let parent = document.getElementById('noteContents').getAttribute('data-parent');
    let id = document.getElementById('noteContents').getAttribute('data-id');
    let tasks = document.querySelectorAll('[data-task]');
    var note = `---\ntype: todo.txt\ntitle: todo.txt\n---\n`;
    for (var i = 0; i < tasks.length; i++) {
        note += `${decodeURIComponent(tasks[i].getAttribute('data-task'))}\n\n`;
    }

    console.log(parent, id, note);

    window.encryptWithKey(note).then(async result => {
        const form = new URLSearchParams();
        form.append("text", result);
        form.append("notebook_id", parent);
        if(id && id != 0) {
            form.append("id", id);
        }
        const posting = await fetch('/note/update', {
            method: "POST",
            body: form.toString(),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
            }
        });
    });

    var html = converter.makeHtml(note);
    console.log(html);
    document.getElementById('tasks').innerHTML = html;
    window.createTaskList();
}
const converter = new showdown.Converter({	
            metadata: true,
            parseImgDimensions: true,
            strikethrough: true,
            tables: true,
            ghCodeBlocks: true,
            simpleLineBreaks: true,
            emoji: true, 
        });         
function getDateTimeId() {
    var date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

    //console.log(year +'-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds + '.' + milliseconds)
    return year +'-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds + '.' + milliseconds;
}
function isDateTimeId(str) {
    //console.log(str,str.includes('-') && str.includes(':') && str.includes('.') && str.includes(' ') && str.length == 23)
    return str.includes('-') && str.includes(':') && str.includes('.') && str.includes(' ') && str.length == 23;
}
function liveSearch(selector, searchboxId) {
    let cards = document.querySelectorAll(selector)
    let search_query = document.getElementById(searchboxId).value;
    for (var i = 0; i < cards.length; i++) {
        if(cards[i].innerText.toLowerCase().includes(search_query.toLowerCase())) {
            cards[i].classList.remove("d-hide");
        } else {
            cards[i].classList.add("d-hide");
        }
    }
}
const timeIdLen = 23;
document.addEventListener("input", async (event) => {
    if(!event.target.getAttribute('evt-input')) {
        return;
    } else {
        if(event.target.getAttribute('evt-input') == 'search') {
            var id = event.target.getAttribute('id');
            var target = event.target.getAttribute('evt-target');
            liveSearch(target, id);
        }
    }
});
document.addEventListener("click", async (event) => {
    if(!event.target.getAttribute('evt-click')) {
        return;
    } else {
        if(event.target.getAttribute('evt-click') == 'edit') {
            document.getElementById('deleteMe').classList.remove('hide');
            document.getElementById('moveBottom').classList.remove('hide');
            id = event.target.getAttribute('data-line-id');
            text = event.target.textContent;
            document.getElementById('content').value = text;
            document.getElementById('lineId').value = id;
            document.getElementById('dialog-edit').classList.add('active');
        }
        if(event.target.getAttribute('evt-click') == 'moveDown') {
            var line = document.getElementById('lineId').value;
            var task = document.querySelector('[data-line-id="'+line+'"]');
            var text = decodeURIComponent(task.getAttribute('data-task'));

            if(text[0] == '(') {
                if(isDateTimeId(text.substring(4,timeIdLen))) {
                    text = getDateTimeId() + ' ' + text.slice(timeIdLen + 4);
                } else {
                    text = getDateTimeId() + ' ' + text.slice(4);
                }
            } else {
                if(isDateTimeId(text.substring(0,timeIdLen))) {
                    text = getDateTimeId() + ' ' + text.slice(timeIdLen + 1);
                } else {
                    text = getDateTimeId() + ' ' + text;
                }
            }

            task.setAttribute('data-task', encodeURIComponent(text));
            saveTodos();
            document.getElementById('dialog-edit').classList.remove('active');
        }
        if(event.target.getAttribute('evt-click') == 'check') {
            id = event.target.getAttribute('data-id');
            var task = document.querySelector('[data-line-id="'+id+'"]');
            var text = decodeURIComponent(task.getAttribute('data-task'));
            if(text[0] == '(') {
                var priority = text.substring(0,3);
                text = 'x ' + priority + ' ' + new Date().toISOString().split('T')[0] + ' ' + text.slice(4);
            } else {
                text = 'x ' + ' ' + new Date().toISOString().split('T')[0] + ' ' + text;
            }
            task.setAttribute('data-task', encodeURIComponent(text));
            saveTodos();
        }
        if(event.target.getAttribute('evt-click') == 'delete') {
            if(confirm('Are you sure you want to delete this?')) {
                var line = document.getElementById('lineId').value;
                var task = document.querySelector('[data-line-id="'+line+'"]');
                task.remove();
                saveTodos();
                document.getElementById('dialog-edit').classList.remove('active');
            }
        }
        if(event.target.getAttribute('evt-click') == 'add') {
            document.getElementById('deleteMe').classList.add('hide');
            document.getElementById('moveBottom').classList.add('hide');
            document.getElementById('content').value = '';
            document.getElementById('lineId').value = '-1';
            document.getElementById('dialog-edit').classList.add('active');
        }
        if(event.target.getAttribute('evt-click') == 'close') {
            document.getElementById('dialog-edit').classList.remove('active');
        }  
        if(event.target.getAttribute('evt-click') == 'search') {
            document.getElementById('todo-search').value = event.target.getAttribute('evt-target');
            liveSearch('.todo', 'todo-search');
        }  
        if(event.target.getAttribute('evt-click') == 'search-notes') {
            document.getElementById('notes-search-menu').value = event.target.getAttribute('evt-target');
            document.getElementById('notes-search').value = event.target.getAttribute('evt-target');
            liveSearch('.notes', 'notes-search');
        }  
        if(event.target.getAttribute('evt-click') == 'save') {
            var text = document.getElementById('content').value;
            var line = document.getElementById('lineId').value;
            var tasks = text.split(`\n`);

            var task = document.querySelector('[data-line-id="'+line+'"]');
            if(task) {
                task.setAttribute('data-task',encodeURIComponent(tasks[0]));
            } else {
                if(tasks[0][0] == '(') {
                    var priority = tasks[0].substring(0,3);
                    tasks[0] = priority + ' ' + getDateTimeId() + ' ' + tasks[0].slice(4);
                } else {
                    tasks[0] = getDateTimeId() + ' ' + tasks[0];
                }
                document.getElementById('tasks').insertAdjacentHTML('beforeend', '<li class="nav-item todo"><p data-task="'+encodeURIComponent(tasks[0])+'">new</p></li>')
            }

            for(var i = 1; i < tasks.length; i++) {
                if(tasks[0][0] == '(') {
                    var priority = tasks[i].substring(0,3);
                    tasks[i] =  priority + ' ' + getDateTimeId() + ' ' + tasks[i].slice(4);
                } else {
                    tasks[i] = getDateTimeId() + ' ' + tasks[i];
                }
                document.getElementById('tasks').insertAdjacentHTML('beforeend', '<li class="nav-item todo"><p data-task="'+encodeURIComponent(tasks[i])+'">new</p></li>')
            }
            
            saveTodos();
            document.getElementById('dialog-edit').classList.remove('active');
        }
    }
});
window.createTaskList = function() {
    const sortList = list => [...list].sort((a, b) => {
        const A = a.textContent, B = b.textContent;
        return (A < B) ? -1 : (A > B) ? 1 : 0;
    });
    let tasks = document.querySelectorAll('#main-content p');
    for (var i = 0; i < tasks.length; i++) {
        var task = tasks[i];
        var li = document.createElement('li');
        var markup = task.innerHTML;

        var taskId;
        if(markup[0] == '(') {
            //console.log('has priority')
            //console.log(markup.substring(4,timeIdLen + 4))
            //console.log(isDateTimeId(markup.substring(4,timeIdLen + 4)))
            if(isDateTimeId(markup.substring(4,timeIdLen + 4))) {
                taskId = markup.substring(4,timeIdLen + 4);
                markup = markup.substring(0,3) + '<span class="chip no-elevate hide">' + markup.substring(4,timeIdLen) + '</span>' + ' ' + markup.slice(timeIdLen + 4);
            } 
        } else {
            if(isDateTimeId(markup.substring(0,timeIdLen))) {
                taskId = markup.substring(0,timeIdLen);
                markup = '<span class="chip no-elevate hide">' + markup.substring(0,timeIdLen) + '</span>' + ' ' + markup.slice(timeIdLen + 1);
            } 
        }
        markup = markup.replaceAll('(A)',`<span evt-click="search" evt-target="(A)" class="red-text c-hand">(A)</span>`)
            .replaceAll('(B)',`<span evt-click="search" evt-target="(B)" class="orange-text c-hand">(B)</span>`)
            .replaceAll('(C)',`<span evt-click="search" evt-target="(C)" class="yellow-text c-hand">(C)</span>`);
        var words = task.innerHTML.split(' ');
        var contexts = [];
        var projects = [];
        for(var j=0; j < words.length; j++) {
            if(words[j].charAt(0) == '@') {
                contexts.push(words[j]);
                markup = markup.replaceAll(words[j],`<span evt-click="search" evt-target="${words[j]}" class="primary-text c-hand">${words[j]}</span>`)
            }
            if(words[j].charAt(0) == '+') {
                projects.push(words[j]);
                markup = markup.replaceAll(words[j],`<span evt-click="search" evt-target="${words[j]}" class="primary-text c-hand">${words[j]}</span>`)
            }
        }
        li.classList.add('nav-item');
        li.classList.add('todo');
        li.classList.add('mb-2');
        li.classList.add('horizontal-list');
        if(task.innerHTML.charAt(0) == 'x') 
        {
            li.innerHTML = `
                <div class="form-group d-inline">
                    <label class="form-checkbox d-inline">
                        <input evt-click="un-check" data-id="${i}" type="checkbox" checked /><i class="form-icon"></i>
                    </label>
                </div>
                <del ${taskId ? `data-task-id="${taskId}"` : ''} data-task="${encodeURIComponent(task.innerHTML)}" evt-click="edit" data-line-id="${i}">${markup}</del>
            `;            
            li.classList.add('done');
        }
        else
        {
            li.innerHTML = `
                <div class="form-group d-inline">
                    <label class="form-checkbox d-inline">
                        <input evt-click="check" data-id="${i}" type="checkbox" /><i class="form-icon"></i>
                    </label>
                </div>
                <span ${taskId ? `data-task-id="${taskId}"` : ''} data-task="${encodeURIComponent(task.innerHTML)}" evt-click="edit" data-line-id="${i}">${markup}</span>
            `; 
            //li.innerHTML = '<label class="checkbox d-inline"><input evt-click="check" data-id="'+i+'" type="checkbox"><span></span></label><div class="max"><p '+(taskId ? 'data-task-id="'+taskId+'"' : '')+' evt-click="edit" data-line-id="'+i+'" data-task="'+task.innerHTML+'" class="small">' + markup + '</p>';
        }
        task.parentNode.replaceChild(li, task);
    }
    const ul = document.getElementById("tasks");
    const list = ul.querySelectorAll("li");
    ul.append(...sortList(list));
    document.getElementById('todo-search').dispatchEvent(new Event("input"));
}
/************************************************************
** Swap
** Facilitates AJAX-style navigation in web pages 
** MIT Licence - https://github.com/josephernest/Swap
** UPDATED - https://news.ycombinator.com/item?id=36008516
*************************************************************/
var loaders = {}, unloaders = {}, state;
window.register_links = function() {
    for (const elt of document.querySelectorAll('*[swap-target]')) {
        elt.onclick = e => {
            update(elt.getAttribute('href'), elt.getAttribute('swap-target'), elt.getAttribute('swap-history'));
            e.preventDefault();
        }
    }
}
window.register_links();
new MutationObserver(dom_changes).observe(document.querySelector("html"), { childList: true, subtree: true });
window.addEventListener("popstate", (event) => update(location.href, "[swap-history-restore]", false, "body", true, event.state));
window.addEventListener("DOMContentLoaded", dom_load);
function update(href, target, pushstate, fallback = null, back = false, popState = null) {
    if(!href.includes('#') && state && back) {
        //document.querySelector(target).innerHTML = '<div class="center-align middle-align"><progress class="circle"></progress></div>';
        //document.querySelector(target).innerHTML = state;
        //window.scrollTo(0,document.querySelector(`[href="${state.source}"]`).offsetTop)
    } else if(!href.includes('#')) {
        state = document.querySelector(target).innerHTML;
        //document.querySelector(target).innerHTML = '<div class="center-align middle-align"><progress class="circle"></progress></div>';
        fetch(href, { headers: new Headers({"swap-target": target}) }).then(r => r.text()).then(html => {
            var tmp = document.createElement('html');
            tmp.innerHTML = html;
            (document.querySelector(target) ?? document.querySelector(fallback)).outerHTML = (tmp.querySelector(target) ?? tmp.querySelector(fallback)).outerHTML;
            if (pushstate)
                history.pushState({source: href}, "", href);
            window.register_links();  
        }).finally(() => {
            // const openDialog = document.querySelector('dialog[open]');
            // if(openDialog) {
            //     openDialog.close();
            // }
        });
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
let loads = 0;
loaders['#main-content'] = () => {
    console.log("loaders['#main-content']");
    if(loads > 0) {
        let notebookId = document.getElementById('main-content').getAttribute('data-parent');
        let noteId = document.getElementById('main-content').getAttribute('data-id');
        let noteType = document.getElementById('main-content').getAttribute('data-type');

        let note = document.querySelector(`.notes[data-id="${noteId}"]`);
        if(note) {
            let html = note.querySelector(`.html`);
            document.getElementById('main-content').innerHTML = html.innerHTML;

            if(noteType == 'todo') {
                window.createTaskList();
            }
        }
    }
    loads++;



    return () => {  // unloader function
        // document.getElementById('titleBar').innerHTML = `Timeline`;
        // document.getElementById('goBack').classList.add('hide');
        // document.getElementById('menu').classList.remove('hide');
        // document.getElementById('quickPost').classList.remove('hide');
        // document.getElementById('goBackHeader').classList.add('hide');
    };  
}