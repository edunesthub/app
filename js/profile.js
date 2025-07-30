import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

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

const elements = {
  userName: document.getElementById("user-name"),
  userEmail: document.getElementById("user-email"),
  userId: document.getElementById("user-id"),
  logoutBtn: document.getElementById("logout-btn"),
  forceUpdateBtn: document.getElementById("force-update-btn")
};

const CACHE_KEY = "user-profile-cache";
const CACHE_DURATION = 5 * 60 * 1000;

const loadUserProfileFast = (user) => {
  const cachedData = localStorage.getItem(`${CACHE_KEY}-${user.uid}`);
  const cacheTimestamp = localStorage.getItem(`${CACHE_KEY}-${user.uid}-timestamp`);
  const isCacheValid = cacheTimestamp && (Date.now() - parseInt(cacheTimestamp)) < CACHE_DURATION;

  if (cachedData && isCacheValid) {
    const { name, email, userId } = JSON.parse(cachedData);
    elements.userName.textContent = name;
    elements.userEmail.textContent = email;
    elements.userId.textContent = `ID: ${userId}`;
  } else {
    elements.userName.textContent = user.email.split("@")[0];
    elements.userEmail.textContent = user.email;
    elements.userId.textContent = "ID: Loading...";
  }

  updateProfileFromFirestore(user);
};

const updateProfileFromFirestore = async (user) => {
  try {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.exists() ? userDoc.data() : { name: user.email.split("@")[0] };
    const profileData = { name: userData.name, email: user.email, userId: userData.userId || "N/A" };

    elements.userName.textContent = profileData.name;
    elements.userEmail.textContent = profileData.email;
    elements.userId.textContent = `ID: ${profileData.userId}`;

    localStorage.setItem(`${CACHE_KEY}-${user.uid}`, JSON.stringify(profileData));
    localStorage.setItem(`${CACHE_KEY}-${user.uid}-timestamp`, Date.now().toString());
  } catch (e) {
    console.error("Failed to fetch profile:", e);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const cachedUser = localStorage.getItem('current-user');
  if (cachedUser) {
    const user = JSON.parse(cachedUser);
    loadUserProfileFast(user);
  }
});

// 🔁 Update App button now just redirects to update.html
elements.forceUpdateBtn.onclick = () => {
  window.location.href = "/update.html";
};

elements.logoutBtn.onclick = () => {
  signOut(auth).then(() => {
    localStorage.removeItem(`${CACHE_KEY}-${auth.currentUser?.uid}`);
    localStorage.removeItem('current-user');
    window.location.href = "welcome.html";
  }).catch((error) => {
    console.error("Logout failed:", error);
  });
};
