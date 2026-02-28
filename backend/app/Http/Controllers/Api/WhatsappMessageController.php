<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WhatsappMessage;
use Illuminate\Http\Request;

class WhatsappMessageController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:20',
            'customer_whatsapp' => 'nullable|string|max:30',
            'customer_address' => 'required|string',
            'message' => 'required|string',
            'channel' => 'nullable|string|in:whatsapp',
            'order_details' => 'required|array',
            // allow product/attribute ids to be nullable for public API submissions
            'order_details.*.product_id' => 'nullable|exists:products,id',
            'order_details.*.product_name' => 'required|string',
            'order_details.*.attribute_id' => 'nullable|exists:product_attributes,id',
            'order_details.*.attribute_name' => 'nullable|string',
            'order_details.*.attribute_value' => 'nullable|string',
            'order_details.*.quantity' => 'required|integer|min:1',
            'order_details.*.unit_price' => 'required|numeric|min:0',
            'order_details.*.subtotal' => 'required|numeric|min:0',
            'total_amount' => 'required|numeric|min:0',
            'discount_code' => 'nullable|string',
            'discount_amount' => 'nullable|numeric|min:0',
            'final_amount' => 'required|numeric|min:0',
        ]);

        $message = WhatsappMessage::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Order recorded successfully.',
            'data' => $message,
        ], 201);
    }
}
