
        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

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

const loginForm = document.getElementById("login-form");
const notification = document.getElementById("notification");
const notificationMessage = document.getElementById("notification-message");
const submitButton = loginForm.querySelector("button[type='submit']");
const buttonText = submitButton.querySelector(".button-text");
const togglePassword = document.getElementById("toggle-password");
const passwordInput = document.getElementById("password");

// Check auth state immediately to prevent logged-in users from accessing login page
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Redirect to index.html if user is already logged in
        if (!window.location.pathname.includes("index.html")) {
            window.location.href = "index.html";
        }
    }
});

// Password visibility toggle
togglePassword.addEventListener("click", () => {
    const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);
    togglePassword.innerHTML = type === "password" ? '<i class="feather-eye"></i>' : '<i class="feather-eye-off"></i>';
});

function showNotification(message, type = "success") {
    // Remove any existing notifications first
    notification.classList.remove("show", "error", "success", "warning");
    
    // Update notification content and style
    notificationMessage.textContent = message;
    notification.className = `notification ${type}`;
    
    // Add appropriate icon
    const icon = type === "error" ? "alert-circle" : 
                type === "warning" ? "alert-triangle" : "check-circle";
    notification.innerHTML = `<i class="feather-${icon}"></i><span id="notification-message">${message}</span>`;
    
    // Force a reflow
    notification.offsetHeight;
    
    // Show notification
    notification.classList.add("show");
    
    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove("show");
    }, 3000);
}

function setLoading(isLoading) {
    submitButton.classList.toggle("loading", isLoading);
    buttonText.textContent = isLoading ? "Logging in..." : "Login";
}

// Validate email format
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    // Validate inputs
    if (!email || !password) {
        showNotification("Please fill in all fields", "error");
        return;
    }

    if (!isValidEmail(email)) {
        showNotification("Please enter a valid email address", "error");
        return;
    }

    if (password.length < 6) {
        showNotification("Password must be at least 6 characters", "error");
        return;
    }

    setLoading(true);

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        showNotification("Login successful! Redirecting...", "success");
        
        // Store login state
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userEmail", email);
        
        // Redirect after a short delay
        setTimeout(() => {
            window.location.href = "index.html";
        }, 1000);
    } catch (error) {
        setLoading(false);
        let errorMessage = "An error occurred during login";
        
        switch (error.code) {
            case "auth/user-not-found":
                errorMessage = "No account found with this email";
                break;
            case "auth/wrong-password":
                errorMessage = "Incorrect password";
                break;
            case "auth/too-many-requests":
                errorMessage = "Too many failed attempts. Please try again later";
                break;
            case "auth/network-request-failed":
                errorMessage = "Network error. Please check your connection";
                break;
            case "auth/invalid-email":
                errorMessage = "Invalid email address";
                break;
            case "auth/invalid-credential":
                errorMessage = "Invalid email or password";
                break;
        }
        
        showNotification(errorMessage, "error");
        
        // Clear password field on error
        passwordInput.value = "";
        passwordInput.focus();
    }
});

// Auto-focus email input on page load
document.getElementById("email").focus();
        