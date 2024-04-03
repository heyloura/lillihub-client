const version = '0.0.01';

const coreID = `${version}_core`;
const pageID = `${version}_pages`;
const cacheIDs = [coreID, pageID];

self.addEventListener('install', function(event) {
    self.skipWaiting();

    // Cache the offline core
    event.waitUntil(caches.open(coreID).then(function (cache) {
        //cache.add(new Request('./fragments/_calendar.html'));
        return cache;
    }));

    // Cache the offline pages
    event.waitUntil(caches.open(pageID).then(function (cache) {
        //cache.add(new Request('settings.html'));
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
    
self.addEventListener('fetch', function(event) {

});