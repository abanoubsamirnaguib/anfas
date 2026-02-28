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
                'key'        => 'contact_phone',
                'value'      => '',
                'label'      => 'Contact Phone Number',
                'group'      => 'contact',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'key'        => 'contact_email',
                'value'      => '',
                'label'      => 'Contact Email Address',
                'group'      => 'contact',
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
        DB::table('settings')->whereIn('key', ['contact_phone', 'contact_email'])->delete();
    }
};
