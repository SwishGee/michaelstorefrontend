// login.js — resilient login handler (localStorage demo auth)
(function () {
  document.addEventListener("DOMContentLoaded", () => {
    const form =
      document.getElementById("login-form") ||
      document.getElementById("loginForm");

    if (!form) {
      console.warn("[login.js] Login form not found.");
      return;
    }

    const emailInput =
      document.getElementById("email") ||
      document.getElementById("loginEmail") ||
      form.querySelector('input[type="email"]');

    const passwordInput =
      document.getElementById("password") ||
      document.getElementById("loginPassword") ||
      form.querySelector('input[type="password"]');

    const safeParse = (key, fallback) => {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch {
        return fallback;
      }
    };

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = (emailInput?.value || "").trim().toLowerCase();
      const password = (passwordInput?.value || "").trim();

      if (!email || !password) {
        alert("Please enter both email and password.");
        return;
      }

      const users = safeParse("users", []);

      const user = users.find(
        (u) => u.email?.toLowerCase() === email && u.password === password
      );

      if (!user) {
        alert("Invalid email or password.");
        return;
      }

      localStorage.setItem("loggedInUser", JSON.stringify(user));
      alert("Welcome back! Redirecting to the shop…");
      window.location.href = "shop.html";
    });
  });
})();
