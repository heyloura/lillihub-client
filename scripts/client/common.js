function growTextArea(el) {
    el.parentNode.dataset.replicatedValue = el.value;
}

function clearReply(el) {
    let form=el;
    setTimeout(
        function(){
            form.children[2].dataset.replicatedValue = ''; form.children[2].children[0].value = '';
        }, 250);
    document.getElementById('toast').style.display = 'block';
}

function showIframeResult() {
    document.getElementById('toast').style.display = 'block';
}

function collapse(el) {
    el.removeAttribute("open");
    el.classList.remove("closing");
}

function waitForScroll(el) {
    el.classList.add("closing");
    window.setTimeout(collapse, 500, el);
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

function toggleSummary(el, e) {
    // //e.preventDefault();
    // var expanded = el.parentElement.getAttribute('aria-expanded');
    // var open = el.parentElement.hasAttribute("open");
    // if(!open) {
    //     el.parentElement.setAttribute('aria-expanded', true);
    //     el.parentElement.setAttribute('open','true');
    // } else {
    //     el.parentElement.setAttribute('aria-expanded', false);
    //     //el.parentElement.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
    //     //window.setTimeout(waitForScroll, 0, el.parentElement);
    // }
}