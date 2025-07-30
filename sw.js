importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

// 📦 Precache ALL critical files
workbox.precaching.precacheAndRoute([
  { url: '/index.html', revision: '1' },
  { url: '/home.html', revision: '1' },
  { url: '/profile.html', revision: '1' },
  { url: '/cart.html', revision: '1' },
  { url: '/orders.html', revision: '1' },
  { url: '/css/style.css', revision: '1' },
  { url: '/css/index.css', revision: '1' },
  { url: '/css/home.css', revision: '1' },
  { url: '/js/index.js', revision: '1' },
  { url: '/js/home.js', revision: '1' },
  { url: '/js/profile.js', revision: '1' },
  { url: '/js/cart.js', revision: '1' },
  { url: '/js/orders.js', revision: '1' },
  { url: '/register-sw.js', revision: '1' },
  { url: '/manifest.json', revision: '1' },
  { url: '/img/icon-192x192.png', revision: '1' },
  { url: '/img/icon-512x512.png', revision: '1' },
  { url: '/offline.html', revision: '1' }
]);

// ⚡ Fast, offline-first loading for pages
workbox.routing.registerRoute(
  ({ request }) => request.mode === 'navigate',
  new workbox.strategies.CacheFirst({
    cacheName: 'pages',
  })
);

// ⚡ Fast loading for scripts, styles, images
workbox.routing.registerRoute(
  ({ request }) =>
    ['style', 'script', 'image', 'font'].includes(request.destination),
  new workbox.strategies.CacheFirst({
    cacheName: 'assets',
  })
);

// 🛑 Fallback for offline (HTML pages only)
workbox.routing.setCatchHandler(async ({ event }) => {
  if (event.request.destination === 'document') {
    return caches.match('/offline.html');
  }
  return Response.error();
});

// 🚀 Take control fast
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
