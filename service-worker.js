const CACHE_NAME = "Chawp-cache-v3";
const urlsToCache = [
    "/",
    "/index.html",
    "/cart.html",
    "/home.html",
    "/orders.html",
    "/profile.html",
    "/contact-us.html",
    "/vendor/bootstrap/css/bootstrap.min.css",
    "/vendor/slick/slick/slick.css",
    "/vendor/slick/slick/slick-theme.css",
    "/vendor/icons/feather.css",
    "/img/fav.png",
    "/img/icon-192x192.png",
    "/img/icon-512x512.png",
    "/manifest.json"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) return response;
                return fetch(event.request)
                    .then(response => {
                        if (!response || response.status !== 200 || response.type !== "basic") {
                            return response;
                        }
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => cache.put(event.request, responseToCache));
                        return response;
                    });
            })
            .catch(() => caches.match("/index.html"))
    );
});

// OneSignal Push Handling
self.addEventListener("push", event => {
    let data = {};
    if (event.data) {
        data = event.data.json(); // OneSignal sends JSON
    }

    const title = data.headings?.en || "Chawp Update";
    const options = {
        body: data.contents?.en || "Something new, fam!",
        icon: "/img/icon-192x192.png",
        badge: "/img/fav.png",
        vibrate: [200, 100, 200],
        data: { url: data.url || "/index.html" }
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", event => {
    event.notification.close();
    const url = event.notification.data.url || "/index.html";

    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true })
            .then(clientList => {
                for (const client of clientList) {
                    if (client.url.includes(url) && "focus" in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow(url);
                }
            })
    );
});