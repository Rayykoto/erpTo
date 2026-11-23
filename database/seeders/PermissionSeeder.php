<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $modules = [
            'tasks', 'attendances', 'purchase_orders', 'goods_receipts', 'products', 'sales_orders',
            'delivery_orders', 'invoices', 'sales_visits', 'roles', 'employees', 'system_logs', 'tenants'          
        ];
        
        $actions = ['view', 'create', 'update', 'delete', 'approve', 'export', 'print', 'execute'];

        foreach ($modules as $module) {
            foreach ($actions as $action) {
                Permission::firstOrCreate([
                    'name' => "{$module}.{$action}",
                    'guard_name' => 'web'
                ]);
            }
        }

        $superAdminEmail = 'admin@erpto.com';

        User::firstOrCreate(
            ['email' => $superAdminEmail],
            [
                'name'            => 'System Super Admin',
                'password'        => Hash::make('Pass2026!'),
                'whatsapp_number' => '08123456789',            
                'is_super_admin'  => true, 
            ]
        );

        $this->command->info('Permissions dan Akun Super Admin Pusat berhasil dibuat!');
    }
}