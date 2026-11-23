<?php
namespace App\Models;

use App\Traits\Auditable;
use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    use BelongsToTenant, Auditable;
    
    protected $fillable = [
        'tenant_id', 'invoice_number', 'client_name', 'sales_user_id', 'sales_order_id', 'delivery_order_id',
        'issue_date', 'due_date', 'subtotal', 'tax_amount', 'grand_total', 'status', 'balance_due', 'withholding_tax_amount', 'notes', 'created_by'
    ];

    public function items() {
        return $this->hasMany(InvoiceItem::class);
    }

    public function salesOrder() {
        return $this->belongsTo(SalesOrder::class);
    }

    public function salesPerson() {
        return $this->belongsTo(User::class, 'sales_user_id');
    }

    public function paymentReceipts() {
        return $this->hasMany(PaymentReceipt::class);
    }   

    public function deliveryOrder() {
        return $this->belongsTo(DeliveryOrder::class);
    }

    public function createdBy() {
        return $this->belongsTo(User::class, 'created_by');
    }
}