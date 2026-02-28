import {
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonRouterLink,
  IonTitle,
  IonToolbar,
  IonButtons,
  useIonModal,
  useIonRouter,
} from '@ionic/react';
import { heartOutline } from 'ionicons/icons';
import { useStoreState } from 'pullstate';
import { useState } from 'react';
import { ProductModal } from '../components/ProductModal';
import { LanguageToggle } from '../components/LanguageToggle';
import { FavouritesStore } from '../store';
import { getFavourites } from '../store/Selectors';
import { FALLBACK_IMG, getDisplayPrice, getOriginalPrice, hasDiscount } from '../utils';
import { useI18n } from '../i18n';

const Favourites = () => {
  const favourites = useStoreState(FavouritesStore, getFavourites);
  const { t } = useI18n();
  const router = useIonRouter();

  const [selectedProduct, setSelectedProduct] = useState([]);
  const [presentProductModal, dismissProductModal] = useIonModal(ProductModal, {
    dismiss: () => dismissProductModal(),
    product: selectedProduct,
  });

  const handleProductModal = (product) => {
    setSelectedProduct(product);
    presentProductModal();
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': '#0C0C0C', '--border-color': 'transparent' }}>
          <IonTitle
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 300,
              fontSize: '1.4rem',
              letterSpacing: '0.25em',
              color: '#C9A96E',
              textAlign: 'center',
              textTransform: 'uppercase',
            }}
          >
            <div onClick={() => { router.push('/'); setTimeout(() => window.location.hash = 'hero-section', 100); }} style={{ cursor: 'pointer' }}>
              {t('favourites.title')}
            </div>
          </IonTitle>
          <IonButtons slot="end">
            <LanguageToggle />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen style={{ '--background': '#0C0C0C' }}>

        {/* ── Empty State ── */}
        {favourites.length === 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '70vh',
              gap: '1rem',
            }}
          >
            <IonIcon
              icon={heartOutline}
              style={{ color: '#2A2A2A', fontSize: '4rem' }}
            />
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 300,
                color: '#3A3A3A',
                margin: 0,
                fontSize: '1.75rem',
              }}
            >
              {t('favourites.emptyTitle')}
            </h2>
            <p
              style={{
                color: '#4A4A4A',
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                margin: 0,
              }}
            >
              {t('favourites.emptySubtitle')}
            </p>
          </div>
        )}

        {/* ── Favourites Grid ── */}
        {favourites.length > 0 && (
          <>
            <div style={{ padding: '1.25rem 1.25rem 0.75rem' }}>
              <p className="section-label" style={{ margin: 0 }}>
                {t('favourites.saved', {
                  count: favourites.length,
                  itemLabel: favourites.length === 1 ? t('favourites.itemSingular') : t('favourites.itemPlural'),
                })}
              </p>
            </div>
            <div className="bellezza-divider" style={{ margin: '0 1.25rem 0.75rem' }} />
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                padding: '0 1.25rem 6rem',
              }}
            >
              {favourites.map((product, index) => {
                if (!product.image || product.image === '' || product.image.includes('Placeholder')) return null;
                return (
                  <div
                    key={index}
                    onClick={() => handleProductModal(product)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div
                      style={{
                        background: '#151515',
                        border: '1px solid #2A2A2A',
                        borderRadius: '4px',
                        overflow: 'hidden',
                      }}
                    >
                      <div style={{ position: 'relative', height: '200px' }}>
                        <img
                          src={product.image}
                          alt={product.title}
                          referrerPolicy="no-referrer"
                          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        {hasDiscount(product) && (
                          <span style={{ position: 'absolute', top: '8px', left: '8px', background: '#C9A96E', color: '#0C0C0C', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.08em', padding: '3px 6px', borderRadius: '2px' }}>
                            -{Math.round(product.discount)}%
                          </span>
                        )}
                        <div
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            color: '#CF6679',
                            fontSize: '1.1rem',
                          }}
                        >
                          ♥
                        </div>
                      </div>
                      <div style={{ padding: '0.6rem 0.75rem 0.75rem' }}>
                        <p
                          style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: '0.9rem',
                            color: '#F5F0E8',
                            margin: 0,
                            marginBottom: '3px',
                            lineHeight: 1.2,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {product.title}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {hasDiscount(product) && (
                            <p style={{ color: '#6B6B6B', fontSize: '0.75rem', fontWeight: 400, margin: 0, textDecoration: 'line-through' }}>
                              {getOriginalPrice(product)}
                            </p>
                          )}
                          <p style={{ color: '#C9A96E', fontSize: '0.85rem', fontWeight: 500, margin: 0 }}>
                            {getDisplayPrice(product)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Favourites;
