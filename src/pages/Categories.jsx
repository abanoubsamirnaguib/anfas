import {
  IonContent,
  IonHeader,
  IonPage,
  IonRouterLink,
  IonToolbar,
  IonTitle,
  IonButtons,
  useIonModal,
} from '@ionic/react';
import { useEffect, useState } from 'react';
import { productInfo, FALLBACK_IMG, capitalize } from '../utils';
import { useI18n } from '../i18n';
import { LanguageToggle } from '../components/LanguageToggle';
import { ProductModal } from '../components/ProductModal';
import { fetchCategories, fetchFeaturedProducts, fetchBannerSlides } from '../services/api';
import styles from './Categories.module.scss';

// ─── Skeleton card ─────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div
    style={{
      minWidth: '160px',
      borderRadius: '4px',
      overflow: 'hidden',
      background: '#151515',
      border: '1px solid #2A2A2A',
      flexShrink: 0,
    }}
  >
    <div
      style={{
        height: 200,
        background: 'linear-gradient(90deg, #1a1a1a 25%, #252525 50%, #1a1a1a 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.4s infinite',
      }}
    />
  </div>
);

const Categories = () => {
  const { t } = useI18n();
  const [apiCategories, setApiCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState({});

  // ─── Banner Slides ────────────────────────────────────────────────────────────
  const [bannerSlides, setBannerSlides] = useState([]);
  const [bannerLoading, setBannerLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchBannerSlides()
      .then((data) => { if (!cancelled) setBannerSlides(Array.isArray(data) ? data : []); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setBannerLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Auto-advance slider every 4 seconds
  useEffect(() => {
    if (bannerSlides.length < 2) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [bannerSlides]);

  useEffect(() => {
    let cancelled = false;
    fetchCategories()
      .then((data) => { if (!cancelled) setApiCategories(Array.isArray(data) ? data : []); })
      .catch(() => {/* silent fallback to static data */})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchFeaturedProducts(10)
      .then((data) => { if (!cancelled) setFeaturedProducts(Array.isArray(data) ? data : []); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setFeaturedLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // ─── Product modal ────────────────────────────────────────────────────────────
  const [presentProductModal, dismissProductModal] = useIonModal(ProductModal, {
    dismiss: () => dismissProductModal(),
    product: selectedProduct,
    category: selectedProduct?.category?.slug,
  });

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    presentProductModal();
  };

  /**
   * Merge API categories with static productInfo fallback.
   * API data takes precedence; static dict fills in missing cover images / taglines.
   */
  const categories = apiCategories.length > 0
    ? apiCategories.map((cat) => {
        const st = productInfo[cat.slug] || {};
        return {
          slug:       cat.slug,
          name:       cat.name,
          coverImage: cat.cover_image || FALLBACK_IMG,
          tagline:    cat.tagline    || st.tagline    || '',
        };
      })
    : Object.keys(productInfo).map((slug) => ({
        slug,
        name:       capitalize(slug),
        coverImage: FALLBACK_IMG,
        tagline:    productInfo[slug].tagline,
      }));

  const getCatName    = (cat) => t(`categories.${cat.slug}`, null, cat.name);
  const getCatTagline = (cat) => t(`taglines.${cat.slug}`,   null, cat.tagline);

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': '#0C0C0C', '--border-color': 'transparent' }}>
          <IonTitle
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 300,
              fontSize: '1.6rem',
              letterSpacing: '0.25em',
              color: '#C9A96E',
              textAlign: 'center',
              textTransform: 'uppercase',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <img src="/assets/perfume/anfas.jpg" alt="logo" style={{ width: '30px', height: '30px', objectFit: 'cover', borderRadius: '4px' }} referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }} />
              <span>{t('brand')}</span>
            </div>
          </IonTitle>
          <IonButtons slot="end">
            <LanguageToggle />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen style={{ '--background': '#0C0C0C' }}>

        {/* ── Landing Slider (admin-managed banner slides) ── */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            overflow: 'hidden',
            background: '#0C0C0C',
            aspectRatio: '16 / 7',
            minHeight: 180,
          }}
        >
          {/* Skeleton */}
          {bannerLoading && (
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, #1a1a1a 25%, #252525 50%, #1a1a1a 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
          )}

          {/* Slides */}
          {!bannerLoading && bannerSlides.length > 0 && bannerSlides.map((slide, idx) => {
            const isExternal = slide.link_url && (slide.link_url.startsWith('http://') || slide.link_url.startsWith('https://'));
            const inner = (
              <>
                <img
                  src={slide.image_url}
                  alt={slide.title || `slide-${idx}`}
                  referrerPolicy="no-referrer"
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                {(slide.title || slide.subtitle) && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 60%)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      padding: '1.25rem 1.5rem',
                    }}
                  >
                    {slide.subtitle && (
                      <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9A96E', margin: 0, marginBottom: 4 }}>
                        {slide.subtitle}
                      </p>
                    )}
                    {slide.title && (
                      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 'clamp(1.4rem, 5vw, 2.2rem)', color: '#F5F0E8', margin: 0, letterSpacing: '0.08em' }}>
                        {slide.title}
                      </h1>
                    )}
                  </div>
                )}
              </>
            );

            return (
              <div
                key={slide.id}
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: idx === activeSlide ? 1 : 0,
                  transition: 'opacity 0.7s ease',
                  pointerEvents: idx === activeSlide ? 'auto' : 'none',
                  cursor: slide.link_url ? 'pointer' : 'default',
                }}
                onClick={() => {
                  if (!slide.link_url) return;
                  if (isExternal) window.open(slide.link_url, '_blank');
                  else window.location.hash = slide.link_url;
                }}
              >
                {inner}
              </div>
            );
          })}

          {/* Dot navigation */}
          {!bannerLoading && bannerSlides.length > 1 && (
            <div
              style={{
                position: 'absolute',
                bottom: 10,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 6,
                zIndex: 5,
              }}
            >
              {bannerSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setActiveSlide(idx); }}
                  style={{
                    width: idx === activeSlide ? 20 : 6,
                    height: 6,
                    borderRadius: 3,
                    background: idx === activeSlide ? '#C9A96E' : 'rgba(255,255,255,0.35)',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Gold Divider ── */}
        <div className="bellezza-divider" style={{ margin: '1rem 1.25rem' }} />

        {/* ── Featured Horizontal Scroll ── */}
        <div style={{ padding: '0 0 0 1.25rem' }}>
          <p className="section-label" style={{ marginBottom: '0.75rem' }}>{t('home.featured')}</p>
          <div
            style={{
              display: 'flex',
              gap: '0.85rem',
              overflowX: 'auto',
              paddingRight: '1.25rem',
              paddingBottom: '0.5rem',
              scrollbarWidth: 'none',
            }}
          >
            {featuredLoading
              ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
              : featuredProducts.length === 0
                ? null
                : featuredProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleProductClick(product)}
                      style={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}
                    >
                      <div
                        style={{
                          minWidth: '160px',
                          borderRadius: '4px',
                          overflow: 'hidden',
                          background: '#151515',
                          border: '1px solid #2A2A2A',
                          flexShrink: 0,
                        }}
                      >
                        <div style={{ position: 'relative', height: '200px' }}>
                          <img
                            src={product.image || FALLBACK_IMG}
                            alt={product.title}
                            referrerPolicy="no-referrer"
                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <span
                            style={{
                              position: 'absolute',
                              top: '8px',
                              left: '8px',
                              background: '#C9A96E',
                              color: '#0C0C0C',
                              fontSize: '0.55rem',
                              fontWeight: 600,
                              letterSpacing: '0.12em',
                              textTransform: 'uppercase',
                              padding: '3px 7px',
                              borderRadius: '2px',
                            }}
                          >
                            {t('featured.bestSeller')}
                          </span>
                        </div>
                        <div style={{ padding: '0.6rem 0.75rem' }}>
                          <p
                            style={{
                              fontFamily: "'Cormorant Garamond', serif",
                              fontSize: '0.95rem',
                              color: '#F5F0E8',
                              margin: 0,
                              marginBottom: '2px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: '140px',
                            }}
                          >
                            {product.title}
                          </p>
                          <p
                            style={{
                              fontSize: '0.75rem',
                              color: '#C9A96E',
                              margin: 0,
                            }}
                          >
                            {product.price}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
            }
          </div>
        </div>

        {/* ── Gold Divider ── */}
        <div className="bellezza-divider" style={{ margin: '1.25rem 1.25rem 0.75rem' }} />

        {/* ── Category Cards ── */}
        <div style={{ padding: '0 1.25rem 6rem' }}>
          <p className="section-label" style={{ marginBottom: '0.75rem' }}>{t('home.collections')}</p>

          {loading && Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              style={{
                display: 'block',
                marginBottom: '1rem',
                borderRadius: '4px',
                overflow: 'hidden',
                height: '160px',
                background: 'linear-gradient(90deg, #1a1a1a 25%, #252525 50%, #1a1a1a 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.4s infinite',
              }}
            />
          ))}

          {!loading && categories.map((cat) => (
            <IonRouterLink
              key={cat.slug}
              routerLink={`/categories/${cat.slug}`}
              style={{ display: 'block', textDecoration: 'none', marginBottom: '1rem' }}
            >
              <div className={styles.categoryCard}>
                <img
                  src={cat.coverImage}
                  alt={cat.slug}
                  className={styles.categoryCardImg}
                  referrerPolicy="no-referrer"
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }}
                />
                <div className={styles.categoryCardOverlay}>
                  <span className={styles.categoryCardTag}>{getCatTagline(cat)}</span>
                  <div className={styles.categoryCardText}>
                    <p className={styles.categoryCardSub}>{t('home.collection')}</p>
                    <h2 className={styles.categoryCardTitle}>{getCatName(cat)}</h2>
                  </div>
                  <span className={styles.categoryCardArrow}>→</span>
                </div>
              </div>
            </IonRouterLink>
          ))}
        </div>

      </IonContent>
    </IonPage>
  );
};

export default Categories;
