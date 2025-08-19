// ===== Michael’s Tech Hub – Frontend Logic =====
const API_BASE = "http://localhost:5000";

// ---- Helpers
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const fmt = (n) => `$${Number(n).toFixed(2)}`;

function getToken(){ return localStorage.getItem("token"); }
function setToken(t){ localStorage.setItem("token", t); }
function clearToken(){ localStorage.removeItem("token"); }

function getCart(){ return JSON.parse(localStorage.getItem("cart")||"[]"); }
function setCart(items){ localStorage.setItem("cart", JSON.stringify(items)); }
function addToCart(product){
  const cart = getCart();
  const found = cart.find(i => i.id === product.id);
  if(found){ found.qty += 1; } else { cart.push({...product, qty:1}); }
  setCart(cart);
  alert(`Added "${product.name}" to cart.`);
}

async function api(path, opts = {}){
  const headers = {"Content-Type":"application/json", ...(opts.headers||{})};
  const token = getToken();
  if(token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, {...opts, headers});
  if(!res.ok){
    const msg = await res.text();
    throw new Error(msg || `Request failed: ${res.status}`);
  }
  const contentType = res.headers.get("content-type") || "";
  return contentType.includes("application/json") ? res.json() : res.text();
}

// ---- Page Routers
async function initIndex(){
  // Featured products = first 4 from /api/products
  const list = await api("/api/products").catch(()=>[]);
  const featured = list.slice(0,4);
  const wrap = $("#featured");
  if(!wrap) return;
  if(featured.length === 0){
    wrap.innerHTML = `<div class="empty">No products yet. Add some via POST /api/products.</div>`;
    return;
  }
  wrap.innerHTML = featured.map(p => cardHTML(p,true)).join("");
  // Bind add-to-cart buttons
  $$(".add-btn", wrap).forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = btn.dataset.id;
      const product = featured.find(p=>p.id===id);
      addToCart(product);
    });
  });
}

async function initShop(){
  const list = await api("/api/products").catch(()=>[]);
  const wrap = $("#shopGrid");
  if(!wrap) return;
  if(list.length === 0){
    wrap.innerHTML = `<div class="empty">No products yet. Add some via POST /api/products.</div>`;
    return;
  }
  wrap.innerHTML = list.map(p => cardHTML(p,true)).join("");
  $$(".add-btn", wrap).forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = btn.dataset.id;
      const product = list.find(p=>p.id===id);
      addToCart(product);
    });
  });
}

function initCart(){
  const body = $("#cartBody");
  const totalEl = $("#cartTotal");
  const checkoutBtn = $("#checkoutBtn");
  if(!body || !totalEl) return;
  renderCart();

  function renderCart(){
    const items = getCart();
    if(items.length === 0){
      body.innerHTML = `<tr><td colspan="5"><div class="empty">Your cart is empty.</div></td></tr>`;
      totalEl.textContent = fmt(0);
      return;
    }
    body.innerHTML = items.map(i=>`
      <tr>
        <td>${i.name}</td>
        <td>${fmt(i.price)}</td>
        <td>
          <button class="btn" data-qty="-1" data-id="${i.id}">-</button>
          <span class="kbd">${i.qty}</span>
          <button class="btn" data-qty="1" data-id="${i.id}">+</button>
        </td>
        <td>${fmt(i.qty * i.price)}</td>
        <td><button class="btn danger" data-remove="${i.id}">Remove</button></td>
      </tr>
    `).join("");
    const total = items.reduce((s,i)=>s + i.qty*i.price, 0);
    totalEl.textContent = fmt(total);

    // qty handlers
    $$("button[data-qty]", body).forEach(b=>{
      b.onclick = ()=>{
        const items = getCart();
        const it = items.find(x=>x.id===b.dataset.id);
        it.qty += Number(b.dataset.qty);
        if(it.qty <= 0) setCart(items.filter(x=>x.id!==it.id));
        else setCart(items);
        renderCart();
      };
    });
    // remove
    $$("button[data-remove]", body).forEach(b=>{
      b.onclick = ()=>{
        const items = getCart().filter(x=>x.id!==b.dataset.remove);
        setCart(items); renderCart();
      };
    });
  }

  if(checkoutBtn){
    checkoutBtn.onclick = async ()=>{
      const token = getToken();
      if(!token){
        alert("Please login first.");
        location.href = "login.html";
        return;
      }
      const items = getCart();
      if(items.length === 0){ alert("Cart is empty."); return; }
      const total = items.reduce((s,i)=>s + i.qty*i.price, 0);
      try{
        const order = await api("/api/orders", {
          method:"POST",
          body: JSON.stringify({
            items: items.map(i=>({id:i.id,name:i.name,price:i.price,qty:i.qty})),
            total
          })
        });
        alert("Order placed successfully!");
        setCart([]);
        location.href = "dashboard.html";
      }catch(e){
        alert("Checkout failed: " + e.message);
      }
    };
  }
}

