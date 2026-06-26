// ============================================================
// store.js — Carrito E&D (localStorage)
// Compartido por index.html (cajón lateral) y checkout.html.
// Los precios mostrados aquí deben coincidir con api/checkout.js
// (el servidor siempre recalcula el monto real al pagar).
// ============================================================

const EYD_PRODUCTS = {
  femme: {
    id: "femme",
    name: "E&D Femme",
    line: "Edición · 60 gomitas",
    price: 120000,
    image: "img/femme.png",
  },
  homme: {
    id: "homme",
    name: "E&D Homme",
    line: "Edición · 60 gomitas",
    price: 120000,
    image: "img/homme.png",
  },
};

const EYD_CART_KEY = "eyd_cart";

function eydGetCart() {
  try {
    return JSON.parse(localStorage.getItem(EYD_CART_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function eydSaveCart(cart) {
  localStorage.setItem(EYD_CART_KEY, JSON.stringify(cart));
  eydRenderCart();
}

function addToCart(productId, qty = 1) {
  if (!EYD_PRODUCTS[productId]) return;
  const cart = eydGetCart();
  const existing = cart.find((i) => i.id === productId);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id: productId, qty });
  }
  eydSaveCart(cart);
  openCart();
}

function updateQty(productId, delta) {
  const cart = eydGetCart();
  const item = cart.find((i) => i.id === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) return removeFromCart(productId);
  eydSaveCart(cart);
}

function removeFromCart(productId) {
  eydSaveCart(eydGetCart().filter((i) => i.id !== productId));
}

function eydCartCount() {
  return eydGetCart().reduce((sum, i) => sum + i.qty, 0);
}

function eydSubtotal() {
  return eydGetCart().reduce((sum, i) => {
    const p = EYD_PRODUCTS[i.id];
    return p ? sum + p.price * i.qty : sum;
  }, 0);
}

function eydFormatCOP(value) {
  return "$" + (value || 0).toLocaleString("es-CO");
}

// ── Cajón lateral (solo existe en index.html) ──
function openCart() {
  const o = document.getElementById("cartOverlay");
  const d = document.getElementById("cartDrawer");
  if (!o || !d) return;
  o.classList.add("open");
  d.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeCart() {
  const o = document.getElementById("cartOverlay");
  const d = document.getElementById("cartDrawer");
  if (!o || !d) return;
  o.classList.remove("open");
  d.classList.remove("open");
  document.body.style.overflow = "";
}

function eydRenderCart() {
  // Actualiza todos los contadores del carrito en la página.
  const count = eydCartCount();
  document.querySelectorAll(".cart-count").forEach((el) => {
    el.textContent = count;
    el.style.display = count > 0 ? "" : "none";
  });

  const itemsEl = document.getElementById("cartItems");
  if (!itemsEl) return; // estamos en una página sin cajón (p.ej. checkout)

  const footerEl = document.getElementById("cartFooter");
  const cart = eydGetCart();

  if (cart.length === 0) {
    itemsEl.innerHTML =
      '<div class="cart-empty" data-i18n="cart_empty">Tu carrito está vacío.</div>';
    if (footerEl) footerEl.style.display = "none";
    if (typeof applyLang === "function") applyLang(document.documentElement.lang || "es");
    return;
  }
  if (footerEl) footerEl.style.display = "block";

  itemsEl.innerHTML = cart
    .map((item) => {
      const p = EYD_PRODUCTS[item.id];
      if (!p) return "";
      return `
        <div class="cart-item">
          <img src="${p.image}" alt="${p.name}" />
          <div class="cart-item-info">
            <div class="ci-name">${p.name}</div>
            <div class="ci-line">${p.line}</div>
            <div class="ci-qty">
              <button onclick="updateQty('${p.id}', -1)" aria-label="Restar">−</button>
              <span>${item.qty}</span>
              <button onclick="updateQty('${p.id}', 1)" aria-label="Sumar">+</button>
            </div>
            <button class="ci-remove" onclick="removeFromCart('${p.id}')">Eliminar</button>
          </div>
          <div class="ci-price">${eydFormatCOP(p.price * item.qty)}</div>
        </div>`;
    })
    .join("");

  const subEl = document.getElementById("cartSubtotalAmount");
  if (subEl) subEl.textContent = eydFormatCOP(eydSubtotal());
}

document.addEventListener("DOMContentLoaded", eydRenderCart);
