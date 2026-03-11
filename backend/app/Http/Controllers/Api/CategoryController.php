<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;

class CategoryController extends Controller
{
    /**
     * Return all active categories.
     */
    public function index()
    {
        $categories = Category::where('is_active', true)
            ->withCount(['products' => function ($query) {
                $query->where('is_active', true);
            }])
            ->orderBy('sort_order')
            ->get()
            ->map(fn ($c) => $this->formatCategory($c));

        return response()->json($categories);
    }

    /**
     * Return a single category by slug.
     */
    public function show(Category $category)
    {
        $category->loadCount(['products' => function ($query) {
            $query->where('is_active', true);
        }]);
        
        return response()->json($this->formatCategory($category));
    }

    /**
     * Normalise a category for the frontend:
     * - Resolve cover_image to a full URL when it is a relative storage path
     */
    private function formatCategory(Category $category): array
    {
        return [
            'id'             => $category->id,
            'name'           => $category->name,
            'name_ar'        => $category->name_ar,
            'slug'           => $category->slug,
            'description'    => $category->description,
            'description_ar' => $category->description_ar,
            'cover_image'    => $this->resolveImageUrl($category->cover_image),
            'tagline'        => $category->tagline,
            'tagline_ar'     => $category->tagline_ar,
            'sort_order'     => $category->sort_order,
            'is_active'      => $category->is_active,
            'products_count' => $category->products_count ?? 0,
        ];
    }

    /**
     * Turn a stored path into a public URL.
     * Paths that already start with http(s) are returned as-is.
     * Legacy frontend asset paths (assets/perfume/...) are treated as null
     * so the frontend falls back to FALLBACK_IMG instead of a broken URL.
     */
    private function resolveImageUrl(?string $path): ?string
    {
        if (!$path) return null;
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }
        // Legacy local frontend paths — not served by storage, discard them
        if (str_starts_with($path, 'assets/')) {
            return null;
        }
        return asset('storage/' . ltrim($path, '/'));
    }
}
