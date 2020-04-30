console.log("Hello from your service worker!");

//SET UP A REFERENCE FOR ALL FILES TO BE CACHED
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/assets/js/index.js",
  "/assets/js/db.js",
  "/assets/css/styles.css",
  "service-worker.js",
  "manifest.webmanifest",
  "/assets/images/Ava-logo-blue/favicon.png",
  "/assets/images/Ava-logo-blue/logo.png",
  "/assets/images/Ava-logo-blue/logo_transparent.png",
  "/assets/images/icons/icon-192x192.png",
  "/assets/images/icons/icon-512x512.png",
];

const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

//EVENT LISTENER FOR WHEN SERVICE WORKER IS INSTALLED
self.addEventListener("install", function(evt) {
    //WAIT UNTIL CACHE IS OPENED
    evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
        console.log("Your files were pre-cached successfully!");
        return cache.addAll(FILES_TO_CACHE);
    })
    );

    self.skipWaiting();
});

//EVENT LISTENER FOR WHEN SERVICE WORKER IS ACTIVATED
self.addEventListener("activate", function(evt) {
    //WAIT UNTIL CACHE IS OPENED
    evt.waitUntil(
        caches.keys().then(keyList => {
        return Promise.all(
        keyList.map(key => {
            if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log("Removing old cache data", key);
            return caches.delete(key);
            }
        })
        );
    })
    );

    self.clients.claim();
});

//FETCH
self.addEventListener("fetch", function (evt) {
    if (evt.request.url.includes("/api/")) {
        console.log('SERVICE WORKER FETCH DATA: ', evt.request.url);
        evt.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(evt.request)
                    .then(response => {
                        // If the response was good, clone it and store it in the cache.
                        if (response.status === 200) {
                            cache.put(evt.request.url, response.clone());
                        }

                        return response;
                    })
                    .catch(err => {
                        // Network request failed, try to get it from the cache.
                        return cache.match(evt.request);
                    });
            }).catch(err => console.log(err))
        );

        return;
    }
//FETCH DOESN'T CONTAIN '/API' RESPOND WITH
    evt.respondWith(caches.open(CACHE_NAME).then(cache => {
        //
        return cache.match(evt.request).then(response => {
            //IF RESPONSE EXISTS THEN RETURN IT OTHERWISE FETCH REQUEST
            return response || fetch(evt.request);
        });
    }));
});
