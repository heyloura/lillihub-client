document.addEventListener("DOMContentLoaded", event => { 
    document.getElementById('omg-address').value = localStorage.getItem('omg_address') ? localStorage.getItem('omg_address') : '';
    document.getElementById('omg-api').value = localStorage.getItem('omg_api') ? localStorage.getItem('omg_api') : '';

    if(localStorage.getItem('post_setting')){
        document.querySelector(`input[value="${localStorage.getItem('post_setting')}"]`).checked = true;
    }

});
document.addEventListener("click", (item) => { 
    // Posting settings
    if(item.target.classList.contains('savePostingSettings')){
        localStorage.setItem('post_setting', document.querySelector('input[name="postWith"]:checked').value);
        document.getElementById('postingSettingsToast').classList.remove("hide");
    }
    if(item.target.classList.contains('dismissPostingSettingsToast')) {
        document.getElementById('postingSettingsToast').classList.add("hide");
    }

    // OMG settings
    if(item.target.classList.contains('deleteOmgStorage')){
        if(confirm('Are you sure you want to delete this data? This action cannot be undone.')){
            localStorage.setItem('omg_address', '');
            localStorage.setItem('omg_api', '');
            document.getElementById('saveOmgToast').classList.remove("hide");
        }
    }
    if(item.target.classList.contains('saveOmgStorage')){
        localStorage.setItem('omg_address', document.getElementById('omg-address').value);
        localStorage.setItem('omg_api', document.getElementById('omg-api').value);
        document.getElementById('saveOmgToast').classList.remove("hide");
    }
    if(item.target.classList.contains('dismissOmgToast')) {
        document.getElementById('saveOmgToast').classList.add("hide");
    }
});