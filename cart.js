// cart.js

const cartItemsContainer = document.getElementById("cart-items");
const cartTotalContainer = document.getElementById("cart-total");

// Load cart (contains only {id, quantity})
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function renderCart() {
  cartItemsContainer.innerHTML = "";
  let total = 0;

  cart.forEach(item => {
    const product = products.find(p => p.id === item.id);
    if (!product) return; // safety check

    const subtotal = product.price * item.quantity;
    total += subtotal;

    const div = document.createElement("div");
    div.className = "cart-item";

    div.innerHTML = `
      <img src="${product.image}" alt="${product.name}" width="80">
      <div>
        <h3>${product.name}</h3>
        <p>$${product.price} × ${item.quantity} = $${subtotal}</p>
        <button class="btn" onclick="removeFromCart(${item.id})">Remove</button>
      </div>
    `;

    cartItemsContainer.appendChild(div);
  });

  cartTotalContainer.textContent = `Total: $${total}`;
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

// Run on page load
renderCart();
