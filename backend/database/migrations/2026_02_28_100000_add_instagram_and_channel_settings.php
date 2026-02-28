<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add channel column to whatsapp_messages table
        if (!Schema::hasColumn('whatsapp_messages', 'channel')) {
            Schema::table('whatsapp_messages', function (Blueprint $table) {
                $table->string('channel', 20)->default('whatsapp')->after('message');
            });
        }

        // Add customer_whatsapp column if missing
        if (!Schema::hasColumn('whatsapp_messages', 'customer_whatsapp')) {
            Schema::table('whatsapp_messages', function (Blueprint $table) {
                $table->string('customer_whatsapp', 30)->nullable()->after('customer_phone');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('whatsapp_messages', 'channel')) {
            Schema::table('whatsapp_messages', function (Blueprint $table) {
                $table->dropColumn('channel');
            });
        }

        if (Schema::hasColumn('whatsapp_messages', 'customer_whatsapp')) {
            Schema::table('whatsapp_messages', function (Blueprint $table) {
                $table->dropColumn('customer_whatsapp');
            });
        }
    }
};
