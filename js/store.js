// ============================================================
// store.js — Carrito E&D (localStorage) + descuentos
// Compartido por index.html (cajón lateral) y checkout.html.
// Los precios/lógica aquí deben coincidir con api/checkout.js
// (el servidor SIEMPRE recalcula el monto real al pagar).
// ============================================================

const EYD_PRODUCTS = {
  uva: {
    id: "uva",
    name: "E&D Gummies — Uva",
    line: "60 gomitas · 30 porciones",
    price: 89900,
    image: "img/uva.jpg",
  },
  sandia: {
    id: "sandia",
    name: "E&D Gummies — Sandía Limón",
    line: "60 gomitas · 30 porciones",
    price: 89900,
    image: "img/sandia.jpg",
  },
};

const EYD_CART_KEY = "eyd_cart";
const EYD_CODE_KEY = "eyd_code";

// Códigos válidos (case-insensitive). "alejo27" es SECRETO: no se
// muestra ni menciona en la interfaz; su etiqueta visible es genérica.
const EYD_CODES = {
  eyd:     { pct: 0.10, label: "código EYD" },
  alejo27: { pct: 0.50, label: "código especial" },
};
const EYD_QTY_PCT = 0.10; // descuento por llevar pares (2x)

// ── Carrito ──
function eydGetCart() {
  try { return JSON.parse(localStorage.getItem(EYD_CART_KEY)) || []; }
  catch (e) { return []; }
}
function eydSaveCart(cart) {
  localStorage.setItem(EYD_CART_KEY, JSON.stringify(cart));
  eydRenderCart();
}
function addToCart(productId, qty = 1) {
  if (!EYD_PRODUCTS[productId]) return;
  const cart = eydGetCart();
  const existing = cart.find((i) => i.id === productId);
  if (existing) existing.qty += qty;
  else cart.push({ id: productId, qty });
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

// ── Código de descuento ──
function eydGetCode() {
  try { return localStorage.getItem(EYD_CODE_KEY) || ""; } catch (e) { return ""; }
}
function eydSetCode(c) {
  try { if (c) localStorage.setItem(EYD_CODE_KEY, c); else localStorage.removeItem(EYD_CODE_KEY); }
  catch (e) {}
}
function eydCodeInfo() {
  const c = eydGetCode().toLowerCase();
  return EYD_CODES[c] ? Object.assign({ code: c }, EYD_CODES[c]) : null;
}
// Aplica/reemplaza un código. Devuelve {ok, type, msg}.
function eydApplyCode(raw) {
  const c = (raw || "").trim().toLowerCase();
  if (c && EYD_CODES[c]) {
    eydSetCode(c);
    return { ok: true, type: "ok", msg: "¡Código aplicado! " + Math.round(EYD_CODES[c].pct * 100) + "% de descuento" };
  }
  return { ok: false, type: "err", msg: "Código no válido" };
}
function eydClearCode() { eydSetCode(""); }

// ── Totales (subtotal, descuentos, total) ──
// Regla: el código tiene PRIORIDAD. Si hay código, el descuento por
// cantidad (2x) NO se aplica. No se acumulan.
function eydTotals() {
  const subtotal = eydSubtotal();
  const qty = eydCartCount();
  const info = eydCodeInfo();
  let codeDiscount = 0, qtyDiscount = 0;

  if (info) {
    codeDiscount = Math.round(subtotal * info.pct);
  } else if (qty >= 2) {
    const pairedUnits = Math.floor(qty / 2) * 2;       // 3 → 2, 4 → 4
    const avgUnit = qty ? subtotal / qty : 0;
    qtyDiscount = Math.round(avgUnit * pairedUnits * EYD_QTY_PCT);
  }
  const total = Math.max(0, subtotal - codeDiscount - qtyDiscount);
  return {
    subtotal, qty, total,
    codeDiscount, qtyDiscount,
    code: info ? info.code : "",
    codeLabel: info ? info.label : "",
    codePct: info ? info.pct : 0,
  };
}

// Desglose HTML reutilizable (carrito y checkout)
function eydBreakdownHTML() {
  const t = eydTotals();
  let h = '<div class="bd-line"><span>Subtotal</span><span>' + eydFormatCOP(t.subtotal) + "</span></div>";
  if (t.qtyDiscount > 0)
    h += '<div class="bd-line bd-disc"><span>−10% por llevar 2</span><span>−' + eydFormatCOP(t.qtyDiscount) + "</span></div>";
  if (t.codeDiscount > 0)
    h += '<div class="bd-line bd-disc"><span>−' + Math.round(t.codePct * 100) + "% " + t.codeLabel + "</span><span>−" + eydFormatCOP(t.codeDiscount) + "</span></div>";
  h += '<div class="bd-total"><span>Total</span><span>' + eydFormatCOP(t.total) + "</span></div>";
  return h;
}

// ── Cajón lateral (solo en index.html) ──
function openCart() {
  const o = document.getElementById("cartOverlay");
  const d = document.getElementById("cartDrawer");
  if (!o || !d) return;
  o.classList.add("open"); d.classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeCart() {
  const o = document.getElementById("cartOverlay");
  const d = document.getElementById("cartDrawer");
  if (!o || !d) return;
  o.classList.remove("open"); d.classList.remove("open");
  document.body.style.overflow = "";
}

// Aplicar código desde el input del carrito
function applyCartCode() {
  const inp = document.getElementById("cartCodeInput");
  const res = eydApplyCode(inp ? inp.value : "");
  eydRenderCart();
  const msg = document.getElementById("cartCodeMsg");
  if (msg) { msg.textContent = res.msg; msg.className = "cart-code-msg " + res.type; }
  if (res.ok && inp) inp.value = "";
}

function eydRenderCart() {
  const count = eydCartCount();
  document.querySelectorAll(".cart-count").forEach((el) => {
    el.textContent = count;
    el.style.display = count > 0 ? "" : "none";
  });

  const itemsEl = document.getElementById("cartItems");
  if (!itemsEl) return; // página sin cajón (p.ej. checkout)

  const footerEl = document.getElementById("cartFooter");
  const cart = eydGetCart();

  if (cart.length === 0) {
    itemsEl.innerHTML = '<div class="cart-empty" data-i18n="cart_empty">Tu carrito está vacío.</div>';
    if (footerEl) footerEl.style.display = "none";
    if (typeof applyLang === "function") applyLang(document.documentElement.lang || "es");
    return;
  }
  if (footerEl) footerEl.style.display = "block";

  itemsEl.innerHTML = cart.map((item) => {
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
  }).join("");

  // Badge de promoción 2x (solo si no hay código aplicado)
  const promo = document.getElementById("cartPromo");
  if (promo) promo.style.display = eydCodeInfo() ? "none" : "";

  // Desglose de precios
  const bd = document.getElementById("cartBreakdown");
  if (bd) bd.innerHTML = eydBreakdownHTML();

  // Mensaje del código según estado aplicado
  const msgEl = document.getElementById("cartCodeMsg");
  if (msgEl) {
    const info = eydCodeInfo();
    if (info) {
      msgEl.textContent = "¡Código aplicado! " + Math.round(info.pct * 100) + "% de descuento";
      msgEl.className = "cart-code-msg ok";
    } else if (!msgEl.textContent) {
      msgEl.className = "cart-code-msg";
    }
  }
}

document.addEventListener("DOMContentLoaded", eydRenderCart);
