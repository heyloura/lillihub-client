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
function growTextArea(el) {
    el.parentNode.dataset.replicatedValue = el.value;
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
function loadConversations() {
    if(localStorage.getItem("lillihub_display_mode") == 'conversation') {
        var promises = [];
        var children = document.querySelectorAll('[data-mention="true"][data-conversation="true"][data-processed="false"]');
        children = [...children];
        children.forEach((child) => {
            let id = child.getAttribute('data-id');
            child.classList.remove('parent');
            child.classList.add('child');
            child.insertAdjacentHTML( 'beforebegin', '<article id="loading-'+id+'" class="card parent" data-child="'+id+'"><main class="loading"></main></article>');
            child.setAttribute('data-processed', 'true');

            var promise = fetch("/conversation/" + id, { method: "get" })
                .then(response => response.json())
                .then(data => {
                    var doc = new DOMParser().parseFromString(data.conversation, "text/html");
                    var parent = child.parentNode;
                    var parentArticle = doc.querySelector('article');
                    if(parentArticle.children.length == 3) {
                        //clean up for gallery
                        var galleryImgs = doc.querySelectorAll('article:first-child img');
                        galleryImgs.forEach((img) => {
                            img.setAttribute('data-gallery', img.getAttribute('data-gallery') + '-moved');
                        });
                        parentArticle.children[2].setAttribute('data-id', parentArticle.children[2].getAttribute('data-id') + '-moved');
                    }
                    if(parent && parentArticle && child) {
                        parent.insertBefore(parentArticle, child);
                    }
                    document.getElementById('content-' + id).innerHTML = data.conversation.replaceAll('convoBtns', 'convoBtns hide');
                    document.getElementById('modal-' + id).setAttribute('data-loaded', 'true');

                    let visibleParent = document.getElementById(parentArticle.getAttribute('data-id')); 
                    if(visibleParent) {
                        visibleParent.remove();
                    }

                    document.getElementById('loading-' + id).remove();
                });

                promises.push(promise);
        });

        Promise.all(promises).then(results => {
            var parents = document.querySelectorAll('.parent');
            parents = [...parents];
            let singles = new Set();
            parents.forEach((parent) => {
                let id = parent.getAttribute('data-id');
                if(!parent.parentNode.getAttribute('id').includes('content') && singles.has(id)) {
                    parent.children[0].style.borderBottom = 0;
                    if(parent.children.length > 1 && parent.children[1].nodeName == 'MAIN') {
                        parent.children[1].remove();
                    }
                    if(parent.children.length > 2 && parent.children[1].nodeName == 'DIV') {
                        parent.children[2].remove();
                    }                                
                }
                singles.add(id);
            });
            buildCarousels();
        });

    }
}
document.addEventListener("DOMContentLoaded", async (event) => {
    document.querySelectorAll("p").forEach(el => el.textContent.trim() === "" && el.parentNode.removeChild(el));
    if(window.location.pathname == '/') {
        //set up the UI
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
                    fetch("/check/" + id, { method: "get" })
                        .then(response => response.json())
                        .then(data => {
                            if(data.count > 0) {
                                document.getElementById('morePostsToast').classList.remove('hide');
                                document.getElementById('showPostCount').innerHTML = data.count;
                            }     
                        });
                    checks++;
                    if(checks > 10) {
                        clearInterval(timerID);
                    }
                }, 60 * 1000); 
                fetch("/mark/timeline/" + id, { method: "get" })
                    .then(response => response.text())
                    .then(_data => {});

                buildCarousels();
                //loadConversations();
            });

        //fetch the discover photos
        fetch("/discover/photos", { method: "get" })
            .then(response => response.text())
            .then(data => {
                document.getElementById('discover-photos').innerHTML = data;
            });

        //fetch the discover feed
        fetch("/discover/feed", { method: "get" })
            .then(response => response.text())
            .then(data => {
                document.getElementById('discover-feed').innerHTML = data;
            });

        //suggestions
        fetch("/suggestions", { method: "get" })
            .then(response => response.text())
            .then(data => {
                document.getElementById('suggestions').innerHTML = data;
            });
    } 
    
    // else if(window.location.pathname.includes('/user/')) {
    //     fetch("/posts/" + window.location.pathname.replace('/user/',''), { method: "get" })
    //         .then(response => response.text())
    //         .then(data => {
    //             document.getElementById('add-0').innerHTML = data;
    //             buildCarousels();
    //             loadConversations(); 
    //         });
    // } else if(window.location.pathname.includes('/discover')) {
    //     console.log("/posts" + window.location.pathname);
    //     fetch("/posts" + window.location.pathname, { method: "get" })
    //         .then(response => response.text())
    //         .then(data => {
    //             document.getElementById('add-0').innerHTML = data;
    //             buildCarousels();
    //         });
    // } else if(window.location.pathname == '/mentions') {
    //     fetch("/posts/mentions", { method: "get" })
    //         .then(response => response.text())
    //         .then(data => {
    //             document.getElementById('add-0').innerHTML = data;
    //             buildCarousels();
    //             loadConversations();
    //         });
    // }  else if(window.location.pathname.includes('/users/search')) {
    //     buildCarousels();
    //     loadConversations();
    // } else if(window.location.pathname == '/post') {
    //     document.getElementById('post').style.display = 'none';
    //     countChecked('category[]', 'categoriesDropdown');
    //     countChecked('syndicate[]', 'syndicatesDropdown');
    // } else if(window.location.pathname == '/blog') {
    //     const converter = new showdown.Converter();
    //     var articles = document.querySelectorAll('article');
    //     for(let i = 0; i < articles.length; i++) {
    //         let article = articles[i];
    //         let id = article.getAttribute('data-id');
    //         let content = document.querySelector('#content-' + id);
    //         content.innerHTML = converter.makeHtml(content.innerHTML);
    //         content.classList.remove('hide');
    //     }
    // } else if(window.location.pathname.includes('/notebooks/')) {
    //     document.getElementById('post').classList.add("hide");
    //     document.getElementById('newnotebook').classList.remove("hide");
    //     document.getElementById('newnotebook').setAttribute('href', window.location.pathname + '/add');
    //     const converter = new showdown.Converter({metadata: true, openLinksInNewWindow: true, strikethrough:true, tables:true, tasklists:true, emoji:true });
    //     ${EncryptJS()}
    //     const notes = document.querySelectorAll('.decryptMe');
    //     let tags = new Set();
    //     for (var i = 0; i < notes.length; i++) {
    //         var markdown = await decryptWithKey(notes[i].innerHTML);
    //         notes[i].innerHTML = converter.makeHtml(markdown);
    //         var metadata = converter.getMetadata();
    //         let id = notes[i].getAttribute('data-id');
    //         if(metadata) {
    //             if(metadata.title) {
    //                 document.getElementById('title-' + id).innerHTML = metadata.title;
    //             }
    //             if(metadata.tags) {
    //                 document.getElementById('tags-' + id).innerHTML = metadata.tags.substring(1,metadata.tags.length - 1).split(',').map(t => '<span data-id="'+t+'" class="chip noteTag">'+t+'</span>').join(' ');
    //                 metadata.tags.substring(1,metadata.tags.length - 1).split(',').forEach(t => tags.add(t));
    //                 }
    //             document.getElementById('metadata-' + id).innerHTML = JSON.stringify(metadata,null,2);
    //         }
    //     }
    //     hljs.highlightAll();
    //     const tables = document.querySelectorAll('table');
    //     for (var i = 0; i < tables.length; i++) {
    //         tables[i].classList.add('table');
    //         tables[i].classList.add('table-striped');
    //     }
    //     if(Array.from(tags).length > 0) {
    //         document.getElementById('noteTags').innerHTML = Array.from(tags).map(t => '<span data-id="'+t+'" class="chip noteTag">'+t+'</span> ').join('')
    //     }
    // } else if(window.location.pathname.includes('/bookmarks') || window.location.pathname.includes('/highlights')) {
    //     document.getElementById('post').classList.add("hide");
    //     document.getElementById('newbookmark').classList.remove("hide");
    // } else if(window.location.pathname.includes('/reader')) {
    //     document.getElementById('post').classList.add("hide");
    // }
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

        console.log('event.target.classList.contains(replierInput) fired');

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
    fetch("/reply", { body: formData, method: "post" })
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
    if(item.target.classList.contains('addBookmark')){
        let url = item.target.getAttribute('data-url');
        let formData = new FormData();
        formData.append("url", url);
        fetch("/bookmarks/new", { body: formData, method: "post" })
        .then(response => response.text())
        .then(data => {
            alert(data);
        });
    }
    if(item.target.classList.contains('followUser') || item.target.classList.contains('unfollow')){
        let username = item.target.getAttribute('data-username');
        let formData = new FormData();
        let tag = item.target.classList.contains('unfollow') ? '-unfollow' : '-follow';
        formData.append("username", username);
        formData.append("unfollow", item.target.classList.contains('unfollow'));
        fetch("/users/follow", { body: formData, method: "post" })
        .then(response => response.text())
        .then(data => {
            if(username && document.getElementById('toast-' + username + tag)) {
                document.getElementById('toast-username-' + username + tag).innerHTML = data;
                document.getElementById('toast-' + username + tag).classList.remove('hide');
                item.target.classList.add('hide');
            }
        });
    }
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
    if(item.target.classList.contains('saveDisplayMode')){
        let value = document.querySelector('input[name="display"]:checked').value;
        localStorage.setItem('lillihub_display_mode', value);
        window.location.reload();
    }
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
    if(item.target.classList.contains('openConversationBtn')) {
        const id = item.target.getAttribute('data-id');

        if(document.getElementById('main-' + id).classList.contains('hide') || item.target.getAttribute('data-loaded') === 'true') {
            document.getElementById('main-' + id).classList.toggle('hide')
        } else {
            fetch("/conversation/" + id, { method: "get" })
            .then(response => response.json())
            .then(data => {
                document.getElementById('content-' + id).innerHTML = data.conversation;
                item.target.setAttribute('data-loaded', 'true')
                document.getElementById('main-' + id).classList.toggle('hide')
            });
        }
    }
    if(item.target.classList.contains('closeConversationBtn')) {
        let id = item.target.getAttribute('data-id');
        document.getElementById('modal-' + id).classList.remove("active");
    }
    if(item.target.classList.contains('openDetailsBtn')) {
        let id = item.target.getAttribute('data-id');
        document.getElementById('details-' + id).classList.add("active");
    }
    if(item.target.classList.contains('closeDetailsBtn')) {
        let id = item.target.getAttribute('data-id');
        document.getElementById('details-' + id).classList.remove("active");
    }
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
    if(item.target.classList.contains('addToReply')) {
        const username = item.target.getAttribute('data-id');
        const target = item.target.getAttribute('data-target');
        console.log(username, target);
        document.getElementById(target).value = document.getElementById(target).value + '@' + username + ' ';
    }

});