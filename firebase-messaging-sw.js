// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging.js');

// Initialize Firebase app inside Service Worker
firebase.initializeApp({
  apiKey: "AIzaSyADvpUQWo75ExePGoCRirD2mM-lmfM4Cmc",
        authDomain: "von600-7982d.firebaseapp.com",
        projectId: "von600-7982d",
        storageBucket: "von600-7982d.appspot.com",
        messagingSenderId: "164591218045",
        appId: "1:164591218045:web:afe17512e16573e7903014",
        measurementId: "G-E69DMPLXBK"
});

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});
