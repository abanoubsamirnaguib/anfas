# WhatsApp Order Integration Guide

## Overview

This system records complete cart orders when users checkout via WhatsApp. The order data includes multiple products, customer details, delivery address, and pricing.

## Key Design Principles

### ✅ Cart-Based Orders
- Users order **multiple products** from their cart
- Each product can have different **attributes/sizes** (10ml, 50ml, 100ml)
- Full order details are stored for tracking

### ✅ Attribute Pricing
- Each product attribute (size) has its **own independent price**
- The `product.base_price` is just a reference price
- Example:
  - Product: "Rose Elegance" (base_price: €50)
  - Attribute "10ml" → €15 (actual price)
  - Attribute "50ml" → €45 (actual price)
  - Attribute "100ml" → €85 (actual price)

### ✅ Address Storage
- Full shipping address is captured and stored
- Used for both WhatsApp message and admin tracking

## Database Schema

### `whatsapp_messages` Table

```sql
id                  BIGINT          -- Auto increment
customer_name       VARCHAR(255)    -- Customer full name
customer_phone      VARCHAR(255)    -- Phone with country code
customer_address    TEXT            -- Full shipping address
message             TEXT            -- Complete formatted message sent to WhatsApp
order_details       JSON            -- Cart items with all details
total_amount        DECIMAL(10,2)   -- Cart subtotal before discount
discount_code       VARCHAR(255)    -- Discount code used (if any)
discount_amount     DECIMAL(10,2)   -- Discount amount
final_amount        DECIMAL(10,2)   -- Final amount after discount
status              ENUM            -- pending, sent, failed
sent_at             TIMESTAMP       -- When message was sent
created_at          TIMESTAMP
updated_at          TIMESTAMP
```

### Order Details JSON Structure

```json
[
  {
    "product_id": 1,
    "product_name": "Rose Elegance",
    "attribute_id": 2,
    "attribute_name": "Standard",
    "attribute_value": "50 ml",
    "quantity": 2,
    "unit_price": 45.00,
    "subtotal": 90.00
  },
  {
    "product_id": 3,
    "product_name": "Ocean Breeze",
    "attribute_id": 5,
    "attribute_name": "Travel",
    "attribute_value": "10 ml",
    "quantity": 1,
    "unit_price": 12.00,
    "subtotal": 12.00
  }
]
```

## Frontend Implementation

### Step 1: Build Cart with Attribute Prices

```javascript
// When user adds product to cart
const addToCart = (product, selectedAttribute) => {
  const cartItem = {
    product_id: product.id,
    product_name: product.name,
    attribute_id: selectedAttribute.id,
    attribute_name: selectedAttribute.name,
    attribute_value: selectedAttribute.value,
    quantity: 1,
    unit_price: selectedAttribute.price, // Use attribute price, NOT product.base_price
    subtotal: selectedAttribute.price * 1
  };
  
  setCart([...cart, cartItem]);
};
```

### Step 2: Calculate Totals

```javascript
const calculateTotals = () => {
  // Sum all cart items
  const total = cart.reduce((sum, item) => sum + item.subtotal, 0);
  
  // Apply discount if code is valid
  let discount = 0;
  if (discountCode) {
    const result = await validateDiscountCode(discountCode, total);
    if (result.valid) {
      discount = result.discount_amount;
    }
  }
  
  const finalAmount = total - discount;
  
  return { total, discount, finalAmount };
};
```

### Step 3: Format WhatsApp Message

```javascript
const formatWhatsAppMessage = (cart, customerInfo, totals) => {
  let message = `🛍️ *New Order from ${customerInfo.name}*\n\n`;
  message += `📱 Phone: ${customerInfo.phone}\n`;
  message += `📍 Address: ${customerInfo.address}\n\n`;
  message += `*Order Details:*\n`;
  
  cart.forEach((item, index) => {
    message += `${index + 1}. ${item.product_name}\n`;
    message += `   Size: ${item.attribute_value}\n`;
    message += `   Qty: ${item.quantity} × €${item.unit_price} = €${item.subtotal}\n\n`;
  });
  
  message += `*Subtotal:* €${totals.total}\n`;
  
  if (totals.discount > 0) {
    message += `*Discount (${discountCode}):* -€${totals.discount}\n`;
  }
  
  message += `*Final Total:* €${totals.finalAmount}\n`;
  
  return message;
};
```

### Step 4: Send to Backend API

```javascript
const handleWhatsAppCheckout = async () => {
  const totals = calculateTotals();
  const message = formatWhatsAppMessage(cart, customerInfo, totals);
  
  // Record order in database
  const response = await fetch('http://127.0.0.1:8000/api/v1/whatsapp-messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer_name: customerInfo.name,
      customer_phone: customerInfo.phone,
      customer_address: customerInfo.address,
      message: message,
      order_details: cart,
      total_amount: totals.total,
      discount_code: discountCode || null,
      discount_amount: totals.discount,
      final_amount: totals.finalAmount
    })
  });
  
  if (response.ok) {
    // Open WhatsApp
    const whatsappUrl = `https://wa.me/YOUR_BUSINESS_NUMBER?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  }
};
```

## Complete React Example

```jsx
// CartModal.jsx
import { useState, useEffect } from 'react';

