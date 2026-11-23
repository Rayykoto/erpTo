<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // TABEL PURCHASE ORDERS (PO) - Induk Pesanan Pembelian
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
            
            $table->string('po_number');
            $table->string('supplier_name'); 
            $table->date('order_date');
            
            $table->decimal('subtotal', 15, 2);
            $table->decimal('tax_amount', 15, 2)->default(0);
            $table->decimal('grand_total', 15, 2);
            
            $table->string('status')->default('draft');
            $table->string('approval_status')->default('waiting');
            
            $table->text('notes')->nullable();

            $table->foreignId('responsible_person')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['tenant_id', 'po_number']); 
        });

        // TABEL PURCHASE ORDER ITEMS (Baris Barang PO)
        Schema::create('purchase_order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_order_id')->constrained()->cascadeOnDelete();
            
            // Sistem Hybrid: Boleh ke Master Produk, boleh teks manual (nullable)
            $table->foreignId('product_id')->nullable()->constrained('products')->nullOnDelete();
            $table->string('item_name');
            $table->integer('quantity');
            $table->decimal('unit_price', 15, 2);
            $table->decimal('total_price', 15, 2);
            
            $table->timestamps();
        });

        // TABEL GOODS RECEIPTS (GR / BUKTI TERIMA BARANG) - Setara DO tapi untuk Inbound
        Schema::create('goods_receipts', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
            
            $table->string('gr_number');
            $table->foreignId('purchase_order_id')->nullable()->constrained('purchase_orders')->nullOnDelete();
            
            $table->string('supplier_name');
            $table->date('receipt_date');
            $table->string('receiver_name')->nullable(); // Nama staf gudang yang menerima
            
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('responsible_person')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status')->default('pending'); // pending, received
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['tenant_id', 'gr_number']);
        });

        // TABEL GOODS RECEIPT ITEMS
        Schema::create('goods_receipt_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('goods_receipt_id')->constrained()->cascadeOnDelete();
            
            // Sistem Hybrid
            $table->foreignId('product_id')->nullable()->constrained('products')->nullOnDelete();
            $table->string('item_name');
            $table->integer('quantity');
            
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('goods_receipt_items');
        Schema::dropIfExists('goods_receipts');
        Schema::dropIfExists('purchase_order_items');
        Schema::dropIfExists('purchase_orders');
    }
};