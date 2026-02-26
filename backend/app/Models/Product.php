<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'description',
        'image',
        'base_price', // Reference price only - actual prices come from product_attributes (10ml, 50ml, etc.)
        'discount_percentage',
        'rating',
        'reviews_count',
        'fragrance_notes',
        'shipping_info',
        'sort_order',
        'is_active',
        'is_featured',
        'tags',
    ];

    protected $casts = [
        'base_price' => 'decimal:2',
        'discount_percentage' => 'decimal:2',
        'rating' => 'decimal:2',
        'fragrance_notes' => 'array',
        'shipping_info' => 'array',
        'tags' => 'array',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
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

    public function category()
    {
        return $this->belongsTo(Category::class);
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
