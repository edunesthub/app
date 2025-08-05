// update-prompt.js

import {
  getFirestore,
  doc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const db = getFirestore();
const versionRef = doc(db, "config", "appVersion");

function showUpdatePrompt() {
  if (document.getElementById('update-toast-overlay')) return;

  const currentVersion = localStorage.getItem("chawp-version") || "v?";

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

onSnapshot(versionRef, (docSnap) => {
  const latestVersion = docSnap.data()?.currentVersion;
  const installedVersion = localStorage.getItem("chawp-installed-version");

  if (latestVersion) {
    localStorage.setItem("chawp-version", latestVersion);

    if (installedVersion !== latestVersion) {
      localStorage.setItem("chawp-update-pending", "true");
      showUpdatePrompt();
    } else {
      localStorage.removeItem("chawp-update-pending");
    }
  }
});

window.addEventListener('DOMContentLoaded', () => {
  const latestVersion = localStorage.getItem("chawp-version");
  const currentVersion = localStorage.getItem("chawp-installed-version");

  if (latestVersion && currentVersion && latestVersion !== currentVersion) {
    setTimeout(() => {
      showUpdatePrompt();
    }, 1000);
  }
});

if ('BroadcastChannel' in window) {
  const reloadChannel = new BroadcastChannel('chawp-update');
  reloadChannel.onmessage = (event) => {
    if (event.data?.type === 'force-reload') {
      location.reload();
    } else if (event.data?.type === 'update-available') {
      localStorage.setItem("chawp-update-pending", "true");
      showUpdatePrompt();
    }
  };
}

window.addEventListener('storage', (e) => {
  if (e.key === 'chawp-reload') {
    location.reload();
  }
});
