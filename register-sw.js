// ✅ Service Worker Registration Only
navigator.serviceWorker.register('/sw.js').then(registration => {
  console.log('✅ SW registered');

  registration.addEventListener('updatefound', () => {
    const newSW = registration.installing;
    if (newSW) {
      newSW.addEventListener('statechange', () => {
        if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
          console.log("🆕 New service worker installed and waiting.");
        }
      });
    }
  });

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });

}).catch(err => console.error('❌ SW registration failed:', err));

// ✅ BroadcastChannel reload support
if ('BroadcastChannel' in window) {
  const reloadChannel = new BroadcastChannel('chawp-update');
  reloadChannel.onmessage = (event) => {
    if (event.data?.type === 'force-reload') {
      location.reload();
    }
  };
}

// ✅ Safari Fallback
window.addEventListener('storage', (e) => {
  if (e.key === 'chawp-reload') {
    location.reload();
  }
});
