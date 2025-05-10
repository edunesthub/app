const CACHE_NAME = 'Chawp-cache-v37';
const DYNAMIC_CACHE_NAME = 'Chawp-dynamic-v37';
const urlsToCache = [
    '/',
    '/index.html',
    '/home.html',
    '/offline.html', // Added offline.html
    '/loading.html',
    '/restaurant.html',
    '/cart.html',
    '/login.html',
    '/signup.html',
    '/orders.html',
    '/profile.html',
    '/vendor/bootstrap/css/bootstrap.min.css?ver=1.0.2',
    '/vendor/icons/feather.css?ver=1.0.2',
    '/css/style.css?ver=1.0.2',
    '/img/icon-192x192.png',
    '/img/icon-512x192.png',
    '/img/vendors/trending1.png',
    '/img/vendors/popular4.png',
    '/img/vendors/albies1.webp',
    '/img/vendors/cravee.webp',
    '/img/vendors/street.webp',
    '/img/vendors/trending2.png',
    '/img/vendors/jakpa.JPG', // Changed to .webp
    '/manifest.json',
    'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js?ver=1.0.2',
    'https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js',
    'https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js',
    'https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js',
    'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700;800&display=swap',
];

// Install event: Cache all static assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache.filter(url => url !== ''));
            })
            .then(() => self.skipWaiting())
            .catch(error => console.error('Service Worker: Cache installation failed', error))
    );
});

// Activate event: No cache cleanup, claim clients immediately
self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});

// Fetch event: Cache-first strategy with dynamic caching
self.addEventListener('fetch', event => {
    const requestUrl = new URL(event.request.url);

    // Bypass non-GET requests and Firebase Firestore/OneSignal requests
    if (event.request.method !== 'GET') return;
    if (requestUrl.host.includes('firestore.googleapis.com') ||
        requestUrl.host.includes('onesignal.com')) {
        return event.respondWith(fetch(event.request));
    }

    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                // Return cached response if available
                if (cachedResponse) {
                    return cachedResponse;
                }

                // Fetch from network and cache the response
                return fetch(event.request)
                    .then(networkResponse => {
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }

                        // Cache in dynamic cache for Firebase Storage or other assets
                        const cacheName = requestUrl.host.includes('firebasestorage.googleapis.com')
                            ? DYNAMIC_CACHE_NAME
                            : CACHE_NAME;
                        const responseToCache = networkResponse.clone();
                        caches.open(cacheName)
                            .then(cache => cache.put(event.request, responseToCache));

                        return networkResponse;
                    })
                    .catch(() => {
                        // Offline fallbacks
                        if (event.request.destination === 'document' || requestUrl.pathname.endsWith('.html')) {
                            return caches.match('/offline.html') || caches.match('/index.html');
                        }
                        if (event.request.destination === 'image') {
                            return caches.match('/img/icon-192x192.png');
                        }
                    });
            })
    );
});

// Push event: Handle push notifications
self.addEventListener('push', event => {
    const data = event.data.json();
    self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/img/icon-192x192.png'
    });
});