<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // 1. Modifikasi tabel roles
        Schema::table('roles', function (Blueprint $table) {
            // A. Tambahkan team_id (Dibutuhkan oleh Spatie)
            $table->string('team_id')->nullable()->after('id');
            $table->index('team_id');

            // B. Ubah tipe data tenant_id menjadi string (Dibutuhkan oleh Stancl Tenancy)
            $table->string('tenant_id')->nullable()->change();
        });

        // 2. Tambahkan team_id ke tabel model_has_roles (pivot karyawan & jabatan)
        Schema::table('model_has_roles', function (Blueprint $table) {
            $table->string('team_id')->nullable();
            $table->index(['team_id', 'model_type', 'model_id']);
        });

        // 3. Tambahkan team_id ke tabel model_has_permissions
        Schema::table('model_has_permissions', function (Blueprint $table) {
            $table->string('team_id')->nullable();
            $table->index(['team_id', 'model_type', 'model_id']);
        });
    }

    public function down()
    {
        Schema::table('roles', function (Blueprint $table) {
            $table->dropIndex(['team_id']);
            $table->dropColumn('team_id');
            
            // Kembalikan tenant_id ke integer jika di-rollback
            $table->integer('tenant_id')->nullable()->change();
        });

        Schema::table('model_has_roles', function (Blueprint $table) {
            $table->dropIndex(['team_id', 'model_type', 'model_id']);
            $table->dropColumn('team_id');
        });

        Schema::table('model_has_permissions', function (Blueprint $table) {
            $table->dropIndex(['team_id', 'model_type', 'model_id']);
            $table->dropColumn('team_id');
        });
    }
};