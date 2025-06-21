
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
    import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
    import { doc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

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
    window.db = db;
window.firebaseExports = {
  collection,
  doc,
  addDoc,
  updateDoc,
  increment
};


    const elements = {
        cartContainer: document.getElementById("cart-container"),
        notification: document.getElementById("notification"),
        notificationMessage: document.getElementById("notification-message")
    };
    const showNotification = (message, type = "success") => {
        elements.notificationMessage.textContent = message;
        elements.notification.className = `notification ${type === "error" ? "error" : ""}`;
        elements.notification.classList.add("show");
        setTimeout(() => elements.notification.classList.remove("show"), 2000);
    };
    const getCart = () => JSON.parse(localStorage.getItem("cart") || "[]");
    const saveCart = cart => localStorage.setItem("cart", JSON.stringify(cart));
    const getPersistentDeliveryDetails = () => {
        const details = JSON.parse(localStorage.getItem("deliveryDetails") || "{}");
        return { 
            hostel: details.hostel || "Hostel A",
            location: details.location || "",
            contactNumber: details.contactNumber || "",
            note: details.note || ""
        };
    };
    const savePersistentDeliveryDetails = (hostel, location, contactNumber, note) => {
        localStorage.setItem("deliveryDetails", JSON.stringify({
            hostel: hostel || "Hostel A",
            location: location || "",
            contactNumber: contactNumber || "",
            note: note || ""
        }));
    };
    const getDeviceId = () => {
        let deviceId = localStorage.getItem("deviceId");
        if (!deviceId) {
            deviceId = "device_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now();
            localStorage.setItem("deviceId", deviceId);
        }
        return deviceId;
    };
    let deliveryFees = [];
    let deliveryFeesCache = null;
    const fetchDeliveryFees = async () => {
    if (deliveryFeesCache) return deliveryFeesCache;
    try {
        const querySnapshot = await getDocs(collection(db, "deliveryFees"));
        deliveryFees = querySnapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name,
            fee: doc.data().fee
        }));

        const customOrder = ["Hostel A", "Hostel B", "Hostel C",  "Heavens Gate Block A", "Heavens Gate Block B","Heavens Gate Block C", "Abrempong Hostel", "Prestige Hostel" ];
deliveryFees.sort((a, b) => customOrder.indexOf(a.name) - customOrder.indexOf(b.name));

        deliveryFeesCache = deliveryFees;
        return deliveryFees;
    } catch (error) {
        console.error("Error fetching delivery fees:", error);
        showNotification("Failed to load delivery fees. Using defaults.", "error");
        return deliveryFees;
    }
};
  const getDeliveryFee = (hostelName) => {
    const hostel = deliveryFees.find(h => h.name === hostelName) || deliveryFees[0];
    return hostel.fee;
};
window.getDeliveryFee = getDeliveryFee;


let appliedDiscount = null;
window.appliedDiscount = appliedDiscount;
const fetchDiscountCode = async (code) => {
  const snapshot = await getDocs(collection(db, "discountCodes"));
  const now = new Date();

  const match = snapshot.docs.find(doc => {
    const data = doc.data();
    const notExpired = !data.expiresAt || new Date(data.expiresAt) > now;
    const underLimit = !data.maxUses || data.uses < data.maxUses;
    return (
      data.code.toLowerCase() === code.toLowerCase() &&
      data.active &&
      notExpired &&
      underLimit
    );
  });

  return match ? { id: match.id, ...match.data() } : null;
};


    const renderCart = async () => {
        const cart = getCart();
        if (!cart.length) {
            elements.cartContainer.innerHTML = `<div class="empty-cart"><h2>Your Cart is Empty</h2><p>Looks like you haven't added anything yet.<br>Explore the shops and treat yourself🍔</p><a href="index.html" class="btn btn-primary">Start Shopping</a></div>`;
            return;
        }
        await fetchDeliveryFees();
        const persistentDetails = getPersistentDeliveryDetails();
        let subtotal = 0;
        const groupedCart = new Map();
        cart.forEach(item => {
    const key = `${item.name}-${item.price}-${item.restaurantId || 'unknown'}`;
    if (groupedCart.has(key)) {
        const existing = groupedCart.get(key);
        existing.quantity += item.quantity;
        existing.ids.push(item.id);
    } else {
        groupedCart.set(key, { ...item, ids: [item.id] });
    }
});

        const itemsHTML = Array.from(groupedCart.values()).map(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            return `<div class="cart-item" data-key="${item.name}-${item.price}">
                <div><p class="item-name">${item.name}</p><p class="item-price">GH₵${item.price.toFixed(2)} each</p></div>
                <div class="controls">
                    <button class="btn-sm btn decrease"><i class="feather-minus"></i></button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="btn-sm btn increase"><i class="feather-plus"></i></button>
                    <p class="item-total">GH₵${itemTotal.toFixed(2)}</p>
                    <button class="btn-sm btn-danger remove"><i class="feather-trash-2"></i></button>
                </div>
            </div>`;
        }).join("");
        const deliveryFee = getDeliveryFee(persistentDetails.hostel);
       let discountAmount = 0;
