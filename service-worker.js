const CACHE_NAME = "Chawp-cache-v26";
const urlsToCache = [
    "/",
    "/index.html",
    "/home.html",
    "/loading.html",
    "/restaurant.html",
    "/cart.html",
    "/orders.html",
    "/profile.html",
    "/vendor/bootstrap/css/bootstrap.min.css?ver=1.0.1",
    "/vendor/icons/feather.css?ver=1.0.1",
    "/css/style.css?ver=1.0.1",
    "/img/icon-192x192.png",
    "/img/icon-512x192.png",
    "/img/trending1.png",
    "/img/popular4.png",
    "/img/placeholder.png",
    "/manifest.json",
    "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js?ver=1.0.1",
    "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js",
    "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js",
    "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js",
    "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700;800&display=swap",
    "/img/restaurant1.jpg",
    "/img/restaurant2.jpg"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache.filter(url => url !== ""));
            })
            .then(() => self.skipWaiting())
            .catch(error => console.error("Service Worker: Cache installation failed", error))
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
    event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", event => {
    const requestUrl = new URL(event.request.url);

    if (requestUrl.host.includes("firebase") || requestUrl.host.includes("firestore.googleapis.com")) {
        return event.respondWith(fetch(event.request));
    }

    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                if (event.request.mode === "navigate" || requestUrl.pathname.endsWith(".html")) {
                    return fetch(event.request)
                        .then(networkResponse => {
                            if (networkResponse && networkResponse.status === 200) {
                                caches.open(CACHE_NAME)
                                    .then(cache => cache.put(event.request, networkResponse.clone()));
                            }
                            return networkResponse;
                        })
                        .catch(() => cachedResponse || caches.match("/loading.html"));
                }

                if (cachedResponse) {
                    fetch(event.request)
                        .then(networkResponse => {
                            if (networkResponse && networkResponse.status === 200 && networkResponse.type === "basic") {
                                caches.open(CACHE_NAME)
                                    .then(cache => cache.put(event.request, networkResponse.clone()));
                            }
                        })
                        .catch(() => {});
                    return cachedResponse;
                }

                return fetch(event.request)
                    .then(networkResponse => {
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
                            return networkResponse;
                        }
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => cache.put(event.request, responseToCache));
                        return networkResponse;
                    })
                    .catch(() => {
                        if (event.request.destination === "image") {
                            return caches.match("/img/placeholder.png");
                        }
                        return caches.match("/loading.html");
                    });
            })
    );
});

self.addEventListener("push", event => {
    const data = event.data.json();
    self.registration.showNotification(data.title, {
        body: data.body,
        icon: "/img/icon-192x192.png"
    });
});