// sw.js
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

// 🔁 Precache all critical files (edit paths if needed)
workbox.precaching.precacheAndRoute([
  { url: '/index.html', revision: '1a' },
  { url: '/loading.html', revision: '1a' },
  { url: '/welcome.html', revision: '1a' },
  { url: '/home.html', revision: '1a' },
  { url: '/profile.html', revision: '1a' },
  { url: '/cart.html', revision: '1a' },
  { url: '/login.html', revision: '1a' },
  { url: '/signup.html', revision: '1a' },
  { url: '/refund.html', revision: '1a' },
  { url: '/restaurant.html', revision: '1a' },
  { url: '/contact-us.html', revision: '1a' },
  { url: '/privacy.html', revision: '1a' },
  { url: '/terms.html', revision: '1a' },
  { url: '/orders.html', revision: '1a' },
  { url: '/css/style.css', revision: '1a' },
  { url: '/css/index.css', revision: '1a' },
  { url: '/css/home.css', revision: '1a' },
  { url: '/js/index.js', revision: '1a' },
  { url: '/js/home.js', revision: '1a' },
  { url: '/js/profile.js', revision: '1a' },
  { url: '/js/cart.js', revision: '1a' },
  { url: '/js/orders.js', revision: '1a' },
  { url: '/register-sw.js', revision: '1a' },
  { url: '/manifest.json', revision: '1a' },
  { url: '/img/icon-192x192.png', revision: '1a' },
  { url: '/img/icon-512x512.png', revision: '1a' },
  { url: '/offline.html', revision: '1a' },
]);

// ⚡ Cache-first for HTML pages (instant load, still updates when online)
workbox.routing.registerRoute(
  ({ request }) => request.mode === 'navigate',
  new workbox.strategies.CacheFirst({
    cacheName: 'pages',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
      }),
    ],
  })
);

// ⚡ Stale-while-revalidate for CSS/JS (fast + updates silently)
workbox.routing.registerRoute(
  ({ request }) => ['script', 'style'].includes(request.destination),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'static-resources',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 60 * 60 * 24 * 30,
      }),
    ],
  })
);

// ⚡ Cache-first for images, fonts
workbox.routing.registerRoute(
  ({ request }) => ['image', 'font'].includes(request.destination),
  new workbox.strategies.CacheFirst({
    cacheName: 'media-assets',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 60 * 60 * 24 * 30,
      }),
    ],
  })
);

// 🛑 Offline fallback (only for pages)
workbox.routing.setCatchHandler(async ({ event }) => {
  if (event.request.destination === 'document') {
    return caches.match('/offline.html');
  }
  return Response.error();
});

// 🧼 Cleanup old caches (optional but safe)
self.addEventListener('activate', async (event) => {
  const expectedCaches = [
    'pages',
    'static-resources',
    'media-assets',
    workbox.core.cacheNames.precache,
  ];
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames
      .filter((name) => !expectedCaches.includes(name))
      .map((name) => caches.delete(name))
  );
});

// 🚀 Instant control on install
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
