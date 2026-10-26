<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('panacea_floor_elements', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('dining_area_id')->index();
            $table->string('kind', 24);
            $table->decimal('x', 9, 2);
            $table->decimal('y', 9, 2);
            $table->decimal('width', 9, 2);
            $table->decimal('height', 9, 2);
            $table->string('label', 80)->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('panacea_floor_elements'); }
};
