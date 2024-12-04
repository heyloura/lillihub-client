// set up gesture navigation
let touchstartX = 0
let touchendX = 0
    
function checkDirection() {
  if (touchendX < touchstartX - 50) {
    history.back();
  }
  if (touchendX > touchstartX) return;
}

document.getElementById('conversation').addEventListener('touchstart', e => {
  touchstartX = e.changedTouches[0].screenX
})

document.getElementById('conversation').addEventListener('touchend', e => {
  touchendX = e.changedTouches[0].screenX
  checkDirection()
})


if(window.location.hash) {
    removeHash();
}

document.addEventListener("DOMContentLoaded", async (event) => {
    document.querySelectorAll("p").forEach(el => el.textContent.trim() === "" && el.parentNode.removeChild(el));

    //grab the discover posts
    if(window.location.pathname.includes('/timeline/discover/')) {
        console.log("/timeline/posts" + window.location.pathname.replace("/timeline",""))
        fetch("/timeline/posts" + window.location.pathname.replace("/timeline",""), { method: "get" })
            .then(response => response.text())
            .then(data => {
                document.getElementById('add-0').innerHTML = data;
                buildCarousels();
            });
    } else if(localStorage.getItem('discover_setting') === 'custom') {
        fetch("/timeline/discover/custom", { method: "get" })
            .then(response => response.text())
            .then(data => {
                document.getElementById('add-0').innerHTML = data;
                buildCarousels();
            });
    } else {
        fetch("/timeline/discover/feed", { method: "get" })
            .then(response => response.text())
            .then(data => {
                document.getElementById('add-0').innerHTML = data;
                buildCarousels();
            });
    }
});

document.addEventListener("input", (event) => {
    if(event.target.classList.contains('grow-me')) {
        growTextArea(event.target);
    }
});
function submitReply(formData, id) {
    fetch("/timeline/reply", { body: formData, method: "post" })
        .then(response => response.text())
        .then(data => {
            if(id && document.getElementById('toast-' + id)) {
                document.getElementById('toast-content-' + id).innerHTML = data;
                document.getElementById('toast-' + id).classList.remove('hide');
            }
        });
}
document.addEventListener("submit", (item) => {
    item.preventDefault();
});
document.addEventListener("click", (item) => {
    var parentHasClassOpenConversationId = findParentHasClassReturnId(item.target, 'openConversationBtn')

    if(item.target.classList.contains('replyBtn')){
        let id = item.target.getAttribute('data-id');
        let form = document.getElementById('replybox-form-' + id); 
        submitReply(new FormData(form), id);
        form.reset();
    }
    if(parentHasClassOpenConversationId != 0 || item.target.classList.contains('openConversationBtn')) {
        //check if item is an anchor... if yes, bail...
        console.log(item.target.tagName);
        if(item.target.tagName.toLowerCase() == "a"){
            return;
        }
        const id = parentHasClassOpenConversationId != 0 ?  parentHasClassOpenConversationId : item.target.getAttribute('data-id');
        document.getElementById('conversation-thread').innerHTML = `<span class="loading d-block"></span>`;
        fetch("/timeline/conversation/" + id, { method: "get" })
            .then(response => response.json())
            .then(data => {
                document.getElementById('conversation-thread').innerHTML = `<div class="card">${data.conversation}</div>`;
                buildCarousels();
            });
        redirectToAnchor('#conversation');
    }
    if(item.target.classList.contains('addToReply')) {
        const username = item.target.getAttribute('data-id');
        const target = item.target.getAttribute('data-target');
        document.getElementById(target).value = document.getElementById(target).value + '@' + username + ' ';
    }
    if(item.target.classList.contains('searchPost')) {
        var term = document.getElementById('searchPost').value;
        alert(term);
        //window.location.href = '/posts/search?q=' + encodeURIComponent(term);
    }
});