// sw.js — NO WORKBOX, NO PRECACHE

// 🚀 Install & skip waiting
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// 🚀 Activate & delete ALL caches (like incognito reset)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
      await self.clients.claim();

      // 🔁 Tell clients to reload
      const allClients = await self.clients.matchAll({ includeUncontrolled: true });
      for (const client of allClients) {
        client.postMessage({ type: 'force-reload' });
      }
    })()
  );
});

// 🚫 Intercept ALL fetch requests: always go to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      // Optional offline fallback if you want
      return new Response('<h1>Offline</h1><p>You are not connected.</p>', {
        headers: { 'Content-Type': 'text/html' },
      });
    })
  );
});