function initAuth(){
  // Register
  const regForm = $("#registerForm");
  if(regForm){
    regForm.addEventListener("submit", async (e)=>{
      e.preventDefault();
      const name = $("#registerName").value.trim();
      const email = $("#registerEmail").value.trim();
      const password = $("#registerPassword").value;
      try{
        await api("/api/auth/register", {
          method:"POST",
          body: JSON.stringify({name,email,password})
        });
        alert("Registration successful. Please login.");
        location.href = "login.html";
      }catch(err){
        alert("Register failed: " + err.message);
      }
    });
  }

  // Login
  const loginForm = $("#loginForm");
  if(loginForm){
    loginForm.addEventListener("submit", async (e)=>{
      e.preventDefault();
      const email = $("#loginEmail").value.trim();
      const password = $("#loginPassword").value;
      try{
        const data = await api("/api/auth/login", {
          method:"POST",
          body: JSON.stringify({email,password})
        });
        setToken(data.token);
        location.href = "dashboard.html";
      }catch(err){
        alert("Login failed: " + err.message);
      }
    });
  }
}

async function initDashboard(){
  const token = getToken();
  if(!token){ location.href = "login.html"; return; }
  $("#logoutBtn")?.addEventListener("click", ()=>{
    clearToken();
    location.href = "login.html";
  });

  const welcome = $("#welcomeMsg");
  const tbody = $("#ordersBody");
  if(!welcome || !tbody) return;

  try{
    const orders = await api("/api/orders");
    welcome.textContent = "Welcome to your dashboard!";
    if(orders.length === 0){
      tbody.innerHTML = `<tr><td colspan="4"><div class="empty">No orders yet.</div></td></tr>`;
    }else{
      tbody.innerHTML = orders.map(o=>`
        <tr>
          <td><span class="badge">#${o.id.slice(-6)}</span></td>
          <td>${new Date(o.date).toLocaleString()}</td>
          <td>${o.items.map(i=>`${i.name} × ${i.qty}`).join(", ")}</td>
          <td>${fmt(o.total)}</td>
        </tr>
      `).join("");
    }
  }catch(e){
    alert("Failed to load orders: " + e.message);
  }
}

// ---- UI snippets
function cardHTML(p, withBtn=false){
  return `
    <div class="card">
      <img src="${p.image || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1200&auto=format&fit=crop'}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p>${fmt(p.price)}</p>
      ${withBtn ? `<button class="btn add-btn" data-id="${p.id}">Add to cart</button>` : ""}
    </div>
  `;
}

// ---- Boot per page
document.addEventListener("DOMContentLoaded", ()=>{
  const page = document.body.dataset.page;
  if(page==="index") initIndex();
  if(page==="shop") initShop();
  if(page==="cart") initCart();
  if(page==="auth") initAuth();
  if(page==="dashboard") initDashboard();
});
