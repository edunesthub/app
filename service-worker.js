// Updated on 2025-04-09 — version bump, exclude HTML from caching for fresh updates
const CACHE_NAME = "Chawp-cache-v15"; // Bump version to clear old cache
const urlsToCache = [
    // Remove HTML files from initial cache, keep only static assets
    "/vendor/bootstrap/css/bootstrap.min.css",
    "/vendor/slick/slick/slick.css",
    "/vendor/slick/slick/slick-theme.css",
    "/vendor/icons/feather.css",
    "/img/icon-192x192.png",
    "/img/icon-512x512.png",
    "/manifest.json"
];

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                // If request is for an HTML file, always fetch fresh
                if (event.request.url.endsWith('.html')) {
                    return fetch(event.request).catch(() => cachedResponse || caches.match("/index.html"));
                }
                // For non-HTML, use cache-first strategy
                if (cachedResponse) return cachedResponse;
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
                    .catch(() => caches.match("/index.html")); // Fallback for offline
            })
    );
});