<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TenantSessionMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (auth()->check()) {
                $tenantId = session('active_tenant_id');

                // kondisi jika user tidak ada session kembalikan ke perusahaan pertama yang dimiliki user
                if (!$tenantId && auth()->user()->tenants->count() > 0) {
                    $tenantId = auth()->user()->tenants->first()->id;
                    session(['active_tenant_id' => $tenantId]);
                }

                // Inisialisasi Database Perusahaan & Hak Akses Spatie
                if ($tenantId) {
                    $tenant = \App\Models\Tenant::find($tenantId);
                    if ($tenant) {
                        tenancy()->initialize($tenant);
                        setPermissionsTeamId($tenant->id);
                }
            }
        }

        return $next($request);
    }
}
