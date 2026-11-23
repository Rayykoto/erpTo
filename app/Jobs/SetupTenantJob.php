<?php

namespace App\Jobs;

use App\Mail\TenantWelcomeMail;
use App\Models\Tenant;
use App\Services\TenantSetupService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SetupTenantJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tenant;
    public $tenantData;

    public function __construct(Tenant $tenant, array $tenantData)
    {
        $this->tenant = $tenant;
        $this->tenantData = $tenantData;
    }

    public function handle(TenantSetupService $tenantSetupService): void
    {
        // Eksekusi setup berat (migration tenant, seeder, dll) di background
        $tenantSetupService->runSetup($this->tenant);

        // Kirim email setelah setup tenant selesai diproses
        Mail::to($this->tenantData['email'])->send(new TenantWelcomeMail($this->tenantData));
    }
}