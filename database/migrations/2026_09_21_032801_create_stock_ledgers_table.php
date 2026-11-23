<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::create('stock_ledgers', function (Blueprint $table) {
        $table->id();
        
        // 1. PERBAIKAN: Gunakan format string untuk tenant_id
        $table->string('tenant_id');
        $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
        
        // product_id tetap menggunakan foreignId karena tabel produk menggunakan $table->id()
        $table->foreignId('product_id')->constrained()->cascadeOnDelete();
        
        $table->morphs('reference'); 
        $table->enum('type', ['in', 'out']);
        $table->integer('quantity');
        $table->integer('running_balance');
        $table->string('notes')->nullable();
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_ledgers');
    }
};
