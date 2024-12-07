function growTextArea(el) {
    el.parentNode.dataset.replicatedValue = el.value;
}
function liveSearch(selector, searchboxId) {
    let cards = document.querySelectorAll(selector)
    let search_query = document.getElementById(searchboxId).value;
    for (var i = 0; i < cards.length; i++) {
        if(cards[i].textContent.toLowerCase().includes(search_query.toLowerCase())) {
            cards[i].classList.remove("d-hide");
        } else {
            cards[i].classList.add("d-hide");
        }
    }
}
const findParentHasClassReturnId = (el, className) => {
    if(!el || !el.parentNode || !el.parentNode.classList) 
    {
        return 0;
    }
    if(el.parentNode.classList.contains(className)) 
    {
        return el.parentNode.getAttribute('id');
    }
    return findParentHasClassReturnId(el.parentNode, className);
}
function redirectToAnchor(anchor, scrollToTop = true) {
    var delayInMilliseconds = 400;
    setTimeout(function() {
        document.location.hash = anchor;
        if(scrollToTop) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, delayInMilliseconds);
}
function removeHash() { 
    var scrollV, scrollH, loc = window.location;
    if ("pushState" in history)
        history.pushState("", document.title, loc.pathname + loc.search);
    else {
        // Prevent scrolling by storing the page's current scroll offset
        scrollV = document.body.scrollTop;
        scrollH = document.body.scrollLeft;

        loc.hash = "";

        // Restore the scroll offset, should be flicker free
        document.body.scrollTop = scrollV;
        document.body.scrollLeft = scrollH;
    }
}
function buildCarousel(id, imageArray) 
{
    let grid = '<div class="masonry-layout columns-2" id="masonry-'+id+'" data-id="'+id+'" >';
    let column1 = '<div class="masonry-column-1">';
    let column2 = '<div class="masonry-column-2">';
    for(var i = 0; i < imageArray.length; i++) {
        let column = i % 2;
        if(column == 0) {
            column1 += '<img data-id="'+id+'" src="'+imageArray[i]+'">';
        }
        if(column == 1) {
            column2 += '<img data-id="'+id+'" src="'+imageArray[i]+'">';
        } 
    }
    return grid + column1 + '</div>' + column2 + '</div>' + '</div>';
}
function buildCarousels() {
    let galleries = document.querySelectorAll('.gallery');

    for(let i = 0; i < galleries.length; i++) {
        let loaded = galleries[i].getAttribute('data-loaded');
        if(!loaded) {
            let id = galleries[i].getAttribute('data-id');
            let imgs = document.querySelectorAll('[data-gallery="'+id+'"]');
            let imageArray = [];
            for(let j = 0; j < imgs.length; j++) {
                imageArray.push(imgs[j].getAttribute('src'));
                imgs[j].remove();
            }
            galleries[i].innerHTML = buildCarousel(id, imageArray);
            galleries[i].setAttribute('data-loaded', 'true');
        }
    }
}
if ('storage' in navigator && 'estimate' in navigator.storage) {
    navigator.storage.estimate().then(({usage, quota}) => {
      console.log(`Using ${usage} out of ${quota} bytes.`);
    }).catch(error => {
      console.error('Loading storage estimate failed:');
      console.log(error.stack);
    });
  } else {
    console.error('navigator.storage.estimate API unavailable.');
}

/***********************
** HANDLE OFFLINE STUFF
************************/
function isReachable(url) {
    return fetch(url, { method: 'HEAD', mode: 'no-cors' })
      .then(function(resp) {
        return resp && (resp.ok || resp.type === 'opaque');
      })
      .catch(function(err) {
        console.warn('[conn test failure]:', err);
      });
}
function getServerUrl() {
    return window.location.origin;
}
function handleConnection(load, offline) {
  if(document.getElementById('offline-notice')) {
    document.getElementById('offline-notice').remove();
  }
  if (navigator.onLine) {
    isReachable(getServerUrl()).then(function(online) {
      if (online) {
        load();
      } else {
        offline();
        document.querySelector('header').insertAdjacentHTML( 'afterbegin', `<div id="offline-notice" class="toast toast-error">
            Looks like you are offline.
        </div>`);
      }
    });
  } else {
    offline();
    document.querySelector('header').insertAdjacentHTML( 'afterbegin', `<div id="offline-notice" class="toast toast-error">
        Looks like you are offline.
    </div>`);
  }
}
window.addEventListener('online', handleConnection(function(){},function(){}));
window.addEventListener('offline', handleConnection(function(){},function(){}));


/************************************************************
** Swap
** Facilitates AJAX-style navigation in web pages 
** MIT Licence - https://github.com/josephernest/Swap
** UPDATED - https://news.ycombinator.com/item?id=36008516
*************************************************************/
var Swap = (() => {
    "use strict";
    var loaders = {}, unloaders = {};
    register_links();
    new MutationObserver(dom_changes).observe(document.querySelector("html"), { childList: true, subtree: true });
    window.addEventListener("popstate", () => update(location.href, "[swap-history-restore]", false, "body"));
    window.addEventListener("DOMContentLoaded", dom_load);
    function update(href, target, pushstate, fallback = null) {
        fetch(href, { headers: new Headers({"swap-target": target}) }).then(r => r.text()).then(html => {
            var tmp = document.createElement('html');
            tmp.innerHTML = html;
            (document.querySelector(target) ?? document.querySelector(fallback)).outerHTML = (tmp.querySelector(target) ?? tmp.querySelector(fallback)).outerHTML;
            if (pushstate)
                history.pushState({}, "", href);
            register_links();  
        });
    }
    function register_links() {
        for (const elt of document.querySelectorAll('*[swap-target]')) {
            elt.onclick = e => {
                update(elt.getAttribute('href'), elt.getAttribute('swap-target'), elt.getAttribute('swap-history'));
                e.preventDefault();
            }
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
    return {loaders: loaders};
})();

// fetch(`/api/notebooks`, { method: "get" })
// .then(async response => response.json())
// .then(async data => {
//     const links = data.items.sort((a,b) => (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0)).map(element => {
//         `<li class="menu-item"><a class="notebook-${element.id}" href="/notebook/${element.id}" swap-target="#main" swap-history="true">${element.title}</a></li>`
//     }).join('');
//     document.getElementById('notebooks').insertAdjacentHTML('beforeend', links); 
// });
document.addEventListener("input", (event) => {
    if(event.target.classList.contains('grow-me')) {
        growTextArea(event.target);
    }
});