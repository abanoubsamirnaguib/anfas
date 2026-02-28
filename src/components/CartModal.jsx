import { useStoreState } from "pullstate";
import { useEffect, useState } from "react";
import { CartStore } from "../store";
import { increaseQty, decreaseQty, removeFromCart, clearCart, addToCart } from "../store/CartStore";
import { getCart } from "../store/Selectors";
import { FALLBACK_IMG } from "../utils";
import { useI18n } from '../i18n';
import { sendWhatsappMessage, validateDiscountCode, fetchSettings, fetchSuggestedProducts } from '../services/api';
import { ProductModal } from './ProductModal';

const {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonIcon,
  IonContent,
  IonInput,
  IonLabel,
  IonThumbnail,
  IonFooter,
  IonButton,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonItem,
  IonModal,
  useIonToast,
} = require("@ionic/react");
const { closeOutline, trashOutline } = require("ionicons/icons");

export const CartModal = (props) => {
  const cart = useStoreState(CartStore, getCart);
  const [totalPrice, setTotalPrice] = useState(0);
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [present] = useIonToast();

  // Discount coupon state
  const [discountCode, setDiscountCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountError, setDiscountError] = useState('');
  const [applyingDiscount, setApplyingDiscount] = useState(false);
  const [waPhone, setWaPhone] = useState('201234567899');
  const [igUsername, setIgUsername] = useState('');
  const [sendChannel, setSendChannel] = useState('whatsapp'); // 'whatsapp' | 'instagram'

  // Suggested products state
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);

  // Derived: which channels are available based on admin settings
  const hasWhatsapp = !!waPhone;
  const hasInstagram = !!igUsername;

  // Extract Instagram username from a URL like https://instagram.com/yourprofile
  const parseIgUsername = (url) => {
    if (!url) return '';
    try {
      const u = new URL(url);
      const parts = u.pathname.replace(/\/+$/, '').split('/').filter(Boolean);
      return parts.length > 0 ? parts[parts.length - 1].replace(/^@/, '') : '';
    } catch {
      // Not a URL, treat as plain username
      return url.replace(/^@/, '').trim();
    }
  };

  useEffect(() => {
    fetchSettings().then(s => {
      if (s?.whatsapp_phone) setWaPhone(s.whatsapp_phone);
      const username = parseIgUsername(s?.social_instagram);
      if (username) setIgUsername(username);
      // Auto-select the only available channel
      const wa = !!s?.whatsapp_phone;
      const ig = !!username;
      if (ig && !wa) setSendChannel('instagram');
      else setSendChannel('whatsapp');
    }).catch(() => {});

    // Fetch suggested products
    fetchSuggestedProducts(10).then(products => {
      console.log('Suggested products fetched:', products);
      setSuggestedProducts(products || []);
    }).catch((error) => {
      console.error('Error fetching suggested products:', error);
      setSuggestedProducts([]);
    });
  }, []);

  const finalTotal = Math.max(0, totalPrice - discountAmount);

  const applyDiscount = async () => {
    if (!discountCode.trim()) return;
    setApplyingDiscount(true);
    setDiscountError('');
    try {
      const res = await validateDiscountCode(discountCode.trim(), totalPrice);
      if (res.valid) {
        setDiscountAmount(Number(res.discount_amount) || 0);
        setDiscountApplied(true);
      } else {
        setDiscountAmount(0);
        setDiscountApplied(false);
        setDiscountError(res.message || t('cart.discountInvalid'));
      }
    } catch {
      setDiscountAmount(0);
      setDiscountApplied(false);
      setDiscountError(t('cart.discountInvalid'));
    } finally {
      setApplyingDiscount(false);
    }
  };

  const removeDiscount = () => {
    setDiscountCode('');
    setDiscountAmount(0);
    setDiscountApplied(false);
    setDiscountError('');
  };

  const handleQuickAddToCart = (product) => {
    // Add first attribute or base price to cart
    const firstAttr = product.attributes && product.attributes.length > 0 ? product.attributes[0] : null;
    const price = firstAttr ? firstAttr.formatted_price : product.price;
    const size = firstAttr ? firstAttr.value : null;
    
    addToCart({
      id: product.id,
      title: product.title,
      image: product.image,
      price: price,
      size: size,
    });

    present({
      message: t('cart.addedToBag'),
      duration: 1500,
      position: 'bottom',
      color: 'success',
    });
  };

  const handleOpenProduct = (product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleCheckout = async () => {
    if (!cart || cart.length === 0) return;
    
    // For WhatsApp channel, require whatsapp number
    if (sendChannel === 'whatsapp') {
      if (!name.trim() || !address.trim() || !phone.trim() || !whatsappNumber.trim()) {
        window.alert((t && t('cart.fillDetails')) || 'Please enter your name, address, phone number, and WhatsApp number before checkout.');
        return;
      }
    } else {
      // For Instagram, whatsapp number is optional
      if (!name.trim() || !address.trim() || !phone.trim()) {
        window.alert((t && t('cart.fillDetails')) || 'Please enter your name, address, and phone number before checkout.');
        return;
      }
    }

    const fmt = (n) => {
      const num = Number(n) || 0;
      return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' L.E';
    };

    const lines = [];
    lines.push((t && t('cart.orderSummary')) || 'Order Summary');
    lines.push(' ');
    lines.push(`${t('cart.name')}: ${name}`);
    lines.push(`${t('cart.phone')}: ${phone}`);
    if (whatsappNumber.trim()) {
      lines.push(`${t('cart.whatsappNumber')}: ${whatsappNumber}`);
    }
    lines.push(`${t('cart.address')}: ${address}`);
    lines.push(' ');
    lines.push(` ${t('cart.items')} : `);
    cart.forEach((item) => {
      const raw = String(item.price || '').replace(/[^0-9]/g, "");
      const unit = parseFloat(raw) || 0;
      const qty = item.qty || 1;
      const subtotal = unit * qty;
      const sizeText = item.size ? ` (${item.size})` : '';
      lines.push(`- ${item.title}${sizeText} x${qty} — ${fmt(subtotal)}`);
    });
    lines.push('');
    lines.push(`${t('cart.subtotal')}: ${fmt(totalPrice)}`);
    if (discountApplied && discountAmount > 0) {
      lines.push(`${t('cart.discountAmount')} (${discountCode}): -${fmt(discountAmount)}`);
      lines.push(`${t('cart.finalTotal')}: ${fmt(finalTotal)}`);
    } else {
      lines.push(`Total: ${fmt(totalPrice)}`);
    }
    lines.push('');

    const message = lines.join('\n');

    // Build the target URL based on selected channel
    let targetUrl;
    if (sendChannel === 'instagram') {
      targetUrl = `https://ig.me/m/${igUsername}`;
    } else {
      targetUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`;
    }

    // Open the window NOW (inside user-gesture context) so browsers won't block it
    const newWindow = window.open('about:blank', '_blank');

    try {
      // map cart items to order_details expected by the API
      const order_details = cart.map(i => {
        const raw = String(i.price || '').replace(/[^0-9.]/g, "");
        const unit = parseFloat(raw) || 0;
        const qty = i.qty || 1;
        return {
          product_id: i.id || null,
          product_name: i.title,
          attribute_id: null,
          attribute_name: i.size ? 'size' : null,
          attribute_value: i.size || null,
          quantity: qty,
          unit_price: unit,
          subtotal: unit * qty,
        };
      });

      const apiPayload = {
        customer_name: name,
        customer_phone: phone,
        customer_whatsapp: whatsappNumber || null,
        customer_address: address,
        message: message,
        channel: sendChannel,
        order_details: order_details,
        total_amount: totalPrice,
        discount_code: discountApplied ? discountCode : null,
        discount_amount: discountAmount || 0,
        final_amount: finalTotal,
      };

      await sendWhatsappMessage(apiPayload);
    } catch (err) {
      console.error('Failed to save order message:', err);
    }

    // Navigate the already-opened window to the target URL
    if (newWindow) {
      newWindow.location.href = targetUrl;
    } else {
      window.location.href = targetUrl;
    }
    
    // Show success toast
    const toastMsg = sendChannel === 'instagram'
      ? (t('cart.orderSentInstagram') || 'تم إرسال الطلب إلى انستجرام بنجاح!')
      : (t('cart.orderSentWhatsapp') || 'تم إرسال الطلب إلى واتساب بنجاح!');
    present({
      message: toastMsg,
      duration: 2000,
      position: 'top',
      color: 'success',
    });
    
    // Clear cart and close modal
    clearCart();
    if (props.close) {
      props.close();
    }
  };

  useEffect(() => {
    let total = 0;
    cart.forEach((item) => {
      const raw = String(item.price || '').replace(/[^0-9]/g, "");
      const unit = parseFloat(raw) || 0;
      const qty = item.qty || 1;
      total += unit * qty;
    });
    setTotalPrice(total);
    // Reset discount when cart contents change
    setDiscountAmount(0);
    setDiscountApplied(false);
    setDiscountError('');
  }, [cart]);

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar
          style={{
            "--background": "#0C0C0C",
            "--border-color": "transparent",
            "--padding-start": "1rem",
            "--padding-end": "1rem",
          }}
        >
          <IonTitle
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 300,
              fontSize: "1.4rem",
              letterSpacing: "0.25em",
              color: "#C9A96E",
              textTransform: "uppercase",
            }}
          >
            {t('cart.title')}
          </IonTitle>
          <IonButtons slot="end" onClick={props.close}>
            <IonIcon
              icon={closeOutline}
              style={{ color: "#C9A96E", fontSize: "1.5rem", cursor: "pointer" }}
            />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent style={{ "--background": "#0C0C0C" }}>
        {/* ── Summary Row ── */}
        <div
          style={{
            padding: "1rem 1.25rem",
            borderBottom: "1px solid #2A2A2A",
          }}
        >
            <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1rem",
              color: "#F5F0E8",
              margin: 0,
            }}
          >
            {t('cart.itemsInBag', {
              count: (cart || []).reduce((s, it) => s + (it.qty || 1), 0),
              itemLabel: (cart || []).reduce((s, it) => s + (it.qty || 1), 0) === 1 ? t('cart.itemSingular') : t('cart.itemPlural'),
            })}
          </p>
          <p
            style={{
              fontSize: "0.72rem",
              color: "#7A7A7A",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              margin: "4px 0 0",
            }}
          >
            {t('cart.reviewCheckout')}
          </p>
        </div>

        {/* ── Cart Items ── */}
        {cart.length === 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "60vh",
            }}
          >
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.5rem",
                color: "#2A2A2A",
                margin: 0,
              }}
            >
              {t('cart.emptyTitle')}
            </p>
            <p style={{ color: "#7A7A7A", fontSize: "0.8rem" }}>{t('cart.emptySubtitle')}</p>
          </div>
        )}

        {cart.map((item, index) => (
          <IonItemSliding key={index}>
            <IonItem
              lines="none"
              style={{
                "--background": "#111111",
                "--color": "#F5F0E8",
                "--border-color": "#2A2A2A",
                "--inner-border-width": "0 0 1px 0",
                "--padding-start": "1.25rem",
                "--padding-end": "1.25rem",
                paddingTop: "0.75rem",
                paddingBottom: "0.75rem",
              }}
            >
              <IonThumbnail
                slot="start"
                style={{
                  width: "64px",
                  height: "80px",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </IonThumbnail>
              <IonLabel
                style={{ marginLeft: "0.75rem", display: 'flex', flexDirection: 'column' }}
                className="ion-text-wrap"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "1rem",
                      color: "#F5F0E8",
                      margin: 0,
                      lineHeight: 1.2,
                    }}
                  >
                    {item.title}{item.size ? ` • ${item.size}` : ''}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <p style={{ color: '#C9A96E', fontSize: '0.85rem', fontWeight: 500, margin: 0 }}>
                      {(() => {
                        const raw = String(item.price || '').replace(/[^0-9]/g, '');
                        const num = parseFloat(raw) || 0;
                        return `${num.toFixed(2)} L.E`;
                      })()}
                    </p>
                    {(item.qty || 1) > 1 && (
                      <p style={{ color: '#7A7A7A', fontSize: '0.7rem', fontWeight: 400, margin: '2px 0 0', fontStyle: 'italic' }}>
                        {(() => {
                          const raw = String(item.price || '').replace(/[^0-9]/g, '');
                          const num = parseFloat(raw) || 0;
                          const qty = item.qty || 1;
                          const total = num * qty;
                          return `Total: ${total.toFixed(2)} L.E`;
                        })()}
                      </p>
                    )}
                  </div>
                </div>

                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <IonButton type="button" size="small" onClick={() => decreaseQty(item, 1)}>-</IonButton>
                  <div style={{ color: '#F5F0E8' }}>{item.qty || 1}</div>
                  <IonButton type="button" size="small" onClick={() => increaseQty(item, 1)}>+</IonButton>
                </div>
              </IonLabel>
            </IonItem>

            <IonItemOptions side="end">
              <IonItemOption
                style={{ "--background": "#1E0A0A", "--color": "#CF6679", width: "75px" }}
                onClick={() => removeFromCart(item)}
              >
                <IonIcon icon={trashOutline} slot="icon-only" />
              </IonItemOption>
            </IonItemOptions>
          </IonItemSliding>
        ))}

        {/* ── Suggested Products Section ── */}
        {cart.length > 0 && suggestedProducts.length > 0 && (
          <>
            {/* Divider */}
            <div style={{
              height: '1px',
              background: 'linear-gradient(90deg, transparent 0%, #C9A96E 50%, transparent 100%)',
              margin: '1.5rem 0',
            }} />

            {/* Heading */}
            <div style={{ padding: '0 1.25rem', marginBottom: '0.75rem' }}>
              <h3 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '1rem',
                color: '#C9A96E',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                margin: 0,
                fontWeight: 300,
              }}>
                {t('cart.suggestedHeading')}
              </h3>
            </div>

            {/* Suggested Products Horizontal Scroll */}
            <div style={{
              padding: '0 0 1rem',
              display: 'flex',
              gap: '0.4rem',
              overflowX: 'auto',
              overflowY: 'hidden',
              paddingLeft: '1.25rem',
              paddingRight: '1.25rem',
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
            }}>
              {suggestedProducts.map((product) => {
                const hasDiscount = product.discount && product.discount > 0;
                return (
                  <div
                    key={product.id}
                    style={{
                      background: '#1A1A1A',
                      borderRadius: '4px',
                      border: '1px solid #2A2A2A',
                      display: 'flex',
                      flexDirection: 'column',
                      minWidth: '110px',
                      width: '110px',
                      flexShrink: 0,
                      scrollSnapAlign: 'start',
                    }}
                  >
                    {/* Product Image */}
                    <div
                      onClick={() => handleOpenProduct(product)}
                      style={{
                        width: '100%',
                        height: '80px',
                        borderRadius: '4px 4px 0 0',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        position: 'relative',
                      }}
                    >
                      <img
                        src={product.image}
                        alt={product.title}
                        referrerPolicy="no-referrer"
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                      {/* Discount Badge */}
                      {hasDiscount && (
                        <div style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          background: '#CF6679',
                          color: '#FFF',
                          fontSize: '0.6rem',
                          fontWeight: 700,
                          padding: '2px 4px',
                          borderRadius: '3px',
                          lineHeight: 1,
                          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                        }}>
                          -{Math.round(product.discount)}%
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div style={{ 
                      padding: '0.4rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.2rem',
                      flex: 1,
                    }}>
                      <p 
                        onClick={() => handleOpenProduct(product)}
                        style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          fontSize: '0.7rem',
                          color: '#F5F0E8',
                          margin: 0,
                          lineHeight: 1.1,
                          cursor: 'pointer',
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          textOverflow: 'ellipsis',
                          minHeight: '1.8em',
                        }}
                      >
                        {product.title}
                      </p>
                      {product.description && (
                        <p style={{ fontSize: '0.6rem', color: '#7A7A7A', margin: '2px 0 0', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {product.description}
                        </p>
                      )}
                      <p style={{
                        color: '#C9A96E',
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        margin: 0,
                      }}>
                        {product.price}
                      </p>

                      {/* Add Icon Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickAddToCart(product);
                        }}
                        style={{
                          width: '24px',
                          height: '24px',
                          background: '#C9A96E',
                          border: 'none',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'transform 0.2s',
                          alignSelf: 'flex-end',
                          marginTop: 'auto',
                        }}
                        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        {/* Shopping bag + plus icon */}
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#0C0C0C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                          <line x1="3" y1="6" x2="21" y2="6" />
                          <line x1="12" y1="11" x2="12" y2="17" />
                          <line x1="9" y1="14" x2="15" y2="14" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </IonContent>

      {/* ── Footer ── */}
      <IonFooter
        style={{
          "--background": "#111111",
          borderTop: "1px solid #2A2A2A",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div style={{ padding: "1rem 1.25rem" }}>
          {/* Contact fields */}
          <div style={{ marginBottom: '0.75rem' }}>
            <IonInput placeholder={(t && t('cart.name')) || 'Name'} value={name} onIonChange={e => setName(e.detail.value)} style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem', background: '#0C0C0C', color: '#F5F0E8' }} />
            <IonInput placeholder={(t && t('cart.phone')) || 'Phone'} value={phone} onIonChange={e => setPhone(e.detail.value)} style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem', background: '#0C0C0C', color: '#F5F0E8' }} />
            <IonInput placeholder={(t && t('cart.whatsappNumber')) || 'WhatsApp Number'} value={whatsappNumber} onIonChange={e => setWhatsappNumber(e.detail.value)} style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem', background: '#0C0C0C', color: '#F5F0E8' }} />
            <IonInput placeholder={(t && t('cart.address')) || 'Address'} value={address} onIonChange={e => setAddress(e.detail.value)} style={{ width: '100%', padding: '0.5rem', background: '#0C0C0C', color: '#F5F0E8' }} />
          </div>

          {/* Discount coupon row */}
          <div style={{ marginBottom: '0.85rem' }}>
            {!discountApplied ? (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <div style={{ flex: 1, background: '#0C0C0C', border: '1px solid #2A2A2A', borderRadius: '2px', overflow: 'hidden' }}>
                  <IonInput
                    placeholder={t('cart.discountPlaceholder')}
                    value={discountCode}
                    onIonChange={e => setDiscountCode(e.detail.value)}
                    style={{ '--color': '#F5F0E8', '--placeholder-color': '#555', padding: '0 0.5rem' }}
                    onKeyDown={e => { if (e.key === 'Enter') applyDiscount(); }}
                  />
                </div>
                <IonButton
                  type="button"
                  size="small"
                  disabled={applyingDiscount || !discountCode.trim()}
                  onClick={applyDiscount}
                  style={{
                    '--background': '#2A2A2A',
                    '--color': '#C9A96E',
                    '--border-radius': '2px',
                    '--box-shadow': 'none',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    fontSize: '0.7rem',
                    textTransform: 'uppercase',
                    minWidth: '64px',
                  }}
                >
                  {applyingDiscount ? '...' : t('cart.applyDiscount')}
                </IonButton>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0D1E10', border: '1px solid #1D4228', borderRadius: '2px', padding: '0.5rem 0.75rem' }}>
                <span style={{ color: '#4CAF50', fontSize: '0.78rem', fontWeight: 600 }}>
                  {t('cart.discountApplied')} — <span style={{ color: '#C9A96E' }}>{discountCode.toUpperCase()}</span>
                </span>
                <span
                  onClick={removeDiscount}
                  style={{ color: '#7A7A7A', fontSize: '0.7rem', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  {t('cart.removing')}
                </span>
              </div>
            )}
            {discountError && (
              <p style={{ color: '#CF6679', fontSize: '0.72rem', margin: '4px 0 0' }}>{discountError}</p>
            )}
          </div>

          {/* Price breakdown */}
          <div style={{ marginBottom: '1rem' }}>
            {discountApplied && discountAmount > 0 ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1rem', color: '#7A7A7A', margin: 0 }}>
                    {t('cart.subtotal')}
                  </p>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1rem', color: '#7A7A7A', margin: 0 }}>
                    {totalPrice.toFixed(2)} L.E
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1rem', color: '#4CAF50', margin: 0 }}>
                    {t('cart.discountAmount')}
                  </p>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1rem', color: '#4CAF50', margin: 0 }}>
                    -{discountAmount.toFixed(2)} L.E
                  </p>
                </div>
                <div style={{ borderTop: '1px solid #2A2A2A', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', color: '#7A7A7A', margin: 0 }}>
                    {t('cart.total')}
                  </p>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem', color: '#C9A96E', fontWeight: 400, margin: 0, letterSpacing: '0.05em' }}>
                    {finalTotal.toFixed(2)} L.E
                  </p>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', color: '#7A7A7A', margin: 0 }}>
                  {t('cart.total')}
                </p>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem', color: '#C9A96E', fontWeight: 400, margin: 0, letterSpacing: '0.05em' }}>
                  {totalPrice.toFixed(2)} L.E
                </p>
              </div>
            )}
          </div>

          {/* ── Channel chooser (WhatsApp / Instagram) ── */}
          {(hasWhatsapp || hasInstagram) && (hasWhatsapp && hasInstagram) && (
            <div style={{ marginBottom: '0.85rem' }}>
              <p style={{
                fontSize: '0.72rem',
                color: '#7A7A7A',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                margin: '0 0 8px',
              }}>
                {t('cart.sendVia')}
              </p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {/* WhatsApp button */}
                <button
                  type="button"
                  onClick={() => setSendChannel('whatsapp')}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '10px 12px',
                    border: sendChannel === 'whatsapp' ? '2px solid #25D366' : '1px solid #2A2A2A',
                    borderRadius: '6px',
                    background: sendChannel === 'whatsapp' ? 'rgba(37, 211, 102, 0.1)' : '#0C0C0C',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill={sendChannel === 'whatsapp' ? '#25D366' : '#7A7A7A'}>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span style={{
                    color: sendChannel === 'whatsapp' ? '#25D366' : '#7A7A7A',
                    fontSize: '0.8rem',
                    fontWeight: sendChannel === 'whatsapp' ? 600 : 400,
                    letterSpacing: '0.05em',
                  }}>
                    {t('cart.whatsapp')}
                  </span>
                </button>

                {/* Instagram button */}
                <button
                  type="button"
                  onClick={() => setSendChannel('instagram')}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '10px 12px',
                    border: sendChannel === 'instagram' ? '2px solid #E1306C' : '1px solid #2A2A2A',
                    borderRadius: '6px',
                    background: sendChannel === 'instagram' ? 'rgba(225, 48, 108, 0.1)' : '#0C0C0C',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill={sendChannel === 'instagram' ? '#E1306C' : '#7A7A7A'}>
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                  <span style={{
                    color: sendChannel === 'instagram' ? '#E1306C' : '#7A7A7A',
                    fontSize: '0.8rem',
                    fontWeight: sendChannel === 'instagram' ? 600 : 400,
                    letterSpacing: '0.05em',
                  }}>
                    {t('cart.instagram')}
                  </span>
                </button>
              </div>
            </div>
          )}

          <IonButton
            type="button"
            expand="block"
            onClick={handleCheckout}
            style={{
              "--background": sendChannel === 'instagram' ? "#E1306C" : "#C9A96E",
              "--color": "#0C0C0C",
              "--border-radius": "2px",
              "--box-shadow": "none",
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              fontSize: "0.75rem",
              fontFamily: "'Jost', sans-serif",
            }}
          >
            {t('cart.checkout')}
          </IonButton>
        </div>
      </IonFooter>

      {/* Product Details Modal */}
      <IonModal
        isOpen={showProductModal}
        onDidDismiss={() => {
          setShowProductModal(false);
          setSelectedProduct(null);
        }}
      >
        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            dismiss={() => {
              setShowProductModal(false);
              setSelectedProduct(null);
            }}
          />
        )}
      </IonModal>
    </IonPage>
  );
};