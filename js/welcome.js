
    // Firebase Auto-Skip Logic
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
    import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

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

    onAuthStateChanged(auth, (user) => {
      if (user) {
        window.location.replace("/index.html");
      }
    });

    // Tagline Slider w/ Soft-Life Vibes
    const taglines = [
      "Abi you dey hung?",
      "Look fast and chawp!",
      "Fufu? Fried rice? We got you."
    ];

    const el = document.getElementById("tagline");
    let current = 0;

    setInterval(() => {
      el.classList.add("out");

      setTimeout(() => {
        current = (current + 1) % taglines.length;
        el.textContent = taglines[current];
        el.classList.remove("out");
      }, 400);
    }, 2500);

    // Button Loader Logic
    const loginBtn = document.querySelector('.btn.login');
    const signupBtn = document.querySelector('.btn.signup');

    window.login = function() {
      loginBtn.classList.add('loading');
      loginBtn.innerHTML = '<div class="dots"><span></span><span></span><span></span></div>';
      setTimeout(() => {
        window.location.href = '/login.html';
      }, 500);
    }

    window.signup = function() {
      signupBtn.classList.add('loading');
      signupBtn.innerHTML = '<div class="dots"><span></span><span></span><span></span></div>';
      setTimeout(() => {
        window.location.href = '/signup.html';
      }, 500);
    }

    // Reset button loading state on load or page show
    function resetButtons() {
      loginBtn.classList.remove('loading');
      signupBtn.classList.remove('loading');
      loginBtn.innerHTML = 'Login';
      signupBtn.innerHTML = 'Sign Up';
    }

    window.addEventListener('load', resetButtons);
    window.addEventListener('pageshow', resetButtons);
  