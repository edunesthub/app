// update-check.js

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js').then(reg => {
    reg.onupdatefound = () => {
      const newWorker = reg.installing;
      newWorker.onstatechange = () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          showUpdateToast();
        }
      };
    };
  }).catch(err => {
    console.error('Service Worker registration failed:', err);
  });
}

function showUpdateToast() {
  let toast = document.getElementById("update-toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "update-toast";
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #333;
      color: white;
      padding: 14px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      font-size: 0.95rem;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 12px;
      z-index: 9999;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <span>New version available</span>
      <button style="
        background: #007aff;
        border: none;
        color: white;
        padding: 8px 14px;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
      " onclick="window.location.reload()">Update</button>
    </div>
  `;
}
