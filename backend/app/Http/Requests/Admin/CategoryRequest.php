<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $category   = $this->route('category');
        $categoryId = $category?->id;

        $slugRule = Rule::unique('categories', 'slug');
        if ($categoryId) {
            $slugRule = $slugRule->ignore($categoryId);
        }

        return [
            'name'           => ['required', 'string', 'min:2', 'max:255'],
            'name_ar'        => ['nullable', 'string', 'min:2', 'max:255'],
            'slug'           => ['nullable', 'string', 'max:255', $slugRule, 'regex:/^[a-z0-9\-]+$/'],
            'description'    => ['nullable', 'string', 'max:3000'],
            'description_ar' => ['nullable', 'string', 'max:3000'],
            'cover_image'    => ['nullable', 'string', 'max:500'],
            'tagline'        => ['nullable', 'string', 'max:255'],
            'tagline_ar'     => ['nullable', 'string', 'max:255'],
            'sort_order'     => ['nullable', 'integer', 'min:0', 'max:9999'],
            'is_active'      => ['boolean'],
            'tags'           => ['nullable', 'array'],
            'tags.*'         => ['string', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'      => 'Category name is required.',
            'name.min'           => 'Category name must be at least 2 characters.',
            'name.max'           => 'Category name may not exceed 255 characters.',
            'slug.unique'        => 'This slug is already taken. Choose a different one.',
            'slug.regex'         => 'Slug may only contain lowercase letters, numbers, and hyphens.',
            'description.max'    => 'Description may not exceed 3000 characters.',
            'cover_image.max'    => 'Cover image URL may not exceed 500 characters.',
            'tagline.max'        => 'Tagline may not exceed 255 characters.',
            'sort_order.integer' => 'Sort order must be a whole number.',
            'sort_order.min'     => 'Sort order cannot be negative.',
            'sort_order.max'     => 'Sort order may not exceed 9999.',
        ];
    }

    public function attributes(): array
    {
        return [
            'cover_image' => 'cover image',
            'sort_order'  => 'sort order',
            'is_active'   => 'active status',
        ];
    }
}
