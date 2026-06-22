// ============================================
// /api/create-preference.js
// Función serverless (Vercel) — crea una preferencia de pago
// en Mercado Pago a partir del carrito enviado desde el sitio.
//
// IMPORTANTE: el Access Token de Mercado Pago se lee de una
// variable de entorno (MP_ACCESS_TOKEN). NUNCA debe escribirse
// directamente en el código ni subirse a un repositorio público.
// Se configura en el panel de Vercel: Project Settings > Environment Variables.
// ============================================

const { MercadoPagoConfig, Preference } = require("mercadopago");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "El carrito está vacío" });
    }

    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      return res.status(500).json({ error: "Falta configurar MP_ACCESS_TOKEN en el servidor" });
    }

    const client = new MercadoPagoConfig({ accessToken });
    const preference = new Preference(client);

    const siteUrl = process.env.SITE_URL || `https://${req.headers.host}`;

    const result = await preference.create({
      body: {
        items: items.map((item) => ({
          title: item.name,
          quantity: item.qty,
          unit_price: item.price,
          currency_id: "COP",
        })),
        back_urls: {
          success: `${siteUrl}/gracias.html`,
          failure: `${siteUrl}/error-pago.html`,
          pending: `${siteUrl}/gracias.html`,
        },
        auto_return: "approved",
      },
    });

    return res.status(200).json({ init_point: result.init_point });
  } catch (err) {
    console.error("Error creando preferencia de Mercado Pago:", err);
    return res.status(500).json({ error: "No se pudo crear la preferencia de pago" });
  }
};
