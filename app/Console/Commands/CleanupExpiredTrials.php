<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Tenant;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

class CleanupExpiredTrials extends Command
{
    protected $signature = 'tenant:cleanup-expired';
    protected $description = 'Membersihkan data tenant trial 14 hari & mengarsipkan ke tabel leads';

    public function handle()
    {
        // Cari tenant yang berumur lebih dari 14 hari
        $expiredTenants = Tenant::where('trials_end_at', '<=', Carbon::now())->get();

        foreach ($expiredTenants as $tenant) {
            DB::transaction(function () use ($tenant) {
                
                // ==========================================
                // 1. ARSIPKAN KE TABEL LEADS
                // ==========================================
                // Join ke tabel tenant_user untuk mencari PIC sebelum ter-cascade
                $picUser = DB::table('users')
                    ->join('tenant_user', 'users.id', '=', 'tenant_user.user_id')
                    ->where('tenant_user.tenant_id', $tenant->id)
                    ->select('users.*')
                    ->first();

                if ($picUser) {
                    DB::table('leads')->insert([
                        'company_name'    => $tenant->name,
                        'pic_name'        => $picUser->name,
                        'email'           => $picUser->email,
                        'whatsapp'        => $picUser->whatsapp_number,
                        'subdomain_used'  => $tenant->id,
                        'status'          => 'expired_trial',
                        'trial_ended_at' =>  now(),
                        'created_at'      => now(),
                        'updated_at'      => now(),
                    ]);
                }

                // ==========================================
                // 2. CLEANUP MANUAL UNTUK SPATIE SAJA
                // (Karena model_has_roles & roles tidak menggunakan cascade)
                // ==========================================
                $roleIds = DB::table('roles')->where('team_id', $tenant->id)->pluck('id');
                
                if ($roleIds->isNotEmpty()) {
                    // Hapus relasi pivot Spatie
                    DB::table('role_has_permissions')->whereIn('role_id', $roleIds)->delete();
                    DB::table('model_has_roles')->whereIn('role_id', $roleIds)->delete();
                    
                    // Hapus Role utamanya
                    DB::table('roles')->whereIn('id', $roleIds)->delete();
                }

                // Hapus pivot model_has_permissions (jika digunakan)
                if (Schema::hasColumn('model_has_permissions', 'team_id')) {
                    DB::table('model_has_permissions')->where('team_id', $tenant->id)->delete();
                }

                // ==========================================
                // 3. HAPUS TENANT
                // (Database akan otomatis men-cascade domains, tenant_user, dll)
                // ==========================================
                $tenant->delete();

                // ==========================================
                // 4. CLEANUP USER (Jika sudah tidak terikat tenant manapun)
                // ==========================================
                if ($picUser) {
                    $tenantCount = DB::table('tenant_user')->where('user_id', $picUser->id)->count();
                    if ($tenantCount === 0) {
                        DB::table('users')->where('id', $picUser->id)->delete();
                    }
                }
                
            }); // Akhir DB::transaction
        }

        $this->info('Pembersihan selesai. Leads telah diarsipkan, dan relasi Spatie berhasil dibersihkan.');
    }
}