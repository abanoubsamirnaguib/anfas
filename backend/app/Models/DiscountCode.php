<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DiscountCode extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'description',
        'type',
        'value',
        'min_purchase',
        'max_discount',
        'usage_limit',
        'usage_count',
        'starts_at',
        'expires_at',
        'is_active',
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'min_purchase' => 'decimal:2',
        'max_discount' => 'decimal:2',
        'is_active' => 'boolean',
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function isValid()
    {
        if (!$this->is_active) {
            return false;
        }

        $now = now();
        
        if ($this->starts_at && $now->lt($this->starts_at)) {
            return false;
        }

        if ($this->expires_at && $now->gt($this->expires_at)) {
            return false;
        }

        if ($this->usage_limit && $this->usage_count >= $this->usage_limit) {
            return false;
        }

        return true;
    }

    public function calculateDiscount($amount)
    {
        if ($this->type === 'percentage') {
            // For percentage discounts, apply min_purchase and max_discount
            if ($amount < $this->min_purchase) {
                return 0;
            }

            $discount = $amount * ($this->value / 100);

            if ($this->max_discount && $discount > $this->max_discount) {
                return $this->max_discount;
            }

            return $discount;
        } else {
            // For fixed discounts, no min_purchase or max_discount constraints
            return $this->value;
        }
    }
}
