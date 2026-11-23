<?php
namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Model;

class PaymentReceipt extends Model
{
    use Auditable;
    
    protected $fillable = [
        'tenant_id', 'invoice_id', 'receipt_number', 'amount_paid', 
        'payment_date', 'payment_method', 'reference_number', 'notes'
    ];

    public function invoice() {
        return $this->belongsTo(Invoice::class);
    }
}