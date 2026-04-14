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

// Theme picker: three-way choice of System / Light / Dark. "system" means no
// data-theme attribute (cascade falls through to prefers-color-scheme);
// "light" / "dark" write the attribute. Persisted in localStorage under
// lh-theme. The inline script in the page <head> reads localStorage on boot
// to avoid a flash of the wrong theme.
function applyTheme(choice) {
    const root = document.documentElement;
    if (choice === 'light' || choice === 'dark') {
        root.setAttribute('data-theme', choice);
        localStorage.setItem('lh-theme', choice);
    } else {
        root.removeAttribute('data-theme');
        localStorage.removeItem('lh-theme');
    }
    // Keep the browser chrome color (address bar, iOS status bar) in sync
    // with the chosen theme. The media-based metas cover OS-preference; this
    // handles the explicit-override case by writing a non-media meta that
    // takes precedence.
    const resolved = choice === 'light' || choice === 'dark'
        ? choice
        : (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    let meta = document.querySelector('meta[name="theme-color"]:not([media])');
    if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'theme-color');
        document.head.appendChild(meta);
    }
    meta.setAttribute('content', resolved === 'light' ? '#eff1f5' : '#11131a');
    syncThemePickerPressed();
}

function syncThemePickerPressed() {
    const stored = localStorage.getItem('lh-theme');
    const active = stored === 'light' || stored === 'dark' ? stored : 'system';
    document.querySelectorAll('.theme-picker-btn').forEach((btn) => {
        btn.setAttribute('aria-pressed', btn.dataset.themeChoice === active ? 'true' : 'false');
    });
}

document.addEventListener('click', (e) => {
    const btn = e.target.closest('.theme-picker-btn');
    if (!btn) return;
    applyTheme(btn.dataset.themeChoice);
});

// Initial sync — reflects whatever the inline head script already applied.
syncThemePickerPressed();
