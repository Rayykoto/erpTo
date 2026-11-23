<?php

use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\IdentifyTenant;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Inertia\Inertia;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            \App\Http\Middleware\TenantSessionMiddleware::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            IdentifyTenant::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // TANGKAP ERROR HTTP DAN UBAH KE INERTIA
        $exceptions->respond(function (Response $response, \Throwable $exception, Request $request) {
            
            // Jika masih di tahap development (lokal), kembalikan error bawaan Laravel agar mudah di-debug
            if (app()->environment('local')) {
                return $response;
            }

            // Logika ini HANYA akan berjalan di Production
            $status = $response->getStatusCode();
            $validStatuses = [401, 403, 404, 500, 503];

            if (in_array($status, $validStatuses)) {
                return Inertia::render('errors/index', [
                    'status' => $status
                ])->toResponse($request)->setStatusCode($status);
            }

            return $response;
        });
    })->create();