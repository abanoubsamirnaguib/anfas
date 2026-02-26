<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DiscountCode;
use Illuminate\Http\Request;

class DiscountCodeController extends Controller
{
    public function validate(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'amount' => 'required|numeric|min:0',
        ]);

        $discountCode = DiscountCode::where('code', $request->code)->first();

        if (!$discountCode) {
            return response()->json([
                'valid' => false,
                'message' => 'Discount code not found.',
            ], 404);
        }

        if (!$discountCode->isValid()) {
            return response()->json([
                'valid' => false,
                'message' => 'Discount code is not valid or has expired.',
            ], 400);
        }

        $discount = $discountCode->calculateDiscount($request->amount);

        return response()->json([
            'valid' => true,
            'discount_code' => $discountCode,
            'discount_amount' => $discount,
            'final_amount' => max(0, $request->amount - $discount),
        ]);
    }
}
