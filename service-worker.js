// Updated on 2025-04-08 — Aggressive update strategy, version bump, and cleanup

const CACHE_NAME = "Chawp-cache-v12"; // Bump version for updates
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
    "/img/icon-192x192.png",
    "/img/icon-512x512.png",
    "/manifest.json"
];

self.addEventListener("install", event => {
    console.log("Service Worker: Installing...");
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log("Caching files");
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log("Skipping waiting");
                return self.skipWaiting(); // Take control immediately
            })
            .catch(error => console.error("Cache failed:", error))
    );
});

self.addEventListener("activate", event => {
    console.log("Service Worker: Activating...");
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(name => {
                        if (name !== CACHE_NAME) {
                            console.log(`Deleting old cache: ${name}`);
                            return caches.delete(name);
                        }
                    })
                );
            })
            .then(() => {
                console.log("Claiming clients");
                return self.clients.claim(); // Take control of all open clients
            })
            .catch(error => console.error("Activation failed:", error))
    );
});

self.addEventListener("fetch", event => {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Only cache successful responses
                if (!response || response.status !== 200 || response.type !== "basic") {
                    return response;
                }
                const responseToCache = response.clone();
                caches.open(CACHE_NAME)
                    .then(cache => cache.put(event.request, responseToCache));
                return response;
            })
            .catch(() => {
                // Fallback to cache if network fails
                return caches.match(event.request)
                    .then(response => response || caches.match("/index.html"));
            })
    );
});

// Handle messages from client (e.g., SKIP_WAITING)
self.addEventListener("message", event => {
    if (event.data && event.data.type === "SKIP_WAITING") {
        console.log("Received SKIP_WAITING message");
        self.skipWaiting();
    }
});

// OneSignal Push Notification Handler
self.addEventListener("push", event => {
    let data = {};
    if (event.data) {
        data = event.data.json();
    }

    const title = data.headings?.en || "Chawp Update";
    const options = {
        body: data.contents?.en || "Something new just dropped!",
        icon: "/img/icon-192x192.png",
        badge: "/img/icon-192x192.png",
        vibrate: [200, 100, 200],
        data: {
            url: data.url || "/index.html"
        }
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
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