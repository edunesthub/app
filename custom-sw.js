import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute, setCatchHandler } from 'workbox-routing';
import { CacheFirst, NetworkFirst, NetworkOnly } from 'workbox-strategies';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

// Injected by Workbox during build
precacheAndRoute(self.__WB_MANIFEST);

// Runtime caching: images & CSS/JS
registerRoute(
  ({ request }) => request.destination === 'image' || /\.(?:css|js)$/.test(request.url),
  new CacheFirst({
    cacheName: 'assets-cache',
  })
);

// Runtime caching: dynamic API (e.g., vendor menus)
registerRoute(
  /\/api\/menu/,
  new NetworkFirst({
    cacheName: 'api-cache',
  })
);

// Background Sync for failed POST requests
const bgSyncPlugin = new BackgroundSyncPlugin('ChawpOrderQueue', {
  maxRetentionTime: 24 * 60, // Retry for 24 hours
});

registerRoute(
  ({ url, request }) => url.pathname.includes('/api/orders') && request.method === 'POST',
  new NetworkOnly({
    plugins: [bgSyncPlugin],
  }),
  'POST'
);

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'New Notification', {
      body: data.body || '',
      icon: '/img/icon-192x192.png',
    })
  );
});

// Offline fallback for HTML pages
setCatchHandler(async ({ event }) => {
  if (event.request.destination === 'document') {
    return caches.match('/offline.html');
  }
  return Response.error();
});

// Take control immediately
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
