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
            $query = Product::whereHas('categories', function ($q) use ($categorySlug) {
                $q->where('slug', $categorySlug)->where('is_active', true);
            })
            ->where('is_active', true)
            ->with([
                'attributes' => function ($q) {
                    $q->where('is_active', true)->orderBy('sort_order');
                },
                'images',
            ]);

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhereRaw('JSON_SEARCH(tags, "one", ?) IS NOT NULL', ["%{$search}%"]);
                });
            }

            if ($tag) {
                $query->where(function ($q) use ($tag) {
                    // MySQL: exact element match in JSON array (works with Arabic/UTF-8)
                    $q->whereRaw('JSON_CONTAINS(tags, JSON_QUOTE(?))', [$tag])
                      // Fallback for SQLite / testing (also works with Arabic/UTF-8)
                      ->orWhereRaw('tags LIKE ?', ['%"' . $tag . '"%']);
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
            ->whereHas('categories', fn ($q) => $q->where('is_active', true))
            ->with([
                'categories',
                'attributes' => fn ($q) => $q->where('is_active', true)->orderBy('sort_order'),
                'images',
            ])
            ->orderBy('sort_order')
            ->limit($perPage)
            ->get()
            ->map(fn ($p) => $this->formatProduct($p, true));

        return response()->json($products);
    }

    /**
     * Global suggested products (across all active categories).
     * GET /products/suggested?per_page=10
     */
    public function suggested(Request $request)
    {
        $perPage = (int) $request->input('per_page', 10);

        $products = Product::where('is_active', true)
            ->where('is_suggested', true)
            ->whereHas('categories', fn ($q) => $q->where('is_active', true))
            ->with([
                'categories',
                'attributes' => fn ($q) => $q->where('is_active', true)->orderBy('sort_order'),
                'images',
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
        $products = Product::whereHas('categories', function ($q) use ($categorySlug) {
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
            'categories',
            'attributes' => function ($query) {
                $query->where('is_active', true)->orderBy('sort_order');
            },
            'images',
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
        $productDiscount = (float) $product->discount_percentage;
        
        $attributes = ($product->relationLoaded('attributes') ? $product->attributes : collect())
            ->map(function ($a) {
                // Each attribute has its own discount percentage
                $attributeDiscount = (float) ($a->discount_percentage ?? 0);
                $originalPrice = (float) $a->price;
                $discountedPrice = $attributeDiscount > 0 
                    ? $originalPrice * (1 - ($attributeDiscount / 100))
                    : $originalPrice;
                
                return [
                    'id'                     => $a->id,
                    'name'                   => $a->name,
                    'value'                  => $a->value,
                    'original_price'         => $originalPrice,
                    'price'                  => $discountedPrice,
                    'formatted_price'        => 'L.E ' . number_format($discountedPrice, 0),
                    'formatted_original_price' => 'L.E ' . number_format($originalPrice, 0),
                    'discount'               => $attributeDiscount,
                    'stock'                  => $a->stock,
                    'sku'                    => $a->sku,
                ];
            });

        // Use the smallest-size attribute price as the display price, fallback to base_price
        if ($attributes->isNotEmpty()) {
            // Product has attributes - use first attribute's price and discount
            $firstAttr = $attributes->sortBy('price')->first();
            $displayPrice = $firstAttr['price'];
            $originalDisplayPrice = $firstAttr['original_price'];
            $displayDiscount = $firstAttr['discount'];
        } else {
            // No attributes - use product's base price and discount
            $originalDisplayPrice = (float) $product->base_price;
            $displayPrice = (float) $product->final_price;
            $displayDiscount = $productDiscount;
        }

        $data = [
            'id'                   => $product->id,
            'slug'                 => $product->slug,
            'title'                => $product->name,
            'image'                => $this->resolveImageUrl($product->image),
            'video_url'            => $this->resolveImageUrl($product->video_url),
            'images'               => ($product->relationLoaded('images') ? $product->images : collect())
                ->map(fn ($img) => [
                    'id'         => $img->id,
                    'url'        => $this->resolveImageUrl($img->url),
                    'alt_text'   => $img->alt_text,
                    'sort_order' => $img->sort_order,
                ])->values(),
            'price'                => 'L.E ' . number_format($displayPrice, 0),
            'original_price'       => 'L.E ' . number_format($originalDisplayPrice, 0),
            'base_price'           => (float) $product->base_price,
            'final_price'          => (float) $product->final_price,
            'discount'             => $displayDiscount,  // Use calculated display discount
            'has_attributes'       => $attributes->isNotEmpty(),
            'reviews'              => (float) $product->rating,
            'reviews_count'        => $product->reviews_count,
            'description'          => $product->description,
            'description_ar'       => $product->description_ar,
            'fragrance_notes'      => $product->fragrance_notes,
            'shipping_info'        => $product->shipping_info,
            'is_featured'          => $product->is_featured,
            'is_suggested'         => $product->is_suggested,
            'tags'                 => $product->tags ?? [],
            'attributes'           => $attributes->values(),
        ];

        if ($withCategory && $product->relationLoaded('categories')) {
            $data['categories'] = $product->categories->map(fn ($cat) => [
                'id'   => $cat->id,
                'name' => $cat->name,
                'slug' => $cat->slug,
            ])->values();
            
            // For backward compatibility, include the first category as 'category'
            $data['category'] = $product->categories->first() ? [
                'id'   => $product->categories->first()->id,
                'name' => $product->categories->first()->name,
                'slug' => $product->categories->first()->slug,
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
