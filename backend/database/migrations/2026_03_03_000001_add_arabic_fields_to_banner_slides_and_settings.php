<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Add Arabic title/subtitle to banner_slides if they don't exist
        Schema::table('banner_slides', function (Blueprint $table) {
            if (!Schema::hasColumn('banner_slides', 'title_ar')) {
                $table->string('title_ar')->nullable()->after('title');
            }
            if (!Schema::hasColumn('banner_slides', 'subtitle_ar')) {
                $table->string('subtitle_ar')->nullable()->after('subtitle');
            }
        });

        // Add Arabic About Us description setting if it doesn't exist
        if (!DB::table('settings')->where('key', 'about_us_description_ar')->exists()) {
            $now = now();

            $en = DB::table('settings')->where('key', 'about_us_description')->value('value');

            DB::table('settings')->insert([
                'key'        => 'about_us_description_ar',
                'value'      => $en ?? '',
                'label'      => 'About Us Description (Arabic)',
                'group'      => 'about',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }

    public function down(): void
    {
        Schema::table('banner_slides', function (Blueprint $table) {
            if (Schema::hasColumn('banner_slides', 'title_ar')) {
                $table->dropColumn('title_ar');
            }
            if (Schema::hasColumn('banner_slides', 'subtitle_ar')) {
                $table->dropColumn('subtitle_ar');
            }
        });

        DB::table('settings')->where('key', 'about_us_description_ar')->delete();
    }
};

