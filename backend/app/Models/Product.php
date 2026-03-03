<?php

namespace App\Models;

use App\Casts\JsonUnicode;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'description_ar',
        'image',
        'video_url',
        'base_price', // Reference price only - actual prices come from product_attributes (10ml, 50ml, etc.)
        'discount_percentage',
        'rating',
        'reviews_count',
        'fragrance_notes',
        'shipping_info',
        'sort_order',
        'is_active',
        'is_featured',
        'is_suggested',
        'tags',
    ];

    protected $casts = [
        'base_price' => 'decimal:2',
        'discount_percentage' => 'decimal:3',
        'rating' => 'decimal:2',
        'fragrance_notes' => JsonUnicode::class,
        'shipping_info' => JsonUnicode::class,
        'tags' => JsonUnicode::class,
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'is_suggested' => 'boolean',
    ];

    protected $appends = ['final_price'];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($product) {
            if (empty($product->slug)) {
                $product->slug = Str::slug($product->name);
            }
        });
    }

    /**
     * A product can belong to multiple categories.
     */
    public function categories()
    {
        return $this->belongsToMany(Category::class);
    }

    /**
     * Backwards-compatible accessor that returns the first category model
     * when accessing `$product->category` as a single model.
     * Note: For eager loading, use `with('categories')` instead.
     */
    public function getCategoryAttribute()
    {
        // Prefer the loaded relation when available, otherwise query for first
        if ($this->relationLoaded('categories')) {
            return $this->getRelation('categories')->first() ?: null;
        }

        return $this->categories()->first();
    }

    /**
     * Product attributes (sizes) - each has its own price
     * Example: 10ml = €15, 50ml = €45, 100ml = €85
     * The attribute price is what the customer pays, NOT the base_price
     */
    public function attributes()
    {
        return $this->hasMany(ProductAttribute::class);
    }

    /**
     * Additional gallery images for this product.
     */
    public function images()
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    /**
     * Calculate final price based on discount percentage
     * Note: This applies to base_price only. For actual selling, use attribute prices.
     */
    public function getFinalPriceAttribute()
    {
        if ($this->discount_percentage > 0) {
            return $this->base_price * (1 - ($this->discount_percentage / 100));
        }
        return $this->base_price;
    }
}
