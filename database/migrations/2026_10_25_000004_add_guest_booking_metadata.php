<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('panacea_service_reservations', function (Blueprint $table) {
            $table->string('contact_email', 190)->nullable();
            $table->string('source', 20)->default('staff');
        });
    }

    public function down(): void
    {
        Schema::table('panacea_service_reservations', function (Blueprint $table) {
            $table->dropColumn(['contact_email','source']);
        });
    }
};
