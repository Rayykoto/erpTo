<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ==========================================================
        // 1. TAHAP PERTAMA: SALES ORDERS (Pesanan Penjualan / PO Klien)
        // ==========================================================
        Schema::create('sales_orders', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
            $table->string('so_number');
            $table->string('client_name');
            $table->foreignId('sales_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->date('order_date');
            $table->decimal('subtotal', 15, 2);
            $table->decimal('tax_amount', 15, 2)->default(0);
            $table->decimal('grand_total', 15, 2);
            $table->string('status')->default('draft');
            $table->string('approval_status')->default('approved');
            $table->unsignedBigInteger('approved_by_id')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete(); 
            $table->timestamps();

            $table->unique(['tenant_id', 'so_number']);
        });

        Schema::create('sales_order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sales_order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained('products')->nullOnDelete();
            $table->string('item_name');
            $table->integer('quantity');
            $table->decimal('unit_price', 15, 2);
            $table->decimal('total_price', 15, 2);
            $table->timestamps();
        });

        // ==========================================================
        // 2. TAHAP KEDUA: DELIVERY ORDERS (Surat Jalan / Pengiriman)
        // ==========================================================
        Schema::create('delivery_orders', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->string('do_number')->unique();
            // Menautkan Surat Jalan ke Sales Order (opsional, jika DO dibuat mandiri)
            $table->foreignId('sales_order_id')->nullable()->constrained('sales_orders')->nullOnDelete();
            $table->string('client_name');
            $table->date('delivery_date');
            $table->string('driver_name')->nullable();
            $table->string('vehicle_number')->nullable();
            $table->string('status')->default('pending');
            $table->string('proof_of_delivery_path')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete(); 
            $table->timestamps();

            $table->unique(['tenant_id', 'do_number']);
        });

        
        Schema::create('delivery_order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('delivery_order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained('products')->nullOnDelete();
            $table->string('item_name');
            $table->integer('quantity');
            $table->timestamps();
        });

        // ==========================================================
        // 3. TAHAP KETIGA: INVOICES (Faktur Penjualan / Tagihan)
        // ==========================================================
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->string('invoice_number');
            $table->foreignId('sales_order_id')->nullable()->constrained('sales_orders')->nullOnDelete();
            $table->foreignId('delivery_order_id')->nullable()->constrained('delivery_orders')->nullOnDelete();
            $table->string('client_name');
            $table->foreignId('sales_user_id')->nullable()->constrained('users')->nullOnDelete(); 
            $table->date('issue_date');
            $table->date('due_date');
            $table->decimal('subtotal', 15, 2);
            $table->decimal('tax_amount', 15, 2)->default(0);
            // Pajak Pemotongan PPh 23 (Standar B2B Indonesia)
            $table->decimal('withholding_tax_amount', 15, 2)->default(0);
            $table->decimal('grand_total', 15, 2);
            $table->decimal('balance_due', 15, 2)->default(0);
            $table->string('status')->default('unpaid');
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete(); 
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->unique(['tenant_id', 'invoice_number']);
        });

        Schema::create('invoice_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained()->cascadeOnDelete();
            $table->string('item_name');
            $table->integer('quantity');
            $table->decimal('unit_price', 15, 2);
            $table->decimal('total_price', 15, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        // Urutan drop harus dari anak ke induk untuk menghindari error foreign key
        Schema::dropIfExists('invoice_items');
        Schema::dropIfExists('invoices');
        
        Schema::dropIfExists('delivery_order_items');
        Schema::dropIfExists('delivery_orders');
        
        Schema::dropIfExists('sales_order_items');
        Schema::dropIfExists('sales_orders');
    }
};