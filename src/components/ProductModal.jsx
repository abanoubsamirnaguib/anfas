import {
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonIcon,
  IonToolbar,
} from '@ionic/react';
import { closeOutline, heart, heartOutline, starSharp } from 'ionicons/icons';
import { useStoreState } from 'pullstate';
import { useState, useMemo } from 'react';

import { checkFavourites } from '../store/Selectors';
import { addToFavourites } from '../store/FavouritesStore';
import { FavouritesStore } from '../store';
import { ProductSpecificationsAccordion } from './ProductSpecificationsAccordion';
import { AddToCartButton } from './AddToCartButton';
import './ProductModal.css';
import { FALLBACK_IMG } from '../utils';
import { useI18n } from '../i18n';

const StarRow = ({ rating }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
    {[1, 2, 3, 4, 5].map((s) => (
      <IonIcon
        key={s}
        icon={starSharp}
        style={{
          color: s <= Math.round(rating) ? '#C9A96E' : '#2A2A2A',
          fontSize: '0.9rem',
        }}
      />
    ))}
    <span style={{ color: '#7A7A7A', fontSize: '0.75rem', marginLeft: '4px' }}>{rating} / 5</span>
  </div>
);

export const ProductModal = (props) => {
  const { dismiss, category = false, product } = props;
  const isFavourite = useStoreState(FavouritesStore, checkFavourites(product));
  const { t } = useI18n();

  // Build size options from product attributes (real backend data) or fall back to hardcoded
  const sizeOptions = useMemo(() => {
    const attrs = Array.isArray(product?.attributes) ? product.attributes : [];
    if (attrs.length > 0) {
      return attrs.map((a) => ({
        label: a.name,
        value: a.value,
        formatted_price: a.formatted_price,
        price: a.price,
      }));
    }
    // Static fallback (match accordion structure)
    return [
      { label: 'Standard', value: '', formatted_price: null },
    ];
  }, [product?.attributes]);

  const [selectedSize, setSelectedSize] = useState(
    sizeOptions.length > 1
      ? sizeOptions[1].value  // default to middle size
      : sizeOptions[0]?.value || '50 ml'
  );

  // Determine displayed price based on selected size
  const selectedAttr = sizeOptions.find((o) => o.value === selectedSize);
  const displayPrice = selectedAttr?.formatted_price || selectedAttr?.price
    ? (selectedAttr.formatted_price || `L.E ${Math.round(selectedAttr.price)}`)
    : product.price;

  return (
    <>
      <IonContent style={{ '--background': '#0C0C0C' }}>

        {/* ── Product Image ── */}
        <div style={{ position: 'relative' }}>
          <img
            src={product.image}
            alt={product.title}
            referrerPolicy="no-referrer"
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }}
            style={{ width: '100%', height: '320px', objectFit: 'cover', display: 'block' }}
          />
          {/* Gradient overlay */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '80px',
              background: 'linear-gradient(0deg, #0C0C0C, transparent)',
            }}
          />

          {/* Close button */}
          <IonButtons
            style={{
              position: 'absolute',
              top: '12px',
              right: '8px',
            }}
          >
            <IonButton
              onClick={dismiss}
              style={{
                '--background': 'rgba(12,12,12,0.7)',
                '--color': '#F5F0E8',
                '--border-radius': '50%',
                '--padding-start': '6px',
                '--padding-end': '6px',
              }}
            >
              <IonIcon icon={closeOutline} style={{ fontSize: '1.3rem' }} />
            </IonButton>
          </IonButtons>

          {/* Fave button */}
          <IonButtons
            style={{
              position: 'absolute',
              top: '12px',
              left: '8px',
            }}
          >
            <IonButton
              onClick={() => addToFavourites(product, category)}
              style={{
                '--background': 'rgba(12,12,12,0.7)',
                '--color': isFavourite ? '#CF6679' : '#F5F0E8',
                '--border-radius': '50%',
                '--padding-start': '6px',
                '--padding-end': '6px',
              }}
            >
              <IonIcon icon={isFavourite ? heart : heartOutline} style={{ fontSize: '1.3rem' }} />
            </IonButton>
          </IonButtons>
        </div>

        {/* ── Product Details ── */}
        <div style={{ padding: '1.25rem 1.25rem 0' }}>

          {/* Category tag */}
          <p className="section-label" style={{ marginBottom: '6px' }}>
            {category ? t(`categories.${category}`, null, category) : t('brand')} · {product.reviews && `${product.reviews} / 5`}
          </p>

          {/* Title */}
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 300,
              fontSize: '1.9rem',
              color: '#F5F0E8',
              margin: '0 0 6px',
              lineHeight: 1.2,
            }}
          >
            {product.title}
          </h1>

          {/* Reviews */}
          {product.reviews && <StarRow rating={product.reviews} />}

          {/* Price */}
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '1.5rem',
              color: '#C9A96E',
              fontWeight: 400,
              margin: '0.75rem 0 0',
              letterSpacing: '0.05em',
            }}
          >
            {displayPrice}
          </p>
        </div>

        {/* ── Gold Divider ── */}
        <div className="bellezza-divider" style={{ margin: '1rem 1.25rem' }} />

        {/* ── Size Selector ── */}
        <div style={{ padding: '0 1.25rem' }}>
          <p className="section-label" style={{ marginBottom: '0.6rem' }}>{t('product.size')}</p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {sizeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSelectedSize(opt.value)}
                style={{
                  background: selectedSize === opt.value ? '#C9A96E' : '#1E1E1E',
                  color: selectedSize === opt.value ? '#0C0C0C' : '#7A7A7A',
                  border: selectedSize === opt.value ? '1px solid #C9A96E' : '1px solid #2A2A2A',
                  borderRadius: '2px',
                  padding: '6px 14px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  cursor: 'pointer',
                  fontFamily: "'Jost', sans-serif",
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                }}
              >
                <span>{opt.label || opt.name || opt.value}</span>
                <span style={{ display: 'block', fontSize: '0.65rem', marginTop: '2px', opacity: 0.9 }}>
                  {opt.value}{opt.formatted_price ? ` — ${opt.formatted_price}` : ''}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Description ── */}
        <div style={{ padding: '1rem 1.25rem 0' }}>
          <p className="section-label" style={{ marginBottom: '0.5rem' }}>{t('product.about')}</p>
          <p
            style={{
              color: '#7A7A7A',
              fontSize: '0.88rem',
              lineHeight: 1.7,
              margin: 0,
              fontFamily: "'Jost', sans-serif",
            }}
          >
            {product.description || t('product.description')}
          </p>
        </div>

        {/* ── Specifications ── */}
        <div style={{ padding: '1rem 1.25rem 2rem' }}>
          <ProductSpecificationsAccordion type={category} product={product} />
        </div>

      </IonContent>

      {/* ── Footer CTA ── */}
      <IonFooter style={{ '--background': '#111111', borderTop: '1px solid #2A2A2A' }}>
        <IonToolbar style={{ '--background': '#111111', '--padding-start': '1rem', '--padding-end': '1rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.5rem 0',
            }}
          >
            <div style={{ flex: '0 0 auto' }}>
              <p style={{ margin: 0, color: '#7A7A7A', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {t('product.price')}
              </p>
              <p
                style={{
                  margin: 0,
                  color: '#C9A96E',
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '1.3rem',
                  fontWeight: 400,
                }}
              >
                {displayPrice}
              </p>
            </div>
            <div style={{ flex: 1 }}>
              <AddToCartButton product={{ ...product, price: displayPrice }} size={selectedSize} />
            </div>
          </div>
        </IonToolbar>
      </IonFooter>
    </>
  );
};