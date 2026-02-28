<?php

namespace App\Console\Commands;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Console\Command;

/**
 * Re-encode JSON columns so that Arabic / non-ASCII text
 * is stored as actual UTF-8 instead of \uXXXX escape sequences.
 *
 * Usage:  php artisan tags:fix-unicode
 */
class FixUnicodeTags extends Command
{
    protected $signature = 'tags:fix-unicode';
    protected $description = 'Re-encode tags (and other JSON columns) with JSON_UNESCAPED_UNICODE';

    public function handle(): int
    {
        $this->info('Fixing product tags …');
        $fixed = 0;

        Product::whereNotNull('tags')->chunkById(100, function ($products) use (&$fixed) {
            foreach ($products as $product) {
                // Reading triggers the JsonUnicode get(); writing triggers set()
                // which now uses JSON_UNESCAPED_UNICODE.
                $dirty = false;

                foreach (['tags', 'fragrance_notes', 'shipping_info'] as $col) {
                    $raw = $product->getRawOriginal($col);
                    if ($raw && preg_match('/\\\\u[0-9a-fA-F]{4}/', $raw)) {
                        $dirty = true;
                    }
                }

                if ($dirty) {
                    // Force-save all JSON columns via the new cast
                    $product->tags            = $product->tags;
                    $product->fragrance_notes = $product->fragrance_notes;
                    $product->shipping_info   = $product->shipping_info;
                    $product->saveQuietly();
                    $fixed++;
                }
            }
        });

        $this->info("  → {$fixed} product(s) re-encoded.");

        $this->info('Fixing category tags …');
        $catFixed = 0;

        Category::whereNotNull('tags')->chunkById(100, function ($categories) use (&$catFixed) {
            foreach ($categories as $category) {
                $raw = $category->getRawOriginal('tags');
                if ($raw && preg_match('/\\\\u[0-9a-fA-F]{4}/', $raw)) {
                    $category->tags = $category->tags;
                    $category->saveQuietly();
                    $catFixed++;
                }
            }
        });

        $this->info("  → {$catFixed} category(ies) re-encoded.");
        $this->info('Done ✓');

        return self::SUCCESS;
    }
}
