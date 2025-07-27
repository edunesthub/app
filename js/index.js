
        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
        import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
        import { getFirestore, collection, getDocs, query, orderBy, where, limit } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
    
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
        const auth = getAuth(app);
        const db = getFirestore(app);

        // Check authentication state
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in, update welcome message
            updateWelcomeMessage();
            // Cache user data for offline use
            localStorage.setItem('current-user', JSON.stringify({ uid: user.uid, email: user.email }));
        } else {
            // No user is signed in, redirect to login page
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

if (isStandalone) {
    window.location.href = "login.html";
} else {
    // Optionally show a message, or just stay on the homepage
    console.warn("User not logged in and not in PWA mode — not redirecting.");
}

        }
    });
    
        async function fetchTrendingRestaurants() {
            const trendingList = document.getElementById("trending-list");
            
            // Show skeleton UI after 500ms if no data yet
    let skeletonTimeout = setTimeout(() => {
        if (elements.trendingList.children.length === 0) {
            renderSkeletonCards(elements.trendingList);
        }
    }, 500);

            // Check for cached restaurants in localStorage
            const cachedRestaurants = localStorage.getItem("trending-restaurants-cache");
            if (cachedRestaurants) {
                const restaurants = JSON.parse(cachedRestaurants);
                renderRestaurants(restaurants, trendingList);
            } 
    
            // Skip fetching if offline
            if (!navigator.onLine) return;
    
            try {
              const q = query(
  collection(db, "restaurant"),
  where("isTrending", "==", true),
  orderBy("trendingOrder", "asc"),
  limit(10)
);


                const querySnapshot = await getDocs(q);
    
                const restaurants = [];

if (querySnapshot.empty) {
    trendingList.innerHTML = `
        <div class="text-wrap text-white text-center py-4">
            <p class="text-lg font-semibold text-red-400">⚠️ Something went wrong</p>
            <p class="text-sm text-gray-300">We couldn’t load restaurants. Please try again later.</p>
        </div>
    `;
    console.error("⚠️ Firestore returned an empty result. Possible issue with fetching trending restaurants.");
    return;
}

    
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    const restaurantId = doc.id;
                    restaurants.push({ id: restaurantId, ...data });
                });
    
                // Cache the restaurants with timestamp
                localStorage.setItem("trending-restaurants-cache", JSON.stringify(restaurants));
                localStorage.setItem("trending-restaurants-cache-time", Date.now());
                renderRestaurants(restaurants, trendingList);
    
            } catch (error) {
                console.error("Error fetching restaurants:", error);
                trendingList.innerHTML = `
                    <div class="text-wrap text-white">Failed to load restaurants. Please try again.</div>
                `;
            }
        }

        function renderSkeletonCards(trendingList) {
    trendingList.innerHTML = '';
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < 4; i++) { // Show 4 skeleton cards
        const skeletonCard = document.createElement("div");
        skeletonCard.className = "skeleton-card";
        skeletonCard.innerHTML = `
            <div class="skeleton-image"></div>
            <div class="skeleton-body">
                <div class="skeleton-text"></div>
                <div class="skeleton-text short"></div>
            </div>
        `;
        fragment.appendChild(skeletonCard);
    }
    trendingList.appendChild(fragment);
}


    
        function renderRestaurants(restaurants, trendingList) {
            // Clear any skeleton cards
    trendingList.innerHTML = '';
            // Get existing cards
            const existingCards = Array.from(trendingList.querySelectorAll(".list-card"));
            const existingIds = new Set(existingCards.map(card => card.dataset.id));
            const newIds = new Set(restaurants.map(r => r.id));
    
            // Remove cards for restaurants no longer in the list
            existingCards.forEach(card => {
                if (!newIds.has(card.dataset.id)) {
                    card.classList.add("removing");
                    setTimeout(() => card.remove(), 100); // Match CSS transition duration
                }
            });
    
            // Create or update cards
            const fragment = document.createDocumentFragment();
            restaurants.forEach((data, index) => {
                const restaurantId = data.id;
                const deliveryTime = data.delivery_time || "N/A";
                const isOpen = data.isOpen !== false;
    
                let card = existingCards.find(c => c.dataset.id === restaurantId);
                if (card) {
                    // Update existing card if data has changed
                    const img = card.querySelector(".list-card-image img");
                    const nameLink = card.querySelector(".list-card-body h6 a");
                    const timeSpan = card.querySelector(".list-card-body .time span");
                    const closedBadge = card.querySelector(".closed-badge");
    
                    const newImgSrc = data.image || 'img/placeholder.png';
                    const newName = data.name || 'Unknown Restaurant';
                    const newTimeText = `<i class="feather-clock me-1"></i>${Math.max(5, deliveryTime - 15)}-${deliveryTime} mins`;
                    const needsClosedBadge = !isOpen;
    
                    if (img.src !== newImgSrc) img.src = newImgSrc;
                    if (nameLink.textContent !== newName) nameLink.textContent = newName;
                    if (timeSpan.innerHTML !== newTimeText) timeSpan.innerHTML = newTimeText;
                    if (needsClosedBadge && !closedBadge) {
                        const badge = document.createElement("span");
                        badge.className = "closed-badge";
                        badge.textContent = "Closed 🔒";
                        card.querySelector(".list-card-image a").appendChild(badge);
                    } else if (!needsClosedBadge && closedBadge) {
                        closedBadge.remove();
                    }
                } else {
                    // Create new card
                    card = document.createElement("div");
                    card.className = "list-card";
                    card.dataset.id = restaurantId;
    
                    card.innerHTML = `
                        <div class="list-card-image">
                            <a href="restaurant.html?id=${restaurantId}">
                                <img alt="${data.name || 'Restaurant'}" src="${data.image || 'img/placeholder.png'}" class="img-fluid item-img" loading="lazy">
                                ${isOpen ? '' : '<span class="closed-badge">Closed 🔒</span>'}
                            </a>
                        </div>
                        <div class="list-card-body">
                            <h6 class="mb-1"><a href="restaurant.html?id=${restaurantId}" class="text-white">${data.name || 'Unknown Restaurant'}</a></h6>
                            <p class="time"><a href="restaurant.html?id=${restaurantId}"><span><i class="feather-clock me-1"></i>${Math.max(5, deliveryTime - 15)}-${deliveryTime} mins</span></a></p>
                        </div>
                    `;
    
                    fragment.appendChild(card);
                }
            });
    
            trendingList.appendChild(fragment);
    
            // Apply 'loaded' class to new cards with staggered animation
            setTimeout(() => {
                trendingList.querySelectorAll(".list-card:not(.loaded):not(.removing)").forEach((card, idx) => {
                    setTimeout(() => {
                        card.classList.add("loaded");
                    }, idx * 100);
                });
            }, 100);
        }
    
       import { getDoc, doc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

async function updateWelcomeMessage() {
    const welcomeMessage = document.getElementById("welcome-message");

    const user = auth.currentUser;
    if (!user) {
        welcomeMessage.textContent = `Hi!`;
        return;
    }

    const cacheKey = "user-account-cache-" + user.uid;
    const cachedUser = localStorage.getItem(cacheKey);

    if (cachedUser) {
        // ✅ Show cached name instantly
        const { name } = JSON.parse(cachedUser);
        welcomeMessage.textContent = `Hi, ${name}!`;
    } else {
        // If no cache, show generic greeting
        welcomeMessage.textContent = `Hi!`;
    }

    // 🔄 Always fetch fresh data in background to update cache
    try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            const name = data.name || "User";
            welcomeMessage.textContent = `Hi, ${name}!`; // Update if different
            localStorage.setItem(cacheKey, JSON.stringify({ name }));
        }
    } catch (error) {
        console.error("Failed to fetch user data:", error);
    }
}

        function monitorNetwork() {
            const offlineNotice = document.querySelector('.offline-notice');
            const slowNotice = document.querySelector('.network-slow-notice');
    
            function checkNetworkType() {
    if ('connection' in navigator && navigator.connection.effectiveType) {
        const slowTypes = ['slow-2g', '2g', '3g', '4g']; // Added '4g'
        if (slowTypes.includes(navigator.connection.effectiveType)) {
            slowNotice.style.display = 'block';
            slowNotice.classList.add('visible');
        } else {
            slowNotice.classList.remove('visible');
            slowNotice.style.display = 'none';
        }
    }
}

            window.addEventListener('online', () => {
                document.body.classList.remove('offline');
                offlineNotice.style.display = 'none';
                checkNetworkType();
                // Only fetch if cache is stale (older than 5 minutes)
                const cacheTime = localStorage.getItem("trending-restaurants-cache-time");
                if (!cacheTime || (Date.now() - cacheTime) > 5 * 60 * 1000) {
                    fetchTrendingRestaurants();
                }
            });
    
            window.addEventListener('offline', () => {
        document.body.classList.add('offline');
        offlineNotice.style.display = 'block';
        setTimeout(() => offlineNotice.style.opacity = '1', 10);
        slowNotice.style.display = 'none';
        renderSkeletonCards(elements.trendingList); // Show skeleton on offline
    });
    
            if ('connection' in navigator) {
                navigator.connection.addEventListener('change', checkNetworkType);
                checkNetworkType(); // Initial check
            }
    
            // Optimize fetch for slow networks
            const originalFetch = window.fetch;
            window.fetch = async function (...args) {
                const startTime = performance.now();
                try {
                    const response = await originalFetch.apply(this, args);
                    const duration = performance.now() - startTime;
                    if (duration > 2000 && navigator.onLine) {
                        slowNotice.style.display = 'block';
                        slowNotice.classList.add('visible');
                    } else if (navigator.onLine) {
                        slowNotice.classList.remove('visible');
                        slowNotice.style.display = 'none';
                    }
                    return response;
                } catch (error) {
                    if (!navigator.onLine) {
                        document.body.classList.add('offline');
                        offlineNotice.style.display = 'block';
                        setTimeout(() => offlineNotice.style.opacity = '1', 10);
                    }
                    throw error;
                }
            };
        }
        document.addEventListener("DOMContentLoaded", () => {
    const loader = document.getElementById("page-loader");
    if (loader) {
        loader.classList.add("hidden");
        setTimeout(() => loader.remove(), 300);
    }
});

    
        document.addEventListener("DOMContentLoaded", () => {
            const mainContent = document.getElementById("main-content");
            mainContent.style.display = "block";
            mainContent.classList.add("loaded");
            document.querySelector(".welcome-header").classList.add("loaded");
            document.querySelector(".promo-banner").classList.add("loaded");
            document.querySelector(".trending-section").classList.add("loaded");
            document.querySelector(".osahan-menu-fotter").classList.add("loaded");
            updateWelcomeMessage();
            monitorNetwork();
    
            // Load cached restaurants immediately
            const cachedRestaurants = localStorage.getItem("trending-restaurants-cache");
            const trendingList = document.getElementById("trending-list");
            if (cachedRestaurants) {
                trendingList.innerHTML = '';
                renderRestaurants(JSON.parse(cachedRestaurants), trendingList);
            } else if (!navigator.onLine) {
                trendingList.innerHTML = `
                    <div class="text-wrap text-white">You're offline. Please check your connection.</div>
                `;
            } 
    
            // Fetch fresh data in the background if online and cache is stale
            const cacheTime = localStorage.getItem("trending-restaurants-cache-time");
            if (navigator.onLine && (!cacheTime || (Date.now() - cacheTime) > 5 * 60 * 1000)) {
                fetchTrendingRestaurants();
            }
    
            if ("serviceWorker" in navigator) {
                navigator.serviceWorker.register("service-worker.js?ver=1.0.1", { updateViaCache: "none" })
                    .then(registration => {
                        registration.update();
                    })
                    .catch(error => console.error("PWA Error:", error));
            }
        });
    