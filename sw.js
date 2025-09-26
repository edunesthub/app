importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

// ✅ Precache (still needed for offline fallback & static assets)
workbox.precaching.precacheAndRoute([
  { url: '/offline.html', revision: '1cc' }, // keep only essential fallback

  // CSS
  { url: '/css/style.css', revision: '1cc' },
  { url: '/css/index.css', revision: '1cc' },
  { url: '/css/home.css', revision: '1cc' },
  { url: '/css/profile.css', revision: '1cc' },
  { url: '/css/cart.css', revision: '1cc' },
  { url: '/css/orders.css', revision: '1cc' },
  { url: '/css/login.css', revision: '1cc' },
  { url: '/css/signup.css', revision: '1cc' },
  { url: '/css/restaurant.css', revision: '1cc' },

  // JS
  { url: '/js/index.js', revision: '1cc' },
  { url: '/js/home.js', revision: '1cc' },
  { url: '/js/profile.js', revision: '1cc' },
  { url: '/js/cart.js', revision: '1cc' },
  { url: '/js/orders.js', revision: '1cc' },
  { url: '/register-sw.js', revision: '1cc' },
  { url: '/js/login.js', revision: '1cc' },
  { url: '/js/signup.js', revision: '1cc' },
  { url: '/js/restaurant.js', revision: '1cc' },

  // Manifest & Icons
  { url: '/manifest.json', revision: '1cc' },
  { url: '/img/icon-192x192.png', revision: '1cc' },
  { url: '/img/icon-512x512.png', revision: '1cc' },
]);

// 🚫 Do NOT precache HTML (we want them always fresh)
// Instead: network only for HTML pages
workbox.routing.registerRoute(
  ({ request }) => request.mode === 'navigate',
  new workbox.strategies.NetworkOnly()
);

// 🔁 Stale-while-revalidate for CSS/JS
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

// 🔁 Cache-first for media
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

// 🛑 Offline fallback
workbox.routing.setCatchHandler(async ({ event }) => {
  if (event.request.destination === 'document') {
    return caches.match('/offline.html');
  }
  return Response.error();
});

// 🧼 Always wipe old caches on activate (like incognito reset)
self.addEventListener('activate', async (event) => {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map((name) => caches.delete(name)));

  // 🛰️ Broadcast update to all clients
  const allClients = await self.clients.matchAll({ includeUncontrolled: true });
  for (const client of allClients) {
    client.postMessage({ type: 'update-available' });
  }

  await self.clients.claim();
});

// 🚀 Take control instantly
self.addEventListener('install', () => self.skipWaiting());

// 🔄 Listen for manual skip waiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('🛎️ SW received SKIP_WAITING');
    self.skipWaiting();
  }
});
