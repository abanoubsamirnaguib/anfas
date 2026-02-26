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
        $attributes = $product->attributes;

        return Inertia::render('Admin/ProductAttributes/Index', [
            'product' => $product,
            'attributes' => $attributes,
        ]);
    }

    public function create(Product $product)
    {
        return Inertia::render('Admin/ProductAttributes/Create', [
            'product' => $product,
        ]);
    }

    public function store(ProductAttributeRequest $request, Product $product)
    {
        $validated = $request->validated();
        $validated['product_id'] = $product->id;

        ProductAttribute::create($validated);

        return redirect()->route('admin.products.attributes.index', $product)
            ->with('success', 'Product attribute created successfully.');
    }

    public function edit(Product $product, ProductAttribute $attribute)
    {
        return Inertia::render('Admin/ProductAttributes/Edit', [
            'product' => $product,
            'attribute' => $attribute,
        ]);
    }

    public function update(ProductAttributeRequest $request, Product $product, ProductAttribute $attribute)
    {
        $validated = $request->validated();

        $attribute->update($validated);

        return redirect()->route('admin.products.attributes.index', $product)
            ->with('success', 'Product attribute updated successfully.');
    }

    public function destroy(Product $product, ProductAttribute $attribute)
    {
        $attribute->delete();

        return redirect()->route('admin.products.attributes.index', $product)
            ->with('success', 'Product attribute deleted successfully.');
    }
}
