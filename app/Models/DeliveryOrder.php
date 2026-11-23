<?php
namespace App\Models;

use App\Traits\Auditable;
use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class DeliveryOrder extends Model
{
    use BelongsToTenant, Auditable;
    
    protected $fillable = [
        'tenant_id', 'do_number', 'sales_order_id', 'client_name', 
        'delivery_date', 'driver_name', 'vehicle_number', 'status', 
        'proof_of_delivery_path', 'delivered_at', 'notes'
    ];

    public function items() {
        return $this->hasMany(DeliveryOrderItem::class);
    }

    public function salesOrder() {
        return $this->belongsTo(SalesOrder::class);
    }
    
}