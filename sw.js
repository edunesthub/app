importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

// 🔁 Precache all critical files (edit paths if needed)
workbox.precaching.precacheAndRoute([
  // HTML
  { url: '/index.html', revision: '1ag' },
  { url: '/loading.html', revision: '1ag' },
  { url: '/welcome.html', revision: '1ag' },
  { url: '/home.html', revision: '1ag' },
  { url: '/profile.html', revision: '1ag' },
  { url: '/cart.html', revision: '1ag' },
  { url: '/login.html', revision: '1ag' },
  { url: '/signup.html', revision: '1ag' },
  { url: '/refund.html', revision: '1ag' },
  { url: '/restaurant.html', revision: '1ag' },
  { url: '/contact-us.html', revision: '1ag' },
  { url: '/privacy.html', revision: '1ag' },
  { url: '/terms.html', revision: '1ag' },
  { url: '/orders.html', revision: '1ag' },
  { url: '/offline.html', revision: '1ag' },

  // CSS
  { url: '/css/style.css', revision: '1ag' },
  { url: '/css/index.css', revision: '1ag' },
  { url: '/css/home.css', revision: '1ag' },
  { url: '/css/profile.css', revision: '1ag' },
  { url: '/css/cart.css', revision: '1ag' },
  { url: '/css/orders.css', revision: '1ag' },
  { url: '/css/login.css', revision: '1ag' },
  { url: '/css/signup.css', revision: '1ag' },
  { url: '/css/restaurant.css', revision: '1ag' },

  // JS
  { url: '/js/index.js', revision: '1ag' },
  { url: '/js/home.js', revision: '1ag' },
  { url: '/js/profile.js', revision: '1ag' },
  { url: '/js/cart.js', revision: '1ag' },
  { url: '/js/orders.js', revision: '1ag' },
  { url: '/register-sw.js', revision: '1ag' },
  { url: '/js/login.js', revision: '1ag' },
  { url: '/js/signup.js', revision: '1ag' },
  { url: '/js/restaurant.js', revision: '1ag' },

  // Manifest & Icons
  { url: '/manifest.json', revision: '1ag' },
  { url: '/img/icon-192x192.png', revision: '1ag' },
  { url: '/img/icon-512x512.png', revision: '1ag' },
]);

// 🔁 Cache-first for pages
workbox.routing.registerRoute(
  ({ request }) => request.mode === 'navigate',
  new workbox.strategies.CacheFirst({
    cacheName: 'pages',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 30,
      }),
    ],
  })
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

// 🧼 Cleanup old caches
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

  // 🛰️ Broadcast update to all clients
  const allClients = await self.clients.matchAll({ includeUncontrolled: true });
  for (const client of allClients) {
    client.postMessage({ type: 'update-available' });
  }
});

// 🚀 Take control instantly
self.addEventListener('install', () => self.skipWaiting());

// 🚀 Claim all clients
self.addEventListener('activate', () => self.clients.claim());

// 🔄 Listen for manual skip waiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('🛎️ SW received SKIP_WAITING');
    self.skipWaiting();
  }
});
