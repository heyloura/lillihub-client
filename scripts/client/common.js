function growTextArea(el) {
    el.parentNode.dataset.replicatedValue = el.value;
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