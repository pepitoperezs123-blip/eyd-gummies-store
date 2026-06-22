# E&D Energía y Bienestar — Sitio web de tienda

Sitio completo: landing, catálogo, página de producto, carrito y pago con Mercado Pago.

## Estructura del proyecto

```
eyd-store/
├── index.html              → Landing
├── catalogo.html            → Catálogo (los 2 productos)
├── producto-femme.html      → Página de E&D Femme
├── producto-homme.html      → Página de E&D Homme
├── gracias.html             → Pago exitoso
├── error-pago.html          → Pago fallido
├── css/styles.css           → Todos los estilos
├── js/products.js           → ⭐ Aquí editas nombres, precios y descripciones
├── js/cart.js                → Lógica del carrito
├── js/layout.js               → Header, footer y carrito compartidos
├── images/                  → Fotos de producto
├── api/create-preference.js → Función que conecta con Mercado Pago
├── package.json
└── vercel.json
```

## 1. Editar precios y textos

Abre `js/products.js`. Ahí cambias precio, nombre, descripción y beneficios de cada producto. Está comentado para que sea fácil. **Los precios actuales son de ejemplo ($89.000) — confírmamelos o edítalos ahí.**

## 2. Crear cuenta y credenciales de Mercado Pago

1. Crea una cuenta en https://www.mercadopago.com.co (si no tienes)
2. Entra a **Tus integraciones** → https://www.mercadopago.com.co/developers/panel
3. Crea una aplicación nueva
4. Copia el **Access Token de producción** (no el de prueba, cuando estés listo para vender de verdad)

Guarda ese token, lo vas a necesitar en el paso 4.

## 3. Subir el proyecto a GitHub

1. Crea una cuenta en https://github.com si no tienes
2. Crea un repositorio nuevo (puede ser privado)
3. Sube esta carpeta completa al repositorio (puedo guiarte con los comandos exactos cuando lo tengas creado, o puedes arrastrar los archivos desde la web de GitHub)

## 4. Desplegar en Vercel

1. Crea una cuenta en https://vercel.com (puedes entrar directo con tu cuenta de GitHub)
2. Click en **Add New → Project**
3. Selecciona el repositorio que subiste
4. Antes de desplegar, ve a **Environment Variables** y agrega:
   - `MP_ACCESS_TOKEN` = el token que copiaste en el paso 2
5. Click en **Deploy**

En unos segundos tu sitio estará en una URL tipo `eyd-store.vercel.app`.

## 5. Conectar tu dominio

1. En el proyecto en Vercel, ve a **Settings → Domains**
2. Escribe tu dominio y click **Add**
3. Vercel te va a mostrar uno o dos registros DNS (tipo A o CNAME)
4. Entra al panel donde compraste el dominio, busca la sección **DNS** y agrega esos registros exactamente como Vercel los indica
5. Espera la propagación (minutos a horas) — Vercel te avisa cuando quede activo y te da SSL (https) automático

## Cómo actualizar el sitio en el futuro

Cualquier cambio que subas al repositorio de GitHub se publica automáticamente en Vercel en segundos. No hay que volver a "subir" nada manualmente.

## Notas de seguridad

- El Access Token de Mercado Pago **nunca** va en el código, solo en las variables de entorno de Vercel — así nadie puede verlo ni robarlo desde el navegador.
- El carrito se guarda en el navegador de cada visitante (no en una base de datos), por eso no se necesita servidor para eso.
