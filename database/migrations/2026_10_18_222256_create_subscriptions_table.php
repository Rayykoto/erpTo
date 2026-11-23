<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            // Relasi ke User (PIC Utama)
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            // Relasi ke Paket
            $table->foreignId('package_id')->constrained('packages')->cascadeOnDelete();
            
            $table->string('status')->default('active'); // active, expired, cancelled
            $table->timestamp('expires_at')->nullable(); // Kapan paket berakhir
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('subscriptions');
    }
};