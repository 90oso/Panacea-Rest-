<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('panacea_service_reservations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('dining_table_id')->index();
            $table->string('guest_name', 100);
            $table->unsignedSmallInteger('party_size');
            $table->dateTime('reserved_at')->index();
            $table->unsignedSmallInteger('duration_minutes')->default(90);
            $table->string('status', 20)->default('confirmed');
            $table->string('notes', 255)->nullable();
            $table->timestamps();
        });
        Schema::create('panacea_service_sessions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('dining_table_id')->index();
            $table->unsignedBigInteger('reservation_id')->nullable()->index();
            $table->string('guest_name', 100);
            $table->unsignedSmallInteger('party_size');
            $table->string('status', 20)->default('open');
            $table->dateTime('opened_at');
            $table->dateTime('closed_at')->nullable();
            $table->timestamps();
        });
        Schema::create('panacea_service_orders', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('session_id')->index();
            $table->string('status', 20)->default('pending');
            $table->decimal('subtotal', 12, 2);
            $table->timestamps();
        });
        Schema::create('panacea_service_order_lines', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('order_id')->index();
            $table->unsignedBigInteger('menu_id')->nullable();
            $table->string('title', 140);
            $table->unsignedSmallInteger('quantity');
            $table->decimal('unit_price', 12, 2);
            $table->timestamps();
        });
        Schema::create('panacea_service_payments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('session_id')->index();
            $table->decimal('amount', 12, 2);
            $table->string('method', 24);
            $table->dateTime('recorded_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('panacea_service_payments');
        Schema::dropIfExists('panacea_service_order_lines');
        Schema::dropIfExists('panacea_service_orders');
        Schema::dropIfExists('panacea_service_sessions');
        Schema::dropIfExists('panacea_service_reservations');
    }
};
