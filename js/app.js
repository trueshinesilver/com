/* =========================================================
   TRUE SHINE SILVER — Storefront logic
   Cart & wishlist are saved in the browser (localStorage).
   ========================================================= */
(() => {
  "use strict";

  /* ---------- Helpers ---------- */
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const money = n => `${STORE.currency} ${Math.round(n).toLocaleString("en-PK")}`;
  const byId = id => PRODUCTS.find(p => p.id === id);
  const catName = id => (CATEGORIES.find(c => c.id === id) || {}).name || id;
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const params = new URLSearchParams(location.search);

  /* ---------- Icons ---------- */
  const I = {
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M12 20s-7.5-4.6-9.2-9.4C1.6 7 4 4 7.2 4c2 0 3.6 1.1 4.8 2.8C13.2 5.1 14.8 4 16.8 4 20 4 22.4 7 21.2 10.6 19.5 15.4 12 20 12 20Z"/></svg>',
    bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M5 8h14l-1.2 12.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8L5 8Z"/><path d="M9 10V7a3 3 0 0 1 6 0v3"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 7h18M3 12h12M3 17h18"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    arrow: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 19V5M6 11l6-6 6 6"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2.8 2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8L12 2.8Z"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>',
    truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M2 6h12v10H2zM14 9h4l3 3v4h-7"/><circle cx="6" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/></svg>',
    gem: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M6 3h12l4 6-10 12L2 9l4-6Z"/><path d="M2 9h20M9 3l3 18 3-18"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M12 3 4 6v6c0 5 3.4 8 8 9 4.6-1 8-4 8-9V6l-8-3Z"/><path d="m8.5 12 2.5 2.5 4.5-5"/></svg>',
    return: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M4 9h11a5 5 0 0 1 0 10H8"/><path d="M8 5 4 9l4 4"/></svg>',
    gift: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="3" y="8" width="18" height="4"/><path d="M5 12v9h14v-9M12 8v13M12 8S10.5 3 8 4s0 4 4 4ZM12 8s1.5-5 4-4 0 4-4 4Z"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
    insta: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.8-1.2a2.2 2.2 0 0 0 .1-1.2c0-.1-.2-.2-.5-.3Z"/></svg>',
    fb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8Z"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5M14 3c.5 2.6 2.4 4.5 5 4.8"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12Z"/><circle cx="12" cy="9" r="2.5"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    sparkle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M12 2c.6 4.6 2.4 6.9 7 7.5-4.6.6-6.4 2.9-7 7.5-.6-4.6-2.4-6.9-7-7.5 4.6-.6 6.4-2.9 7-7.5ZM19 15c.3 2 1 3 3 3.3-2 .3-2.7 1.3-3 3.3-.3-2-1-3-3-3.3 2-.3 2.7-1.3 3-3.3Z"/></svg>',
    filter: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 6h16M7 12h10M10 18h4"/></svg>',
  };
  window.TS_ICONS = I;

  /* ---------- Logo (vector recreation of the TS monogram) ---------- */
  let logoN = 0;
  function logo(size = 44, ring = true) {
    const id = "tsg" + (++logoN);
    return `<svg class="brand-mark" width="${size}" height="${size}" viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#8b8d93"/><stop offset=".28" stop-color="#ffffff"/>
          <stop offset=".5" stop-color="#9fa1a7"/><stop offset=".72" stop-color="#f2f2f4"/><stop offset="1" stop-color="#7d7f85"/>
        </linearGradient>
        <linearGradient id="${id}d" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#b9c2cc"/></linearGradient>
      </defs>
      ${ring ? `<circle cx="50" cy="50" r="48" fill="#050506" stroke="url(#${id})" stroke-width="1.2" opacity=".95"/>` : ""}
      <text x="40" y="66" text-anchor="middle" font-family="Cinzel, serif" font-size="50" font-weight="500" fill="url(#${id})">T</text>
      <text x="56" y="74" text-anchor="middle" font-family="Cinzel, serif" font-size="50" font-weight="500" fill="url(#${id})">S</text>
      <path d="M70 34v6" stroke="url(#${id})" stroke-width="1.2"/>
      <path d="M70 40c-3.2 4-4.6 6.4-4.6 8.4a4.6 4.6 0 0 0 9.2 0c0-2-1.4-4.4-4.6-8.4Z" fill="url(#${id}d)" stroke="#fff" stroke-width=".6"/>
      <path d="M67.4 47.6h5.2M70 40.6v12.4" stroke="#8d97a3" stroke-width=".4"/>
    </svg>`;
  }
  window.TS_LOGO = logo;

  /* ---------- Cart / wishlist state ---------- */
  const Cart = {
    items: store.get("ts_cart", []),
    save() { store.set("ts_cart", this.items); updateCounts(); renderMiniCart(); document.dispatchEvent(new Event("cart:change")); },
    key: (id, size) => `${id}__${size || ""}`,
    add(id, qty = 1, size = "") {
      const p = byId(id); if (!p) return;
      if (!size && p.sizes.length) size = p.sizes[Math.floor(p.sizes.length / 2)];
      const k = this.key(id, size);
      const ex = this.items.find(i => i.key === k);
      if (ex) ex.qty = Math.min(ex.qty + qty, 20); else this.items.push({ key: k, id, size, qty });
      this.save();
      bump();
      toast(`<img src="${p.img}" alt=""><div><b>${esc(p.name)}</b> added to bag <a href="cart.html">View bag</a></div>`);
    },
    setQty(key, qty) { const i = this.items.find(x => x.key === key); if (!i) return; i.qty = Math.max(1, Math.min(20, qty)); this.save(); },
    remove(key) { this.items = this.items.filter(i => i.key !== key); this.save(); },
    clear() { this.items = []; this.save(); },
    lines() { return this.items.map(i => ({ ...i, p: byId(i.id) })).filter(l => l.p); },
    count() { return this.items.reduce((s, i) => s + i.qty, 0); },
    subtotal() { return this.lines().reduce((s, l) => s + l.p.price * l.qty, 0); },
  };
  const Wish = {
    ids: store.get("ts_wish", []),
    has(id) { return this.ids.includes(id); },
    toggle(id) {
      this.has(id) ? (this.ids = this.ids.filter(x => x !== id)) : this.ids.push(id);
      store.set("ts_wish", this.ids); updateCounts();
      const p = byId(id);
      toast(this.has(id) ? `<img src="${p.img}" alt=""><div>Saved <b>${esc(p.name)}</b> to your wishlist</div>` : `<div>Removed from wishlist</div>`);
      return this.has(id);
    },
  };
  const promo = { code: store.get("ts_promo", ""), rates: { SHINE10: .10, WELCOME15: .15 } };
  function totals() {
    const sub = Cart.subtotal();
    const rate = promo.rates[promo.code] || 0;
    const discount = Math.round(sub * rate);
    const shipping = sub === 0 || sub - discount >= STORE.freeShippingOver ? 0 : STORE.shippingFee;
    return { sub, discount, shipping, total: sub - discount + shipping, rate };
  }
  window.TS = { Cart, Wish, money, byId, totals, promo, store, esc, catName, I };

  /* ---------- Shell: announce, header, drawers, footer ---------- */
  const page = document.body.dataset.page || "";
  const navLinks = [
    ["index.html", "Home", "home"], ["shop.html", "Shop", "shop"], ["shop.html?cat=men", "For Him", "men"],
    ["about.html", "Our Story", "about"], ["contact.html", "Contact", "contact"],
  ];
  function shell() {
    const cat = params.get("cat");
    const isActive = k => (k === page && !(page === "shop" && cat === "men")) || (k === "men" && page === "shop" && cat === "men");
    const msgs = ["Free delivery across Pakistan over " + money(STORE.freeShippingOver), "925 Sterling Silver", "Cash on Delivery available", "7-day easy exchange", "Use code SHINE10 for 10% off"];
    const top = document.createElement("div");
    top.innerHTML = `
      <div class="announce" role="note"><div class="announce-track">${[...msgs, ...msgs].map(m => `<span>${m}</span>`).join("")}</div></div>
      <header class="header" id="header">
        <div class="wrap">
          <nav class="nav" aria-label="Main">${navLinks.map(([h, t, k]) => `<a href="${h}" class="${isActive(k) ? "active" : ""}">${t}</a>`).join("")}</nav>
          <button class="icon-btn menu-toggle" id="openMenu" aria-label="Open menu">${I.menu}</button>
          <a href="index.html" class="brand" aria-label="True Shine Silver home">${logo(44)}<span class="brand-word"><b>TRUE SHINE</b><small>SILVER</small></span></a>
          <div class="header-actions">
            <button class="icon-btn" id="openSearch" aria-label="Search">${I.search}</button>
            <a class="icon-btn hide-sm" href="shop.html?wishlist=1" aria-label="Wishlist">${I.heart}<span class="count" id="wishCount">0</span></a>
            <button class="icon-btn" id="openCart" aria-label="Open bag">${I.bag}<span class="count" id="cartCount">0</span></button>
          </div>
        </div>
      </header>`;
    document.body.prepend(...top.children);

    const extras = document.createElement("div");
    extras.innerHTML = `
      <div class="scrim" id="scrim"></div>
      <aside class="drawer left" id="menuDrawer" aria-label="Menu">
        <div class="drawer-head"><a href="index.html" class="brand">${logo(36)}<span class="brand-word"><b>TRUE SHINE</b><small>SILVER</small></span></a><button class="icon-btn" data-close aria-label="Close">${I.close}</button></div>
        <div class="drawer-body"><nav class="mobile-nav">
          ${[["index.html","Home","01"],["shop.html","Shop All","02"],["shop.html?cat=rings","Rings","03"],["shop.html?cat=necklaces","Necklaces","04"],["shop.html?cat=earrings","Earrings","05"],["shop.html?cat=bracelets","Bracelets","06"],["shop.html?cat=men","For Him","07"],["shop.html?wishlist=1","Wishlist","08"],["about.html","Our Story","09"],["contact.html","Contact","10"]]
            .map(([h,t,n],i)=>`<a href="${h}" style="transition-delay:${.05*i+.1}s">${t}<span>${n}</span></a>`).join("")}
        </nav></div>
        <div class="drawer-foot"><div class="socials" style="margin:0">
          <a href="${STORE.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${I.insta}</a>
          <a href="https://wa.me/${STORE.whatsapp}" target="_blank" rel="noopener" aria-label="WhatsApp">${I.wa}</a>
        </div></div>
      </aside>
      <aside class="drawer right" id="cartDrawer" aria-label="Shopping bag">
        <div class="drawer-head"><h3>Your Bag <small id="miniCount" style="font-size:15px;color:var(--muted)"></small></h3><button class="icon-btn" data-close aria-label="Close">${I.close}</button></div>
        <div class="drawer-body" id="miniBody"></div>
        <div class="drawer-foot" id="miniFoot"></div>
      </aside>
      <div class="search-overlay" id="searchOverlay" role="dialog" aria-label="Search">
        <button class="icon-btn close" data-close aria-label="Close search">${I.close}</button>
        <div class="wrap" style="display:flex;flex-direction:column;min-height:0;flex:1">
          <span class="eyebrow">Search the collection</span>
          <input class="search-input" id="searchInput" type="search" placeholder="Rings, pendants, hoops…" autocomplete="off">
          <div class="search-results" id="searchResults"></div>
        </div>
      </div>
      <div class="toast-wrap" id="toasts" aria-live="polite"></div>
      <button class="to-top" id="toTop" aria-label="Back to top">${I.up}</button>
      <div class="cursor-glow" id="glow"></div>`;
    document.body.append(...extras.children);

    const footer = document.createElement("footer");
    footer.className = "footer";
    footer.innerHTML = `
      <div class="wrap">
        <div class="footer-grid">
          <div>
            <a href="index.html" class="brand" style="justify-content:flex-start">${logo(54)}<span class="brand-word"><b>TRUE SHINE</b><small>SILVER</small></span></a>
            <p style="max-width:340px;margin-top:20px">Premium 925 sterling silver jewellery. Designed to shine. Made to last. ${STORE.tagline}.</p>
            <div class="socials">
              <a href="${STORE.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${I.insta}</a>
              <a href="https://wa.me/${STORE.whatsapp}" target="_blank" rel="noopener" aria-label="WhatsApp">${I.wa}</a>
              <a href="#" aria-label="Facebook">${I.fb}</a>
              <a href="#" aria-label="TikTok">${I.tiktok}</a>
            </div>
          </div>
          <div><h4>Shop</h4><ul>${CATEGORIES.map(c => `<li><a href="shop.html?cat=${c.id}">${c.name}</a></li>`).join("")}<li><a href="shop.html?tag=new">New Arrivals</a></li></ul></div>
          <div><h4>Help</h4><ul><li><a href="contact.html#faq">FAQs</a></li><li><a href="contact.html#faq">Shipping &amp; Delivery</a></li><li><a href="contact.html#faq">Exchange Policy</a></li><li><a href="contact.html#faq">Ring Size Guide</a></li><li><a href="about.html">Silver Care</a></li></ul></div>
          <div><h4>Get in touch</h4><ul>
            <li><a href="https://wa.me/${STORE.whatsapp}" target="_blank" rel="noopener">WhatsApp: ${STORE.phone}</a></li>
            <li><a href="mailto:${STORE.email}">${STORE.email}</a></li>
            <li><a href="${STORE.instagram}" target="_blank" rel="noopener">@trueshinesilver.official</a></li>
          </ul><p style="margin-top:18px;font-size:13px">Mon – Sat · 11am – 9pm</p></div>
        </div>
        <div class="footer-bottom">
          <span>© ${new Date().getFullYear()} True Shine Silver. All rights reserved.</span>
          <div class="pay-icons"><span>COD</span><span>VISA</span><span>MASTERCARD</span><span>EASYPAISA</span><span>JAZZCASH</span></div>
        </div>
      </div>`;
    document.body.append(footer);
  }

  function updateCounts() {
    const c = $("#cartCount"), w = $("#wishCount");
    if (c) { const n = Cart.count(); c.textContent = n; c.classList.toggle("show", n > 0); }
    if (w) { const n = Wish.ids.length; w.textContent = n; w.classList.toggle("show", n > 0); }
  }
  function bump() { const c = $("#cartCount"); if (!c) return; c.classList.remove("bump"); void c.offsetWidth; c.classList.add("bump"); }

  /* ---------- Drawers ---------- */
  let openEl = null;
  function open(el) { close(); openEl = el; el.classList.add("open"); if (el.classList.contains("drawer")) $("#scrim").classList.add("open"); document.body.classList.add("lock"); }
  function close() { if (!openEl) return; openEl.classList.remove("open"); $("#scrim").classList.remove("open"); document.body.classList.remove("lock"); openEl = null; }
  window.TS.openCart = () => open($("#cartDrawer"));

  function renderMiniCart() {
    const body = $("#miniBody"), foot = $("#miniFoot"); if (!body) return;
    const lines = Cart.lines(); const t = totals();
    $("#miniCount").textContent = lines.length ? `(${Cart.count()})` : "";
    if (!lines.length) {
      body.innerHTML = `<div class="empty">${I.bag}<p style="font-family:var(--serif);font-size:24px;color:var(--text);margin:0 0 6px">Your bag is empty</p><p>Discover pieces made to shine.</p><a href="shop.html" class="btn" style="margin-top:14px">Shop now</a></div>`;
      foot.innerHTML = ""; return;
    }
    const left = Math.max(0, STORE.freeShippingOver - (t.sub - t.discount));
    body.innerHTML = `<div class="ship-bar" style="margin-top:18px">${left ? `You're <b style="color:var(--text)">${money(left)}</b> away from free delivery` : `✦ You've unlocked <b style="color:var(--text)">free delivery</b>`}<div class="track"><div class="fill" style="width:${Math.min(100, (t.sub - t.discount) / STORE.freeShippingOver * 100)}%"></div></div></div>` +
      lines.map(l => `<div class="mini-item">
        <a href="product.html?id=${l.id}"><img src="${l.p.img}" alt="${esc(l.p.name)}"></a>
        <div><h4><a href="product.html?id=${l.id}">${esc(l.p.name)}</a></h4><div class="meta">${l.size ? "Size " + esc(l.size) + " · " : ""}${money(l.p.price)}</div>
          <div class="qty small" style="margin-top:10px"><button data-q="-1" data-k="${l.key}" aria-label="Decrease">−</button><input value="${l.qty}" readonly aria-label="Quantity"><button data-q="1" data-k="${l.key}" aria-label="Increase">+</button></div></div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;justify-content:space-between"><span class="price">${money(l.p.price * l.qty)}</span><button class="remove-btn" data-rm="${l.key}" aria-label="Remove">${I.trash}</button></div>
      </div>`).join("");
    foot.innerHTML = `<div class="row-between" style="margin-bottom:6px"><span style="color:var(--muted)">Subtotal</span><b style="font-weight:400;font-size:20px">${money(t.sub)}</b></div>
      <p style="font-size:12.5px;color:var(--muted);margin:0 0 16px">Shipping &amp; discounts calculated at checkout.</p>
      <div style="display:grid;gap:10px"><a href="checkout.html" class="btn btn-block">Checkout</a><a href="cart.html" class="btn btn-ghost btn-block">View bag</a></div>`;
  }

  /* ---------- Toast ---------- */
  function toast(html, ms = 3200) {
    const w = $("#toasts"); if (!w) return;
    const t = document.createElement("div"); t.className = "toast"; t.innerHTML = html; w.append(t);
    while (w.children.length > 2) w.firstChild.remove();
    setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 400); }, ms);
  }
  window.TS.toast = toast;

  /* ---------- Product card ---------- */
  function stars(r, n) {
    return `<span class="stars" aria-label="${r} out of 5">${Array.from({ length: 5 }, (_, i) => `<span style="opacity:${i < Math.round(r) ? 1 : .25}">${I.star}</span>`).join("")}${n != null ? `<small>(${n})</small>` : ""}</span>`;
  }
  function card(p) {
    const alt = p.gallery[1] || null;
    const off = p.compare ? Math.round((1 - p.price / p.compare) * 100) : 0;
    const badge = p.badge ? `<span class="badge ${p.badge.startsWith("-") ? "sale" : ""}">${esc(p.badge)}</span>` : off ? `<span class="badge sale">-${off}%</span>` : "";
    return `<article class="card">
      <div class="card-media">
        <a href="product.html?id=${p.id}" aria-label="${esc(p.name)}"><img src="${p.img.replace("w=900", "w=700")}" alt="${esc(p.name)}" loading="lazy">${alt ? `<img class="alt" src="${alt.replace("w=900", "w=700")}" alt="" loading="lazy">` : ""}</a>
        ${badge}
        <button class="wish ${Wish.has(p.id) ? "on" : ""}" data-wish="${p.id}" aria-label="Add to wishlist">${I.heart}</button>
        <button class="quick-add" data-add="${p.id}" aria-label="Add ${esc(p.name)} to bag">Add to bag</button>
      </div>
      <div class="card-body">
        <div class="row-between"><span class="card-cat">${catName(p.cat)}</span>${stars(p.rating)}</div>
        <h3 class="card-title"><a href="product.html?id=${p.id}">${esc(p.name)}</a></h3>
        <div class="price-row"><span class="price">${money(p.price)}</span>${p.compare ? `<span class="compare">${money(p.compare)}</span>` : ""}</div>
      </div>
    </article>`;
  }
  window.TS.card = card; window.TS.stars = stars;

  /* ---------- Global events ---------- */
  function bindGlobal() {
    document.addEventListener("click", e => {
      const t = e.target.closest("[data-add],[data-wish],[data-q],[data-rm],[data-close],#openMenu,#openCart,#openSearch,#scrim,#toTop");
      if (!t) return;
      if (t.dataset.add) { e.preventDefault(); Cart.add(t.dataset.add); }
      else if (t.dataset.wish) { e.preventDefault(); const on = Wish.toggle(t.dataset.wish); $$(`[data-wish="${t.dataset.wish}"]`).forEach(b => b.classList.toggle("on", on)); document.dispatchEvent(new Event("wish:change")); }
      else if (t.dataset.q) { const l = Cart.items.find(i => i.key === t.dataset.k); if (l) Cart.setQty(l.key, l.qty + +t.dataset.q); }
      else if (t.dataset.rm) { Cart.remove(t.dataset.rm); }
      else if (t.hasAttribute("data-close") || t.id === "scrim") close();
      else if (t.id === "openMenu") open($("#menuDrawer"));
      else if (t.id === "openCart") open($("#cartDrawer"));
      else if (t.id === "openSearch") { open($("#searchOverlay")); setTimeout(() => $("#searchInput").focus(), 200); renderSearch(""); }
      else if (t.id === "toTop") scrollTo({ top: 0, behavior: "smooth" });
    });
    document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
    $("#searchInput").addEventListener("input", e => renderSearch(e.target.value));
    $("#searchInput").addEventListener("keydown", e => { if (e.key === "Enter") location.href = "shop.html?q=" + encodeURIComponent(e.target.value.trim()); });

    const header = $("#header"), toTop = $("#toTop");
    const onScroll = () => { header.classList.toggle("scrolled", scrollY > 10); toTop.classList.toggle("show", scrollY > 900); };
    addEventListener("scroll", onScroll, { passive: true }); onScroll();

    const glow = $("#glow");
    if (matchMedia("(hover: hover)").matches) addEventListener("pointermove", e => { glow.style.left = e.clientX + "px"; glow.style.top = e.clientY + "px"; }, { passive: true });

    window.addEventListener("storage", e => { if (e.key === "ts_cart") { Cart.items = store.get("ts_cart", []); updateCounts(); renderMiniCart(); } });
  }
  function renderSearch(q) {
    q = q.trim().toLowerCase();
    const list = (q ? PRODUCTS.filter(p => (p.name + " " + p.cat + " " + p.tags.join(" ") + " " + p.desc).toLowerCase().includes(q)) : PRODUCTS.filter(p => p.tags.includes("bestseller"))).slice(0, 12);
    $("#searchResults").innerHTML = (q ? "" : `<p class="eyebrow" style="grid-column:1/-1;margin:0">Trending now</p>`) + (list.length ? list.map(p => `<a href="product.html?id=${p.id}"><img src="${p.img.replace("w=900", "w=200")}" alt=""><div><div style="font-family:var(--serif);font-size:19px;line-height:1.2">${esc(p.name)}</div><div style="color:var(--muted);font-size:13px">${money(p.price)}</div></div></a>`).join("") : `<p style="color:var(--muted)">No pieces match “${esc(q)}”.</p>`);
  }

  /* ---------- Reveal animations ---------- */
  function reveal(root = document) {
    const els = $$(".reveal,.reveal-img,.stagger", root).filter(el => !el.classList.contains("in"));
    if (!("IntersectionObserver" in window)) { els.forEach(el => el.classList.add("in")); return; }
    const io = new IntersectionObserver(entries => entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }), { threshold: .12, rootMargin: "0px 0px -40px 0px" });
    els.forEach(el => io.observe(el));
  }
  window.TS.reveal = reveal;

  /* ---------- Count-up numbers ---------- */
  function countUp() {
    $$("[data-count]").forEach(el => {
      const end = +el.dataset.count, suf = el.dataset.suffix || "";
      const io = new IntersectionObserver(([en]) => {
        if (!en.isIntersecting) return; io.disconnect();
        const t0 = performance.now(), d = 1800;
        const step = now => { const k = Math.min(1, (now - t0) / d), v = 1 - Math.pow(1 - k, 3); el.textContent = Math.round(end * v).toLocaleString() + suf; if (k < 1) requestAnimationFrame(step); };
        requestAnimationFrame(step);
      });
      io.observe(el);
    });
  }

  /* ---------- Boot ---------- */
  function boot() {
    const pre = document.createElement("div");
    pre.className = "preloader"; pre.innerHTML = logo(92);
    document.body.prepend(pre);
    shell(); bindGlobal(); updateCounts(); renderMiniCart();
    if (window.TS_PAGE) window.TS_PAGE();
    reveal(); countUp();
    // Show the logo only on the first visit of a session, and never for long.
    let seen = false; try { seen = sessionStorage.getItem("ts_seen") === "1"; sessionStorage.setItem("ts_seen", "1"); } catch {}
    setTimeout(() => pre.classList.add("done"), seen ? 0 : 700);
  }
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", boot) : boot();
})();
