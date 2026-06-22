// ============================================
// LAYOUT COMPARTIDO — header, footer, drawer del carrito
// ============================================

const HEADER_HTML = `
<header class="site-header">
  <div class="wrap">
    <a href="index.html" class="logo">E&D<span>ENERGÍA Y BIENESTAR</span></a>
    <nav class="nav-links">
      <a href="index.html">Inicio</a>
      <a href="catalogo.html">Catálogo</a>
      <a href="producto-femme.html">Femme</a>
      <a href="producto-homme.html">Homme</a>
    </nav>
    <button class="cart-btn" onclick="openCart()" aria-label="Abrir carrito">
      Carrito <span class="cart-count">0</span>
    </button>
  </div>
</header>
`;

const FOOTER_HTML = `
<footer class="site-footer">
  <div class="wrap">
    <div class="footer-grid">
      <div>
        <h4>E&D Energía y Bienestar</h4>
        <p class="muted">Gomitas con fórmula premium para acompañar tu energía diaria. Línea Femme y línea Homme, una sola receta de excelencia.</p>
      </div>
      <div>
        <h4>Tienda</h4>
        <a href="catalogo.html">Catálogo completo</a>
        <a href="producto-femme.html">E&D Femme</a>
        <a href="producto-homme.html">E&D Homme</a>
      </div>
      <div>
        <h4>Ayuda</h4>
        <a href="#">Envíos</a>
        <a href="#">Preguntas frecuentes</a>
        <a href="#">Contacto</a>
      </div>
    </div>
    <div class="footer-bottom">© ${new Date().getFullYear()} E&D Energía y Bienestar. Todos los derechos reservados.</div>
  </div>
</footer>
`;

const CART_DRAWER_HTML = `
<div class="cart-overlay" id="cartOverlay" onclick="closeCart()"></div>
<aside class="cart-drawer" id="cartDrawer" aria-label="Carrito de compras">
  <div class="cart-header">
    <h3 class="display" style="font-size:1.2rem">Tu carrito</h3>
    <button class="cart-close" onclick="closeCart()" aria-label="Cerrar carrito">&times;</button>
  </div>
  <div class="cart-items" id="cartItems"></div>
  <div class="cart-footer" id="cartFooter">
    <div class="cart-subtotal">
      <span>Subtotal</span>
      <span class="amount" id="cartSubtotalAmount">$0</span>
    </div>
    <button class="btn btn-gold btn-block" id="checkoutBtn" onclick="goToCheckout()">Pagar ahora</button>
  </div>
</aside>
`;

const GOLD_DIVIDER_SVG = `
<div class="gold-divider">
  <svg viewBox="0 0 140 28" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 22 Q70 2 138 22" stroke="#c9a24b" stroke-width="1" fill="none"/>
    <circle cx="70" cy="9" r="2.5" fill="#e8c77a"/>
  </svg>
</div>
`;

document.addEventListener("DOMContentLoaded", () => {
  const h = document.getElementById("site-header");
  const f = document.getElementById("site-footer");
  const c = document.getElementById("cart-root");
  if (h) h.innerHTML = HEADER_HTML;
  if (f) f.innerHTML = FOOTER_HTML;
  if (c) c.innerHTML = CART_DRAWER_HTML;
  if (typeof renderCart === "function") renderCart();
});
