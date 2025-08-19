// shop.js

const productList = document.getElementById("product-list");

// Load cart (only store product IDs + quantities)
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Render all products from products.js
function renderProducts() {
  products.forEach(product => {
    const div = document.createElement("div");
    div.className = "product-card";

    div.innerHTML = `
      <img src="${product.image}" alt="${product.name}" width="200">
      <h3>${product.name}</h3>
      <p>$${product.price}</p>
      <button class="btn primary" onclick="addToCart(${product.id})">Add to Cart</button>
    `;

    productList.appendChild(div);
  });
}

// Add to cart (only id + quantity saved)
function addToCart(id) {
  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id, quantity: 1 });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  alert("Item added to cart!");
}

// Run on page load
renderProducts();
