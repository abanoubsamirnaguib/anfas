import {
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonIcon,
  IonToolbar,
  IonToast,
} from '@ionic/react';
import { closeOutline, heart, heartOutline, starSharp, shareOutline } from 'ionicons/icons';
import { useStoreState } from 'pullstate';
import { useState, useMemo, useRef, useCallback } from 'react';

import { checkFavourites } from '../store/Selectors';
import { addToFavourites } from '../store/FavouritesStore';
import { FavouritesStore } from '../store';
import { ProductSpecificationsAccordion } from './ProductSpecificationsAccordion';
import { AddToCartButton } from './AddToCartButton';
import './ProductModal.css';
import { FALLBACK_IMG, sortProductAttributes, hasDiscount } from '../utils';
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
  const { dismiss, category: categoryProp = false, product } = props;
  const isFavourite = useStoreState(FavouritesStore, checkFavourites(product));
  const { t, language } = useI18n();
  const [showToast, setShowToast] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const galleryRef = useRef(null);

  // Build gallery: optional video first, then gallery images + cover image merged, deduplicated
  const galleryItems = useMemo(() => {
    const extra = Array.isArray(product?.images) ? product.images : [];

    // Normalize images
    let imageItems;
    if (extra.length > 0) {
      const coverUrl = product?.image || null;
      const hasMain = extra.some((img) => img.url === coverUrl);
      if (coverUrl && !hasMain) {
        imageItems = [{ id: 'cover', url: coverUrl, alt_text: product.title, type: 'image' }, ...extra.map((img) => ({
          ...img,
          type: 'image',
        }))];
      } else {
        imageItems = extra.map((img) => ({
          ...img,
          type: 'image',
        }));
      }
    } else {
      imageItems = product?.image ? [{ id: 'cover', url: product.image, alt_text: product.title, type: 'image' }] : [];
    }

    // Optional video as first item
    if (product?.video_url) {
      return [
        { id: 'video', url: product.video_url, alt_text: product.title, type: 'video' },
        ...imageItems,
      ];
    }

    return imageItems;
  }, [product?.images, product?.image, product?.video_url]);

  const handleGalleryScroll = useCallback(() => {
    if (!galleryRef.current) return;
    const { scrollLeft, offsetWidth } = galleryRef.current;
    setActiveSlide(Math.round(scrollLeft / offsetWidth));
  }, []);

  const scrollToSlide = (index) => {
    if (!galleryRef.current) return;
    galleryRef.current.scrollTo({ left: index * galleryRef.current.offsetWidth, behavior: 'smooth' });
  };

  // Determine category: use prop first, fallback to product's category
  const category = categoryProp || product?.category?.slug;

  const productDescription =
    language === 'ar'
      ? (product.description_ar || product.description)
      : product.description;

  // Build size options from product attributes (real backend data) or fall back to hardcoded
  const sizeOptions = useMemo(() => {
    const sortedAttrs = sortProductAttributes(product);
    if (sortedAttrs.length > 0) {
      return sortedAttrs.map((a) => ({
        label: a.name,
        value: a.value,
        formatted_price: a.formatted_price,
        formatted_original_price: a.formatted_original_price,
        price: a.price,
        original_price: a.original_price,
        discount: a.discount || 0,
      }));
    }
    // Static fallback (match accordion structure)
    return [
      { label: 'Standard', value: '', formatted_price: null, discount: product.discount || 0 },
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
  
  // Get original price and discount from selected attribute
  const originalPrice = useMemo(() => {
    // Check if selected attribute has a discount
    const attrDiscount = selectedAttr?.discount || 0;
    
    if (attrDiscount > 0) {
      // Use attribute's original price
      return selectedAttr?.formatted_original_price || 
             (selectedAttr?.original_price ? `L.E ${Math.round(selectedAttr.original_price)}` : null);
    }
    
    // Check if product has discount (for products without attributes)
    if (product.discount > 0 && !product.has_attributes) {
      return product.original_price;
    }
    
    return null;
  }, [selectedAttr, product]);
  
  const activeDiscount = selectedAttr?.discount || (product.has_attributes ? 0 : product.discount) || 0;

  // Handle share functionality
  const handleShare = async () => {
    const productUrl = product?.slug && category 
      ? `${window.location.origin}/categories/${category}/products/${product.slug}`
      : window.location.href;
    
    const shareData = {
      title: product.title,
      text: productDescription || product.title,
      url: productUrl,
    };

    try {
      // Try using Web Share API if available
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(productUrl);
        setShowToast(true);
      }
    } catch (err) {
      // User cancelled or error occurred
      if (err.name !== 'AbortError') {
        console.error('Error sharing:', err);
        // Try clipboard as fallback
        try {
          await navigator.clipboard.writeText(productUrl);
          setShowToast(true);
        } catch (clipErr) {
          console.error('Error copying to clipboard:', clipErr);
        }
      }
    }
  };

  return (
    <>
      <IonContent style={{ '--background': '#0C0C0C' }}>

        {/* ── Image Gallery Slider ── */}
        <div style={{ position: 'relative' }}>

          {/* Scrollable strip */}
          <div
            ref={galleryRef}
            onScroll={handleGalleryScroll}
            className="product-gallery-strip"
            style={{
              display: 'flex',
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              height: '320px',
              direction: 'ltr',
            }}
          >
            {galleryItems.length > 0 ? galleryItems.map((item, idx) => (
              item.type === 'video' ? (
                <video
                  key={item.id ?? `video-${idx}`}
                  src={item.url}
                  controls
                  muted
                  playsInline
                  autoPlay
                  loop
                  style={{
                    flexShrink: 0,
                    width: '100%',
                    height: '320px',
                    objectFit: 'cover',
                    display: 'block',
                    scrollSnapAlign: 'start',
                    backgroundColor: '#000',
                  }}
                />
              ) : (
                <img
                  key={item.id ?? idx}
                  src={item.url}
                  alt={item.alt_text || product.title}
                  referrerPolicy="no-referrer"
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }}
                  style={{
                    flexShrink: 0,
                    width: '100%',
                    height: '320px',
                    objectFit: 'cover',
                    display: 'block',
                    scrollSnapAlign: 'start',
                  }}
                />
              )
            )) : (
              <img
                src={FALLBACK_IMG}
                alt={product.title}
                style={{ flexShrink: 0, width: '100%', height: '320px', objectFit: 'cover', display: 'block', scrollSnapAlign: 'start' }}
              />
            )}
          </div>

          {/* Gradient overlay — shortened so it doesn't cover thumbnails area */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '60px',
              background: 'linear-gradient(0deg, #0C0C0C, transparent)',
              pointerEvents: 'none',
            }}
          />

          {/* Discount badge */}
          {activeDiscount > 0 && (
            <div
              style={{
                position: 'absolute',
                bottom: '12px',
                right: '12px',
                background: '#C9A96E',
                color: '#0C0C0C',
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                padding: '5px 10px',
                borderRadius: '3px',
              }}
            >
              -{Math.round(activeDiscount)}% OFF
            </div>
          )}

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

          {/* Share button */}
          <IonButtons
            style={{
              position: 'absolute',
              top: '12px',
              left: '60px',
            }}
          >
            <IonButton
              onClick={handleShare}
              style={{
                '--background': 'rgba(12,12,12,0.7)',
                '--color': '#F5F0E8',
                '--border-radius': '50%',
                '--padding-start': '6px',
                '--padding-end': '6px',
              }}
            >
              <IonIcon icon={shareOutline} style={{ fontSize: '1.3rem' }} />
            </IonButton>
          </IonButtons>
        </div>

        {/* ── Thumbnail Strip ── */}
        {galleryItems.length > 1 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px 12px',
              overflowX: 'auto',
              background: '#0C0C0C',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              direction: 'ltr',
            }}
            className="product-gallery-strip"
          >
            {galleryItems.map((item, i) => (
              <button
                key={item.id ?? i}
                onClick={() => scrollToSlide(i)}
                aria-label={`View media ${i + 1}`}
                style={{
                  flexShrink: 0,
                  width: '52px',
                  height: '52px',
                  padding: 0,
                  border: i === activeSlide ? '2px solid #C9A96E' : '2px solid transparent',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  background: 'transparent',
                  outline: 'none',
                  opacity: i === activeSlide ? 1 : 0.5,
                  transition: 'border-color 0.2s, opacity 0.2s',
                }}
              >
                {item.type === 'video' ? (
                  <video
                    src={item.url}
                    muted
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', pointerEvents: 'none', backgroundColor: '#000' }}
                  />
                ) : (
                  <img
                    src={item.url}
                    alt={item.alt_text || `Image ${i + 1}`}
                    referrerPolicy="no-referrer"
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', pointerEvents: 'none' }}
                  />
                )}
              </button>
            ))}
          </div>
        )}

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
            {productDescription || t('product.description')}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {originalPrice && (
                  <p
                    style={{
                      margin: 0,
                      color: '#EF4444',
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: '1rem',
                      fontWeight: 700,
                      textDecoration: 'line-through',
                    }}
                  >
                    {originalPrice}
                  </p>
                )}
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
            </div>
            <div style={{ flex: 1 }}>
              <AddToCartButton product={{ ...product, price: displayPrice }} size={selectedSize} />
            </div>
          </div>
        </IonToolbar>
      </IonFooter>

      {/* Toast for clipboard copy */}
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={t('product.linkCopied', null, 'Link copied to clipboard!')}
        duration={2000}
        position="bottom"
        color="success"
      />
    </>
  );
};