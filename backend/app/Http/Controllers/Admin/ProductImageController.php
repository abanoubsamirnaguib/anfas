<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductImageController extends Controller
{
    public function index(Product $product)
    {
        $images = $product->images()->orderBy('sort_order')->get();

        return Inertia::render('Admin/ProductImages/Index', [
            'product' => $product,
            'images'  => $images,
        ]);
    }

    public function store(Request $request, Product $product)
    {
        $request->validate([
            'url'        => ['required', 'string', 'max:500'],
            'alt_text'   => ['nullable', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
        ]);

        $product->images()->create([
            'url'        => $request->url,
            'alt_text'   => $request->alt_text,
            'sort_order' => $request->sort_order ?? 0,
        ]);

        return redirect()->route('admin.products.images.index', $product)
            ->with('success', 'Image added successfully.');
    }

    public function update(Request $request, Product $product, ProductImage $image)
    {
        $request->validate([
            'url'        => ['required', 'string', 'max:500'],
            'alt_text'   => ['nullable', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
        ]);

        $image->update([
            'url'        => $request->url,
            'alt_text'   => $request->alt_text,
            'sort_order' => $request->sort_order ?? $image->sort_order,
        ]);

        return redirect()->route('admin.products.images.index', $product)
            ->with('success', 'Image updated successfully.');
    }

    public function destroy(Product $product, ProductImage $image)
    {
        $image->delete();

        return redirect()->route('admin.products.images.index', $product)
            ->with('success', 'Image deleted.');
    }
}
