// Ensure service worker is registered and update-aware
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js').then(reg => {
    reg.onupdatefound = () => {
      const newWorker = reg.installing;
      newWorker.onstatechange = () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // Tell new SW to skip waiting and activate immediately
          newWorker.postMessage({ action: 'skipWaiting' });

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated') {
              showUpdateToast();
            }
          });
        }
      };
    };
  });
}

// Display the update toast
function showUpdateToast() {
  let toast = document.getElementById("update-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "update-toast";
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
      background: rgba(30,30,30,0.95);
      color: white;
      padding: 20px;
      border-radius: 16px;
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 9999;
      max-width: 90vw;
      width: 320px;
      text-align: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      box-shadow: 0 8px 30px rgba(0,0,0,0.4);
      backdrop-filter: blur(10px);
      WebkitBackdropFilter: blur(10px);
    ">
      <span style="font-size: 1.05rem; font-weight: 500;">
        A new version is available
      </span>
      <button style="
        background: linear-gradient(135deg, #007aff, #0051d4);
        color: white;
        padding: 10px 18px;
        border: none;
        border-radius: 14px;
        font-weight: 600;
        font-size: 1rem;
        cursor: pointer;
        width: 100%;
        max-width: 200px;
      " onclick="window.location.reload()">Update Now</button>
    </div>
  `;
}
function showUpdateToast() {
  const toast = document.getElementById("toast") || document.createElement("div");
  toast.id = "toast";
  document.body.appendChild(toast);

  toast.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; gap: 16px;">
      <span style="
        font-size: 1.05rem;
        font-weight: 500;
        color: rgba(255,255,255,0.95);
        letter-spacing: -0.01em;
      ">
        A new version is available
      </span>
      <button style="
        background: linear-gradient(135deg, #007aff, #0051d4);
        color: white;
        padding: 12px 22px;
        border: none;
        border-radius: 14px;
        font-weight: 600;
        font-size: 1rem;
        width: 100%;
        max-width: 200px;
        box-shadow: 0 6px 15px rgba(0,0,0,0.25);
        cursor: pointer;
        transition: transform 0.2s ease, background 0.3s ease;
        font-family: inherit;
      " onclick="window.location.reload()">Update Now</button>
    </div>
  `;

  Object.assign(toast.style, {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%) scale(0.95)",
    width: "calc(100vw - 40px)",
    maxWidth: "340px",
    textAlign: "center",
    background: "rgba(245, 245, 245, 0.12)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    padding: "22px 20px",
    borderRadius: "20px",
    opacity: "1",
    zIndex: "9999",
    pointerEvents: "auto",
    display: "block",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
    transition: "opacity 0.35s ease, transform 0.35s ease"
  });
}
