// Tiny client-side helpers used by the page shell.
// Anything bigger lives in its own file (todo.js, crypto.js).

// Mirror textarea content into a hidden ::after pseudo-element so the textarea
// can grow with its content. The CSS uses .grow-wrap > textarea + .grow-wrap::after
// stacked in the same grid cell to make this work without JS-driven height math.
function growTextArea(el) {
    el.parentNode.dataset.replicatedValue = el.value;
}

// Show a full-screen loading overlay. Used as `onclick="addLoading(this)"` on
// links/buttons that trigger a navigation, so the user gets feedback while the
// next page loads.
function addLoading(elem) {
    document.body.insertAdjacentHTML('afterbegin', `<div id="loader" class="overlay"><span class="loading d-block p-centered"></span></div>`);
}

// Remove the loading overlay on back/forward navigation, so a cached page
// doesn't show a stuck spinner.
["pagehide", "pageshow"].forEach((e) => window.addEventListener(e, () => {
    const loader = document.getElementById('loader');
    if (loader) loader.remove();
}));
