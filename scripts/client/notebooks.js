document.addEventListener("DOMContentLoaded", async (event) => {
    //grab the bookmarks
    if(localStorage.getItem('mbKey') && !localStorage.getItem('starting_notebook')){
        fetch("/bookmarks/bookmarks", { method: "get" })
            .then(response => response.text())
            .then(data => {
                document.getElementById('add-0').innerHTML = data;
            });
    } else if(localStorage.getItem('mbKey')) {
        document.getElementById('add-0').innerHTML = 'okay, you have a key....';
    } else {
        document.getElementById('add-0').innerHTML = 'you need to configure your mb key....';
    }
});

document.addEventListener("click", (item) => {

});