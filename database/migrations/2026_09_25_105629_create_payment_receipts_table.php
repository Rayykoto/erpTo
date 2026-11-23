<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('payment_receipts', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index(); 
            $table->foreignId('invoice_id')->constrained('invoices')->cascadeOnDelete();
            $table->string('receipt_number'); 
            $table->decimal('amount_paid', 15, 2); 
            $table->date('payment_date');
            $table->string('payment_method')->nullable(); 
            $table->string('reference_number')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete(); 
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->timestamps();
            
        });
    }

    public function down() {
        Schema::dropIfExists('payment_receipts');
    }
};