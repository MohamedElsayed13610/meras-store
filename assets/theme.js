(() => {
  const drawer = document.querySelector('[data-cart-drawer]');
  const overlay = document.querySelector('[data-cart-overlay]');
  const body = document.querySelector('[data-cart-body]');
  const footer = document.querySelector('[data-cart-footer]');
  const total = document.querySelector('[data-cart-total]');
  const toast = document.querySelector('[data-cart-toast]');
  const countNodes = document.querySelectorAll('[data-cart-count]');
  const openButtons = document.querySelectorAll('[data-cart-open]');
  const closeButton = document.querySelector('[data-cart-close]');

  const currency = window.Shopify?.currency?.active || 'EGP';

  const money = (cents) => {
    try {
      return new Intl.NumberFormat('ar-EG', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0
      }).format((Number(cents) || 0) / 100);
    } catch (_) {
      return `${((Number(cents) || 0) / 100).toFixed(0)} ${currency}`;
    }
  };

  const escapeHtml = (value = '') => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  function setDrawer(open) {
    if (!drawer || !overlay) return;
    drawer.classList.toggle('is-open', open);
    overlay.hidden = !open;
    drawer.setAttribute('aria-hidden', String(!open));
    document.documentElement.classList.toggle('cart-is-open', open);
  }

  function showToast(message = 'تمت الإضافة إلى السلة') {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove('is-visible'), 2200);
  }

  function renderCart(cart) {
    countNodes.forEach((node) => { node.textContent = cart.item_count; });
    if (!body || !footer || !total) return;

    if (!cart.items.length) {
      body.innerHTML = `
        <div class="drawer-empty">
          <span>مِ</span>
          <h3>السلة لسه فاضية</h3>
          <p>اختاري قطعة من مِراس وابدئي إطلالتك.</p>
          <button type="button" data-drawer-continue>كمّلي التسوق</button>
        </div>`;
      footer.hidden = true;
      body.querySelector('[data-drawer-continue]')?.addEventListener('click', () => setDrawer(false));
      return;
    }

    body.innerHTML = cart.items.map((item, index) => `
      <article class="drawer-item" style="--item-index:${index}">
        <a class="drawer-item-image" href="${escapeHtml(item.url)}">
          ${item.image ? `<img src="${escapeHtml(item.image)}&width=240" alt="${escapeHtml(item.product_title)}" loading="lazy">` : ''}
        </a>
        <div class="drawer-item-copy">
          <span class="drawer-item-label">MERAS</span>
          <a href="${escapeHtml(item.url)}">${escapeHtml(item.product_title)}</a>
          ${item.variant_title && item.variant_title !== 'Default Title' ? `<small>المقاس: ${escapeHtml(item.variant_title)}</small>` : ''}
          <div class="drawer-item-bottom"><span>الكمية ${item.quantity}</span><strong>${money(item.final_line_price)}</strong></div>
        </div>
      </article>
    `).join('');

    total.textContent = money(cart.total_price);
    footer.hidden = false;
  }

  async function refreshCart() {
    const response = await fetch('/cart.js', { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('cart');
    const cart = await response.json();
    renderCart(cart);
    return cart;
  }

  openButtons.forEach((button) => button.addEventListener('click', async () => {
    setDrawer(true);
    try { await refreshCart(); } catch (_) {}
  }));
  closeButton?.addEventListener('click', () => setDrawer(false));
  overlay?.addEventListener('click', () => setDrawer(false));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setDrawer(false);
  });

  document.querySelectorAll('[data-ajax-cart-form]').forEach((form) => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const button = form.querySelector('button[type="submit"]');
      const original = button?.innerHTML;
      if (button) {
        button.disabled = true;
        button.classList.add('is-loading');
      }

      try {
        const response = await fetch('/cart/add.js', {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: new FormData(form)
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.description || 'تعذر إضافة المنتج');
        await refreshCart();
        setDrawer(true);
        showToast('اتضافت القطعة إلى سلة مِراس');
      } catch (error) {
        showToast(error.message || 'تعذر إضافة المنتج');
      } finally {
        if (button) {
          button.disabled = false;
          button.classList.remove('is-loading');
          if (original) button.innerHTML = original;
        }
      }
    });
  });

  refreshCart().catch(() => {});

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reducedMotion) {
    window.addEventListener('load', () => {
      if (!window.gsap) return;
      const gsap = window.gsap;
      if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);

      gsap.from('.hero-copy > *', {
        opacity: 0,
        y: 18,
        duration: 0.75,
        stagger: 0.07,
        ease: 'power3.out'
      });
      gsap.from('.hero-media', {
        opacity: 0,
        scale: 0.985,
        duration: 1.05,
        ease: 'power3.out'
      });

      if (window.ScrollTrigger) {
        gsap.utils.toArray('[data-reveal]').forEach((item) => {
          gsap.from(item, {
            opacity: 0,
            y: 22,
            duration: 0.72,
            ease: 'power3.out',
            scrollTrigger: { trigger: item, start: 'top 91%', once: true }
          });
        });
        gsap.to('.hero-media img', {
          yPercent: 4,
          ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.5 }
        });
      }
    });
  }
})();
