const version = '0.0.02';
const url = ''

const coreID = `${version}_core`;
const pageID = `${version}_pages`;
const imageID = `${version}_images`;
const cacheIDs = [coreID, pageID, imageID];

self.addEventListener('install', function(event) {
    self.skipWaiting();

    // Cache the offline core
    event.waitUntil(caches.open(coreID).then(function (cache) {
        // javascript
        // cache.add(new Request(`${url}scripts/timeline.js`));

        // //styles
        // cache.add(new Request(`${url}styles/main.css`));

        // //static
        // cache.add(new Request(`${url}manifest.webmanifest`));
        // cache.add(new Request(`${url}favicon.ico`));
        // cache.add(new Request(`${url}logo.png`));
        return cache;
    }));

    // Cache the offline pages
    event.waitUntil(caches.open(pageID).then(function (cache) {
        // cache.add(new Request(`${url}`));
        // cache.add(new Request(`${url}timeline`));
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
    if(event.request.url.includes('.html')){
        self.console.log(event.request);
    }
});