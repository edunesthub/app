self.addEventListener('install', (event) => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

// 🚫 Never cache HTML — always fresh
self.addEventListener('fetch', (event) => {
  const req = event.request;

  if (req.mode === 'navigate') {
    // Always network for pages
    event.respondWith(fetch(req).catch(() =>
      new Response('<h1>Offline</h1>', { headers: { 'Content-Type': 'text/html' } })
    ));
    return;
  }

  // ✅ Cache-first for images
  if (req.destination === 'image') {
    event.respondWith(
      caches.open('images').then(async (cache) => {
        const cached = await cache.match(req);
        if (cached) return cached;
        try {
          const fresh = await fetch(req);
          cache.put(req, fresh.clone());
          return fresh;
        } catch {
          return cached; // fallback if offline
        }
      })
    );
    return;
  }

  // ✅ Stale-while-revalidate for CSS/JS
  if (['style', 'script'].includes(req.destination)) {
    event.respondWith(
      caches.open('static').then(async (cache) => {
        const cached = await cache.match(req);
        const networkFetch = fetch(req).then((fresh) => {
          cache.put(req, fresh.clone());
          return fresh;
        }).catch(() => cached);

        return cached || networkFetch;
      })
    );
    return;
  }

  // Default: network
  event.respondWith(fetch(req));
});
