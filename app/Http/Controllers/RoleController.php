<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Inertia\Inertia;

class RoleController extends Controller
{
    // Menampilkan Role & Permission
    public function index()
    {
        $activeTenantId = session('active_tenant_id');
        abort_if(!$activeTenantId, 403, 'Tidak ada perusahaan yang aktif.');

        $roles = Role::with('permissions:id,name')
            ->where('team_id', $activeTenantId)
            ->get();
        
        $permissions = Permission::select('id', 'name')->get();

        return Inertia::render('roles/index', [
            'roles' => $roles,
            'permissions' => $permissions,
        ]);
    }

    // Menyimpan Role baru
    public function store(Request $request)
    {
        $activeTenantId = session('active_tenant_id');
        abort_if(!$activeTenantId, 403, 'Tidak ada perusahaan yang aktif.');

        $request->validate([
            'name' => [
                'required',
                'string',
                Rule::unique('roles', 'name')->where(function ($query) use ($activeTenantId) {
                    return $query->where('team_id', $activeTenantId);
                })
            ],
        ]);

        Role::create([
            'name'      => $request->name,
            'team_id'   => $activeTenantId,
            'tenant_id' => $activeTenantId,
        ]);

        return redirect()->back()->with('success', 'Role baru berhasil ditambahkan.');
    }

    // Membuat Permission (Hak Akses) Baru
    public function storePermission(Request $request)
    {
        $request->validate([
            'module_name' => 'required|string|alpha_dash', 
            'actions'     => 'required|array',
            'actions.*'   => 'string|alpha_dash', 
        ]);

        $module = strtolower($request->module_name);

        DB::transaction(function () use ($request, $module) {
            foreach ($request->actions as $action) {
                $actionName = strtolower($action);
                Permission::firstOrCreate(['name' => "{$module}.{$actionName}"]);
            }
        });

        return redirect()->back()->with('success', 'Modul & Hak Akses baru berhasil dibuat.');
    }

    // Memperbarui Permission milik sebuah Role
    public function updatePermissions(Request $request, Role $role)
    {
        $activeTenantId = session('active_tenant_id');

        if ((int) $role->team_id !== (int) $activeTenantId) {
            abort(403, 'Anda tidak memiliki akses untuk mengubah role dari perusahaan lain.');
        }

        $request->validate([
            'permissions'   => 'array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        $role->syncPermissions($request->permissions);

        return redirect()->back()->with('success', 'Hak akses untuk role ini berhasil diperbarui.');
    }
}