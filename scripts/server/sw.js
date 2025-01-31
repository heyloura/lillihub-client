const version = '0.0.17';
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
        cache.add(new Request(`https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.15.0/cdn/shoelace-autoloader.js`));
        cache.add(new Request(`https://cdn.jsdelivr.net/npm/showdown@2.0.3/dist/showdown.min.js`));
        cache.add(new Request(`https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js`));

        // styles
        cache.add(new Request(`https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.15.0/cdn/themes/light.css`));
        cache.add(new Request(`https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css`));
        cache.add(new Request(`https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/default.min.css`));

        // static
        cache.add(new Request(`${url}manifest.webmanifest`));
        cache.add(new Request(`${url}favicon.ico`));
        cache.add(new Request(`${url}lillihub-512.png`));
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

self.addEventListener("message", function(event) {
	var data = event.data;

	if (data.command == "trimCache") {
		trimCache(coreID, 50);
		trimCache(imageID, 75);
		trimCache(pageID, 50);
	}
});

var trimCache = function (cacheName, maxItems) {
    caches.open(cacheName)
        .then(function (cache) {
            cache.keys()
                .then(function (keys) {
                    if (keys.length > maxItems) {
                        self.console.log('trimCache: ' + cacheName + ', ' + keys.length);
                        cache.delete(keys[0])
                            .then(trimCache(cacheName, maxItems));
                    }
                });
        });
};

self.addEventListener('fetch', async function (event) {
    if(!(event.request.destination == 'image' || event.request.destination == 'style' || event.request.destination == 'script' || event.request.destination == 'manifest')) {
        return;
    }
    try {
        event.respondWith((async () => {
            //self.console.log(event.request);
            const cached = await caches.match(event.request, {ignoreVary: true});
            if (cached) {
                return cached;
            }

            try {
                const response = await fetch(event.request);
                const copy = response.clone();
                // var headers = new Headers(copy.headers);
                // headers.append('sw-fetched-on', new Date().getTime());
                // var body = await copy.blob();
                
                if (event.request.headers.get('Accept').includes('image')) {
                    const cache = await caches.open(imageID);
                    await cache.put(event.request, copy);
                } 
                if (event.request.url.includes('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace')) {
                    const cache = await caches.open(coreID);
                    await cache.put(event.request, copy);
                } 
                // else if (event.request.destination) {
                //     let cache = await caches.open(pageID);
                //     await cache.put(event.request, copy);
                // }

                return response;
            } catch {
                //self.console.log('fetch issue, is offline cache it is');
                //return caches.match(`${url}/timeline/`, {ignoreVary: true});
            }
        })());
    } catch {
        self.console.log('event.respondWith issue so....');
        //return caches.match(`${url}/timeline/`, {ignoreVary: true});
    }
});