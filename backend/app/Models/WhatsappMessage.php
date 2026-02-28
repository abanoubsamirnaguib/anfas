<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WhatsappMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_name',
        'customer_phone',
        'customer_whatsapp',
        'customer_address',
        'message',
        'channel',
        'order_details',
        'total_amount',
        'discount_code',
        'discount_amount',
        'final_amount',
        'status',
        'sent_at',
    ];

    protected $casts = [
        'order_details' => 'array',
        'total_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'final_amount' => 'decimal:2',
        'sent_at' => 'datetime',
    ];

    public function markAsSent()
    {
        $this->update([
            'status' => 'sent',
            'sent_at' => now(),
        ]);
    }

    public function markAsFailed()
    {
        $this->update([
            'status' => 'failed',
        ]);
    }
}
