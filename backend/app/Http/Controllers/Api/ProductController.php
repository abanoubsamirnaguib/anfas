<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Products list for a category.
     * Simple queries (no search / no extra filters) are cached for 30 minutes.
     */
    public function index(Request $request, $categorySlug)
    {
        $search      = $request->input('search', '');
        $tag         = $request->input('tag', '');
        $featured    = $request->input('featured', '');
        $sortBy      = $request->input('sort', 'sort_order');
        $direction   = $request->input('direction', 'asc');
        $perPage     = (int) $request->input('per_page', 20);
        $page        = (int) $request->input('page', 1);

        $fetcher = function () use ($categorySlug, $search, $tag, $featured, $sortBy, $direction, $perPage) {
            $query = Product::whereHas('category', function ($q) use ($categorySlug) {
                $q->where('slug', $categorySlug)->where('is_active', true);
            })
            ->where('is_active', true)
            ->with(['attributes' => function ($q) {
                $q->where('is_active', true)->orderBy('sort_order');
            }]);

            if ($search) {
                $query->where('name', 'like', "%{$search}%");
            }

            if ($tag) {
                $query->where(function ($q) use ($tag) {
                    // MySQL: exact element match in JSON array (case-insensitive)
                    $q->whereRaw('JSON_CONTAINS(LOWER(tags), JSON_QUOTE(LOWER(?)))', [$tag])
                      // Fallback for SQLite / testing
                      ->orWhereRaw('LOWER(tags) LIKE ?', ['%"' . strtolower($tag) . '"%']);
                });
            }

            if ($featured) {
                $query->where('is_featured', true);
            }

            $query->orderBy($sortBy, $direction);

            return $query->paginate($perPage);
        };

        $products = $fetcher();

        // Map to frontend-friendly shape
        $products->getCollection()->transform(fn ($p) => $this->formatProduct($p));

        return response()->json($products);
    }

    /**
     * Global featured products (across all active categories).
     * GET /products/featured?per_page=10
     */
    public function featured(Request $request)
    {
        $perPage = (int) $request->input('per_page', 10);

        $products = Product::where('is_active', true)
            ->where('is_featured', true)
            ->whereHas('category', fn ($q) => $q->where('is_active', true))
            ->with([
                'category',
                'attributes' => fn ($q) => $q->where('is_active', true)->orderBy('sort_order'),
            ])
            ->orderBy('sort_order')
            ->limit($perPage)
            ->get()
            ->map(fn ($p) => $this->formatProduct($p, true));

        return response()->json($products);
    }

    /**
     * Return all unique tags for products in a category.
     * Cached for 60 minutes and invalidated when products change.
     */
    public function tags($categorySlug)
    {
        $productsOnly = request()->boolean('products_only', false);

        // Unless caller wants raw product tags, prefer category-level tags when set
        if (!$productsOnly) {
            $category = \App\Models\Category::where('slug', $categorySlug)
                ->where('is_active', true)
                ->first();

            if ($category && !empty($category->tags)) {
                return response()->json(array_values($category->tags));
            }
        }

        // Derive unique tags from the products in this category
        $products = Product::whereHas('category', function ($q) use ($categorySlug) {
                $q->where('slug', $categorySlug);
            })
            ->whereNotNull('tags')
            ->pluck('tags');

        $tags = $products
            ->flatten()
            ->filter()
            ->unique()
            ->values();

        return response()->json($tags);
    }

    /**
     * Single product, cached 30 minutes.
     */
    public function show(Product $product)
    {
        $product->load([
            'category',
            'attributes' => function ($query) {
                $query->where('is_active', true)->orderBy('sort_order');
            },
        ]);

        $data = $this->formatProduct($product, true);

        return response()->json($data);
    }

    /**
     * Map a Product model to the shape expected by the Ionic frontend.
     *
     * Core fields the frontend uses:
     *   - id, slug, title, image, price (formatted), reviews, description
     *   - attributes  → [{name, value, price, formatted_price}]
     *   - fragrance_notes, shipping_info
     *   - category (when $withCategory = true)
     */
    private function formatProduct(Product $product, bool $withCategory = false): array
    {
        $attributes = ($product->relationLoaded('attributes') ? $product->attributes : collect())
            ->map(fn ($a) => [
                'id'              => $a->id,
                'name'            => $a->name,
                'value'           => $a->value,
                'price'           => (float) $a->price,
                'formatted_price' => 'L.E ' . number_format($a->price, 0),
                'stock'           => $a->stock,
                'sku'             => $a->sku,
            ]);

        // Use the smallest-size attribute price as the display price, fallback to base_price
        $displayPrice = $attributes->isNotEmpty()
            ? $attributes->sortBy('price')->first()['price']
            : (float) $product->final_price;

        $data = [
            'id'              => $product->id,
            'slug'            => $product->slug,
            'title'           => $product->name,
            'image'           => $this->resolveImageUrl($product->image),
            'price'           => 'L.E ' . number_format($displayPrice, 0),
            'base_price'      => (float) $product->base_price,
            'final_price'     => (float) $product->final_price,
            'discount'        => (float) $product->discount_percentage,
            'reviews'         => (float) $product->rating,
            'reviews_count'   => $product->reviews_count,
            'description'     => $product->description,
            'fragrance_notes' => $product->fragrance_notes,
            'shipping_info'   => $product->shipping_info,
            'is_featured'     => $product->is_featured,
            'tags'            => $product->tags ?? [],
            'attributes'      => $attributes->values(),
        ];

        if ($withCategory && $product->relationLoaded('category')) {
            $data['category'] = $product->category ? [
                'id'   => $product->category->id,
                'name' => $product->category->name,
                'slug' => $product->category->slug,
            ] : null;
        }

        return $data;
    }

    private function resolveImageUrl(?string $path): ?string
    {
        if (!$path) return null;
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }
        return asset('storage/' . ltrim($path, '/'));
    }
}
