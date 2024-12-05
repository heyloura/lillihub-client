const version = '0.0.13';
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

self.addEventListener('fetch', function (event) {
	// Get the request
	var request = event.request;
    if (event.request.cache === 'only-if-cached' && event.request.mode !== 'same-origin') return;

    if(event.request.url.includes('timeline/check') || event.request.url.includes('timeline/mark')) return;

    // caches.match(event.request.url, {ignoreVary: true}).then(function (response) {
    //     console.log('match found:' + event.request.url)
    //     return response;
    // });

    caches.match(event.request.url, {ignoreVary: true}).then(function (response) {
        return response || event.respondWith(async function() {
            const promiseChain = fetch(request).then(function (response) {
                var copy = response.clone();
                self.console.log('fetching:' + event.request.url);
    
                if (request.headers.get('Accept').includes('image')) {
                    caches.open(imageID).then(function (cache) {
                        return cache.put(request, copy);
                    })
                } else {
                    caches.open(pageID).then(function (cache) {
                        return cache.put(request, copy);
                    })
                }
                return response;
            });
            event.waitUntil(promiseChain);
            return promiseChain;
        }());
    })

	// caches.match(event.request.url, {ignoreVary: true}).then(function (response) {
    //     return response || fetch(request).then(function (response) {
    //         var copy = response.clone();
    //         self.console.log('fetching:' + event.request.url);

    //         if (request.headers.get('Accept').includes('image')) {
    //             caches.open(imageID).then(function (cache) {
    //                 return cache.put(request, copy);
    //             })
    //         } else {
    //             caches.open(pageID).then(function (cache) {
    //                 return cache.put(request, copy);
    //             })
    //         }
    //         return response;
    //     });
    // })
});
    
// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//         caches.match(event.request).then((cachedResponse) => {
//             console.log(event.request.url);
//             if (cachedResponse) {
//                 console.log('found it! returning cache')
//                 return cachedResponse;
//             }
    
//             console.log('fetch resource & save in cache')
//             return fetch(event.request).then((fetchedResponse) => {
//                 caches.open(pageID).then(function (cache) {
//                     cache.put(event.request, fetchedResponse.clone());
//                 });
//                 return fetchedResponse;
//             });
//         })
//     // fetch(event.request).catch(function() {
//     //   console.log(event.request)
//     //   if(event.request.url.substring('/notebooks/')){
//     //     cache.put(event.request, fetchedResponse.clone());

//     //   }
//     //   return caches.match(event.request);
//     // })
//   );
// });

// event.respondWith(caches.open(cacheName).then((cache) => {
//     // Go to the cache first
//     return cache.match(event.request.url).then((cachedResponse) => {
//       // Return a cached response if we have one
//       if (cachedResponse) {
//         return cachedResponse;
//       }

//       // Otherwise, hit the network
//       return fetch(event.request).then((fetchedResponse) => {
//         // Add the network response to the cache for later visits
//         cache.put(event.request, fetchedResponse.clone());

//         // Return the network response
//         return fetchedResponse;
//       });
//     });
//   }));