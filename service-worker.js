// Updated on 2025-04-12 — added critical assets for faster load, exclude HTML
const CACHE_NAME = "Chawp-cache-v18"; // Bump version for new assets
const urlsToCache = [
    // Critical assets for initial load
    "/vendor/bootstrap/css/bootstrap.min.css",
    "/vendor/icons/feather.css",
    "/css/style.css",
    "/img/icon-192x192.png",
    "/img/icon-512x512.png",
    "/img/trending1.png",
    "/img/popular4.png",
    "/manifest.json",
    // Fonts (assuming Poppins is loaded via CSS)
    "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700;800&display=swap"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting()) // Force activation
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(cacheName => cacheName !== CACHE_NAME)
                    .map(cacheName => caches.delete(cacheName))
            );
        })
    );
    event.waitUntil(self.clients.claim()); // Take control immediately
});

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                // Always fetch HTML fresh to avoid stale content
                if (event.request.url.endsWith('.html')) {
                    return fetch(event.request)
                        .catch(() => cachedResponse || caches.match("/index.html"));
                }
                // Cache-first for other assets
                if (cachedResponse) {
                    // Background fetch to update cache
                    fetch(event.request)
                        .then(response => {
                            if (response && response.status === 200 && response.type === "basic") {
                                caches.open(CACHE_NAME)
                                    .then(cache => cache.put(event.request, response.clone()));
                            }
                        })
                        .catch(() => {}); // Silent fail
                    return cachedResponse;
                }
                // Fetch and cache new assets
                return fetch(event.request)
                    .then(response => {
                        if (!response || response.status !== 200 || response.type !== "basic") {
                            return response;
                        }
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => cache.put(event.request, responseToCache));
                        return response;
                    })
                    .catch(() => caches.match("/index.html")); // Offline fallback
            })
    );
});