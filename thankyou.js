function generateOrderID() {
  const date = new Date();
  const dateStr = date.toISOString().slice(0,10).replace(/-/g, "");
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ORD-${dateStr}-${randomStr}`;
}

let orderId;
let order;

window.addEventListener("DOMContentLoaded", () => {
  order = JSON.parse(localStorage.getItem("lastOrder"));

  if (!order) {
    document.getElementById("order-summary").innerHTML = "<p>No order found.</p>";
    return;
  }

  // Generate Order ID
  orderId = generateOrderID();
  document.getElementById("order-id").textContent = `Order ID: ${orderId}`;

  // Customer Info
  document.getElementById("customer-info").textContent = 
    `Customer: ${order.fullname}, Address: ${order.address}, Payment: ${order.paymentMethod}`;

  // Items
  const itemsList = document.getElementById("order-items");
  itemsList.innerHTML = "";
  order.cart.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.name} - $${item.price} x ${item.quantity}`;
    itemsList.appendChild(li);
  });

  // Total
  document.getElementById("order-total").textContent = `Total: $${order.total}`;

  // Clear cart after checkout
  localStorage.removeItem("cart");
  localStorage.removeItem("cartTotal");

  // Continue shopping
  document.getElementById("continue-shopping").addEventListener("click", () => {
    window.location.href = "shop.html";
  });

  // Download Receipt
  document.getElementById("download-receipt").addEventListener("click", () => {
    generateReceiptPDF();
  });
});

// ✅ Generate PDF Receipt with Embedded Logo
function generateReceiptPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // ✅ Base64 Placeholder Logo (black shopping cart icon)
  const base64Logo = 
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAAP1BMVEUAAAD///////////////////////////////////////////////////////////////////////////////////////////////////9BRKBeAAAADHRSTlMAEBAQICAQFBQYGBwcHB4a7R6jAAAApklEQVR42u3WwQ2AIBAFUEMozv7/fx8rFJCFYIky3+94r1YMQfVddRR1gBHIjA8kQxkDdOZr2AOQQs9E0A4Sx6ugEgPDMYgBK0QAIrAAJYwAZjABOsABGcAAK5AAP8chdtkH6DYQX3DZoZllkgQUzzLrW9V3ZEVs7cVZqzGls09YML0m2TeuYOfng/xwaJsgMmnMzhfxPljL2AQKsFOHQAAAAASUVORK5CYII=";

  // Logo
  doc.addImage(base64Logo, "PNG", 80, 10, 50, 30);

  // Header
  doc.setFontSize(18);
  doc.text("Mike's Tech Store - Receipt", 20, 55);

  doc.setFontSize(12);
  doc.text(`Order ID: ${orderId}`, 20, 70);
  doc.text(`Customer: ${order.fullname}`, 20, 80);
  doc.text(`Address: ${order.address}`, 20, 90);
  doc.text(`Payment: ${order.paymentMethod}`, 20, 100);

  // Table for items
  const itemData = order.cart.map(item => [
    item.name,
    `$${item.price}`,
    item.quantity,
    `$${(item.price * item.quantity).toFixed(2)}`
  ]);

  doc.autoTable({
    head: [["Item", "Price", "Qty", "Subtotal"]],
    body: itemData,
    startY: 110,
  });

  // Total
  let finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(14);
  doc.text(`Total: $${order.total}`, 20, finalY);

  // Footer
  doc.setFontSize(10);
  doc.text("Thank you for shopping with Mike's Tech Store!", 20, finalY + 20);
  doc.text("© 2025 Mike's Tech Store", 20, finalY + 30);

  doc.save(`${orderId}_receipt.pdf`);
}