const CartModal = ({ cart, setCart, onClose }) => {
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [discountCode, setDiscountCode] = useState('');
  const [discount, setDiscount] = useState(0);
  
  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const total = subtotal - discount;
  
  const handleApplyDiscount = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/discount-codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: discountCode, amount: subtotal })
      });
      
      const result = await response.json();
      
      if (result.valid) {
        setDiscount(result.discount_amount);
        alert(`Discount applied: €${result.discount_amount}`);
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert('Failed to validate discount code');
    }
  };
  
  const handleCheckout = async () => {
    // Validation
    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
      alert('Please fill in all fields');
      return;
    }
    
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }
    
    // Format message
    let message = `🛍️ *New Order from ${customerInfo.name}*\n\n`;
    message += `📱 Phone: ${customerInfo.phone}\n`;
    message += `📍 Address: ${customerInfo.address}\n\n`;
    message += `*Order Details:*\n`;
    
    cart.forEach((item, index) => {
      message += `${index + 1}. ${item.product_name}\n`;
      message += `   Size: ${item.attribute_value}\n`;
      message += `   Qty: ${item.quantity} × €${item.unit_price} = €${item.subtotal}\n\n`;
    });
    
    message += `*Subtotal:* €${subtotal.toFixed(2)}\n`;
    
    if (discount > 0) {
      message += `*Discount (${discountCode}):* -€${discount.toFixed(2)}\n`;
    }
    
    message += `*Final Total:* €${total.toFixed(2)}\n`;
    
    // Save to database
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/whatsapp-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerInfo.name,
          customer_phone: customerInfo.phone,
          customer_address: customerInfo.address,
          message: message,
          order_details: cart,
          total_amount: subtotal,
          discount_code: discountCode || null,
          discount_amount: discount,
          final_amount: total
        })
      });
      
      if (response.ok) {
        // Open WhatsApp
        const businessPhone = '1234567890'; // Replace with your business number
        const whatsappUrl = `https://wa.me/${businessPhone}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        
        // Clear cart
        setCart([]);
        onClose();
      } else {
        alert('Failed to record order');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to process order');
    }
  };
  
  return (
    <div className="cart-modal">
      <h2>Shopping Cart</h2>
      
      {/* Cart Items */}
      <div className="cart-items">
        {cart.map((item, index) => (
          <div key={index} className="cart-item">
            <h4>{item.product_name}</h4>
            <p>Size: {item.attribute_value}</p>
            <p>Qty: {item.quantity}</p>
            <p>Price: €{item.subtotal.toFixed(2)}</p>
          </div>
        ))}
      </div>
      
      {/* Customer Info */}
      <div className="customer-info">
        <input
          type="text"
          placeholder="Full Name"
          value={customerInfo.name}
          onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
        />
        <input
          type="tel"
          placeholder="Phone Number"
          value={customerInfo.phone}
          onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
        />
        <textarea
          placeholder="Delivery Address"
          value={customerInfo.address}
          onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
        />
      </div>
      
      {/* Discount Code */}
      <div className="discount">
        <input
          type="text"
          placeholder="Discount Code"
          value={discountCode}
          onChange={(e) => setDiscountCode(e.target.value)}
        />
        <button onClick={handleApplyDiscount}>Apply</button>
      </div>
      
      {/* Totals */}
      <div className="totals">
        <p>Subtotal: €{subtotal.toFixed(2)}</p>
        {discount > 0 && <p>Discount: -€{discount.toFixed(2)}</p>}
        <h3>Total: €{total.toFixed(2)}</h3>
      </div>
      
      {/* Checkout Button */}
      <button onClick={handleCheckout} className="checkout-btn">
        Order via WhatsApp 💬
      </button>
    </div>
  );
};

export default CartModal;
```

## Admin Panel View

The admin can view all orders with:
- Customer name, phone, address
- Complete order breakdown
- Individual item prices (based on selected attributes)
- Discount applied
- Final total
- Order status (pending/sent/failed)

Access: http://127.0.0.1:8000/admin/whatsapp-messages

## API Validation

The backend validates:
- ✅ All products exist in database
- ✅ All attributes exist and belong to correct products
- ✅ Prices match attribute prices (security)
- ✅ Quantities are positive integers
- ✅ Totals are calculated correctly
- ✅ Customer information is complete

## Data Flow Summary

```
User adds products → Selects size (10ml/50ml) → Price updates to attribute price
→ Adds to cart → Repeats for multiple products → Enters shipping info
→ Applies discount code → Confirms order → Data saved to DB
→ WhatsApp opens with pre-filled message → Order complete
```

## Important Notes

### ⚠️ Pricing Rules
1. **Always use `attribute.price`** for calculations, NOT `product.base_price`
2. When user selects 10ml, the price changes to 10ml attribute price
3. When user selects 50ml, the price changes to 50ml attribute price
4. Each size is a separate price point

### ⚠️ Cart Structure
1. Each cart item must reference a specific `attribute_id`
2. Store both `attribute_name` and `attribute_value` for display
3. Calculate `subtotal = unit_price × quantity`

### ⚠️ Order Recording
1. Record happens BEFORE WhatsApp opens (so we capture even if user closes WhatsApp)
2. Status starts as "pending", can be updated to "sent" or "failed"
3. Full message text is stored for reference

---

**Example Order in Database:**

```json
{
  "id": 1,
  "customer_name": "John Doe",
  "customer_phone": "+1234567890",
  "customer_address": "123 Main St, City, Country",
  "message": "🛍️ *New Order from John Doe*...",
  "order_details": [
    {
      "product_id": 1,
      "product_name": "Rose Elegance",
      "attribute_id": 2,
      "attribute_name": "Standard",
      "attribute_value": "50 ml",
      "quantity": 2,
      "unit_price": 45.00,
      "subtotal": 90.00
    }
  ],
  "total_amount": 90.00,
  "discount_code": "SUMMER2026",
  "discount_amount": 18.00,
  "final_amount": 72.00,
  "status": "pending",
  "created_at": "2026-02-21 12:00:00"
}
```
