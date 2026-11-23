<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. TABEL UTAMA: TASKS
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            
            // --- KATEGORISASI (Berdasarkan Excel) ---
            $table->string('team')->nullable();           // Contoh: DMN
            $table->string('brand')->nullable();          // Contoh: YOUTUBE, OTHERS
            $table->string('project')->nullable();        // Contoh: Beyond Batas, DMN x SerbaSewa
            $table->string('title');                      // Nama Task: Editing 3 Shorts...
            
            // --- MANAJEMEN WAKTU & PROGRESS ---
            $table->date('start_date')->nullable();       // Mulai
            $table->integer('working_days')->default(1);  // Hari Kerja
            $table->date('end_date')->nullable();         // Selesai
            $table->tinyInteger('progress')->default(0);  // Progress 0-100%
            $table->string('status')->default('pending'); // Status: pending, in_progress, selesai
            
            // --- CATATAN & PENGATURAN ---
            $table->text('description')->nullable();
            $table->text('notes')->nullable();            // Catatan khusus
            $table->boolean('is_assignable')->default(true);
            $table->integer('position')->default(0);
            
            // --- RELASI PENGGUNA ---
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete(); // PIC
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            
            $table->timestamps();
        });

        // 2. TABEL: TRACKING ASSIGNEE SEBELUMNYA (Tetap dipertahankan)
        Schema::create('task_past_assignees', function (Blueprint $table) {
            $table->foreignId('task_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->primary(['task_id', 'user_id']); 
        });

        // 3. TABEL BARU: DAILY ACTIVITY LOG (Untuk Kotak Hijau Gantt Chart)
        Schema::create('task_daily_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained()->cascadeOnDelete();
            $table->date('log_date');                     // Tanggal kotak hijau (Misal: 1, 2, 3...)
            $table->tinyInteger('progress_today')->default(0); // Opsional: Berapa % progress yang dicapai hari ini
            $table->text('report')->nullable();           // Laporan singkat harian pekerja
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            // Memastikan 1 user/sistem hanya mencatat 1 laporan per hari untuk task yang sama
            $table->unique(['task_id', 'log_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('task_daily_logs');
        Schema::dropIfExists('task_past_assignees');
        Schema::dropIfExists('tasks');
    }
};