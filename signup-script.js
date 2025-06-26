
        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
        import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
        import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

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

        const signupForm = document.getElementById("signup-form");
        const notification = document.getElementById("notification");
        const notificationMessage = document.getElementById("notification-message");
        const submitButton = signupForm.querySelector("button[type='submit']");
        const buttonText = submitButton.querySelector(".button-text");
        const togglePassword = document.getElementById("toggle-password");
        const toggleConfirmPassword = document.getElementById("toggle-confirm-password");
        const passwordInput = document.getElementById("password");
        const confirmPasswordInput = document.getElementById("confirm-password");
        const nextButton = document.getElementById("next-button");
        const step1 = document.getElementById("step-1");
        const step2 = document.getElementById("step-2");

      

        toggleConfirmPassword.addEventListener("click", () => {
            const type = confirmPasswordInput.getAttribute("type") === "password" ? "text" : "password";
            confirmPasswordInput.setAttribute("type", type);
            toggleConfirmPassword.innerHTML = type === "password" ? '<i class="feather-eye"></i>' : '<i class="feather-eye-off"></i>';
        });

        function showNotification(message, type = "success") {
            notification.classList.remove("show", "error", "success", "warning");
            notificationMessage.textContent = message;
            notification.className = `notification ${type}`;
            const icon = type === "error" ? "alert-circle" : 
                        type === "warning" ? "alert-triangle" : "check-circle";
            notification.innerHTML = `<i class="feather-${icon}"></i><span id="notification-message">${message}</span>`;
            notification.offsetHeight;
            notification.classList.add("show");
            setTimeout(() => {
                notification.classList.remove("show");
            }, 3000);
        }

        function setLoading(isLoading) {
            submitButton.classList.toggle("loading", isLoading);
            buttonText.textContent = isLoading ? "Creating account..." : "Done";
        }

        // Validate email format
        function isValidEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        }

        // Validate phone number format
        function isValidPhone(phone) {
            return /^[0-9]{10,15}$/.test(phone.replace(/\D/g, ''));
        }

        // Generate a 5-character userId
        function generateUserId() {
            const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            let userId = "";
            for (let i = 0; i < 5; i++) {
                userId += characters.charAt(Math.floor(Math.random() * characters.length));
            }
            return userId;
        }

        // Handle Next button click
        nextButton.addEventListener("click", () => {
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();
            const confirmPassword = document.getElementById("confirm-password").value.trim();

            // Validate step 1 inputs
            if (!email || !password || !confirmPassword) {
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

            if (password !== confirmPassword) {
                showNotification("Passwords do not match", "error");
                return;
            }

            // Switch to step 2
            step1.classList.remove("active");
            step2.classList.add("active");
            document.getElementById("name").focus();
        });

        signupForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const name = document.getElementById("name").value.trim();
            const phone = document.getElementById("phone").value.trim();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();

            // Validate step 2 inputs
            if (!name || !phone) {
                showNotification("Please fill in all fields", "error");
                return;
            }

            if (!isValidPhone(phone)) {
                showNotification("Please enter a valid phone number", "error");
                return;
            }

            setLoading(true);

            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                const userId = generateUserId();
                
                await setDoc(doc(db, "users", user.uid), {
                    name: name,
                    phone: phone,
                    email: email,
                    userId: userId,
                    createdAt: new Date().toISOString()
                });

                showNotification("Account created successfully! Redirecting...", "success");
                
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("userEmail", email);
                
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 1000);
            } catch (error) {
                setLoading(false);
                let errorMessage = "An error occurred during signup";
                
                switch (error.code) {
                    case "auth/email-already-in-use":
                        errorMessage = "This email is already registered";
                        break;
                    case "auth/invalid-email":
                        errorMessage = "Invalid email address";
                        break;
                    case "auth/weak-password":
                        errorMessage = "Password is too weak";
                        break;
                    case "auth/network-request-failed":
                        errorMessage = "Network error. Please check your connection";
                        break;
                }
                
                showNotification(errorMessage, "error");
            }
        });

        // Auto-focus email input on page load
        document.getElementById("email").focus();
    