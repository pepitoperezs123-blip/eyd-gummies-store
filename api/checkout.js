// ============================================================
// /api/checkout.js  —  Función serverless (Vercel)
// Crea los datos firmados para iniciar un pago en WOMPI.
//
// Wompi ofrece, dentro de su checkout, TODOS los métodos: PSE,
// tarjeta, Nequi y Bancolombia. No hay integración aparte para PSE.
//
// La "firma de integridad" se calcula AQUÍ (en el servidor) porque
// requiere el secreto de integridad, que NUNCA debe ir al navegador.
//
// Variables de entorno (Vercel → Project Settings → Environment Variables):
//   WOMPI_PUBLIC_KEY        → pub_prod_xxx  (o pub_test_xxx para pruebas)
//   WOMPI_INTEGRITY_SECRET  → secreto de integridad del panel de Wompi
//   SITE_URL  (opcional)    → https://edbienestar.com
//
// Mientras esas variables NO existan, la pasarela responde
// { configured:false } y la tienda muestra "pago en configuración".
// Así queda TODO listo y se activa solo poniendo las llaves.
// ============================================================

const crypto = require("crypto");

// ── Precios de CONFIANZA (fuente de verdad del servidor) ──
// Mantener sincronizado con js/store.js. El monto se recalcula
// aquí para que nadie pueda manipular el precio desde el navegador.
const PRICES = {
  femme: { name: "E&D Femme — 60 gomitas", price: 120000 },
  homme: { name: "E&D Homme — 60 gomitas", price: 120000 },
};

const CURRENCY = "COP";

// Costo de envío en COP. 0 = se coordina/incluido tras la compra.
// Cambia este valor cuando definas tarifa de envío.
const SHIPPING_COST = 0;

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método no permitido" });
  }

  const publicKey = process.env.WOMPI_PUBLIC_KEY;
  const integritySecret = process.env.WOMPI_INTEGRITY_SECRET;

  // Aún sin credenciales → la tienda queda lista pero la pasarela
  // se reporta como "no configurada" (no se puede cobrar todavía).
  if (!publicKey || !integritySecret) {
    return res.status(503).json({
      configured: false,
      error:
        "La pasarela de pago aún no está activa. Falta configurar WOMPI_PUBLIC_KEY y WOMPI_INTEGRITY_SECRET.",
    });
  }

  try {
    const { items } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "El carrito está vacío" });
    }

    // Recalcular el monto en el servidor con precios de confianza.
    let subtotal = 0;
    for (const it of items) {
      const product = PRICES[it && it.id];
      const qty = parseInt(it && it.qty, 10);
      if (!product || !Number.isInteger(qty) || qty < 1 || qty > 50) {
        return res.status(400).json({ error: "Producto o cantidad inválida" });
      }
      subtotal += product.price * qty;
    }

    const totalCop = subtotal + SHIPPING_COST;
    const amountInCents = totalCop * 100; // Wompi trabaja en centavos

    // Referencia única e irrepetible por intento de pago.
    const reference =
      "EYD-" + Date.now() + "-" + crypto.randomBytes(4).toString("hex");

    // Firma de integridad Wompi:
    //   SHA256( reference + amountInCents + currency + integritySecret )
    const signature = crypto
      .createHash("sha256")
      .update(`${reference}${amountInCents}${CURRENCY}${integritySecret}`)
      .digest("hex");

    const siteUrl = process.env.SITE_URL || `https://${req.headers.host}`;
    const redirectUrl = `${siteUrl}/gracias.html`;

    // Devolvemos los componentes públicos. El navegador arma la URL
    // del checkout y le añade los datos del cliente (sin pasar por
    // nuestro servidor). El secreto nunca sale de aquí.
    return res.status(200).json({
      configured: true,
      checkoutBaseUrl: "https://checkout.wompi.co/p/",
      publicKey,
      currency: CURRENCY,
      amountInCents,
      reference,
      signature,
      redirectUrl,
      totalCop,
    });
  } catch (err) {
    console.error("Error creando checkout Wompi:", err);
    return res.status(500).json({ error: "No se pudo iniciar el pago" });
  }
};
