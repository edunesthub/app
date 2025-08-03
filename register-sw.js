
// 1. Register service worker
navigator.serviceWorker.register('/sw.js').then(registration => {
  console.log('✅ SW registered');

  // Check for updates on load
  if (registration.waiting) {
    console.log('🔄 New SW waiting — activating...');
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    window.location.reload(true);
  }

  // Listen for updates while app is running
  registration.addEventListener('updatefound', () => {
    const newSW = registration.installing;
    if (newSW) {
      newSW.addEventListener('statechange', () => {
        if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
          console.log('🚨 New version found — refreshing...');
          newSW.postMessage({ type: 'SKIP_WAITING' });
        }
      });
    }
  });

  // Listen for when new SW takes control
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload(true);
  });

}).catch(err => console.error('❌ SW registration failed:', err));


// 2. Listen for reload broadcast from update.html
if ('BroadcastChannel' in window) {
  const reloadChannel = new BroadcastChannel('chawp-update');
  reloadChannel.onmessage = (event) => {
    if (event.data?.type === 'force-reload') {
      console.log('[Chawp] Reload message received — refreshing...');
      location.reload(true);
    }
  };
}
// 3. Fallback reload via localStorage (for Safari)
window.addEventListener('storage', (e) => {
  if (e.key === 'chawp-reload') {
    console.log('[Chawp] Reload via localStorage fallback');
    location.reload(true);
  }
});
