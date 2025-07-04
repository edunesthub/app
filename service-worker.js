importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyADvpUQWo75ExePGoCRirD2mM-lmfM4Cmc",
  authDomain: "von600-7982d.firebaseapp.com",
  projectId: "von600-7982d",
  storageBucket: "von600-7982d.appspot.com",
  messagingSenderId: "164591218045",
  appId: "1:164591218045:web:afe17512e16573e7903014",
  measurementId: "G-E69DMPLXBK"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[service-worker.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/img/icon-192x192.png',
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});



const CACHE_NAME = 'Chawp-cache-v64';
const DYNAMIC_CACHE_NAME = 'Chawp-dynamic-v64';
const ALLOWED_CACHES = [CACHE_NAME, DYNAMIC_CACHE_NAME, 'assets-cache', 'api-cache', 'ChawpOrderQueue'];

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (!ALLOWED_CACHES.includes(cache)) {
            console.log('🗑️ Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute, setCatchHandler } from 'workbox-routing';
import { CacheFirst, NetworkFirst, NetworkOnly } from 'workbox-strategies';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

// Injected by Workbox during build
precacheAndRoute([{"revision":"21d135f1157571147d1170880dae50c5","url":"account.html"},{"revision":"3b869f937e0dd109242da18ec5b2c847","url":"cart.html"},{"revision":"9e8f56e8e1806253ba01a95cfc3d392c","url":"cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js"},{"revision":"88a769d2fe35899fd45a332a0a032cc0","url":"cdn-cgi/scripts/7d0fa10a/cloudflare-static/rocket-loader.min.js"},{"revision":"3fa8cf685fd0d8198d4fed7bc84564d8","url":"contact-us.html"},{"revision":"c6a8a4e67140a074c37bb4821aa96e56","url":"css/style.css"},{"revision":"62f2bd0bc9ebb85db0b330d231e4563d","url":"home.html"},{"revision":"62c10a347520ff2a679d49714b9e99da","url":"img/icon-192x192.png"},{"revision":"d9b3ebd473b0cb1489102c9470974a5d","url":"img/icon-512x512.png"},{"revision":"847d0511d3b53a3c97774d21aa7b203d","url":"img/photo_1_2025-04-12_19-35-16.jpg"},{"revision":"202c5217c161dac48c59e470a2a57272","url":"img/photo_2_2025-04-12_19-35-16.jpg"},{"revision":"0c2830879f53b982006880d8bc02eec4","url":"img/vendors/albies1.webp"},{"revision":"e1aeaf56869f583fbd7bb9b94c235a82","url":"img/vendors/cravee.webp"},{"revision":"52dc08b4648be8dd06216be997cfb193","url":"img/vendors/popular4.png"},{"revision":"faa37dc1c80f2244799051ebd6f0d2df","url":"img/vendors/street.webp"},{"revision":"f95c0135152bce1c8e80623d8db57e80","url":"img/vendors/trending1.png"},{"revision":"b675a818d789170b6c3d3426e961cf73","url":"img/vendors/trending2.png"},{"revision":"0a56e9d61adc3df7e85918510e8b967a","url":"index.html"},{"revision":"1346ef3529cdf0da08417b12adaef55d","url":"js/osahan.js"},{"revision":"dbbc70bca7b0b14c9a6570392828d59e","url":"loading.html"},{"revision":"2a9b6d60b4ba70148a88161fcc615542","url":"login.html"},{"revision":"73d1b41964967d0514143afb7b8179e8","url":"manifest.json"},{"revision":"1f29080909b39f45eafda4398288f6b3","url":"offline.html"},{"revision":"974474624659c0fda204616055acc671","url":"orders.html"},{"revision":"4c714bdd4f9418bbdb3cc1bed27fe3b4","url":"payment-failure.html"},{"revision":"3c055c2e6f3c02ce69f9c4bcd4a31c72","url":"privacy.html"},{"revision":"451e7549add388a83de7a0e90faf353c","url":"profile.html"},{"revision":"dbae35e94a33104d528ba8a05f4d6cb7","url":"protect.js"},{"revision":"f2234efacb56702b586dc8aaef860a71","url":"refund.html"},{"revision":"7796c0536e36d90133541efb0c57bcdd","url":"restaurant.html"},{"revision":"c0e81e0ab3b019af4d8380d3117cbe9f","url":"signup.html"},{"revision":"1259c7147057599b13be5f3c23e650db","url":"successful.html"},{"revision":"acec6f5d7c70069ff8c14fdad88dd00f","url":"terms.html"},{"revision":"cb8df9048dc7919e00e33816af54839f","url":"vendor/bootstrap/css/bootstrap.min.css"},{"revision":"e8890063e097beea88fd37621217af9c","url":"vendor/bootstrap/js/bootstrap.bundle.min.js"},{"revision":"b2843e54beb7c671e18b23ba2a3e971b","url":"vendor/icons/feather.css"},{"revision":"30792621ca010e3c5d5f98162629439f","url":"vendor/jquery/jquery.min.js"},{"revision":"f31cf7b5add9cd20d7d08c289d0824da","url":"vendor/sidebar/demo.css"},{"revision":"4b31446ef123e6f11e75dece961ee1d9","url":"vendor/sidebar/hc-offcanvas-nav.js"},{"revision":"f97e3bbf73254b0112091d0192f17aec","url":"vendor/slick/slick/fonts/slick.svg"},{"revision":"f138cf6d6e5ddca7ea9a13d948dd78e8","url":"vendor/slick/slick/slick-theme.css"},{"revision":"f38b2db10e01b1572732a3191d538707","url":"vendor/slick/slick/slick.css"},{"revision":"d5a61c749e44e47159af8a6579dda121","url":"vendor/slick/slick/slick.min.js"},{"revision":"78d82d0fc0432197366664c1480c36a7","url":"workbox-config.js"}]);

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

// Allow manual skipWaiting call from app
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

// Install immediately
self.addEventListener('install', () => self.skipWaiting());
