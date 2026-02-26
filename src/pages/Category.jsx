import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonSearchbar,
  IonTitle,
  IonToolbar,
  useIonModal,
  useIonRouter,
} from '@ionic/react';
import { chevronBack, optionsOutline } from 'ionicons/icons';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { FilterModal } from '../components/FilterModal';
import { ProductModal } from '../components/ProductModal';
import { FALLBACK_IMG, productInfo } from '../utils';
import { useI18n } from '../i18n';
import { LanguageToggle } from '../components/LanguageToggle';
import { fetchCategory, fetchCategoryTags, fetchProducts } from '../services/api';

const StarRating = ({ rating }) => {
  const stars = Math.round(rating);
  return (
    <span style={{ color: '#C9A96E', fontSize: '0.7rem', letterSpacing: '1px' }}>
      {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
      <span style={{ color: '#7A7A7A', marginLeft: '4px' }}>{rating}</span>
    </span>
  );
};

const Category = () => {
  const router = useIonRouter();
  const { category } = useParams();
  const { t } = useI18n();
  const productsRef = useRef();

  // Static fallback info (used until API data arrives)
  const staticInfo = productInfo[category];

  // Category metadata from backend
  const [categoryInfo, setCategoryInfo] = useState(null);

  // Dynamic tags loaded from the backend (used as filter chips)
  const [availableTags, setAvailableTags] = useState([]);

  // Products state
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filterCriteria, setFilterCriteria] = useState('All');
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState({});

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  // Derive display values: prefer API data, fall back to static
  const coverImage  = categoryInfo?.cover_image || FALLBACK_IMG;
  const tagline     = categoryInfo?.tagline     || staticInfo?.tagline    || '';
  // filters = dynamic tags from API (with 'None' prepended), fall back to static list
  const filters = availableTags.length > 0
    ? ['All', ...availableTags]
    : ['All'];
  const searchPlaceholder = t('search.placeholder', {
    subject: t('search.subjects.fragrances', null, 'fragrances'),
  });

  // ─── Modals ───────────────────────────────────────────────────────────────────
  const [presentProductModal, dismissProductModal] = useIonModal(ProductModal, {
    dismiss: () => dismissProductModal(),
    category,
    type: category,
    product: selectedProduct,
  });

  const handleProductModal = (product) => {
    setSelectedProduct(product);
    presentProductModal();
  };

  const [present, dismiss] = useIonModal(FilterModal, {
    dismiss: () => dismiss(),
    filterCriteria,
    setFilterCriteria,
    productsRef,
    filters,
  });

  const openModal = () => {
    present({ breakpoints: [0, 0.35], initialBreakpoint: 0.35, backdropBreakpoint: 0 });
  };

  // ─── Fetch category metadata ──────────────────────────────────────────────────
  useEffect(() => {
    if (!category) return;
    fetchCategory(category).then(setCategoryInfo).catch(() => {/* use static fallback */});
    // Load tags for this category to populate the filter chips
    fetchCategoryTags(category)
      .then((tags) => setAvailableTags(Array.isArray(tags) ? tags : []))
      .catch(() => {/* keep static fallback */});
  }, [category]);

  // ─── Fetch products ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!category) { setLoading(false); return; }
    setLoading(true);
    setProducts([]);
    setFilteredProducts([]);
    setCurrentPage(1);
    fetchProducts(category, { per_page: 20, page: 1 })
      .then((resp) => {
        const data = resp?.data || [];
        setProducts(data);
        setFilteredProducts(data);
        setLastPage(resp?.last_page || 1);
        setActiveFilter('All');
      })
      .catch((err) => console.error('Failed to fetch products', err))
      .finally(() => setLoading(false));
  }, [category]);

  // Watch filterCriteria changes dispatched from FilterModal
  useEffect(() => {
    if (filterCriteria !== activeFilter) {
      applyFilter(filterCriteria);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCriteria]);

  // ─── Search ───────────────────────────────────────────────────────────────────
  const performSearch = async (e) => {
    const q = e.target.value?.trim() || '';
    if (!q) { setFilteredProducts(products); return; }
    setLoading(true);
    try {
      const resp = await fetchProducts(category, { search: q, per_page: 20 });
      setFilteredProducts(resp?.data || []);
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Filter ───────────────────────────────────────────────────────────────────
  const applyFilter = async (f) => {
    setActiveFilter(f);
    if (f === 'All') { setFilteredProducts(products); return; }
    setLoading(true);
    try {
      const resp = await fetchProducts(category, { tag: f, per_page: 20 });
      setFilteredProducts(resp?.data || []);
    } catch {
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // ─── Load more (infinite scroll stub) ────────────────────────────────────────
  const loadMore = async () => {
    if (loadingMore || currentPage >= lastPage) return;
    const nextPage = currentPage + 1;
    setLoadingMore(true);
    try {
      const resp = await fetchProducts(category, { per_page: 20, page: nextPage });
      const more = resp?.data || [];
      setProducts((prev) => [...prev, ...more]);
      setFilteredProducts((prev) => [...prev, ...more]);
      setCurrentPage(nextPage);
    } catch (err) {
      console.error('Load more failed', err);
    } finally {
      setLoadingMore(false);
    }
  };

  // ─── "Not found" state  ───────────────────────────────────────────────────────
  // Show not-found only when API confirmed the category doesn't exist AND static info is also missing
  const notFound = !loading && !staticInfo && !categoryInfo;

  if (notFound) {
    return (
      <IonPage>
        <IonHeader className="ion-no-border">
          <IonToolbar style={{ '--background': '#0C0C0C', '--border-color': 'transparent' }}>
            <IonButtons slot="start">
              <IonButton onClick={() => router.goBack()} style={{ '--color': '#C9A96E' }}>
                <IonIcon icon={chevronBack} />
              </IonButton>
            </IonButtons>
            <IonTitle style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: '1.1rem', letterSpacing: '0.18em', color: '#C9A96E', textAlign: 'center', textTransform: 'uppercase' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                <img src="/assets/perfume/anfas.jpg" alt="logo" style={{ width: '22px', height: '22px', objectFit: 'cover', borderRadius: '4px' }} referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }} />
                <span>{t('brand')}</span>
              </div>
            </IonTitle>
            <IonButtons slot="end"><LanguageToggle /></IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen style={{ '--background': '#0C0C0C' }}>
          <div style={{ padding: '2.5rem 1.25rem' }}>
            <p className="section-label" style={{ margin: 0, marginBottom: '0.5rem' }}>{t('category.notFoundLabel')}</p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: '1.8rem', color: '#F5F0E8', margin: 0 }}>
              {t('category.notFoundTitle')}
            </h1>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const catDisplayName = categoryInfo?.name
    ? t(`categories.${category}`, null, categoryInfo.name)
    : t(`categories.${category}`, null, category);

  const catTagline = tagline
    ? t(`taglines.${category}`, null, tagline)
    : t(`taglines.${category}`, null, '');

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': '#0C0C0C', '--border-color': 'transparent' }}>
          <IonButtons slot="start">
            <IonButton onClick={() => router.goBack()} style={{ '--color': '#C9A96E' }}>
              <IonIcon icon={chevronBack} />
            </IonButton>
          </IonButtons>
          <IonTitle style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: '1.4rem', letterSpacing: '0.2em', color: '#C9A96E', textAlign: 'center', textTransform: 'uppercase' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <img src="/assets/perfume/anfas.jpg" alt="logo" style={{ width: '26px', height: '26px', objectFit: 'cover', borderRadius: '4px' }} referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }} />
              <span>{t('brand')}</span>
            </div>
          </IonTitle>
          <IonButtons slot="end">
            <LanguageToggle />
            <IonButton onClick={openModal} style={{ '--color': '#C9A96E' }}>
              <IonIcon icon={optionsOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen style={{ '--background': '#0C0C0C' }}>

        {/* ── Hero Banner ── */}
        <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
          <img
            src={coverImage}
            alt={category}
            referrerPolicy="no-referrer"
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(12,12,12,0.3) 0%, rgba(12,12,12,0.85) 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '1.5rem' }}>
            <p className="section-label" style={{ margin: 0, marginBottom: '4px' }}>{catTagline}</p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: '2.2rem', color: '#F5F0E8', margin: 0, textTransform: 'capitalize' }}>
              {catDisplayName}
            </h1>
          </div>
        </div>

        {/* ── Search ── */}
        <div style={{ padding: '0.75rem 1rem 0' }}>
          <IonSearchbar
            color="light"
            animated
            placeholder={searchPlaceholder}
            onIonChange={(e) => performSearch(e)}
            style={{ '--background': '#1E1E1E', '--color': '#F5F0E8', '--placeholder-color': '#7A7A7A', '--icon-color': '#C9A96E', '--border-radius': '4px', '--box-shadow': 'none', padding: 0 }}
          />
        </div>

        {/* ── Filter chips ── */}
        <div style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem 1rem', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => applyFilter(f)}
              style={{
                background: activeFilter === f ? '#C9A96E' : '#1E1E1E',
                color: activeFilter === f ? '#0C0C0C' : '#7A7A7A',
                border: activeFilter === f ? '1px solid #C9A96E' : '1px solid #2A2A2A',
                borderRadius: '2px', padding: '4px 12px', fontSize: '0.65rem', fontWeight: 600,
                letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
                whiteSpace: 'nowrap', fontFamily: "'Jost', sans-serif",
              }}
            >
              {t(`filters.${f}`, null, f)}
            </button>
          ))}
        </div>

        {/* ── Gold Divider ── */}
        <div className="bellezza-divider" style={{ margin: '0.25rem 1rem 0.75rem' }} />

        {/* ── Product Grid (skeleton while loading) ── */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '0 1rem 6rem' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ background: '#151515', border: '1px solid #2A2A2A', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '200px', background: 'linear-gradient(90deg, #1a1a1a 25%, #252525 50%, #1a1a1a 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
                <div style={{ padding: '0.6rem 0.75rem 0.75rem' }}>
                  <div style={{ height: '12px', background: '#2A2A2A', borderRadius: '2px', marginBottom: '8px', width: '80%' }} />
                  <div style={{ height: '10px', background: '#2A2A2A', borderRadius: '2px', width: '50%' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Product Grid ── */}
        {!loading && (
          <div ref={productsRef} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '0 1rem 6rem' }}>
            {filteredProducts.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem 1rem', color: '#4A4A4A' }}>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem', margin: 0 }}>{t('productType.noProducts')}</p>
              </div>
            )}

            {filteredProducts.map((product, index) => {
              if (!product.image) return null;
              return (
                <div key={product.id || index} onClick={() => handleProductModal(product)} style={{ cursor: 'pointer' }}>
                  <div style={{ background: '#151515', border: '1px solid #2A2A2A', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ position: 'relative', height: '200px' }}>
                      <img
                        src={product.image}
                        alt={product.title}
                        referrerPolicy="no-referrer"
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      {product.discount > 0 && (
                        <span style={{ position: 'absolute', top: '8px', right: '8px', background: '#C9A96E', color: '#0C0C0C', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.08em', padding: '3px 6px', borderRadius: '2px' }}>
                          -{Math.round(product.discount)}%
                        </span>
                      )}
                    </div>
                    <div style={{ padding: '0.6rem 0.75rem 0.75rem' }}>
                      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.9rem', color: '#F5F0E8', margin: 0, marginBottom: '3px', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {product.title}
                      </p>
                      {product.reviews > 0 && <StarRating rating={product.reviews} />}
                      <p style={{ color: '#C9A96E', fontSize: '0.85rem', fontWeight: 500, margin: '4px 0 0' }}>
                        {product.price}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* ── Load More ── */}
            {currentPage < lastPage && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', paddingTop: '0.5rem' }}>
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  style={{
                    background: 'transparent',
                    border: '1px solid #2A2A2A',
                    color: '#C9A96E',
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    padding: '8px 24px',
                    cursor: loadingMore ? 'default' : 'pointer',
                    fontFamily: "'Jost', sans-serif",
                    opacity: loadingMore ? 0.5 : 1,
                  }}
                >
                  {loadingMore ? '...' : t('product.loadMore', null, 'Load More')}
                </button>
              </div>
            )}
          </div>
        )}

      </IonContent>
    </IonPage>
  );
};

export default Category;
