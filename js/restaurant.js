import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, collection, doc, getDoc, getDocs, onSnapshot } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

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

const urlParams = new URLSearchParams(window.location.search);
const restaurantId = urlParams.get("id");

let isRestaurantOpen = true;
let currentItem = null;

const elements = {
    restaurantName: document.getElementById("restaurant-name"),
    restaurantInfo: document.getElementById("restaurant-info"),
    restaurantImage: document.getElementById("restaurant-image"),
    menuSection: document.getElementById("menu-section"),
    optionsPanel: document.getElementById("options-panel"),
    optionsTitle: document.getElementById("options-title"),
    sizeGroup: document.getElementById("size-group"),
    extraGroup: document.getElementById("extra-group"),
    sizeOptions: document.getElementById("size-options"),
    extraOptions: document.getElementById("extra-options"),
    vendorNote: document.getElementById("vendor-note"),
    toast: document.getElementById("toast"),
    toastMessage: document.getElementById("toast-message"),
    viewCartBtn: document.getElementById("view-cart-btn"),
    closedMessage: document.getElementById("closed-message"),
    totalPrice: document.getElementById("total-price")
};

// ✅ Login check using your localStorage logic
const isLoggedIn = () => {
    return localStorage.getItem("isLoggedIn") === "true";
};

// ✅ NORMAL TOAST — simple top-of-screen for general notifications
const showToast = (message, type = "success") => {
    const toast = elements.toast;
    toast.innerHTML = `<span id="toast-message">${message}</span>`;
    toast.className = `toast-container ${type}`;

    // Reset to top-positioned styling
    Object.assign(toast.style, {
        top: "20px",
        left: "50%",
        bottom: "auto",
        transform: "translateX(-50%)",
        width: "auto",
        maxWidth: "90vw",
        textAlign: "center",
        background: type === "error" ? "rgba(220, 53, 69, 0.9)" :
                    type === "success" ? "rgba(40, 167, 69, 0.9)" :
                    "rgba(0,0,0,0.85)",
        color: "#fff",
        padding: "10px 15px",
        borderRadius: "10px",
        boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
        fontSize: "0.9rem",
        zIndex: "1000",
        opacity: "0",
        display: "block",
        transition: "opacity 0.3s ease-out"
    });

    requestAnimationFrame(() => {
        toast.style.opacity = "1";
    });

    setTimeout(() => {
        toast.style.opacity = "0";
    }, 5000);

    setTimeout(() => {
        toast.innerHTML = "";
        toast.style.display = "none";
    }, 5300);
};

// ✅ APPLE-STYLE TOAST — used only for login prompts
const showLoginPrompt = () => {
    const toast = elements.toast;

    toast.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 16px;">
            <span style="
                font-size: 1.05rem;
                font-weight: 500;
                color: rgba(255,255,255,0.95);
                letter-spacing: -0.01em;
            ">
                Cravings? Let’s log in first.
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
            " onclick="window.location.href='login.html'">Log In</button>
        </div>
    `;

    toast.className = `toast-container error`;

    Object.assign(toast.style, {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%) scale(0.95)",
        width: "calc(100vw - 40px)",
        maxWidth: "340px",
        background: "rgba(245, 245, 245, 0.12)",
        color: "#fff",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        padding: "22px 20px",
        borderRadius: "20px",
        zIndex: "9999",
        pointerEvents: "auto",
        display: "block",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
        opacity: "0",
        transition: "opacity 0.35s ease, transform 0.35s ease"
    });

    requestAnimationFrame(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translate(-50%, -50%) scale(1)";
    });

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translate(-50%, -50%) scale(0.95)";
    }, 5000);

    setTimeout(() => {
        toast.innerHTML = "";
        toast.style.display = "none";
    }, 5300);
};

// ✅ USE THIS WHEN USER IS NOT LOGGED IN AND TRIES TO ORDER
const promptLogin = () => {
    showLoginPrompt();
};


const loadRestaurant = async () => {
    try {
        const docRef = doc(db, "restaurant", restaurantId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            showToast("Restaurant not found.", "error");
            return;
        }
        const data = docSnap.data();
        elements.restaurantName.textContent = data.name || "Restaurant";
        elements.restaurantInfo.textContent = `🕓 ${data.delivery_time || 'N/A'} mins • ${data.isOpen !== false ? 'Open' : 'Closed'}`;
        elements.restaurantImage.src = data.image || "img/placeholder.webp";
        isRestaurantOpen = data.isOpen !== false;
        elements.closedMessage.style.display = isRestaurantOpen ? 'none' : 'flex';
    } catch (e) {
        console.error("Error loading restaurant:", e);
        showToast("Failed to load restaurant data.", "error");
    }
};

const renderMenu = grouped => {
    if (!grouped || Object.keys(grouped).length === 0) {
        elements.menuSection.innerHTML = `<div class="error-message">No menu available.</div>`;
        return;
    }

    let menuHTML = '<h2 class="fw-bold">Menu</h2>';

    // Sort categories by categoryOrder
    const sortedCategories = Object.entries(grouped).sort((a, b) => {
        const aOrder = a[1][0]?.categoryOrder ?? 9999;
        const bOrder = b[1][0]?.categoryOrder ?? 9999;
        return aOrder - bOrder;
    });

    for (const [category, items] of sortedCategories) {
        menuHTML += `<h3 style="margin: 15px 0 10px; color: #ccc; font-weight: 700; padding-left: 10px; padding-top: 15px;">${category}</h3>`;
        menuHTML += `<div class="menu-container">`;

        // Sort items within category by orderNumber
        items.sort((a, b) => (a.orderNumber ?? 9999) - (b.orderNumber ?? 9999));

        menuHTML += items.map(item => `
            <div class="menu-item" data-item='${JSON.stringify(item).replace(/'/g, "&#39;")}'>
                <p class="menu-item-name">${item.name}</p>
                <div class="menu-item-right">
