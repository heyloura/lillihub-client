// Tiny client-side helpers used by the page shell.
// Anything bigger lives in its own file (todo.js, crypto.js).

// Auto-grow a textarea to fit its content. Reset to `auto` first so shrinking
// works when the user deletes lines, then set to scrollHeight.
function growTextArea(el) {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
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

// ---------------------------------------------------------------------------
// Keyboard navigation
// ---------------------------------------------------------------------------
// Shortcuts are guarded so they never fire inside form fields. Post-level
// navigation (j/k/o/r) only activates when .card elements exist on the page.
// Paging (n/p) works anywhere a .paging element is present.

var _kbIdx = -1; // index of the currently focused post card

function _kbCards() { return document.querySelectorAll('.content > .card, .content > .container > .card'); }

function _kbFocus(idx) {
    var cards = _kbCards();
    if (!cards.length) return;
    // Remove previous highlight
    var prev = document.querySelector('.card.kb-focus');
    if (prev) prev.classList.remove('kb-focus');
    // Clamp
    if (idx < 0) idx = 0;
    if (idx >= cards.length) idx = cards.length - 1;
    _kbIdx = idx;
    cards[idx].classList.add('kb-focus');
    cards[idx].scrollIntoView({ block: 'start', behavior: 'smooth' });
}

document.addEventListener('keydown', function(e) {
    // Never intercept when typing in a form field or when modifiers are held
    if (e.target.matches('input, textarea, select, [contenteditable]')) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    var cards = _kbCards();

    switch (e.key) {
        // Post navigation
        case 'j': if (cards.length) { e.preventDefault(); _kbFocus(_kbIdx + 1); } break;
        case 'k': if (cards.length) { e.preventDefault(); _kbFocus(_kbIdx - 1); } break;
        case 'o': // fall through
        case 'Enter':
            if (_kbIdx >= 0 && cards[_kbIdx]) {
                var link = cards[_kbIdx].querySelector('.card-footer a[href*="/timeline/"]') ||
                           cards[_kbIdx].querySelector('.card-footer a[href]');
                if (link) { e.preventDefault(); link.click(); }
            }
            break;
        case 'r':
            if (_kbIdx >= 0 && cards[_kbIdx]) {
                var details = cards[_kbIdx].querySelector('details.reply-details');
                if (details) {
                    e.preventDefault();
                    details.open = true;
                    var ta = details.querySelector('textarea');
                    if (ta) ta.focus();
                }
            }
            break;
        // Paging
        case 'n': {
            var next = document.querySelector('.paging a[href*="last="]');
            if (next && !next.classList.contains('hide')) { e.preventDefault(); next.click(); }
            break;
        }
        case 'p': {
            var prev = document.querySelector('.paging a[href*="before="]');
            if (prev && !prev.classList.contains('hide')) { e.preventDefault(); prev.click(); }
            break;
        }
        // Help
        case '?': {
            e.preventDefault();
            var dlg = document.getElementById('kb-help');
            if (dlg) dlg.open ? dlg.close() : dlg.showModal();
            break;
        }
    }
});

// ---------------------------------------------------------------------------
// Highlights page — copy as blockquote + select all
// ---------------------------------------------------------------------------
document.addEventListener('click', function(e) {
    var btn = e.target.closest('.highlight-copy-btn');
    if (!btn) return;
    navigator.clipboard.writeText(btn.dataset.md);
    var icon = btn.querySelector('i');
    if (icon) { icon.className = 'bi bi-check-lg'; setTimeout(function() { icon.className = 'bi bi-clipboard'; }, 1500); }
});

document.addEventListener('change', function(e) {
    if (e.target.id === 'highlight-select-all-cb') {
        var checked = e.target.checked;
        document.querySelectorAll('.highlight-checkbox').forEach(function(cb) {
            cb.checked = checked;
        });
    }
});

// Highlights search — client-side filter over content and title
document.addEventListener('input', function(e) {
    if (e.target.id !== 'highlight-search') return;
    var q = e.target.value.toLowerCase();
    var visible = 0;
    document.querySelectorAll('.highlight-card').forEach(function(card) {
        var text = card.textContent.toLowerCase();
        var show = !q || text.includes(q);
        card.style.display = show ? '' : 'none';
        if (show) visible++;
    });
    var counter = document.querySelector('.highlight-count');
    if (counter) counter.textContent = visible + ' highlight' + (visible !== 1 ? 's' : '');
});
