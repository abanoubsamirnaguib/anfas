<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

return new class extends Migration
{
    /**
     * Null-out any category cover_image that is a legacy frontend asset path
     * (e.g. "assets/perfume/men.jpg"). These paths are not served by Laravel
     * storage and were previously hardcoded in the React frontend.
     */
    public function up(): void
    {
        DB::table('categories')
            ->whereNotNull('cover_image')
            ->where('cover_image', 'like', 'assets/%')
            ->update(['cover_image' => null]);

        // Bust the API category cache so the change is reflected immediately
        Cache::forget('api.categories');
        DB::table('categories')->pluck('slug')->each(function ($slug) {
            Cache::forget("api.category.{$slug}");
        });
    }

    public function down(): void
    {
        // No rollback — the old local asset paths are intentionally removed
    }
};
