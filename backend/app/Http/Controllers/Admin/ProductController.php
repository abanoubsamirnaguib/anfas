<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProductRequest;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['categories'])
            ->withCount('attributes');

        if ($request->filled('category_id')) {
            $query->whereHas('categories', function ($q) use ($request) {
                $q->where('categories.id', $request->category_id);
            });
        }

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $products = $query->orderBy('sort_order')->paginate(20);

        $categories = Category::where('is_active', true)->get();

        return Inertia::render('Admin/Products/Index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only(['category_id', 'search']),
        ]);
    }

    public function create()
    {
        $categories = Category::where('is_active', true)->get();

        return Inertia::render('Admin/Products/Create', [
            'categories' => $categories,
        ]);
    }

    public function store(ProductRequest $request)
    {
        $validated = $request->validated();
        $categoryIds   = $validated['category_ids'];
        $galleryImages = $validated['gallery_images'] ?? [];
        $coverImage = $validated['image'] ?? null;
        unset($validated['category_ids'], $validated['gallery_images']);

        $product = Product::create($validated);
        $product->categories()->sync($categoryIds);
        $this->syncGalleryImages($product, $galleryImages);
        $this->syncAttributeImageSelections($product, $coverImage, $galleryImages);
        $this->syncTagsToCategories($product);

        return redirect()->route('admin.products.index')
            ->with('success', 'Product created successfully.');
    }

    public function edit(Product $product)
    {
        $product->load(['attributes', 'categories', 'images']);
        $categories = Category::where('is_active', true)->get();

        return Inertia::render('Admin/Products/Edit', [
            'product' => $product,
            'categories' => $categories,
        ]);
    }

    public function update(ProductRequest $request, Product $product)
    {
        $validated = $request->validated();
        $categoryIds   = $validated['category_ids'];
        $galleryImages = $validated['gallery_images'] ?? [];
        $coverImage = $validated['image'] ?? null;
        unset($validated['category_ids'], $validated['gallery_images']);

        $product->update($validated);
        $product->categories()->sync($categoryIds);
        $this->syncGalleryImages($product, $galleryImages);
        $this->syncAttributeImageSelections($product, $coverImage, $galleryImages);
        $product->refresh();
        $this->syncTagsToCategories($product);

        return redirect()->route('admin.products.edit', $product)
            ->with('success', 'Product updated successfully.');
    }

    /**
     * Sync gallery images: replace all existing gallery images with the submitted list.
     */
    private function syncGalleryImages(Product $product, array $images): void
    {
        $product->images()->delete();

        foreach ($images as $i => $img) {
            $product->images()->create([
                'url'        => $img['url'],
                'alt_text'   => $img['alt_text'] ?? null,
                'sort_order' => $img['sort_order'] ?? $i,
            ]);
        }
    }

    /**
     * Clear attribute image references that are no longer selectable on the product.
     */
    private function syncAttributeImageSelections(Product $product, ?string $coverImage, array $galleryImages): void
    {
        $validImages = array_values(array_filter(array_unique(array_merge(
            array_filter([$coverImage]),
            array_values(array_filter(array_map(fn ($img) => $img['url'] ?? null, $galleryImages)))
        ))));

        if (empty($validImages)) {
            $product->attributes()->update([
                'image_url' => null,
                'suggested_image_url' => null,
            ]);

            return;
        }

        $product->attributes()
            ->whereNotNull('image_url')
            ->whereNotIn('image_url', $validImages)
            ->update(['image_url' => null]);

        $product->attributes()
            ->whereNotNull('suggested_image_url')
            ->whereNotIn('suggested_image_url', $validImages)
            ->update(['suggested_image_url' => null]);
    }

    /**
     * Merge the product's tags into all its categories' tags lists.
     */
    private function syncTagsToCategories(Product $product): void
    {
        if (empty($product->tags)) return;

        $categories = $product->categories;
        if ($categories->isEmpty()) return;

        foreach ($categories as $category) {
            $merged = array_values(array_unique(array_merge($category->tags ?? [], $product->tags)));
            $category->update(['tags' => $merged]);
        }
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return redirect()->route('admin.products.index')
            ->with('success', 'Product deleted successfully.');
    }
}
