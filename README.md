# True Shine Silver — Website

A static e-commerce site (HTML/CSS/JS, no build step). Open `index.html` through any web server, or upload the whole `site` folder to any host (Netlify, Vercel, Hostinger, cPanel…).

## Pages
- `index.html` — Home
- `shop.html` — Shop (filters, sort, search, wishlist via `?wishlist=1`)
- `product.html?id=…` — Product page
- `cart.html` — Bag
- `checkout.html` — Checkout (COD / bank transfer / Easypaisa-JazzCash)
- `order-success.html` — Order confirmation, with a "Confirm on WhatsApp" button
- `about.html`, `contact.html` (FAQ + size guide)

## Before going live: edit these
1. **`js/data.js` → `STORE`**: WhatsApp number (`whatsapp`, e.g. `923001234567`), `phone`, `email`.
2. **`checkout.html`**: bank name, account title and IBAN in the "Bank Transfer" box.
3. **Products**: edit the `PRODUCTS` list in `js/data.js` (name, price, sizes, description).
4. **Your own photos**: put them in `images/` and set `img: "images/your-photo.jpg"` and `gallery: [...]`.
   The current photos are free Unsplash stock images that stand in for your products.

## Promo codes
`SHINE10` (10%) and `WELCOME15` (15%). Change them in `js/app.js` (`promo.rates`).

## How orders arrive
This is a front-end-only site: the cart and orders are saved in the shopper's browser.
After placing an order, the customer taps **Confirm on WhatsApp**, which sends you the full order details.
To receive orders automatically (email, dashboard, or online card payments) you'll need a backend or a
platform such as Shopify or WooCommerce.
