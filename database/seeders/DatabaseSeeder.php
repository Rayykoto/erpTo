<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Tenant;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Cetak Kepingan Hak Akses (Global)
        $this->call([
            PermissionSeeder::class,
            PackageSeeder::class,
        ]);
    }
}