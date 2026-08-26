// ============================================================
// store.js — Carrito E&D (localStorage) + descuentos + i18n
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
  eyd:     { pct: 0.10, labelKey: "code_eyd" },
  alejo27: { pct: 0.50, labelKey: "code_special" },
};
const EYD_QTY_PCT = 0.10;   // descuento por llevar pares (2x)
const EYD_FREESHIP = 140000; // envío gratis desde este total (COP)

// ── i18n para todo el texto dinámico del carrito/checkout ──
const EYD_STRINGS = {
  es: {
    subtotal: "Subtotal", total: "Total",
    qty2: "−10% por llevar 2",
    code_eyd: "código EYD", code_special: "código especial",
    applied: function (p) { return "¡Código aplicado! " + p + "% de descuento"; },
    invalid: "Código no válido",
    promo2: "🎁 ¡Llevá 2 y ahorrá 10%!",
    ship_free: "🚚 ¡Tienes envío gratis!",
    ship_left: function (a) { return "🚚 Te faltan " + a + " para envío gratis"; },
    placeholder: "Código de descuento", apply: "Aplicar",
    empty: "Tu carrito está vacío.",
    line: "60 gomitas · 30 porciones", fl_uva: "Uva", fl_sandia: "Sandía Limón",
  },
  en: {
    subtotal: "Subtotal", total: "Total",
    qty2: "−10% for buying 2",
    code_eyd: "EYD code", code_special: "special code",
    applied: function (p) { return "Code applied! " + p + "% off"; },
    invalid: "Invalid code",
    promo2: "🎁 Buy 2 and save 10%!",
    ship_free: "🚚 You've got free shipping!",
    ship_left: function (a) { return "🚚 " + a + " away from free shipping"; },
    placeholder: "Discount code", apply: "Apply",
    empty: "Your cart is empty.",
    line: "60 gummies · 30 servings", fl_uva: "Grape", fl_sandia: "Watermelon Lemon",
  },
};
function eydLang() {
  try { return (localStorage.getItem("eyd_lang") || "es").indexOf("en") === 0 ? "en" : "es"; }
  catch (e) { return "es"; }
}
function eydStr(k) { const d = EYD_STRINGS[eydLang()] || EYD_STRINGS.es; return d[k]; }
function eydProdName(id) { return "E&D Gummies — " + eydStr(id === "uva" ? "fl_uva" : "fl_sandia"); }
function eydProdLine() { return eydStr("line"); }

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
    return { ok: true, type: "ok", msg: eydStr("applied")(Math.round(EYD_CODES[c].pct * 100)) };
  }
  return { ok: false, type: "err", msg: eydStr("invalid") };
}
function eydClearCode() { eydSetCode(""); }

// ── Totales (subtotal, descuentos, total) ──
// Regla: los descuentos SE ACUMULAN. Primero el 10% por llevar pares (2x),
// y luego el código se aplica sobre el monto ya rebajado.
function eydTotals() {
  const subtotal = eydSubtotal();
  const qty = eydCartCount();
  const info = eydCodeInfo();
  let codeDiscount = 0, qtyDiscount = 0;

  if (qty >= 2) {
    const pairedUnits = Math.floor(qty / 2) * 2;       // 3 → 2, 4 → 4
    const avgUnit = qty ? subtotal / qty : 0;
    qtyDiscount = Math.round(avgUnit * pairedUnits * EYD_QTY_PCT);
  }
  if (info) {
    codeDiscount = Math.round(info.pct * (subtotal - qtyDiscount));
  }
  const total = Math.max(0, subtotal - qtyDiscount - codeDiscount);
  return {
    subtotal, qty, total,
    codeDiscount, qtyDiscount,
    code: info ? info.code : "",
    codeLabel: info ? eydStr(info.labelKey) : "",
    codePct: info ? info.pct : 0,
    freeShip: total >= EYD_FREESHIP,
    freeShipRemaining: Math.max(0, EYD_FREESHIP - total),
  };
}

// Desglose HTML reutilizable (carrito)
function eydBreakdownHTML() {
  const t = eydTotals();
  let h = '<div class="bd-line"><span>' + eydStr("subtotal") + "</span><span>" + eydFormatCOP(t.subtotal) + "</span></div>";
  if (t.qtyDiscount > 0)
    h += '<div class="bd-line bd-disc"><span>' + eydStr("qty2") + "</span><span>−" + eydFormatCOP(t.qtyDiscount) + "</span></div>";
  if (t.codeDiscount > 0)
    h += '<div class="bd-line bd-disc"><span>−' + Math.round(t.codePct * 100) + "% " + t.codeLabel + "</span><span>−" + eydFormatCOP(t.codeDiscount) + "</span></div>";
  h += '<div class="bd-total"><span>' + eydStr("total") + "</span><span>" + eydFormatCOP(t.total) + "</span></div>";
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
    itemsEl.innerHTML = '<div class="cart-empty">' + eydStr("empty") + "</div>";
    if (footerEl) footerEl.style.display = "none";
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
          <div class="ci-name">${eydProdName(item.id)}</div>
          <div class="ci-line">${eydProdLine()}</div>
          <div class="ci-qty">
            <button onclick="updateQty('${p.id}', -1)" aria-label="−">−</button>
            <span>${item.qty}</span>
            <button onclick="updateQty('${p.id}', 1)" aria-label="+">+</button>
          </div>
          <button class="ci-remove" onclick="removeFromCart('${p.id}')">${eydLang() === "en" ? "Remove" : "Eliminar"}</button>
        </div>
        <div class="ci-price">${eydFormatCOP(p.price * item.qty)}</div>
      </div>`;
  }).join("");

  // Textos localizados del bloque de descuento
  const codeInput = document.getElementById("cartCodeInput");
  if (codeInput) codeInput.placeholder = eydStr("placeholder");
  const applyBtn = document.querySelector(".cart-code button");
  if (applyBtn) applyBtn.textContent = eydStr("apply");

  // Badge de promoción 2x (se oculta al llegar a 2+)
  const promo = document.getElementById("cartPromo");
  if (promo) { promo.textContent = eydStr("promo2"); promo.style.display = count >= 2 ? "none" : ""; }

  // Desglose de precios
  const bd = document.getElementById("cartBreakdown");
  if (bd) bd.innerHTML = eydBreakdownHTML();

  // Envío gratis (umbral EYD_FREESHIP)
  const ship = document.getElementById("cartShipNote");
  if (ship) {
    const tot = eydTotals();
    if (tot.freeShip) { ship.textContent = eydStr("ship_free"); ship.className = "cart-ship-note free"; }
    else { ship.textContent = eydStr("ship_left")(eydFormatCOP(tot.freeShipRemaining)); ship.className = "cart-ship-note"; }
  }

  // Mensaje del código según estado aplicado
  const msgEl = document.getElementById("cartCodeMsg");
  if (msgEl) {
    const info = eydCodeInfo();
    if (info) {
      msgEl.textContent = eydStr("applied")(Math.round(info.pct * 100));
      msgEl.className = "cart-code-msg ok";
    } else if (!msgEl.textContent) {
      msgEl.className = "cart-code-msg";
    }
  }
}

document.addEventListener("DOMContentLoaded", eydRenderCart);
