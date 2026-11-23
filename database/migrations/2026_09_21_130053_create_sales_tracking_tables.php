<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sales_targets', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('month_year');
            $table->decimal('target_amount', 15, 2);
            $table->decimal('achieved_amount', 15, 2)->default(0);
            $table->timestamps();
            $table->unique(['tenant_id', 'user_id', 'month_year']);

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });

        Schema::create('sales_rewards', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('reference_number')->nullable(); 
            $table->integer('points_earned'); 
            $table->string('source_type')->default('regular_sale'); 
            $table->string('status')->default('available');
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales_rewards');
        Schema::dropIfExists('sales_targets');
    }
};