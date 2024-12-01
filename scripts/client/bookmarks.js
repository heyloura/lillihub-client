if(window.location.hash) {
    removeHash();
}

function addHighlight(formData) {
    fetch("/highlight/new", { body: formData, method: "post" })
        .then(response => response.json())
        .then(data => {
        // do whatever you want with the data
        });
}
var selectionEndTimeout;
function userSelectionChanged() {
    if (selectionEndTimeout) {
        clearTimeout(selectionEndTimeout);
    }                  
    selectionEndTimeout = setTimeout(function () {
    document.dispatchEvent(new Event("selectionEnd"));
    }, 1000);
}
document.addEventListener("selectionEnd", function(event) {
    selectionEndTimeout = null; // clear out time
    console.log('hahahah');
    document.getElementById('makeHighlight').showModal();
});
function gatherNodes(startElement, results) {
    results.push(startElement);
startElement.childNodes.forEach(function (e) {
    gatherNodes(e, results);
});
}
function calculateContentOffset(findNode, offset) {
    var e = document.getElementById("content");
    var results = Array();
    gatherNodes(e, results);
    var current_pos = 0;
    for (var i = 0; i < results.length; i++) {
    var node = results[i];
    if (node.isSameNode(findNode)) {
        return current_pos + offset;
    }
    if (node.length != undefined) {
        current_pos = current_pos + node.length;
    }
    }
}
function getSelectionHtml() {
    var html = "";
    if (typeof window.getSelection != "undefined") {
        var sel = window.getSelection();
        if (sel.rangeCount) {
            var container = document.createElement("div");
            for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                container.appendChild(sel.getRangeAt(i).cloneContents());
            }
            html = container.innerHTML;
            if (!sel.isCollapsed) {
                userSelectionChanged();
                var start = calculateContentOffset(sel.anchorNode, sel.anchorOffset);
                document.getElementById('selectionStart').value = start;
                document.getElementById('selectionEnd').value = start + sel.toString().length;
                document.getElementById('selectionInput').value = html;
                document.getElementById('highlightedSelection').innerHTML = html;
            }
        }
    } else if (typeof document.selection != "undefined") {
        if (document.selection.type == "Text") {
            html = document.selection.createRange().htmlText;
        }
    }
}
document.addEventListener("selectionchange", function(event) {
    const selection = window.getSelection();     
    if (selection.rangeCount === 0) {
        return;
    }
    getSelectionHtml();
});
document.addEventListener("DOMContentLoaded", async (event) => {
    //grab the bookmarks
    fetch("/bookmarks/bookmarks", { method: "get" })
        .then(response => response.text())
        .then(data => {
            document.getElementById('add-0').innerHTML = data;
        });
});

document.addEventListener("click", (item) => {
    var toggleBookmarkParent = findParentHasClassReturnId(item.target, 'toggleBookmark')
    if(toggleBookmarkParent != 0 || item.target.classList.contains('toggleBookmark')) {
        //check if item is an anchor... if yes, bail...
        console.log(item.target.tagName);
        if(item.target.tagName.toLowerCase() == "a"){
            return;
        }
        const id = toggleBookmarkParent != 0 ? toggleBookmarkParent : item.target.getAttribute('data-id');
        const parent = document.getElementById(id);
        document.getElementById('details-main').innerHTML = `${parent.innerHTML}`;

        console.log(parent.getAttribute('data-highlights'))
        console.log(parent.getAttribute('data-title'))
        console.log(parent.getAttribute('data-reader'))

        if(parent.getAttribute('data-reader')) {
            document.getElementById('details-main').innerHTML += `<div class="mb-2" id="reader-${parent.getAttribute('data-reader')}"><span class="loading d-block"></span></div>`; 
            fetch("/bookmarks/reader/" + parent.getAttribute('data-reader'), { method: "get" })
                .then(response => response.json())
                .then(data => {
                    document.getElementById(`reader-${parent.getAttribute('data-reader')}`).innerHTML = `<div class="divider text-center mt-2 mb-2" data-content="Reader"></div><div class="mt-2 bordered p-2">${data.content}</div>`;
            });
        }

        if(parent.getAttribute('data-highlights'))
        {
            
        }

        redirectToAnchor('#details');
    }
});