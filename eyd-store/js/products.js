// ============================================
// CONFIGURACIÓN DE PRODUCTOS — E&D Energía y Bienestar
// Edita aquí nombres, precios, descripciones e imágenes.
// Los precios van en pesos colombianos (COP), solo el número.
// ============================================

const PRODUCTS = {
  femme: {
    id: "femme",
    name: "E&D FEMME",
    line: "Línea Mujer",
    tagline: "Energía y bienestar, a tu ritmo.",
    price: 89000, // TODO: confirmar precio real
    image: "images/femme.png",
    accent: "#8b3a52",
    description:
      "60 gomitas con la misma fórmula E&D pensada para acompañar tu energía diaria y tu bienestar. Sabor frutos rojos.",
    benefits: [
      "Apoya tu energía durante el día",
      "Contribuye al bienestar general",
      "60 gomitas por frasco · 1 mes de uso",
      "Sabor frutos rojos"
    ]
  },
  homme: {
    id: "homme",
    name: "E&D HOMME",
    line: "Línea Hombre",
    tagline: "Energía y bienestar, sin pausas.",
    price: 89000, // TODO: confirmar precio real
    image: "images/homme.png",
    accent: "#1e3a5f",
    description:
      "60 gomitas con la misma fórmula E&D pensada para acompañar tu energía diaria y tu bienestar. Sabor frutos azules.",
    benefits: [
      "Apoya tu energía durante el día",
      "Contribuye al bienestar general",
      "60 gomitas por frasco · 1 mes de uso",
      "Sabor frutos azules"
    ]
  }
};

// No tocar de aquí hacia abajo
if (typeof module !== "undefined") module.exports = PRODUCTS;
