<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(Request $request)
    {
        $request->validate([
            'email'    => 'required|string|email',
            'password' => 'required|string',
        ]);

        // Ambil subdomain dari URL host yang sedang diakses
        $host = $request->getHost(); 
        $subdomain = explode('.', $host)[0]; 

        // Cari User berdasarkan Email terlebih dahulu
        $user = User::where('email', $request->email)->first();

        // =========================================================================
        // AKUN SUPER ADMIN PUSAT
        // =========================================================================
        if ($user && $user->is_super_admin) {
            // Coba autentikasi password
            if (!Auth::attempt($request->only('email', 'password'), $request->boolean('remember'))) {
                throw ValidationException::withMessages([
                    'email' => 'Email atau password salah, silahkan coba kembali!',
                ]);
            }

            // Jika Super Admin login dari subdomain tenant spesifik, set team_id jika ada
            $tenant = Tenant::where('id', $subdomain)->first();
            if ($tenant) {
                setPermissionsTeamId($tenant->id);
                session(['active_tenant_id' => $tenant->id]);
            }

            app(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();
            $request->session()->regenerate();

            return redirect()->intended(route('dashboard'));
        }

        // =========================================================================
        // USER BIASA / KARYAWAN TENANT
        // =========================================================================

        // Cari Tenant berdasarkan subdomain (id)
        $tenant = Tenant::where('id', $subdomain)->first();

        // Jika user biasa mencoba login dari domain utama tanpa subdomain valid
        if (!$tenant) {
            throw ValidationException::withMessages([
                'email' => 'Akses login hanya dapat dilakukan melalui URL subdomain resmi perusahaan Anda.',
            ]);
        }
        if (!$user) {
            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        // Cek apakah user terikat di tabel 'tenant_user' untuk tenant ini
        $hasAccessToTenant = DB::table('tenant_user')
            ->where('tenant_id', $tenant->id)
            ->where('user_id', $user->id)
            ->where('is_active', true)
            ->exists();

        if (!$hasAccessToTenant) {
            throw ValidationException::withMessages([
                'email' => 'Akun Anda tidak terdaftar atau tidak memiliki hak akses di perusahaan/subdomain ini.',
            ]);
        }

        // Autentikasi Password User Biasa
        if (!Auth::attempt($request->only('email', 'password'), $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                'email' => 'Email atau password salah, silahkan coba kembali!',
            ]);
        }

        // Set Team ID Spatie & Active Tenant
        setPermissionsTeamId($tenant->id);
        session(['active_tenant_id' => $tenant->id]);
        app(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();

        $request->session()->regenerate();

        return redirect()->intended(route('dashboard'));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/login');
    }
}
