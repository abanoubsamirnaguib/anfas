<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $product   = $this->route('product');
        $productId = $product?->id;

        $slugRule = Rule::unique('products', 'slug');
        if ($productId) {
            $slugRule = $slugRule->ignore($productId);
        }

        return [
            'category_ids'               => ['required', 'array', 'min:1'],
            'category_ids.*'             => ['integer', 'exists:categories,id'],
            'name'                       => ['required', 'string', 'min:2', 'max:255'],
            'slug'                       => ['nullable', 'string', 'max:255', $slugRule, 'regex:/^[a-z0-9\-]+$/'],
            'description'                => ['nullable', 'string', 'max:5000'],
            'description_ar'             => ['nullable', 'string', 'max:5000'],
            'image'                      => ['nullable', 'string', 'max:500'],
            'video_url'                  => ['nullable', 'string', 'max:500'],
            'base_price'                 => ['required', 'numeric', 'min:0', 'max:99999.99'],
            'discount_percentage'        => ['nullable', 'numeric', 'min:0', 'max:100'],
            'rating'                     => ['nullable', 'numeric', 'min:0', 'max:5'],
            'reviews_count'              => ['nullable', 'integer', 'min:0'],
            'fragrance_notes'            => ['nullable', 'array'],
            'fragrance_notes.*'          => ['array'],
            'fragrance_notes.*.key_en'   => ['nullable', 'string', 'max:100'],
            'fragrance_notes.*.key_ar'   => ['nullable', 'string', 'max:100'],
            'fragrance_notes.*.value'    => ['nullable', 'array'],
            'fragrance_notes.*.value.en' => ['nullable', 'string', 'max:100'],
            'fragrance_notes.*.value.ar' => ['nullable', 'string', 'max:100'],
            'shipping_info'              => ['nullable', 'array'],
            'shipping_info.*'            => ['array'],
            'shipping_info.*.key_en'     => ['nullable', 'string', 'max:255'],
            'shipping_info.*.key_ar'     => ['nullable', 'string', 'max:255'],
            'shipping_info.*.value'      => ['nullable', 'array'],
            'shipping_info.*.value.en'   => ['nullable', 'string', 'max:255'],
            'shipping_info.*.value.ar'   => ['nullable', 'string', 'max:255'],
            'sort_order'           => ['nullable', 'integer', 'min:0', 'max:9999'],
            'is_active'            => ['boolean'],
            'is_featured'          => ['boolean'],
            'tags'                 => ['nullable', 'array'],
            'tags.*'               => ['string', 'max:100'],
            'gallery_images'       => ['nullable', 'array'],
            'gallery_images.*.url' => ['required', 'string', 'max:500'],
            'gallery_images.*.alt_text'   => ['nullable', 'string', 'max:255'],
            'gallery_images.*.sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'category_ids.required'        => 'Please select at least one category.',
            'category_ids.min'             => 'Please select at least one category.',
            'category_ids.*.exists'        => 'One or more selected categories do not exist.',
            'name.required'                => 'Product name is required.',
            'name.min'                     => 'Product name must be at least 2 characters.',
            'name.max'                     => 'Product name may not exceed 255 characters.',
            'slug.unique'                  => 'This slug is already taken. Choose a different one.',
            'slug.regex'                   => 'Slug may only contain lowercase letters, numbers, and hyphens.',
            'description.max'              => 'Description may not exceed 5000 characters.',
            'description_ar.max'           => 'Arabic description may not exceed 5000 characters.',
            'image.max'                    => 'Image URL may not exceed 500 characters.',
            'base_price.required'          => 'Base price is required.',
            'base_price.numeric'           => 'Base price must be a number.',
            'base_price.min'               => 'Base price cannot be negative.',
            'base_price.max'               => 'Base price may not exceed 99,999.99.',
            'discount_percentage.min'      => 'Discount cannot be negative.',
            'discount_percentage.max'      => 'Discount cannot exceed 100%.',
            'rating.min'                   => 'Rating cannot be less than 0.',
            'rating.max'                   => 'Rating cannot exceed 5.',
            'reviews_count.integer'        => 'Reviews count must be a whole number.',
            'reviews_count.min'            => 'Reviews count cannot be negative.',
            'fragrance_notes.array'              => 'Fragrance notes must be a list.',
            'fragrance_notes.*.array'            => 'Each fragrance note must be an object.',
            'fragrance_notes.*.key_en.max'       => 'Each English fragrance note label may not exceed 100 characters.',
            'fragrance_notes.*.key_ar.max'       => 'Each Arabic fragrance note label may not exceed 100 characters.',
            'fragrance_notes.*.value.array'      => 'Each fragrance note value must be a translation object.',
            'fragrance_notes.*.value.en.max'     => 'Each English fragrance note value may not exceed 100 characters.',
            'fragrance_notes.*.value.ar.max'     => 'Each Arabic fragrance note value may not exceed 100 characters.',
            'shipping_info.array'                => 'Shipping info must be a list.',
            'shipping_info.*.array'              => 'Each shipping info value must be an object.',
            'shipping_info.*.key_en.max'         => 'Each English shipping method label may not exceed 255 characters.',
            'shipping_info.*.key_ar.max'         => 'Each Arabic shipping method label may not exceed 255 characters.',
            'shipping_info.*.value.array'        => 'Each shipping info value must be a translation object.',
            'shipping_info.*.value.en.max'       => 'Each English shipping info value may not exceed 255 characters.',
            'shipping_info.*.value.ar.max'       => 'Each Arabic shipping info value may not exceed 255 characters.',
            'sort_order.integer'           => 'Sort order must be a whole number.',
            'sort_order.min'               => 'Sort order cannot be negative.',
            'sort_order.max'               => 'Sort order may not exceed 9999.',
        ];
    }

    public function attributes(): array
    {
        return [
            'category_id'         => 'category',
            'base_price'          => 'base price',
            'discount_percentage' => 'discount percentage',
            'reviews_count'       => 'reviews count',
            'fragrance_notes'     => 'fragrance notes',
            'shipping_info'       => 'shipping info',
            'sort_order'          => 'sort order',
            'is_active'           => 'active status',
            'is_featured'         => 'featured status',
        ];
    }
}
