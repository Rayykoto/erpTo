<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('holidays', function (Blueprint $table) {
            $table->id();
            $table->date('date')->unique(); // Tanggal libur (YYYY-MM-DD)
            $table->string('name'); // Nama hari libur
            $table->boolean('is_national')->default(true); // Penanda libur nasional vs libur perusahaan
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('holidays');
    }
};