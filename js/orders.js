
        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
        import { getFirestore, collection, query, getDoc, doc, where, onSnapshot } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

        const firebaseConfig = {
    apiKey: "AIzaSyADvpUQWo75ExePGoCRirD2mM-lmfM4Cmc",
    authDomain: "von600-7982d.firebaseapp.com",
    projectId: "von600-7982d",
    storageBucket: "von600-7982d.appspot.com",
    messagingSenderId: "164591218045",
    appId: "1:164591218045:web:afe17512e16573e7903014",
    measurementId: "G-E69DMPLXBK"
};

        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
let markupPrice = 0;

async function fetchMarkupPrice() {
  try {
    const markupDoc = await getDoc(doc(db, "settings", "markup"));
    if (markupDoc.exists()) {
      markupPrice = parseFloat(markupDoc.data().amount) || 0;
      console.log("Markup price:", markupPrice);
    }
  } catch (err) {
    console.warn("Failed to fetch markup price", err);
  }
}


        const ordersList = document.getElementById("orders-list");

        const getDeviceId = (() => {
            let deviceId = localStorage.getItem("deviceId");
            if (!deviceId) {
                deviceId = "device_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now();
                localStorage.setItem("deviceId", deviceId);
            }
            return () => deviceId;
        })();

        const isValidOrder = (order) => {
  if (!order.cart || !Array.isArray(order.cart)) return false;
  return order.cart.every(item =>
    typeof item.name === "string" && item.name !== "undefined" &&
    typeof item.quantity === "number" && !isNaN(item.quantity) &&
    (typeof item.total === "number" || (typeof item.price === "number" && !isNaN(item.price)))
  );
};


        const getStatusText = (status) => {
            switch (status) {
                case "pending": return "Order Confirmed";
                case "being_delivered": return "In Transit";
                case "delivered": return "Delivered!";
                case "not_delivered": return "Delivery Failed";
                default: return "Unknown";
            }
        };

        const loadOrders = () => {
  const deviceId = getDeviceId();
  const ordersRef = collection(db, "orders");
  const q = query(ordersRef, where("deviceId", "==", deviceId));

  onSnapshot(q, (querySnapshot) => {
    if (querySnapshot.empty) {
  ordersList.innerHTML = `
    <div class="no-orders-screen">
      <i class="feather-shopping-bag"></i>
      <h2>No Orders Yet</h2>
      <p>Why you no dey hung?</p>
    </div>`;
  return;
}


    const validOrders = querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(order => isValidOrder(order));

    if (!validOrders.length) {
      ordersList.innerHTML = "<p class='text-center text-white'>No valid orders yet.</p>";
      return;
    }

    const groupCartItems = (cart) => {
  const grouped = {};
  cart.forEach(item => {
    const extrasKey = item.extras ? item.extras.map(e => `${e.name}:${e.quantity}`).join("|") : "";
    const sizeKey = item.size || "";
    const key = `${item.name}-${item.price}-${sizeKey}-${extrasKey}`;

    if (!grouped[key]) {
      grouped[key] = { ...item, quantity: 0 };
    }
    grouped[key].quantity += item.quantity;
  });
  return Object.values(grouped);
};


    const fragment = document.createDocumentFragment();
    validOrders
      .sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis())
      .forEach(order => {
        const orderTime = order.timestamp.toDate().toLocaleString();

        // 🔥 Group identical items!
        const groupedCart = groupCartItems(order.cart);

        const itemsListSummary = groupedCart.map(item => `${item.quantity}x ${item.name}`).join(", ");
        const itemsListFull = groupedCart.map(item => {
  const itemTotal = typeof item.total === "number" ? item.total.toFixed(2) : ((item.price + markupPrice) * item.quantity).toFixed(2);

  const sizeInfo = item.size
    ? `<div style="font-size: 0.8rem; color: #aaa;"><strong>Size:</strong> ${item.size}</div>`
    : "";

  const extrasInfo = item.extras && item.extras.length > 0
    ? `<div style="font-size: 0.8rem; color: #ccc;"><strong>Extras:</strong> ${item.extras.map(e => `${e.name} ×${e.quantity}`).join(", ")}</div>`
    : "";

  return `
    <li class="text-white small mb-2">
      <div><strong>${item.quantity}x ${item.name}</strong> - GH₵${itemTotal}</div>
      ${sizeInfo}
      ${extrasInfo}
    </li>
  `;
}).join("");


        const subtotal = groupedCart.reduce((sum, item) => {
          const itemTotal = typeof item.total === "number" ? item.total : (item.price + markupPrice) * item.quantity;
          return sum + itemTotal;
        }, 0);

        const processingFee = order.processingFee || 2.00;
const baseDeliveryFee = order.deliveryFee || 3.00;
const totalMealCount = groupedCart.reduce((sum, item) => sum + item.quantity, 0);
const finalDeliveryFee = baseDeliveryFee + Math.max(0, (totalMealCount - 1) * 2);
const total = (subtotal + processingFee + finalDeliveryFee);
        const statusText = getStatusText(order.status || "pending");
        const statusClass = `status-badge status-${order.status || "pending"}`;

        const orderDiv = document.createElement("div");
        orderDiv.className = "order-box bg-darkish p-3 mb-3 rounded";
        orderDiv.innerHTML = `
          <div class="order-summary">
            <div class="order-summary-left">
              <h5 class="fw-bold text-white">Order on ${orderTime}</h5>
              <p class="order-id text-white-50 small">Order ID: <span>${order.id}</span></p>
              <p class="text-white small">${itemsListSummary}<br> <span class="${statusClass}">${statusText}</span></p>
            </div>
            <div class="order-summary-right">
              <p class="order-total text-white fw-bold">GH₵${total.toFixed(2)}</p>
            </div>
          </div>
          <div class="order-details">
            <hr class="bg-light">
            <ul class="list-unstyled">${itemsListFull}</ul>
            <hr class="bg-light">
            <p class="text-white small">Subtotal: GH₵${subtotal.toFixed(2)}</p>
            <p class="text-white small">Processing Fee: GH₵${processingFee.toFixed(2)}</p>
<p class="text-white small">Delivery Fee: GH₵${finalDeliveryFee.toFixed(2)}</p>
            <p class="text-white small">Location: ${order.deliveryDetails.hostel}, Room ${order.deliveryDetails.location}</p>
            <hr class="bg-light">
            <p class="order-total text-white fw-bold">Total: GH₵${total.toFixed(2)}</p>
          </div>`;
        orderDiv.onclick = () => orderDiv.classList.toggle("expanded");
        fragment.appendChild(orderDiv);
      });

    ordersList.innerHTML = "";
    ordersList.appendChild(fragment);
  }, (error) => {
    console.error("Error loading orders:", error);
    ordersList.innerHTML = "<p class='text-center text-white'>Error loading orders.</p>";
  });
};

fetchMarkupPrice().then(() => loadOrders());
        feather.replace();
    