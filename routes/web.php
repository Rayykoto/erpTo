<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TenantController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SalesController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TenantSettingController;
use Inertia\Inertia;
use App\Http\Middleware\IdentifyTenant;

$centralDomain = env('CENTRAL_DOMAIN', 'lvh.me');

Route::domain($centralDomain)->group(function () {
    
    // Landing Page
    Route::get('/', function () {
        return Inertia::render('home');
    })->name('home');
});

require __DIR__.'/auth.php';

Route::middleware(['auth', IdentifyTenant::class])->group(function () {
    // -------------------------------------------------------------
    // AKSES DASAR (Wajib Login)
    // -------------------------------------------------------------
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::post('/tenant/switch', [TenantController::class, 'switch'])->name('tenant.switch');
    
    // -------------------------------------------------------------
    // MODUL PERUSAHAAN & SETTING (tenants)
    // -------------------------------------------------------------
    Route::middleware('can:tenants.create')->group(function () {
        Route::get('/tenant/create', [TenantController::class, 'create'])->name('tenant.create');
        Route::post('/tenant/store', [TenantController::class, 'store'])->name('tenant.store');
    });

    Route::middleware('can:tenants.update')->group(function () {
        Route::get('/settings/invoice-template', [TenantSettingController::class, 'edit'])->name('settings.invoice');
        Route::post('/settings/invoice-template', [TenantSettingController::class, 'update'])->name('settings.invoice.update');
    });

    // -------------------------------------------------------------
    // MODUL ROLE & PERMISSION (roles)
    // -------------------------------------------------------------
    Route::middleware('can:roles.view')->group(function () {
        Route::get('/roles', [RoleController::class, 'index'])->name('roles.index');
    });
    
    Route::middleware('can:roles.create')->group(function () {
        Route::post('/roles', [RoleController::class, 'store'])->name('roles.store');
        Route::post('/permissions', [RoleController::class, 'storePermission'])->name('permissions.store');
    });
    
    Route::middleware('can:roles.update')->group(function () {
        Route::post('/roles/{role}/permissions', [RoleController::class, 'updatePermissions'])->name('roles.update-permissions');
    });

    // -------------------------------------------------------------
    // MODUL LOG SISTEM (system_logs)
    // -------------------------------------------------------------
    Route::middleware('can:system_logs.view')->group(function () {
        Route::get('/system-logs', [\App\Http\Controllers\SystemLogController::class, 'index'])->name('system-logs.index');
    });

    // -------------------------------------------------------------
    // MODUL KARYAWAN (employees)
    // -------------------------------------------------------------
    Route::middleware('can:employees.view')->group(function () {
        Route::get('/employees', [EmployeeController::class, 'index'])->name('employee.index');
    });
    Route::middleware('can:employees.create')->group(function () {
        Route::post('/employee/store', [EmployeeController::class, 'store'])->name('employee.store');
    });
    Route::middleware('can:employees.update')->group(function () {
        Route::put('/employee/{employee}', [EmployeeController::class, 'update'])->name('employee.update');
    });
    Route::middleware('can:employees.delete')->group(function () {
        Route::delete('/employee/{employee}', [EmployeeController::class, 'destroy'])->name('employee.destroy');
    });

    // -------------------------------------------------------------
    // MODUL KEHADIRAN (attendances)
    // -------------------------------------------------------------
    Route::middleware('can:attendances.view')->group(function () {
        Route::get('/attendances', [AttendanceController::class, 'index'])->name('attendances.index');
    });
    Route::middleware('can:attendances.create')->group(function () {
        Route::post('/attendances/clock-in', [AttendanceController::class, 'clockIn'])->name('attendances.clock-in');
        Route::post('/attendances/clock-out', [AttendanceController::class, 'clockOut'])->name('attendances.clock-out');
    });

    // -------------------------------------------------------------
    // MODUL TUGAS (tasks)
    // -------------------------------------------------------------
    Route::middleware('can:tasks.view')->group(function () {
        Route::get('/tasks', [TaskController::class, 'index'])->name('tasks.index');
    });
    Route::middleware('can:tasks.create')->group(function () {
        Route::post('/tasks', [TaskController::class, 'store'])->name('tasks.store');
        Route::post('/tasks/{id}/comments', [TaskController::class, 'addComment'])->name('tasks.comments.store');
    });
    Route::middleware('can:tasks.update')->group(function () {
        Route::put('/tasks/{id}', [TaskController::class, 'update'])->name('tasks.update');
        Route::post('/tasks/update-position', [TaskController::class, 'updatePosition'])->name('tasks.update-position');
        Route::post('/tasks/{id}/assign', [TaskController::class, 'assign'])->name('tasks.assign');
        Route::post('/tasks/{id}/toggle-log', [TaskController::class, 'toggleDailyLog'])->name('tasks.toggle-log');
    });

    // -------------------------------------------------------------
    // MODUL SALES VISITS & TARGET (sales_visits)
    // -------------------------------------------------------------
    Route::middleware('can:sales_visits.view')->group(function () {
        Route::get('/sales', [SalesController::class, 'index'])->name('sales.index');
        Route::get('/sales/targets', [SalesController::class, 'salesTarget'])->name('sales.targets.index');
    });
    Route::middleware('can:sales_visits.create')->group(function () {
        Route::get('/sales/visits/create', [SalesController::class, 'create'])->name('sales.visits.create');
        Route::post('/sales/visits', [SalesController::class, 'store'])->name('sales.visits.store');
        Route::post('/sales/targets', [SalesController::class, 'salesTargetStore'])->name('sales.targets.store');
    });

    // -------------------------------------------------------------
    // MODUL SALES ORDER (sales_orders)
    // -------------------------------------------------------------
    Route::middleware('can:sales_orders.create')->group(function () {
        Route::get('/sales-orders/create', [\App\Http\Controllers\SalesOrderController::class, 'create'])->name('sales-orders.create');
        Route::post('/sales-orders', [\App\Http\Controllers\SalesOrderController::class, 'store'])->name('sales-orders.store');
    });
    
    Route::patch('/sales-orders/{id}/approve', [\App\Http\Controllers\SalesOrderController::class, 'approve'])
        ->middleware('can:sales_orders.approve')->name('sales-orders.approve');
    Route::get('/sales-orders/{id}/convert-invoice', [\App\Http\Controllers\SalesOrderController::class, 'createInvoiceFromSO'])
        ->middleware('can:invoices.create')->name('sales-orders.convert-invoice');
    Route::get('/sales-orders/{id}/convert-do', [\App\Http\Controllers\SalesOrderController::class, 'createDOFromSO'])
        ->middleware('can:delivery_orders.create')->name('sales-orders.convert-do');
        
    // Show harus selalu di paling bawah
    Route::middleware('can:sales_orders.view')->group(function () {
        Route::get('/sales-orders', [\App\Http\Controllers\SalesOrderController::class, 'index'])->name('sales-orders.index');
        Route::get('/sales-orders/{id}', [\App\Http\Controllers\SalesOrderController::class, 'show'])->name('sales-orders.show');
    });

    // -------------------------------------------------------------
    // MODUL INVOICE (invoices)
    // -------------------------------------------------------------
    Route::middleware('can:invoices.create')->group(function () {
        Route::get('/invoices/create', [\App\Http\Controllers\InvoiceController::class, 'create'])->name('invoices.create');
        Route::post('/invoices', [\App\Http\Controllers\InvoiceController::class, 'store'])->name('invoices.store');
    });
    
    Route::get('/invoices/{id}/print', [\App\Http\Controllers\InvoiceController::class, 'print'])
        ->middleware('can:invoices.print')->name('invoices.print');
    Route::get('/invoices/print-bulk', [\App\Http\Controllers\InvoiceController::class, 'printBulk'])
        ->middleware('can:invoices.print')->name('invoices.print-bulk');
    Route::post('/invoices/{id}/record-payment', [\App\Http\Controllers\InvoiceController::class, 'recordPayment'])
        ->middleware('can:invoices.execute')->name('invoices.record-payment');
        
    Route::middleware('can:invoices.view')->group(function () {
        Route::get('/invoices', [\App\Http\Controllers\InvoiceController::class, 'index'])->name('invoices.index');
        Route::get('/invoices/{id}', [\App\Http\Controllers\InvoiceController::class, 'show'])->name('invoices.show');
    });

    // -------------------------------------------------------------
    // MODUL SURAT JALAN / DELIVERY ORDERS (delivery_orders)
    // -------------------------------------------------------------
    Route::middleware('can:delivery_orders.create')->group(function () {
        Route::get('/delivery-orders/create', [\App\Http\Controllers\DeliveryOrderController::class, 'create'])->name('delivery-orders.create');
        Route::post('/delivery-orders', [\App\Http\Controllers\DeliveryOrderController::class, 'store'])->name('delivery-orders.store');
        Route::get('/delivery-orders/{id}/convert-invoice', [\App\Http\Controllers\DeliveryOrderController::class, 'createInvoiceFromDO'])
            ->middleware('can:invoices.create')->name('delivery-orders.convert-invoice');
    });
    
    Route::get('/delivery-orders/{id}/print', [\App\Http\Controllers\DeliveryOrderController::class, 'print'])
        ->middleware('can:delivery_orders.print')->name('delivery-orders.print');
    Route::get('/delivery-orders/print-bulk', [\App\Http\Controllers\DeliveryOrderController::class, 'printBulk'])
        ->middleware('can:delivery_orders.print')->name('delivery-orders.print-bulk');
    Route::post('/delivery-orders/{id}/deliver', [\App\Http\Controllers\DeliveryOrderController::class, 'markAsDelivered'])
        ->middleware('can:delivery_orders.execute')->name('delivery-orders.deliver');

    Route::middleware('can:delivery_orders.view')->group(function () {
        Route::get('/delivery-orders', [\App\Http\Controllers\DeliveryOrderController::class, 'index'])->name('delivery-orders.index');
        Route::get('/delivery-orders/{id}', [\App\Http\Controllers\DeliveryOrderController::class, 'show'])->name('delivery-orders.show');
    });
    
    // -------------------------------------------------------------
    // MASTER DATA PRODUK (products)
    // -------------------------------------------------------------
    Route::middleware('can:products.create')->group(function () {
        Route::post('/products', [\App\Http\Controllers\ProductController::class, 'store'])->name('products.store');
    });
    Route::middleware('can:products.update')->group(function () {
        Route::put('/products/{id}', [\App\Http\Controllers\ProductController::class, 'update'])->name('products.update');
    });
    Route::middleware('can:products.delete')->group(function () {
        Route::delete('/products/{id}', [\App\Http\Controllers\ProductController::class, 'destroy'])->name('products.destroy');
    });
    Route::middleware('can:products.view')->group(function () {
        Route::get('/products', [\App\Http\Controllers\ProductController::class, 'index'])->name('products.index');
    });
    
    // -------------------------------------------------------------
    // PENGADAAN BARANG (purchase_orders)
    // -------------------------------------------------------------
    Route::middleware('can:purchase_orders.create')->group(function () {
        Route::get('/purchase-orders/create', [\App\Http\Controllers\PurchaseOrderController::class, 'create'])->name('purchase-orders.create');
        Route::post('/purchase-orders', [\App\Http\Controllers\PurchaseOrderController::class, 'store'])->name('purchase-orders.store');
        Route::get('/purchase-orders/{id}/create-gr', [\App\Http\Controllers\PurchaseOrderController::class, 'createGRFromPO'])->name('purchase-orders.create-gr');
    });

    Route::middleware('can:purchase_orders.update')->group(function () {
        Route::put('/purchase-orders/{id}', [\App\Http\Controllers\PurchaseOrderController::class, 'update'])->name('purchase-orders.update');
    });
    Route::middleware('can:purchase_orders.delete')->group(function () {
        Route::delete('/purchase-orders/{id}', [\App\Http\Controllers\PurchaseOrderController::class, 'destroy'])->name('purchase-orders.destroy');
    });
    
    Route::middleware('can:purchase_orders.view')->group(function () {
        Route::get('/purchase-orders', [\App\Http\Controllers\PurchaseOrderController::class, 'index'])->name('purchase-orders.index');
        Route::get('/purchase-orders/{id}', [\App\Http\Controllers\PurchaseOrderController::class, 'show'])->name('purchase-orders.show');
    });

    Route::middleware('can:purchase_orders.approve')->group(function () {
        Route::post('/purchase-orders/{id}/approve', [App\Http\Controllers\PurchaseOrderController::class, 'approve'])->name('purchase-orders.approve');
        Route::post('/purchase-orders/{id}/reject', [App\Http\Controllers\PurchaseOrderController::class, 'reject'])->name('purchase-orders.reject');
    });

    // -------------------------------------------------------------
    // BUKTI TERIMA BARANG (goods_receipts)
    // -------------------------------------------------------------
    Route::middleware('can:goods_receipts.create')->group(function () {
        Route::get('/goods-receipts/create', [\App\Http\Controllers\GoodsReceiptController::class, 'create'])->name('goods-receipts.create');
        Route::post('/goods-receipts', [\App\Http\Controllers\GoodsReceiptController::class, 'store'])->name('goods-receipts.store');
    });
    Route::middleware('can:goods_receipts.execute')->group(function () {
        Route::post('/goods-receipts/{id}/receive', [\App\Http\Controllers\GoodsReceiptController::class, 'markAsReceived'])->name('goods-receipts.receive');
    });
    Route::middleware('can:goods_receipts.view')->group(function () {
        Route::get('/goods-receipts', [\App\Http\Controllers\GoodsReceiptController::class, 'index'])->name('goods-receipts.index');
        // Letakkan show di akhir
        Route::get('/goods-receipts/{id}', [\App\Http\Controllers\GoodsReceiptController::class, 'show'])->name('goods-receipts.show');
    });
});

require __DIR__.'/settings.php';