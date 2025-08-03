// sw.js
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

// 🔁 Precache all critical files (edit paths if needed)
workbox.precaching.precacheAndRoute([
  // 🔸 HTML pages
  { url: '/index.html', revision: '1aa' },
  { url: '/loading.html', revision: '1aa' },
  { url: '/welcome.html', revision: '1aa' },
  { url: '/home.html', revision: '1aa' },
  { url: '/profile.html', revision: '1aa' },
  { url: '/cart.html', revision: '1aa' },
  { url: '/login.html', revision: '1aa' },
  { url: '/signup.html', revision: '1aa' },
  { url: '/refund.html', revision: '1aa' },
  { url: '/restaurant.html', revision: '1aa' },
  { url: '/contact-us.html', revision: '1aa' },
  { url: '/privacy.html', revision: '1aa' },
  { url: '/terms.html', revision: '1aa' },
  { url: '/orders.html', revision: '1aa' },
  { url: '/offline.html', revision: '1aa' },

  // 🔸 CSS files
  { url: '/css/style.css', revision: '1aa' },
  { url: '/css/index.css', revision: '1aa' },
  { url: '/css/home.css', revision: '1aa' },
  { url: '/css/profile.css', revision: '1aa' },
  { url: '/css/cart.css', revision: '1aa' },
  { url: '/css/orders.css', revision: '1aa' },
    { url: '/css/login.css', revision: '1aa' },
    { url: '/css/signup.css', revision: '1aa' },
    { url: '/css/restaurant.css', revision: '1aa' },

  // 🔸 JS files
  { url: '/js/index.js', revision: '1aa' },
  { url: '/js/home.js', revision: '1aa' },
  { url: '/js/profile.js', revision: '1aa' },
  { url: '/js/cart.js', revision: '1aa' },
  { url: '/js/orders.js', revision: '1aa' },
  { url: '/register-sw.js', revision: '1aa' },
    { url: '/js/login.js', revision: '1aa' },
    { url: '/js/signup.js', revision: '1aa' },
    { url: '/js/restaurant.js', revision: '1aa' },

  // 🔸 Manifest & Service Worker
  { url: '/manifest.json', revision: '1aa' },

  // 🔸 Icons & Images
  { url: '/img/icon-192x192.png', revision: '1aa' },
  { url: '/img/icon-512x512.png', revision: '1aa' },
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
// 🔄 Listen for skip waiting command from client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('🛎️ SW received SKIP_WAITING');
    self.skipWaiting();
  }
});
