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
window.addEventListener('online', handleConnection);
window.addEventListener('offline', handleConnection);
function handleConnection() {
  if(document.getElementById('offline-notice')) {
    document.getElementById('offline-notice').remove();
  }
  if (navigator.onLine) {
    isReachable(getServerUrl()).then(function(online) {
      if (online) {
        // handle online status
        console.log('online');
        _online = true;
      } else {
        console.log('no connectivity');
        _online = false;
        document.querySelector('header').insertAdjacentHTML( 'afterbegin', `<div id="offline-notice" class="toast toast-error">
            Looks like you are offline.
        </div>`);
      }
    });
  } else {
    // handle offline status
    console.log('offline');
    _online = false;
    document.querySelector('header').insertAdjacentHTML( 'afterbegin', `<div id="offline-notice" class="toast toast-error">
        Looks like you are offline.
    </div>`);
  }
}
var _online = false;