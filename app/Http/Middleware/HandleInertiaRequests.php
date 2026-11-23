<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */

    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        $user = $request->user();
        $tenants = [];

        // Logika penentuan daftar perusahaan
        if ($user) {
            if (isset($user->is_super_admin) && $user->is_super_admin) {
                $tenants = \App\Models\Tenant::select('id', 'name', 'logo')->get();
            } else {
                $tenants = $user->tenants()->select(['tenants.id', 'tenants.name', 'tenants.logo'])->get();
            }
        }

        return array_merge(parent::share($request), [
            'name'  => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth'  => [
                'user'             => $user,
                'roles'            => $user ? $user->getRoleNames() : [],
                'permissions'      => $user ? $user->getAllPermissions()->pluck('name') : [],
                'tenants'          => $tenants, 
                'active_tenant_id' => session('active_tenant_id'),
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error'   => fn () => $request->session()->get('error'),
            ]
        ]);
    }
}
