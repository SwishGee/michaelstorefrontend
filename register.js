// register.js — resilient registration (localStorage demo auth)
(function () {
  document.addEventListener("DOMContentLoaded", () => {
    const form =
      document.getElementById("register-form") ||
      document.getElementById("registerForm");

    if (!form) {
      console.warn("[register.js] Register form not found.");
      return;
    }

    const nameInput =
      document.getElementById("name") ||
      document.getElementById("registerName") ||
      form.querySelector('input[name="name"]');

    const emailInput =
      document.getElementById("email") ||
      document.getElementById("registerEmail") ||
      form.querySelector('input[type="email"]');

    const passwordInput =
      document.getElementById("password") ||
      document.getElementById("registerPassword") ||
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

      const name = (nameInput?.value || "").trim();
      const email = (emailInput?.value || "").trim().toLowerCase();
      const password = (passwordInput?.value || "").trim();

      if (!name || !email || !password) {
        alert("Please fill in name, email and password.");
        return;
      }

      if (!/^\S+@\S+\.\S+$/.test(email)) {
        alert("Please enter a valid email.");
        return;
      }

      if (password.length < 6) {
        alert("Password should be at least 6 characters.");
        return;
      }

      const users = safeParse("users", []);
      const exists = users.some((u) => u.email?.toLowerCase() === email);

      if (exists) {
        alert("A user with this email already exists. Try logging in.");
        window.location.href = "login.html";
        return;
      }

      const newUser = { name, email, password };
      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));

      alert("Registration successful! Please log in.");
      window.location.href = "login.html";
    });
  });
})();
