
        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
        import { getAuth, onAuthStateChanged, deleteUser } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
        import { getFirestore, doc, getDoc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

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

        const accountForm = document.getElementById("account-form");
        const emailInput = document.getElementById("email");
        const nameInput = document.getElementById("name");
        const phoneInput = document.getElementById("phone");
        const backBtn = document.getElementById("back-btn");
        const backBtnTop = document.getElementById("back-btn-top");
        const deleteAccountBtn = document.getElementById("delete-account-btn");
        const CACHE_KEY = "user-account-cache";

        // Load account data with caching
        const loadAccountData = async (user) => {
            const cachedData = localStorage.getItem(`${CACHE_KEY}-${user.uid}`);
            if (cachedData) {
                const { email, name, phone } = JSON.parse(cachedData);
                requestAnimationFrame(() => {
                    emailInput.value = email || user.email;
                    nameInput.value = name || "";
                    phoneInput.value = phone || "";
                });
            } else {
                requestAnimationFrame(() => {
                    emailInput.value = user.email;
                    nameInput.value = user.email.split("@")[0];
                    phoneInput.value = "";
                });
                await fetchAndCacheAccountData(user);
            }
        };

        // Fetch from Firestore and cache
        const fetchAndCacheAccountData = async (user) => {
            try {
                const userDocRef = doc(db, "users", user.uid);
                const userDoc = await getDoc(userDocRef);
                const userData = userDoc.exists() ? userDoc.data() : { name: user.email.split("@")[0], phone: "" };
                const accountData = { email: user.email, name: userData.name, phone: userData.phone || "" };
                requestAnimationFrame(() => {
                    emailInput.value = accountData.email;
                    nameInput.value = accountData.name;
                    phoneInput.value = accountData.phone;
                });
                localStorage.setItem(`${CACHE_KEY}-${user.uid}`, JSON.stringify(accountData));
            } catch (error) {
                console.error("Error loading account data:", error);
                alert("Failed to load account data.");
            }
        };

        // Save changes to Firestore
        accountForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const user = auth.currentUser;
            if (!user) return;

            const updatedData = {
                name: nameInput.value,
                phone: phoneInput.value
            };

            try {
                const userDocRef = doc(db, "users", user.uid);
                await setDoc(userDocRef, updatedData, { merge: true });
                const cachedData = JSON.parse(localStorage.getItem(`${CACHE_KEY}-${user.uid}`)) || {};
                localStorage.setItem(`${CACHE_KEY}-${user.uid}`, JSON.stringify({ ...cachedData, ...updatedData }));
                window.location.href = "profile.html";
            } catch (error) {
                console.error("Error updating profile:", error);
                alert(`Error: ${error.message}`);
            }
        });

        // Back to profile (both buttons)
        const goBack = () => window.location.href = "profile.html";
        backBtn.addEventListener("click", goBack);
        backBtnTop.addEventListener("click", goBack);

        // Delete account
        deleteAccountBtn.addEventListener("click", async () => {
            const user = auth.currentUser;
            if (!user) return;

            if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
                try {
                    const userDocRef = doc(db, "users", user.uid);
                    await deleteDoc(userDocRef);
                    await deleteUser(user);
                    localStorage.removeItem(`${CACHE_KEY}-${user.uid}`);
                    window.location.href = "login.html";
                } catch (error) {
                    console.error("Error deleting account:", error);
                    alert(`Error: ${error.message}. You may need to re-authenticate to delete your account.`);
                }
            }
        });

        // Initial load
        document.addEventListener("DOMContentLoaded", () => {
            const user = auth.currentUser;
            if (user) {
                loadAccountData(user);
            } else {
                onAuthStateChanged(auth, (user) => {
                    if (user) loadAccountData(user);
                    else window.location.href = "login.html";
                });
            }
        });
    