if (window.appliedDiscount && typeof window.appliedDiscount === "object" && window.appliedDiscount.appliesTo) {
  const applyBase = window.appliedDiscount.appliesTo === "delivery" ? deliveryFee : subtotal + 2;
  if (window.appliedDiscount.type === "percent") {
    discountAmount = (window.appliedDiscount.value / 100) * applyBase;
  } else {
    discountAmount = Math.min(window.appliedDiscount.value, applyBase);
  }
}


const finalTotal = subtotal + 2 + deliveryFee - discountAmount;

        const hostelOptions = deliveryFees.map(hostel => 
            `<option value="${hostel.name}" ${persistentDetails.hostel === hostel.name ? "selected" : ""}>${hostel.name}</option>`
        ).join("");
        elements.cartContainer.innerHTML = `
       
            <div class="cart-items">${itemsHTML}</div>
            <div class="delivery-details">
                <h6>Delivery Details</h6><br>
                <label for="delivery-hostel">Hostel</label>
                <select id="delivery-hostel" required>${hostelOptions}</select><br><br>
                <label for="delivery-location">Room</label>
                <input type="tel" id="delivery-location" value="${persistentDetails.location}" placeholder="Enter room number (e.g., 555)" maxlength="3" pattern="\d{3}" inputmode="numeric" required><br><br>
                <label for="delivery-contact">Active Contact Number</label>
                <input type="tel" id="delivery-contact" value="${persistentDetails.contactNumber}" placeholder="Enter your phone number" maxlength="10" pattern="\d{10}" inputmode="numeric" required><br><br>
                <label for="delivery-note">Note to Restaurant (Optional)</label>
                <textarea id="delivery-note" placeholder="Add note for restaurant" rows="2">${persistentDetails.note || ""}</textarea>
                <label for="discount-code">Discount Code</label>
  <input type="text" id="discount-code" placeholder="Enter promo code">
<button class="btn w-100 mt-2" id="apply-discount-btn" style="background: #007aff; color: white;">
  Apply
</button>
  <p id="discount-feedback" style="margin-top: 5px; font-size: 0.9rem;"></p>
                </div>
           <div class="order-summary">
  <p>Subtotal <span class="float-end">GH₵${subtotal.toFixed(2)}</span></p>
  <p>Processing Fee <span class="float-end">GH₵2.00</span></p>
  <p>Delivery Fee <span class="float-end">GH₵${deliveryFee.toFixed(2)}</span></p>
  ${discountAmount > 0 ? `<p>Discount <span class="float-end text-success">-GH₵${discountAmount.toFixed(2)}</span></p>` : ""}
  <hr><h6>Total <span class="float-end">GH₵${finalTotal.toFixed(2)}</span></h6>
</div>

            <p class="refund-note"><i class="feather-info"></i> By proceeding with checkout, you agree to our <a href="refund.html">refund policy</a>.</p>
            <div class="action-buttons">
                <button id="checkout-btn" class="btn btn-success w-100">Proceed to Checkout <i class="feather-arrow-right"></i><span class="spinner"></span></button>
                <button id="remove-all-btn" class="btn btn-danger w-100 pb-3">Remove All <i class="feather-trash-2"></i></button>
            </div>
        `;
        document.getElementById("apply-discount-btn").onclick = async () => {
  const codeInput = document.getElementById("discount-code").value.trim();
  const feedback = document.getElementById("discount-feedback");
  if (!codeInput) {
    feedback.textContent = "Please enter a code.";
    feedback.style.color = "orange";
    return;
  }

  const discount = await fetchDiscountCode(codeInput);
  if (!discount) {
    window.appliedDiscount = null;
    feedback.textContent = "Invalid or expired code.";
    feedback.style.color = "red";
    renderCart();
    return;
  }

window.appliedDiscount = discount;
  feedback.textContent = `Applied ${discount.code} (${discount.type === "percent" ? discount.value + "% off" : "GH₵" + discount.value + " off"})`;
  feedback.style.color = "lightgreen";
  renderCart();
};

        elements.cartContainer.querySelectorAll(".increase").forEach(btn => btn.onclick = () => updateItemQuantity(btn.closest(".cart-item").dataset.key, 1));
        elements.cartContainer.querySelectorAll(".decrease").forEach(btn => btn.onclick = () => updateItemQuantity(btn.closest(".cart-item").dataset.key, -1));
        elements.cartContainer.querySelectorAll(".remove").forEach(btn => btn.onclick = () => removeItem(btn.closest(".cart-item").dataset.key));
        document.getElementById("delivery-hostel").onchange = saveDeliveryInputs;
        document.getElementById("delivery-location").onchange = saveDeliveryInputs;
        document.getElementById("delivery-contact").onchange = saveDeliveryInputs;
        document.getElementById("delivery-note").onchange = saveDeliveryInputs;
        document.getElementById("checkout-btn").onclick = proceedToCheckout;
        document.getElementById("remove-all-btn").onclick = removeAllItems;
    };
    const updateItemQuantity = (key, delta) => {
        const cart = getCart();
        cart.filter(item => `${item.name}-${item.price}` === key).forEach(item => item.quantity = Math.max(1, item.quantity + delta));
        saveCart(cart.filter(item => item.quantity > 0));
        renderCart();
    };
    const removeItem = key => {
        const cart = getCart();
        const firstItem = cart.find(item => `${item.name}-${item.price}` === key);
        saveCart(cart.filter(item => `${item.name}-${item.price}` !== key));
        renderCart();
        showNotification(`${firstItem.name} removed from cart`);
    };
    const removeAllItems = () => {
        saveCart([]);
        renderCart();
        showNotification("All items removed from cart");
    };
    const saveDeliveryInputs = () => {
        const hostel = document.getElementById("delivery-hostel").value || "Hostel A";
        const location = document.getElementById("delivery-location").value.trim();
        const contactNumber = document.getElementById("delivery-contact").value.trim();
        const note = document.getElementById("delivery-note").value.trim();
        savePersistentDeliveryDetails(hostel, location, contactNumber, note);
        renderCart();
    };
    let isProcessing = false;
 
    const proceedToCheckout = async () => {
        if (isProcessing) return;
        isProcessing = true;
        const checkoutBtn = document.getElementById("checkout-btn");
        checkoutBtn.disabled = true;
        checkoutBtn.classList.add("loading");
        const cart = getCart();
        const persistentDetails = getPersistentDeliveryDetails();
        if (!cart.length) {
            showNotification("Your cart is empty!", "error");
            resetCheckoutButton();
            return;
        }
        const sanitizedCart = cart.filter(item => 
            item.name && 
            typeof item.price === "number" && 
            !isNaN(item.price) && 
            typeof item.quantity === "number" && 
            !isNaN(item.quantity)
        );
        if (!sanitizedCart.length) {
            showNotification("Invalid items in cart!", "error");
            resetCheckoutButton();
            return;
        }
        const restaurantIds = [...new Set(sanitizedCart.map(item => item.restaurantId))];
        if (restaurantIds.length > 1) {
            showNotification("Cart contains items from multiple restaurants!", "error");
            resetCheckoutButton();
            return;
        }
        if (!sanitizedCart[0].restaurantId) {
            showNotification("Restaurant ID is missing in cart items!", "error");
            resetCheckoutButton();
            return;
        }
        // Validate required fields
        if (!persistentDetails.hostel || !persistentDetails.location || !persistentDetails.contactNumber) {
            showNotification("Please fill in all required delivery details!", "error");
            resetCheckoutButton();
            return;
        }
        const deliveryFee = getDeliveryFee(persistentDetails.hostel || "Hostel A");
const subtotal = sanitizedCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
const baseAmount = subtotal + 2 + deliveryFee;
let discountAmount = 0;

if (window.appliedDiscount && typeof window.appliedDiscount === "object" && window.appliedDiscount.appliesTo) {
  const applyBase = window.appliedDiscount.appliesTo === "delivery" ? deliveryFee : subtotal + 2;
  if (window.appliedDiscount.type === "percent") {
    discountAmount = (window.appliedDiscount.value / 100) * applyBase;
  } else {
    discountAmount = Math.min(window.appliedDiscount.value, applyBase);
  }
}





const totalAmount = baseAmount - discountAmount;
        const handler = PaystackPop.setup({
            key: "pk_live_014478be275a6453efab7529d14bd938c8b9b964",
            email: "customer@chawp.com",
            amount: Math.round(totalAmount * 100),
            currency: "GHS",
            ref: "ORDER_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9),
            metadata: {
                device_id: getDeviceId(),
                order_items: sanitizedCart.length
            },
callback: response => window.handlePaymentCallback(response),
            onClose: function() {
                showNotification("Payment cancelled.", "error");
                resetCheckoutButton();
            }
        });
        handler.openIframe();
    };
    const resetCheckoutButton = () => {
        const checkoutBtn = document.getElementById("checkout-btn");
        checkoutBtn.disabled = false;
        checkoutBtn.classList.remove("loading");
        checkoutBtn.innerHTML = `Proceed to Checkout <i class="feather-arrow-right"></i><span class="spinner"></span>`;
        isProcessing = false;
    };
    const initFooter = () => {
        const footerLinks = document.querySelectorAll('.osahan-menu-fotter .col a');
        footerLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                document.querySelectorAll('.osahan-menu-fotter .footer-item').forEach(item => item.classList.remove('selected'));
                link.closest('.footer-item').classList.add('selected');
                window.location.href = href;
            });
        });
    };
    document.addEventListener("DOMContentLoaded", () => {
        renderCart();
        initFooter();
        const featherObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                feather.replace();
                featherObserver.disconnect();
            }
        }, { root: null, threshold: 0.1 });
        featherObserver.observe(document.body);
    });
    window.addEventListener("online", renderCart);
    window.addEventListener("offline", () => showNotification("You're offline! Some features may be limited.", "error"));
