// ✅ Service Worker Registration + Persistent Update Prompt
navigator.serviceWorker.register('/sw.js').then(registration => {
  console.log('✅ SW registered');

  // 🔹 If there's already a waiting SW, show prompt
  if (registration.waiting) {
    localStorage.setItem("chawp-update-pending", "true");
    showUpdatePrompt();
  }

  // 🔹 Detect new SW during runtime
  registration.addEventListener('updatefound', () => {
    const newSW = registration.installing;
    if (newSW) {
      newSW.addEventListener('statechange', () => {
        if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
          localStorage.setItem("chawp-update-pending", "true");
          showUpdatePrompt();
        }
      });
    }
  });

  // 🔄 Reload when new SW takes over
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });

}).catch(err => console.error('❌ SW registration failed:', err));


// ✅ Listen for update signals from update.html
if ('BroadcastChannel' in window) {
  const reloadChannel = new BroadcastChannel('chawp-update');
  reloadChannel.onmessage = (event) => {
    if (event.data?.type === 'force-reload') {
      console.log('[Chawp] Reload message received — refreshing...');
      location.reload();
    } else if (event.data?.type === 'update-available') {
      localStorage.setItem("chawp-update-pending", "true");
      showUpdatePrompt();
    }
  };
}

// ✅ Safari fallback
window.addEventListener('storage', (e) => {
  if (e.key === 'chawp-reload') {
    location.reload();
  }
});

// ✅ Persistent Update Prompt (centered)
function showUpdatePrompt() {
  if (document.getElementById('update-toast-overlay')) return;

  const currentVersion = localStorage.getItem("chawp-version") || "v?";

  // ✅ Backdrop
  const overlay = document.createElement('div');
  overlay.id = 'update-toast-overlay';
  Object.assign(overlay.style, {
    position: 'fixed',
    inset: '0',
    backgroundColor: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    zIndex: '9999',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  });

  // ✅ Toast Box
  const toastBox = document.createElement('div');
  toastBox.innerHTML = `
    <div style="
      background: #1c1c1e;
      color: white;
      padding: 20px;
      border-radius: 16px;
      box-shadow: 0 6px 20px rgba(0,0,0,0.3);
      text-align: center;
      max-width: 340px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <div style="font-size: 0.95rem; font-weight: 500;">
        🔄 A new version of <strong>Chawp</strong> is available.
      </div>
      <div style="margin-top: 6px; font-size: 0.85rem; opacity: 0.7;">
        Current Version: ${currentVersion}
      </div>
      <button style="
        margin-top: 16px;
        padding: 10px 20px;
        background: #007aff;
        border: none;
        color: white;
        border-radius: 12px;
        font-weight: 600;
        cursor: pointer;
        width: 100%;
        max-width: 200px;
      " onclick="window.location.href='/update.html'">
        Update Now
      </button>
    </div>
  `;

  overlay.appendChild(toastBox);
  document.body.appendChild(overlay);
}


// ✅ Firestore version watcher
import {
  getFirestore,
  doc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const db = getFirestore();
const versionRef = doc(db, "config", "appVersion");

onSnapshot(versionRef, (docSnap) => {
  const latestVersion = docSnap.data()?.currentVersion;
  const installedVersion = localStorage.getItem("chawp-installed-version");

  if (latestVersion) {
    localStorage.setItem("chawp-version", latestVersion);

    // Only show update prompt if the installed version is older
    if (installedVersion !== latestVersion) {
      localStorage.setItem("chawp-update-pending", "true");
      showUpdatePrompt();
    } else {
      localStorage.removeItem("chawp-update-pending");
    }
  }
});


// ✅ Always show prompt after reload — but only if version is outdated
window.addEventListener('DOMContentLoaded', () => {
  const latestVersion = localStorage.getItem("chawp-version");
  const currentVersion = localStorage.getItem("chawp-installed-version");

  if (latestVersion && currentVersion && latestVersion !== currentVersion) {
    setTimeout(() => {
      showUpdatePrompt();
    }, 1000);
  }
});
