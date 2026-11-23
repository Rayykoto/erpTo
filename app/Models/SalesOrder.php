<?php
namespace App\Models;

use App\Traits\Auditable;
use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class SalesOrder extends Model
{
    use BelongsToTenant, Auditable;
    
    protected $fillable = [
        'tenant_id', 'so_number', 'client_name', 'sales_user_id', 
        'order_date', 'subtotal', 'tax_amount', 'grand_total', 'status', 'approval_status' , 'approved_by_id', 'notes'
    ];

    public function items() {
        return $this->hasMany(SalesOrderItem::class);
    }
    
    public function invoices() {
        return $this->hasMany(Invoice::class);
    }

    public function salesPerson() {
        return $this->belongsTo(User::class, 'sales_user_id');
    }
    
    public function deliveryOrders()
    {
        return $this->hasMany(DeliveryOrder::class);
    }
}