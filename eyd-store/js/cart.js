// ============================================
// CARRITO — E&D Energía y Bienestar
// Carrito guardado en localStorage del navegador.
// ============================================

const CART_KEY = "eyd_cart";

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  renderCart();
}

function addToCart(productId, qty = 1) {
  const cart = getCart();
  const existing = cart.find((i) => i.id === productId);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id: productId, qty });
  }
  saveCart(cart);
  openCart();
}

function updateQty(productId, delta) {
  const cart = getCart();
  const item = cart.find((i) => i.id === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    return removeFromCart(productId);
  }
  saveCart(cart);
}

function removeFromCart(productId) {
  const cart = getCart().filter((i) => i.id !== productId);
  saveCart(cart);
}

function cartCount() {
  return getCart().reduce((sum, i) => sum + i.qty, 0);
}

function cartSubtotal() {
  return getCart().reduce((sum, i) => {
    const p = PRODUCTS[i.id];
    return p ? sum + p.price * i.qty : sum;
  }, 0);
}

function formatCOP(value) {
  return "$" + value.toLocaleString("es-CO");
}

function openCart() {
  document.getElementById("cartOverlay").classList.add("open");
  document.getElementById("cartDrawer").classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeCart() {
  document.getElementById("cartOverlay").classList.remove("open");
  document.getElementById("cartDrawer").classList.remove("open");
  document.body.style.overflow = "";
}

function renderCart() {
  const countEls = document.querySelectorAll(".cart-count");
  countEls.forEach((el) => (el.textContent = cartCount()));

  const itemsEl = document.getElementById("cartItems");
  const footerEl = document.getElementById("cartFooter");
  if (!itemsEl) return;

  const cart = getCart();

  if (cart.length === 0) {
    itemsEl.innerHTML = `<div class="cart-empty">Tu carrito está vacío.<br><br><a href="catalogo.html" class="btn btn-outline">Ver catálogo</a></div>`;
    if (footerEl) footerEl.style.display = "none";
    return;
  }

  if (footerEl) footerEl.style.display = "block";

  itemsEl.innerHTML = cart
    .map((item) => {
      const p = PRODUCTS[item.id];
      if (!p) return "";
      return `
        <div class="cart-item">
          <img src="${p.image}" alt="${p.name}">
          <div class="cart-item-info">
            <div class="name">${p.name}</div>
            <div class="line">${p.line}</div>
            <div class="qty-control">
              <button onclick="updateQty('${p.id}', -1)" aria-label="Restar">−</button>
              <span>${item.qty}</span>
              <button onclick="updateQty('${p.id}', 1)" aria-label="Sumar">+</button>
            </div>
            <div class="remove-link" onclick="removeFromCart('${p.id}')" role="button">Eliminar</div>
          </div>
          <div class="price">${formatCOP(p.price * item.qty)}</div>
        </div>
      `;
    })
    .join("");

  const subtotalEl = document.getElementById("cartSubtotalAmount");
  if (subtotalEl) subtotalEl.textContent = formatCOP(cartSubtotal());
}

async function goToCheckout() {
  const cart = getCart();
  if (cart.length === 0) return;

  const btn = document.getElementById("checkoutBtn");
  const originalText = btn.textContent;
  btn.textContent = "Procesando...";
  btn.disabled = true;

  try {
    const items = cart.map((i) => {
      const p = PRODUCTS[i.id];
      return { id: p.id, name: p.name, price: p.price, qty: i.qty };
    });

    const res = await fetch("/api/create-preference", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });

    if (!res.ok) throw new Error("No se pudo crear la preferencia de pago");

    const data = await res.json();
    if (data.init_point) {
      window.location.href = data.init_point;
    } else {
      throw new Error("Respuesta sin init_point");
    }
  } catch (err) {
    console.error(err);
    alert("Hubo un problema iniciando el pago. Intenta de nuevo en unos segundos.");
    btn.textContent = originalText;
    btn.disabled = false;
  }
}

document.addEventListener("DOMContentLoaded", renderCart);
