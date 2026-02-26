import { useStoreState } from "pullstate";
import { useEffect, useState } from "react";
import { CartStore } from "../store";
import { increaseQty, decreaseQty, removeFromCart } from "../store/CartStore";
import { getCart } from "../store/Selectors";
import { FALLBACK_IMG } from "../utils";
import { useI18n } from '../i18n';
import { sendWhatsappMessage, validateDiscountCode, fetchSettings } from '../services/api';

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
} = require("@ionic/react");
const { closeOutline, trashOutline } = require("ionicons/icons");

export const CartModal = (props) => {
  const cart = useStoreState(CartStore, getCart);
  const [totalPrice, setTotalPrice] = useState(0);
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  // Discount coupon state
  const [discountCode, setDiscountCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountError, setDiscountError] = useState('');
  const [applyingDiscount, setApplyingDiscount] = useState(false);
  const [waPhone, setWaPhone] = useState('201068644570');

  useEffect(() => {
    fetchSettings().then(s => {
      if (s?.whatsapp_phone) setWaPhone(s.whatsapp_phone);
    }).catch(() => {});
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

  const handleCheckout = async () => {
    if (!cart || cart.length === 0) return;
    if (!name.trim() || !address.trim() || !phone.trim()) {
      window.alert((t && t('cart.fillDetails')) || 'Please enter your name, address and phone number before checkout.');
      return;
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
        customer_address: address,
        message: message,
        order_details: order_details,
        total_amount: totalPrice,
        discount_code: discountApplied ? discountCode : null,
        discount_amount: discountAmount || 0,
        final_amount: finalTotal,
      };

      await sendWhatsappMessage(apiPayload);
    } catch (err) {
      console.error('Failed to save whatsapp message:', err);
    }

    const url = `https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
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
                  <p style={{ color: '#C9A96E', fontSize: '0.85rem', fontWeight: 500, margin: 0 }}>
                    {(() => {
                      const raw = String(item.price || '').replace(/[^0-9]/g, '');
                      const num = parseFloat(raw) || 0;
                      return `${num.toFixed(2)} L.E`;
                    })()}
                  </p>
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

          <IonButton
            type="button"
            expand="block"
            onClick={handleCheckout}
            style={{
              "--background": "#C9A96E",
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
    </IonPage>
  );
};