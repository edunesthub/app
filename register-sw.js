
// 1. Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(() => console.log('✅ SW registered'))
    .catch(err => console.error('❌ SW registration failed:', err));
}

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
