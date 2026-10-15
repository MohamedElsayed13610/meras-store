'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import Lenis from 'lenis';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { ArrowLeft, Menu, ShoppingBag, Sparkles, X } from 'lucide-react';
import type { ShopifyProduct } from '@/lib/shopify';

type Props = {
  products: ShopifyProduct[];
};

const navItems = [
  ['الجديد', '#new'],
  ['العبايات', '#collection'],
  ['الدريسات', '#collection'],
  ['المناسبات', '#occasion'],
  ['عن مِراس', '#story']
];

function formatPrice(amount: string) {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0
  }).format(Number(amount));
}

export function MerasStorefront({ products }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loadingVariant, setLoadingVariant] = useState<string | null>(null);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.25], [0, 80]);
  const heroScale = useTransform(scrollYProgress, [0, 0.25], [1, 1.055]);
  const lineX = useTransform(scrollYProgress, [0, 1], ['8%', '-42%']);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };

    frame = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  const featured = useMemo(() => products.filter((item) => item.featuredImage).slice(0, 8), [products]);
  const heroProduct = featured[0] ?? products[0];
  const editorialProduct = featured[2] ?? featured[1] ?? heroProduct;

  async function buyNow(product: ShopifyProduct) {
    const variant = product.variants[0];
    if (!variant) return;

    setLoadingVariant(variant.id);
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchandiseId: variant.id })
      });
      const data = await response.json();
      if (data.checkoutUrl) window.location.href = data.checkoutUrl;
    } finally {
      setLoadingVariant(null);
    }
  }

  return (
    <main className="site-shell">
      <div className="grain" aria-hidden="true" />
      <motion.div className="scroll-progress" style={{ scaleX: scrollYProgress }} />

      <header className="nav-wrap">
        <div className="announcement">شحن داخل مصر — تجربة مِراس الجديدة</div>
        <nav className="nav-bar" aria-label="التنقل الرئيسي">
          <button className="icon-button mobile-only" onClick={() => setMenuOpen(true)} aria-label="فتح القائمة">
            <Menu size={21} />
          </button>

          <div className="nav-links desktop-only">
            {navItems.map(([label, href]) => (
              <a key={label} href={href}>{label}</a>
            ))}
          </div>

          <a className="brand-mark" href="#top" aria-label="مِراس - الرئيسية">
            <span className="brand-ar">مِراس</span>
            <span className="brand-en">MERAS</span>
          </a>

          <button className="icon-button" aria-label="سلة التسوق">
            <ShoppingBag size={20} />
            <span className="cart-dot" />
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
          >
            <button className="icon-button menu-close" onClick={() => setMenuOpen(false)} aria-label="إغلاق القائمة">
              <X size={22} />
            </button>
            {navItems.map(([label, href], index) => (
              <motion.a
                key={label}
                href={href}
                onClick={() => setMenuOpen(false)}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.04 * index }}
              >
                {label}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <section className="hero" id="top">
        <motion.div className="hero-art" style={{ y: heroY, scale: heroScale }}>
          {heroProduct?.featuredImage && (
            <Image
              src={heroProduct.featuredImage.url}
              alt={heroProduct.featuredImage.altText || heroProduct.title}
              fill
              priority
              sizes="(max-width: 900px) 100vw, 56vw"
              className="hero-image"
            />
          )}
          <div className="hero-overlay" />
          <motion.div
            className="orbit orbit-one"
            animate={{ rotate: 360 }}
            transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="orbit orbit-two"
            animate={{ rotate: -360 }}
            transition={{ duration: 38, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>

        <div className="hero-copy">
          <motion.div
            className="eyebrow"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Sparkles size={15} /> مجموعة مِراس
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 34 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            حضوركِ
            <span>له أثر.</span>
          </motion.h1>

          <motion.p
            className="hero-description"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42 }}
          >
            عبايات ودريسات بتفاصيل هادئة، قصّات مريحة، وحضور أنثوي لا يحتاج إلى مبالغة.
          </motion.p>

          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            <a className="button button-dark" href="#new">
              اكتشفي المجموعة <ArrowLeft size={17} />
            </a>
            <a className="text-link" href="#story">قصة مِراس</a>
          </motion.div>

          <motion.div
            className="founder-signature"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.85 }}
          >
            <span>برؤية</span>
            <strong>منى الطحاوي</strong>
            <small>Founder of Meras</small>
          </motion.div>
        </div>

        <motion.div
          className="hero-index"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <span>01</span>
          <div />
          <span>26</span>
        </motion.div>
      </section>

      <section className="marquee-section" aria-hidden="true">
        <motion.div className="marquee-track" style={{ x: lineX }}>
          <span>مِراس</span><i>✦</i><span>يومية</span><i>✦</i><span>مناسبات</span><i>✦</i><span>عبايات</span><i>✦</i><span>دريسات</span><i>✦</i><span>مِراس</span>
        </motion.div>
      </section>

      <section className="collection-section" id="new">
        <motion.div
          className="section-heading"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
        >
          <div>
            <span className="eyebrow plain">NEW EDIT</span>
            <h2>مختارات مِراس</h2>
          </div>
          <p>قطع مصممة لتتنقل معكِ من تفاصيل يومك إلى مناسباتك، بنفس الهدوء والثقة.</p>
        </motion.div>

        <div className="product-grid" id="collection">
          {featured.map((product, index) => {
            const variant = product.variants[0];
            return (
              <motion.article
                className={`product-card ${index === 0 || index === 5 ? 'product-card-tall' : ''}`}
                key={product.id}
                initial={{ opacity: 0, y: 48 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: (index % 4) * 0.07, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="product-media">
                  {product.featuredImage && (
                    <Image
                      src={product.featuredImage.url}
                      alt={product.featuredImage.altText || product.title}
                      fill
                      sizes="(max-width: 700px) 90vw, (max-width: 1100px) 45vw, 24vw"
                    />
                  )}
                  <div className="product-actions">
                    <button
                      onClick={() => buyNow(product)}
                      disabled={!variant || loadingVariant === variant.id}
                    >
                      {loadingVariant === variant?.id ? 'جارٍ التحضير…' : 'اشتري الآن'}
                    </button>
                  </div>
                </div>
                <div className="product-meta">
                  <div>
                    <h3>{product.title}</h3>
                    <span>مِراس — إصدار محدود</span>
                  </div>
                  {variant && <strong>{formatPrice(variant.price.amount)}</strong>}
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section className="editorial" id="occasion">
        <div className="editorial-copy">
          <motion.span
            className="eyebrow plain"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            OCCASION EDIT
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.75 }}
          >
            أناقة تُرى،
            <span>ولا تصرخ.</span>
          </motion.h2>
          <p>قطع المناسبات عند مِراس مبنية على التفاصيل: ملمس، حركة، وخطوط تترك الانطباع من غير ازدحام.</p>
          <a href="#new" className="button button-light">شاهدي قطع المناسبات <ArrowLeft size={17} /></a>
        </div>

        <motion.div
          className="editorial-image-wrap"
          initial={{ clipPath: 'inset(14% 14% 14% 14%)', opacity: 0.6 }}
          whileInView={{ clipPath: 'inset(0% 0% 0% 0%)', opacity: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
        >
          {editorialProduct?.featuredImage && (
            <Image
              src={editorialProduct.featuredImage.url}
              alt={editorialProduct.featuredImage.altText || editorialProduct.title}
              fill
              sizes="(max-width: 900px) 100vw, 52vw"
            />
          )}
          <span className="vertical-label">MERAS — 2026</span>
        </motion.div>
      </section>

      <section className="story-section" id="story">
        <motion.div
          className="story-number"
          initial={{ opacity: 0, scale: 0.88 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          مِ
        </motion.div>
        <motion.div
          className="story-content"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.75 }}
        >
          <span className="eyebrow plain">THE STORY</span>
          <h2>مِراس هو ما يبقى من الأثر.</h2>
          <p>
            علامة مصرية تنطلق من فكرة بسيطة: أن الأناقة الحقيقية لا تحتاج أن تكون صاخبة. كل قطعة تُختار لتكون قريبة من المرأة، من يومها، ومن طريقتها الخاصة في الحضور.
          </p>
          <div className="story-founder">
            <strong>منى الطحاوي</strong>
            <span>المؤسسة والمالكة</span>
          </div>
        </motion.div>
      </section>

      <footer className="footer">
        <div className="footer-brand">
          <span className="brand-ar">مِراس</span>
          <p>عبايات ودريسات بتفاصيل تصنع الأثر.</p>
        </div>
        <div className="footer-links">
          <a href="#new">الجديد</a>
          <a href="#collection">المجموعة</a>
          <a href="#story">عن مِراس</a>
          <a href="mailto:merasstore5@gmail.com">تواصل معنا</a>
        </div>
        <div className="footer-end">
          <span>© 2026 MERAS</span>
          <span>CAIRO — EGYPT</span>
        </div>
      </footer>
    </main>
  );
}
