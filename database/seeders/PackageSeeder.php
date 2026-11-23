<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Package;

class PackageSeeder extends Seeder
{
    public function run()
    {
        $packages = [
            [
                'name' => 'Starter',
                'max_companies' => 1,
                'features' => json_encode(['All Basic Modules', 'Max 10 Users']),
            ],
            [
                'name' => 'Premium',
                'max_companies' => 2,
                'features' => json_encode(['All Premium Modules', 'Max 30 Users', 'Priority Support']),
            ],
            [
                'name' => 'Custom',
                'max_companies' => 999,
                'features' => json_encode(['On-Premise Server', 'Unlimited Companies', 'Unlimited Users', 'Dedicated Support']),
            ],
        ];

        foreach ($packages as $pkg) {
            Package::firstOrCreate(
                ['name' => $pkg['name']],
                $pkg
            );
        }
    }
}