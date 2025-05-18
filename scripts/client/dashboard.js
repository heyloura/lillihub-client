
document.addEventListener("DOMContentLoaded", async (event) => {
    fetch("/api/mentions", { method: "get" })
    .then(response => response.json())
    .then(data => {
        let items = data.items.slice(0, 3);
        document.getElementById("mentions").innerHTML = items.map(i => {return `<article class="no-elevate">
            <p>
                ${i.author && i.author._microblog && i.author._microblog.username ? `<a rel="prefetch" swap-target="#main" swap-history="true" href="/timeline/users/${i.author._microblog.username}" class="grey-text">@${i.author._microblog.username}</a>` : i.author.name}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-caret-right" viewBox="0 0 16 16">
                    <path d="M6 12.796V3.204L11.481 8zm.659.753 5.48-4.796a1 1 0 0 0 0-1.506L6.66 2.451C6.011 1.885 5 2.345 5 3.204v9.592a1 1 0 0 0 1.659.753"/>
                </svg>
                ${i.content_html.replace('<p>','').replace('</p>', '').replace('</a> ', '</a>').replaceAll('@{{username}}','')}
                <a class="grey-text" rel="prefetch" swap-target="#main" swap-history="true"  href="/timeline/posts/${i.id}">
                ${i._microblog.date_relative}&nbsp;&nbsp;<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-right-circle" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0M4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5z"/>
                        </svg>
                </a>
            </p>
            </article>` }).join('');
        //register_links();
    });
    fetch("/api/replies", { method: "get" })
    .then(response => response.json())
    .then(data => {
        let items = data.items.slice(0, 3);
        document.getElementById("replies").innerHTML = items.map(i => {return `<article class="no-elevate">
            <p>
                ${i.content_html.replace('<p>','').replace('</p>', '').replaceAll('@{{username}}','')}
                <a class="grey-text" rel="prefetch" swap-target="#main" swap-history="true"  href="/timeline/posts/${i.id}">
                ${i._microblog.date_relative}&nbsp;&nbsp;<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-right-circle" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0M4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5z"/>
                        </svg>
                </a>
            </p>
            </article>` }).join('');
        //register_links();
    });
    fetch("/api/discover/lillihub", { method: "get" })
    .then(response => response.json())
    .then(data => {
        let items = data.slice(0, 5);
        document.getElementById("new").innerHTML = items.map(i => {return i.content }).join('');
        //register_links();
    });
    fetch("/api/discover/photos", { method: "get" })
    .then(response => response.json())
    .then(data => {
        let items = data.slice(0, 5);
        document.getElementById("photos").innerHTML = items.map(i => {return i.content }).join('');
        //register_links();
    });
    fetch("/api/discover", { method: "get" })
    .then(response => response.json())
    .then(data => {
        let items = data.slice(0, 5);
        document.getElementById("discover").innerHTML = items.map(i => {return i.content }).join('');
        //register_links();
    });
    fetch("/api/following/favorites", { method: "get" })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        if(data.length <= 0) {
            document.getElementById("following").innerHTML = '<p>Your favorites will show here</p>'
        } else {
            var following = [... document.querySelectorAll('#following option')];
            document.getElementById("following").innerHTML = `
                <ul class="list border">
                    ${following.filter(f => data.includes(f.value)).map(f => `
                        <li>
                            <img class="round" src="${f.getAttribute('data-avatar')}">
                            <div class="max">
                                <h6 class="small">${f.innerHTML.split('(')[0].trim()}</h6>
                                <div>${f.innerHTML.split('(')[1].replace(')','').trim()}</div>
                            </div>
                        </li>
                    `).join('')}
                </ul>`;
        }
    });
});
/************************************************************
** Swap
** Facilitates AJAX-style navigation in web pages 
** MIT Licence - https://github.com/josephernest/Swap
** UPDATED - https://news.ycombinator.com/item?id=36008516
*************************************************************/
// var loaders = {}, unloaders = {}, state;
// //register_links();
// new MutationObserver(dom_changes).observe(document.querySelector("html"), { childList: true, subtree: true });
// window.addEventListener("popstate", (event) => update(location.href, "[swap-history-restore]", false, "body", true, event.state));
// window.addEventListener("DOMContentLoaded", dom_load);
// function update(href, target, pushstate, fallback = null, back = false, popState = null) {
//     console.log(state);
//     console.log(popState);
//     if(!href.includes('#') && state && back) {
//         document.querySelector(target).innerHTML = '<div class="center-align middle-align"><progress class="circle"></progress></div>';
//         document.querySelector(target).innerHTML = state;
//         //window.scrollTo(0,document.querySelector(`[href="${state.source}"]`).offsetTop)
//     } else if(!href.includes('#')) {
//         state = document.querySelector(target).innerHTML;
//         document.querySelector(target).innerHTML = '<div class="center-align middle-align"><progress class="circle"></progress></div>';
//         fetch(href, { headers: new Headers({"swap-target": target}) }).then(r => r.text()).then(html => {
//             var tmp = document.createElement('html');
//             tmp.innerHTML = html;
//             (document.querySelector(target) ?? document.querySelector(fallback)).outerHTML = (tmp.querySelector(target) ?? tmp.querySelector(fallback)).outerHTML;
//             if (pushstate)
//                 history.pushState({source: href}, "", href);
//             //register_links();  
//             window.scrollTo(0,0);
//         }).finally(() => {
//             const openDialog = document.querySelector('dialog[open]');
//             if(openDialog) {
//                 openDialog.close();
//             }
//         });
//     }
// }
// function register_links() {
//     for (const elt of document.querySelectorAll('*[swap-target]')) {
//         elt.onclick = e => {
//             update(elt.getAttribute('href'), elt.getAttribute('swap-target'), elt.getAttribute('swap-history'));
//             e.preventDefault();
//         }
//     }
// }
// function dom_changes(mutations) {
//     for (var selector in unloaders)
//         for (var m of mutations)
//             for (var n of m.removedNodes)
//                 if (n.matches && n.querySelector && (n.matches(selector) || n.querySelector(selector))) {
//                     unloaders[selector]();
//                     delete unloaders[selector];
//                 }
//     for (var selector in loaders)
//         for (var m of mutations)
//             for (var n of m.addedNodes) 
//                 if (n.matches && n.querySelector && (n.matches(selector) || n.querySelector(selector)))
//                         unloaders[selector] = loaders[selector]();
// }
// function dom_load() {
//     for (var selector in loaders)
//         if (document.querySelector(selector))
//                 unloaders[selector] = loaders[selector]();
// }
// loaders['.conversation'] = () => {
//     document.getElementById('titleBar').innerHTML = `${document.querySelector('.conversation').getAttribute('data-name')}'s Post`;
//     document.getElementById('goBack').classList.remove('hide');
//     document.getElementById('menu').classList.add('hide');
//     document.getElementById('quickPost').classList.add('hide');
//     document.getElementById('goBackHeader').classList.remove('hide');

//     return () => {  // unloader function
//         document.getElementById('titleBar').innerHTML = `Timeline`;
//         document.getElementById('goBack').classList.add('hide');
//         document.getElementById('menu').classList.remove('hide');
//         document.getElementById('quickPost').classList.remove('hide');
//         document.getElementById('goBackHeader').classList.add('hide');
//     };  
// }