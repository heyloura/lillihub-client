// function liveSearch(selector, searchboxId) {
//     let cards = document.querySelectorAll(selector)
//     let search_query = document.getElementById(searchboxId).value;
//     let re = new RegExp(search_query,"g");
//     for (var i = 0; i < cards.length; i++) {
//         if(cards[i].textContent.toLowerCase().includes(search_query.toLowerCase())) {
//             cards[i].classList.remove("hide");
//         } else {
//             cards[i].classList.add("hide");
//         }
//     }
// }
// function countChecked(name, id) {
//     var checkedBoxes = document.querySelectorAll('input[name="' + name + '"]:checked').length; 
//     var element = document.getElementById(id);

//     if(checkedBoxes == 0) {
//         element.removeAttribute('data-badge');
//         element.classList.remove('badge');
//     } else {
//         element.setAttribute('data-badge', checkedBoxes);
//         element.classList.add('badge');
//     }
// }


// set up gesture navigation
let touchstartX = 0
let touchendX = 0
    
function checkDirection() {
  if (touchendX < touchstartX - 50) {
    history.back();
    // document.getElementById('goBackBtn').classList.toggle('hide');
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

// function loadConversations() {
//     if(localStorage.getItem("lillihub_display_mode") == 'conversation') {
//         var promises = [];
//         var children = document.querySelectorAll('[data-mention="true"][data-conversation="true"][data-processed="false"]');
//         children = [...children];
//         children.forEach((child) => {
//             let id = child.getAttribute('data-id');
//             child.classList.remove('parent');
//             child.classList.add('child');
//             child.insertAdjacentHTML( 'beforebegin', '<article id="loading-'+id+'" class="card parent" data-child="'+id+'"><main class="loading"></main></article>');
//             child.setAttribute('data-processed', 'true');

//             var promise = fetch("/timeline/conversation/" + id, { method: "get" })
//                 .then(response => response.json())
//                 .then(data => {
//                     var doc = new DOMParser().parseFromString(data.conversation, "text/html");
//                     var parent = child.parentNode;
//                     var parentArticle = doc.querySelector('article');
//                     if(parentArticle.children.length == 3) {
//                         //clean up for gallery
//                         var galleryImgs = doc.querySelectorAll('article:first-child img');
//                         galleryImgs.forEach((img) => {
//                             img.setAttribute('data-gallery', img.getAttribute('data-gallery') + '-moved');
//                         });
//                         parentArticle.children[2].setAttribute('data-id', parentArticle.children[2].getAttribute('data-id') + '-moved');
//                     }
//                     if(parent && parentArticle && child) {
//                         parent.insertBefore(parentArticle, child);
//                     }
//                     document.getElementById('content-' + id).innerHTML = data.conversation.replaceAll('convoBtns', 'convoBtns hide');
//                     document.getElementById('modal-' + id).setAttribute('data-loaded', 'true');

//                     let visibleParent = document.getElementById(parentArticle.getAttribute('data-id')); 
//                     if(visibleParent) {
//                         visibleParent.remove();
//                     }

//                     document.getElementById('loading-' + id).remove();
//                 });

//                 promises.push(promise);
//         });

//         Promise.all(promises).then(results => {
//             var parents = document.querySelectorAll('.parent');
//             parents = [...parents];
//             let singles = new Set();
//             parents.forEach((parent) => {
//                 let id = parent.getAttribute('data-id');
//                 if(!parent.parentNode.getAttribute('id').includes('content') && singles.has(id)) {
//                     parent.children[0].style.borderBottom = 0;
//                     if(parent.children.length > 1 && parent.children[1].nodeName == 'MAIN') {
//                         parent.children[1].remove();
//                     }
//                     if(parent.children.length > 2 && parent.children[1].nodeName == 'DIV') {
//                         parent.children[2].remove();
//                     }                                
//                 }
//                 singles.add(id);
//             });
//             buildCarousels();
//         });

//     }
// }
window.addEventListener('online', handleConnection);
window.addEventListener('offline', handleConnection);
document.addEventListener("DOMContentLoaded", async (event) => {
    document.querySelectorAll("p").forEach(el => el.textContent.trim() === "" && el.parentNode.removeChild(el));
    
    handleConnection(() => {
        if(localStorage.getItem('post_setting'))
        {
            if(localStorage.getItem('post_setting') === 'none') {
                document.getElementById('mainPost').classList.add('hide');
            } else {
                if(localStorage.getItem('post_setting') === 'statuslog' || localStorage.getItem('post_setting') === 'weblog')
                {
                    document.getElementById('postingName').innerHTML = `${localStorage.getItem('omg_address')} (${localStorage.getItem('post_setting')})`;
                    document.getElementById('postingType').value = localStorage.getItem('post_setting');
                    document.getElementById('omgAddess').value = localStorage.getItem('omg_address');
                    document.getElementById('omgApi').value = localStorage.getItem('omg_api');
                } else if(localStorage.getItem('post_setting') === 'micropub') {
                    document.getElementById('postingName').innerHTML = `${localStorage.getItem('indieweb_nickname')} (${localStorage.getItem('post_setting')})`;
                    document.getElementById('postingType').value = 'micropub';
                    document.getElementById('indieToken').value = localStorage.getItem('indieauth_endpoint');
                    document.getElementById('microPub').value = localStorage.getItem('micropub_endpoint');
                } else {
                    document.getElementById('postingType').value = 'mb';
                }
            }
        }
    
        //grab the timeline posts
        fetch("/timeline/0", { method: "get" })
            .then(response => response.text())
            .then(data => {
                document.getElementById('add-0').innerHTML = data;
                const article = document.querySelector('article:first-child');
                const id = article.getAttribute('id');
                let checks = 0;
                const timerID = setInterval(function() {
                    fetch("/timeline/check/" + id, { method: "get" })
                        .then(response => response.json())
                        .then(data => {
                            if(data.count > 0) {
                                document.getElementById('morePostsToast').classList.remove('hide');
                                document.getElementById('showPostCount').innerHTML = data.count;
                                console.log(data);
                                document.getElementById('showPostCount').setAttribute('marker', data.markers.timeline.id);
                            }     
                        });
                    checks++;
                    if(checks > 10) {
                        clearInterval(timerID);
                    }
                }, 60 * 1000); 
                fetch("/timeline/mark/" + id, { method: "get" })
                    .then(response => response.text())
                    .then(_data => {});
    
                buildCarousels();
                //loadConversations();
            });
    });
});



// document.addEventListener("change", (event) => {
//     if(event.target.classList.contains('countCheckedCategory')) {
//         countChecked('category[]', 'categoriesDropdown');
//     }
//     if(event.target.classList.contains('countCheckedSyndicates')) {
//         countChecked('syndicate[]', 'syndicatesDropdown');
//     }
// });
// document.addEventListener("focusin", (event) => {
//     if(event.target.classList.contains('updateTags')){
//         event.target.setAttribute('type', 'email');
//     }
// });
// document.addEventListener("focusout", (event) => {
//     if(event.target.classList.contains('updateTags')){
//         event.target.setAttribute('type', 'text');
//     }
// });
document.addEventListener("input", (event) => {
    
    // if(event.target.classList.contains('search')){
    //     liveSearch('article', 'search');
    // }
    // if(event.target.classList.contains('searchFollowing')){
    //     liveSearch('tr', 'search');
    // }
    if(event.target.classList.contains('grow-me')) {
        growTextArea(event.target);
    }
    if(event.target.classList.contains('replierInput')){
        let id = event.target.getAttribute('data-id');
        let menu = document.getElementById('replybox-menu-' + id); 
        menu.classList.remove('hide');
        var menuItems = menu.children;
        if(!event.target.value)
        {
            menu.classList.add('hide');
        }
        for (var i = 0; i < menuItems.length; i++) {
            var item = menuItems[i];
            if(event.target.value && ('@' + item.getAttribute('data-name')).toLowerCase().includes(event.target.value.toLowerCase())) {
                item.classList.remove('hide');
                item.innerHTML = '<a data-avatar="'+item.getAttribute('data-avatar')+'" data-name="'+item.getAttribute('data-name')+'" data-id="' + id + '" class="addUserToReplyBox" href="#"><div data-avatar="'+item.getAttribute('data-avatar')+'" data-name="'+item.getAttribute('data-name')+'" data-id="' + id + '" class="tile tile-centered addUserToReplyBox">' +
                    '<div data-avatar="'+item.getAttribute('data-avatar')+'" data-name="'+item.getAttribute('data-name')+'" data-id="' + id + '" class="tile-icon addUserToReplyBox"><img data-avatar="'+item.getAttribute('data-avatar')+'" data-name="'+item.getAttribute('data-name')+'" data-id="' + id + '" class="avatar avatar-sm addUserToReplyBox" src="'+item.getAttribute('data-avatar')+'"></div>' +
                    '<div data-avatar="'+item.getAttribute('data-avatar')+'" data-name="'+item.getAttribute('data-name')+'" data-id="' + id + '" class="tile-content addUserToReplyBox">@'+item.getAttribute('data-name').replaceAll(event.target.value, '<mark>' + event.target.value + '</mark>')+'</div></div></a>';
            } else {
                item.classList.add('hide');
            }
        }
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
function submitPost(formData) {
    fetch("/post/add", { body: formData, method: "post" })
        .then(response => response.json())
        .then(data => {
            document.getElementById('postToastMessage').innerHTML = data.response.message;
            document.getElementById('postToast').classList.remove("hide");
        });
}
document.addEventListener("submit", (item) => {
    item.preventDefault();
});
document.addEventListener("click", (item) => {
    var parentHasClassOpenConversationId = findParentHasClassReturnId(item.target, 'openConversationBtn')




    // if(item.target.classList.contains('noteTag')) {
    //     document.getElementById('search').value = item.target.getAttribute('data-id');
    //     document.getElementById('search').dispatchEvent(new Event('input', {bubbles: true,cancelable: true}));
    // }
    // if(item.target.classList.contains('searchUser')) {
    //     var term = document.getElementById('searchUser').value;
    //     window.location.href = '/users/search?q=' + encodeURIComponent(term);
    // }
    // if(item.target.classList.contains('searchPost')) {
    //     var term = document.getElementById('searchPost').value;
    //     window.location.href = '/posts/search?q=' + encodeURIComponent(term);
    // }
    // if(item.target.classList.contains('addBookmark')){
    //     let url = item.target.getAttribute('data-url');
    //     let formData = new FormData();
    //     formData.append("url", url);
    //     fetch("/bookmarks/new", { body: formData, method: "post" })
    //     .then(response => response.text())
    //     .then(data => {
    //         alert(data);
    //     });
    // }
    // if(item.target.classList.contains('followUser') || item.target.classList.contains('unfollow')){
    //     let username = item.target.getAttribute('data-username');
    //     let formData = new FormData();
    //     let tag = item.target.classList.contains('unfollow') ? '-unfollow' : '-follow';
    //     formData.append("username", username);
    //     formData.append("unfollow", item.target.classList.contains('unfollow'));
    //     fetch("/users/follow", { body: formData, method: "post" })
    //     .then(response => response.text())
    //     .then(data => {
    //         if(username && document.getElementById('toast-' + username + tag)) {
    //             document.getElementById('toast-username-' + username + tag).innerHTML = data;
    //             document.getElementById('toast-' + username + tag).classList.remove('hide');
    //             item.target.classList.add('hide');
    //         }
    //     });
    // }
    // if(item.target.classList.contains('deleteNote')){
    //     if(confirm('Are you sure you want to delete this note? This action cannot be undone.')){
    //         let id = item.target.getAttribute('data-id');
    //         let notebookid = item.target.getAttribute('data-notebookid');
    //         fetch("/notebooks/delete/" + id, { method: "get" })
    //         .then(response => response.text())
    //         .then(data => {
    //             window.location.href = '/notebooks/' + notebookid;
    //         });
    //     }
    // }
    // if(item.target.classList.contains('saveNotesKey')){
    //     let noteKey = document.getElementById('notes_key');
    //     localStorage.setItem('notes_key', noteKey.value);
    //     document.getElementById('enter_notes_key').style.display = 'none';
    //     window.location.reload();
    // }
    // if(item.target.classList.contains('saveDisplayMode')){
    //     let value = document.querySelector('input[name="display"]:checked').value;
    //     localStorage.setItem('lillihub_display_mode', value);
    //     window.location.reload();
    // }
    if(item.target.classList.contains('addUserToReplyBox')){
        item.preventDefault();
        let id = item.target.getAttribute('data-id');
        let name = item.target.getAttribute('data-name');
        let avatar = item.target.getAttribute('data-avatar');
        let chips = document.getElementById('replybox-chips-'+ id); 
        chips.innerHTML = chips.innerHTML + '<span id="chip-'+id+'-'+name+'" class="chip"><img class="avatar avatar-sm" src="'+avatar+'" />@'+name+'<a data-name="'+name+'" data-id="'+id+'" class="btn btn-clear replierRemoveChip" href="#" aria-label="Close" role="button"></a></span>';                    
        document.getElementById('replybox-input-'+ id).value = '';
        document.getElementById('replybox-input-'+ id).focus();
        document.getElementById('replybox-menu-' + id).classList.add('hide');
        document.getElementById('replybox-checkbox-' + id + '-' + name).checked = true; 
    }
    if(item.target.classList.contains('replierRemoveChip')){
        let id = item.target.getAttribute('data-id');
        let name = item.target.getAttribute('data-name');
        document.getElementById('chip-'+ id + '-' + name).remove(); 
        document.getElementById('replybox-input-'+ id).focus();
        document.getElementById('replybox-menu-' + id).classList.add('hide');
        document.getElementById('replybox-checkbox-' + id + '-' + name).checked = false; 
    }
    if(item.target.classList.contains('loadTimeline')){
        let id = item.target.getAttribute('data-id');
        item.target.classList.add('loading');
        fetch("/timeline/" + id, { method: "get" })
            .then(response => response.text())
            .then(data => {
                document.getElementById('add-' + id).innerHTML = data;
                buildCarousels();
                item.target.style.display = 'none';
                //loadConversations();
            });
    }
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
    // if(item.target.classList.contains('closeConversationBtn')) {
    //     let id = item.target.getAttribute('data-id');
    //     document.getElementById('modal-' + id).classList.remove("active");
    // }
    // if(item.target.classList.contains('openDetailsBtn')) {
    //     let id = item.target.getAttribute('data-id');
    //     document.getElementById('details-' + id).classList.add("active");
    // }
    // if(item.target.classList.contains('closeDetailsBtn')) {
    //     let id = item.target.getAttribute('data-id');
    //     document.getElementById('details-' + id).classList.remove("active");
    // }
    if(item.target.classList.contains('clearToast')) {
        let id = item.target.getAttribute('data-id');
        document.getElementById('toast-' + id).classList.add("hide");
    }
    if(item.target.classList.contains('toggleMainReplyBox')) {
        // need to clear values if toggled
        document.getElementById('mainReplyBox').classList.toggle('hide');
        document.getElementById('mainReplyBox').classList.add('mb-2');
    }
    if(item.target.classList.contains('sendPost')) {
        item.preventDefault();
        const form = document.getElementById('mainPost'); 
        submitPost(new FormData(form));
        document.getElementById('post').value = '';
        document.getElementById('replybox-input-main').value = ''; 
    }
    if(item.target.classList.contains('dismissPostToast')) {
        document.getElementById('postToast').classList.add("hide");
    }
    if(item.target.classList.contains('dismissMorePostsToast')) {
        document.getElementById('morePostsToast').classList.add("hide");
    }
    if(item.target.classList.contains('getNewPosts')) {
        document.getElementById('add-0').innerHTML = '<div class="mt-2" id="add-0"><span class="loading d-block"></span></div>';
        document.getElementById('morePostsToast').classList.add('hide');
        fetch("/timeline/0", { method: "get" })
            .then(response => response.text())
            .then(data => {
                document.getElementById('add-0').innerHTML = data;
                const article = document.querySelector('article:first-child');
                const id = article.getAttribute('id');
                let checks = 0;
                const timerID = setInterval(function() {
                    fetch("/timeline/check/" + id, { method: "get" })
                        .then(response => response.json())
                        .then(data => {
                            if(data.count > 0) {
                                document.getElementById('morePostsToast').classList.remove('hide');
                                document.getElementById('showPostCount').innerHTML = data.count;
                                console.log(data);
                                document.getElementById('showPostCount').setAttribute('marker', data.markers.timeline.id);
                            }     
                        });
                    checks++;
                    if(checks > 10) {
                        clearInterval(timerID);
                    }
                }, 60 * 1000); 
                fetch("/timeline/mark/" + id, { method: "get" })
                    .then(response => response.text())
                    .then(_data => {});

                buildCarousels();
            });
    }
    if(item.target.classList.contains('addToReply')) {
        const username = item.target.getAttribute('data-id');
        const target = item.target.getAttribute('data-target');
        console.log(username, target);
        document.getElementById(target).value = document.getElementById(target).value + '@' + username + ' ';
    }

});