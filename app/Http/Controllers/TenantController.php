<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use App\Models\Tenant;
use App\Services\TenantSetupService;
use Illuminate\Support\Facades\Auth;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class TenantController extends Controller
{
    public function switch(Request $request)
    {
        $request->validate([
            'tenant_id' => 'required|string|exists:tenants,id',
        ]);

        $user = Auth::user();
        $tenantId = $request->tenant_id;

        // ALUR KHUSUS SUPER ADMIN: Bebas beralih ke tenant manapun
        if ($user && $user->is_super_admin) {
            session(['active_tenant_id' => $tenantId]);
            setPermissionsTeamId($tenantId);
            app(PermissionRegistrar::class)->forgetCachedPermissions();

            return redirect()->back()->with('success', 'Berhasil beralih ke perusahaan.');
        }

        $hasAccess = $user ? $user->tenants()->where('tenants.id', $tenantId)->exists() : false;

        if (!$hasAccess) {
            return redirect()->back()->withErrors(['tenant' => 'Anda tidak memiliki akses ke perusahaan ini.']);
        }

        session(['active_tenant_id' => $tenantId]);
        setPermissionsTeamId($tenantId);
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        return redirect()->back()->with('success', 'Berhasil beralih ke perusahaan.');
    }

    public function create(Request $request)
    {
        $user = $request->user();
        
        // $canCreate = $user->canCreateMoreCompanies();
        
        // $currentPackageName = $user->subscription->package->name ?? 'Starter';
        // $maxCompanies = $user->subscription->package->max_companies ?? 1;

        return inertia('company/create', [
            // 'isLimitReached' => !$canCreate,
            // 'currentPackage' => $currentPackageName,
            // 'maxCompanies'   => $maxCompanies,
        ]);
    }

    public function store(Request $request, TenantSetupService $tenantSetupService)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'logo' => 'nullable|image|max:2048|mimes:jpeg,png,jpg,svg,webp',
            'address' => 'nullable|string|max:255',
            'director' => 'nullable|string|max:255',
        ]);

        // Generate ID unik untuk database baru
        $tenantId = Str::slug($request->name);

        DB::transaction(function () use ($request, $tenantId, $tenantSetupService) {
            // Buat Perusahaan
            $tenant = Tenant::create([
                'id' => $tenantId,
                'name' => $request->name,
                'logo' => $request->file('logo') ? $request->file('logo')->store('logos', 'public') : null,
                'address' => $request->address,
                'director' => $request->director,
            ]);

            // Hubungkan user yang sedang login ke perusahaan ini
            $user = $request->user();
            $user->tenants()->attach($tenant->id);

            // Beritahu Spatie bahwa kita sedang bekerja di dalam Tenant ini
            setPermissionsTeamId($tenant->id);

            // Buat Role 'Owner'
            $ownerRole = Role::firstOrCreate([
                'name' => 'Owner',
                'guard_name' => 'web',
                'tenant_id' => $tenant->id,
                'team_id' => $tenant->id
            ]);

            // Masukkan semua permission ke Role Owner
            $allPermissions = Permission::all();
            $ownerRole->syncPermissions($allPermissions);

            // FIX 1: Paksa isi tenant_id di tabel role_has_permissions
            if (Schema::hasColumn('role_has_permissions', 'tenant_id')) {
                DB::table('role_has_permissions')
                    ->where('role_id', $ownerRole->id)
                    ->update(['tenant_id' => $tenant->id]);
            }

            // Berikan Role ke User (Gunakan string agar dibaca sesuai team_id aktif)
            $user->assignRole('Owner');

            // KUNCI UTAMA - Tutup Kebocoran Akses
            // Update paksa tabel model_has_roles agar kolom team_id dan tenant_id tidak null
            $updateData = ['team_id' => $tenant->id];
            if (Schema::hasColumn('model_has_roles', 'tenant_id')) {
                $updateData['tenant_id'] = $tenant->id;
            }

            DB::table('model_has_roles')
                ->where('model_id', $user->id)
                ->where('model_type', get_class($user))
                ->where('role_id', $ownerRole->id)
                ->update($updateData);

            $tenantSetupService->runSetup($tenant);

            // Bersihkan cache Spatie agar perubahan manual DB langsung aktif
            app(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();
        });

        session(['active_tenant_id' => $tenantId]);

        return redirect()->back()->with('success', 'Perusahaan baru berhasil dibuat dan Anda telah dialihkan ke perusahaan tersebut.');
    }
}