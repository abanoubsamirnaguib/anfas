# Backend API Integration Guide for Ionic React Frontend

## Quick Start

Replace the mock data in your Ionic React app with these API calls.

## Configuration

Add to your Ionic app (e.g., `src/config.js`):

```javascript
export const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';
```

## API Usage Examples

### 1. Fetch All Categories

Replace the `productInfo` import with:

```javascript
// src/services/api.js
import { API_BASE_URL } from '../config';

export const fetchCategories = async () => {
  const response = await fetch(`${API_BASE_URL}/categories`);
  return await response.json();
};

// Usage in Categories.jsx
import { fetchCategories } from '../services/api';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  
  useEffect(() => {
    fetchCategories().then(data => {
      setCategories(data);
    });
  }, []);
  
  // Map to your existing structure
  return categories.map(category => ({
    category: category.slug,
    name: category.name,
    image: category.cover_image,
    tagline: category.tagline,
  }));
};
```

### 2. Fetch Products for a Subcategory

```javascript
export const fetchProducts = async (categorySlug, subcategorySlug, filters = {}) => {
  const params = new URLSearchParams(filters);
  const url = `${API_BASE_URL}/categories/${categorySlug}/subcategories/${subcategorySlug}/products?${params}`;
  const response = await fetch(url);
  return await response.json();
};

// Usage in ProductType.jsx
const { category, type } = useParams();

useEffect(() => {
  fetchProducts(category, type, { search: '', per_page: 20 })
    .then(data => {
      setProducts(data.data); // Laravel pagination returns data in data property
    });
}, [category, type]);
```

### 3. Fetch Single Product

```javascript
export const fetchProduct = async (productSlug) => {
  const response = await fetch(`${API_BASE_URL}/products/${productSlug}`);
  return await response.json();
};

// Usage in ProductModal.jsx
const product = await fetchProduct('rose-elegance');
// product.attributes contains size options (10ml, 50ml, 100ml)
```

### 4. Validate Discount Code

```javascript
export const validateDiscountCode = async (code, amount) => {
  const response = await fetch(`${API_BASE_URL}/discount-codes/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, amount }),
  });
  return await response.json();
};

// Usage in CartModal.jsx
const applyDiscount = async () => {
  const result = await validateDiscountCode('SUMMER2026', cartTotal);
  if (result.valid) {
    setDiscount(result.discount_amount);
    setFinalAmount(result.final_amount);
  } else {
    alert(result.message);
  }
};
```

### 5. Send WhatsApp Message (Cart Order)

```javascript
export const sendWhatsAppMessage = async (orderData) => {
  const response = await fetch(`${API_BASE_URL}/whatsapp-messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
  return await response.json();
};

// Usage when user checks out via WhatsApp
const orderViaWhatsApp = async () => {
  // Format cart items - use attribute prices
  const orderDetails = cartItems.map(item => ({
    product_id: item.product.id,
    product_name: item.product.name,
    attribute_id: item.selectedAttribute.id,
    attribute_name: item.selectedAttribute.name,
    attribute_value: item.selectedAttribute.value,
    quantity: item.quantity,
    unit_price: item.selectedAttribute.price, // Use attribute price
    subtotal: item.selectedAttribute.price * item.quantity
  }));
  
  // Calculate totals
  const totalAmount = orderDetails.reduce((sum, item) => sum + item.subtotal, 0);
  const finalAmount = totalAmount - discountAmount;
  
  // Format WhatsApp message
  let message = `🛍️ *New Order from ${customerName}*\n\n`;
  message += `📱 Phone: ${customerPhone}\n`;
  message += `📍 Address: ${customerAddress}\n\n`;
  message += `*Order Details:*\n`;
  
  orderDetails.forEach((item, index) => {
    message += `${index + 1}. ${item.product_name}\n`;
    message += `   Size: ${item.attribute_value}\n`;
    message += `   Qty: ${item.quantity} × €${item.unit_price} = €${item.subtotal}\n\n`;
  });
  
  message += `*Total:* €${totalAmount}\n`;
  if (discountAmount > 0) {
    message += `*Discount:* -€${discountAmount}\n`;
    message += `*Final Total:* €${finalAmount}\n`;
  }
  
  const orderData = {
    customer_name: customerName,
    customer_phone: customerPhone,
    customer_address: customerAddress,
    message: message,
    order_details: orderDetails,
    total_amount: totalAmount,
    discount_code: discountCode || null,
    discount_amount: discountAmount,
    final_amount: finalAmount
  };
  
  // Save order to database
  await sendWhatsAppMessage(orderData);
  
  // Open WhatsApp
  const whatsappUrl = `https://wa.me/YOUR_BUSINESS_NUMBER?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
};
```

## Data Structure Mapping

### From Old Structure to API

**Old (utils/index.js):**
```javascript
productInfo = {
  women: {
    coverImage: "/path/to/image.jpg",
    tagline: "For Her",
    productTypes: {
      eau_de_parfum: {
        coverImage: "/path/to/cover.jpg",
        filters: ["None", "Floral"],
        searchPlaceholder: "Search...",
      }
    }
  }
}
```

**New (API Response):**
```javascript
// GET /api/v1/categories
[
  {
    id: 1,
    name: "Women",
    slug: "women",
    cover_image: "/path/to/image.jpg",
    tagline: "For Her",
    subcategories: [
      {
        id: 1,
        name: "Eau de Parfum",
        slug: "eau_de_parfum",
        cover_image: "/path/to/cover.jpg",
        filters: ["None", "Floral"],
        search_placeholder: "Search...",
      }
    ]
  }
]
```

### Products with Attributes

**API Response for Product:**
```javascript
// GET /api/v1/products/rose-elegance
{
  id: 1,
  name: "Rose Elegance",
  slug: "rose-elegance",
  description: "A luxurious floral fragrance",
  image: "/path/to/image.jpg",
  base_price: 50.00,
  final_price: 50.00,  // After discount
  discount_percentage: 0,
  rating: 4.5,
  reviews_count: 120,
  fragrance_notes: {
    top: "Bergamot, Pink Pepper",
    heart: "Rose, Jasmine, Oud",
    base: "Sandalwood, Musk, Amber"
  },
  shipping_info: {
    standard: "3-5 business days",
    express: "1-2 business days"
  },
  attributes: [
    {
      id: 1,
      name: "Travel",
      value: "10 ml",
      price: 15.00,
      stock: 50,
      is_active: true
    },
    {
      id: 2,
      name: "Standard",
      value: "50 ml",
      price: 45.00,
      stock: 30,
      is_active: true
    },
    {
      id: 3,
      name: "Prestige",
      value: "100 ml",
      price: 85.00,
      stock: 20,
      is_active: true
    }
  ],
  category: {
    id: 1,
    name: "Women",
    slug: "women"
  },
  subcategory: {
    id: 1,
    name: "Eau de Parfum",
    slug: "eau_de_parfum"
  }
}
```

## Complete Service Layer Example

Create `src/services/api.js`:

```javascript
const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }
  return response.json();
};

