async function fetchTrendingRestaurants() {
  const trendingList = document.getElementById("trending-list");

  // Show skeleton UI after 500ms
  let skeletonTimeout = setTimeout(() => {
    if (trendingList.children.length === 0) {
      renderSkeletonCards(trendingList);
    }
  }, 500);

  const cachedRestaurants = localStorage.getItem("trending-restaurants-cache");
  if (cachedRestaurants) {
    renderRestaurants(JSON.parse(cachedRestaurants), trendingList);
  }

  if (!navigator.onLine) return;

  try {
    const response = await fetch("https://app-chawp.vercel.app/api/firebase");
    const restaurants = await response.json();

    if (!Array.isArray(restaurants) || restaurants.length === 0) {
      trendingList.innerHTML = `
        <div class="text-white text-center py-4">
          <p class="text-lg font-semibold text-red-400">⚠️ Something went wrong</p>
          <p class="text-sm text-gray-300">We couldn’t load restaurants. Please try again later.</p>
        </div>
      `;
      return;
    }

    localStorage.setItem("trending-restaurants-cache", JSON.stringify(restaurants));
    localStorage.setItem("trending-restaurants-cache-time", Date.now());
    renderRestaurants(restaurants, trendingList);
  } catch (err) {
    console.error("❌ Error loading restaurants:", err);
    trendingList.innerHTML = `<div class="text-white">Failed to load restaurants. Please try again.</div>`;
  }
}

function renderSkeletonCards(container) {
  container.innerHTML = '';
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < 4; i++) {
    const card = document.createElement("div");
    card.className = "skeleton-card";
    card.innerHTML = `
      <div class="skeleton-image"></div>
      <div class="skeleton-body">
        <div class="skeleton-text"></div>
        <div class="skeleton-text short"></div>
      </div>
    `;
    fragment.appendChild(card);
  }
  container.appendChild(fragment);
}

function renderRestaurants(restaurants, container) {
  container.innerHTML = '';
  const existingCards = Array.from(container.querySelectorAll(".list-card"));
  const existingIds = new Set(existingCards.map(card => card.dataset.id));
  const newIds = new Set(restaurants.map(r => r.id));

  existingCards.forEach(card => {
    if (!newIds.has(card.dataset.id)) {
      card.classList.add("removing");
      setTimeout(() => card.remove(), 100);
    }
  });

  const fragment = document.createDocumentFragment();

  restaurants.forEach(data => {
    const restaurantId = data.id;
    const deliveryTime = data.delivery_time || "N/A";
    const isOpen = data.isOpen !== false;

    const card = document.createElement("div");
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
        <h6 class="mb-1">
          <a href="restaurant.html?id=${restaurantId}" class="text-white">${data.name || 'Unknown Restaurant'}</a>
        </h6>
        <p class="time">
          <a href="restaurant.html?id=${restaurantId}">
            <span><i class="feather-clock me-1"></i>${Math.max(5, deliveryTime - 15)}-${deliveryTime} mins</span>
          </a>
        </p>
      </div>
    `;

    fragment.appendChild(card);
  });

  container.appendChild(fragment);

  setTimeout(() => {
    container.querySelectorAll(".list-card:not(.loaded):not(.removing)").forEach((card, idx) => {
      setTimeout(() => {
        card.classList.add("loaded");
      }, idx * 100);
    });
  }, 100);
}

document.addEventListener("DOMContentLoaded", () => {
  const trendingList = document.getElementById("trending-list");
  fetchTrendingRestaurants();

  // Optional: display cached results instantly
  const cachedRestaurants = localStorage.getItem("trending-restaurants-cache");
  if (cachedRestaurants) {
    trendingList.innerHTML = '';
    renderRestaurants(JSON.parse(cachedRestaurants), trendingList);
  }

  // Background refresh if stale
  const cacheTime = localStorage.getItem("trending-restaurants-cache-time");
  if (navigator.onLine && (!cacheTime || (Date.now() - cacheTime) > 5 * 60 * 1000)) {
    fetchTrendingRestaurants();
  }
});
