document.getElementById("checkout-form").addEventListener("submit", function(e) {
  e.preventDefault();

  const fullname = document.getElementById("fullname").value.trim();
  const address = document.getElementById("address").value.trim();
  const paymentMethod = document.getElementById("payment-method").value;

  if (!fullname || !address) {
    alert("Please fill in all required fields.");
    return;
  }

  // Save order info (optional for now)
  const orderInfo = {
    fullname,
    address,
    paymentMethod,
    cart: JSON.parse(localStorage.getItem("cart")) || [],
    total: localStorage.getItem("cartTotal") || 0
  };

  localStorage.setItem("lastOrder", JSON.stringify(orderInfo));

  // Redirect to Thank You page
  window.location.href = "thankyou.html";
});
