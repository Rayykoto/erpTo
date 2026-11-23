<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('packages', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Contoh: Starter, Premium, Custom
            $table->integer('max_companies')->default(1); // Batas maksimal cabang/perusahaan
            $table->json('features')->nullable(); // Opsional: Untuk menyimpan daftar fitur yang didapat
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('packages');
    }
};