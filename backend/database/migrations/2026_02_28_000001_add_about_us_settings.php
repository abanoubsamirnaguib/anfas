<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $now = now();

        $rows = [
            [
                'key'        => 'about_us_description',
                'value'      => '<p>Welcome to <strong>Anfas</strong> — a house of fine fragrances crafted with passion and precision. We believe every scent tells a story, and every bottle is a journey waiting to unfold.</p>',
                'label'      => 'About Us Description',
                'group'      => 'about',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'key'        => 'social_facebook',
                'value'      => '',
                'label'      => 'Facebook URL',
                'group'      => 'social',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'key'        => 'social_instagram',
                'value'      => '',
                'label'      => 'Instagram URL',
                'group'      => 'social',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'key'        => 'social_tiktok',
                'value'      => '',
                'label'      => 'TikTok URL',
                'group'      => 'social',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'key'        => 'social_youtube',
                'value'      => '',
                'label'      => 'YouTube URL',
                'group'      => 'social',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];

        foreach ($rows as $row) {
            DB::table('settings')->updateOrInsert(['key' => $row['key']], $row);
        }
    }

    public function down(): void
    {
        DB::table('settings')->whereIn('key', [
            'about_us_description',
            'social_facebook',
            'social_instagram',
            'social_tiktok',
            'social_youtube',
        ])->delete();
    }
};
