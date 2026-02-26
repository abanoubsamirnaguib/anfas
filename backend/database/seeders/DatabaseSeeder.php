<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\DiscountCode;
use App\Models\Product;
use App\Models\ProductAttribute;
use App\Models\Subcategory;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create test user
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        // Create Categories
        $women = Category::create([
            'name' => 'Women',
            'slug' => 'women',
            'tagline' => 'For Her',
            'cover_image' => '/assets/perfume/women.jpg',
            'description' => 'Elegant fragrances for women',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $men = Category::create([
            'name' => 'Men',
            'slug' => 'men',
            'tagline' => 'For Him',
            'cover_image' => '/assets/perfume/men.jpg',
            'description' => 'Sophisticated fragrances for men',
            'sort_order' => 2,
            'is_active' => true,
        ]);

        $offers = Category::create([
            'name' => 'Offers',
            'slug' => 'offers',
            'tagline' => 'Special Offers',
            'cover_image' => '/assets/perfume/offers.jpg',
            'description' => 'Limited time offers and deals',
            'sort_order' => 3,
            'is_active' => true,
        ]);

        // Create Sample Products
        $product1 = Product::create([
            'category_id' => $women->id,
            'subcategory_id' => $eauDeParfum->id,
            'name' => 'Rose Elegance',
            'slug' => 'rose-elegance',
            'description' => 'A luxurious floral fragrance featuring delicate rose petals',
            'image' => '/assets/perfume/eau_de_parfum.webp',
            'base_price' => 50.00,
            'discount_percentage' => 0,
            'rating' => 4.5,
            'reviews_count' => 120,
            'fragrance_notes' => [
                'top' => 'Bergamot, Pink Pepper',
                'heart' => 'Rose, Jasmine, Oud',
                'base' => 'Sandalwood, Musk, Amber'
            ],
            'shipping_info' => [
                'standard' => '3-5 business days',
                'express' => '1-2 business days',
                'international' => '7-14 business days'
            ],
            'sort_order' => 1,
            'is_active' => true,
            'is_featured' => true,
        ]);

        // Create Product Attributes (Sizes)
        ProductAttribute::create([
            'product_id' => $product1->id,
            'name' => 'Travel',
            'value' => '10 ml',
            'price' => 15.00,
            'stock' => 50,
            'sku' => 'ROSE-ELEG-10ML',
            'is_active' => true,
        ]);

        ProductAttribute::create([
            'product_id' => $product1->id,
            'name' => 'Standard',
            'value' => '50 ml',
            'price' => 45.00,
            'stock' => 30,
            'sku' => 'ROSE-ELEG-50ML',
            'is_active' => true,
        ]);

        ProductAttribute::create([
            'product_id' => $product1->id,
            'name' => 'Prestige',
            'value' => '100 ml',
            'price' => 85.00,
            'stock' => 20,
            'sku' => 'ROSE-ELEG-100ML',
            'is_active' => true,
        ]);

        $product2 = Product::create([
            'category_id' => $men->id,
            'subcategory_id' => $eauDeToilette->id,
            'name' => 'Ocean Breeze',
            'slug' => 'ocean-breeze',
            'description' => 'Fresh aquatic fragrance with citrus notes',
            'image' => '/assets/perfume/eau_de_toilette.jpg',
            'base_price' => 45.00,
            'discount_percentage' => 10,
            'rating' => 4.3,
            'reviews_count' => 85,
            'fragrance_notes' => [
                'top' => 'Lemon, Marine Notes',
                'heart' => 'Lavender, Rosemary',
                'base' => 'Cedar, Musk'
            ],
            'shipping_info' => [
                'standard' => '3-5 business days',
                'express' => '1-2 business days'
            ],
            'sort_order' => 1,
            'is_active' => true,
            'is_featured' => false,
        ]);

        // Create Product Attributes for Product 2
        ProductAttribute::create([
            'product_id' => $product2->id,
            'name' => 'Travel',
            'value' => '10 ml',
            'price' => 12.00,
            'stock' => 40,
            'sku' => 'OCEAN-BREEZ-10ML',
            'is_active' => true,
        ]);

        ProductAttribute::create([
            'product_id' => $product2->id,
            'name' => 'Standard',
            'value' => '50 ml',
            'price' => 40.00,
            'stock' => 25,
            'sku' => 'OCEAN-BREEZ-50ML',
            'is_active' => true,
        ]);

        // Create Discount Codes
        DiscountCode::create([
            'code' => 'SUMMER2026',
            'description' => 'Summer Sale - 20% off',
            'type' => 'percentage',
            'value' => 20.00,
            'min_purchase' => 50.00,
            'max_discount' => 50.00,
            'usage_limit' => 100,
            'usage_count' => 0,
            'starts_at' => now(),
            'expires_at' => now()->addMonths(2),
            'is_active' => true,
        ]);

        DiscountCode::create([
            'code' => 'WELCOME10',
            'description' => 'Welcome discount €10 off',
            'type' => 'fixed',
            'value' => 10.00,
            'min_purchase' => 30.00,
            'max_discount' => null,
            'usage_limit' => null,
            'usage_count' => 0,
            'starts_at' => now(),
            'expires_at' => null,
            'is_active' => true,
        ]);

        $this->command->info('Database seeded successfully!');
        $this->command->info('Categories: 3');
        $this->command->info('Subcategories: 7');
        $this->command->info('Products: 2');
        $this->command->info('Product Attributes: 5');
        $this->command->info('Discount Codes: 2');
    }
}

