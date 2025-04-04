const CACHE_NAME = "food-app-cache-v2";
const urlsToCache = [
    "/",
    "index.html",
    "home.html",
    "restaurant.html",
    "cart.html",
    "orders.html",
    "profile.html",
    "manifest.json",
    "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js",
    "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js",
    "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js",
    "img/icon-192.png",
    "img/icon-512.png",
    "img/placeholder.png"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("Caching app shell");
            return cache.addAll(urlsToCache).catch(err => console.error("Cache add failed:", err));
        })
    );
    self.skipWaiting();
});

self.addEventListener("activate", event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        console.log("Deleting old cache:", cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            if (response) {
                return response;
            }
            return fetch(event.request).then(networkResponse => {
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
                    return networkResponse;
                }
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseToCache);
                });
                return networkResponse;
            }).catch(() => {
                if (event.request.mode === "navigate") {
                    return caches.match("index.html");
                }
            });
        })
    );
});