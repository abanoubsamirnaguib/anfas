<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Migrate existing product-category relationships to the pivot table
        DB::statement('
            INSERT INTO category_product (category_id, product_id, created_at, updated_at)
            SELECT category_id, id, created_at, updated_at
            FROM products
            WHERE category_id IS NOT NULL
        ');

        // Drop the foreign key and category_id column from products table
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->dropColumn('category_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Re-add the category_id column
        Schema::table('products', function (Blueprint $table) {
            $table->foreignId('category_id')->nullable()->after('id')->constrained()->onDelete('cascade');
        });

        // Migrate back: take the first category from the pivot table
        DB::statement('
            UPDATE products p
            INNER JOIN (
                SELECT product_id, MIN(category_id) as category_id
                FROM category_product
                GROUP BY product_id
            ) cp ON p.id = cp.product_id
            SET p.category_id = cp.category_id
        ');
    }
};
