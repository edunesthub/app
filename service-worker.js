// 🔥 Firebase Messaging integration
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


// ✅ Your existing custom cache logic
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

// ✅ Push notifications for non-Firebase messages (if used elsewhere)
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'New Notification', {
      body: data.body || '',
      icon: '/img/icon-192x192.png',
    })
  );
});

// ✅ Allow manual skipWaiting call from app
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

// ✅ Install immediately
self.addEventListener('install', () => self.skipWaiting());
