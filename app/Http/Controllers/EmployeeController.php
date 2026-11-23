<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Division;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    public function index()
    {
        $activeTenantId = session('active_tenant_id');
        if (!$activeTenantId) return redirect()->route('dashboard');

        setPermissionsTeamId($activeTenantId);

        // FIXED N+1: Tambahkan 'tenants' ke dalam with()
        $activeEmployees = User::whereHas('tenants', function($q) use ($activeTenantId) {
            $q->where('tenants.id', $activeTenantId)
              ->where('tenant_user.is_active', true);
        })->with(['roles', 'tenants'])->paginate(10);

        // FIXED N+1: Tambahkan juga untuk inactive (meski tidak di-map, ini best practice)
        $inactiveEmployees = User::whereHas('tenants', function($q) use ($activeTenantId) {
            $q->where('tenants.id', $activeTenantId)
              ->where('tenant_user.is_active', false);
        })->with(['roles', 'tenants'])->get(); 

        $roles = Role::where('team_id', $activeTenantId)->get();
        $divisions = Division::where('tenant_id', $activeTenantId)->get();

        $activeEmployees->getCollection()->transform(function ($user) use ($activeTenantId, $divisions) {
            // Karena sudah di-eager-load (with tenants), ini berjalan di memori tanpa query N+1
            $pivotData = $user->tenants->firstWhere('id', $activeTenantId)?->pivot;
            
            if ($pivotData) {
                $user->division = $divisions->firstWhere('id', $pivotData->division_id);
                $user->division_id = $pivotData->division_id; 
            }
            
            return $user;
        });

        return Inertia::render('employees/index', [
            'employees'         => $activeEmployees,
            'inactiveEmployees' => $inactiveEmployees,
            'roles'             => $roles,
            'divisions'         => $divisions,
        ]);
    }

    public function store(Request $request)
    {
        $activeTenantId = session('active_tenant_id');

        $request->validate([
            'email'           => 'required|email',
            'name'            => 'required|string|max:255',
            'whatsapp_number' => 'nullable|string',
            'role'            => 'required|string|exists:roles,name',
            'division_id'     => 'nullable|exists:divisions,id',
        ]);

        $user = User::where('email', $request->email)->first();

        // Cek apakah user ada di database
        if ($user) {
            // Ambil data relasinya dengan perusahaan ini (jika ada)
            $tenantRelation = $user->tenants()->where('tenant_id', $activeTenantId)->first();

            if ($tenantRelation) {
                // Jika dia karyawan aktif -> Tolak
                if ($tenantRelation->pivot->is_active) {
                    return back()->withErrors([
                        'email' => 'Email ini sudah terdaftar sebagai karyawan aktif di perusahaan ini.'
                    ])->withInput();
                } 
                // PROSES REHIRE (Karyawan Nonaktif / Alumni)
                else {
                    // Update data globalnya barangkali ada perubahan nama / no HP baru
                    $user->update([
                        'name'            => $request->name,
                        'whatsapp_number' => $request->whatsapp_number ?? $user->whatsapp_number,
                    ]);

                    // Aktifkan kembali di perusahaan ini (Rehire)
                    $user->tenants()->updateExistingPivot($activeTenantId, [
                        'is_active'   => true,
                        'division_id' => $request->division_id
                    ]);

                    setPermissionsTeamId($activeTenantId);
                    $user->syncRoles([$request->role]); // Timpa dengan role/jabatan yang baru

                    return redirect()->back()->with('success', 'Karyawan lama (alumni) berhasil dipekerjakan kembali.');
                }
            }
        }

        // Jika user BENAR-BENAR BARU, atau dari perusahaan TETANGGA
        $user = User::firstOrCreate(
            ['email' => $request->email], 
            [                             
                'whatsapp_number' => $request->whatsapp_number ?? '-',
                'name'            => $request->name, 
                'password'        => \Illuminate\Support\Facades\Hash::make('SSGand123!'),
            ]
        );

        // Pasang ke perusahaan sekaligus set is_active menjadi TRUE
        $user->tenants()->attach($activeTenantId, [
            'is_active'   => true,
            'division_id' => $request->division_id
        ]);

        setPermissionsTeamId($activeTenantId);
        $user->assignRole($request->role);

        return redirect()->back()->with('success', 'Karyawan baru berhasil didaftarkan.');
    }

    public function update(Request $request, $id) 
    {
        $activeTenantId = session('active_tenant_id');
        $employee = User::findOrFail($id);

        // Jangan load seluruh relasi ke RAM, cukup query SQL EXISTS
        if (!$employee->tenants()->where('tenants.id', $activeTenantId)->exists()) {
            abort(403, 'Akses ditolak. Karyawan ini bukan bagian dari perusahaan Anda.');
        }

        $request->validate([
            'name'        => 'required|string|max:255',
            'email'       => 'required|email|unique:users,email,' . $employee->id,
            'role'        => 'required|string|exists:roles,name',
            'password'    => 'nullable|string|min:8',
            'division_id' => 'nullable|exists:divisions,id',
        ]);

        $employee->name = $request->name;
        $employee->email = $request->email;

        if ($request->filled('password')) {
            $employee->password = Hash::make($request->password);
        }
        $employee->save();

        // Perbarui data divisi di tabel Pivot
        $employee->tenants()->updateExistingPivot($activeTenantId, [
            'division_id' => $request->division_id
        ]);

        setPermissionsTeamId($activeTenantId);
        $employee->syncRoles([$request->role]);

        return redirect()->back()->with('success', 'Data karyawan berhasil diperbarui.');
    }

    public function destroy(User $employee)
    {
        $activeTenantId = session('active_tenant_id');

        if (!$employee->tenants()->where('tenants.id', $activeTenantId)->exists()) {
            abort(403);
        }

        setPermissionsTeamId($activeTenantId);
        $employee->syncRoles([]); 

        // FIXED INKONSISTENSI
        $employee->tenants()->updateExistingPivot($activeTenantId, [
            'is_active'   => false,
            'division_id' => null
        ]);

        return redirect()->back()->with('success', 'Karyawan telah dinonaktifkan.');
    }
}