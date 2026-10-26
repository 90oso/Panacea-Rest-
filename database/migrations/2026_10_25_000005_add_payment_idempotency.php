<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('panacea_service_payments', function (Blueprint $table) {
            $table->string('idempotency_key', 80)->nullable()->unique();
        });
    }

    public function down(): void
    {
        Schema::table('panacea_service_payments', function (Blueprint $table) {
            $table->dropUnique(['idempotency_key']);
            $table->dropColumn('idempotency_key');
        });
    }
};
