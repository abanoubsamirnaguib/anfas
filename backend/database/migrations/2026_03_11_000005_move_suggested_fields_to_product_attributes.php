<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_attributes', function (Blueprint $table) {
            if (!Schema::hasColumn('product_attributes', 'is_default')) {
                $table->boolean('is_default')->default(false)->after('is_active');
            }

            if (!Schema::hasColumn('product_attributes', 'is_suggested')) {
                $table->boolean('is_suggested')->default(false)->after('is_default');
            }

            if (!Schema::hasColumn('product_attributes', 'image_url')) {
                $table->string('image_url', 500)->nullable()->after('is_suggested');
            }

            if (!Schema::hasColumn('product_attributes', 'suggested_image_url')) {
                $table->string('suggested_image_url', 500)->nullable()->after('image_url');
            }
        });

        Schema::table('products', function (Blueprint $table) {
            if (Schema::hasColumn('products', 'is_suggested')) {
                $table->dropColumn('is_suggested');
            }
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'is_suggested')) {
                $table->boolean('is_suggested')->default(false)->after('is_featured');
            }
        });

        Schema::table('product_attributes', function (Blueprint $table) {
            $columns = array_filter([
                Schema::hasColumn('product_attributes', 'is_default') ? 'is_default' : null,
                Schema::hasColumn('product_attributes', 'is_suggested') ? 'is_suggested' : null,
                Schema::hasColumn('product_attributes', 'image_url') ? 'image_url' : null,
                Schema::hasColumn('product_attributes', 'suggested_image_url') ? 'suggested_image_url' : null,
            ]);

            if (!empty($columns)) {
                $table->dropColumn($columns);
            }
        });
    }
};
