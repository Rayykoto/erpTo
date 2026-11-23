<?php

namespace App\Services;

use App\Models\Tenant;
use App\Models\Division;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class TenantSetupService
{
    /**
     * Jalankan semua setup default untuk tenant baru
     */
    public function runSetup(Tenant $tenant)
    {
        // Set Team ID Spatie agar role & permission terikat ke tenant ini
        setPermissionsTeamId($tenant->id);
        
        // Jalankan pembuatan divisi
        $this->setupDefaultDivisions($tenant->id);

        // Jalankan pembuatan role (dan sinkronisasi permissions)
        $this->setupDefaultRoles($tenant->id);
    }

    private function setupDefaultDivisions(string $tenantId)
    {
        $defaultDivisions = [
            ['name' => 'Purchasing & Procurement', 'description' => 'Divisi pengadaan barang dan PO'],
            ['name' => 'Sales & Marketing', 'description' => 'Divisi penjualan dan SO'],
            ['name' => 'Warehouse & Logistics', 'description' => 'Divisi pergerakan fisik barang dan gudang'],
            ['name' => 'Finance & Accounting', 'description' => 'Divisi keuangan, penagihan, dan invoice'],
            ['name' => 'Human Resources (HR)', 'description' => 'Divisi personalia dan operasional umum'],
        ];

        foreach ($defaultDivisions as $div) {
            Division::firstOrCreate(
                ['tenant_id' => $tenantId, 'name' => $div['name']],
                ['description' => $div['description']]
            );
        }
    }

    private function setupDefaultRoles(string $tenantId)
    {
        setPermissionsTeamId($tenantId);

        $defaultRoles = [
            'Manager' => [
                'employees.view', 'employees.create', 'employees.update', 'employees.delete',
                'attendances.view', 'attendances.export',
                'tasks.view', 'tasks.create', 'tasks.update', 'tasks.delete', 'tasks.execute',
                'sales_visits.view', 'sales_visits.export',
                'sales_orders.view', 'sales_orders.create', 'sales_orders.update', 'sales_orders.approve',
                'invoices.view', 'invoices.create', 'invoices.update', 'invoices.print', 'invoices.execute',
                'delivery_orders.view', 'delivery_orders.create', 'delivery_orders.update', 'delivery_orders.print', 'delivery_orders.execute',
                'products.view', 'products.create', 'products.update', 'products.delete',
                'purchase_orders.view', 'purchase_orders.create', 'purchase_orders.update', 'purchase_orders.approve',
                'goods_receipts.view', 'goods_receipts.create', 'goods_receipts.update', 'goods_receipts.execute'
            ],
            'Supervisor' => [
                'employees.view',
                'attendances.view',
                'tasks.view', 'tasks.create', 'tasks.update', 'tasks.execute',
                'sales_visits.view', 'sales_visits.create',
                'sales_orders.view', 'sales_orders.create', 'sales_orders.update',
                'delivery_orders.view', 'delivery_orders.create', 'delivery_orders.update',
                'products.view',
                'purchase_orders.view', 'purchase_orders.create', 'purchase_orders.update',
                'goods_receipts.view', 'goods_receipts.create', 'goods_receipts.update'
            ],
            'Staff PO' => [
                'attendances.view', 'attendances.create',
                'tasks.view', 'tasks.create',
                'purchase_orders.view', 'purchase_orders.create', 'purchase_orders.update',
                'products.view'
            ],
            'Staff Warehouse' => [
                'attendances.view', 'attendances.create',
                'tasks.view', 'tasks.create',
                'goods_receipts.view', 'goods_receipts.create', 'goods_receipts.update', 'goods_receipts.execute',
                'delivery_orders.view', 'delivery_orders.create', 'delivery_orders.update', 'delivery_orders.print', 'delivery_orders.execute',
                'purchase_orders.view', 'sales_orders.view', 
                'products.view', 'products.create'
            ],
            'Staff SO' => [
                'attendances.view', 'attendances.create',
                'tasks.view', 'tasks.create',
                'sales_orders.view', 'sales_orders.create', 'sales_orders.update',
                'sales_visits.view', 'sales_visits.create',
                'products.view'
            ],
            'Staff Finance' => [
                'attendances.view', 'attendances.create',
                'tasks.view', 'tasks.create',
                'invoices.view', 'invoices.create', 'invoices.update', 'invoices.execute', 'invoices.print',
                'sales_orders.view', 
                'delivery_orders.view'
            ],
            'Staff' => [
                'attendances.view', 'attendances.create',
                'tasks.view', 'tasks.create',
            ],
        ];

        foreach ($defaultRoles as $roleName => $permissions) {
            $role = \Spatie\Permission\Models\Role::firstOrCreate([
                'name'       => $roleName,
                'guard_name' => 'web',
                'team_id'    => $tenantId,
                'tenant_id'  => $tenantId,
            ]);

            $validPermissions = \Spatie\Permission\Models\Permission::whereIn('name', $permissions)->get();
            $role->syncPermissions($validPermissions);

            if (\Illuminate\Support\Facades\Schema::hasColumn('role_has_permissions', 'tenant_id')) {
                \Illuminate\Support\Facades\DB::table('role_has_permissions')
                    ->where('role_id', $role->id)
                    ->update(['tenant_id' => $tenantId]);
            }
        }
    } 
}