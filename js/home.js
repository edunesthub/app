
        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
        import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
    
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
        let allRestaurants = [];
        const restaurantList = document.getElementById("all-restaurants");
    
        const loadAllRestaurants = async () => {
            const cachedData = localStorage.getItem("allRestaurantsIndex");
            if (cachedData) {
                requestAnimationFrame(() => {
                    restaurantList.innerHTML = cachedData;
                    allRestaurants = JSON.parse(localStorage.getItem("allRestaurantsData") || "[]");
                    document.querySelectorAll(".list-card-image img").forEach(img => img.classList.add("loaded"));
                });
            } else {
                restaurantList.innerHTML = "<div class='col-12 text-center'><p>Loading...</p></div>";
            }
    
            try {
                const q = query(collection(db, "restaurant"), orderBy("trendingOrder", "asc"));
                const querySnapshot = await getDocs(q);
    
                if (querySnapshot.empty) {
                    restaurantList.innerHTML = "<div class='col-12 text-center'><p>No restaurants found.</p></div>";
                    return;
                }
    
                allRestaurants = [];
                let output = "";
                querySnapshot.forEach(doc => {
                    const data = doc.data();
                    const restaurantId = doc.id;
                    const deliveryTime = data.delivery_time || "N/A";
                   
                    const isOpen = data.isOpen !== false; // Default to true if isOpen is undefined
                    allRestaurants.push({ id: restaurantId, ...data });
                  output += `<div class="list-card" data-id="${restaurantId}">
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
</div>`;

                });
    
                requestAnimationFrame(() => {
                    restaurantList.innerHTML = output;
                    document.querySelectorAll(".list-card-image img").forEach(img => {
                        if (img.complete) img.classList.add("loaded");
                        else img.onload = () => img.classList.add("loaded");
                    });
                });
                localStorage.setItem("allRestaurantsIndex", output);
                localStorage.setItem("allRestaurantsData", JSON.stringify(allRestaurants));
                document.body.classList.remove("offline");
            } catch (error) {
                console.error("Error:", error);
                if (!cachedData) restaurantList.innerHTML = "<div class='col-12 text-center'><p>Failed to load. Check connection.</p></div>";
                document.body.classList.add("offline");
            }
        };
    
        const filterRestaurants = searchTerm => {
    const filtered = allRestaurants.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    let output = filtered.length
        ? filtered.map(data => {
            const deliveryTime = data.delivery_time || "N/A";
            const isOpen = data.isOpen !== false;
            return `<div class="list-card" data-id="${data.id}">
    <div class="list-card-image">
        <a href="restaurant.html?id=${data.id}">
            <img alt="${data.name || 'Restaurant'}" src="${data.image || 'img/placeholder.png'}" class="img-fluid item-img" loading="lazy">
            ${isOpen ? '' : '<span class="closed-badge">Closed 🔒</span>'}
        </a>
    </div>
    <div class="list-card-body">
        <h6 class="mb-1"><a href="restaurant.html?id=${data.id}" class="text-white">${data.name || 'Unknown Restaurant'}</a></h6>
        <p class="time"><a href="restaurant.html?id=${data.id}"><span><i class="feather-clock me-1"></i>${Math.max(5, deliveryTime - 15)}-${deliveryTime} mins</span></a></p>
    </div>
</div>`;
        }).join("")
        : "<div class='col-12 text-center'><p>No matching restaurants found.</p></div>";

    requestAnimationFrame(() => {
        restaurantList.innerHTML = output;
        document.querySelectorAll(".list-card-image img").forEach(img => {
            if (img.complete) img.classList.add("loaded");
            else img.onload = () => img.classList.add("loaded");
        });
    });
};

    
        const updateDropdown = searchTerm => {
            const dropdown = document.getElementById("search-dropdown");
            dropdown.innerHTML = "";
            if (!searchTerm) return dropdown.style.display = "none";
    
            const suggestions = allRestaurants.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 5);
            if (suggestions.length) {
                suggestions.forEach(r => {
                    const div = document.createElement("div");
                    div.textContent = r.name;
                    div.onclick = () => {
                        document.getElementById("search-input").value = r.name;
                        filterRestaurants(r.name);
                        dropdown.style.display = "none";
                    };
                    dropdown.appendChild(div);
                });
                dropdown.style.display = "block";
            } else {
                dropdown.style.display = "none";
            }
        };
    
        const debounce = (func, wait) => {
            let timeout;
            return (...args) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => func(...args), wait);
            };
        };
    
        document.addEventListener("DOMContentLoaded", () => {
            loadAllRestaurants();
            const searchInput = document.getElementById("search-input");
            const promoMessages = document.querySelector('.promo-messages');
            const messages = document.querySelectorAll('.promo-messages .message');
            let currentMessage = 0;
            let touchStartX = 0;
            let touchEndX = 0;
    
            const debouncedFilter = debounce(term => {
                updateDropdown(term);
                term ? filterRestaurants(term) : loadAllRestaurants();
                promoMessages.classList.toggle('hidden', !!term);
            }, 300);
    
            searchInput.oninput = e => debouncedFilter(e.target.value.trim());
    
            document.onclick = e => {
                const dropdown = document.getElementById("search-dropdown");
                if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
                    dropdown.style.display = "none";
                }
            };
    
            function showNextMessage() {
                messages[currentMessage].classList.remove('active');
                messages[currentMessage].style.left = '-100%';
                currentMessage = (currentMessage + 1) % messages.length;
                messages[currentMessage].classList.add('active');
                messages[currentMessage].style.left = '100%';
                setTimeout(() => {
                    messages[currentMessage].style.left = '0';
                }, 50);
            }
    
            promoMessages.addEventListener('touchstart', e => {
                touchStartX = e.changedTouches[0].screenX;
                e.stopPropagation();
            });
    
            promoMessages.addEventListener('touchend', e => {
                touchEndX = e.changedTouches[0].screenXnX;
                handleSwipe();
                e.stopPropagation();
            });
    
            promoMessages.addEventListener('mousedown', e => {
                touchStartX = e.screenX;
                promoMessages.addEventListener('mousemove', onMouseMove);
                e.stopPropagation();
            });
    
            document.addEventListener('mouseup', e => {
                if (promoMessages.contains(e.target)) {
                    touchEndX = e.screenX;
                    promoMessages.removeEventListener('mousemove', onMouseMove);
                    handleSwipe();
                }
            });
    
            function onMouseMove(e) {
                touchEndX = e.screenX;
                e.stopPropagation();
            }
    
            function handleSwipe() {
                const swipeDistance = touchStartX - touchEndX;
                if (swipeDistance > 50) {
                    showNextMessage();
                } else if (swipeDistance < -50) {
                    messages[currentMessage].classList.remove('active');
                    messages[currentMessage].style.left = '100%';
                    currentMessage = (currentMessage - 1 + messages.length) % messages.length;
                    messages[currentMessage].classList.add('active');
                    messages[currentMessage].style.left = '-100%';
                    setTimeout(() => {
                        messages[currentMessage].style.left = '0';
                    }, 50);
                }
            }
    
            messages[currentMessage].classList.add('active');
            messages[currentMessage].style.left = '0';
            setInterval(showNextMessage, 3800);
        });
    
        window.ononline = () => {
            document.body.classList.remove("offline");
            loadAllRestaurants();
        };
        window.onoffline = () => {
            const cachedData = localStorage.getItem("allRestaurantsIndex");
            if (cachedData) {
                restaurantList.innerHTML = cachedData;
                allRestaurants = JSON.parse(localStorage.getItem("allRestaurantsData") || "[]");
            }
            document.body.classList.add("offline");
        };
    