<p class="menu-item-price">GH₵${item.price.toFixed(2)}</p>
                    <button class="add-to-cart" ${!isRestaurantOpen ? 'disabled' : ''}>Add</button>
                </div>
            </div>
        `).join("");

        menuHTML += `</div>`;
    }

elements.menuSection.innerHTML = menuHTML;
setupAddToCartButtons(); // <- This is missing in your current code
};

const setupAddToCartButtons = () => {
    document.querySelectorAll(".menu-item").forEach(itemElement => {
        const button = itemElement.querySelector(".add-to-cart");
        const itemData = itemElement?.dataset?.item;
        if (!itemData) return;

        const item = JSON.parse(itemData.replace(/&#39;/g, "'"));

        itemElement.addEventListener("click", () => {
            if (!isRestaurantOpen) return;

            // ✅ Block unauthenticated users
            if (!isLoggedIn()) {
                promptLogin();
                return;
            }

            if (item.sizes.length > 0 || item.extras.length > 0) {
                showOptionsPanel(item); // Will show customized options
            }
        });

        button.addEventListener("click", e => {
            e.stopPropagation();

            if (!isRestaurantOpen) return;

            // ✅ Block unauthenticated users
            if (!isLoggedIn()) {
                promptLogin();
                return;
            }

            if (item.sizes.length > 0 || item.extras.length > 0) {
                showOptionsPanel(item); // Button and container will now behave same
            } else {
                const cart = JSON.parse(localStorage.getItem("cart") || "[]");
                cart.push({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: 1,
                    restaurantId: restaurantId
                });

                localStorage.setItem("cart", JSON.stringify(cart));
                showToast(`${item.name} added to cart!`);
                updateCartButton();
            }
        });
    });
};

const showOptionsPanel = (item) => {
    if (!isLoggedIn()) {
        promptLogin();
        return;
    }

    currentItem = item;
    elements.optionsTitle.textContent = item.name;
    elements.optionsPanel.classList.add("show");

    // Populate sizes
    elements.sizeOptions.innerHTML = item.sizes.map((size, index) => `
        <label>
            <input type="radio" name="size" value="${size.name}" ${index === 0 ? 'checked' : ''}>
            <span>${size.name}</span>
            <span class="price">GH₵${parseFloat(size.price).toFixed(2)}</span>
        </label>
    `).join("");

    // Populate extras
    elements.extraOptions.innerHTML = item.extras.map(extra => `
        <label>
            <input type="checkbox" value="${extra.name}">
            <span>${extra.name}</span>
            <span class="price">GH₵${parseFloat(extra.price).toFixed(2)}</span>
        </label>
    `).join("");

    elements.vendorNote.value = "";
    elements.totalPrice.textContent = "Total: GH₵0.00";
};


const updateCartButton = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    if (cart.length > 0) {
        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        elements.viewCartBtn.textContent = `View Cart - GH₵${total.toFixed(2)}`;
        elements.viewCartBtn.classList.add("show");
    } else {
        elements.viewCartBtn.classList.remove("show");
    }
};

document.getElementById("confirm-add").addEventListener("click", () => {
    if (!currentItem) return;

    // ✅ Block if not logged in
    if (!isLoggedIn()) {
        promptLogin();
        return;
    }

    const selectedSize = document.querySelector('input[name="size"]:checked');
    const size = selectedSize ? selectedSize.value : null;
    const sizePrice = selectedSize
        ? parseFloat(selectedSize.closest("label").querySelector(".price").textContent.replace("GH₵", ""))
        : 0;

    const extras = [];
    let extrasTotal = 0;
    document.querySelectorAll('#extra-options input[type="checkbox"]:checked').forEach(input => {
        const label = input.closest("label");
        const name = input.value;
        const price = parseFloat(label.querySelector(".price").textContent.replace("GH₵", ""));
        extras.push({ name, price });
        extrasTotal += price;
    });

    const note = elements.vendorNote.value;

    const basePrice = currentItem.price || 0;
    const totalPrice = (sizePrice || basePrice) + extrasTotal;

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    cart.push({
        id: currentItem.id,
        name: currentItem.name,
        size,
        extras,
        note,
        price: totalPrice,
        quantity: 1,
        restaurantId: restaurantId
    });

    localStorage.setItem("cart", JSON.stringify(cart));
    elements.optionsPanel.classList.remove("show");
    showToast(`${currentItem.name} added to cart!`, "success");
    updateCartButton();
});


document.getElementById("close-panel").addEventListener("click", () => {
    elements.optionsPanel.classList.remove("show");
});



const loadMenuLive = async () => {
    const menuRef = collection(db, "restaurant", restaurantId, "menu");
    const categoriesRef = collection(db, "restaurant", restaurantId, "categories");

    const [menuSnap, catSnap] = await Promise.all([
        getDocs(menuRef),
        getDocs(categoriesRef)
    ]);

    const categoryOrderMap = {};
    catSnap.forEach(doc => {
        const data = doc.data();
        categoryOrderMap[data.name] = data.sortOrder ?? 9999;
    });

    const categoryVisibilityMap = {};
catSnap.forEach(doc => {
    const data = doc.data();
    categoryOrderMap[data.name] = data.sortOrder ?? 9999;
    categoryVisibilityMap[data.name] = data.visible !== false; // Default to true
});

    const items = menuSnap.docs.map(doc => {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        price: parseFloat(data.price) || 0,
        sizes: data.sizes || [],
        extras: data.extras || [],
        category: data.category || "",
        categoryOrder: categoryOrderMap[data.category] ?? 9999,
        orderNumber: typeof data.orderNumber === "number" ? data.orderNumber : 9999,
        visible: data.visible !== false // default to true
    };
});

const visibleItems = items.filter(item => item.visible && categoryVisibilityMap[item.category] !== false);


    const grouped = {};
    visibleItems.forEach(item => {
        const category = item.category || "";
        if (!grouped[category]) grouped[category] = [];
        grouped[category].push(item);
    });

    renderMenu(grouped);
};

// Load restaurant and menu
loadRestaurant();
loadMenuLive();


    // Slow network detection
    function showSlowNetworkToast() {
      // Only show if online
      if (!navigator.onLine) return;
  
      const toastContainer = document.createElement('div');
      toastContainer.id = 'slow-network-toast';
      toastContainer.className = 'toast-container';
      toastContainer.style.background = 'rgba(255, 152, 0, 0.9)'; // Orange for warning
      toastContainer.style.zIndex = '1001'; // Above other toasts
      toastContainer.innerHTML = '<span>Slow Network Detected...</span>';
      document.body.appendChild(toastContainer);
  
      // Show toast
      toastContainer.classList.add('show');
      
      // Auto-hide after 7 seconds
      setTimeout(() => {
        toastContainer.classList.remove('show');
        toastContainer.classList.add('hide');
        setTimeout(() => {
          toastContainer.remove();
        }, 300);
      }, 7000);
    }
  
    // Check network speed
    if ('connection' in navigator) {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      const slowNetworks = ['2g', '3g', 'slow-2g', '4g'];
  
      // Initial check
      if (navigator.onLine && slowNetworks.includes(connection.effectiveType)) {
        showSlowNetworkToast();
      }
  
      // Listen for network changes
      connection.addEventListener('change', () => {
        if (navigator.onLine && slowNetworks.includes(connection.effectiveType)) {
          showSlowNetworkToast();
        }
      });
    }
  