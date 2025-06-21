
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

    window.addEventListener("load", () => {
      if (!navigator.onLine) {
        document.getElementById("loader").style.display = "block";
        document.getElementById("offline-msg").style.display = "block";
        return;
      }

      onAuthStateChanged(auth, (user) => {
        window.location.replace(user ? "/index.html" : "/login.html");
      });
    });

    window.addEventListener("online", () => window.location.reload());
  