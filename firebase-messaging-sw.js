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
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});
