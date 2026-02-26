# E-Shop Backend - Laravel Admin Panel

Complete Laravel backend with admin panel for managing your Ionic React perfume shop.

## 🎯 Key Concepts

### Attribute-Based Pricing
Products have **attributes** (sizes like 10ml, 50ml, 100ml), and each attribute has its own price:
- Product: "Rose Elegance" (base_price: €50 as reference)
- Attribute "10ml" → **€15** (actual selling price)
- Attribute "50ml" → **€45** (actual selling price)
- Attribute "100ml" → **€85** (actual selling price)

**When user selects a size, the price changes to that attribute's price.**

### Cart-Based WhatsApp Orders
Users order **multiple products** from cart with full details:
- Multiple products with different sizes
- Customer name, phone, and delivery address
- Total amount, discount codes, final amount
- Complete order stored in database before WhatsApp opens

See [WHATSAPP_INTEGRATION.md](WHATSAPP_INTEGRATION.md) for detailed integration guide.

## Features

### Admin Panel
- **Dashboard**: Overview statistics and recent activity
- **Categories Management**: Create/edit main categories (Women, Men, Offers)
- **Subcategories Management**: Create product types under categories
- **Products Management**: Full CRUD for products with images, descriptions, pricing
- **Product Attributes**: Manage sizes (10ml, 50ml, 100ml) and custom attributes with individual pricing
- **Discount Codes**: Create percentage/fixed discount codes with expiration dates
- **WhatsApp Messages**: Track all customer messages sent via WhatsApp

### API Endpoints
- Public REST API for Ionic React frontend
- Category and product endpoints
- Discount code validation
- WhatsApp message recording

## Database Structure

```
categories
├── subcategories
│   └── products
│       ├── product_attributes (10ml, 50ml, etc.)
│       └── whatsapp_messages
└── discount_codes
```

## Setup Instructions

### 1. Database Configuration

The `.env` file is already configured. Create the database:

```bash
# In MySQL (via Laragon HeidiSQL or command line)
CREATE DATABASE eshop;
```

### 2. Run Migrations

```bash
& "f:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe" artisan migrate
```

This creates tables:
- categories
- subcategories
- products
- product_attributes
- discount_codes
- whatsapp_messages

### 3. Seed Sample Data (Optional)

```bash
& "f:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe" artisan db:seed
```

### 4. Build Assets

Assets should already be installed. Build them:

```bash
npm run build
```

Or run dev server:

```bash
npm run dev
```

### 5. Start Laravel Server

```bash
& "f:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe" artisan serve
```

Access at: http://127.0.0.1:8000

### 6. Access Admin Panel

1. Register a new account at http://127.0.0.1:8000/register
2. Login and access admin panel at http://127.0.0.1:8000/admin

## Admin Panel Usage

### Creating a Complete Product Flow

1. **Create Category** (e.g., "Women")
   - Admin → Categories → Add Category
   - Set name, slug, cover image, tagline

2. **Create Subcategory** (e.g., "Eau de Parfum")
   - Admin → Subcategories → Add Subcategory
   - Select parent category
   - Add filters (Floral, Perfume, etc.)

3. **Create Product** (e.g., "Rose Elegance")
   - Admin → Products → Add Product
   - Select category and subcategory
   - Set base price, description, images
   - Add fragrance notes (Top, Heart, Base)

4. **Add Product Attributes** (Sizes)
   - Go to product → Attributes
   - Add: Travel (10ml) - €15
   - Add: Standard (50ml) - €45
   - Add: Prestige (100ml) - €85

5. **Create Discount Code**
   - Admin → Discounts → Add Discount Code
   - Code: SUMMER2026
   - Type: Percentage (20%)
   - Set expiration date

## API Endpoints for Frontend

Base URL: `http://127.0.0.1:8000/api/v1`

### Categories
```
GET /categories - List all categories
GET /categories/women - Get category by slug
GET /categories/women/subcategories - List subcategories
GET /categories/women/subcategories/eau_de_parfum - Get subcategory
```

### Products
```
GET /categories/women/subcategories/eau_de_parfum/products - List products
GET /products/rose-elegance - Get product details
```

### Discount Codes
```
POST /discount-codes/validate
Body: { "code": "SUMMER2026", "amount": 100 }
```

### WhatsApp Messages
```
POST /whatsapp-messages
Body: {
  "customer_name": "John Doe",
  "customer_phone": "+1234567890",
  "message": "I want to order...",
  "product_id": 1,
  "order_details": {...}
}
```

## Sample Data Structure

### Category Example
```json
{
  "name": "Women",
  "slug": "women",
  "tagline": "For Her",
  "cover_image": "/assets/perfume/women.jpg"
}
```

### Product Example
```json
{
  "name": "Rose Elegance",
  "slug": "rose-elegance",
  "description": "A luxurious floral fragrance",
  "base_price": 50.00,
  "discount_percentage": 10,
  "fragrance_notes": {
    "top": "Bergamot, Pink Pepper",
    "heart": "Rose, Jasmine, Oud",
    "base": "Sandalwood, Musk, Amber"
  },
  "attributes": [
    { "name": "Travel", "value": "10 ml", "price": 15.00 },
    { "name": "Standard", "value": "50 ml", "price": 45.00 },
    { "name": "Prestige", "value": "100 ml", "price": 85.00 }
  ]
}
```

## Connecting to Ionic React Frontend

Update your Ionic app to use this backend:

1. Set API base URL in your Ionic app:
   ```javascript
   const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';
   ```

2. Replace mock data with API calls:
   ```javascript
   // Instead of import from utils
   const response = await fetch(`${API_BASE_URL}/categories`);
   const categories = await response.json();
   ```

## Project Structure

```
backend/
├── app/
│   ├── Http/Controllers/
│   │   ├── Admin/          # Admin panel controllers
│   │   └── Api/            # API controllers for frontend
│   └── Models/             # Eloquent models
├── database/
│   └── migrations/         # Database schema
├── resources/
│   ├── js/
│   │   ├── Layouts/        # Admin layout
│   │   └── Pages/
│   │       └── Admin/      # Admin Vue components
│   └── views/
│       └── app.blade.php   # Main Inertia template
└── routes/
    ├── web.php             # Admin routes
    └── api.php             # API routes
```

## Troubleshooting

### Migration Errors
```bash
# Reset and re-run migrations
& "f:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe" artisan migrate:fresh
```

### Missing Ziggy Routes
```bash
# Generate Ziggy routes for Vue
& "f:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe" artisan ziggy:generate
```

### Clear Cache
```bash
& "f:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe" artisan cache:clear
& "f:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe" artisan config:clear
& "f:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe" artisan route:clear
```

## Next Steps

1. ✅ Run migrations
2. ✅ Create your first category
3. ✅ Add subcategories
4. ✅ Create products with attributes
5. ✅ Set up discount codes
6. 🔄 Update Ionic React frontend to use API
7. 🔄 Test WhatsApp message recording

## Technologies

- Laravel 11
- Inertia.js
- Vue 3
- Tailwind CSS
- MySQL
- Vite

---

**Admin Panel**: http://127.0.0.1:8000/admin  
**API Docs**: See routes/api.php for complete endpoint list