export const api = {
  // Categories
  getCategories: () => 
    fetch(`${API_BASE_URL}/categories`).then(handleResponse),
  
  getCategory: (slug) => 
    fetch(`${API_BASE_URL}/categories/${slug}`).then(handleResponse),
  
  getSubcategories: (categorySlug) => 
    fetch(`${API_BASE_URL}/categories/${categorySlug}/subcategories`).then(handleResponse),
  
  // Products
  getProducts: (categorySlug, subcategorySlug, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE_URL}/categories/${categorySlug}/subcategories/${subcategorySlug}/products?${query}`)
      .then(handleResponse);
  },
  
  getProduct: (slug) => 
    fetch(`${API_BASE_URL}/products/${slug}`).then(handleResponse),
  
  // Discount Codes
  validateDiscount: (code, amount) =>
    fetch(`${API_BASE_URL}/discount-codes/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, amount }),
    }).then(handleResponse),
  
  // WhatsApp Messages
  sendMessage: (data) =>
    fetch(`${API_BASE_URL}/whatsapp-messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),
};
```

## Testing the API

### Using Browser/Postman

1. **Get Categories:**
   ```
   GET http://127.0.0.1:8000/api/v1/categories
   ```

2. **Get Products:**
   ```
   GET http://127.0.0.1:8000/api/v1/categories/women/subcategories/eau_de_parfum/products
   ```

3. **Validate Discount:**
   ```
   POST http://127.0.0.1:8000/api/v1/discount-codes/validate
   Body: { "code": "SUMMER2026", "amount": 100 }
   ```

## Migration Steps

1. ✅ Set up API base URL
2. ✅ Create `services/api.js` with all endpoints
3. ✅ Update `Categories.jsx` to use `api.getCategories()`
4. ✅ Update `Category.jsx` to use `api.getSubcategories()`
5. ✅ Update `ProductType.jsx` to use `api.getProducts()`
6. ✅ Update cart/checkout to use `api.validateDiscount()`
7. ✅ Update WhatsApp order flow to use `api.sendMessage()`
8. ✅ Remove old mock data from `utils/index.js`

## Error Handling

```javascript
const fetchData = async () => {
  try {
    const data = await api.getCategories();
    setCategories(data);
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    // Show error toast/message to user
  }
};
```

## CORS Configuration (if needed)

If you encounter CORS errors, add to Laravel `config/cors.php`:

```php
'paths' => ['api/*'],
'allowed_origins' => ['*'],  // Or specific: ['http://localhost:8100']
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
```

---

**Questions?** Check the Laravel logs at `backend/storage/logs/laravel.log`
