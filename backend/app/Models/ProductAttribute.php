<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Product Attribute (Size/Variant)
 * 
 * Each attribute represents a size option (10ml, 50ml, 100ml) with its own price.
 * When a user selects an attribute, the attribute's price is what they pay.
 * 
 * Example:
 * - Product: "Rose Elegance" (base_price: €50 - reference only)
 * - Attribute 1: "10ml" travel size - price: €15 (this is what customer pays)
 * - Attribute 2: "50ml" standard - price: €45 (this is what customer pays)
 * - Attribute 3: "100ml" prestige - price: €85 (this is what customer pays)
 */
class ProductAttribute extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'name',        // e.g., "Travel", "Standard", "Prestige"
        'value',       // e.g., "10 ml", "50 ml", "100 ml"
        'price',       // ACTUAL PRICE customer pays for this size
        'discount_percentage', // Individual discount for this attribute
        'stock',
        'sku',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'discount_percentage' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    protected $appends = ['final_price'];

    /**
     * Calculate final price based on discount percentage
     */
    public function getFinalPriceAttribute()
    {
        if ($this->discount_percentage > 0) {
            return $this->price * (1 - ($this->discount_percentage / 100));
        }
        return $this->price;
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
