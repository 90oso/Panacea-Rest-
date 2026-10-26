<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('panacea_ingredients', function (Blueprint $table) {
            $table->id();
            $table->string('name', 120);
            $table->string('unit', 16)->default('unidad');
            $table->decimal('min_stock', 12, 3)->default(0);
            $table->decimal('unit_cost', 12, 4)->default(0);
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        Schema::create('panacea_recipe_lines', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('menu_id')->index();
            $table->foreignId('ingredient_id')->constrained('panacea_ingredients')->restrictOnDelete();
            $table->decimal('quantity', 12, 3);
            $table->timestamps();
            $table->unique(['menu_id', 'ingredient_id']);
        });

        Schema::create('panacea_stock_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ingredient_id')->constrained('panacea_ingredients')->restrictOnDelete();
            $table->string('kind', 20);
            $table->decimal('quantity_delta', 12, 3);
            $table->decimal('unit_cost', 12, 4);
            $table->unsignedBigInteger('order_line_id')->nullable()->index();
            $table->string('note', 180)->nullable();
            $table->timestamps();
            // One consumption movement per ingredient and order line.
            $table->unique(['order_line_id', 'ingredient_id']);
        });

        Schema::create('panacea_guest_profiles', function (Blueprint $table) {
            $table->id();
            $table->string('display_name', 100);
            $table->boolean('contact_opt_in')->default(false);
            $table->unsignedInteger('visits_count')->default(0);
            $table->dateTime('last_visit_at')->nullable();
            $table->timestamps();
        });
        Schema::table('panacea_service_sessions', function (Blueprint $table) {
            $table->unsignedBigInteger('guest_profile_id')->nullable()->index();
        });

        Schema::create('panacea_staff_directory', function (Blueprint $table) {
            $table->id();
            $table->string('display_name', 100);
            $table->string('role', 32);
            $table->string('shift_label', 80)->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        Schema::create('panacea_incidents', function (Blueprint $table) {
            $table->id();
            $table->string('title', 140);
            $table->string('severity', 16)->default('medium');
            $table->string('status', 16)->default('open');
            $table->string('owner_label', 80)->nullable();
            $table->unsignedBigInteger('dining_table_id')->nullable();
            $table->dateTime('resolved_at')->nullable();
            $table->timestamps();
        });

        Schema::create('panacea_audit_events', function (Blueprint $table) {
            $table->id();
            $table->string('action', 50);
            $table->string('resource_type', 40);
            $table->unsignedBigInteger('resource_id')->nullable();
            $table->json('details')->nullable();
            $table->dateTime('occurred_at');
            $table->index(['resource_type', 'resource_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('panacea_audit_events');
        Schema::dropIfExists('panacea_incidents');
        Schema::dropIfExists('panacea_staff_directory');
        Schema::table('panacea_service_sessions', function (Blueprint $table) {
            $table->dropColumn('guest_profile_id');
        });
        Schema::dropIfExists('panacea_guest_profiles');
        Schema::dropIfExists('panacea_stock_movements');
        Schema::dropIfExists('panacea_recipe_lines');
        Schema::dropIfExists('panacea_ingredients');
    }
};
