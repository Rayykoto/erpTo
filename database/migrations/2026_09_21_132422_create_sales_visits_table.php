<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sales_visits', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('client_name'); // Nama Perusahaan atau PIC
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('latitude')->nullable(); // Opsional
            $table->string('longitude')->nullable(); // Opsional
            $table->string('photo_path')->nullable(); // Opsional
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales_visits');
    }
};