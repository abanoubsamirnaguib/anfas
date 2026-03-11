<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProductAttributeRequest;
use App\Models\Product;
use App\Models\ProductAttribute;
use Inertia\Inertia;

class ProductAttributeController extends Controller
{
    public function index(Product $product)
    {
        $attributes = $product->attributes()->orderBy('sort_order')->get();

        return Inertia::render('Admin/ProductAttributes/Index', [
            'product' => $product,
            'attributes' => $attributes,
        ]);
    }

    public function create(Product $product)
    {
        $product->load('images');

        return Inertia::render('Admin/ProductAttributes/Create', [
            'product' => $product,
            'imageOptions' => $this->imageOptionsForProduct($product),
        ]);
    }

    public function store(ProductAttributeRequest $request, Product $product)
    {
        $validated = $request->validated();
        $validated['product_id'] = $product->id;
        $validated['suggested_image_url'] = $validated['is_suggested'] ?? false
            ? ($validated['suggested_image_url'] ?? null)
            : null;

        if (!($validated['is_default'] ?? false) && !$product->attributes()->where('is_default', true)->exists()) {
            $validated['is_default'] = true;
        }

        $this->syncExclusiveFlags($product, $validated);

        ProductAttribute::create($validated);

        return redirect()->route('admin.products.attributes.index', $product)
            ->with('success', 'Product attribute created successfully.');
    }

    public function edit(Product $product, ProductAttribute $attribute)
    {
        $this->ensureAttributeBelongsToProduct($product, $attribute);
        $product->load('images');

        return Inertia::render('Admin/ProductAttributes/Edit', [
            'product' => $product,
            'attribute' => $attribute,
            'imageOptions' => $this->imageOptionsForProduct($product),
        ]);
    }

    public function update(ProductAttributeRequest $request, Product $product, ProductAttribute $attribute)
    {
        $this->ensureAttributeBelongsToProduct($product, $attribute);

        $validated = $request->validated();
        $validated['suggested_image_url'] = $validated['is_suggested'] ?? false
            ? ($validated['suggested_image_url'] ?? null)
            : null;

        $this->syncExclusiveFlags($product, $validated, $attribute->id);

        $attribute->update($validated);

        return redirect()->route('admin.products.attributes.index', $product)
            ->with('success', 'Product attribute updated successfully.');
    }

    public function destroy(Product $product, ProductAttribute $attribute)
    {
        $this->ensureAttributeBelongsToProduct($product, $attribute);
        $attribute->delete();

        return redirect()->route('admin.products.attributes.index', $product)
            ->with('success', 'Product attribute deleted successfully.');
    }

    private function syncExclusiveFlags(Product $product, array $validated, ?int $exceptAttributeId = null): void
    {
        if (!empty($validated['is_default'])) {
            $query = $product->attributes()->where('is_default', true);
            if ($exceptAttributeId) {
                $query->whereKeyNot($exceptAttributeId);
            }
            $query->update(['is_default' => false]);
        }

        if (!empty($validated['is_suggested'])) {
            $query = $product->attributes()->where('is_suggested', true);
            if ($exceptAttributeId) {
                $query->whereKeyNot($exceptAttributeId);
            }
            $query->update(['is_suggested' => false]);
        }
    }

    private function ensureAttributeBelongsToProduct(Product $product, ProductAttribute $attribute): void
    {
        abort_unless($attribute->product_id === $product->id, 404);
    }

    private function imageOptionsForProduct(Product $product): array
    {
        $options = [];

        if ($product->image) {
            $options[] = [
                'label' => 'Cover image',
                'url' => $product->image,
                'preview_url' => $this->resolveImageUrl($product->image),
            ];
        }

        foreach ($product->images as $index => $image) {
            $options[] = [
                'label' => 'Gallery image #' . ($index + 1),
                'url' => $image->url,
                'preview_url' => $this->resolveImageUrl($image->url),
            ];
        }

        return collect($options)
            ->unique('url')
            ->values()
            ->all();
    }

    private function resolveImageUrl(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        return asset('storage/' . ltrim($path, '/'));
    }
}
