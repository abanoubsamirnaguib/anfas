<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DiscountCodeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $discountCode   = $this->route('discountCode') ?? $this->route('discount_code');
        $discountCodeId = $discountCode?->id;

        $codeRule = Rule::unique('discount_codes', 'code');
        if ($discountCodeId) {
            $codeRule = $codeRule->ignore($discountCodeId);
        }

        $rules = [
            'code'         => ['required', 'string', 'max:50', $codeRule, 'regex:/^[A-Za-z0-9_\-]+$/'],
            'description'  => ['nullable', 'string', 'max:1000'],
            'type'         => ['required', 'in:percentage,fixed'],
            'value'        => ['required', 'numeric', 'min:0.01', 'max:99999.99'],
            'usage_limit'  => ['nullable', 'integer', 'min:1'],
            'starts_at'    => ['nullable', 'date'],
            'expires_at'   => ['nullable', 'date', 'after_or_equal:starts_at'],
            'is_active'    => ['boolean'],
        ];

        // Only validate min_purchase and max_discount for percentage type
        if ($this->input('type') === 'percentage') {
            $rules['min_purchase'] = ['nullable', 'numeric', 'min:0'];
            $rules['max_discount'] = ['nullable', 'numeric', 'min:0'];
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'code.required'             => 'Discount code is required.',
            'code.max'                  => 'Discount code may not exceed 50 characters.',
            'code.unique'               => 'This discount code already exists.',
            'code.regex'                => 'Discount code may only contain letters, numbers, underscores, and hyphens.',
            'description.max'           => 'Description may not exceed 1000 characters.',
            'type.required'             => 'Please select a discount type.',
            'type.in'                   => 'Discount type must be either "percentage" or "fixed".',
            'value.required'            => 'Discount value is required.',
            'value.numeric'             => 'Discount value must be a number.',
            'value.min'                 => 'Discount value must be greater than 0.',
            'value.max'                 => 'Discount value may not exceed 99,999.99.',
            'min_purchase.numeric'      => 'Minimum purchase amount must be a number.',
            'min_purchase.min'          => 'Minimum purchase amount cannot be negative.',
            'max_discount.numeric'      => 'Maximum discount amount must be a number.',
            'max_discount.min'          => 'Maximum discount amount cannot be negative.',
            'usage_limit.integer'       => 'Usage limit must be a whole number.',
            'usage_limit.min'           => 'Usage limit must be at least 1.',
            'starts_at.date'            => 'Start date must be a valid date.',
            'expires_at.date'           => 'Expiry date must be a valid date.',
            'expires_at.after_or_equal' => 'Expiry date must be on or after the start date.',
        ];
    }

    public function attributes(): array
    {
        return [
            'min_purchase' => 'minimum purchase',
            'max_discount' => 'maximum discount',
            'usage_limit'  => 'usage limit',
            'starts_at'    => 'start date',
            'expires_at'   => 'expiry date',
            'is_active'    => 'active status',
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->filled('code')) {
            $this->merge(['code' => strtoupper($this->code)]);
        }
    }
}
