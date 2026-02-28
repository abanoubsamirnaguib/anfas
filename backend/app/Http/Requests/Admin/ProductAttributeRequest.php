<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductAttributeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $attribute   = $this->route('attribute');
        $attributeId = $attribute?->id;

        $skuRule = Rule::unique('product_attributes', 'sku');
        if ($attributeId) {
            $skuRule = $skuRule->ignore($attributeId);
        }

        return [
            'name'      => ['required', 'string', 'min:1', 'max:255'],
            'value'     => ['required', 'string', 'min:1', 'max:255'],
            'price'     => ['required', 'numeric', 'min:0', 'max:99999.99'],
            'discount_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'stock'     => ['nullable', 'integer', 'min:0', 'max:999999'],
            'sku'       => ['nullable', 'string', 'max:100', $skuRule],
            'is_active' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'  => 'Attribute name is required (e.g. Travel, Standard, Prestige).',
            'name.max'       => 'Attribute name may not exceed 255 characters.',
            'value.required' => 'Attribute value is required (e.g. 10 ml, 50 ml, 100 ml).',
            'value.max'      => 'Attribute value may not exceed 255 characters.',
            'price.required' => 'Price is required.',
            'price.numeric'  => 'Price must be a valid number.',
            'price.min'      => 'Price cannot be negative.',
            'price.max'      => 'Price may not exceed 99,999.99.',
            'discount_percentage.numeric' => 'Discount must be a valid number.',
            'discount_percentage.min' => 'Discount cannot be negative.',
            'discount_percentage.max' => 'Discount cannot exceed 100%.',
            'stock.integer'  => 'Stock must be a whole number.',
            'stock.min'      => 'Stock cannot be negative.',
            'stock.max'      => 'Stock may not exceed 999,999.',
            'sku.max'        => 'SKU may not exceed 100 characters.',
            'sku.unique'     => 'This SKU is already used by another attribute.',
        ];
    }

    public function attributes(): array
    {
        return [
            'is_active' => 'active status',
        ];
    }
}
