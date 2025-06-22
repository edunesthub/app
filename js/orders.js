import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, collection, query, where, onSnapshot } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

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
const ordersList = document.getElementById("orders-list");
const noOrdersMessage = document.getElementById("no-orders-message");

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
    const validOrders = querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(order => isValidOrder(order));

    // Show/hide the no-orders message
    if (noOrdersMessage) {
      noOrdersMessage.style.display = validOrders.length ? "none" : "block";
    }

    if (!validOrders.length) {
      ordersList.querySelectorAll(".order-box").forEach(el => el.remove());
      return;
    }

    const groupCartItems = (cart) => {
      const grouped = {};
      cart.forEach(item => {
        if (!grouped[item.name]) {
          grouped[item.name] = { ...item, quantity: 0 };
        }
        grouped[item.name].quantity += item.quantity;
      });
      return Object.values(grouped);
    };

    const fragment = document.createDocumentFragment();
    validOrders
      .sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis())
      .forEach(order => {
        const orderTime = order.timestamp.toDate().toLocaleString();

        const groupedCart = groupCartItems(order.cart);

        const itemsListSummary = groupedCart.map(item => `${item.quantity}x ${item.name}`).join(", ");
        const itemsListFull = groupedCart.map(item => {
          const itemTotal = typeof item.total === "number" ? item.total.toFixed(2) : (item.price * item.quantity).toFixed(2);
          return `<li class="text-white small">${item.quantity}x ${item.name} - GH₵${itemTotal}</li>`;
        }).join("");

        const subtotal = groupedCart.reduce((sum, item) => {
          const itemTotal = typeof item.total === "number" ? item.total : item.price * item.quantity;
          return sum + itemTotal;
        }, 0);

        const processingFee = order.processingFee || 2.00;
        const deliveryFee = order.deliveryFee || 3.00;
        const total = order.totalAmount || (subtotal + processingFee + deliveryFee);
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
            <p class="text-white small">Delivery Fee: GH₵${deliveryFee.toFixed(2)}</p>
            <p class="text-white small">Location: ${order.deliveryDetails.hostel}, Room ${order.deliveryDetails.location}</p>
            <hr class="bg-light">
            <p class="order-total text-white fw-bold">Total: GH₵${total.toFixed(2)}</p>
          </div>`;
        orderDiv.onclick = () => orderDiv.classList.toggle("expanded");
        fragment.appendChild(orderDiv);
      });

    ordersList.querySelectorAll(".order-box").forEach(el => el.remove());
    ordersList.appendChild(fragment);
  }, (error) => {
    console.error("Error loading orders:", error);
    if (noOrdersMessage) noOrdersMessage.style.display = "block";
  });
};

loadOrders();
feather.replace();
