<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class IdentifyTenant
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Ambil subdomain dari host
        $host = $request->getHost();
        $subdomain = explode('.', $host)[0];

        // Daftar Subdomain/Domain Pusat yang WAJIB DIBYPASS (Bukan Tenant)
        $centralSubdomains = ['www', 'localhost', '127', 'lvh.me', 'app']; 

        // Jika diakses dari domain pusat, izinkan request lewat tanpa mencari tenant
        if (in_array($subdomain, $centralSubdomains) || $host === 'lvh.me' || $host === 'localhost') {
            return $next($request);
        }

        // Cari Tenant berdasarkan Subdomain
        $tenant = Tenant::where('id', $subdomain)->first();

        // Jika diakses dari subdomain yang tidak terdaftar di database
        if (!$tenant) {
            abort(404, 'Workspace / Subdomain Perusahaan Tidak Ditemukan.');
        }

        // Bypass khusus Super Admin di subdomain Tenant
        if ($user && $user->is_super_admin) {
            setPermissionsTeamId($tenant->id);
            return $next($request);
        }

        // Verifikasi Akses User Biasa ke Tenant
        if (Auth::check()) {
            $hasAccess = DB::table('tenant_user')
                ->where('tenant_id', $tenant->id)
                ->where('user_id', Auth::id())
                ->where('is_active', true)
                ->exists();

            if (!$hasAccess) {
                // Logout user jika mencoba 'intip' subdomain perusahaan lain via URL
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                return redirect()->route('login')->withErrors([
                    'email' => 'Anda tidak memiliki akses ke workspace perusahaan ini.',
                ]);
            }

            // Set Spatie Permission Team ID untuk tenant ini
            setPermissionsTeamId($tenant->id);
            app(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();
        }

        return $next($request);
    }
}