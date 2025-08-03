navigator.serviceWorker.register('/sw.js').then(registration => {
  console.log('✅ SW registered');

  // 🔹 Check if there's a waiting SW already
  if (registration.waiting) {
    notifyUpdateAvailable(); // Show banner instead of skipping immediately
  }

  // 🔹 Detect new SW install while app is running
  registration.addEventListener('updatefound', () => {
    const newSW = registration.installing;
    if (newSW) {
      newSW.addEventListener('statechange', () => {
        if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
          notifyUpdateAvailable(); // Show banner again
        }
      });
    }
  });

  // 🔄 When user clicks banner and new SW takes control, reload
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });

}).catch(err => console.error('❌ SW registration failed:', err));

// 🔸 Handle update from update.html
if ('BroadcastChannel' in window) {
  const reloadChannel = new BroadcastChannel('chawp-update');
  reloadChannel.onmessage = (event) => {
    if (event.data?.type === 'force-reload') {
      console.log('[Chawp] Reload message received — refreshing...');
      location.reload();
    } else if (event.data?.type === 'update-available') {
      notifyUpdateAvailable(); // Support update banner from update.html too
    }
  };
}

// 🔸 Safari fallback via localStorage
window.addEventListener('storage', (e) => {
  if (e.key === 'chawp-reload') {
    console.log('[Chawp] Reload via localStorage fallback');
    location.reload();
  }
});

// ✅ Show update banner
function notifyUpdateAvailable() {
  const banner = document.getElementById('update-banner');
  if (!banner) return;

  banner.style.display = 'block';

  banner.addEventListener('click', () => {
    banner.textContent = 'Updating... 🔁';
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    }
  });
}
