const version = '0.0.36';
const url = 'https://sad-bee-43--version3.deno.dev'

const coreID = `${version}_core`;
const pageID = `${version}_pages`;
const imageID = `${version}_images`;
const cacheIDs = [coreID, pageID, imageID];

self.addEventListener('install', function(event) {
    self.skipWaiting();

    // Cache the offline core
    event.waitUntil(caches.open(coreID).then(function (cache) {
        // javascript
        cache.add(new Request(`${url}/scripts/timeline.js`));
        cache.add(new Request(`${url}/scripts/showdown.js`));
        cache.add(new Request(`${url}/scripts/settings.js`));
        cache.add(new Request(`${url}/scripts/notebooks.js`));
        cache.add(new Request(`${url}/scripts/mentions.js`));
        cache.add(new Request(`${url}/scripts/highlight.js`));
        cache.add(new Request(`${url}/scripts/following.js`));
        cache.add(new Request(`${url}/scripts/discover.js`));
        cache.add(new Request(`${url}/scripts/easymde.min.js`));
        cache.add(new Request(`${url}/scripts/compressor.min.js`));
        cache.add(new Request(`${url}/scripts/common.js`));
        cache.add(new Request(`${url}/scripts/bookmarks.js`));

        //styles
        cache.add(new Request(`${url}/styles/main.css`));

        //static
        cache.add(new Request(`${url}/manifest.webmanifest`));
        cache.add(new Request(`${url}/favicon.ico`));
        cache.add(new Request(`${url}/logo.png`));
        return cache;
    }));

    // Cache the offline pages
    event.waitUntil(caches.open(pageID).then(function (cache) {
        cache.add(new Request(`${url}/`));
        cache.add(new Request(`${url}/timeline`));
        cache.add(new Request(`${url}/discover`));
        cache.add(new Request(`${url}/mention`));
        cache.add(new Request(`${url}/following`));
        cache.add(new Request(`${url}/bookmarks`));
        cache.add(new Request(`${url}/notebooks`));
        cache.add(new Request(`${url}/settings`));
        return cache;
    }));

    event.waitUntil(caches.open(imageID).then(function (cache) {

        return cache;
    }));
});

// On version update, remove old cached files
self.addEventListener('activate', function (event) {
    event.waitUntil(caches.keys().then(function (keys) {
        // Get the keys of the caches to remove
        const keysToRemove = keys.filter(function (key) {
            return !cacheIDs.includes(key);
        });
        // Delete each cache
        const removed = keysToRemove.map(function (key) {
            return caches.delete(key);
        });
        return Promise.all(removed);
    }).then(function () {
        return self.clients.claim();
    }));
});

self.addEventListener('fetch', async function (event) {

    if(event.request.redirect != 'follow') return;

    if (event.request.cache === 'only-if-cached' && event.request.mode !== 'same-origin') return;

    if(event.request.url.includes('timeline/check') || event.request.url.includes('timeline/mark')) return;

    try {
        event.respondWith((async () => {
            const cached = await caches.match(event.request, {ignoreVary: true});
            if (cached) {
                return cached;
            }

            try {
                const response = await fetch(event.request);
                var copy = response.clone();

                self.console.log(event.request.url);
                
                if (event.request.headers.get('Accept').includes('image')) {
                    let cache = await caches.open(imageID);
                    await cache.put(event.request, copy);
                } else if (event.request.headers.get('Accept').includes('text/html')) {
                    let cache = await caches.open(pageID);
                    await cache.put(event.request, copy);
                }

                return response;
            } catch {
                self.console.log('fetch issue, os offline cache it is');
                return caches.match('/timeline', {ignoreVary: true});
            }
        })());
    } catch {
        self.console.log('event.respondWith issue so....');
        return caches.match('/timeline', {ignoreVary: true});
    }
});