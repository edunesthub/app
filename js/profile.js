
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
            forceUpdateBtn: document.getElementById("force-update-btn"),
            updateNotification: document.getElementById("update-notification")
        };

        const CACHE_KEY = "user-profile-cache";
        const CACHE_DURATION = 5 * 60 * 1000;
        const BROADCAST_CHANNEL_NAME = "pwa-update-channel";

        const broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);

        const loadUserProfileFast = (user) => {
            const cachedData = localStorage.getItem(`${CACHE_KEY}-${user.uid}`);
            const cacheTimestamp = localStorage.getItem(`${CACHE_KEY}-${user.uid}-timestamp`);
            const isCacheValid = cacheTimestamp && (Date.now() - parseInt(cacheTimestamp)) < CACHE_DURATION;

            if (cachedData && isCacheValid) {
                const { name, email, userId } = JSON.parse(cachedData);
                elements.userName.textContent = name;
                elements.userEmail.textContent = email;
                elements.userId.textContent = `ID: ${userId}`;
                elements.userName.classList.add("loaded");
                elements.userEmail.classList.add("loaded");
                elements.userId.classList.add("loaded");
            } else {
                elements.userName.textContent = user.email.split("@")[0];
                elements.userEmail.textContent = user.email;
                elements.userId.textContent = "ID: Loading...";
                elements.userName.classList.add("loaded");
                elements.userEmail.classList.add("loaded");
                elements.userId.classList.add("loaded");
            }

            // Asynchronously update from Firestore
            updateProfileFromFirestore(user);
        };

        const updateProfileFromFirestore = async (user) => {
            try {
                const userDocRef = doc(db, "users", user.uid);
                const userDoc = await getDoc(userDocRef);
                const userData = userDoc.exists() ? userDoc.data() : { name: user.email.split("@")[0] };
                const profileData = { name: userData.name, email: user.email, userId: userData.userId || "N/A" };

                // Update DOM only if data has changed
                if (elements.userName.textContent !== profileData.name ||
                    elements.userEmail.textContent !== profileData.email ||
                    elements.userId.textContent !== `ID: ${profileData.userId}`) {
                    elements.userName.textContent = profileData.name;
                    elements.userEmail.textContent = profileData.email;
                    elements.userId.textContent = `ID: ${profileData.userId}`;
                    elements.userName.classList.add("loaded");
                    elements.userEmail.classList.add("loaded");
                    elements.userId.classList.add("loaded");
                }

                // Cache the fresh data
                localStorage.setItem(`${CACHE_KEY}-${user.uid}`, JSON.stringify(profileData));
                localStorage.setItem(`${CACHE_KEY}-${user.uid}-timestamp`, Date.now().toString());
            } catch (e) {
                console.error("Failed to fetch profile:", e);
            }
        };

        const showNotification = (message, type) => {
            elements.updateNotification.style.display = 'none';
            elements.updateNotification.style.display = 'block';
            elements.updateNotification.style.color = type === 'success' ? '#28a745' : '#dc3545';
            elements.updateNotification.style.fontSize = '0.9rem';
            elements.updateNotification.style.textAlign = 'center';
            elements.updateNotification.textContent = message;
            if (type !== 'success') {
                setTimeout(() => {
                    elements.updateNotification.style.display = 'none';
                }, 3000);
            }
        };

        const performUpdate = async () => {
            try {
                if (!window.isSecureContext) {
                    throw new Error('Service workers require HTTPS or localhost');
                }
                if (!navigator.onLine) {
                    throw new Error('Please connect to the internet');
                }
                showNotification('Starting update...', 'success');

                if ('caches' in window) {
                    const cacheNames = await caches.keys();
                    if (cacheNames.length > 0) {
                        await Promise.all(cacheNames.map(name => caches.delete(name)));
                        showNotification('Caches cleared successfully!', 'success');
                    } else {
                        showNotification('No caches to clear', 'success');
                    }
                } else {
                    showNotification('Cache clearing not supported', 'danger');
                }

                localStorage.setItem('updateStatus', 'success');
                showNotification('Update completed! Reloading...', 'success');
                setTimeout(() => {
                    window.location.reload(true);
                }, 1000);
            } catch (error) {
                console.error('Update failed:', error);
                elements.forceUpdateBtn.innerHTML = 'Update App <i class="feather-refresh-cw"></i>';
                elements.forceUpdateBtn.disabled = false;
                const errorMessage = error.message.includes('secure context')
                    ? 'Updates require HTTPS or localhost'
                    : error.message.includes('internet')
                    ? 'Please connect to the internet'
                    : 'Update failed: ' + error.message;
                showNotification(errorMessage, 'danger');
            }
        };

        elements.forceUpdateBtn.onclick = async () => {
            try {
                elements.forceUpdateBtn.disabled = true;
                elements.forceUpdateBtn.innerHTML = 'Updating... <i class="feather-refresh-cw spin"></i>';
                broadcastChannel.postMessage({ action: 'force-update' });
                await performUpdate();
            } catch (error) {
                console.error('Force update failed:', error);
                elements.forceUpdateBtn.innerHTML = 'Update App <i class="feather-refresh-cw"></i>';
                elements.forceUpdateBtn.disabled = false;
                showNotification('Update failed: ' + error.message, 'danger');
            }
        };

        broadcastChannel.onmessage = (event) => {
            if (event.data.action === 'force-update') {
                elements.forceUpdateBtn.disabled = true;
                elements.forceUpdateBtn.innerHTML = 'Updating... <i class="feather-refresh-cw spin"></i>';
                performUpdate();
            }
        };

        document.addEventListener("DOMContentLoaded", () => {
            const updateStatus = localStorage.getItem('updateStatus');
            if (updateStatus === 'success') {
                elements.forceUpdateBtn.classList.remove('btn-primary');
                elements.forceUpdateBtn.classList.add('btn-success');
                elements.forceUpdateBtn.innerHTML = 'Updated! <i class="feather-check"></i>';
                showNotification('App updated successfully!', 'success');
                setTimeout(() => {
                    elements.forceUpdateBtn.classList.remove('btn-success');
                    elements.forceUpdateBtn.classList.add('btn-primary');
                    elements.forceUpdateBtn.innerHTML = 'Update App <i class="feather-refresh-cw"></i>';
                    elements.forceUpdateBtn.disabled = false;
                }, 2000);
                localStorage.removeItem('updateStatus');
            }

            // Preload user data if available
            const cachedUser = localStorage.getItem('current-user');
            if (cachedUser) {
                const user = JSON.parse(cachedUser);
                loadUserProfileFast(user);
            }
        });

        const style = document.createElement('style');
        style.textContent = `
            .spin {
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            .btn-primary, .btn-success {
                border-radius: 50px;
                font-weight: 600;
                padding: 10px 20px;
                transition: background-color 0.3s ease;
            }
            .btn-primary {
                background: #007bff;
                border: none;
            }
            .btn-primary:hover:not(:disabled) {
                background: #0056b3;
            }
            .btn-success {
                background: #28a745;
                border: none;
            }
        `;
        document.head.appendChild(style);

        elements.logoutBtn.onclick = () => {
            signOut(auth).then(() => {
                localStorage.removeItem(`${CACHE_KEY}-${auth.currentUser?.uid}`);
                localStorage.removeItem('current-user');
                window.location.href = "login.html";
            }).catch((error) => {
                console.error("Logout failed:", error);
            });
        };

        
    