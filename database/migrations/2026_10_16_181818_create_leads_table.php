<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->string('company_name');
            $table->string('pic_name');
            $table->string('whatsapp');
            $table->string('email')->unique();
            $table->string('subdomain_used')->nullable();
            $table->string('status')->default('expired_trial');
            $table->text('notes')->nullable();
            $table->timestamp('trial_ended_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leads');
    }
};
